@echo off
rem `docs-guide` — model-B dispatcher (collision-safe); forwards args verbatim (no basename prepend).
setlocal
set "CLI=%~dp0..\skills\documentation-guide\scripts\cli.mjs"
where bun >nul 2>nul
if %errorlevel%==0 (
  bun "%CLI%" %*
) else (
  node "%CLI%" %*
)
exit /b
