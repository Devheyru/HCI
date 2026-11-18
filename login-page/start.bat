@echo off
cd /d "%~dp0"
if exist "C:\Users\Heyru\scoop\apps\postgresql\current\data\postmaster.pid" (
    tasklist /fi "imagename eq postgres.exe" | findstr /i "postgres.exe" >nul || del /f /q "C:\Users\Heyru\scoop\apps\postgresql\current\data\postmaster.pid"
)
start "" /b postgres -D "C:\Users\Heyru\scoop\apps\postgresql\current\data" -p 5433
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"
node backend/server.js
pause
