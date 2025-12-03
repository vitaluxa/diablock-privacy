import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function calculateCumulativeScore(targetLevel) {
  console.log(`Calculating cumulative best score for Level ${targetLevel}...\n`);
  
  const levelsPath = path.join(__dirname, 'public', 'levels.json');
  const levelsData = JSON.parse(fs.readFileSync(levelsPath, 'utf8'));

  if (!levelsData.metadata) {
    console.error('Error: No metadata found in levels.json. Run solve-levels.js first.');
    process.exit(1);
  }

  let totalScore = 0;
  let levelCount = 0;

  for (let level = 1; level <= targetLevel; level++) {
    const metadata = levelsData.metadata[level.toString()];
    
    if (metadata && metadata.bestScore !== undefined) {
      totalScore += metadata.bestScore;
      levelCount++;
    } else {
      console.warn(`Warning: No best score found for level ${level}`);
    }
  }

  console.log(`Results for Level ${targetLevel}:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Levels processed: ${levelCount}/${targetLevel}`);
  console.log(`Cumulative Best Score: ${totalScore.toLocaleString()}`);
  console.log(`Average Best Score per Level: ${Math.round(totalScore / levelCount).toLocaleString()}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // Also show some stats
  const scores = [];
  for (let level = 1; level <= targetLevel; level++) {
    const metadata = levelsData.metadata[level.toString()];
    if (metadata && metadata.bestScore !== undefined) {
      scores.push(metadata.bestScore);
    }
  }

  if (scores.length > 0) {
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    console.log(`Additional Stats:`);
    console.log(`  Lowest level score: ${minScore.toLocaleString()}`);
    console.log(`  Highest level score: ${maxScore.toLocaleString()}`);
  }

  return totalScore;
}

// Calculate for level 500
calculateCumulativeScore(500);
