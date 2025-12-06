# Debugging Purchase Issue on Android Device

## Problem
Clicking "No Ads" button shows subscription message but doesn't open Google Play purchase dialog. The real billing logic isn't working.

## What Was Fixed

### 1. Enhanced Logging
Added detailed console logging to track:
- Platform detection (should be 'android' on device)
- Billing support check
- Purchase flow execution
- Error details

### 2. Improved Error Handling
- Errors are now properly caught and logged
- No silent failures - errors are reported
- Platform detection failures are logged

### 3. Better Error Messages
- User sees actual error messages
- Console shows detailed error information

## How to Debug

### Step 1: Check Console Logs

Connect device via ADB and check logs:

```bash
adb logcat | grep -i "billing\|purchase\|subscription"
```

Or use Chrome DevTools remote debugging:
1. Connect device via USB
2. Enable USB debugging
3. Open Chrome: `chrome://inspect`
4. Click "inspect" on your device
5. Check Console tab

### Step 2: Check Platform Detection

In browser console (via remote debugging), run:
```javascript
import { Capacitor } from '@capacitor/core';
console.log('Platform:', Capacitor.getPlatform());
// Should output: "android"
```

### Step 3: Check Plugin Availability

In console:
```javascript
const { NativePurchases } = require('@capgo/native-purchases');
console.log('NativePurchases:', typeof NativePurchases);
// Should output: "object"

// Check billing support
NativePurchases.isBillingSupported().then(result => {
  console.log('Billing supported:', result);
});
```

### Step 4: Test Purchase Flow

In console:
```javascript
window.billingService.purchaseSubscription().then(result => {
  console.log('Purchase result:', result);
}).catch(error => {
  console.error('Purchase error:', error);
});
```

## Common Issues

### Issue 1: Platform Not Detected as 'android'
**Symptom:** Logs show "Mock purchase for web/development"
**Fix:** 
- Ensure app is built as native APK, not running in webview
- Check `Capacitor.getPlatform()` returns 'android'

### Issue 2: Plugin Not Available
**Symptom:** Error: "NativePurchases is not defined"
**Fix:**
- Run: `npx cap sync android`
- Rebuild APK: `npx cap build android`
- Check plugin is installed: `npm list @capgo/native-purchases`

### Issue 3: Billing Not Supported
**Symptom:** "Billing not supported on this device"
**Fix:**
- Ensure Google Play Services is installed
- Check device has Google Play Store
- Test on different device

### Issue 4: Product Not Found
**Symptom:** "Purchase failed: Product not found"
**Fix:**
- Verify product ID in Google Play Console: `no_ads_monthly`
- Verify base plan ID: `monthly-plan`
- Ensure subscription is published (not draft)
- Wait a few hours after creating subscription (Google Play needs time to sync)

### Issue 5: Subscription Not Configured
**Symptom:** Error when calling `purchaseProduct`
**Fix:**
- Create subscription in Google Play Console:
  1. Go to: Monetise → Products → Subscriptions
  2. Create subscription: `no_ads_monthly`
  3. Add base plan: `monthly-plan`
  4. Set price: $5.99/month
  5. Publish (don't leave as draft)

## Expected Log Flow

When clicking "Remove Ads" button, you should see:

```
🛒 User clicked "Remove Ads" button
💰 BillingService: Starting subscription purchase flow...
📱 Detected platform: android
🔍 Platform check: {platform: "android", isAndroid: true, isIOS: false}
✅ Running on native platform, using real billing
💳 Billing supported: true
📤 Initiating purchase with options: {...}
[Google Play purchase dialog should appear here]
📥 Purchase result: {transactionId: "...", ...}
✅ Subscription purchase successful! Transaction: ...
```

## Next Steps

1. **Rebuild APK** with updated code:
   ```bash
   npm run build
   npx cap sync android
   cd android
   ./gradlew assembleRelease
   ```

2. **Install on device**:
   ```bash
   adb install -r android/app/build/outputs/apk/release/app-release.apk
   ```

3. **Test again** and check logs:
   ```bash
   adb logcat -c  # Clear logs
   # Click "Remove Ads" button
   adb logcat | grep -i "billing\|purchase\|subscription"
   ```

4. **Check console** via remote debugging (Chrome DevTools)

## Verification Checklist

- [ ] Platform detected as 'android' (check logs)
- [ ] Billing is supported (check logs)
- [ ] NativePurchases plugin is available
- [ ] Subscription product exists in Google Play Console
- [ ] Subscription is published (not draft)
- [ ] Base plan ID matches: `monthly-plan`
- [ ] Product ID matches: `no_ads_monthly`
- [ ] Google Play purchase dialog appears
- [ ] Purchase completes successfully

## If Still Not Working

1. Check AndroidManifest.xml has billing permissions
2. Verify Google Play Console subscription is active
3. Test with Google Play test account
4. Check device has active internet connection
5. Verify app is signed with release keystore (if using release build)

