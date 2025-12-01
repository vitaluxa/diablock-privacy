# Google Play Games Services Setup Guide

This guide will walk you through setting up Google Play Games Services for "Dia Block" to enable cloud save and leaderboards.

## Prerequisites

1. A Google account
2. Access to [Google Play Console](https://play.google.com/console)
3. Your app published or in testing on Google Play Store

## Step-by-Step Setup Instructions

### Step 1: Create or Select Your App in Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **"Create app"** (if this is your first app) or select your existing app
3. Fill in the required information:
   - App name: **"Dia Block"**
   - Default language: Choose your language
   - App or game: Select **"Game"**
   - Free or paid: Select **"Free"**
4. Accept the terms and create the app

### Step 2: Enable Google Play Games Services

1. In Google Play Console, navigate to your app
2. Go to **"Services & APIs"** or **"Game services"** in the left sidebar
3. Click **"Link app"** or **"Create new game"**
4. Fill in the game details:
   - Game name: **"Dia Block"**
   - Category: **"Puzzle"**
5. Click **"Create"** or **"Link"**

### Step 3: Configure OAuth 2.0 Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Google Play Games Services API**
   - **Google+ API** (if available)
   - **Google Identity API**

#### Enable APIs:
1. Go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Play Games Services API"**
3. Click on it and press **"Enable"**
4. Repeat for **"Google Identity API"**

#### Create OAuth 2.0 Credentials:
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External** (or Internal if you have a Workspace)
   - App name: **"Dia Block"**
   - User support email: Your email
   - Developer contact: Your email
   - Save and continue through the scopes (defaults are fine)
4. Back to Credentials, select **"Web application"**
5. Name: **"Dia Block Web Client"**
6. **Authorized JavaScript origins:**
   - Add: `http://localhost:5173` (for development)
   - Add: `https://your-domain.com` (for production)
   - Add: `https://your-app.web.app` (if using Firebase Hosting)
7. **Authorized redirect URIs:**
   - Add: `http://localhost:5173` (for development)
   - Add: `https://your-domain.com` (for production)
8. Click **"Create"**
9. **IMPORTANT:** Copy the **Client ID** - you'll need this!

### Step 4: Create API Key (Optional but Recommended)

1. In Google Cloud Console, go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"API Key"**
3. Copy the API Key
4. (Optional) Restrict the API key:
   - Click on the key to edit
   - Under "API restrictions", select **"Restrict key"**
   - Choose: **"Google Play Games Services API"**
   - Save

### Step 5: Create Leaderboards

1. In Google Play Console, go to your app
2. Navigate to **"Game services"** → **"Leaderboards"**
3. Click **"Create leaderboard"**
4. Fill in the details:
   - **Leaderboard ID:** `dia_block_global_score`
   - **Name:** "Global Score Leaderboard"
   - **Description:** "Top players by total score"
   - **Icon:** Upload a 512x512 icon (optional)
   - **Score ordering:** Higher is better
5. Click **"Create"**

### Step 6: Configure Cloud Save (Snapshots)

1. In Google Play Console, go to **"Game services"**
2. Look for **"Snapshots"** or **"Cloud Save"**
3. Enable Snapshots API
4. Configure save file:
   - **Snapshot ID:** `DiaBlockSave`
   - **Maximum save game data size:** 3 MB (default)

### Step 7: Set Up Environment Variables

1. In your project root, create a `.env` file (if it doesn't exist)
2. Add the following variables:

```env
VITE_GOOGLE_PLAY_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key-here
```

**Important:** 
- Replace `your-client-id-here` with the OAuth Client ID from Step 3
- Replace `your-api-key-here` with the API Key from Step 4 (if created)
- Do NOT commit the `.env` file to git (it's already in .gitignore)

### Step 8: Update Your App's Authorized Domains

1. In Google Play Console → **"Game services"** → **"Configuration"**
2. Under **"Web app domains"**, add:
   - `localhost:5173` (for development)
   - `your-domain.com` (for production)
3. Save changes

### Step 9: Test Your Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser
3. Click **"Sign in with Google"** in the main menu
4. Sign in with your Google account
5. Play the game and check if:
   - Progress is saved to cloud
   - Scores appear in leaderboard
   - You can see your saved progress after refreshing

### Step 10: Production Deployment

When deploying to production:

1. Update the `.env` file with production credentials
2. Update **Authorized JavaScript origins** in Google Cloud Console:
   - Add your production domain
   - Remove `localhost:5173` if you want (or keep for testing)
3. Update **Authorized redirect URIs**:
   - Add your production domain
4. In Google Play Console, update **Web app domains** with production domain

## Troubleshooting

### "Error: Failed to initialize Google Play Games"
- Check that `VITE_GOOGLE_PLAY_CLIENT_ID` is set correctly
- Verify the Client ID format (should end with `.apps.googleusercontent.com`)
- Make sure Google Play Games Services API is enabled

### "Sign in failed"
- Check that your domain is in **Authorized JavaScript origins**
- Verify OAuth consent screen is configured
- Make sure the Client ID is correct

### "Failed to save/load game state"
- Check that Snapshots API is enabled in Google Play Console
- Verify you're signed in to Google Play Games
- Check browser console for specific error messages

### "Leaderboard not found"
- Verify the Leaderboard ID matches: `dia_block_global_score`
- Make sure the leaderboard is published (not in draft)
- Check that you've linked the app to Google Play Games Services

## Testing Checklist

- [ ] Can sign in with Google account
- [ ] Game state saves to cloud after completing a level
- [ ] Game state loads from cloud when restarting
- [ ] Scores submit to leaderboard
- [ ] Can view leaderboard scores
- [ ] Works on mobile devices (if deploying as PWA)

## Additional Resources

- [Google Play Games Services Documentation](https://developers.google.com/games/services/web/api)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

## Notes

- The app will fallback to localStorage if Google Play Games is not configured
- Cloud save and leaderboards only work for signed-in users
- Test thoroughly before publishing to production
- Keep your credentials secure - never commit `.env` to version control

Good luck with your Google Play Store release! 🚀





