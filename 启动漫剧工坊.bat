@echo off
setlocal EnableExtensions
title AI Short Drama Workbench

cd /d "%~dp0"

echo.
echo   ========================================
echo       AI Short Drama Workbench Launcher
echo   ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found.
  echo Install Node.js 20 or newer from https://nodejs.org/
  echo Then double-click this launcher again.
  echo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found. Reinstall Node.js and try again.
  echo.
  pause
  exit /b 1
)

if /I "%~1"=="--check" (
  echo [OK] Node.js:
  node --version
  echo [OK] npm:
  call npm --version
  echo [OK] Project directory: %CD%
  exit /b 0
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:4173/api/health' -TimeoutSec 1; if ($r.StatusCode -eq 200) { exit 0 } } catch {}; exit 1" >nul 2>nul
if not errorlevel 1 (
  echo [READY] The workbench is already running. Opening the browser...
  start "" "http://127.0.0.1:4173"
  timeout /t 2 /nobreak >nul
  exit /b 0
)

if not exist "node_modules\" (
  echo [SETUP] First run detected. Installing dependencies...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] Dependency installation failed. Check the network and npm settings.
    pause
    exit /b 1
  )
  echo.
)

echo [START] Starting http://127.0.0.1:4173
echo [INFO] The browser will open automatically when the server is ready.
echo [INFO] Keep this window open. Press Ctrl+C or close it to stop the server.
echo.

start "" /b powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command "$url='http://127.0.0.1:4173'; for ($i=0; $i -lt 120; $i++) { try { $r=Invoke-WebRequest -UseBasicParsing -Uri ($url + '/api/health') -TimeoutSec 1; if ($r.StatusCode -eq 200) { Start-Process $url; exit 0 } } catch {}; Start-Sleep -Milliseconds 500 }; exit 1"

call npm run dev

echo.
echo [STOPPED] The workbench server has stopped.
pause
endlocal
