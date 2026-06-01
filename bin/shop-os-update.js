#!/usr/bin/env node
/**
 * Shop OS skills updater.
 *
 * Pulls the latest skills from GitHub without re-running the full installer.
 * Safe to run at any time — does not touch your vault or license.
 *
 * Mac / Linux:
 *   npx -y --package=@blueprintit/shop-os-install shop-os-update
 *
 * Windows (PowerShell):
 *   npx -y --package=@blueprintit/shop-os-install shop-os-update
 */

import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { stdout, stderr, exit } from "node:process";

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
const fail = (msg) => { stderr.write(red("✗ ") + msg + "\n"); exit(1); };
const ok = (msg) => print("  " + green("✓") + " " + msg);
const info = (msg) => print("  " + dim("·") + " " + msg);

// ---------- helpers ----------

function readJSON(path, fallback) {
  if (!existsSync(path)) return fallback;
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch { return fallback; }
}

function writeJSON(path, obj) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

// ---------- main ----------

function banner() {
  [
    "",
    bold("  ╔════════════════════════════════════════════════════════════╗"),
    bold("  ║                                                            ║"),
    bold("  ║          ") + cyan("Shop OS Skills Updater") + bold("                            ║"),
    bold("  ║          ") + dim("Pull the latest skills from Blueprint IT") + bold("          ║"),
    bold("  ║                                                            ║"),
    bold("  ╚════════════════════════════════════════════════════════════╝"),
    "",
  ].forEach((l) => print(l));
}

function preflight() {
  const major = Number(process.versions.node.split(".")[0]);
  if (major < 18) fail(`Node.js 18+ required. You have ${process.version}.`);

  const probe = spawnSync(
    process.platform === "win32" ? "where" : "which",
    ["claude"],
    { stdio: "ignore", shell: false },
  );
  if (probe.status !== 0) {
    fail("Claude Code not found. Make sure it is installed and on your PATH.");
  }

  return join(homedir(), ".claude");
}

function refreshMarketplace(claudeRoot) {
  const installLocation = join(claudeRoot, "plugins", "marketplaces", "blueprint-skills");
  const repoUrl = "https://github.com/blueprintit-ai/blueprint-skills.git";

  if (existsSync(join(installLocation, ".git"))) {
    const fetch = spawnSync("git", ["fetch", "origin", "main", "--depth=1"], {
      cwd: installLocation,
      stdio: "ignore",
    });
    if (fetch.status === 0) {
      const reset = spawnSync("git", ["reset", "--hard", "FETCH_HEAD"], {
        cwd: installLocation,
        stdio: "ignore",
      });
      if (reset.status === 0) {
        ok("Skills pulled from GitHub");
        return;
      }
    }
    // fetch/reset failed — wipe and re-clone
    warn("git pull failed, re-cloning marketplace...");
    try { rmSync(installLocation, { recursive: true, force: true }); } catch { /* best-effort */ }
  } else {
    info("Marketplace not found locally — cloning fresh...");
  }

  mkdirSync(dirname(installLocation), { recursive: true });
  const clone = spawnSync("git", ["clone", "--depth=1", repoUrl, installLocation], {
    stdio: "ignore",
  });
  if (clone.status !== 0) fail("Could not reach GitHub. Check your internet connection and try again.");
  ok("Skills cloned from GitHub");
}

function wipePluginCache(claudeRoot) {
  const cacheDir = join(claudeRoot, "plugins", "cache", "blueprint-skills", "obsidian");
  if (existsSync(cacheDir)) {
    try {
      rmSync(cacheDir, { recursive: true, force: true });
      ok("Plugin cache cleared");
    } catch {
      warn("Could not clear plugin cache — Claude Code may load a stale version. Try restarting Claude Code twice.");
    }
  } else {
    ok("Plugin cache already clean");
  }
}

function resetPluginEntry(claudeRoot) {
  const pluginsPath = join(claudeRoot, "plugins", "installed_plugins.json");
  const data = readJSON(pluginsPath, { version: 2, plugins: {} });
  if (!data.plugins) data.plugins = {};

  const id = "obsidian@blueprint-skills";
  const now = new Date().toISOString();

  data.plugins[id] = [
    {
      scope: "user",
      installPath: null,
      version: "pending",
      installedAt: data.plugins[id]?.[0]?.installedAt ?? now,
      lastUpdated: now,
      gitCommitSha: "pending-sync",
    },
  ];

  writeJSON(pluginsPath, data);
  ok("Plugin marked for re-install on next Claude Code launch");
}

banner();
print(dim("  Updating Shop OS skills. Your vault and license are not affected.\n"));

print(dim("  [1/3] Refreshing skill files from GitHub"));
const claudeRoot = preflight();
refreshMarketplace(claudeRoot);

print("");
print(dim("  [2/3] Clearing plugin cache"));
wipePluginCache(claudeRoot);

print("");
print(dim("  [3/3] Resetting plugin entry"));
resetPluginEntry(claudeRoot);

print("");
print(green("  ✓ Update complete."));
print("");
print("  " + bold("Restart Claude Code") + " to load the updated skills.");
print("  Your vault files, license key, and settings are unchanged.");
print("");
