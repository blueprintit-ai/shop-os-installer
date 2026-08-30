---
type: internal-runbook
project: shop-os
audience: blueprintit-staff
tags: [shop-os, onboarding, install, runbook]
---

# Shop OS Setup Runbook (staff)

Install Shop OS Foundation on a customer's machine during the one-hour onboarding call. Keep in sync with `scripts/` when the install flow changes. Published copy (with copy buttons): see the "Shop OS Setup Runbook" artifact.

## Before the call

- Customer on the computer they work on, screen share running.
- They know the login password and the account is an administrator (Mac: Homebrew needs sudo. Windows: PowerShell as Administrator).
- Claude subscription and login handy (Claude Pro is enough).
- Decided where the vault lives (home/Documents/Desktop, or Dropbox/iCloud/OneDrive to sync).
- License key open (below). Network can reach github.com and *.workers.dev (hotspot if not).

## 1. License key

Admin dashboard: https://shop-os-license-server.glenn-15d.workers.dev/admin (token in `~/.shopos-admin-token`).

Check a key: `curl "https://shop-os-license-server.glenn-15d.workers.dev/validate?key=SHOP-XXXX-XXXX-XXXX"`

## 2. Run the setup script

Mac (Terminal):

```sh
curl -fsSL https://raw.githubusercontent.com/blueprintit-ai/shop-os-installer/main/scripts/setup-macos.sh | bash
```

Download-then-run form:

```sh
curl -fsSL https://raw.githubusercontent.com/blueprintit-ai/shop-os-installer/main/scripts/setup-macos.sh -o setup.sh
chmod +x setup.sh
./setup.sh
```

Windows (PowerShell, Run as administrator):

```powershell
irm https://raw.githubusercontent.com/blueprintit-ai/shop-os-installer/main/scripts/setup-windows.ps1 | iex
```

Download-then-run form (if execution policy blocks it):

```powershell
irm https://raw.githubusercontent.com/blueprintit-ai/shop-os-installer/main/scripts/setup-windows.ps1 -o setup.ps1
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\setup.ps1
```

Both are safe to re-run.

## 3. Prompts, in order

| Prompt | Do |
|---|---|
| Mac password | Login password (only if Homebrew missing). Nothing echoes; press Enter. |
| Windows UAC | Yes. |
| License key | Paste. Case/spaces don't matter. 3 attempts. |
| Folder picker | Pick the PARENT location. Vault folder is created inside it. |
| Vault name [Shop OS Vault] | Enter for default. |
| Installer output | 7 steps, ends "Shop OS installation complete!". Every plugin line should be a checkmark, including superpowers. |

## 4. First launch

Script opens Claude Code in the vault twice on purpose (plugins load in the background on launch 1).

1. Launch 1: sign in with the customer's Claude account.
2. `/exit`. Script relaunches.
3. Launch 2: `/bp-setup`. Run it with the customer.

Later: `cd ~/"Shop OS Vault" && claude` (Mac) / `cd "$env:USERPROFILE\Shop OS Vault"; claude` (Windows).

## 5. Verify

- Vault has `CLAUDE.md`, `Raw/`, `.claude/settings.json`, `Shop OS Chat.command` or `.bat`, `Open Shop OS Chat - HELP.txt`.
- `/bp` shows bp-setup, bp-digest, bp-operator, bp-optimizer.
- Superpowers skills present (e.g. `/brainstorming`).
- Chat launcher opens localhost:7777 (Mac: right-click > Open first time. Windows: More info > Run anyway).
- Obsidian opens the vault folder.

Until installer 0.5.14 is on npm, published 0.5.12 silently skips superpowers. Fix, inside the vault folder:

```
claude plugin install superpowers@claude-plugins-official --scope project
```

## Self Install (customer-driven, since 2026-08-30)

The welcome email includes an optional personal install page:
`https://shop-os-license-server.glenn-15d.workers.dev/install?key=SHOP-...`
It serves `Install Shop OS.bat` (Windows) / `Install Shop OS.zip` (Mac; unzips to `Install Shop OS.command` with its execute bit intact) with the customer's key baked in (SHOPOS_LICENSE_KEY): download, double-click, one security prompt, done. Booking stays recommended; a self-install does not consume the setup/training hour. If a customer calls stuck mid-self-install, the state is identical to our scripted path: re-running is safe, and install logs show where it stopped.

## Manual path (script can't run)

Install prerequisites by hand, open a NEW terminal after each, then run the installer.

| What | Mac | Windows | Check |
|---|---|---|---|
| Node.js LTS 18+ | https://nodejs.org/en/download (.pkg) | https://nodejs.org/en/download (.msi x64) | `node -v` |
| Git | `xcode-select --install` or https://git-scm.com/download/mac | https://git-scm.com/download/win | `git --version` |
| Python 3 | usually present; https://www.python.org/downloads/macos/ | https://www.python.org/downloads/windows/ (tick "Add python.exe to PATH") | `python3 --version` / `python --version` |
| Claude Code | `curl -fsSL https://claude.ai/install.sh \| bash` | `irm https://claude.ai/install.ps1 \| iex` | `claude --version` |
| Obsidian | https://obsidian.md/download | https://obsidian.md/download | app opens |

`claude` lives in `~/.local/bin`; Mac: `export PATH="$HOME/.local/bin:$PATH"` if not found. Alternative: `npm install -g @anthropic-ai/claude-code`.

Installer, interactive:

```
npx -y @blueprintitai/shop-os-install@latest
```

No prompts:

```sh
# Mac
npx -y @blueprintitai/shop-os-install@latest --license SHOP-XXXX-XXXX-XXXX --vault "$HOME/Shop OS Vault" --yes
```

```powershell
# Windows
npx -y @blueprintitai/shop-os-install@latest --license SHOP-XXXX-XXXX-XXXX --vault "$env:USERPROFILE\Shop OS Vault" --yes
```

`--existing` adds Shop OS to a vault they already have. Then do steps 4 and 5 by hand.

Update skills later: `npx -y --package=@blueprintitai/shop-os-install shop-os-update`

## Direct downloads

- Node.js LTS: https://nodejs.org/en/download (script fallback MSI: https://nodejs.org/dist/v22.20.0/node-v22.20.0-x64.msi)
- Homebrew: https://brew.sh
- Git: https://git-scm.com/download/win , https://git-scm.com/download/mac
- Python: https://www.python.org/downloads/
- Claude Code: https://claude.ai/code , docs https://code.claude.com/docs/en/setup
- Obsidian: https://obsidian.md/download
- WinGet / App Installer: https://apps.microsoft.com/detail/9NBLGGH4NNS1 , https://github.com/microsoft/winget-cli/releases
- Installer package: https://www.npmjs.com/package/@blueprintitai/shop-os-install , source https://github.com/blueprintit-ai/shop-os-installer

## Errors and fixes

- Win "running scripts is disabled" (setup command): use download-then-run form (sets Bypass for the process).
- Win "claude.ps1 cannot be loaded" (new window, after install): npm-installed Claude Code + Restricted policy. Current script persists RemoteSigned for the user; older installs: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`, or use `claude.cmd`.
- Both /bp missing in IDE extensions (VS Code, Antigravity, Cursor): installer 0.5.15+ uses user scope so they work everywhere. Older installs: `claude plugin install obsidian@blueprint-skills --scope user` and `claude plugin install superpowers@claude-plugins-official --scope user`, restart session.
- Win "WinGet not found": install App Installer from the Store, reopen PowerShell as admin, re-run.
- Win msiexec 1603: another Node is installed. Uninstall Node.js in Add or Remove Programs, reopen PowerShell as admin, re-run.
- Win "npx not found after Node.js installation": PATH not refreshed. New PowerShell as admin, re-run.
- Win Python failed: install from python.org with Add to PATH, new PowerShell, re-run.
- Win SmartScreen on Shop OS Chat.bat: More info > Run anyway.
- Mac "not in the sudoers file": account isn't admin. Get an admin login.
- Mac "unidentified developer" on Shop OS Chat.command: right-click > Open > Open.
- Mac paste blocked in Terminal: use download-then-run form.
- Both "Can't reach GitHub": network blocks github.com / *.workers.dev. Hotspot. Re-running is safe.
- Both "License rejected": check the key in admin. Typos are normalized; "not found" is a wrong key.
- Both "'claude' is not on PATH yet": new terminal, re-run.
- Both /bp-setup unknown on first launch: exit and reopen Claude Code in the vault; re-run installer if still missing.
- Both permission prompts on every write in /bp-setup: re-run installer (rewrites the vault allowlist), or `claude --permission-mode acceptEdits` for the session.

Install logs for every run: admin dashboard > Install logs. Since 2026-08-30 the log stream also shows the self-install funnel per key (page_view, download, success/error, bp_setup_complete), the install page flips to a success banner when an install reports in, and any install error with no success within 30 minutes emails glenn@ automatically (cron sweep every 15 min; dedupe per error).

## Links

- Admin: https://shop-os-license-server.glenn-15d.workers.dev/admin
- Booking: https://calendly.com/blueprintit/shop-os-foundation-setup
- Product page: https://blueprintit.ai/shop-ossi
- Skills marketplace: https://github.com/blueprintit-ai/blueprint-skills
- Chat app: https://github.com/blueprintit-ai/shop-os-chat
- On the customer machine: `~/.shopos/license.json`, `~/.claude/plugins/`, `<vault>/.claude/settings.json`
