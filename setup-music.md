# Music Setup Guide

This guide will help you add free 8-bit music tracks to your game.

## Quick Setup (Recommended)

### Option 1: Download from OpenGameArt (Easiest)

1. Visit: https://opengameart.org/content/5-free-tracks-for-your-game-8-bit-style-0
2. Download all 5 tracks (they're free and CC0 licensed)
3. Place the MP3 files in `public/music/` folder
4. Update `src/services/musicService.js` - add the tracks to the `tracks` array:

```javascript
this.tracks = [
  '/music/8bit-Adventure.mp3',
  '/music/8bit-Battle.mp3',
  '/music/8bit-MainMenu.mp3',
  '/music/8bit-Quest.mp3',
  '/music/8bit-Village.mp3',
];
```

### Option 2: Download from Eric Skiff's Resistor Anthems

1. Visit: https://ericskiff.com/music/
2. Download the "Resistor Anthems" album (free, CC-BY licensed)
3. Extract and place MP3 files in `public/music/` folder
4. Add track names to the `tracks` array in `musicService.js`

### Option 3: Use the Download Script

1. Run the download script (requires Node.js):
```bash
node download-music.js
```

This will attempt to download some free tracks automatically.

## Manual Download Links

Here are direct links to free 8-bit music:

### OpenGameArt (5 tracks, CC0 - No attribution required)
- https://opengameart.org/content/5-free-tracks-for-your-game-8-bit-style-0

### Eric Skiff's Resistor Anthems (CC-BY - Attribution required)
- https://ericskiff.com/music/

### Ozzed.net (Multiple albums, CC-BY)
- https://ozzed.net/music/

### ELV Games Free 8-BIT Music Pack
- https://elvgames.itch.io/free-8-bit-collection-pack

### Rodrigo Teodoro's Free 8-Bit Adventure Music
- https://teodorocomposer.itch.io/free-8-bit-chiptune-adventure-music-pack

## After Downloading

1. Place all MP3/OGG files in `public/music/` folder
2. Open `src/services/musicService.js`
3. Find the `tracks` array (around line 28)
4. Add your track paths:

```javascript
this.tracks = [
  '/music/your-track-1.mp3',
  '/music/your-track-2.mp3',
  '/music/your-track-3.mp3',
];
```

5. Save and restart your dev server
6. Music should now play automatically!

## Testing

1. Start your dev server: `npm run dev`
2. Open the game in your browser
3. Click anywhere to start music (browser autoplay restrictions)
4. Use the 🔊 button to toggle mute/unmute

## Troubleshooting

**Music not playing?**
- Check browser console for errors
- Ensure files are in `public/music/` folder (not `src/`)
- Check file paths in `tracks` array match actual filenames
- Try clicking on the page first (browser autoplay restrictions)

**Files not found?**
- Make sure files are in `public/music/` not `dist/music/`
- Restart dev server after adding files
- Check file extensions match (.mp3, .ogg, etc.)

**No tracks available?**
- The fallback procedural music will play automatically
- Download tracks using one of the methods above

## License Notes

- **CC0**: No attribution required (OpenGameArt tracks)
- **CC-BY**: Must credit the artist (Eric Skiff, Ozzed, etc.)
- Check individual track licenses before commercial use

For production, always:
1. Download tracks locally (don't use external URLs)
2. Include proper attribution if required
3. Verify licenses for your use case





