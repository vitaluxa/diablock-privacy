# How to Build APK for Android

Your Android project is ready! Here are two methods to build the APK:

## Method 1: Using Android Studio (Recommended - Easier)

### Step 1: Install Android Studio
1. Download Android Studio from: https://developer.android.com/studio
2. Install it (it includes Java JDK and Android SDK)

### Step 2: Open Project in Android Studio
1. Open Android Studio
2. Click "Open an Existing Project"
3. Navigate to `D:\Downloads\temp\testgame\android`
4. Click "OK"

### Step 3: Build APK
1. Wait for Gradle sync to complete (may take a few minutes first time)
2. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for build to complete
4. When done, click "locate" in the notification

### Step 4: Copy APK to apk folder
1. The APK will be at: `android\app\build\outputs\apk\debug\app-debug.apk`
2. Copy it to the `apk` folder in your project root

### Alternative: Generate Signed APK (for Play Store)
1. Go to **Build** → **Generate Signed Bundle / APK**
2. Choose **APK**
3. Create a keystore (first time) or use existing
4. Select **release** build variant
5. Build and copy to `apk` folder

## Method 2: Command Line (Requires Java & Android SDK)

### Step 1: Install Java JDK
1. Download JDK 17 or later from: https://adoptium.net/
2. Install it
3. Set JAVA_HOME environment variable:
   - Windows: Add to System Environment Variables
   - Path: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot` (or your JDK path)

### Step 2: Install Android SDK Command Line Tools
1. Download from: https://developer.android.com/studio#command-tools
2. Extract to a folder (e.g., `C:\Android\sdk`)
3. Set ANDROID_HOME environment variable to SDK path

### Step 3: Build APK
Open PowerShell in the project root and run:

```powershell
cd android
.\gradlew.bat assembleDebug
```

### Step 4: Copy APK
After build completes:
```powershell
Copy-Item "app\build\outputs\apk\debug\app-debug.apk" -Destination "..\apk\dia-block-game.apk"
```

## Quick Method: Use Pre-built APK Builder Service

If you don't want to install Android Studio, you can use online services:

1. **Capacitor Cloud Build** (if available)
2. **GitHub Actions** - I can set this up for you
3. **Local Build Service** - Some cloud IDEs support this

## Important Notes

- **Debug APK**: Can be installed directly on your phone (no signing required)
- **Release APK**: Requires signing for Play Store distribution
- **First Build**: May take 10-20 minutes (downloads dependencies)
- **Subsequent Builds**: Much faster (1-2 minutes)

## Installing APK on Your Phone

1. Enable **Developer Options** on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   
2. Enable **USB Debugging**:
   - Settings → Developer Options → USB Debugging

3. Transfer APK to phone:
   - Copy `apk/dia-block-game.apk` to your phone
   - Open file manager on phone
   - Tap the APK file
   - Allow installation from unknown sources if prompted
   - Install

## Troubleshooting

**"Gradle sync failed"**
- Check internet connection (Gradle downloads dependencies)
- Try: File → Invalidate Caches / Restart

**"SDK not found"**
- In Android Studio: Tools → SDK Manager → Install missing SDKs

**"Build failed"**
- Check the error message in Build output
- Make sure all dependencies are synced

**APK doesn't install on phone**
- Make sure USB Debugging is enabled
- Check if phone allows installation from unknown sources
- Try a different USB cable/port

## Next Steps

Once you have the APK:
1. Test it on your phone
2. Add your music files to `public/music/` before building
3. For Play Store: Generate a signed release APK

Your Android project is located at: `android/`
Built APKs should go in: `apk/`




