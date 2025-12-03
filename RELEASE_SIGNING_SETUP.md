# Release Signing Setup for Google Play

This guide will help you set up release signing so you can upload your app to Google Play Console.

## The Problem

Google Play Console requires apps to be signed with a **release keystore**, not the debug keystore. The error you're seeing means your app was built with debug signing.

## Solution: Set Up Release Signing

### Step 1: Create a Release Keystore

1. Open PowerShell or Command Prompt
2. Navigate to the `android` folder:
   ```powershell
   cd android
   ```
3. Run the keystore creation script:
   ```powershell
   .\create-keystore.bat
   ```
4. When prompted, enter:
   - **Keystore password**: Choose a strong password (remember this!)
   - **Re-enter password**: Enter the same password
   - **Key alias**: `dia-block-game` (or press Enter for default)
   - **Key password**: Can be same as keystore password (or different)
   - **Validity**: Press Enter for default (10000 days)
   - **Your name**: Enter your name or organization
   - **Organizational Unit**: Press Enter or enter department
   - **Organization**: Enter your organization name
   - **City/Locality**: Enter your city
   - **State/Province**: Enter your state
   - **Country code**: Enter 2-letter code (e.g., US, GB, etc.)

**IMPORTANT**: 
- Save the keystore file and passwords in a secure location
- You'll need the same keystore for ALL future updates to Google Play
- If you lose the keystore, you cannot update your app on Google Play

### Step 2: Configure Keystore Properties

1. In the `android` folder, copy the example file:
   ```powershell
   copy keystore.properties.example keystore.properties
   ```

2. Open `keystore.properties` in a text editor and fill in:
   ```
   storeFile=app/release.keystore
   storePassword=YOUR_KEYSTORE_PASSWORD
   keyAlias=dia-block-game
   keyPassword=YOUR_KEY_PASSWORD
   ```
   Replace `YOUR_KEYSTORE_PASSWORD` and `YOUR_KEY_PASSWORD` with the passwords you used when creating the keystore.

3. **IMPORTANT**: Add `keystore.properties` to `.gitignore` to avoid committing your passwords:
   ```
   android/keystore.properties
   android/app/release.keystore
   ```

### Step 3: Build Release AAB

1. Make sure you're in the `android` folder
2. Run the release build script:
   ```powershell
   .\build-release.bat
   ```

   Or manually:
   ```powershell
   .\gradlew.bat bundleRelease
   ```

3. The release AAB will be created at:
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```

### Step 4: Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Go to **Production** (or **Testing** → **Internal testing**)
4. Click **Create new release**
5. Upload the `app-release.aab` file
6. Fill in release notes
7. Review and publish

## Alternative: Build Release APK

If you need an APK instead of AAB:

```powershell
cd android
.\gradlew.bat assembleRelease
```

The APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

**Note**: Google Play prefers AAB format, but APK works too.

## Troubleshooting

### "keystore.properties not found"
- Make sure you copied `keystore.properties.example` to `keystore.properties`
- Make sure you're in the `android` folder when running the build

### "Keystore was tampered with, or password was incorrect"
- Double-check your passwords in `keystore.properties`
- Make sure there are no extra spaces or quotes

### "keytool: command not found"
- Make sure Java JDK is installed
- Add Java bin directory to your PATH, or use full path to keytool

### Build still uses debug signing
- Check that `keystore.properties` exists in the `android` folder (not in `android/app`)
- Verify the file paths in `keystore.properties` are correct
- Make sure the keystore file exists at the path specified

## Security Best Practices

1. **Never commit** `keystore.properties` or `release.keystore` to version control
2. **Backup** your keystore file and passwords in a secure location (password manager, encrypted storage)
3. **Use strong passwords** for your keystore
4. **Keep the keystore safe** - losing it means you can't update your app on Google Play

## What Changed

The `build.gradle` file has been updated to:
- Load keystore properties from `keystore.properties`
- Use release signing configuration when building release versions
- Fall back to debug signing with a warning if keystore is not configured

## Next Steps

After setting up release signing:
1. Build your release AAB
2. Test it on a device if possible
3. Upload to Google Play Console
4. Complete the store listing and other required information
5. Submit for review

Good luck with your app release! 🚀

