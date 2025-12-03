# Quick Publish Guide - Dia Block Game

## 🎯 Status: **Almost Ready** (90% Complete)

Your game is **functionally complete** but needs a few critical steps before publishing to Google Play Store.

## ⚡ Quick Fixes Needed (2-3 hours):

### 1. **Release Signing** (30 min) - CRITICAL
```bash
# Generate release keystore
keytool -genkey -v -keystore dia-block-release.keystore -alias dia-block -keyalg RSA -keysize 2048 -validity 10000

# Update android/app/build.gradle:
# Change line 28 from:
#   signingConfig signingConfigs.debug
# To:
#   signingConfig signingConfigs.release

# Add signing config:
signingConfigs {
    release {
        storeFile file('../dia-block-release.keystore')
        storePassword 'YOUR_PASSWORD'
        keyAlias 'dia-block'
        keyPassword 'YOUR_PASSWORD'
    }
}
```

### 2. **Build Release AAB** (15 min) - CRITICAL
```bash
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### 3. **Privacy Policy** (1 hour) - REQUIRED
- Create privacy policy covering:
  - Data collection (Firebase, game progress)
  - Third-party services
  - User rights
- Host it online (GitHub Pages, Firebase Hosting, etc.)
- Add link in app settings/about section

### 4. **Store Assets** (1-2 hours) - REQUIRED
- **Feature Graphic:** 1024x500px
- **Screenshots:** At least 2 (up to 8)
  - Main menu
  - Gameplay
  - Win screen
  - Scoreboard
- **App Icon:** ✅ Already have

### 5. **Disable Debug Panel** (5 min) - RECOMMENDED
Add to `src/App.jsx`:
```javascript
const isProduction = import.meta.env.PROD;
// Only show debug panel in development
{isProduction ? null : showDebugPanel && <DebugPanel ... />}
```

## ✅ Already Complete:
- ✅ App builds successfully
- ✅ Game functionality complete
- ✅ Firebase integration
- ✅ Music & sound effects
- ✅ Vibration feedback
- ✅ Promotion overlay
- ✅ Terms & Conditions
- ✅ App icons
- ✅ Target SDK 35 (latest)
- ✅ Proper permissions

## 📋 Google Play Console Steps:

1. **Create Developer Account** ($25 one-time)
2. **Create New App**
3. **Upload AAB** (from step 2 above)
4. **Complete Store Listing:**
   - App name: "Dia Block"
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots
   - Feature graphic
   - Privacy policy URL
5. **Content Rating:** Complete questionnaire (likely PEGI 3 / Everyone)
6. **Data Safety:** Complete form
7. **Pricing:** Set to Free
8. **Review & Publish**

## ⚠️ Important Notes:

- **Contest:** iPhone 17 Pro contest may need legal review depending on jurisdiction
- **Testing:** Test thoroughly on real devices before publishing
- **Updates:** Plan for regular updates (increment versionCode)

## 🎯 Priority Order:

1. **Release signing** (30 min) - Must do
2. **Build AAB** (15 min) - Must do  
3. **Privacy policy** (1 hour) - Must do
4. **Store assets** (1-2 hours) - Must do
5. **Disable debug** (5 min) - Should do
6. **Store listing** (30 min) - Must do
7. **Content rating** (15 min) - Must do

**Total Time:** ~3-4 hours

---

See `PUBLISH_CHECKLIST.md` for detailed checklist.


