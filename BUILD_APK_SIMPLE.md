# Simple APK Build Instructions

## Quick Build Steps:

### 1. Accept Android SDK Licenses (One-time setup)

**Option A: Using Android Studio (Easiest)**
1. Open Android Studio
2. Open the `android` folder as a project
3. Go to **Tools → SDK Manager**
4. Accept all licenses when prompted
5. Install Android SDK Platform 35 and Build Tools 34.0.0 if missing

**Option B: Command Line**
1. Open PowerShell as Administrator
2. Run:
```powershell
cd "C:\Users\vital\AppData\Local\Android\Sdk"
.\cmdline-tools\latest\bin\sdkmanager.bat --licenses
```
3. Type `y` and press Enter for each license

### 2. Build the APK

Open PowerShell in the project folder and run:

```powershell
# Set Java path
$javaPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
$env:JAVA_HOME = $javaPath
$env:PATH = "$javaPath\bin;$env:PATH"

# Build APK
cd android
.\gradlew.bat assembleDebug
```

### 3. Copy APK to apk folder

After build succeeds:
```powershell
Copy-Item "app\build\outputs\apk\debug\app-debug.apk" -Destination "..\apk\dia-block-game.apk"
```

## Alternative: Use Android Studio GUI

1. Open Android Studio
2. File → Open → Select `android` folder
3. Wait for Gradle sync
4. Build → Build Bundle(s) / APK(s) → Build APK(s)
5. When done, find APK at: `android\app\build\outputs\apk\debug\app-debug.apk`
6. Copy to `apk` folder

## Troubleshooting

If licenses still fail, manually create license files:
```powershell
$sdkPath = "C:\Users\vital\AppData\Local\Android\Sdk\licenses"
mkdir $sdkPath -Force
"24333f8a63b6825ea9c5514f83c2829b004d1fee" | Out-File "$sdkPath\android-sdk-license" -NoNewline
"84831b9409646a918e30573bab4c9c91346d8abd" | Out-File "$sdkPath\android-sdk-preview-license" -NoNewline
"d975f751698a77b662f1254ddbeed3901e976f5a" | Out-File "$sdkPath\intel-android-extra-license" -NoNewline
"33b6a2b64607f11b759f320ef9dff4ae5c47d97a" | Out-File "$sdkPath\google-gdk-license" -NoNewline
"601085b94cd77f0b54ff86406957099ebe79c4d6" | Out-File "$sdkPath\android-googletv-license" -NoNewline
```

Then build again.




