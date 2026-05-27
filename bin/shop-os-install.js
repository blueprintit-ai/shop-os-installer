#!/usr/bin/env node
/**
 * Shop OS Foundation installer.
 *
 * Single command flow for a paying customer:
 *   1. Welcome + pre-flight (Node version, Claude Code present)
 *   2. License key prompt
 *   3. Validate against the live license server
 *   4. Choose vault location
 *   5. Add marketplaces (blueprint-skills + claude-plugins-official)
 *   6. Install plugins (obsidian + superpowers)
 *   7. Create vault directory
 *   8. Enable plugins in <vault>/.claude/settings.json
 *   9. Save license metadata to ~/.shopos/license.json
 *  10. Print next steps
 *
 * Zero npm dependencies. Uses Node 18+ built-ins only.
 */

import { createInterface } from "node:readline/promises";
import { stdin, stdout, stderr, exit } from "node:process";
import { homedir } from "node:os";
import { join, dirname, resolve } from "node:path";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  chmodSync,
} from "node:fs";

const LICENSE_SERVER = "https://shop-os-license-server.glenn-15d.workers.dev";
const SUPPORT_URL = "https://blueprintit.ai/shop-os/support";
const DOCS_URL = "https://blueprintit.ai/shop-os/docs";

const MARKETPLACES = [
  {
    name: "blueprint-skills",
    source: { type: "github", repo: "blueprintit-ai/blueprint-skills" },
  },
  {
    name: "claude-plugins-official",
    source: { type: "github", repo: "anthropics/claude-plugins-official" },
  },
];

const PLUGINS_TO_ENABLE = [
  "obsidian@blueprint-skills",
  "superpowers@claude-plugins-official",
];

// ---------- output helpers ----------

const SUPPORTS_COLOR = stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (SUPPORTS_COLOR ? `\x1b[${code}m${s}\x1b[0m` : s);
const dim = (s) => c("2", s);
const bold = (s) => c("1", s);
const green = (s) => c("32", s);
const yellow = (s) => c("33", s);
const red = (s) => c("31", s);
const cyan = (s) => c("36", s);

const print = (msg = "") => stdout.write(msg + "\n");
const warn = (msg) => stderr.write(yellow("! ") + msg + "\n");
const fail = (msg) => {
  stderr.write(red("✗ ") + msg + "\n");
  exit(1);
};
const ok = (msg) => print("  " + green("✓") + " " + msg);
const info = (msg) => print("  " + dim("·") + " " + msg);

function banner() {
  const lines = [
    "",
    bold("  ╔════════════════════════════════════════════════════════════╗"),
    bold("  ║                                                            ║"),
    bold("  ║          ") + cyan("Shop OS Foundation Installer") + bold("                      ║"),
    bold("  ║          ") + dim("AI Operating System for Small Businesses") + bold("          ║"),
    bold("  ║                                                            ║"),
    bold("  ╚════════════════════════════════════════════════════════════╝"),
    "",
  ];
  lines.forEach((l) => print(l));
}

// ---------- prompts ----------

async function ask(rl, question, { default: dflt } = {}) {
  const prompt = dflt
    ? `${cyan("?")} ${question} ${dim(`[${dflt}]`)}: `
    : `${cyan("?")} ${question}: `;
  const ans = (await rl.question(prompt)).trim();
  return ans || dflt || "";
}

async function confirm(rl, question, { default: dflt = true } = {}) {
  const hint = dflt ? "Y/n" : "y/N";
  const ans = (await rl.question(`${cyan("?")} ${question} ${dim(`[${hint}]`)}: `))
    .trim()
    .toLowerCase();
  if (!ans) return dflt;
  return ans === "y" || ans === "yes";
}

// ---------- preflight ----------

function checkNode() {
  const major = Number(process.versions.node.split(".")[0]);
  if (major < 18) {
    fail(`Node.js 18+ required. You have ${process.version}.`);
  }
  return process.version;
}

function getClaudeRoot() {
  return join(homedir(), ".claude");
}

function checkClaudeCode() {
  const root = getClaudeRoot();
  if (!existsSync(root)) {
    print("");
    print(red("Claude Code is not installed."));
    print("");
    print("Shop OS runs on top of Claude Code. Install it first at:");
    print("  " + cyan("https://claude.ai/code"));
    print("");
    print("Once Claude Code is installed and you have signed in once,");
    print("re-run this installer.");
    exit(1);
  }
  return root;
}

// ---------- license validation ----------

async function validateLicense(key) {
  const url = `${LICENSE_SERVER}/validate?key=${encodeURIComponent(key)}`;
  let resp;
  try {
    resp = await fetch(url, { headers: { "user-agent": "shop-os-installer/0.5.0" } });
  } catch (e) {
    return { ok: false, error: `network: ${e.message}` };
  }
  const text = await resp.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return { ok: false, error: `unexpected response (HTTP ${resp.status})` };
  }
  if (!resp.ok) {
    return { ok: false, error: body.error || `HTTP ${resp.status}` };
  }
  return { ok: true, license: body };
}

// ---------- claude code config ----------

function readJSON(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJSON(path, obj) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function ensureMarketplaces(claudeRoot) {
  // Always (re-)register the marketplaces and clear any stale clone on disk.
  // A clone pinned to an old commit is the #1 reason re-installs keep serving
  // old plugin versions (e.g. obsidian 3.8.0 skills appearing months after
  // the marketplace shipped 3.12.0). Clearing the directory forces Claude Code
  // to re-clone from origin on its next launch.
  const path = join(claudeRoot, "plugins", "known_marketplaces.json");
  const known = readJSON(path, {});
  const cleared = [];
  for (const mp of MARKETPLACES) {
    const installLocation = join(claudeRoot, "plugins", "marketplaces", mp.name);
    known[mp.name] = {
      source: { source: mp.source.type, repo: mp.source.repo },
      installLocation,
      lastUpdated: new Date().toISOString(),
    };
    if (existsSync(installLocation)) {
      try {
        rmSync(installLocation, { recursive: true, force: true });
        cleared.push(mp.name);
      } catch {
        // Best-effort. Locked files on Windows can prevent removal; Claude Code
        // may keep using the stale clone in that case. Customer can manually
        // delete the folder and re-launch to recover.
      }
    }
  }
  writeJSON(path, known);
  return { cleared, total: MARKETPLACES.length };
}

function ensurePluginsInstalled(claudeRoot) {
  // Always reset the Shop OS-required plugin entries to a pending user-scope
  // record. We can't use a presence check here: a previously-installed pinned
  // entry (e.g. obsidian 3.8.0 from a prior beta) would prevent Claude Code
  // from picking up the marketplace's current version. Forcing pending status
  // makes Claude Code re-resolve the plugin against the (just-refreshed)
  // marketplace clone on its next launch.
  //
  // This wipes any project-scope variants of these specific plugin ids — that's
  // intentional. Shop OS is meant to be enabled at user scope so the same
  // plugin set works across every vault the operator runs.
  const path = join(claudeRoot, "plugins", "installed_plugins.json");
  const existing = readJSON(path, { version: 2, plugins: {} });
  if (!existing.plugins) existing.plugins = {};
  const installedAt = new Date().toISOString();
  for (const id of PLUGINS_TO_ENABLE) {
    existing.plugins[id] = [
      {
        scope: "user",
        installPath: null, // filled in by Claude Code on next marketplace sync
        version: "pending",
        installedAt,
        lastUpdated: installedAt,
        gitCommitSha: "pending-sync",
      },
    ];
  }
  writeJSON(path, existing);
  return PLUGINS_TO_ENABLE;
}

function enableForVault(vaultPath) {
  const settingsPath = join(vaultPath, ".claude", "settings.json");
  const settings = readJSON(settingsPath, {});
  if (!settings.enabledPlugins) settings.enabledPlugins = {};
  for (const id of PLUGINS_TO_ENABLE) {
    settings.enabledPlugins[id] = true;
  }
  writeJSON(settingsPath, settings);
  return settingsPath;
}

function createVaultClaudeMd(vaultPath, license) {
  const claudeMd = join(vaultPath, "CLAUDE.md");
  if (existsSync(claudeMd)) return false; // do not overwrite an existing vault
  const content = `---
os-mode: business
bp-setup-state: pending
license-customer: ${license.customer}
license-product: ${license.product}
installed-at: ${new Date().toISOString()}
---

# Shop OS Vault

Welcome to your Shop OS vault. This is the operating system Blueprint IT installed for ${license.customer}.

To finish onboarding, run the following slash command inside Claude Code:

\`/bp-setup\`

This walks you through personalizing the vault for your shop: name, owner, key staff,
services, daily routines, and more.

For help, see ${DOCS_URL}
or reply to your welcome email.
`;
  mkdirSync(vaultPath, { recursive: true });
  writeFileSync(claudeMd, content, "utf8");
  return true;
}

function createRawInbox(vaultPath) {
  // Create a flat Raw/ inbox with a processed/ subfolder for after-digest moves.
  // Customers drop any raw materials in Raw/ — no subfolders to think about.
  // Claude Code reads, classifies, routes into the vault, and moves the
  // source file to Raw/processed/.
  const rawDir = join(vaultPath, "Raw");
  const processedDir = join(rawDir, "processed");
  const readmePath = join(rawDir, "README.md");

  const existed = existsSync(rawDir);
  mkdirSync(processedDir, { recursive: true });

  if (existsSync(readmePath)) return { created: false };

  const readme = `---
type: inbox-readme
tags: [shop-os, inbox, raw]
---

# Raw / Inbox

Drop any raw materials here that you want Shop OS to read and route into your vault.
PDFs, photos, transcripts, contracts, price lists, spreadsheets, scans, anything.

You do NOT need to organize them into subfolders. Just drop them flat. Claude Code
reads each file, decides where it belongs in the vault, writes a summary into the
appropriate folder, and moves the original to \`Raw/processed/\` so the inbox stays clean.

## How to trigger a digest

Open Claude Code in this vault and type the slash command:

\`\`\`
/bp-digest
\`\`\`

One command, easy to remember. Claude does the rest: reads each file, classifies it,
files the note in the right vault folder, archives the original, and reports back.
You review the report and the inbox is empty again.

## Examples of what to drop here

- A supplier PDF price list
- A signed customer contract or quote
- Photos of a completed job
- A transcript of a sales call (text file or audio)
- A staff training document
- Old paper records you scanned
- Spreadsheets, web pages saved as PDF, anything else

The more you drop, the more your vault knows about your shop.
`;
  writeFileSync(readmePath, readme, "utf8");
  return { created: true, alreadyExisted: existed };
}

function writeChatLauncher(vaultPath) {
  const isWindows = process.platform === "win32";
  const filename = isWindows ? "Shop OS Chat.bat" : "Shop OS Chat.command";
  const filePath = join(vaultPath, filename);

  let body;
  if (isWindows) {
    body = `@echo off
setlocal
set "VAULT_PATH=%~dp0"
:: Strip trailing backslash
if "%VAULT_PATH:~-1%"=="\\" set "VAULT_PATH=%VAULT_PATH:~0,-1%"
echo Starting Shop OS Chat for "%VAULT_PATH%" ...
npx -y --package=github:blueprintit-ai/shop-os-chat shop-os-chat "%VAULT_PATH%"
pause
`;
  } else {
    body = `#!/bin/bash
# Shop OS Chat launcher — double-click to start.
VAULT_PATH="$(cd "$(dirname "$0")" && pwd)"
echo "Starting Shop OS Chat for: $VAULT_PATH"
npx -y --package=github:blueprintit-ai/shop-os-chat shop-os-chat "$VAULT_PATH"
echo ""
echo "Shop OS Chat stopped. You can close this window."
read -n 1 -s -r -p ""
`;
  }
  writeFileSync(filePath, body, "utf8");
  if (!isWindows) {
    try { chmodSync(filePath, 0o755); } catch { /* ignore */ }
  }
  return filePath;
}

function expandTilde(p) {
  if (!p) return p;
  if (p === "~") return homedir();
  if (p.startsWith("~/") || p.startsWith("~\\")) return join(homedir(), p.slice(2));
  return p;
}

// Clean a path that came from drag-and-drop or "Copy as path" / "Copy as Pathname".
// Mac Terminal drag: backslash-escaped spaces and special chars: /Users/foo/Shop\ OS\ Vault
// Windows "Copy as path": wraps in double quotes: "C:\Users\foo\Shop OS Vault"
// Mac "Copy as Pathname": no escaping: /Users/foo/Shop OS Vault
function unwrapShellPath(p) {
  if (!p) return p;
  let s = p.trim();
  const wasQuoted =
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"));
  if (wasQuoted) {
    s = s.slice(1, -1);
  } else if (process.platform !== "win32") {
    // Mac Terminal drag uses backslash to escape spaces and special chars.
    // On Windows, backslashes are path separators — leave them alone.
    s = s.replace(/\\(.)/g, "$1");
  }
  return s.trim();
}

function detectSyncFolders() {
  const home = homedir();
  return [
    { name: "Dropbox", path: join(home, "Dropbox") },
    { name: "iCloud Drive", path: join(home, "Library/Mobile Documents/com~apple~CloudDocs") },
    { name: "OneDrive", path: join(home, "OneDrive") },
  ].filter((f) => existsSync(f.path));
}

function printVaultLocationGuide() {
  print(bold("Step 1 of 2: create your vault folder"));
  print("");
  print("  Open Finder (Mac) or File Explorer (Windows).");
  print("  Right-click in the location where you want your vault, choose");
  print("  " + bold("New Folder") + ", and name it " + cyan("Shop OS Vault") + ".");
  print("");
  print("  " + bold("Where to put it:"));
  print("    " + cyan("Single computer") + "  -> your home folder or Desktop");
  print("    " + cyan("Multiple machines") + " -> inside Dropbox, iCloud Drive,");
  print("                       or OneDrive (any computer signed in to");
  print("                       the same account will see the same vault)");
  print("");
  print("  " + dim("Disk space: under 50 MB on day one, 2-5 GB after a year of"));
  print("  " + dim("heavy use. Make sure the drive has 10 GB free."));
  print("");
  print(bold("Step 2 of 2: tell the installer where it is"));
  print("");
  print("  When the prompt below appears, " + bold("drag the folder you just created"));
  print("  " + bold("from Finder / File Explorer into this terminal window") + ". The full");
  print("  path appears automatically. Press Enter.");
  print("");
  print("  " + dim("If drag-and-drop does not work:"));
  print("    " + dim("Mac:     right-click the folder, hold Option, choose"));
  print("    " + dim('             "Copy as Pathname", then paste here with Cmd+V'));
  print("    " + dim("Windows: Shift + right-click the folder, choose"));
  print("    " + dim('             "Copy as path", then paste here with Ctrl+V'));
  print("");
}

function saveLicenseFile(license) {
  const dir = join(homedir(), ".shopos");
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "license.json");
  const record = {
    key: license.key || null,
    customer: license.customer,
    product: license.product,
    entitlements: license.entitlements,
    valid_until: license.valid_until,
    activated_at: new Date().toISOString(),
    server: LICENSE_SERVER,
  };
  writeFileSync(path, JSON.stringify(record, null, 2) + "\n", "utf8");
  try {
    chmodSync(path, 0o600);
  } catch {
    // Windows: chmod is a no-op, ignore
  }
  return path;
}

// ---------- arg parsing ----------

function parseArgs(argv) {
  const args = { license: null, vault: null, yes: false, existing: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--yes" || a === "-y") args.yes = true;
    else if (a === "--existing" || a === "-e") args.existing = true;
    else if (a === "--license") args.license = argv[++i];
    else if (a.startsWith("--license=")) args.license = a.slice("--license=".length);
    else if (a === "--vault") args.vault = argv[++i];
    else if (a.startsWith("--vault=")) args.vault = a.slice("--vault=".length);
  }
  return args;
}

function printHelp() {
  print("");
  print(bold("Usage:") + "  npx @blueprintit/shop-os-install [options]");
  print("");
  print(bold("Options:"));
  print(`  --license <KEY>   License key (skips interactive prompt)`);
  print(`  --vault <PATH>    Vault location (skips interactive prompt)`);
  print(`  --existing, -e    Add Shop OS to an existing vault (skips vault creation)`);
  print(`  --yes, -y         Skip the install-here confirmation`);
  print(`  --help, -h        Show this message`);
  print("");
}

// ---------- main flow ----------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    exit(0);
  }

  banner();

  print(bold("Pre-flight checks"));
  const nodeVersion = checkNode();
  ok(`Node ${nodeVersion}`);
  const claudeRoot = checkClaudeCode();
  ok(`Claude Code detected at ${claudeRoot}`);
  print("");

  const rl = createInterface({ input: stdin, output: stdout });

  let license;
  // License entry: 1 attempt if --license flag given, else up to 3 interactive attempts.
  const maxAttempts = args.license ? 1 : 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const key = args.license || (await ask(rl, "License key"));
    if (!key) fail("No license key provided.");
    print("  " + dim("Validating against license server..."));
    const result = await validateLicense(key);
    if (result.ok) {
      license = { ...result.license, key };
      ok(`License valid for ${bold(license.customer)}`);
      info(`Product: ${license.product}`);
      info(`Entitlements: ${license.entitlements.join(", ")}`);
      break;
    }
    warn(`License rejected: ${result.error}`);
    if (attempt < maxAttempts) {
      print("  " + dim("Try again, or press Ctrl-C to cancel."));
    } else {
      print("");
      fail("License validation failed. Reply to your welcome email for help: " + SUPPORT_URL);
    }
  }
  print("");

  // Vault mode: new or existing?
  let isExisting = args.existing;
  if (!isExisting && !args.vault) {
    print(bold("Vault mode"));
    print("");
    print("  " + bold("new") + "       Create a fresh Shop OS vault in a new folder");
    print("  " + bold("existing") + "  Add Shop OS to a vault you already have");
    print("");
    const modeAns = await ask(rl, "New vault or add to existing?", { default: "new" });
    isExisting = modeAns.toLowerCase().startsWith("e");
    print("");
  }

  // Vault location (flag overrides prompt)
  let vaultPath = args.vault;
  if (!vaultPath) {
    if (isExisting) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        const ans = await ask(rl, "Drag your existing vault folder here, then press Enter");
        if (ans) { vaultPath = ans; break; }
        warn("No path entered. Drag the folder into this window, or paste the copied path.");
      }
    } else {
      printVaultLocationGuide();
      for (let attempt = 1; attempt <= 3; attempt++) {
        const ans = await ask(rl, "Drag your Shop OS Vault folder here, then press Enter");
        if (ans) { vaultPath = ans; break; }
        warn("No path entered. Drag the folder from Finder / File Explorer into this window, or paste the copied path.");
      }
    }
    if (!vaultPath) {
      rl.close();
      fail("No vault path provided. Create the folder first, then re-run this installer.");
    }
  }
  vaultPath = resolve(expandTilde(unwrapShellPath(vaultPath)));

  if (!existsSync(vaultPath)) {
    if (isExisting) {
      rl.close();
      fail(`No folder found at: ${vaultPath}\nMake sure the path is correct and the folder exists.`);
    }
    warn(`No folder found at: ${vaultPath}`);
    const createIt = args.yes
      ? true
      : await confirm(rl, "Create it now and continue?", { default: false });
    if (!createIt) {
      rl.close();
      fail("Create the folder in Finder / File Explorer first, then re-run this installer.");
    }
  }

  const confirmMsg = isExisting
    ? `Add Shop OS to existing vault at ${cyan(vaultPath)}?`
    : `Install Shop OS into ${cyan(vaultPath)}?`;
  const proceed = args.yes
    ? true
    : await confirm(rl, confirmMsg, { default: true });

  if (!proceed) {
    rl.close();
    print("");
    print(yellow("Cancelled. No changes made."));
    exit(0);
  }
  rl.close();
  print("");

  // Step-by-step install
  print(bold("Installing Shop OS"));

  print(dim("  [1/6] Registering plugin marketplaces"));
  const mpResult = ensureMarketplaces(claudeRoot);
  for (const mp of MARKETPLACES) ok(`Marketplace ready: ${mp.name}`);
  if (mpResult.cleared.length) {
    info(`Cleared stale clone for ${mpResult.cleared.join(", ")} — Claude Code will re-fetch on next launch.`);
  }

  print(dim("  [2/6] Queueing plugins for sync"));
  const queued = ensurePluginsInstalled(claudeRoot);
  for (const id of queued) ok(`Queued plugin: ${id}`);
  info("Claude Code will sync the latest plugin files from the marketplaces on next launch.");

  print(dim(`  [3/6] ${isExisting ? "Configuring" : "Creating"} vault at ${vaultPath}`));
  if (!existsSync(vaultPath)) {
    mkdirSync(vaultPath, { recursive: true });
    ok("Vault directory created");
  } else {
    info(`Vault directory ${isExisting ? "found" : "already exists"}`);
  }
  if (!isExisting) {
    const wroteClaudeMd = createVaultClaudeMd(vaultPath, license);
    if (wroteClaudeMd) ok("CLAUDE.md scaffolded");
    else info("CLAUDE.md already present (left untouched)");
  }

  const rawResult = createRawInbox(vaultPath);
  if (rawResult.created) ok("Raw/ inbox + Raw/processed/ created (drop materials in Raw/ to seed the vault)");
  else info("Raw/ inbox already present (left untouched)");

  print(dim("  [4/6] Enabling plugins for this vault"));
  const settingsPath = enableForVault(vaultPath);
  ok(`Wrote ${settingsPath.replace(homedir(), "~")}`);

  print(dim("  [5/6] Saving license"));
  const licensePath = saveLicenseFile(license);
  ok(`License saved to ${licensePath.replace(homedir(), "~")} (chmod 600)`);

  print(dim("  [6/6] Installing Shop OS Chat launcher"));
  const launcherPath = writeChatLauncher(vaultPath);
  ok(`Wrote ${launcherPath.replace(homedir(), "~")}`);

  print("");
  print(green(bold("✓ Shop OS installation complete!")));
  print("");
  print(bold("Next steps:"));
  print(`  1. Open the ${cyan("Claude Code")} app you installed (Applications / Start menu)`);
  print(`  2. Pick this folder when it asks which to open:`);
  print(`     ${cyan(vaultPath)}`);
  print(`  3. Type ${cyan("/bp-setup")} to personalize your vault`);
  print(`  4. Walk through the onboarding interview`);
  print("");
  print(`  5. To let your team chat with the vault (read-only),`);
  print(`     double-click ${cyan("Shop OS Chat.command")} (Mac) or ${cyan("Shop OS Chat.bat")} (Windows)`);
  print(`     in your vault folder. First launch downloads the chat (~20 seconds).`);
  print("");
  print(dim(`Support: ${SUPPORT_URL}`));
  print("");
}

main().catch((err) => {
  print("");
  fail(`Unexpected error: ${err.message}`);
});
