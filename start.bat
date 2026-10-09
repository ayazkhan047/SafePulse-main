@echo off
setlocal enabledelayedexpansion
title SafePulse - Emergency Response System

echo ============================================================
echo         SafePulse - Data-Driven Emergency Response
echo ============================================================
echo.

:: Detect project directory
if exist "backend\run.py" (
    set "PROJECT_DIR=%CD%"
) else if exist "SafePulse-main\backend\run.py" (
    cd "SafePulse-main"
    set "PROJECT_DIR=%CD%"
) else (
    echo [ERROR] Could not locate backend\run.py!
    echo Please make sure start.bat is in the SafePulse project directory.
    pause
    exit /b 1
)

:: Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python was not found on your system PATH!
    echo Please install Python 3.10 or higher and check "Add Python to PATH".
    echo Download: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [OK] Python detected:
python --version
echo.

:: Install / Verify dependencies
echo [INFO] Checking and installing required dependencies...
if exist "requirements.txt" (
    python -m pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Dependency installation encountered an issue.
        pause
        exit /b 1
    )
) else (
    echo [WARNING] requirements.txt not found. Installing core packages directly...
    python -m pip install fastapi "uvicorn[standard]" pydantic numpy pandas
)

echo.
echo ============================================================
echo  SafePulse is starting!
echo  Local URL:   http://127.0.0.1:8000
echo  Swagger API: http://127.0.0.1:8000/docs
echo ============================================================
echo.

:: Automatically open browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://127.0.0.1:8000"

:: Start backend server
python backend\run.py

if errorlevel 1 (
    echo.
    echo [ERROR] Server exited with an error.
    pause
)
