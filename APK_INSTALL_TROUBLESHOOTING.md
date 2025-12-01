# APK Installation Troubleshooting

If the APK is not installing on your Android phone, try these steps:

## Step 1: Verify File Transfer

1. **Check file size**: The APK should be about 4 MB
2. **Verify file extension**: Make sure it ends with `.apk` (not `.apk.txt` or `.apk.zip`)
3. **Try different transfer methods**:
   - USB cable (most reliable)
   - Google Drive / Dropbox
   - Email attachment
   - ADB install (see below)

## Step 2: Enable Installation from Unknown Sources

1. Go to **Settings** → **Security** (or **Privacy**)
2. Enable **"Install from Unknown Sources"** or **"Unknown Sources"**
3. On newer Android versions:
   - Go to **Settings** → **Apps** → **Special access** → **Install unknown apps**
   - Select your file manager or browser
   - Enable **"Allow from this source"**

## Step 3: Try Installing via ADB (Recommended)

If file manager installation doesn't work, use ADB:

1. **Enable USB Debugging** on your phone:
   - Go to **Settings** → **About Phone**
   - Tap **Build Number** 7 times to enable Developer Options
   - Go to **Settings** → **Developer Options**
   - Enable **USB Debugging**

2. **Install ADB on your computer** (if not already installed):
   - Download Android Platform Tools from: https://developer.android.com/tools/releases/platform-tools
   - Extract to a folder and add to PATH

3. **Install APK via ADB**:
   ```powershell
   adb devices                    # Check if phone is connected
   adb install apk\dia-block-game.apk
   ```

## Step 4: Check Phone Storage

- Make sure you have enough storage space
- Try installing to internal storage (not SD card)

## Step 5: Check Android Version Compatibility

The APK requires **Android 6.0 (API 23)** or higher. Check your Android version:
- **Settings** → **About Phone** → **Android Version**

## Step 6: Alternative Installation Method

1. **Use Chrome browser**:
   - Upload APK to Google Drive
   - Open in Chrome on your phone
   - Download and install

2. **Use a different file manager**:
   - Try installing with **FX File Manager** or **Solid Explorer**
   - Some default file managers have restrictions

## Step 7: Check APK File

If nothing works, verify the APK:
1. The APK should open with WinRAR/7-Zip on Windows (it's a ZIP file)
2. It should contain folders like: `META-INF`, `AndroidManifest.xml`, `classes.dex`

## Common Errors and Solutions

**"App not installed"**
- Clear cache of Package Installer app
- Restart phone and try again
- Check if another app with same package name exists

**"Parse Error"**
- File might be corrupted - re-download/transfer
- Check if APK file size matches (should be ~4 MB)

**Nothing happens when tapping APK**
- Enable "Unknown Sources" permission for your file manager
- Try a different file manager app
- Use ADB install method instead

## Quick ADB Install Script

Create a file `install-apk.bat` in project root:

```batch
@echo off
echo Installing Dia Block APK to connected device...
adb devices
adb install -r apk\dia-block-game.apk
pause
```

Then connect your phone via USB and run the script.




