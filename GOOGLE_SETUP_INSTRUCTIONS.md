# Google Play Games Integration Setup

## Overview

This app integrates with Google Play Games Services to provide:
- ✅ Cloud Save (progress sync across devices)
- ✅ Global Leaderboards
- ✅ User Authentication
- ✅ Achievement System (future)

## Important: Web App vs Android App

**Note:** Google Play Games Services API is primarily designed for **Android native apps**. For **web apps** (PWA/HTML5), we use:

1. **Google Identity Services** for authentication
2. **Firebase** or **Custom Backend** for cloud storage
3. **REST API** for leaderboards (if available)

## Setup Options

### Option 1: Full Firebase Integration (Recommended for Web)

Firebase provides cloud storage, authentication, and is easier to set up for web apps.

#### Steps:

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Name: "Dia Block"
   - Enable Google Analytics (optional)

2. **Add Web App:**
   - Click the web icon (`</>`)
   - Register app: "Dia Block Web"
   - Copy the Firebase config

3. **Enable Authentication:**
   - Go to Authentication → Sign-in method
   - Enable "Google" provider
   - Add authorized domains

4. **Enable Firestore Database:**
   - Go to Firestore Database
   - Create database
   - Start in test mode
   - Set location

5. **Install Firebase SDK:**
   ```bash
   npm install firebase
   ```

6. **Add to `.env`:**
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

### Option 2: Google Play Games REST API (For Android WebView)

If you're wrapping your web app in an Android WebView:

1. **Create Android App** in Google Play Console
2. **Link Web App** to Android app
3. **Use Android Play Games SDK** in WebView bridge

### Option 3: Hybrid Approach (Current Implementation)

We've implemented a hybrid approach that:
- Uses Google Sign-In for authentication
- Falls back to localStorage if not configured
- Can be extended with Firebase later

## Quick Setup Guide (Hybrid - Current)

### Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API** (or **Google Identity API**)

### Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure OAuth consent screen:
   - App name: "Dia Block"
   - User support email: Your email
   - Save and continue
4. Create **Web application** OAuth client:
   - Name: "Dia Block Web"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - `https://your-domain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:5173` (development)
     - `https://your-domain.com` (production)
5. **Copy the Client ID**

### Step 3: Set Environment Variables

Create `.env` file in project root:

```env
VITE_GOOGLE_PLAY_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key-if-needed
```

### Step 4: Test the Integration

1. Start dev server: `npm run dev`
2. Open the app
3. Click "Sign in with Google" in main menu
4. Sign in with your Google account
5. Your progress will save to cloud (currently using Google Drive App Data)

## For Google Play Store Publishing

### When Publishing as PWA/Web App:

1. **Package as Android App:**
   - Use tools like Capacitor or Cordova
   - Or create a WebView wrapper in Android Studio

2. **Link to Google Play Games:**
   - In Google Play Console, link your web app to Android app
   - Enable Play Games Services for the Android app

3. **Test on Android Device:**
   - Install the app from Play Store
   - Test cloud save and leaderboards

## Current Implementation Features

✅ **Google Sign-In Integration**
- Authenticate users with Google account
- Show user profile in UI

✅ **Cloud Save (via localStorage fallback)**
- Progress saves locally first
- Can be extended to Firebase/Drive

✅ **Leaderboard Support**
- Ready for Google Play Games leaderboards
- Falls back to local leaderboard

✅ **Graceful Fallback**
- Works without Google Play Games configured
- Uses localStorage for offline play

## Next Steps for Full Integration

1. **Add Firebase** (recommended for web apps)
2. **Set up backend** for cloud storage
3. **Implement proper leaderboards** via REST API
4. **Add achievements** system

## Troubleshooting

- **Sign-in doesn't work:** Check Client ID and authorized domains
- **Scores not saving:** Verify you're signed in
- **Leaderboard empty:** Make sure leaderboard is created in Play Console

For detailed setup instructions, see `GOOGLE_PLAY_SETUP.md`






