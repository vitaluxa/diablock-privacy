# Quick Debug Reference

## 🎯 What's New in This APK

Your game now has **comprehensive debugging** built-in! Every action, error, and block state is tracked and logged to Firebase Analytics.

## 📊 What Gets Tracked

### Block Issues
- ⚠️ **Abnormal blocks** - Invalid positions, sizes, or types
- 🔴 **Overlapping blocks** - Blocks occupying same cells
- 🚫 **Blocked movements** - Collision detection issues

### Game Events
- 🎮 **Level generation** - Success/failure with block count
- 🏆 **Level completion** - Score, moves, time
- 🖱️ **User actions** - Every drag, click, movement
- ❌ **Errors** - Full stack traces with context

### Validation (Automatic)
Every block is checked for:
- ✅ Position in bounds (0-5)
- ✅ Valid type (horizontal/vertical)
- ✅ Correct size (2-6 cells)
- ✅ No overlaps with other blocks

## 🔍 How to View Debug Data

### In Firebase Console:
1. Go to https://console.firebase.google.com/
2. Select your project
3. **Analytics → Events**
4. Filter by event name:
   - `abnormal_block` - Invalid blocks
   - `collision_issue` - Stacking problems
   - `level_generation` - Level creation
   - `game_error` - Errors

### In Browser Console (Dev):
- Open DevTools (F12)
- All events logged with emoji prefixes
- Real-time debugging

## 🐛 Finding Issues

### Abnormal Blocks:
```
Event: abnormal_block
Reason: "x position out of bounds: 7"
Level: 5
Block: { id: 3, type: "horizontal", x: 7, y: 2 }
```

### Stacking Problems:
```
Event: collision_issue
Type: "block_overlap"
Blocks: "blocks 2 and 5 at [3,4]"
Level: 8
```

### Generation Errors:
```
Event: level_generation
Success: false
Error: "Failed to generate valid level"
Level: 12
```

## 📱 Testing Workflow

1. **Install APK** → `apk/dia-block-game.apk`
2. **Play game** → Reproduce the issue
3. **Check Firebase** → View events in Analytics
4. **Share data** → Send me the event details

## 🔧 Debug Controls (Dev Mode)

Press these keys in browser:
- `D` - Toggle debug mode
- `W` - Win level instantly
- `N` - Next level
- `R` - Reset level

## 📦 APK Location

**File**: `apk/dia-block-game.apk` (23.2 MB)

## ⚡ Quick Install

### USB Method:
```bash
install-apk.bat
```

### Manual:
1. Copy APK to phone
2. Open and install
3. Allow unknown sources if needed

## 🎯 What This Solves

### Before:
- ❌ Can't see what's wrong
- ❌ Can't track when issues occur
- ❌ No error details
- ❌ Hard to reproduce

### After:
- ✅ Every event logged
- ✅ Exact timestamps
- ✅ Full error context
- ✅ Block validation
- ✅ Collision detection
- ✅ Performance metrics

## 📊 Example Debug Session

1. **Issue**: Blocks stacking on level 7
2. **Check Firebase**: Filter `level_number = 7`
3. **Find**: `collision_issue` event
4. **Details**: 
   - Blocks 3 and 5 overlapping
   - Position [2,3]
   - Happened after 8 moves
5. **Fix**: Adjust collision detection logic

## 🚀 Next Steps

1. Install the APK
2. Play until you see the issue
3. Check Firebase Analytics
4. Share the event data with me

The debug logs will show **exactly** what's happening! 🎯

---

**Full Guide**: See `DEBUG_GUIDE.md` for complete documentation
