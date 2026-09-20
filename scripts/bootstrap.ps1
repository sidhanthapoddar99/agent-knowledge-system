# Configuration and CLI installation only. Viewer operations belong to agent-ks.
$ErrorActionPreference = 'Stop'
$frameworkRoot = Split-Path -Parent $PSScriptRoot
if (-not (Get-Command agent-ks -ErrorAction SilentlyContinue)) {
    if ([Console]::IsInputRedirected -or $env:START_NONINTERACTIVE -eq '1') {
        throw "agent-ks is missing. Run $frameworkRoot\agent-ks-cli\install.ps1 to install it."
    }
    $answer = Read-Host 'agent-ks is missing. Install it now? [y/N]'
    if ($answer -notmatch '^(y|yes)$') { exit 1 }
    & "$frameworkRoot\agent-ks-cli\install.ps1"
}
if (-not (Get-Command agent-ks -ErrorAction SilentlyContinue)) { throw 'agent-ks is missing from PATH' }
$selectedConfig = $env:CONFIG_DIR
if (-not $selectedConfig -and (Test-Path "$frameworkRoot\.env")) {
    foreach ($line in Get-Content "$frameworkRoot\.env") {
        if ($line -match '^\s*(?:export\s+)?CONFIG_DIR\s*=(.*)$') {
            $selectedConfig = ($Matches[1] -replace '\s+#.*$', '').Trim()
            if ($selectedConfig -match '^(["''])(.*)\1$') { $selectedConfig = $Matches[2] }
        }
    }
}
if (-not $selectedConfig) { throw "Set CONFIG_DIR in $frameworkRoot\.env or the environment" }
Push-Location $frameworkRoot
try {
    & agent-ks start --config-dir $selectedConfig --framework-dir $frameworkRoot @args
    $result = $LASTEXITCODE
} finally { Pop-Location }
exit $result
