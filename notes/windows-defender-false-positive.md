---
type: note
date: 2026-09-17
project: shop-os-installer
status: in-progress
priority: high
tags: [bug, security, windows, customer-onboarding]
---

# Windows Defender flags Install Shop OS.bat as a trojan

Glenn hit this running the Windows installer locally on 2026-09-17: Windows Security blocked the process with **Trojan:Win32/Commando.A!ml**, severity Severe, status Removed. The flagged command line was:

```
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command $env:SHOPOS_LICENSE_KEY='...'; irm https://raw.githubusercontent.com/blueprintit-ai/shop-os-installer/main/scripts/setup-windows.ps1 | iex
```

That is exactly the command [install-page.ts:40](../../shop-os-license-server/src/install-page.ts) bakes into every customer's **Install Shop OS.bat**. This is not a one-off, every customer with Defender cloud-delivered protection on will likely hit the same block.

## Why it triggers

`Trojan:Win32/Commando.A!ml` is a cloud ML classifier tuned to the "IEX cradle" shape: bypass execution policy, stash a secret-looking value in an env var, pipe a remotely-fetched script straight into `iex`, all on one line. [scripts/setup-windows.ps1](../scripts/setup-windows.ps1) compounds it: it downloads a second remote script (`claude.ai/install.ps1`) and runs it via `[scriptblock]::Create`, and POSTs machine info (username, OS version) to the license server on every run (`Send-InstallLog`). Individually fine, together it matches loader/stager behavior. "Status: Removed" means Defender killed the process before anything ran, no actual compromise.

## Fix options

1. **Submit false-positive dispute to Microsoft**: https://www.microsoft.com/en-us/wdsi/filesubmission, category "Software developer", against the raw GitHub URL / file hash. Takes days to propagate globally, doesn't fix new detections in the meantime. Not done yet.
2. **Code-sign `setup-windows.ps1` and the generated `.bat`** with an Authenticode cert. Best long-term fix, also removes the SmartScreen "Windows protected your PC" click-through already in the [README.md](../README.md) customer instructions. Not done yet.
3. **Break the IEX-cradle shape.** Done on 2026-09-17, see below.

## What shipped (2026-09-17)

Restructured both the generated `.bat` ([install-page.ts](../../shop-os-license-server/src/install-page.ts)) and the internal Claude Code install step inside `setup-windows.ps1` so neither one pipes a remote fetch straight into `iex`/`[scriptblock]::Create` anymore:

- The `.bat` now sets `SHOPOS_LICENSE_KEY` with a plain `set` in cmd.exe (not inline in a `-Command` string next to a remote fetch), downloads `setup-windows.ps1` to `%TEMP%` with `Invoke-RestMethod`, then runs it with `powershell -File`.
- Inside `setup-windows.ps1`, the Claude Code sub-install does the same: fetch `claude.ai/install.ps1` to a temp file, run it with `& $file`, delete it after.

**Encoding gotcha found while doing this**: downloading to a file and running it with `-File` isn't a drop-in swap for `irm | iex`. `irm | iex` decodes the HTTP response straight to an in-memory .NET string, so the emoji/checkmarks/em-dashes in this script always rendered fine. Once the same content lands on disk with no BOM (which `Invoke-WebRequest -OutFile` does, and which the repo's `.ps1` files themselves had), Windows PowerShell 5.1 (the default on essentially every customer machine, not `pwsh` 7) falls back to the system codepage to read the file, misdecodes the non-ASCII bytes, and that silently corrupts string/brace parsing further into the file. It manifested as `Missing closing '}' in statement block` several hundred lines away from any real problem, which is a nasty one to debug blind. Verified via `[System.Management.Automation.Language.Parser]::ParseFile` before and after.

Fix: fetch with `Invoke-RestMethod` (returns a decoded string, also sidesteps the old byte[]-content-type workaround for `claude.ai/install.ps1`) and write it back out with an explicit UTF-8 BOM via `[System.IO.File]::WriteAllText(path, text, (New-Object System.Text.UTF8Encoding($true)))`. Also added a BOM to the two committed `setup-windows.ps1` copies themselves, so `test/setup-windows.tests.ps1` (which dot-sources the file directly) passes under plain Windows PowerShell too, not just `pwsh`. Confirmed: `pwsh -File test/setup-windows.tests.ps1`-equivalent run (via `powershell -File`, since `pwsh` isn't installed in this environment) now passes all 9 assertions.

Remaining before this is fully closed: options 1 and 2 above (Microsoft FP dispute, code signing) are still open. The macOS launcher (`buildMacCommand` / `setup-macos.sh`) still uses the equivalent `curl | bash -c` cradle and was not touched here; lower priority since the reported block was Windows-only, but structurally the same risk.
