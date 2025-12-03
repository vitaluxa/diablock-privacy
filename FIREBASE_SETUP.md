# Firebase Setup Guide for Dia Block

## Quick Setup (5 Minutes)

### Step 1: Create Firebase Project

1. Go to: https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: **"Dia Block"**
4. (Optional) Enable Google Analytics
5. Click **"Create project"**

### Step 2: Add Web App

1. In Firebase Console, click the **web icon** (`</>`)
2. Register app name: **"Dia Block Web"**
3. (Optional) Check "Also set up Firebase Hosting"
4. Click **"Register app"**

### Step 3: Copy Firebase Configuration

You'll see a code snippet like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "dia-block.firebaseapp.com",
  projectId: "dia-block",
  storageBucket: "dia-block.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**Copy these values** - you'll need them for the `.env` file.

### Step 4: Enable Anonymous Authentication

1. In Firebase Console, go to **Authentication**
2. Click **"Get started"** (if first time)
3. Click **"Sign-in method"** tab
4. Click on **"Anonymous"**
5. Enable it (toggle to ON)
6. Click **"Save"**

### Step 5: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose a location (closest to your users)
5. Click **"Enable"**

### Step 6: Set Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the rules with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Leaderboard is readable by all, writable by authenticated users
    match /leaderboard/{entryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

### Step 7: Update .env File

1. Open your `.env` file in the project root
2. Replace with Firebase config:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

3. **Replace** all the `your-*` values with your actual Firebase config values from Step 3

### Step 8: Restart Dev Server

```bash
npm run dev
```

### Step 9: Test It!

1. Open http://localhost:5173
2. The app will automatically:
   - Sign in anonymously
   - Generate a random username (e.g., "CoolPlayer1234")
   - Save progress to Firebase
3. Play the game and complete a level
4. Close and reopen the app - your progress should be restored! ✨

## How It Works

### Automatic Features:

✅ **No Login Required** - Users are automatically signed in anonymously
✅ **Random Username** - Each user gets a unique random username (e.g., "SwiftMaster789")
✅ **Cloud Save** - Progress (level, score) saved to Firebase automatically
✅ **Resume Game** - When user returns, they continue from where they left off
✅ **Global Leaderboard** - Scores saved to Firebase for all players to see

### Data Stored in Firebase:

1. **Users Collection** (`users/{userId}`):
   - `username`: Random generated username
   - `level`: Current level number
   - `globalScore`: Total score
   - `lastPlayed`: Last play timestamp
   - `bestScore`: Best score achieved

2. **Leaderboard Collection** (`leaderboard/{entryId}`):
   - `userId`: User ID
   - `username`: Display name
   - `score`: Score achieved
   - `level`: Level completed
   - `timestamp`: When score was achieved

## For Production

### Update Security Rules:

When ready for production, update Firestore rules to be more restrictive:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /leaderboard/{entryId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### Enable Firebase Hosting (Optional):

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Troubleshooting

### "Firebase not configured" error
→ Check `.env` file has all Firebase config values

### "Permission denied" error
→ Check Firestore security rules are published

### "Anonymous auth not enabled"
→ Enable Anonymous authentication in Firebase Console

### Progress not saving
→ Check browser console for errors
→ Verify Firestore database is created and enabled

## Features

✅ **Automatic authentication** - No user action required
✅ **Persistent progress** - Saves across devices (same user)
✅ **Global leaderboard** - See all player scores
✅ **Offline support** - Falls back to localStorage if Firebase unavailable
✅ **Random usernames** - Unique names like "BraveHero456"

That's it! Your game now has cloud save without requiring any login! 🎉






