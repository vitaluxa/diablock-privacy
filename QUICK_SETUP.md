# Quick Setup Guide - Google Play Games Integration

## ⚡ Fast Setup (5 Minutes)

### Step 1: Google Cloud Console (2 min)

1. Go to: https://console.cloud.google.com/
2. Create/select project
3. Enable **Google Drive API**:
   - **APIs & Services** → **Library** → Search "Drive" → Enable
4. Create **OAuth Client ID**:
   - **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
   - **Application type:** Web application
   - **Name:** Dia Block
   - **Authorized JavaScript origins:**
     - `http://localhost:5173`
   - **Authorized redirect URIs:**
     - `http://localhost:5173`
   - Click **Create**
   - **Copy the Client ID** (looks like: `xxx.apps.googleusercontent.com`)

### Step 2: Create API Key (1 min)

1. **APIs & Services** → **Credentials** → **Create Credentials** → **API Key**
2. Copy the API Key
3. (Optional) Click key to edit and restrict to **Google Drive API**

### Step 3: Add to Your Project (1 min)

1. Create `.env` file in project root:

```env
VITE_GOOGLE_PLAY_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=paste-your-api-key-here
```

2. Replace `paste-your-client-id-here` with your Client ID from Step 1
3. Replace `paste-your-api-key-here` with your API Key from Step 2

### Step 4: Restart Dev Server (1 min)

```bash
npm run dev
```

### Step 5: Test It! (1 min)

1. Open http://localhost:5173
2. Click **"Sign in with Google"** in main menu
3. Sign in with your Google account
4. Play the game - your progress will save to cloud! ☁️

## ✅ That's It!

Your game now has:
- ✅ Google Sign-In
- ✅ Cloud Save (via Google Drive)
- ✅ Progress sync across devices
- ✅ Ready for leaderboards (when published)

## 🚀 For Production

When deploying to production:

1. **Update `.env`** with production credentials
2. **Add production domain** to Authorized JavaScript origins:
   - Your production URL (e.g., `https://diablock.com`)
3. **Test on production domain**

## 📱 For Google Play Store

When packaging as Android app:

1. Use **Capacitor** or **Cordova** to package web app
2. In Google Play Console, enable **Play Games Services**
3. Create leaderboard with ID: `dia_block_global_score`
4. Test on Android device

## ⚠️ Important Notes

- `.env` file is in `.gitignore` - your credentials are safe
- App works **perfectly fine** without Google Play Games (uses localStorage)
- Cloud save uses **Google Drive App Data folder** (hidden from user)
- All features have graceful fallback if not configured

## 🆘 Troubleshooting

**"Sign in doesn't work"**
→ Check Client ID format (should end with `.apps.googleusercontent.com`)

**"Failed to save to cloud"**
→ Make sure Google Drive API is enabled

**"CORS error"**
→ Add your domain to Authorized JavaScript origins

## 📚 More Help

- See `SETUP_GOOGLE_PLAY.md` for detailed instructions
- See `GOOGLE_SETUP_INSTRUCTIONS.md` for full documentation

Good luck! 🎮





