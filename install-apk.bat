@echo off
echo ====================================
echo Dia Block APK Installer
echo ====================================
echo.
echo Make sure your phone is connected via USB
echo and USB Debugging is enabled.
echo.
pause
echo.
echo Checking for connected devices...
adb devices
echo.
echo Installing APK...
adb install -r apk\dia-block-game.apk
echo.
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ??? SUCCESS! App installed on your device!
) else (
    echo.
    echo ??? Installation failed. Check error messages above.
    echo.
    echo Troubleshooting:
    echo 1. Make sure USB Debugging is enabled on your phone
    echo 2. Accept the USB Debugging prompt on your phone
    echo 3. Check that ADB drivers are installed
)
echo.
pause
