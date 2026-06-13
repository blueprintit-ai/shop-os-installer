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
import { join, dirname, resolve, delimiter } from "node:path";
import { spawnSync } from "node:child_process";
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

// Read version from package.json so the user-agent never drifts from the
// published version. Falls back to "unknown" if the file can't be read.
let VERSION = "unknown";
try {
  VERSION = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ).version;
} catch { /* keep "unknown" */ }

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
// fail() throws instead of exiting so every failure funnels through main()'s
// catch, which logs telemetry before exiting. `handled` marks an expected,
// already-worded failure (vs. an unexpected crash) so the catch doesn't prefix
// it with "Unexpected error:".
class InstallError extends Error {
  constructor(msg) {
    super(msg);
    this.handled = true;
  }
}
const fail = (msg) => {
  throw new InstallError(msg);
};
const ok = (msg) => print("  " + green("✓") + " " + msg);
const info = (msg) => print("  " + dim("·") + " " + msg);

// ---------- telemetry + resilience ----------

// Updated as the install progresses so an error log pinpoints where it broke.
// Mirrors the step names the PowerShell/bash wrappers send to /install-log, so
// the admin install-logs view reads consistently across the whole funnel.
let currentStep = "preflight";
let currentLicenseKey = "unknown";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Best-effort install telemetry. Never throws and never blocks the install for
// more than ~5s — the wrappers log the outer steps, this fills in the npx-internal
// steps that were previously invisible (license rejection, clone failure, etc.).
async function sendInstallLog(status, errorMessage) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const payload = {
      license_key: currentLicenseKey || "unknown",
      status,
      step: currentStep,
      // The endpoint stores `machine` verbatim; tuck source/version here so they
      // persist (top-level extras are dropped server-side).
      machine: {
        platform: process.platform,
        node: process.version,
        source: "npx",
        version: VERSION,
      },
    };
    if (errorMessage) payload.error_message = String(errorMessage).slice(0, 1000);
    await fetch(`${LICENSE_SERVER}/install-log`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": `shop-os-installer/${VERSION}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch {
    // best-effort: telemetry must never affect the install outcome
  }
}

// Retry an async operation that may fail on a transient network blip. Definitive
// failures (caller throws after the last attempt) propagate to the caller.
async function withRetry(fn, { attempts = 2, delayMs = 1500, label = "Operation" } = {}) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < attempts) {
        warn(`${label} failed (attempt ${i}/${attempts}) — retrying in ${Math.round(delayMs / 1000)}s...`);
        await sleep(delayMs);
      }
    }
  }
  throw lastErr;
}

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

// Probe a host for reachability. ANY HTTP response (even 404/403) means the host
// is reachable — DNS, TCP, and TLS all worked. Only a thrown error (offline,
// DNS failure, blocked by firewall/proxy, timeout) counts as unreachable.
async function isReachable(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    await fetch(url, { method: "GET", redirect: "manual", signal: controller.signal });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}

// Catch offline / proxy / firewall problems up front with a clear message, rather
// than letting them surface mid-install as a cryptic git-clone or fetch failure.
// Shops behind corporate/guest networks frequently block raw GitHub access.
async function checkConnectivity() {
  currentStep = "connectivity_check";
  const targets = [
    { name: "GitHub (github.com)", url: "https://github.com" },
    { name: "Shop OS license server", url: LICENSE_SERVER },
  ];
  for (const t of targets) {
    if (!(await isReachable(t.url))) {
      fail(
        `Can't reach ${t.name}.\n\n` +
          `  Shop OS needs internet access to ${t.url}\n\n` +
          `  Check your Wi-Fi/connection. If you're on a work or guest network,\n` +
          `  it may block GitHub — try a home/phone hotspot, or ask IT to allow\n` +
          `  github.com and *.workers.dev. Then re-run the installer.`,
      );
    }
  }
  ok("Internet connectivity confirmed");
}

function checkClaudeCode() {
  // Detect by binary on PATH, not by the ~/.claude directory: when Claude Code
  // is installed via `npm install -g @anthropic-ai/claude-code` (which the
  // setup scripts now do), the .claude directory isn't created until the user
  // launches `claude` for the first time. A binary check correctly identifies
  // installs from npm, the official .ps1/.sh installer, or the desktop app.
  //
  // The native installer drops `claude` in ~/.local/bin, which a fresh shell may
  // not have on PATH yet. Prepend it before probing so a real install is never
  // mistaken for missing (the exact failure that stalled early installs).
  const localBin = join(homedir(), ".local", "bin");
  if (existsSync(localBin) && !(process.env.PATH || "").split(delimiter).includes(localBin)) {
    process.env.PATH = localBin + delimiter + (process.env.PATH || "");
  }
  currentStep = "claude_check";
  const probe = spawnSync(
    process.platform === "win32" ? "where" : "which",
    ["claude"],
    { stdio: "ignore", shell: false },
  );
  if (probe.status === 0) {
    ok("Claude Code found");
  } else {
    // Claude Code not in PATH. Try auto-installing via npm.
    // shell: true is REQUIRED on Windows — npm is npm.cmd (a batch file), and
    // spawnSync can't execute it without a shell (ENOENT otherwise). stdio
    // inherit so the customer sees npm's progress instead of a frozen prompt.
    currentStep = "claude_autoinstall";
    print("");
    print(yellow("Claude Code not found. Auto-installing via npm..."));
    const npmInstall = spawnSync("npm", ["install", "-g", "@anthropic-ai/claude-code"], {
      stdio: "inherit",
      shell: true,
    });
    if (npmInstall.status !== 0) {
      fail(
        "Claude Code auto-install failed.\n\n" +
          "  Shop OS runs on top of Claude Code. Install it manually at:\n" +
          "    https://claude.ai/code\n\n" +
          "  Then re-run this installer.",
      );
    }
    // Verify the install by checking PATH again (may need a refresh on Windows).
    const verify = spawnSync(
      process.platform === "win32" ? "where" : "which",
      ["claude"],
      { stdio: "ignore", shell: false },
    );
    if (verify.status !== 0) {
      fail(
        "Claude Code installed but 'claude' is not on PATH yet.\n\n" +
          "  This is a PATH refresh issue. Please:\n" +
          "    1. Close this terminal\n" +
          "    2. Open a new terminal\n" +
          "    3. Re-run the installer",
      );
    }
    ok("Claude Code installed and verified");
  }
  // Stage ~/.claude so downstream marketplace and plugin writes succeed even
  // if the user hasn't launched `claude` yet to seed the dir themselves.
  const root = getClaudeRoot();
  if (!existsSync(root)) {
    mkdirSync(root, { recursive: true });
  }
  return root;
}

// ---------- license validation ----------

// A Shop OS key is SHOP-XXXX-XXXX-XXXX (Crockford Base32). Normalize common paste
// artifacts (lowercase, stray spaces, surrounding whitespace) so a perfectly valid
// key isn't rejected over formatting, and shape-check for instant feedback on an
// obvious typo. The license server stays authoritative — a shape miss never
// hard-blocks an automated --license run.
function normalizeLicenseKey(raw) {
  return String(raw || "").trim().toUpperCase().replace(/\s+/g, "");
}

const LICENSE_KEY_SHAPE = /^SHOP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

function looksLikeLicenseKey(key) {
  return LICENSE_KEY_SHAPE.test(key);
}

async function validateLicense(key) {
  const url = `${LICENSE_SERVER}/validate?key=${encodeURIComponent(key)}`;
  let resp;
  try {
    // Retry only the network call — a transient blip shouldn't reject a valid
    // key. An HTTP error response (handled below) is a definitive answer and is
    // NOT retried.
    resp = await withRetry(
      () => fetch(url, { headers: { "user-agent": `shop-os-installer/${VERSION}` } }),
      { attempts: 3, delayMs: 1500, label: "License server request" },
    );
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

async function ensureMarketplaces(claudeRoot) {
  // Always (re-)register marketplaces and refresh the on-disk clone to the
  // latest origin/main. Claude Code does NOT auto-pull marketplace clones, so
  // a clone left at an old commit (e.g. the 5/20 rebrand snapshot) keeps
  // serving stale plugins forever. We use git directly to refresh — pull when
  // possible, fall back to wipe-and-re-clone if pull fails or the directory
  // isn't a git repo.
  //
  // We still report `added` vs already-known to keep the customer-facing
  // install output consistent across runs — the refresh is intentionally
  // invisible.
  const path = join(claudeRoot, "plugins", "known_marketplaces.json");
  const known = readJSON(path, {});
  const added = [];
  const failed = [];
  for (const mp of MARKETPLACES) {
    const installLocation = join(claudeRoot, "plugins", "marketplaces", mp.name);
    if (!known[mp.name]) added.push(mp.name);
    known[mp.name] = {
      source: { source: mp.source.type, repo: mp.source.repo },
      installLocation,
      lastUpdated: new Date().toISOString(),
    };
    const success = await refreshMarketplaceClone(mp, installLocation);
    if (!success) failed.push(mp);
  }
  writeJSON(path, known);

  // A failed clone is the difference between a working vault and a "successful"
  // install where /bp-setup and the obsidian plugin simply don't exist. Fail
  // loudly instead of reporting a false success.
  if (failed.length > 0) {
    const names = failed.map((m) => m.source.repo).join(", ");
    fail(
      `Could not download the Shop OS skills from GitHub (${names}).\n\n` +
        `  The repository failed to clone after retries — usually a dropped\n` +
        `  connection, or a network that blocks github.com.\n\n` +
        `  Check your connection (a work/guest network may block GitHub — try a\n` +
        `  home network or phone hotspot) and re-run the installer. Nothing was\n` +
        `  finalized, so re-running is safe.`,
    );
  }
  return { added, total: MARKETPLACES.length };
}

// Returns true if the marketplace clone is present and up to date, false if it
// could not be obtained. Never throws — the caller decides whether a miss is fatal.
async function refreshMarketplaceClone(mp, installLocation) {
  // GitHub HTTPS URL — same form Claude Code uses internally.
  const repoUrl = `https://github.com/${mp.source.repo}.git`;

  // If a git checkout exists, fast-forward it to origin/main.
  if (existsSync(join(installLocation, ".git"))) {
    const fetched = spawnSync("git", ["fetch", "origin", "main", "--depth=1"], {
      cwd: installLocation,
      stdio: "ignore",
    });
    if (fetched.status === 0) {
      const reset = spawnSync("git", ["reset", "--hard", "FETCH_HEAD"], {
        cwd: installLocation,
        stdio: "ignore",
      });
      if (reset.status === 0) return true;
    }
    // Fetch/reset failed — fall through to wipe + fresh clone.
  }

  // Wipe anything in the install location before cloning fresh. Best-effort:
  // locked files on Windows may block removal, in which case clone below will
  // also fail and we report that to the caller.
  if (existsSync(installLocation)) {
    try {
      rmSync(installLocation, { recursive: true, force: true });
    } catch {
      // intentional fall-through
    }
  }

  mkdirSync(dirname(installLocation), { recursive: true });

  // Clone with one retry on a transient failure. A clone is "successful" only if
  // git exits 0 AND the .git directory actually landed — guards against a partial
  // clone that exits non-zero but leaves a husk directory behind.
  try {
    await withRetry(
      () => {
        const clone = spawnSync("git", ["clone", "--depth=1", repoUrl, installLocation], {
          stdio: "ignore",
        });
        if (clone.status !== 0 || !existsSync(join(installLocation, ".git"))) {
          // Clean up a partial clone so the retry starts fresh.
          try { rmSync(installLocation, { recursive: true, force: true }); } catch { /* best-effort */ }
          throw new Error(`git clone exited ${clone.status}`);
        }
        return true;
      },
      { attempts: 2, delayMs: 2000, label: `Cloning ${mp.source.repo}` },
    );
    return true;
  } catch {
    return false;
  }
}

// Post-install smoke test. A landed clone (guaranteed by ensureMarketplaces) is
// not the same as the manifest actually listing the plugin Claude Code resolves
// on launch. This catches a download that succeeded but doesn't contain the
// plugin behind /bp-setup — so the customer learns now, not when a slash command
// is mysteriously missing. Returns a list of problems ([] = all good).
function verifyInstall(claudeRoot) {
  const problems = [];
  for (const id of PLUGINS_TO_ENABLE) {
    const [pluginName, marketplaceName] = id.split("@");
    if (!pluginName || !marketplaceName) continue;
    const manifestPath = join(
      claudeRoot,
      "plugins",
      "marketplaces",
      marketplaceName,
      ".claude-plugin",
      "marketplace.json",
    );
    if (!existsSync(manifestPath)) {
      // Non-fatal: clone landed but manifest absent (unexpected layout) — Claude
      // Code may still cope, so warn rather than block.
      problems.push({ id, reason: `manifest missing in ${marketplaceName}`, fatal: false });
      continue;
    }
    let manifest;
    try {
      manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    } catch {
      problems.push({ id, reason: `manifest in ${marketplaceName} could not be read`, fatal: false });
      continue;
    }
    const names = Array.isArray(manifest.plugins)
      ? manifest.plugins.map((p) => p && p.name)
      : [];
    if (!names.includes(pluginName)) {
      // Fatal: the manifest parsed fine and definitively does not list the plugin.
      problems.push({
        id,
        reason: `plugin "${pluginName}" not found in the ${marketplaceName} marketplace`,
        fatal: true,
      });
    }
  }
  return problems;
}

function ensurePluginsInstalled(claudeRoot) {
  // Always reset the Shop OS-required plugin entries to a pending user-scope
  // record. A previously-installed pinned entry (e.g. obsidian 3.8.0 from an
  // earlier beta) would otherwise prevent Claude Code from picking up the
  // marketplace's current version. Pending status forces Claude Code to
  // re-resolve the plugin against the (just-refreshed) marketplace clone on
  // its next launch.
  //
  // This wipes any project-scope variants of these specific plugin ids — that's
  // intentional. Shop OS is meant to be enabled at user scope so the same
  // plugin set works across every vault the operator runs.
  //
  // We still report whether entries were newly created vs pre-existing so the
  // customer-facing install output matches the v0.4.0 conventions — the
  // forced-reset is intentionally invisible.
  const path = join(claudeRoot, "plugins", "installed_plugins.json");
  const existing = readJSON(path, { version: 2, plugins: {} });
  if (!existing.plugins) existing.plugins = {};
  const installedAt = new Date().toISOString();
  const queued = [];
  for (const id of PLUGINS_TO_ENABLE) {
    if (!existing.plugins[id]) queued.push(id);

    // Wipe the plugin's per-version cache directory so Claude Code reinstalls
    // from the (just-refreshed) marketplace clone instead of loading a stale
    // pinned version. The cache layout is cache/<marketplace>/<plugin>/<ver>/,
    // so removing the whole /<plugin>/ subtree clears every cached version.
    // Other plugins inside cache/<marketplace>/ are left alone.
    const [pluginName, marketplaceName] = id.split("@");
    if (pluginName && marketplaceName) {
      const pluginCacheDir = join(
        claudeRoot,
        "plugins",
        "cache",
        marketplaceName,
        pluginName,
      );
      if (existsSync(pluginCacheDir)) {
        try {
          rmSync(pluginCacheDir, { recursive: true, force: true });
        } catch {
          // Best-effort: locked file on Windows leaves the cache in place.
        }
      }
    }

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
  return { queued, total: PLUGINS_TO_ENABLE.length };
}

// Vault-scoped permission allowlist. Non-technical Shop OS customers were hitting
// constant tool-permission prompts during /bp-setup (~50+ Read/Write/Bash dialogs
// per onboarding run). These patterns pre-approve the tool surface bp-setup and
// the daily Shop OS flow actually use, scoped to this vault's project settings —
// not the user's global settings. Risk model: customer's own paid Claude
// subscription, own machine, own data; we trade some inbound-injection surface
// for a workable UX. Writes/edits are intentionally bounded to the vault path.
function buildPermissionAllowList(vaultPath) {
  return [
    // Read-side: bp-setup reads reference templates from the marketplace clone
    // (~/.claude/plugins/...) AND any context files the user drops in. Read,
    // Glob, and Grep are low-risk; allow them broadly.
    "Read",
    "Glob",
    "Grep",
    // Write-side: scope to the vault directory so Claude can't be coaxed into
    // writing outside it.
    `Write(${vaultPath}/**)`,
    `Edit(${vaultPath}/**)`,
    // Bash: bp-setup creates directories, chmods hooks, finds reference files.
    // Restrict to the specific subcommands the skill actually invokes.
    "Bash(mkdir:*)",
    "Bash(chmod:*)",
    "Bash(find:*)",
    "Bash(ls:*)",
    "Bash(cat:*)",
    "Bash(grep:*)",
    "Bash(echo:*)",
    "Bash(test:*)",
    "Bash(touch:*)",
    // Network: bp-setup's Phase B+ fetches links the user pastes (LinkedIn,
    // About pages, brand guidelines, etc.).
    "WebFetch",
    "WebSearch",
    // Plan tool: surfaced by some Superpowers skills, no need to prompt.
    "TodoWrite",
  ];
}

function enableForVault(vaultPath) {
  const settingsPath = join(vaultPath, ".claude", "settings.json");
  const settings = readJSON(settingsPath, {});
  if (!settings.enabledPlugins) settings.enabledPlugins = {};
  for (const id of PLUGINS_TO_ENABLE) {
    settings.enabledPlugins[id] = true;
  }
  // Merge (don't clobber) any existing permission allowlist a re-install would
  // have written, then re-add ours. De-dupe by entry string.
  if (!settings.permissions) settings.permissions = {};
  const existing = Array.isArray(settings.permissions.allow)
    ? settings.permissions.allow
    : [];
  const ours = buildPermissionAllowList(vaultPath);
  settings.permissions.allow = Array.from(new Set([...existing, ...ours]));
  writeJSON(settingsPath, settings);
  return settingsPath;
}

// Pre-empt Claude Code's first-run wizard (theme picker, terminal-setup prompt,
// onboarding screens) by writing the "already onboarded" flags BEFORE the
// setup script launches `claude`. The auth/sign-in flow is independent and
// still happens — we can't bypass that and don't try. Safe to run repeatedly:
// merges with any existing config rather than overwriting.
function seedClaudeCodeDefaults(claudeRoot) {
  const seeded = { onboardingFlags: false, theme: false };

  // ~/.claude.json holds Claude Code's user-state (numStartups, hasCompletedOnboarding,
  // anonymousId, etc.). Live next to ~/.claude/, not inside it.
  const userStatePath = join(homedir(), ".claude.json");
  const userState = readJSON(userStatePath, {});
  if (!userState.hasCompletedOnboarding) {
    userState.hasCompletedOnboarding = true;
    if (!userState.lastOnboardingVersion) userState.lastOnboardingVersion = "1.0.30";
    seeded.onboardingFlags = true;
    try {
      writeFileSync(userStatePath, JSON.stringify(userState, null, 2) + "\n", "utf8");
    } catch {
      // best-effort; permission errors here aren't worth blocking the install
    }
  }

  // ~/.claude/settings.json holds user-scope settings (theme, permissions, etc.)
  const settingsPath = join(claudeRoot, "settings.json");
  const settings = readJSON(settingsPath, {});
  if (!settings.theme) {
    settings.theme = "dark";
    seeded.theme = true;
    try {
      writeJSON(settingsPath, settings);
    } catch {
      // best-effort
    }
  }

  return seeded;
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
:: Shop OS Chat launcher. Double-click to start.
:: First time, Windows may show "Windows protected your PC" (SmartScreen).
:: That's expected for a new script. Click "More info" then "Run anyway".
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
# Shop OS Chat launcher. Double-click to start.
# First time, macOS may say it "cannot be opened because it is from an
# unidentified developer". That's expected. To allow it: right-click (or
# Control-click) this file, choose Open, then click Open in the dialog. You
# only need to do this once.
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
    // Best-effort: strip the quarantine flag so the local machine doesn't show
    // Gatekeeper's "unidentified developer" block on first double-click. (A copy
    // synced to another Mac via Dropbox/iCloud may re-acquire it there — the
    // companion help file below covers that case.)
    try {
      spawnSync("xattr", ["-dr", "com.apple.quarantine", filePath], { stdio: "ignore" });
    } catch { /* ignore */ }
  }

  // Companion help note next to the launcher. Terminal output scrolls away, but
  // a non-technical owner returning days later will find this right beside the
  // file they're trying to open.
  writeLauncherHelpNote(vaultPath, isWindows, filename);

  return filePath;
}

function writeLauncherHelpNote(vaultPath, isWindows, launcherName) {
  const notePath = join(vaultPath, "Open Shop OS Chat - HELP.txt");
  const macSteps = `The first time you open "${launcherName}", macOS may say it
"cannot be opened because it is from an unidentified developer".
This is normal and safe. To open it:

  1. Right-click (or Control-click) "${launcherName}"
  2. Choose "Open"
  3. In the dialog that appears, click "Open" again

You only have to do this once. After that, a normal double-click works.`;
  const winSteps = `The first time you open "${launcherName}", Windows may show
a blue "Windows protected your PC" screen (SmartScreen).
This is normal and safe. To open it:

  1. Click "More info"
  2. Click "Run anyway"

You only have to do this once.`;
  const content = `HOW TO OPEN SHOP OS CHAT
========================

Shop OS Chat lets your team chat with this vault (read-only).
Double-click "${launcherName}" in this folder to start it.

${isWindows ? winSteps : macSteps}

The first launch downloads the chat app (about 20 seconds). After that it
starts quickly. To stop it, close the window.

Need help? Reply to your Shop OS welcome email.
`;
  try {
    writeFileSync(notePath, content, "utf8");
  } catch {
    // best-effort; a failed help note must not fail the install
  }
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
  await checkConnectivity();
  print("");

  const rl = createInterface({ input: stdin, output: stdout });

  let license;
  currentStep = "license_validation";
  // License entry: 1 attempt if --license flag given, else up to 3 interactive attempts.
  const maxAttempts = args.license ? 1 : 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const rawKey = args.license || (await ask(rl, "License key"));
    if (!rawKey) fail("No license key provided.");
    const key = normalizeLicenseKey(rawKey);
    currentLicenseKey = key;

    // Instant feedback on an obviously-malformed key, saving a server round-trip
    // on a typo. Interactive only — an automated --license run still defers to
    // the server so a future format change can't break it.
    if (!args.license && !looksLikeLicenseKey(key)) {
      warn(`That doesn't look like a Shop OS key. The format is ${bold("SHOP-XXXX-XXXX-XXXX")}.`);
      if (attempt < maxAttempts) {
        print("  " + dim("Check your welcome email for the exact key, then try again."));
        continue;
      }
      print("");
      fail("No valid license key entered. Reply to your welcome email for help: " + SUPPORT_URL);
    }

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
    // Vault folder doesn't exist yet — that's expected for a new install.
    // In --yes mode (setup scripts), proceed silently; the "[3/N] Creating
    // vault at ..." step below prints its own status. In interactive mode,
    // confirm with the user before creating.
    if (!args.yes) {
      const createIt = await confirm(rl, `Create new vault at ${cyan(vaultPath)}?`, { default: true });
      if (!createIt) {
        rl.close();
        fail("Create the folder in Finder / File Explorer first, then re-run this installer.");
      }
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

  currentStep = "marketplaces";
  print(dim("  [1/7] Registering plugin marketplaces"));
  const mpResult = await ensureMarketplaces(claudeRoot);
  if (mpResult.added.length === 0) {
    info(`All ${mpResult.total} marketplaces already registered`);
  } else {
    for (const name of mpResult.added) ok(`Added marketplace: ${name}`);
  }

  // Smoke test the downloaded marketplaces before scaffolding the vault, so a bad
  // download fails fast (nothing to clean up) instead of mid-way through.
  currentStep = "verify_plugins";
  const problems = verifyInstall(claudeRoot);
  if (problems.length === 0) {
    ok("Verified required plugins are present in their marketplaces");
  } else {
    for (const p of problems) warn(`${p.id}: ${p.reason}`);
    if (problems.some((p) => p.fatal)) {
      fail(
        "Required Shop OS skills are missing from the downloaded marketplaces.\n\n" +
          "  The download landed but does not contain the plugin behind /bp-setup,\n" +
          "  usually a partial or interrupted clone. Re-run the installer — nothing\n" +
          "  was finalized, so re-running is safe.",
      );
    }
    info("Marketplaces downloaded but couldn't be fully verified. If /bp-setup is missing on first launch, re-run this installer.");
  }

  currentStep = "plugins";
  print(dim("  [2/7] Enabling plugins for installation"));
  const pluginsResult = ensurePluginsInstalled(claudeRoot);
  if (pluginsResult.queued.length === 0) {
    info("All required plugins already queued");
  } else {
    for (const id of pluginsResult.queued) ok(`Queued plugin: ${id}`);
    info("Claude Code will sync the actual plugin files from the marketplaces on next launch.");
  }

  currentStep = "vault_create";
  print(dim(`  [3/7] ${isExisting ? "Configuring" : "Creating"} vault at ${vaultPath}`));
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

  currentStep = "vault_settings";
  print(dim("  [4/7] Enabling plugins + permission allowlist for this vault"));
  const settingsPath = enableForVault(vaultPath);
  ok(`Wrote ${settingsPath.replace(homedir(), "~")}`);
  info("Pre-approved Read/Write/Edit/Bash patterns so /bp-setup runs without permission prompts");

  currentStep = "seed_defaults";
  print(dim("  [5/7] Pre-seeding Claude Code defaults"));
  const seeded = seedClaudeCodeDefaults(claudeRoot);
  if (seeded.onboardingFlags || seeded.theme) {
    if (seeded.onboardingFlags) ok("Marked Claude Code onboarding complete (skips theme/terminal wizard on first launch)");
    if (seeded.theme) ok("Set Claude Code theme to dark");
  } else {
    info("Claude Code already configured — left existing settings untouched");
  }

  currentStep = "save_license";
  print(dim("  [6/7] Saving license"));
  const licensePath = saveLicenseFile(license);
  ok(`License saved to ${licensePath.replace(homedir(), "~")} (chmod 600)`);

  currentStep = "launcher";
  print(dim("  [7/7] Installing Shop OS Chat launcher"));
  const launcherPath = writeChatLauncher(vaultPath);
  ok(`Wrote ${launcherPath.replace(homedir(), "~")}`);

  currentStep = "complete";

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
  print(`     ${dim("On first open your OS may show a security prompt (Mac: right-click >")}`);
  print(`     ${dim('Open; Windows: More info > Run anyway). See "Open Shop OS Chat - HELP.txt".')}`);
  print("");
  print(dim(`Support: ${SUPPORT_URL}`));
  print("");
}

main()
  .then(async () => {
    // currentStep is "complete" once main() returns successfully.
    await sendInstallLog("success");
  })
  .catch(async (err) => {
    await sendInstallLog("error", err.message);
    print("");
    // InstallError messages are already worded for the customer; anything else is
    // an unexpected crash, so label it as such.
    const msg = err && err.handled ? err.message : `Unexpected error: ${err && err.message}`;
    stderr.write(red("✗ ") + msg + "\n");
    exit(1);
  });
