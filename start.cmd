@echo off
rem Windows launcher for start.ps1 (bypasses PowerShell execution policy).
rem Note: invoke as .\start.cmd (or .\start) - bare `start` is a cmd built-in.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*
exit /b %errorlevel%
