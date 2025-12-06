@echo off
echo ========================================
echo Building Release AAB with R8/ProGuard
echo ========================================
echo.
echo This will build with code obfuscation enabled.
echo The mapping file will be generated for crash reporting.
echo.

cd android

REM Check if keystore.properties exists
if not exist "keystore.properties" (
    echo ERROR: keystore.properties not found!
    echo.
    echo Please make sure keystore.properties exists.
    echo.
    pause
    exit /b 1
)

echo Building release AAB with R8/ProGuard...
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
    echo IMPORTANT: The mapping file for deobfuscation is at:
    echo   app\build\outputs\mapping\release\mapping.txt
    echo.
    echo Upload BOTH files to Google Play Console:
    echo   1. The AAB file (app-release.aab)
    echo   2. The mapping file (mapping.txt) - upload in the "App bundles" section
    echo.
    
    REM Copy to apk folder
    if exist "app\build\outputs\bundle\release\app-release.aab" (
        if not exist "..\apk" mkdir "..\apk"
        copy "app\build\outputs\bundle\release\app-release.aab" "..\apk\dia-block-game-release.aab"
        echo AAB copied to: ..\apk\dia-block-game-release.aab
        echo.
    )
    
    REM Copy mapping file
    if exist "app\build\outputs\mapping\release\mapping.txt" (
        copy "app\build\outputs\mapping\release\mapping.txt" "..\apk\mapping.txt"
        echo Mapping file copied to: ..\apk\mapping.txt
        echo.
        echo IMPORTANT: Upload mapping.txt to Google Play Console!
        echo Go to: App bundles section - Upload deobfuscation file
        echo.
    )
) else (
    echo.
    echo ========================================
    echo Build failed!
    echo ========================================
    echo.
    echo Check the error messages above for details.
    echo If you see ProGuard errors, check proguard-rules.pro
    echo.
)

pause



