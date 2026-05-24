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
import { join, dirname } from "node:path";
import {
  existsSync,
  mkdirSync,
  readFileSync,
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
    resp = await fetch(url, { headers: { "user-agent": "shop-os-installer/0.1.0" } });
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
  const path = join(claudeRoot, "plugins", "known_marketplaces.json");
  const known = readJSON(path, {});
  const added = [];
  for (const mp of MARKETPLACES) {
    if (!known[mp.name]) {
      known[mp.name] = {
        source: { source: mp.source.type, repo: mp.source.repo },
        installLocation: join(claudeRoot, "plugins", "marketplaces", mp.name),
        lastUpdated: new Date().toISOString(),
      };
      added.push(mp.name);
    }
  }
  if (added.length) writeJSON(path, known);
  return { added, total: MARKETPLACES.length };
}

function ensurePluginsInstalled(claudeRoot) {
  // We record the plugins in installed_plugins.json. Claude Code's marketplace
  // refresh on next launch will fetch the actual plugin files into cache/.
  // If they're already present, we leave the entry alone (don't downgrade).
  const path = join(claudeRoot, "plugins", "installed_plugins.json");
  const existing = readJSON(path, { version: 2, plugins: {} });
  if (!existing.plugins) existing.plugins = {};
  const installedAt = new Date().toISOString();
  let changed = false;
  for (const id of PLUGINS_TO_ENABLE) {
    if (!existing.plugins[id]) {
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
      changed = true;
    }
  }
  if (changed) writeJSON(path, existing);
  return changed;
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
license-customer: ${license.customer}
license-product: ${license.product}
installed-at: ${new Date().toISOString()}
---

# Shop OS Vault

Welcome to your Shop OS vault. This is the operating system Blueprint IT installed for ${license.customer}.

To finish onboarding, run the following slash command inside Claude Code:

\`/obsidian:os-setup\`

This walks you through personalizing the vault for your shop: name, owner, key staff,
services, daily routines, and more.

For help, see ${DOCS_URL}
or reply to your welcome email.
`;
  mkdirSync(vaultPath, { recursive: true });
  writeFileSync(claudeMd, content, "utf8");
  return true;
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
  const args = { license: null, vault: null, yes: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--yes" || a === "-y") args.yes = true;
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

  // Vault location (flag overrides prompt)
  const defaultVault = join(homedir(), "Shop OS Vault");
  const vaultPath = args.vault
    || (await ask(rl, "Where to create your Shop OS vault?", { default: defaultVault }));

  const proceed = args.yes
    ? true
    : await confirm(rl, `Install Shop OS into ${cyan(vaultPath)}?`, { default: true });

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

  print(dim("  [1/5] Registering plugin marketplaces"));
  const mpResult = ensureMarketplaces(claudeRoot);
  if (mpResult.added.length === 0) {
    info(`All ${mpResult.total} marketplaces already registered`);
  } else {
    for (const name of mpResult.added) ok(`Added marketplace: ${name}`);
  }

  print(dim("  [2/5] Enabling plugins for installation"));
  const pluginsChanged = ensurePluginsInstalled(claudeRoot);
  if (pluginsChanged) {
    for (const id of PLUGINS_TO_ENABLE) ok(`Queued plugin: ${id}`);
    info("Claude Code will sync the actual plugin files from the marketplaces on next launch.");
  } else {
    info("All required plugins already queued");
  }

  print(dim(`  [3/5] Creating vault at ${vaultPath}`));
  if (!existsSync(vaultPath)) {
    mkdirSync(vaultPath, { recursive: true });
    ok("Vault directory created");
  } else {
    info("Vault directory already exists");
  }
  const wroteClaudeMd = createVaultClaudeMd(vaultPath, license);
  if (wroteClaudeMd) ok("CLAUDE.md scaffolded");
  else info("CLAUDE.md already present (left untouched)");

  print(dim("  [4/5] Enabling plugins for this vault"));
  const settingsPath = enableForVault(vaultPath);
  ok(`Wrote ${settingsPath.replace(homedir(), "~")}`);

  print(dim("  [5/5] Saving license"));
  const licensePath = saveLicenseFile(license);
  ok(`License saved to ${licensePath.replace(homedir(), "~")} (chmod 600)`);

  print("");
  print(green(bold("✓ Shop OS installation complete!")));
  print("");
  print(bold("Next steps:"));
  print(`  1. ${cyan(`cd "${vaultPath}"`)}`);
  print(`  2. Open Claude Code in that folder (run ${cyan("claude")} or open the VSCode extension)`);
  print(`  3. Run ${cyan("/obsidian:os-setup")} to personalize your vault`);
  print(`  4. Walk through the onboarding interview`);
  print("");
  print(dim(`Support: ${SUPPORT_URL}`));
  print("");
}

main().catch((err) => {
  print("");
  fail(`Unexpected error: ${err.message}`);
});
