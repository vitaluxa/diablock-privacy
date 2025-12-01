# Firebase Setup Checklist - Dia Block

## ✅ What You've Done

✅ **Created Firebase Project** - `diablock-2c004`
✅ **Registered Web App** - App ID: `1:813640461264:web:921c0ca6e7e08486bca7d5`
✅ **Registered Firebase Hosting** - Ready for deployment
✅ **Updated .env file** - Firebase config saved

## 🔧 Final Setup Steps

### Step 1: Enable Anonymous Authentication

1. Go to: https://console.firebase.google.com/project/diablock-2c004/authentication
2. Click **"Get started"** (if first time)
3. Click **"Sign-in method"** tab
4. Find **"Anonymous"** in the list
5. Click on **"Anonymous"**
6. Toggle **"Enable"** to ON
7. Click **"Save"**

### Step 2: Create Firestore Database

1. Go to: https://console.firebase.google.com/project/diablock-2c004/firestore
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose location closest to your users (e.g., `us-central` or `europe-west`)
5. Click **"Enable"**

### Step 3: Set Firestore Security Rules

1. In Firestore Database, click **"Rules"** tab
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

### Step 4: Verify .env File

Your `.env` file should now have:
```env
VITE_FIREBASE_API_KEY=AIzaSyB6J2jSJzsrTNgNXMqGUSTKcarLONFXp-4
VITE_FIREBASE_AUTH_DOMAIN=diablock-2c004.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=diablock-2c004
VITE_FIREBASE_STORAGE_BUCKET=diablock-2c004.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=813640461264
VITE_FIREBASE_APP_ID=1:813640461264:web:921c0ca6e7e08486bca7d5
VITE_FIREBASE_MEASUREMENT_ID=G-1583FWEHRV
```

✅ **Already done!**

### Step 5: Restart Dev Server

```bash
npm run dev
```

### Step 6: Test It!

1. Open http://localhost:5173
2. The app should automatically:
   - Sign in anonymously ✅
   - Generate random username (e.g., "CoolPlayer1234") ✅
   - Display username in main menu ✅
3. Play the game and complete a level
4. Check Firebase Console:
   - Go to **Authentication** → Should see an anonymous user
   - Go to **Firestore Database** → Should see `users` collection with your data
5. Close and reopen app → Progress should be restored! ✨

## 🚀 Firebase Hosting Setup (For Deployment)

Since you've already registered hosting, here's how to deploy:

### Install Firebase CLI (if not already installed):

```bash
npm install -g firebase-tools
```

### Login to Firebase:

```bash
firebase login
```

### Initialize Hosting (if not already done):

```bash
firebase init hosting
```

When prompted:
- **Public directory:** `dist`
- **Single-page app:** `Yes`
- **Automatic builds:** `No` (we'll build manually)
- **Overwrite index.html:** `No`

### Deploy:

```bash
# Build the app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Your app will be live at: `https://diablock-2c004.web.app`

## ✅ Final Checklist

- [ ] Anonymous Authentication enabled
- [ ] Firestore Database created
- [ ] Firestore Security Rules set
- [ ] `.env` file updated with config ✅
- [ ] Dev server restarted
- [ ] Tested locally
- [ ] Anonymous user appears in Authentication
- [ ] User data appears in Firestore
- [ ] Progress saves and loads correctly

## 🎮 How It Works Now

1. **User opens app** → Automatically signs in anonymously
2. **Username generated** → Random name like "SwiftMaster789"
3. **Progress saved** → Level and score saved to Firebase
4. **User returns** → Continues from same level/score
5. **Leaderboard** → Global scores visible to all players

## 📊 Firebase Console Links

- **Project Overview:** https://console.firebase.google.com/project/diablock-2c004
- **Authentication:** https://console.firebase.google.com/project/diablock-2c004/authentication
- **Firestore Database:** https://console.firebase.google.com/project/diablock-2c004/firestore
- **Hosting:** https://console.firebase.google.com/project/diablock-2c004/hosting

## 🐛 Troubleshooting

**"Firebase not configured" error:**
→ Check `.env` file exists and has all values
→ Restart dev server after updating `.env`

**"Anonymous auth not enabled" error:**
→ Enable Anonymous Authentication in Firebase Console

**"Permission denied" error:**
→ Check Firestore Security Rules are published
→ Make sure rules allow anonymous users

**Progress not saving:**
→ Check browser console for errors
→ Verify Firestore Database is created
→ Check Firestore Rules are correct

## 🎉 You're All Set!

Once you complete steps 1-3 above, your game will have:
- ✅ No login required
- ✅ Automatic cloud save
- ✅ Resume from where you left off
- ✅ Global leaderboard
- ✅ Ready for Google Play Store!

Good luck! 🚀





