@echo off
REM Thin shim. The implementation is scripts\start.mjs — one file, all platforms.
REM Note the leading .\ when typing this: bare `start` is a cmd builtin.
setlocal
where /q bun && (bun "%~dp0scripts\start.mjs" %* & exit /b %errorlevel%)
where /q node && (node "%~dp0scripts\start.mjs" %* & exit /b %errorlevel%)
echo [start] error: neither bun nor node found on PATH - install one and retry 1>&2
exit /b 1
