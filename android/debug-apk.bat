@echo off
echo ========================================
echo Building Debug APK for Testing
echo ========================================
echo.

cd app
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: Gradle build failed.
    exit /b %errorlevel%
)
cd ..

echo.
echo ========================================
echo Debug APK built successfully!
echo ========================================
echo.
echo APK location: app\build\outputs\apk\debug\app-debug.apk
echo.
echo To install on connected device:
echo   adb install app\build\outputs\apk\debug\app-debug.apk
echo.
echo To view logs:
echo   adb logcat | findstr "chromium\|WebView\|AndroidRuntime"
echo.



