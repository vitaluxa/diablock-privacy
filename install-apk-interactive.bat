@echo off
echo ============================================
echo   Dia Block APK Installer (Interactive)
echo ============================================
echo.
echo Step 1: Make sure your phone is connected via USB
echo Step 2: Enable USB Debugging on your phone
echo.
pause
echo.
echo Checking for connected devices...
echo.
adb devices
echo.
echo ============================================
echo IMPORTANT: If you see "unauthorized" above,
echo look at your phone screen and:
echo   1. Accept the "Allow USB debugging?" prompt
echo   2. Check "Always allow from this computer"
echo   3. Tap OK/Allow
echo ============================================
echo.
pause
echo.
echo Checking device authorization again...
echo.
adb devices
echo.
echo Attempting to install APK...
echo.
adb install -r apk\dia-block-game.apk
echo.
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo   SUCCESS! App installed!
    echo ============================================
    echo.
    echo The Dia Block game should now be on your phone!
    echo.
) else (
    echo.
    echo ============================================
    echo   Installation Failed
    echo ============================================
    echo.
    echo Troubleshooting:
    echo 1. Make sure USB Debugging is enabled
    echo 2. Accept the USB debugging prompt on phone
    echo 3. Try unplugging and replugging USB cable
    echo 4. Check that the APK file exists: apk\dia-block-game.apk
    echo.
)
echo.
pause





