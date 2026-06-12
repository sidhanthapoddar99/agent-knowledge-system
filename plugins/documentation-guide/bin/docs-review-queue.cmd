@echo off
rem Generic shim - routes via its own filename through the shared cli.mjs dispatcher.
setlocal
set "CLI=%~dp0..\skills\documentation-guide\scripts\cli.mjs"
where bun >nul 2>nul
if %errorlevel%==0 (
  bun "%CLI%" %~n0 %*
) else (
  node "%CLI%" %~n0 %*
)
exit /b
