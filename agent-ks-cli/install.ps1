# Native Windows bootstrap installer. Installs a verified numbered CLI release.
param([string]$Version, [string]$InstallDir = "$env:LOCALAPPDATA\Programs\agent-ks")
$ErrorActionPreference = 'Stop'
$repository = 'sidhanthapoddar99/agent-knowledge-system'
if (-not $Version) {
    $release = Invoke-RestMethod "https://api.github.com/repos/$repository/releases/latest"
    if ($release.draft -or $release.prerelease -or $release.tag_name -notmatch '^agent-ks-cli-v(\d+\.\d+\.\d+)$') {
        throw 'Latest release is not a stable agent-ks CLI release. Supply -Version X.Y.Z.'
    }
    $Version = $Matches[1]
}
if ($Version -notmatch '^\d+\.\d+\.\d+$') { throw 'Version must be X.Y.Z' }
$base = "https://github.com/$repository/releases/download/agent-ks-cli-v$Version"
$archiveName = 'agent-ks-x86_64-pc-windows-msvc.zip'
$temporary = Join-Path ([IO.Path]::GetTempPath()) ([Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $temporary | Out-Null
try {
    Invoke-WebRequest "$base/$archiveName" -OutFile "$temporary\$archiveName" -UseBasicParsing
    Invoke-WebRequest "$base/SHA256SUMS" -OutFile "$temporary\SHA256SUMS" -UseBasicParsing
    $checksums = @(Get-Content "$temporary\SHA256SUMS" | Where-Object { $_ -match ('^[0-9a-fA-F]{64}\s+\*?' + [regex]::Escape($archiveName) + '$') })
    if ($checksums.Count -ne 1) { throw 'Missing or duplicate archive checksum' }
    $expected = ($checksums[0] -split '\s+')[0]
    if ((Get-FileHash "$temporary\$archiveName" -Algorithm SHA256).Hash -ne $expected) { throw 'Checksum mismatch' }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [IO.Compression.ZipFile]::OpenRead("$temporary\$archiveName")
    try {
        if ($zip.Entries.Count -ne 1 -or $zip.Entries[0].FullName -ne 'agent-ks.exe') { throw 'Unexpected archive contents' }
        [IO.Compression.ZipFileExtensions]::ExtractToFile($zip.Entries[0], "$temporary\agent-ks.exe")
    } finally { $zip.Dispose() }
    if ((& "$temporary\agent-ks.exe" --version) -ne "agent-ks $Version" -or $LASTEXITCODE -ne 0) { throw 'Executable version mismatch' }
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
    $destination = Join-Path $InstallDir 'agent-ks.exe'
    if (Test-Path $destination) { throw "An executable already exists at $destination; use agent-ks update" }
    Copy-Item "$temporary\agent-ks.exe" $destination
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if ($InstallDir -notin ($userPath -split ';')) { [Environment]::SetEnvironmentVariable('Path', "$InstallDir;$userPath", 'User') }
    $env:Path = "$InstallDir;$env:Path"
    Write-Host "Installed agent-ks $Version in $InstallDir"
} finally { Remove-Item -LiteralPath $temporary -Recurse -Force }
