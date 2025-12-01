# Debug Controls Testing Guide

## Overview
The debug controls are now integrated into the game for development testing. They allow you to:
- Select and move blocks with keyboard
- Jump to specific levels
- Auto-solve levels
- Auto-test multiple levels
- Check for errors

## Keyboard Controls

### Block Selection & Movement
- **Tab** - Select next block
- **Shift+Tab** - Select previous block
- **Arrow Keys** - Move selected block (respects block orientation)

### Level Navigation
- **Ctrl+0-9** - Jump to level (Ctrl+0 = level 10, Ctrl+1 = level 1, etc.)
- **N** - Next level
- **R** - Reset current level

### Automation
- **S** - Auto-solve current level (moves red block to exit if path is clear)
- **A** - Auto-test levels 1-50

### Diagnostics
- **C** - Check for errors in current level
- **H** - Show help in console

## Console Commands

The debug controls are exposed to the browser console as `window.debugControls`. You can use these commands:

### Test Specific Level Range
```javascript
debugControls.autoTest(1, 50)  // Test levels 1-50
debugControls.autoTest(10, 20) // Test levels 10-20
```

### Jump to Specific Level
```javascript
debugControls.jumpToLevel(25)  // Jump to level 25
```

### Check Current Level for Errors
```javascript
debugControls.checkErrors()  // Returns array of errors (empty if no errors)
```

### View Error Log
```javascript
debugControls.getErrorLog()  // View all logged errors
```

## How to Test Levels 1-50

### Method 1: Keyboard Shortcut
1. Load the game in development mode
2. Press **A** key
3. Watch the console as it tests each level
4. It will stop if it finds any errors

### Method 2: Console Command
1. Open browser console (F12)
2. Run: `debugControls.autoTest(1, 50)`
3. Monitor the console output

### Method 3: Manual Testing with Keyboard
1. Press **Ctrl+1** to jump to level 1
2. Press **Tab** to select blocks
3. Use **Arrow Keys** to move blocks
4. Press **C** to check for errors
5. Press **N** to go to next level
6. Repeat for each level

## What Gets Tested

The auto-test function checks each level for:
- ✅ Blocks exist
- ✅ Red block exists and is in correct position (row 2)
- ✅ Red block is horizontal
- ✅ All blocks are within grid bounds
- ✅ No blocks extend beyond grid
- ✅ No blocks overlap
- ✅ All block positions are valid

## Expected Output

### Successful Test
```
[DEBUG] 🚀 Starting auto-test from level 1 to 50...
[DEBUG] Testing level 1...
[DEBUG] ✅ No errors found
[DEBUG] ✅ Level 1 passed
[DEBUG] Testing level 2...
[DEBUG] ✅ No errors found
[DEBUG] ✅ Level 2 passed
...
[DEBUG] 🎉 Auto-test complete!
```

### Failed Test
```
[DEBUG] Testing level 15...
[DEBUG ERROR] ❌ Errors found:
[DEBUG ERROR]   - Block xyz extends beyond grid horizontally
[DEBUG ERROR] ❌ Level 15 has errors!
```

## Production Build

**IMPORTANT**: Debug controls are ONLY active in development mode (`import.meta.env.DEV`). They will NOT be included in production builds.

To verify debug controls are disabled in production:
1. Run `npm run build`
2. Serve the build
3. Open console - you should NOT see debug messages
4. Keyboard shortcuts should NOT work

## Troubleshooting

### Debug controls not working
- Make sure you're running in development mode (`npm run dev`)
- Check console for "[DEBUG] Debug controls enabled" message
- Try pressing **H** to show help

### Can't move blocks with arrow keys
- Press **Tab** first to select a block
- Selected block will have a green pulsing outline
- Arrow keys only work in the block's allowed direction (horizontal/vertical)

### Auto-solve not working
- Some levels may not be solvable with simple auto-solve
- Auto-solve only moves red block right if path is clear
- You may need to manually move blocking blocks first

## Notes

- Debug controls use keyboard events that don't interfere with normal touch/mouse gameplay
- Selected blocks are highlighted with a green pulsing outline
- All debug actions are logged to console with green `[DEBUG]` prefix
- Errors are logged with red `[DEBUG ERROR]` prefix
