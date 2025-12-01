# Debug Guide - Dia Block Game

## Overview

Your APK now includes comprehensive debugging capabilities using **Firebase Analytics** to track all game events, errors, and block states. This will help identify and fix issues with abnormal blocks and stacking problems.

## What's Been Added

### 1. **Debug Service** (`src/services/debugService.js`)
A comprehensive debugging service that:
- ✅ Logs all game events to Firebase Analytics
- ✅ Validates block positions and detects overlaps
- ✅ Tracks collision issues and blocked movements
- ✅ Logs abnormal block states
- ✅ Records error stack traces with context
- ✅ Maintains event history for analysis

### 2. **Automatic Block Validation**
Every block is validated for:
- Position within grid bounds (0-5 for 6x6 grid)
- Valid block type (horizontal/vertical)
- Valid size (2-6 cells)
- No overlaps with other blocks
- Correct orientation

### 3. **Event Tracking**

#### Game Events Logged:
- `firebase_init` - Firebase initialization
- `user_auth` - User authentication
- `level_generation` - Level creation (success/failure)
- `level_won` - Level completion with score details
- `block_created` - Each block when level loads
- `block_moved` - Every block movement
- `user_action` - User interactions (drag_start, etc.)
- `game_error` - Any errors that occur
- `collision_issue` - Blocked movements and overlaps
- `abnormal_block` - Invalid block states
- `performance_metric` - Performance data

#### Each Event Includes:
- Timestamp
- Level number
- Block details (position, type, size)
- Context (moves, time, score)
- Error messages and stack traces

## How to View Debug Data

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Analytics → Events**
4. View real-time events and filter by:
   - Event name (e.g., `abnormal_block`, `collision_issue`)
   - Time range
   - User properties

### Option 2: Browser Console (Development)
When testing in browser:
1. Open DevTools (F12)
2. Go to Console tab
3. All events are logged with emoji prefixes:
   - 📊 Events
   - ❌ Errors
   - ⚠️ Warnings
   - 🔍 Debug info

### Option 3: Export Debug Data
In development, you can call:
```javascript
debugService.exportDebugData()
```
This downloads a JSON file with all events, errors, and game state history.

## Common Issues to Look For

### 1. **Abnormal Blocks**
Look for `abnormal_block` events with reasons like:
- "x position out of bounds"
- "invalid block type"
- "block extends beyond grid"

### 2. **Collision Issues**
Check `collision_issue` events:
- `block_overlap` - Blocks occupying same cells
- `blocked_movement` - Movement prevented by collision

### 3. **Level Generation Errors**
Monitor `level_generation` events:
- `success: false` indicates generation failure
- Check `blockCount` for unusual numbers

### 4. **Stacking Problems**
Watch for:
- Multiple `block_moved` events to same position
- `collision_issue` with type `block_overlap`
- Abnormal block positions after movements

## Debugging Workflow

### Step 1: Reproduce the Issue
1. Install the APK on your Android device
2. Play the game until you encounter the problem
3. Note the level number and what happened

### Step 2: Check Firebase Analytics
1. Open Firebase Console
2. Go to Analytics → Events
3. Filter by time range when issue occurred
4. Look for:
   - `abnormal_block` events
   - `collision_issue` events
   - `game_error` events

### Step 3: Analyze Event Details
Each event shows:
- **Level number** - Which level had the issue
- **Block details** - Position, type, size
- **Context** - What was happening when error occurred
- **Timestamp** - Exact time of issue

### Step 4: Review Event Sequence
Look at the sequence of events leading to the problem:
1. `level_generation` - How level was created
2. `block_created` - All blocks at level start
3. `block_moved` - Movement history
4. `abnormal_block` or `collision_issue` - The problem

## Firebase Analytics Setup

If Firebase isn't configured yet:

1. **Get Firebase Config**:
   - Go to Firebase Console
   - Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy the config values

2. **Update `.env` file**:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **Rebuild APK**:
   ```bash
   npm run build
   npx cap sync android
   cd android && gradlew.bat assembleDebug
   ```

## Debug Controls (Development Only)

The game includes debug controls for testing:
- Press `D` to toggle debug mode
- Press `W` to win current level instantly
- Press `N` to skip to next level
- Press `R` to reset current level

## Performance Monitoring

The debug service also tracks performance:
- Level generation time
- Block validation time
- Movement response time

Check `performance_metric` events in Firebase.

## Troubleshooting

### No Events in Firebase?
1. Check `.env` file has correct Firebase config
2. Verify internet connection on device
3. Wait a few minutes for events to appear (not instant)
4. Check Firebase Console → Analytics → DebugView for real-time events

### Too Many Events?
Events are automatically throttled and limited to:
- Last 50 events in memory
- Last 50 game states
- Last 50 errors

### Can't See Specific Issue?
Add custom logging:
```javascript
import { debugService } from './services/debugService';

debugService.logEvent('custom_event', {
  myData: 'value',
  level: levelNumber
});
```

## Next Steps

1. **Install the updated APK** on your device
2. **Play the game** and reproduce the issues
3. **Check Firebase Analytics** for events
4. **Share the event data** with me so I can analyze and fix the root cause

The debug data will show exactly:
- Which blocks are abnormal
- When stacking occurs
- What causes the issues
- The exact sequence of events

This will make it much easier to identify and fix the problems! 🎯
