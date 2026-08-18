# Regression tests for setup-windows.ps1 install-decision logic.
#
# These cover the failure a customer hit on 2026-08-18: WinGet reported
# "Found an existing package already installed / No available upgrade found"
# (exit -1978335189 = 0x8A15002B) and the Node branch treated that non-zero
# exit as a real failure, fell through to the direct-MSI fallback, and msiexec
# returned 1603 because Node was already installed. Same class of bug in the
# Python branch, which trusted the exit code with no presence re-check.
#
# Run:  pwsh -File test/setup-windows.tests.ps1
# Exits non-zero if any assertion fails.

$ErrorActionPreference = "Stop"

$script:Failures = 0
$script:Passed   = 0

function Assert-Equal {
  param($Expected, $Actual, [string]$Because)
  if ($Expected -eq $Actual) {
    $script:Passed++
    Write-Host "  PASS  $Because" -ForegroundColor Green
  } else {
    $script:Failures++
    Write-Host "  FAIL  $Because" -ForegroundColor Red
    Write-Host "          expected: $Expected" -ForegroundColor DarkGray
    Write-Host "          actual:   $Actual" -ForegroundColor DarkGray
  }
}

# Load the installer's functions without running the installer.
$env:SHOPOS_INSTALLER_TEST = "1"
$scriptPath = Join-Path $PSScriptRoot "..\scripts\setup-windows.ps1"
. $scriptPath

Write-Host ""
Write-Host "Test-WingetInstallFailed" -ForegroundColor Cyan

# WinGet exit codes seen in the wild.
$WINGET_OK                   = 0
$WINGET_NO_UPGRADE           = -1978335189   # 0x8A15002B already installed, nothing to upgrade
$WINGET_NO_APPLICATIONS      = -1978335212   # 0x8A150014 no package matched the query
$WINGET_INSTALL_FAILED       = -1978334972   # a genuine installer failure

Assert-Equal $false (Test-WingetInstallFailed -ExitCode $WINGET_OK -PresenceCheck { $true }) `
  "exit 0 with package present is not a failure"

Assert-Equal $false (Test-WingetInstallFailed -ExitCode $WINGET_NO_UPGRADE -PresenceCheck { $true }) `
  "'already installed, no upgrade' with package present is NOT a failure (the 1603 bug)"

Assert-Equal $false (Test-WingetInstallFailed -ExitCode $WINGET_NO_APPLICATIONS -PresenceCheck { $true }) `
  "'no applications found' with package present is NOT a failure (the Python bug)"

Assert-Equal $true (Test-WingetInstallFailed -ExitCode $WINGET_NO_APPLICATIONS -PresenceCheck { $false }) `
  "'no applications found' with package absent IS a failure"

Assert-Equal $true (Test-WingetInstallFailed -ExitCode $WINGET_INSTALL_FAILED -PresenceCheck { $false }) `
  "genuine install failure with package absent IS a failure"

Assert-Equal $false (Test-WingetInstallFailed -ExitCode $WINGET_OK -PresenceCheck { $false }) `
  "exit 0 is trusted even if the presence probe cannot see the package yet"

Write-Host ""
Write-Host "Msi exit code messaging" -ForegroundColor Cyan

$msg1603 = Get-MsiFailureMessage -ExitCode 1603 -Version "v24.19.0" -Url "https://example/node.msi"
Assert-Equal $true ($msg1603 -match "already installed|existing installation") `
  "1603 explains the already-installed conflict instead of dead-ending"
Assert-Equal $true ($msg1603 -match "Add or Remove Programs|appwiz") `
  "1603 gives the customer a concrete next action"

$msgOther = Get-MsiFailureMessage -ExitCode 1618 -Version "v24.19.0" -Url "https://example/node.msi"
Assert-Equal $true ($msgOther -match "1618") `
  "other msiexec codes are still surfaced verbatim"

Write-Host ""
if ($script:Failures -gt 0) {
  Write-Host "$($script:Failures) failed, $($script:Passed) passed" -ForegroundColor Red
  exit 1
}
Write-Host "$($script:Passed) passed" -ForegroundColor Green
exit 0
