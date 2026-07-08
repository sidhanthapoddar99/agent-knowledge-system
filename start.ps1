# Entrypoint for the astro-doc-code framework — Windows port of ./start (bash).
# Invoke via .\start.cmd (wrapper bypasses execution policy) or .\start.ps1 directly.
#
# Usage:
#   .\start.cmd                 preflight (update check → install if needed → build sanity check) → dev server
#   .\start.cmd <script>        skip preflight, just run the named script (dev | build | preview | astro …)
#   .\start.cmd clean           wipe build caches (.astro, dist, node_modules/.vite) and exit
#   .\start.cmd clean <script>  wipe caches, then run the script (e.g. '.\start.cmd clean dev')
#
# Skip the update check with: $env:START_SKIP_UPDATE_CHECK = '1' (e.g. in CI).

$Dir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 0. Update check — if upstream has new commits, offer to fast-forward pull.
#    Bails silently when: not a git repo, no upstream tracked, working tree
#    dirty, branch diverged, no TTY, or START_SKIP_UPDATE_CHECK=1.
function Update-Check {
  if ($env:START_SKIP_UPDATE_CHECK -eq '1') { return }
  if ([Console]::IsInputRedirected) { return }
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) { return }

  & git -C $Dir rev-parse --git-dir 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) { return }

  $upstream = & git -C $Dir rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $upstream) { return }

  & git -C $Dir diff --quiet
  $dirtyWorktree = $LASTEXITCODE -ne 0
  & git -C $Dir diff --cached --quiet
  $dirtyIndex = $LASTEXITCODE -ne 0
  if ($dirtyWorktree -or $dirtyIndex) {
    Write-Host "[start] working tree has uncommitted changes - skipping update check"
    return
  }

  Write-Host "[start] checking $upstream for updates..."
  & git -C $Dir fetch --quiet 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[start] fetch failed (offline?) - skipping update check"
    return
  }

  $localSha    = & git -C $Dir rev-parse HEAD
  $upstreamSha = & git -C $Dir rev-parse '@{u}'
  if ($localSha -eq $upstreamSha) { Write-Host "[start] up to date"; return }

  $baseSha = & git -C $Dir merge-base HEAD '@{u}' 2>$null
  if ($LASTEXITCODE -ne 0) { return }
  if ($baseSha -ne $localSha) {
    Write-Host "[start] local branch has diverged from $upstream - resolve manually before pulling"
    return
  }

  $ahead = & git -C $Dir rev-list --count 'HEAD..@{u}' 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $ahead) { $ahead = '?' }
  Write-Host "[start] $ahead new commit(s) available on $upstream"
  $reply = Read-Host "[start] pull now? [Y/n]"
  if ($reply -eq '' -or $reply -match '^(?i)(y|yes)$') {
    & git -C $Dir pull --ff-only --quiet
    if ($LASTEXITCODE -eq 0) { Write-Host "[start] pulled $ahead commit(s) - continuing" }
    else { Write-Host "[start] pull failed - continuing with current version" }
  } else {
    Write-Host "[start] skipping pull - continuing with current version"
  }
}

Update-Check

# 0b. Shallow check — consumer clones don't need git history (the tracker's
#     git-derived dates are a framework-dev concern). If this is a consumer-
#     mode clone (CONFIG_DIR points outside the framework folder) with full
#     history, offer a one-time in-place shrink to a shallow clone. Mirrors
#     ./start (bash); same skip conditions.
function Shallow-Check {
  if ($env:START_SKIP_UPDATE_CHECK -eq '1') { return }
  if ([Console]::IsInputRedirected) { return }
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) { return }
  & git -C $Dir rev-parse --git-dir 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) { return }
  $isShallow = & git -C $Dir rev-parse --is-shallow-repository 2>$null
  if ($isShallow -ne 'false') { return }
  if (Test-Path (Join-Path $Dir '.git/.start-shallow-declined')) { return }

  # Consumer mode iff CONFIG_DIR resolves outside the framework folder.
  $envFile = Join-Path $Dir '.env'
  if (-not (Test-Path $envFile)) { return }
  $configLine = (Get-Content $envFile | Where-Object { $_ -match '^CONFIG_DIR=' } | Select-Object -Last 1)
  if (-not $configLine) { return }
  $configDir = ($configLine -replace '^CONFIG_DIR=', '').Trim('"', "'")
  try { $resolved = (Resolve-Path (Join-Path $Dir $configDir) -ErrorAction Stop).Path } catch { return }
  if ($resolved.StartsWith((Resolve-Path $Dir).Path + [IO.Path]::DirectorySeparatorChar)) { return }  # dogfood

  # Same safety rails as the update check.
  & git -C $Dir diff --quiet; if ($LASTEXITCODE -ne 0) { return }
  & git -C $Dir diff --cached --quiet; if ($LASTEXITCODE -ne 0) { return }
  $upstream = & git -C $Dir rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $upstream) { return }
  $localSha = & git -C $Dir rev-parse HEAD
  $upstreamSha = & git -C $Dir rev-parse '@{u}' 2>$null
  if ($LASTEXITCODE -ne 0 -or $localSha -ne $upstreamSha) { return }

  $size = '{0:N0} MB' -f ((Get-ChildItem -Recurse -Force (Join-Path $Dir '.git') | Measure-Object -Property Length -Sum).Sum / 1MB)
  Write-Host "[start] consumer-mode clone with full git history detected (.git = $size)"
  Write-Host "[start] a vendored framework doesn't need history - shallow keeps only the current commit"
  $reply = Read-Host "[start] shrink to a shallow clone now? [y/N]"
  if ($reply -match '^(?i)(y|yes)$') {
    & git -C $Dir fetch --depth 1 --quiet 2>$null
    if ($LASTEXITCODE -eq 0) {
      & git -C $Dir reflog expire --expire=now --all 2>$null
      & git -C $Dir gc --prune=now --quiet 2>$null
      $size = '{0:N0} MB' -f ((Get-ChildItem -Recurse -Force (Join-Path $Dir '.git') | Measure-Object -Property Length -Sum).Sum / 1MB)
      Write-Host "[start] done - .git is now $size (future pulls stay shallow)"
    } else {
      Write-Host "[start] shallow fetch failed - leaving the clone as-is"
    }
  } else {
    Write-Host "[start] keeping full history (won't ask again - delete .git/.start-shallow-declined to re-enable)"
    New-Item -ItemType File -Path (Join-Path $Dir '.git/.start-shallow-declined') -Force | Out-Null
  }
}

Shallow-Check

Set-Location (Join-Path $Dir 'astro-doc-code')

$scriptArgs = @($args)

# Optional `clean` first arg — wipe caches, then either exit or continue
if ($scriptArgs.Count -gt 0 -and $scriptArgs[0] -eq 'clean') {
  $scriptArgs = @($scriptArgs | Select-Object -Skip 1)
  Write-Host "[start] cleaning caches: .astro/, dist/, node_modules/.vite/"
  foreach ($p in '.astro', 'dist', 'node_modules/.vite') {
    if (Test-Path $p) { Remove-Item -Recurse -Force $p }
  }
  if ($scriptArgs.Count -eq 0) {
    Write-Host "[start] clean done"
    exit 0
  }
  Write-Host "[start] clean done - continuing with: $($scriptArgs -join ' ')"
}

# 1. Pick a runner
if (Get-Command bun -ErrorAction SilentlyContinue) {
  $Runner = 'bun'
} elseif (Get-Command npm -ErrorAction SilentlyContinue) {
  $Runner = 'npm'
} else {
  Write-Host "[start] error: neither bun nor npm found on PATH - install one and retry"
  exit 1
}
Write-Host "[start] runner: $Runner"

# 2. Install if node_modules is missing OR the dependency manifests changed
#    since the last install. Stamp a hash of package.json + the runner's
#    lockfile into node_modules after each install; a mismatch (e.g. after
#    pulling a commit that adds a dependency) triggers a re-install. Mirrors
#    ./start (bash). Without this, a stale node_modules silently misses
#    newly-added deps until a build fails to resolve the import.
$Stamp = 'node_modules/.start-deps-stamp'
switch ($Runner) {
  'bun' { $Lockfile = 'bun.lock' }
  'npm' { $Lockfile = 'package-lock.json' }
  default { $Lockfile = $null }
}

function Get-DepsHash {
  # Hash package.json + the runner's lockfile (whichever exist) into one digest.
  $files = @('package.json', $Lockfile) | Where-Object { $_ -and (Test-Path $_) }
  $parts = foreach ($f in $files) { (Get-FileHash -Path $f -Algorithm SHA256).Hash }
  $bytes = [System.Text.Encoding]::UTF8.GetBytes(($parts -join ''))
  $sha   = [System.Security.Cryptography.SHA256]::Create()
  ($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString('x2') }) -join ''
}

# npm has no cross-project package dedup: every project carries its own full
# node_modules (~420 MB), while bun hardlinks from a global cache so N projects
# cost about one copy. Warn (red) before an npm install; confirm when
# interactive. Background: user-guide → Getting Started → Storage & Disk
# Footprint (05_getting-started/07_storage-and-footprint.md).
function Warn-NpmDisk {
  Write-Host "[start] WARNING: installing with npm - no cross-project dedup." -ForegroundColor Red
  Write-Host "[start] npm gives every project its own full node_modules (~420 MB each)." -ForegroundColor Red
  Write-Host "[start] bun hardlinks packages from a global cache, so N projects cost ~one copy." -ForegroundColor Red
  Write-Host "[start] Recommended fix: install bun (https://bun.sh) and re-run .\start.cmd." -ForegroundColor Red
  Write-Host "[start] Details: user-guide -> Getting Started -> Storage & Disk Footprint."
  if (-not [Console]::IsInputRedirected -and $env:START_SKIP_UPDATE_CHECK -ne '1') {
    $reply = Read-Host "[start] proceed with npm install anyway? [Y/n]"
    if ($reply -ne '' -and $reply -notmatch '^(?i)(y|yes)$') {
      Write-Host "[start] aborted - install bun and re-run .\start.cmd"
      exit 1
    }
  }
}

$needInstall = $null
if (-not (Test-Path 'node_modules')) {
  $needInstall = 'node_modules missing'
} elseif (-not (Test-Path $Stamp) -or ((Get-Content -Raw $Stamp).Trim() -ne (Get-DepsHash))) {
  $needInstall = 'dependency manifest changed since last install'
}
if ($needInstall) {
  if ($Runner -eq 'npm') { Warn-NpmDisk }
  Write-Host "[start] $needInstall - running '$Runner install'..."
  & $Runner install
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Set-Content -Path $Stamp -Value (Get-DepsHash) -NoNewline
}

# Explicit script — skip preflight, just forward
if ($scriptArgs.Count -gt 0) {
  & $Runner run @scriptArgs
  exit $LASTEXITCODE
}

# 3. Build sanity check before launching dev
Write-Host "[start] running build to catch errors before dev launch..."
& $Runner run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "[start] build failed - aborting before dev start"
  exit 1
}
Write-Host "[start] build clean"

# 4. Start dev
Write-Host "[start] launching dev server..."
& $Runner run dev
exit $LASTEXITCODE
