@echo off
rem `agent-ks` — model-B dispatcher (collision-safe); forwards args verbatim (no basename prepend).
rem
rem BUN IS REQUIRED, and this refuses rather than falling back to node — the same
rem rule as the bash twin. There used to be a node fallback here. It cannot work:
rem frontmatter parsing uses `Bun.YAML`, which node has no equivalent of, so node
rem dies at the first command that reads a file. A fallback that always fails is
rem worse than none — it turns "install bun" into "debug a ReferenceError".
setlocal
set "CLI=%~dp0..\skills\agent-ks-docs\scripts\cli.mjs"
where bun >nul 2>nul
if not %errorlevel%==0 (
  echo agent-ks: bun is required and was not found on PATH.>&2
  echo   These scripts parse frontmatter with Bun.YAML, which node does not have,>&2
  echo   so there is no working fallback.>&2
  echo   Install: powershell -c "irm bun.sh/install.ps1^|iex">&2
  exit /b 127
)
bun "%CLI%" %*
exit /b
