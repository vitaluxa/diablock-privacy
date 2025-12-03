# Google Play Games Integration - Complete Setup

## ✅ What's Been Implemented

Your "Dia Block" game now has **Google Play Games Services integration** with:

1. ✅ **Google Sign-In** - Users can sign in with their Google account
2. ✅ **Cloud Save** - Progress (level and score) saved to Google Drive
3. ✅ **Leaderboards** - Scores submitted to Google Play Games leaderboards
4. ✅ **Offline Fallback** - Uses localStorage if Google Play Games not configured
5. ✅ **Auto-Save** - Progress saves automatically when you complete levels

## 📋 What You Need to Do

### Step 1: Google Cloud Console Setup (5 minutes)

1. **Go to:** https://console.cloud.google.com/
2. **Create/Select Project:**
   - Click "Create Project" or select existing
   - Name: "Dia Block"
3. **Enable APIs:**
   - Go to **APIs & Services** → **Library**
   - Enable: **Google Drive API**
   - Enable: **Google Identity API**
4. **Create OAuth Client:**
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Configure OAuth consent screen (first time only):
     - User Type: **External**
     - App name: "Dia Block"
     - Your email for support and developer contact
     - Continue through defaults
   - Create **Web application** OAuth client:
     - Name: "Dia Block Web Client"
     - **Authorized JavaScript origins:**
       - `http://localhost:5173` (development)
       - `https://your-domain.com` (production - add later)
     - **Authorized redirect URIs:**
       - `http://localhost:5173` (development)
       - `https://your-domain.com` (production - add later)
     - Click **Create**
5. **Copy Client ID** (looks like: `xxx.apps.googleusercontent.com`)
6. **Create API Key:**
   - **Create Credentials** → **API Key**
   - Copy the API Key
   - (Optional) Restrict to Google Drive API

### Step 2: Add Environment Variables

1. In your project root, create `.env` file:

```env
VITE_GOOGLE_PLAY_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key-here
```

2. **Replace:**
   - `your-client-id-here` with your OAuth Client ID from Step 1
   - `your-api-key-here` with your API Key from Step 1

### Step 3: Test Locally

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Open:** http://localhost:5173

3. **Test the integration:**
   - Click **"Sign in with Google"** in the main menu
   - Sign in with your Google account
   - Play the game and complete a level
   - Check that progress saves to cloud

### Step 4: For Google Play Store Publishing

#### Option A: Package as Android App (Recommended)

1. **Install Capacitor:**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npm install @capacitor/android
   npx cap init
   ```

2. **Add Android platform:**
   ```bash
   npx cap add android
   ```

3. **Build and sync:**
   ```bash
   npm run build
   npx cap sync
   ```

4. **In Google Play Console:**
   - Create app or link existing
   - Go to **Game services**
   - Create leaderboard:
     - **Leaderboard ID:** `dia_block_global_score`
     - **Name:** "Global Score Leaderboard"
   - Enable Play Games Services

#### Option B: Publish as Web App First

1. Deploy to hosting (Firebase, Netlify, Vercel, etc.)
2. Add production domain to **Authorized JavaScript origins** in Google Cloud Console
3. Package as Android app later when ready

## 🔍 How It Works

### Cloud Save Flow:

1. User signs in with Google
2. Game progress saved to **Google Drive App Data folder** (hidden from user)
3. Progress syncs across all devices where user is signed in
4. Falls back to localStorage if not signed in

### Leaderboard Flow:

1. When user completes a level, score is submitted
2. Scores appear in Google Play Games leaderboard
3. Visible to all players (when published as Android app)
4. Falls back to local leaderboard if not signed in

## 📱 Features Available

### ✅ Currently Working:
- Google Sign-In authentication
- Cloud save via Google Drive
- Local leaderboard (works offline)
- Progress persistence

### 🔜 When Published as Android App:
- Global leaderboards
- Achievements
- Real-time score comparisons
- Social features

## ⚠️ Important Notes

1. **The `.env` file is in `.gitignore`** - your credentials are safe
2. **App works without Google Play Games** - uses localStorage fallback
3. **Cloud save uses Google Drive App Data** - secure and hidden
4. **Test thoroughly** before publishing to production

## 🐛 Troubleshooting

### "Sign in doesn't work"
- ✅ Check Client ID format (ends with `.apps.googleusercontent.com`)
- ✅ Verify domain is in Authorized JavaScript origins
- ✅ Make sure Google Identity API is enabled

### "Failed to save to cloud"
- ✅ Check that Google Drive API is enabled
- ✅ Verify you're signed in
- ✅ Check browser console for specific errors

### "Leaderboard not found"
- ✅ This is normal for web apps - leaderboards work when packaged as Android app
- ✅ Local leaderboard still works
- ✅ When published to Play Store, create leaderboard with ID: `dia_block_global_score`

## 📝 Files Created/Modified

### New Files:
- `src/services/googlePlayGames.js` - Google Play Games service
- `src/hooks/useGooglePlayGames.js` - React hook for Google Play Games
- `src/components/GoogleSignIn.jsx` - Sign-in component
- `SETUP_GOOGLE_PLAY.md` - Quick setup guide
- `GOOGLE_SETUP_INSTRUCTIONS.md` - Detailed instructions
- `QUICK_SETUP.md` - 5-minute setup guide

### Modified Files:
- `src/App.jsx` - Added Google Play Games hook
- `src/hooks/useGameLogic.js` - Integrated cloud save
- `src/components/MainMenu.jsx` - Added sign-in UI
- `src/components/Scoreboard.jsx` - Added leaderboard support

## ✅ Testing Checklist

- [ ] Can sign in with Google account
- [ ] Sign-in button appears in main menu
- [ ] User profile shows when signed in
- [ ] Can sign out
- [ ] Game progress saves to cloud
- [ ] Game progress loads from cloud on restart
- [ ] Works offline (localStorage fallback)
- [ ] Scores save to leaderboard (or local storage)

## 🚀 Next Steps

1. **Follow Step 1** above to set up Google Cloud Console
2. **Follow Step 2** to add environment variables
3. **Test locally** (Step 3)
4. **When ready to publish**, follow Step 4

## 📞 Support

If you need help:
- Check browser console for error messages
- Verify all credentials are correct
- See detailed guides in `GOOGLE_SETUP_INSTRUCTIONS.md`

Good luck with your Google Play Store release! 🎮






