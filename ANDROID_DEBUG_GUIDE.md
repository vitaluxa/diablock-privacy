# Android Debugging Guide

## Crash Fixes Applied (v1.2.1)

### Fixed Issues:
1. **Metadata Loading**: Made lazy and non-blocking with timeout to prevent crashes
2. **Error Handling**: Added comprehensive null checks and type validation
3. **Number Formatting**: Added safe toLocaleString() with fallbacks
4. **Memory Management**: Delayed metadata loading to prevent blocking app startup

## Debugging on Android Device

### Option 1: Using ADB (Android Debug Bridge)

1. **Enable USB Debugging on your device:**
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings > Developer Options
   - Enable "USB Debugging"

2. **Connect device and check:**
   ```bash
   adb devices
   ```

3. **View crash logs:**
   ```bash
   adb logcat | findstr "chromium\|WebView\|AndroidRuntime\|FATAL"
   ```

4. **Clear app data and reinstall:**
   ```bash
   adb uninstall com.diablock.game
   adb install app\build\outputs\apk\debug\app-debug.apk
   ```

### Option 2: Using Android Studio

1. Open Android Studio
2. Open the `android` folder as a project
3. Connect your device
4. Run the app in debug mode
5. Check Logcat for errors

### Option 3: Remote Debugging (Chrome DevTools)

1. On your Android device, open Chrome
2. Go to `chrome://inspect`
3. Find your app and click "inspect"
4. You can now debug JavaScript, view console logs, and inspect elements

## Common Crash Causes

1. **Memory Issues**: Loading large files (like levels.json)
   - **Fix**: Metadata loading is now lazy and non-blocking

2. **Null/Undefined Errors**: Missing null checks
   - **Fix**: Added comprehensive type checking

3. **Network Errors**: Failed fetch requests
   - **Fix**: Added timeout and error handling

4. **Number Formatting**: toLocaleString() not available
   - **Fix**: Added fallback to toString()

## Testing the Fix

1. Build new AAB:
   ```bash
   cd android
   .\build-with-proguard.bat
   ```

2. Upload to Google Play Console (Internal Testing)

3. Install on device and test:
   - App should start without crashing
   - Best moves should load in background (may take a few seconds)
   - Win modal should display correctly even if metadata isn't loaded yet

## If Still Crashing

1. Check device logs:
   ```bash
   adb logcat > crash.log
   ```

2. Look for:
   - `FATAL EXCEPTION`
   - `AndroidRuntime`
   - `OutOfMemoryError`
   - `NullPointerException`

3. Share the crash log for further debugging

