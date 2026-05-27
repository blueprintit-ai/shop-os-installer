# Shop OS Foundation — Windows Setup Script
# One command to install all prerequisites and Shop OS

$ErrorActionPreference = "Stop"

# Bypass the execution policy for this process so we can invoke .ps1 shims
# installed by other tools (npm.ps1, npx.ps1 in particular). Without this,
# `irm ... | iex` dies the moment we call npm because PowerShell resolves
# `npm` to `npm.ps1` and the default Restricted policy blocks it.
# -Scope Process is auto-discarded when this PowerShell window closes, so
# no permanent system change.
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

Write-Host "🚀 Shop OS Foundation — Windows Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will install:"
Write-Host "  • Node.js"
Write-Host "  • Git"
Write-Host "  • Claude Code"
Write-Host "  • Obsidian"
Write-Host "  • Shop OS Vault + Installer"
Write-Host ""
Write-Host "You will be prompted for your license key after prerequisites are installed."
Write-Host ""

# Helper function
function Check-Command {
  param([string]$Name)
  $null = Get-Command $Name -ErrorAction SilentlyContinue
  return $?
}

function Check-WinGet {
  $wingetPath = "C:\Program Files\WindowsApps\Microsoft.DesktopAppInstaller_*_x64__8wekyb3d8bbwe\winget.exe"
  $found = Test-Path (Resolve-Path $wingetPath -ErrorAction SilentlyContinue)
  if (-not $found) {
    $found = Check-Command winget
  }
  return $found
}

# 1. Check WinGet
if (-not (Check-WinGet)) {
  Write-Host "⚠️  WinGet not found. Installing WinGet..." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "WinGet is required. Download and install it from:"
  Write-Host "https://github.com/microsoft/winget-cli/releases"
  Write-Host ""
  Write-Host "Or use Windows Package Manager from the Microsoft Store (recommended)."
  Write-Host ""
  exit 1
}
Write-Host "✓ WinGet found" -ForegroundColor Green

# 2. Check/install Node.js
Write-Host ""
if (Check-Command node) {
  Write-Host "✓ Node.js found" -ForegroundColor Green
} else {
  Write-Host "📦 Installing Node.js via WinGet..." -ForegroundColor Yellow
  & winget install --id OpenJS.NodeJS --scope user --silent --accept-package-agreements --accept-source-agreements
}

# 2b. Check/install Git
# The Shop OS npx installer uses git to refresh the plugin marketplace clone
# (~/.claude/plugins/marketplaces/blueprint-skills). Without git on PATH the
# refresh silently fails and the customer ends up with no plugins.
Write-Host ""
if (Check-Command git) {
  Write-Host "✓ Git found" -ForegroundColor Green
} else {
  Write-Host "📦 Installing Git via WinGet..." -ForegroundColor Yellow
  & winget install --id Git.Git --scope user --silent --accept-package-agreements --accept-source-agreements
}

# 3. Refresh PATH so freshly-installed node/npm/git are visible this session.
# WinGet updates the machine/user PATH but doesn't bubble that into the current
# process, so without this refresh `npm` isn't found when we try to install
# Claude Code below.
$env:PATH = [Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [Environment]::GetEnvironmentVariable("PATH","User")

# 4. Check/install Claude Code via npm.
# We deliberately avoid the upstream https://claude.ai/install.ps1 installer:
# on Windows PowerShell 5.1 it fetches its own payload as a byte array and the
# downstream `[scriptblock]::Create(...)` call fails with a parser error on the
# stringified bytes ("Unexpected token '97'..."). npm is already present
# because we just installed Node.js, and it gives us a deterministic install
# plus a clean `npm update -g` upgrade path.
Write-Host ""
if (Check-Command claude) {
  Write-Host "✓ Claude Code found" -ForegroundColor Green
} else {
  Write-Host "📦 Installing Claude Code via npm..." -ForegroundColor Yellow
  & npm install -g "@anthropic-ai/claude-code"
}

# 4. Check/install Obsidian
Write-Host ""
if (Check-Command obsidian -ErrorAction SilentlyContinue) {
  Write-Host "✓ Obsidian found" -ForegroundColor Green
} else {
  Write-Host "📦 Installing Obsidian via WinGet..." -ForegroundColor Yellow
  & winget install --id Obsidian.Obsidian --scope user --silent --accept-package-agreements --accept-source-agreements
}

# 5. Prompt for license key and vault path
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✨ Prerequisites complete!" -ForegroundColor Green
Write-Host ""

$licenseKey = Read-Host "Enter your Shop OS license key"
if ([string]::IsNullOrWhiteSpace($licenseKey)) {
  Write-Host "✗ No license key provided. Exiting." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "A folder picker will open. Navigate to where you want Shop OS installed."
Write-Host "(Examples: your home folder, Dropbox, Documents)"
Write-Host ""

Add-Type -AssemblyName System.Windows.Forms
$picker = New-Object System.Windows.Forms.FolderBrowserDialog
$picker.Description = "Choose where to install Shop OS"
$picker.RootFolder = "MyComputer"
$picker.ShowNewFolderButton = $true
$result = $picker.ShowDialog()

if ($result -ne [System.Windows.Forms.DialogResult]::OK) {
  Write-Host "✗ No folder selected. Exiting." -ForegroundColor Red
  exit 1
}

$parentDir = $picker.SelectedPath
$vaultName = Read-Host "Name your vault folder [Shop OS Vault]"
if ([string]::IsNullOrWhiteSpace($vaultName)) { $vaultName = "Shop OS Vault" }

$vaultPath = Join-Path $parentDir $vaultName

Write-Host ""
Write-Host "Installing Shop OS to: $vaultPath" -ForegroundColor Cyan
Write-Host ""

# Refresh PATH so freshly-installed tools (node, git) are findable. WinGet
# updates the machine/user PATH but doesn't always bubble that into the current
# session, so the installer can't see `git` even though it was just installed.
$env:PATH = [Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [Environment]::GetEnvironmentVariable("PATH","User")

# 6. Run Shop OS installer with license key and vault path
& npx -y @blueprintit/shop-os-install --license "$licenseKey" --vault "$vaultPath" --yes

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open a new PowerShell window in your vault:"
Write-Host "     cd `"$vaultPath`""
Write-Host "  2. Start Claude Code:"
Write-Host "     claude"
Write-Host "  3. Sign in if prompted, then type /bp-setup to personalize your vault."
Write-Host ""
