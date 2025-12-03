@echo off
echo ========================================
echo Building Release APK/AAB for Google Play
echo ========================================
echo.

REM Check if keystore.properties exists
if not exist "keystore.properties" (
    echo ERROR: keystore.properties not found!
    echo.
    echo Please follow these steps:
    echo 1. Run create-keystore.bat to create a keystore
    echo 2. Copy keystore.properties.example to keystore.properties
    echo 3. Fill in your keystore information in keystore.properties
    echo.
    pause
    exit /b 1
)

echo Building release AAB (Android App Bundle)...
echo This is the format required by Google Play Console.
echo.
call gradlew.bat bundleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Build successful!
    echo ========================================
    echo.
    echo Your release AAB is located at:
    echo   app\build\outputs\bundle\release\app-release.aab
    echo.
    echo You can now upload this file to Google Play Console.
    echo.
    
    REM Copy to apk folder
    if exist "app\build\outputs\bundle\release\app-release.aab" (
        if not exist "..\apk" mkdir "..\apk"
        copy "app\build\outputs\bundle\release\app-release.aab" "..\apk\dia-block-game-release.aab"
        echo AAB copied to: ..\apk\dia-block-game-release.aab
        echo.
    )
) else (
    echo.
    echo ========================================
    echo Build failed!
    echo ========================================
    echo.
    echo Check the error messages above for details.
    echo.
)

pause

