@echo off
node "%~dp0scripts\run-quality-check.js" %*
exit /b %errorlevel%
