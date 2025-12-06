import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Android icon sizes (in dp, converted to px for different densities)
const iconSizes = {
  'mipmap-mdpi': 48,      // 1x
  'mipmap-hdpi': 72,      // 1.5x
  'mipmap-xhdpi': 96,     // 2x
  'mipmap-xxhdpi': 144,   // 3x
  'mipmap-xxxhdpi': 192,  // 4x
  'mipmap-ldpi': 36,      // 0.75x (optional, but included)
};

const sourceIcon = path.join(__dirname, '..', 'resources', 'icon.png');
const androidResPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

async function generateIcons() {
  console.log('🎨 Generating Android app icons...');
  
  // Check if source icon exists
  if (!fs.existsSync(sourceIcon)) {
    console.error('❌ Source icon not found:', sourceIcon);
    process.exit(1);
  }

  // Try to use sharp if available, otherwise use a simple copy approach
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch (e) {
    console.log('⚠️  sharp not available, will copy icon directly');
  }

  for (const [folder, size] of Object.entries(iconSizes)) {
    const folderPath = path.join(androidResPath, folder);
    const iconPath = path.join(folderPath, 'ic_launcher.png');
    const roundIconPath = path.join(folderPath, 'ic_launcher_round.png');
    const foregroundPath = path.join(folderPath, 'ic_launcher_foreground.png');
    const backgroundPath = path.join(folderPath, 'ic_launcher_background.png');

    // Ensure folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    try {
      if (sharp) {
        // Resize icon using sharp
        await sharp(sourceIcon)
          .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toFile(iconPath);
        
        await sharp(sourceIcon)
          .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toFile(roundIconPath);
        
        await sharp(sourceIcon)
          .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toFile(foregroundPath);
        
        // Create a simple background (dark blue)
        await sharp({
          create: {
            width: size,
            height: size,
            channels: 4,
            background: { r: 26, g: 26, b: 46, alpha: 1 }
          }
        }).toFile(backgroundPath);

        console.log(`✅ Generated ${folder}/ic_launcher.png (${size}x${size})`);
      } else {
        // Fallback: just copy the source icon (Android will scale it)
        fs.copyFileSync(sourceIcon, iconPath);
        fs.copyFileSync(sourceIcon, roundIconPath);
        fs.copyFileSync(sourceIcon, foregroundPath);
        console.log(`⚠️  Copied icon to ${folder} (using source size - install sharp for proper resizing)`);
      }
    } catch (error) {
      console.error(`❌ Error generating icons for ${folder}:`, error.message);
    }
  }

  console.log('\n✅ Android icons generation complete!');
}

generateIcons().catch(console.error);


