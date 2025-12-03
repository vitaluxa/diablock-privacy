# Install Android SDK to Build APK

To build the APK, you need the Android SDK. Here are the options:

## Option 1: Install Android Studio (Easiest - Recommended)

1. Download from: https://developer.android.com/studio
2. Install it (includes Android SDK automatically)
3. Open Android Studio once to complete setup
4. Then build the APK:
   ```powershell
   cd android
   .\gradlew.bat assembleDebug
   ```

## Option 2: Install Android SDK Command Line Tools Only

### Quick Install Script:

1. Download Android Command Line Tools:
   - Go to: https://developer.android.com/studio#command-tools
   - Download "commandlinetools-win-xxx_latest.zip"

2. Extract to a folder:
   ```
   C:\Android\cmdline-tools
   ```

3. Run these commands in PowerShell (as Administrator):
   ```powershell
   $env:ANDROID_HOME = "C:\Android"
   $env:PATH += ";$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:ANDROID_HOME\platform-tools"
   
   # Accept licenses
   sdkmanager --licenses
   
   # Install required SDK components
   sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
   ```

4. Update `android/local.properties`:
   ```
   sdk.dir=C\:\\Android
   ```

5. Build APK:
   ```powershell
   cd android
   .\gradlew.bat assembleDebug
   ```

## Option 3: Use Pre-configured Build (If Available)

If you already have Android Studio installed, the SDK should be at:
- Windows: `C:\Users\YourUsername\AppData\Local\Android\Sdk`

Update `android/local.properties` with:
```
sdk.dir=C\:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

## After SDK Installation

Once Android SDK is installed, run:

```powershell
cd android
.\gradlew.bat assembleDebug
```

The APK will be created at: `android\app\build\outputs\apk\debug\app-debug.apk`

Copy it to the `apk` folder:
```powershell
Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" -Destination "apk\dia-block-game.apk"
```





