@echo off
echo Building Dia Block APK...
echo.

REM Check if Android Studio/Gradle is available
if exist "android\gradlew.bat" (
    echo Found Gradle wrapper...
    cd android
    call gradlew.bat assembleDebug
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo Build successful!
        echo Copying APK to apk folder...
        if not exist "..\apk" mkdir "..\apk"
        copy /Y "app\build\outputs\apk\debug\app-debug.apk" "..\apk\dia-block-game.apk"
        echo.
        echo APK copied to: apk\dia-block-game.apk
        echo.
        echo You can now install this APK on your Android device!
    ) else (
        echo.
        echo Build failed. Make sure you have:
        echo 1. Java JDK installed
        echo 2. Android SDK installed
        echo 3. JAVA_HOME environment variable set
        echo.
        echo Or use Android Studio instead (see BUILD_APK_GUIDE.md)
    )
    cd ..
) else (
    echo.
    echo Android project not found or Gradle wrapper missing.
    echo Please run: npm exec cap add android
    echo.
)

pause





