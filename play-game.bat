@echo off
title Garden Defense - Local Server
cd /d "%~dp0"

echo ========================================================
echo   Dang khoi dong Garden Defense Game Server...
echo   Trinh duyet se tu dong mo sau 2 giay.
echo   Luu y: Khong dong cua so nay trong khi dang choi game!
echo ========================================================

start /b cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5173/"
npm run dev
pause
