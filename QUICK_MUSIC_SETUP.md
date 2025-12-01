# Quick Music Setup Guide

## 🎵 Add 8-Bit Music in 3 Steps

### Step 1: Download Free Tracks

Visit one of these sites and download 8-bit music tracks:

**Recommended (Easiest):**
- **OpenGameArt** (5 free tracks, no attribution needed): 
  https://opengameart.org/content/5-free-tracks-for-your-game-8-bit-style-0
  - Click "Download" button
  - Extract the ZIP file
  - You'll get 5 MP3 files

**Alternative Sources:**
- **Eric Skiff's Resistor Anthems**: https://ericskiff.com/music/
- **Ozzed.net**: https://ozzed.net/music/
- **ELV Games**: https://elvgames.itch.io/free-8-bit-collection-pack

### Step 2: Place Files in Project

1. Copy the downloaded MP3 files
2. Paste them into: `public/music/` folder
3. Make sure the folder structure looks like:
   ```
   public/
     music/
       8bit-Adventure.mp3
       8bit-Battle.mp3
       8bit-MainMenu.mp3
       (etc...)
   ```

### Step 3: Update musicService.js

1. Open `src/services/musicService.js`
2. Find the `tracks` array (around line 28)
3. Add your track filenames:

```javascript
this.tracks = [
  '/music/8bit-Adventure.mp3',
  '/music/8bit-Battle.mp3',
  '/music/8bit-MainMenu.mp3',
  '/music/8bit-Quest.mp3',
  '/music/8bit-Village.mp3',
];
```

4. Save the file
5. Restart your dev server (`npm run dev`)
6. Music will play automatically! 🎉

## 🎮 Testing

1. Start the game: `npm run dev`
2. Click anywhere on the page (browser autoplay restriction)
3. Music should start playing
4. Use the 🔊 button to mute/unmute

## ⚠️ Troubleshooting

**No music playing?**
- Check browser console for errors (F12)
- Make sure files are in `public/music/` (not `src/` or `dist/`)
- Verify filenames in `tracks` array match actual files
- Restart dev server after adding files

**Files not found?**
- Check file paths start with `/music/` (not `./music/` or `music/`)
- Ensure files are MP3 or OGG format
- Restart dev server

**Still not working?**
- The fallback procedural music will play automatically
- This means the service is working, just no tracks loaded yet

## 📝 Notes

- **No tracks?** The game will use procedural 8-bit music automatically
- **File formats:** MP3 and OGG are supported
- **Licensing:** Most free tracks require attribution - check each source
- **Production:** Always download tracks locally (don't use external URLs)

That's it! Enjoy your 8-bit background music! 🎵




