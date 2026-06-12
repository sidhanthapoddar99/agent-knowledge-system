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

# 2. Install if node_modules is missing
if (-not (Test-Path 'node_modules')) {
  Write-Host "[start] node_modules missing - running '$Runner install'..."
  & $Runner install
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
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
