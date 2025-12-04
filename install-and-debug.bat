@echo off
REM Install and Debug Release APK
REM This script installs the fixed release APK and captures crash logs

echo ====================================
echo Installing Fixed Release APK
echo ====================================
echo.

REM Find ADB in Android SDK
set ADB_PATH=
if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    set ADB_PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
) else if exist "%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe" (
    set ADB_PATH=%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe
) else (
    echo ERROR: ADB not found!
    echo Please install Android SDK Platform Tools
    echo Or add adb.exe to your PATH
    pause
    exit /b 1
)

echo Using ADB: %ADB_PATH%
echo.

REM Check for connected devices
echo Checking for connected devices...
"%ADB_PATH%" devices
echo.

REM Uninstall old version
echo Uninstalling old version (if exists)...
"%ADB_PATH%" uninstall com.diablock.game
echo.

REM Install new APK
echo Installing fixed release APK...
"%ADB_PATH%" install -r "apk\dia-block-game-release-fixed.apk"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Installation failed!
    pause
    exit /b 1
)

echo.
echo ====================================
echo Installation successful!
echo ====================================
echo.
echo Now starting logcat to capture crash logs...
echo Press Ctrl+C to stop logging
echo.
echo INSTRUCTIONS:
echo 1. Open the app on your device
echo 2. If it crashes, the log will show the error
echo 3. Press Ctrl+C to stop logging
echo 4. Send the log output to analyze the crash
echo.

REM Clear old logs and start capturing
"%ADB_PATH%" logcat -c
"%ADB_PATH%" logcat -s AndroidRuntime:E ActivityManager:I chromium:E *:F

pause
