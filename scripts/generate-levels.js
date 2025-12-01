import { StaticLevelGenerator } from '../src/services/StaticLevelGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🎮 Dia Block - Level Generation Script\n');
  console.log('This will generate 1000 pre-validated levels with perfect difficulty progression.\n');

  const generator = new StaticLevelGenerator();

  // Generate all levels
  const levels = await generator.generateAllLevels();

  // Validate all levels
  const allValid = generator.validateAllLevels(levels);

  if (!allValid) {
    console.error('\n❌ Some levels failed validation. Please review the output above.\n');
    process.exit(1);
  }

  // Save to JSON file
  const outputPath = path.join(__dirname, '../public/levels.json');
  const outputDir = path.dirname(outputPath);

  // Ensure public directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(levels, null, 2));

  console.log(`\n💾 Levels saved to: ${outputPath}`);
  console.log(`📊 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB\n`);
  console.log('✅ Level generation complete!\n');
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
