# Google Play Games Integration - Setup Instructions

## What You Need to Do

Since this is a **web app** that will be published to Google Play Store, here's what you need to set up:

## Quick Setup (5 Steps)

### Step 1: Google Cloud Console - OAuth Setup

1. Go to https://console.cloud.google.com/
2. Create or select a project
3. Enable these APIs:
   - **Google Drive API** (for cloud save)
   - **Google Identity API** (for sign-in)
4. Create OAuth 2.0 credentials:
   - **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
   - Type: **Web application**
   - Name: "Dia Block Web"
   - **Authorized JavaScript origins:**
     - Add: `http://localhost:5173`
     - Add: Your production domain
   - **Authorized redirect URIs:**
     - Add: `http://localhost:5173`
     - Add: Your production domain
5. **Copy the Client ID** (ends with `.apps.googleusercontent.com`)

### Step 2: Create API Key (Optional)

1. **APIs & Services** → **Credentials** → **Create Credentials** → **API Key**
2. Copy the API Key
3. (Optional) Restrict to **Google Drive API**

### Step 3: Environment Variables

Create `.env` file in your project root:

```env
VITE_GOOGLE_PLAY_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key-here
```

**Replace:**
- `your-client-id-here` with the Client ID from Step 1
- `your-api-key-here` with the API Key from Step 2 (optional)

### Step 4: Test Locally

1. Restart your dev server:
   ```bash
   npm run dev
   ```
2. Open the app in browser
3. Click "Sign in with Google" in main menu
4. Sign in and test cloud save

### Step 5: For Google Play Store

When publishing to Google Play:

1. **Package as Android App:**
   - Use **Capacitor** or **Cordova** to package web app as Android APK
   - Or use **Android Studio** to create a WebView wrapper

2. **Link to Google Play Games:**
   - In Google Play Console → Your app → **Game services**
   - Create/link leaderboards
   - Leaderboard ID: `dia_block_global_score`

## Features Enabled

✅ **Google Sign-In** - Users can sign in with Google account
✅ **Cloud Save** - Progress saved to Google Drive App Data folder
✅ **Leaderboards** - Scores submitted to Google Play Games (when packaged as Android app)
✅ **Offline Mode** - Falls back to localStorage if not signed in

## What Happens If Not Configured?

The app will:
- ✅ Work perfectly fine without Google Play Games
- ✅ Use localStorage for saves
- ✅ Show local leaderboard
- ✅ All features work offline

**Google Play Games is optional** - the app works great without it!

## Testing Checklist

- [ ] Sign in with Google works
- [ ] Progress saves to cloud
- [ ] Progress loads when restarting app
- [ ] Scores appear in leaderboard
- [ ] Works on mobile devices

## Need Help?

See `GOOGLE_SETUP_INSTRUCTIONS.md` for detailed step-by-step guide with screenshots.

## Important Notes

- The `.env` file is already in `.gitignore` - your credentials won't be committed
- For production, update authorized domains in Google Cloud Console
- Test thoroughly before publishing to Play Store
- Cloud save uses Google Drive App Data folder (hidden from user, secure)

Good luck with your Google Play Store release! 🚀






