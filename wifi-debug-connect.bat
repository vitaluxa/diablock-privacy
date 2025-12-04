@echo off
REM WiFi Debugging Helper Script
REM This script helps connect to your Android device via WiFi debugging

echo ====================================
echo WiFi Debugging - Device Connection
echo ====================================
echo.

REM Find ADB
set ADB_PATH=
if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    set ADB_PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
) else if exist "%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe" (
    set ADB_PATH=%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe
) else (
    echo ERROR: ADB not found!
    echo.
    echo Please install Android SDK Platform Tools from:
    echo https://developer.android.com/studio/releases/platform-tools
    pause
    exit /b 1
)

echo Using ADB: %ADB_PATH%
echo.

REM List currently connected devices
echo Current devices:
"%ADB_PATH%" devices -l
echo.

REM Offer to connect to a device
echo ====================================
echo To connect via WiFi debugging:
echo ====================================
echo.
echo 1. On your phone, enable Developer Options
echo 2. Enable "Wireless debugging"
echo 3. Tap "Pair device with pairing code"
echo 4. Note the IP address and port (e.g., 192.168.1.100:12345)
echo.
echo OR if already paired:
echo 1. Just note the IP address and port shown in "Wireless debugging"
echo.

set /p CONNECT_CHOICE="Do you want to connect to a device? (y/n): "
if /i "%CONNECT_CHOICE%"=="y" (
    echo.
    set /p DEVICE_IP="Enter device IP and port (e.g., 192.168.1.100:37777): "
    echo.
    echo Connecting to !DEVICE_IP!...
    "%ADB_PATH%" connect !DEVICE_IP!
    echo.
    echo Updated device list:
    "%ADB_PATH%" devices -l
)

echo.
pause
