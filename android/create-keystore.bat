@echo off
echo ========================================
echo Creating Release Keystore for Android
echo ========================================
echo.
echo This script will create a keystore file for signing your release APK/AAB.
echo You will need to provide:
echo   - Keystore password (remember this!)
echo   - Key alias (usually your app name)
echo   - Key password (can be same as keystore password)
echo   - Your name/organization info
echo.
echo IMPORTANT: Keep the keystore file and passwords safe!
echo            You'll need them for all future updates to Google Play.
echo.
pause

set KEYSTORE_PATH=app\release.keystore
set KEY_ALIAS=dia-block-game

echo.
echo Creating keystore at: %KEYSTORE_PATH%
echo Key alias: %KEY_ALIAS%
echo.

keytool -genkey -v -keystore %KEYSTORE_PATH% -alias %KEY_ALIAS% -keyalg RSA -keysize 2048 -validity 10000

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Keystore created successfully!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Copy the keystore.properties.example to keystore.properties
    echo 2. Fill in your keystore information
    echo 3. Build your release APK/AAB
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Failed to create keystore
    echo ========================================
    echo.
    echo Make sure Java JDK is installed and keytool is in your PATH
    echo.
)

pause

