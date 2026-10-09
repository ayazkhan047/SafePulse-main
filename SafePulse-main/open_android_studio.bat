@echo off
setlocal
cd /d "%~dp0\SafePulse-main"
if not exist "android" (
  cd /d "%~dp0"
)
echo Opening SafePulse project in Android Studio...
npx cap open android
