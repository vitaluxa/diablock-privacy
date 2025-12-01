
import { LevelGenerator } from './src/services/levelGenerator.js';

async function runTest() {
  console.log('Starting level generation test...');
  const generator = new LevelGenerator();
  const hashes = new Set();
  const duplicates = [];

  for (let i = 1; i <= 30; i++) {
    try {
      console.log(`Generating level ${i}...`);
      const blocks = await generator.generateLevel(i);
      const hash = generator.getLevelHash(blocks);
      
      if (hashes.has(hash)) {
        console.warn(`⚠️ Duplicate level detected at level ${i}! Hash: ${hash}`);
        duplicates.push(i);
      } else {
        hashes.add(hash);
        console.log(`✅ Level ${i} unique. Hash: ${hash.substring(0, 20)}...`);
      }
    } catch (error) {
      console.error(`Error generating level ${i}:`, error);
    }
  }

  console.log('Test complete.');
  console.log(`Total duplicates found: ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.log('Duplicate levels:', duplicates);
  }
}

runTest();
