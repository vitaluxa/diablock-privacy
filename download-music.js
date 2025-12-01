/**
 * Script to download free 8-bit music tracks
 * 
 * This script helps you download free 8-bit music tracks from various sources
 * and place them in the public/music/ folder for use in the game.
 * 
 * Usage:
 * 1. Install required packages: npm install axios
 * 2. Run: node download-music.js
 * 
 * Or manually download tracks from:
 * - Eric Skiff's Resistor Anthems: https://ericskiff.com/music/
 * - Ozzed.net: https://ozzed.net/music/
 * - OpenGameArt.org: https://opengameart.org/content/5-free-tracks-for-your-game-8-bit-style-0
 * - Rodrigo Teodoro: https://teodorocomposer.itch.io/free-8-bit-chiptune-adventure-music-pack
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create music directory if it doesn't exist
const musicDir = path.join(__dirname, 'public', 'music');
if (!fs.existsSync(musicDir)) {
  fs.mkdirSync(musicDir, { recursive: true });
  console.log('Created public/music directory');
}

// Free 8-bit music tracks to download
// Note: These URLs may change. If downloads fail, manually download from:
// https://opengameart.org/content/5-free-tracks-for-your-game-8-bit-style-0
const tracksToDownload = [
  {
    name: '8bit-Adventure.mp3',
    url: 'https://opengameart.org/sites/default/files/8bit-Adventure.mp3',
    description: 'Adventure theme from OpenGameArt (CC0)'
  },
  {
    name: '8bit-Battle.mp3',
    url: 'https://opengameart.org/sites/default/files/8bit-Battle.mp3',
    description: 'Battle theme from OpenGameArt (CC0)'
  },
  {
    name: '8bit-MainMenu.mp3',
    url: 'https://opengameart.org/sites/default/files/8bit-MainMenu.mp3',
    description: 'Main menu theme from OpenGameArt (CC0)'
  },
  {
    name: '8bit-Quest.mp3',
    url: 'https://opengameart.org/sites/default/files/8bit-Quest.mp3',
    description: 'Quest theme from OpenGameArt (CC0)'
  },
  {
    name: '8bit-Village.mp3',
    url: 'https://opengameart.org/sites/default/files/8bit-Village.mp3',
    description: 'Village theme from OpenGameArt (CC0)'
  }
];

/**
 * Download a file from URL
 */
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        return downloadFile(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

/**
 * Main download function
 */
async function downloadMusic() {
  console.log('Starting music download...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const track of tracksToDownload) {
    const filepath = path.join(musicDir, track.name);
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`✓ ${track.name} already exists, skipping...`);
      successCount++;
      continue;
    }
    
    try {
      console.log(`Downloading ${track.name}...`);
      await downloadFile(track.url, filepath);
      console.log(`✓ Successfully downloaded: ${track.name}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to download ${track.name}: ${error.message}`);
      failCount++;
    }
  }
  
  console.log(`\nDownload complete!`);
  console.log(`Success: ${successCount}, Failed: ${failCount}`);
  
  if (successCount > 0) {
    console.log('\nNext steps:');
    console.log('1. Update src/services/musicService.js');
    console.log('2. Add the downloaded tracks to the tracks array:');
    console.log('   this.tracks = [');
    tracksToDownload.forEach(track => {
      if (fs.existsSync(path.join(musicDir, track.name))) {
        console.log(`     '/music/${track.name}',`);
      }
    });
    console.log('   ];');
  }
  
  if (failCount > 0) {
    console.log('\nSome downloads failed. You can manually download tracks from:');
    console.log('- https://opengameart.org/content/5-free-tracks-for-your-game-8-bit-style-0');
    console.log('- https://ericskiff.com/music/');
    console.log('- https://ozzed.net/music/');
    console.log('\nPlace downloaded files in public/music/ folder and update musicService.js');
  }
}

// Run if executed directly
if (require.main === module) {
  downloadMusic().catch(console.error);
}

module.exports = { downloadMusic };

