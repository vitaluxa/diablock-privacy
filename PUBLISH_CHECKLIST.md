# Google Play Store Publishing Checklist

## ✅ Current Status

### ✅ Ready:
- ✅ App builds successfully (APK)
- ✅ Basic Android configuration complete
- ✅ App icons and splash screens present
- ✅ Game functionality complete
- ✅ Firebase integration for cloud save
- ✅ Music and sound effects working
- ✅ Vibration feedback implemented
- ✅ Promotion overlay with iPhone contest
- ✅ Terms & Conditions overlay

### ⚠️ Needs Attention Before Publishing:

## 🔴 Critical (Must Fix):

### 1. **App Signing for Release**
   - **Current:** Using debug signing (line 28 in `android/app/build.gradle`)
   - **Required:** Create release keystore and configure signing
   - **Action:** 
     ```bash
     # Generate keystore
     keytool -genkey -v -keystore dia-block-release.keystore -alias dia-block -keyalg RSA -keysize 2048 -validity 10000
     ```
   - **Update:** `android/app/build.gradle` release signingConfig
   - **Update:** `capacitor.config.json` with keystore paths

### 2. **Version Information**
   - **Current:** versionCode: 1, versionName: "1.0"
   - **Status:** ✅ OK for initial release
   - **Note:** Increment versionCode for each update

### 3. **Remove Debug Features**
   - **Current:** DebugPanel accessible (can be hidden in production)
   - **Action:** Add environment check to disable debug panel in production
   - **Files:** `src/App.jsx` - conditionally show debug panel

### 4. **Privacy Policy**
   - **Required:** Google Play requires privacy policy URL
   - **Action:** Create privacy policy covering:
     - Data collection (Firebase analytics, game progress)
     - Third-party services (Firebase, Google Play Games)
     - User rights (data deletion, access)
   - **Host:** Deploy to web or use privacy policy generator
   - **Add:** Privacy policy link in app settings/about

### 5. **Content Rating**
   - **Required:** Complete content rating questionnaire
   - **Likely Rating:** PEGI 3 / Everyone (puzzle game, no violence)
   - **Action:** Complete in Google Play Console

### 6. **Store Listing Assets**
   - **Required:**
     - ✅ App icon (already have)
     - ⚠️ Feature graphic (1024x500px)
     - ⚠️ Screenshots (at least 2, up to 8)
       - Phone: 16:9 or 9:16 ratio
       - Tablet: 16:9 or 9:16 ratio
     - ⚠️ Promo video (optional but recommended)
   - **Action:** Create screenshots showing:
     - Main menu
     - Gameplay (level in progress)
     - Win screen
     - Scoreboard
     - Promotion overlay

### 7. **App Description**
   - **Required:** Short description (80 chars) and full description (4000 chars)
   - **Should include:**
     - Game features
     - How to play
     - Contest information (iPhone 17 Pro)
     - Terms link

### 8. **Permissions Justification**
   - **Current:** Only INTERNET permission
   - **Status:** ✅ OK (required for Firebase/online features)
   - **Action:** Justify in Play Console if asked

### 9. **Target SDK Version**
   - **Check:** Ensure targetSdkVersion is recent (API 33+)
   - **Location:** `android/variables.gradle`

### 10. **Build Release AAB (Android App Bundle)**
   - **Current:** Building APK (debug)
   - **Required:** Build release AAB for Play Store
   - **Action:**
     ```bash
     cd android
     ./gradlew bundleRelease
     ```
   - **Output:** `android/app/build/outputs/bundle/release/app-release.aab`

## 🟡 Recommended (Should Do):

### 11. **Test on Multiple Devices**
   - Test on different Android versions
   - Test on different screen sizes
   - Test with/without internet connection

### 12. **Remove Console Logs**
   - **Action:** Remove or disable console.log statements in production
   - **Option:** Use environment variable to disable debug logs

### 13. **Error Tracking**
   - **Consider:** Add error tracking service (Sentry, Firebase Crashlytics)
   - **Current:** Basic error boundary exists

### 14. **Analytics**
   - **Current:** Firebase integrated
   - **Action:** Set up Firebase Analytics events for:
     - Level completions
     - User retention
     - Feature usage

### 15. **App Store Optimization (ASO)**
   - **Keywords:** Add relevant keywords in description
   - **Categories:** Puzzle, Brain, Strategy
   - **Tags:** Add appropriate tags

### 16. **Contest Legal Compliance**
   - **Action:** Ensure contest terms comply with local laws
   - **Consider:** Legal review of contest terms
   - **Note:** iPhone 17 Pro contest may need additional legal review

### 17. **Age Rating Justification**
   - **Action:** Justify why game is appropriate for all ages
   - **Note:** Puzzle game, no violence - should be easy

### 18. **Data Safety Section**
   - **Required:** Complete Data Safety form in Play Console
   - **Questions:**
     - Does your app collect data? (Yes - Firebase)
     - What data? (Game progress, scores)
     - How is it used? (Cloud save, leaderboards)
     - Is data shared? (Only with Firebase/Google)

## 🟢 Nice to Have:

### 19. **Promotional Video**
   - Create short gameplay video
   - Show key features
   - Highlight contest

### 20. **Beta Testing**
   - Set up internal testing track
   - Test with small group before public release
   - Collect feedback

### 21. **Localization**
   - **Current:** English only
   - **Consider:** Add more languages for wider reach

### 22. **Accessibility**
   - **Check:** Ensure game is playable with screen readers
   - **Check:** Color contrast meets WCAG standards

## 📋 Pre-Publish Checklist:

- [ ] Release keystore created and configured
- [ ] Release AAB built successfully
- [ ] Debug features disabled/removed
- [ ] Privacy policy created and hosted
- [ ] Store listing assets created (screenshots, feature graphic)
- [ ] App description written
- [ ] Content rating completed
- [ ] Data Safety form completed
- [ ] Tested on multiple devices
- [ ] Contest terms legally reviewed (if required)
- [ ] Firebase Analytics configured
- [ ] Error tracking set up (optional but recommended)
- [ ] Console logs removed/disabled in production
- [ ] Version code incremented appropriately

## 🚀 Publishing Steps:

1. **Create Google Play Developer Account** ($25 one-time fee)
2. **Create App in Play Console**
3. **Upload Release AAB**
4. **Complete Store Listing** (description, screenshots, etc.)
5. **Complete Content Rating**
6. **Complete Data Safety**
7. **Set Pricing** (Free)
8. **Review and Publish**

## ⚠️ Important Notes:

- **Contest:** The iPhone 17 Pro contest may require additional legal compliance depending on your jurisdiction
- **Firebase:** Ensure Firebase project is properly configured for production
- **Analytics:** Review Firebase Analytics setup for privacy compliance
- **Testing:** Thoroughly test the app before publishing
- **Updates:** Plan for regular updates to fix bugs and add features

## 📞 Support Resources:

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)
- [Privacy Policy Generator](https://www.privacypolicygenerator.info/)

---

**Estimated Time to Complete:** 2-4 hours (excluding asset creation and legal review)

**Priority Order:**
1. Release signing (30 min)
2. Build release AAB (15 min)
3. Privacy policy (1 hour)
4. Store assets (1-2 hours)
5. Store listing (30 min)
6. Content rating (15 min)
7. Data Safety (15 min)


