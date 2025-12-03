# Firebase Quick Setup - Dia Block

## What Changed

✅ **Removed Google Sign-In requirement** - No more login needed!
✅ **Added Firebase with Anonymous Authentication** - Automatic sign-in
✅ **Random username generation** - Each player gets a unique name like "CoolPlayer1234"
✅ **Cloud save** - Progress saved automatically to Firebase
✅ **Resume game** - Players continue from where they left off
✅ **Global leaderboard** - All scores visible to everyone

## Quick Setup Steps

### 1. Create Firebase Project (2 minutes)

1. Go to: https://console.firebase.google.com/
2. Click **"Add project"**
3. Name: **"Dia Block"**
4. Click **"Create project"**

### 2. Add Web App (1 minute)

1. Click web icon (`</>`)
2. Name: **"Dia Block Web"**
3. Click **"Register app"**
4. **Copy the config values** - you'll need them!

### 3. Enable Anonymous Auth (1 minute)

1. Go to **Authentication** → **Sign-in method**
2. Click **"Anonymous"**
3. Toggle **ON**
4. Click **"Save"**

### 4. Create Firestore Database (1 minute)

1. Go to **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in test mode"**
4. Choose location
5. Click **"Enable"**

### 5. Update Firestore Rules (1 minute)

1. Go to **Firestore Database** → **Rules**
2. Paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /leaderboard/{entryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

### 6. Update .env File (1 minute)

Open `.env` file and replace with:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=paste-your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=paste-your-auth-domain-here
VITE_FIREBASE_PROJECT_ID=paste-your-project-id-here
VITE_FIREBASE_STORAGE_BUCKET=paste-your-storage-bucket-here
VITE_FIREBASE_MESSAGING_SENDER_ID=paste-your-sender-id-here
VITE_FIREBASE_APP_ID=paste-your-app-id-here
```

**Get these values from Step 2** (the Firebase config you copied)

### 7. Restart Dev Server

```bash
npm run dev
```

### 8. Test It!

1. Open http://localhost:5173
2. App automatically signs in anonymously
3. Random username appears (e.g., "SwiftMaster789")
4. Play the game
5. Close and reopen - progress is restored! ✨

## How It Works

- **No login required** - Automatic anonymous authentication
- **Unique username** - Randomly generated for each user
- **Auto-save** - Progress saved to Firebase automatically
- **Resume** - Continue from where you left off
- **Global leaderboard** - See all player scores

## Files Changed

- `src/services/firebaseService.js` - NEW Firebase service
- `src/hooks/useFirebase.js` - NEW Firebase hook
- `src/App.jsx` - Updated to use Firebase
- `src/hooks/useGameLogic.js` - Updated to use Firebase
- `src/components/MainMenu.jsx` - Removed Google Sign-In, added username display
- `src/components/Scoreboard.jsx` - Updated to use Firebase leaderboard

## Features

✅ **Automatic** - No user action needed
✅ **Persistent** - Saves across devices
✅ **Anonymous** - No email/login required
✅ **Random names** - Fun usernames like "BraveHero456"
✅ **Cloud save** - Firebase stores everything
✅ **Offline support** - Falls back to localStorage

Perfect for mobile games! 🎮






