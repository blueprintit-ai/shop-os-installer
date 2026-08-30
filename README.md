# @blueprintit/shop-os-install

One-command installer for **Shop OS**: Blueprint IT's AI Operating System for small businesses.

## Setup scripts (run on the onboarding call)

Run **one** of these on the customer's machine. Everything installs automatically:

**Mac** (in Terminal):
```sh
curl -fsSL https://raw.githubusercontent.com/blueprintit-ai/shop-os-installer/main/scripts/setup-macos.sh -o setup.sh
chmod +x setup.sh
./setup.sh
```

**Windows** (in PowerShell as Administrator):
```powershell
irm https://raw.githubusercontent.com/blueprintit-ai/shop-os-installer/main/scripts/setup-windows.ps1 -o setup.ps1
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\setup.ps1
```

This installs Node.js, Claude Code, Obsidian, and Shop OS in one go. You'll be prompted for your license key and vault location.

---

## Manual Install

If you prefer to install prerequisites yourself, run:

```sh
npx @blueprintit/shop-os-install
```

The installer (run directly or via the setup scripts above):

1. **Pre-flight**: verifies Node 18+ and Claude Code is installed
2. **License validation**: prompts for the license key, validates against `https://shop-os-license-server.glenn-15d.workers.dev/validate`
3. **Marketplaces**: registers `blueprintit-ai/blueprint-skills` and `anthropics/claude-plugins-official` in `~/.claude/plugins/known_marketplaces.json`
4. **Plugins**: queues `obsidian@blueprint-skills` and `superpowers@claude-plugins-official` in `~/.claude/plugins/installed_plugins.json` (Claude Code does the actual fetch on next launch)
5. **Vault**: creates a Shop OS vault folder (default `~/Shop OS Vault`) with a starter `CLAUDE.md`
6. **Per-vault config**: writes `<vault>/.claude/settings.json` with `enabledPlugins` set for obsidian + superpowers
7. **License record**: saves `~/.shopos/license.json` (chmod 600) for downstream skill validation
8. **Next steps**: prints `cd` command and the `/bp-setup` slash command to run

Zero npm dependencies. Uses only Node 18+ built-ins (`fetch`, `readline`, `fs`).

## How customers get installed

Shop OS Foundation is set up **with** the customer on a one-hour screen-share
(30 min setup + 30 min training), booked from the welcome email. The welcome
email deliberately contains **no install commands**: Blueprint IT runs the
setup script above on the call and enters the license key. See
`welcome-email-template.md` (source of truth:
`Projects/shop-os-license-server/src/email/welcome-template.ts`).

## Local development

```sh
# Test the installer against the live license server with a test key
# (issue one from the admin dashboard first):
node bin/shop-os-install.js
```

The script reads from stdin so you can also drive it via heredoc for testing:

```sh
printf 'SHOP-XXXX-YYYY-ZZZZ\n/tmp/test-vault\ny\n' | node bin/shop-os-install.js
```

## Publishing to npm

The package is scoped under `@blueprintit`. You need an npm org named `blueprintit` (or change the scope to your personal username).

```sh
# One-time: create the @blueprintit npm org if it doesn't exist
# - go to https://www.npmjs.com/org/create
# - choose Free plan (limited to public packages, fine for an installer)

# One-time: log in to npm
npm login

# Publish
cd "Projects/shop-os-installer"
npm publish --access public
```

After publish, the install command works for any customer worldwide:

```sh
npx @blueprintit/shop-os-install
```

`npx` always fetches the latest published version, so customers get bug fixes automatically.

## Versioning

Bump `version` in `package.json` before each publish:

- Patch (`0.1.0` → `0.1.1`): bug fixes
- Minor (`0.1.0` → `0.2.0`): new install steps or behavior changes
- Major (`0.1.0` → `1.0.0`): breaking changes (e.g. license server URL change)

Then:

```sh
npm publish --access public
```

## Files

```
shop-os-installer/
├── package.json
├── README.md (this file)
├── .gitignore
└── bin/
    └── shop-os-install.js   (~380 lines, single-file installer)
```

## Architecture notes

### Why no dependencies

Every transitive dependency in `npx` is fetched fresh each run. Heavy deps make the install feel slow. Node 18+ ships `fetch`, `readline/promises`, and `fs/promises`, which is everything we need. The whole installer downloads in well under a second.

### Why we write to Claude Code config files directly

The alternative was to spawn `claude plugin marketplace add ...` and `claude plugin install ...` subprocesses. We chose direct file writes because:

- The config file formats are well-known and stable
- Direct writes are atomic and deterministic
- We don't have to depend on the `claude` CLI being on the customer's PATH
- The customer's next Claude Code session will sync the marketplaces and fetch the actual plugin files, the same as if they'd run the commands

If a customer's `claude` CLI is broken (PATH issues, version mismatch), our installer still works. We just stage the right config and let Claude Code finish the job.

### What we never touch

We never modify:

- The customer's existing `enabledPlugins` for other projects (we only write per-vault settings)
- Other entries in `installed_plugins.json` (we merge, never replace)
- Other entries in `known_marketplaces.json` (we merge, never replace)
- Anthropic API keys, Claude Code auth, or any subscription/billing config

## Future enhancements (post-MVP)

| Feature | Why |
|---|---|
| `--vault <path>` flag | Skip the prompt for scripted installs |
| `--license <key>` flag | Same, for testing or scripted reinstalls |
| Update detection | Tell the customer if a newer Shop OS version is available |
| Telemetry opt-in | Phone home install success/failure counts (anonymous) for product analytics |
| Uninstall command | `npx @blueprintit/shop-os-uninstall` |
| Multi-vault mode | Add Shop OS to an existing vault rather than creating a new one |
