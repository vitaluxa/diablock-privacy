# Background Music Setup

## How It Works

The game now has continuous background music that plays infinitely/loops automatically. The music service is already integrated and ready to use.

## Current Setup

- **Music Service**: `src/services/musicService.js`
- **Music Hook**: `src/hooks/useBackgroundMusic.js`
- **Volume Control**: Available in main menu and game header
- **Auto-play**: Starts automatically after first user interaction (due to browser restrictions)

## Adding Your Own Music

### Option 1: Add Music File to Project

1. Create a `public/sounds` folder in your project root:
   ```
   public/
     sounds/
       background-music.mp3
   ```

2. Update `src/hooks/useBackgroundMusic.js`:
   ```javascript
   // Change this line:
   musicService.initialize();
   
   // To:
   musicService.initialize('/sounds/background-music.mp3');
   ```

### Option 2: Use Online Music URL

Update `src/hooks/useBackgroundMusic.js`:
```javascript
musicService.initialize('https://your-music-url.com/background-music.mp3');
```

### Option 3: Use Web Audio API (Generate Music)

The service can generate procedural music using Web Audio API. You can modify `musicService.js` to generate tones/chords.

## Features

✅ **Continuous Loop** - Music plays infinitely  
✅ **Volume Control** - Slider in main menu  
✅ **Mute/Unmute** - Toggle button in menu and game header  
✅ **Persistent Settings** - Volume and mute state saved to localStorage  
✅ **Auto-start** - Starts after first user interaction  
✅ **Graceful Fallback** - Works even if music file fails to load  

## Music Controls

- **Main Menu**: Volume slider and mute button
- **Game Header**: Mute/unmute button (🔊/🔇)
- **Settings Persist**: Your volume and mute preferences are saved

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Auto-play requires user interaction due to browser policies

## Recommended Music Format

- **Format**: MP3 or OGG (for better browser compatibility)
- **File Size**: Keep under 2-3 MB for faster loading
- **Duration**: Any length (will loop infinitely)
- **Style**: Calm, ambient music works well for puzzle games

## Example Music Sources

Free music for games:
- Freesound.org
- Incompetech.com (royalty-free)
- OpenGameArt.org
- YouTube Audio Library

Make sure to check licensing for commercial use!

## Current Status

The music service is set up with a silent placeholder. To add real music, just:
1. Add your music file to `public/sounds/`
2. Update the initialize call in `useBackgroundMusic.js`
3. Done! Music will loop continuously.

The infrastructure is ready - just add your music file! 🎵





