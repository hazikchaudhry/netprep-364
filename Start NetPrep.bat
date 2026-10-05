@echo off
cd /d "%~dp0"
echo.
echo  NetPrep 364 is starting. Your browser will open in a moment.
echo  Leave this window open while you study. Close it to stop.
echo.
start "" "http://localhost:5173/"
call npm run dev
pause
