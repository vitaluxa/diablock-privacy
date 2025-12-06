/**
 * Calculate Best Moves and Scores for All Levels
 * 
 * Uses BFS solver to find minimum moves for each level,
 * then calculates the optimal score (assuming 0 time).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import PuzzleSolver - need to adapt for Node.js
class PuzzleSolver {
  constructor(gridSize = 6) {
    this.gridSize = gridSize;
    this.exitRow = 2; // Red block must be on row 2 (0-indexed)
  }

  /**
   * Find solution path (returns moves needed to solve)
   */
  findSolution(blocks) {
    const redBlock = blocks.find(b => b.isRed);
    if (!redBlock || !redBlock.isHorizontal || redBlock.row !== this.exitRow) {
      return [];
    }

    const initialState = this.serializeState(blocks);
    const queue = [{ 
      state: initialState, 
      blocks: blocks,
      path: []
    }];
    const visited = new Set([initialState]);
    
    let iterations = 0;
    const MAX_ITERATIONS = 50000;

    while (queue.length > 0) {
      iterations++;
      if (iterations > MAX_ITERATIONS) {
        console.warn('Solver timed out');
        return [];
      }

      const { state, blocks: currentBlocks, path } = queue.shift();
      
      // Check if red block reached the exit
      const currentRedBlock = currentBlocks.find(b => b.isRed);
      if (currentRedBlock.col + currentRedBlock.length === this.gridSize) {
        return path; // Return solution path
      }

      // Try all possible moves
      for (let i = 0; i < currentBlocks.length; i++) {
        const block = currentBlocks[i];
        const moves = this.getPossibleMoves(currentBlocks, i);
        
        for (const move of moves) {
          const newBlocks = this.applyMove(currentBlocks, i, move);
          const newState = this.serializeState(newBlocks);
          
          if (!visited.has(newState)) {
            visited.add(newState);
            const newPath = [...path, {
              blockId: block.id,
              fromRow: block.row,
              fromCol: block.col,
              toRow: move.row,
              toCol: move.col
            }];
            queue.push({ state: newState, blocks: newBlocks, path: newPath });
          }
        }
      }
    }

    return []; // No solution found
  }

  /**
   * Get all possible moves for a block
   */
  getPossibleMoves(blocks, blockIndex) {
    const block = blocks[blockIndex];
    const moves = [];

    if (block.isHorizontal) {
      // Try moving left
      for (let newCol = block.col - 1; newCol >= 0; newCol--) {
        if (this.canMoveTo(blocks, blockIndex, block.row, newCol)) {
          moves.push({ row: block.row, col: newCol });
        } else {
          break;
        }
      }
      // Try moving right
      for (let newCol = block.col + 1; newCol + block.length <= this.gridSize; newCol++) {
        if (this.canMoveTo(blocks, blockIndex, block.row, newCol)) {
          moves.push({ row: block.row, col: newCol });
        } else {
          break;
        }
      }
    } else {
      // Try moving up
      for (let newRow = block.row - 1; newRow >= 0; newRow--) {
        if (this.canMoveTo(blocks, blockIndex, newRow, block.col)) {
          moves.push({ row: newRow, col: block.col });
        } else {
          break;
        }
      }
      // Try moving down
      for (let newRow = block.row + 1; newRow + block.length <= this.gridSize; newRow++) {
        if (this.canMoveTo(blocks, blockIndex, newRow, block.col)) {
          moves.push({ row: newRow, col: block.col });
        } else {
          break;
        }
      }
    }

    return moves;
  }

  /**
   * Check if a block can move to a new position
   */
  canMoveTo(blocks, blockIndex, newRow, newCol) {
    const block = blocks[blockIndex];
    const blockLength = block.length;
    const isHorizontal = block.isHorizontal;

    // Check bounds
    if (newRow < 0 || newCol < 0) return false;
    if (isHorizontal) {
      if (newRow >= this.gridSize || newCol + blockLength > this.gridSize) return false;
    } else {
      if (newRow + blockLength > this.gridSize || newCol >= this.gridSize) return false;
    }

    // Check collisions with other blocks
    for (let i = 0; i < blocks.length; i++) {
      if (i === blockIndex) continue;
      
      const other = blocks[i];
      
      // Current block ranges
      const r1 = newRow;
      const c1 = newCol;
      const r1End = isHorizontal ? r1 : r1 + blockLength - 1;
      const c1End = isHorizontal ? c1 + blockLength - 1 : c1;

      // Other block ranges
      const r2 = other.row;
      const c2 = other.col;
      const r2End = other.isHorizontal ? r2 : r2 + other.length - 1;
      const c2End = other.isHorizontal ? c2 + other.length - 1 : c2;

      // Check overlap
      if (r1 <= r2End && r1End >= r2 && c1 <= c2End && c1End >= c2) {
        return false; // Collision detected
      }
    }

    return true;
  }

  /**
   * Apply a move to create a new block configuration
   */
  applyMove(blocks, blockIndex, newPos) {
    return blocks.map((block, i) => {
      if (i === blockIndex) {
        return { ...block, row: newPos.row, col: newPos.col };
      }
      return block;
    });
  }

  /**
   * Serialize block state for visited set
   */
  serializeState(blocks) {
    return blocks
      .map(b => `${b.row},${b.col}`)
      .join('|');
  }
}

/**
 * Calculate best score for a level
 * Formula: max(0, (1000 × levelNumber) - (bestMoves × 10))
 * Assumes 0 time penalty for optimal score
 */
function calculateBestScore(levelNumber, bestMoves) {
  const baseScore = 1000 * levelNumber;
  const movePenalty = bestMoves * 10;
  return Math.max(0, baseScore - movePenalty);
}

/**
 * Process all levels and calculate best moves/scores
 */
async function calculateBestScores() {
  console.log('🚀 Starting best moves and scores calculation...\n');

  const levelsPath = path.join(__dirname, '..', 'public', 'levels.json');
  const levelsData = JSON.parse(fs.readFileSync(levelsPath, 'utf8'));

  // Initialize metadata if it doesn't exist
  if (!levelsData.metadata) {
    levelsData.metadata = {};
  }

  const solver = new PuzzleSolver(6);
  const totalLevels = Object.keys(levelsData).filter(k => k !== 'metadata').length;
  let processed = 0;
  let updated = 0;
  let errors = 0;
  const startTime = Date.now();

  console.log(`📊 Processing ${totalLevels} levels...\n`);

  // Process each level
  for (let levelNum = 1; levelNum <= totalLevels; levelNum++) {
    const levelKey = levelNum.toString();
    const blocks = levelsData[levelKey];

    if (!blocks || !Array.isArray(blocks)) {
      console.warn(`⚠️  Level ${levelNum}: No blocks found, skipping`);
      errors++;
      continue;
    }

    try {
      // Find solution using BFS
      const solution = solver.findSolution(blocks);

      if (solution.length === 0) {
        console.warn(`⚠️  Level ${levelNum}: No solution found, skipping`);
        errors++;
        continue;
      }

      const bestMoves = solution.length;
      const bestScore = calculateBestScore(levelNum, bestMoves);

      // Update metadata
      if (!levelsData.metadata[levelKey]) {
        levelsData.metadata[levelKey] = {};
      }

      const existingBestMoves = levelsData.metadata[levelKey].bestMoves;
      const existingBestScore = levelsData.metadata[levelKey].bestScore;

      // Only update if we found a better solution
      if (!existingBestMoves || bestMoves < existingBestMoves) {
        levelsData.metadata[levelKey].bestMoves = bestMoves;
        levelsData.metadata[levelKey].bestScore = bestScore;
        updated++;
      } else if (bestMoves === existingBestMoves && bestScore > (existingBestScore || 0)) {
        // Same moves but better score (shouldn't happen, but just in case)
        levelsData.metadata[levelKey].bestScore = bestScore;
        updated++;
      }

      processed++;

      // Progress logging
      if (processed % 50 === 0 || processed === totalLevels) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = (processed / elapsed).toFixed(1);
        const remaining = totalLevels - processed;
        const eta = remaining > 0 ? ((remaining / rate) / 60).toFixed(1) : 0;
        console.log(`✓ Processed ${processed}/${totalLevels} levels (${rate} levels/sec, ETA: ${eta} min)`);
      }
    } catch (error) {
      console.error(`❌ Level ${levelNum}: Error - ${error.message}`);
      errors++;
    }
  }

  // Save updated levels.json
  console.log('\n💾 Saving updated levels.json...');
  fs.writeFileSync(levelsPath, JSON.stringify(levelsData, null, 2), 'utf8');

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n' + '='.repeat(60));
  console.log('✅ Calculation Complete!');
  console.log('='.repeat(60));
  console.log(`Total levels processed: ${processed}`);
  console.log(`Levels updated: ${updated}`);
  console.log(`Errors: ${errors}`);
  console.log(`Time elapsed: ${elapsed}s`);
  console.log(`Average: ${(processed / elapsed).toFixed(2)} levels/sec`);
  console.log('='.repeat(60) + '\n');
}

// Run the calculation
calculateBestScores().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});



