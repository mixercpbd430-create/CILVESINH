@echo off
echo ========================================
echo   Ve Sinh May Moc - Starting Server...
echo ========================================
cd /d "%~dp0"
start http://localhost:3000
node server.js
pause
