# Entrypoint for the astro-doc-code framework — Windows port of ./start (bash).
# Invoke via .\start.cmd (wrapper bypasses execution policy) or .\start.ps1 directly.
#
# Usage:
#   .\start.cmd                 preflight (update check → install if needed → build sanity check) → dev server
#   .\start.cmd <script>        skip preflight, just run the named script (dev | build | preview | astro …)
#   .\start.cmd clean           wipe build caches (.astro, dist, node_modules/.vite) and exit
#   .\start.cmd clean <script>  wipe caches, then run the script (e.g. '.\start.cmd clean dev')
#
#   .\start.cmd stop   [dev|preview]            stop a running server (default: both)
#   .\start.cmd status [dev|preview]            is anything running, and where (default: both)
#   .\start.cmd logs   [dev|preview] [--follow] read a running server's output (default: dev)
#
# Skip the update check with: $env:START_SKIP_UPDATE_CHECK = '1' (e.g. in CI).

$Dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Framework = Join-Path $Dir 'astro-doc-code'

# ── runner ────────────────────────────────────────────────────────────────────
# Silent on purpose: the server-control verbs need the runner before there is
# anything worth announcing. The launch paths print it themselves.
function Get-Runner {
  if (Get-Command bun -ErrorAction SilentlyContinue) { return 'bun' }
  if (Get-Command npm -ErrorAction SilentlyContinue) { return 'npm' }
  Write-Host "[start] error: neither bun nor npm found on PATH - install one and retry"
  exit 1
}

# ── server control ────────────────────────────────────────────────────────────
# Astro owns the dev/preview server's lifecycle: it writes a per-project lock
# file and exposes `stop` / `status` / `logs` against it, and everything here
# goes through that CLI rather than through the process tree.
#
# The reason is specific. `astro dev` re-spawns itself as a detached daemon when
# it detects an AI-agent environment; the process you launched is then the
# launcher, not the server, and killing it leaves the server holding its port
# and its heap, invisible to whoever started it. `astro … stop` resolves the
# server through the lock file, so it is right in every case.
function Invoke-AstroSrv {          # Invoke-AstroSrv <dev|preview> <args…>
  param([string]$Cmd, [string[]]$Rest)
  Push-Location $Framework
  try { & $script:Runner run astro -- $Cmd @Rest }
  finally { Pop-Location }
}

# Is a <dev|preview> server up?
#
# `astro <cmd> status` prints the server's URL when one is running and a plain
# sentence when none is, wrapping either in JSON when --json is on (an agent
# environment forces it on). A URL is the one token present in every running
# form and absent from every idle one.
#
# NEVER match on the startup banner. In Astro 7 that banner is a JSON object, so
# anything grepping for the old `astro v5.x ready in NNN ms` text does not fail
# — it waits forever for a line that will never come.
function Test-SrvRunning {          # Test-SrvRunning <dev|preview>
  param([string]$Cmd)
  if (-not (Test-Path (Join-Path $Framework 'node_modules'))) { return $false }
  $out = (Invoke-AstroSrv $Cmd @('status') 2>&1 | Out-String)
  return $out -match 'https?://'
}

# Stop a server, allowing for one that has not finished starting yet.
#
# Astro's launcher spawns the real server DETACHED. An interrupt during the
# startup window therefore kills the launcher and never reaches the server,
# which goes on booting and registers itself a second or two later — a live
# server nobody is watching. So a stop issued mid-launch waits for the late
# arrival instead of declaring victory over an empty lock file.
function Stop-Server {              # Stop-Server <dev|preview>
  param([string]$Cmd)
  Invoke-AstroSrv $Cmd @('stop') 2>&1 | Out-Null

  if ($script:SrvLaunching) {
    Write-Host "[start] interrupted mid-launch - waiting for the detached $Cmd server to register so it can be stopped"
    # Astro's own launcher gives a server 30s to come up; allow a little more.
    for ($i = 0; $i -lt 35; $i++) {
      if (Test-SrvRunning $Cmd) { break }
      Start-Sleep -Seconds 1
    }
    if (Test-SrvRunning $Cmd) { Invoke-AstroSrv $Cmd @('stop') 2>&1 | Out-Null }
  }

  if (Test-SrvRunning $Cmd) {
    Write-Host "[start] warning: a $Cmd server is STILL running - '.\start.cmd status' shows it, '.\start.cmd stop' stops it"
  } else {
    Write-Host "[start] $Cmd server stopped"
  }
}

# Start (or attach to) a server and hold this terminal on it.
#
# THE CONTRACT IS UNCHANGED: this occupies your terminal, streams the server's
# output, and Ctrl-C stops the server. What changed is how that is enforced —
# the wrapper starts the daemon deliberately (--background, the same code path
# in every environment, rather than letting Astro decide) and stops it from a
# finally block. Nothing depends on the process tree, which is the assumption
# Astro 7 broke.
#
# Attaching to a server this invocation did not start is READ-ONLY: Ctrl-C
# detaches and says so. You stop what you started.
function Start-ServerAndFollow {    # Start-ServerAndFollow <dev|preview> [extra flags…]
  param([string]$Cmd, [string[]]$Extra)

  $owned = -not (Test-SrvRunning $Cmd)
  $script:SrvLaunching = $false

  try {
    Write-Host "[start] launching $Cmd server..."
    $script:SrvLaunching = $true
    & $script:Runner run $Cmd -- --background @Extra
    if ($LASTEXITCODE -ne 0) {
      # A plain launcher failure leaves nothing behind — Astro's own launcher
      # SIGTERMs the child and clears the lock file when it gives up — so drop
      # the mid-launch flag and let the finally block exit without waiting 35s
      # for a server that is never coming.
      $script:SrvLaunching = $false
      Write-Host "[start] $Cmd server failed to start"
      exit 1
    }
    $script:SrvLaunching = $false

    Write-Host ""
    Invoke-AstroSrv $Cmd @('status')
    if ($owned) {
      Write-Host "[start] Ctrl-C stops it.  Elsewhere: .\start.cmd stop | .\start.cmd status | .\start.cmd logs"
    } else {
      Write-Host "[start] a $Cmd server was already running - this terminal is FOLLOWING it, not owning it."
      Write-Host "[start] Ctrl-C detaches; '.\start.cmd stop' stops the server."
    }
    Write-Host ""

    # Blocks until the server goes away or the user interrupts. Astro's follower
    # exits by itself once the server it watches is gone, so a crashed server
    # unwinds this on its own.
    Invoke-AstroSrv $Cmd @('logs', '--follow')
  }
  finally {
    if ($owned) {
      Write-Host ""
      Write-Host "[start] stopping $Cmd server..."
      Stop-Server $Cmd
    } else {
      Write-Host ""
      Write-Host "[start] detached - the $Cmd server is still running ('.\start.cmd stop' stops it)"
    }
  }
}

# ── server-control verbs, before any preflight ────────────────────────────────
# '.\start.cmd status' must answer instantly and must never prompt to pull,
# install, or build — it is the command you reach for when you suspect
# something is already running.
$topArgs = @($args)
if ($topArgs.Count -gt 0 -and @('stop', 'status', 'logs') -contains $topArgs[0]) {
  $script:Runner = Get-Runner
  $verb = $topArgs[0]
  $rest = @($topArgs | Select-Object -Skip 1)
  if ($verb -eq 'logs') { $targets = @('dev') } else { $targets = @('dev', 'preview') }
  if ($rest.Count -gt 0 -and @('dev', 'preview') -contains $rest[0]) {
    $targets = @($rest[0])
    $rest = @($rest | Select-Object -Skip 1)
  }
  if (-not (Test-Path (Join-Path $Framework 'node_modules'))) {
    Write-Host "[start] dependencies are not installed - no server can be running"
    exit 0
  }
  foreach ($t in $targets) { Invoke-AstroSrv $t $rest }
  exit 0
}

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
  # resolve the real git dir (works for worktrees/submodules where .git is a file)
  $gitDir = & git -C $Dir rev-parse --absolute-git-dir 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $gitDir) { return }
  if (Test-Path (Join-Path $gitDir '.start-shallow-declined')) { return }

  # Consumer mode iff CONFIG_DIR resolves outside the framework folder.
  $envFile = Join-Path $Dir '.env'
  if (-not (Test-Path $envFile)) { return }
  $configLine = (Get-Content $envFile | Where-Object { $_ -match '^CONFIG_DIR=' } | Select-Object -Last 1)
  if (-not $configLine) { return }
  $configDir = (($configLine -replace '^CONFIG_DIR=', '') -replace '\s*#.*$', '').Trim().Trim('"', "'")
  try { $resolved = (Resolve-Path (Join-Path $Dir $configDir) -ErrorAction Stop).Path } catch { return }
  $dirResolved = (Resolve-Path $Dir).Path
  if ($resolved -eq $dirResolved -or $resolved.StartsWith($dirResolved + [IO.Path]::DirectorySeparatorChar)) { return }  # dogfood

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
    New-Item -ItemType File -Path (Join-Path $gitDir '.start-shallow-declined') -Force -ErrorAction SilentlyContinue | Out-Null
  }
}

Shallow-Check

Set-Location $Framework

$script:Runner = Get-Runner
$scriptArgs = @($args)

# Optional `clean` first arg — wipe caches, then either exit or continue
if ($scriptArgs.Count -gt 0 -and $scriptArgs[0] -eq 'clean') {
  $scriptArgs = @($scriptArgs | Select-Object -Skip 1)
  # `.astro\` is where Astro keeps the dev and preview LOCK FILES. Wiping it
  # under a running server orphans that server outright: `astro dev stop` can no
  # longer find it, and it keeps its port and its heap until someone goes
  # hunting for the pid. Stop first, then clean.
  foreach ($t in @('dev', 'preview')) {
    if (Test-SrvRunning $t) {
      Write-Host "[start] a $t server is running - stopping it before wiping .astro\ (its lock file lives there)"
      Stop-Server $t
    }
  }
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

Write-Host "[start] runner: $script:Runner"

# 2. Install if node_modules is missing OR the dependency manifests changed
#    since the last install. Stamp a hash of package.json + the runner's
#    lockfile into node_modules after each install; a mismatch (e.g. after
#    pulling a commit that adds a dependency) triggers a re-install. Mirrors
#    ./start (bash). Without this, a stale node_modules silently misses
#    newly-added deps until a build fails to resolve the import.
$Stamp = 'node_modules/.start-deps-stamp'
switch ($script:Runner) {
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
  if ($script:Runner -eq 'npm') { Warn-NpmDisk }
  Write-Host "[start] $needInstall - running '$script:Runner install'..."
  & $script:Runner install
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Set-Content -Path $Stamp -Value (Get-DepsHash) -NoNewline
}

# Explicit script — skip preflight, just forward. `dev` and `preview` are the
# two that start a server, so they go through Start-ServerAndFollow; everything
# else is a plain script and is run as before.
if ($scriptArgs.Count -gt 0) {
  if (@('dev', 'preview') -contains $scriptArgs[0]) {
    Start-ServerAndFollow $scriptArgs[0] @($scriptArgs | Select-Object -Skip 1)
    exit 0
  }
  & $script:Runner run @scriptArgs
  exit $LASTEXITCODE
}

# 3. Build sanity check before launching dev
Write-Host "[start] running build to catch errors before dev launch..."
& $script:Runner run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "[start] build failed - aborting before dev start"
  exit 1
}
Write-Host "[start] build clean"

# 4. Start dev
Start-ServerAndFollow 'dev' @()
exit 0
