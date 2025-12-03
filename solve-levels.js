import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GRID_SIZE = 6;

class LevelSolver {
  constructor(blocks) {
    this.initialBlocks = JSON.parse(JSON.stringify(blocks));
  }

  // Create a state key for visited tracking
  getStateKey(blocks) {
    return blocks
      .map(b => `${b.id}:${b.row},${b.col}`)
      .sort()
      .join('|');
  }

  // Check if position is blocked by another block
  isPositionBlocked(blocks, blockId, newRow, newCol, isHorizontal, length) {
    for (const block of blocks) {
      if (block.id === blockId) continue;

      const positions = [];
      if (block.isHorizontal) {
        for (let i = 0; i < block.length; i++) {
          positions.push({ row: block.row, col: block.col + i });
        }
      } else {
        for (let i = 0; i < block.length; i++) {
          positions.push({ row: block.row + i, col: block.col });
        }
      }

      const newPositions = [];
      if (isHorizontal) {
        for (let i = 0; i < length; i++) {
          newPositions.push({ row: newRow, col: newCol + i });
        }
      } else {
        for (let i = 0; i < length; i++) {
          newPositions.push({ row: newRow + i, col: newCol });
        }
      }

      for (const newPos of newPositions) {
        for (const pos of positions) {
          if (newPos.row === pos.row && newPos.col === pos.col) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Get all possible moves from current state
  getPossibleMoves(blocks) {
    const moves = [];

    for (const block of blocks) {
      if (block.isHorizontal) {
        // Try moving left
        for (let newCol = block.col - 1; newCol >= 0; newCol--) {
          if (this.isPositionBlocked(blocks, block.id, block.row, newCol, true, block.length)) {
            break;
          }
          const newBlocks = JSON.parse(JSON.stringify(blocks));
          const movedBlock = newBlocks.find(b => b.id === block.id);
          movedBlock.col = newCol;
          moves.push({ blocks: newBlocks, move: `${block.id}:L${block.col - newCol}` });
        }

        // Try moving right
        for (let newCol = block.col + 1; newCol + block.length <= GRID_SIZE; newCol++) {
          if (this.isPositionBlocked(blocks, block.id, block.row, newCol, true, block.length)) {
            break;
          }
          const newBlocks = JSON.parse(JSON.stringify(blocks));
          const movedBlock = newBlocks.find(b => b.id === block.id);
          movedBlock.col = newCol;
          moves.push({ blocks: newBlocks, move: `${block.id}:R${newCol - block.col}` });
        }
      } else {
        // Try moving up
        for (let newRow = block.row - 1; newRow >= 0; newRow--) {
          if (this.isPositionBlocked(blocks, block.id, newRow, block.col, false, block.length)) {
            break;
          }
          const newBlocks = JSON.parse(JSON.stringify(blocks));
          const movedBlock = newBlocks.find(b => b.id === block.id);
          movedBlock.row = newRow;
          moves.push({ blocks: newBlocks, move: `${block.id}:U${block.row - newRow}` });
        }

        // Try moving down
        for (let newRow = block.row + 1; newRow + block.length <= GRID_SIZE; newRow++) {
          if (this.isPositionBlocked(blocks, block.id, newRow, block.col, false, block.length)) {
            break;
          }
          const newBlocks = JSON.parse(JSON.stringify(blocks));
          const movedBlock = newBlocks.find(b => b.id === block.id);
          movedBlock.row = newRow;
          moves.push({ blocks: newBlocks, move: `${block.id}:D${newRow - block.row}` });
        }
      }
    }

    return moves;
  }

  // Check if level is solved
  isSolved(blocks) {
    const redBlock = blocks.find(b => b.isRed);
    return redBlock && redBlock.col + redBlock.length === GRID_SIZE;
  }

  // Solve using BFS
  solve() {
    const queue = [{ blocks: this.initialBlocks, moves: [] }];
    const visited = new Set([this.getStateKey(this.initialBlocks)]);

    while (queue.length > 0) {
      const { blocks, moves } = queue.shift();

      if (this.isSolved(blocks)) {
        return { moves, moveCount: moves.length };
      }

      const possibleMoves = this.getPossibleMoves(blocks);

      for (const { blocks: newBlocks, move } of possibleMoves) {
        const stateKey = this.getStateKey(newBlocks);
        if (!visited.has(stateKey)) {
          visited.add(stateKey);
          queue.push({ blocks: newBlocks, moves: [...moves, move] });
        }
      }
    }

    return null; // No solution found
  }
}

// Calculate best score based on game formula
function calculateBestScore(levelNumber, bestMoves) {
  const baseScore = 1000 * levelNumber;
  // Assume perfect time (0 seconds) and optimal moves
  const timePenalty = 0; // Perfect time
  const movePenalty = bestMoves * 10;
  return Math.max(0, baseScore - timePenalty - movePenalty);
}

async function solveLevels() {
  console.log('Loading levels.json...');
  const levelsPath = path.join(__dirname, 'public', 'levels.json');
  const levelsData = JSON.parse(fs.readFileSync(levelsPath, 'utf8'));

  const levelNumbers = Object.keys(levelsData).map(Number).sort((a, b) => a - b);
  console.log(`Found ${levelNumbers.length} levels to solve\n`);

  let solvedCount = 0;
  let unsolvedCount = 0;

  for (const levelNum of levelNumbers) {
    const blocks = levelsData[levelNum.toString()];
    
    // Skip if blocks is not an array (it's the metadata)
    if (!Array.isArray(blocks)) {
      continue;
    }
    
    process.stdout.write(`Solving Level ${levelNum}... `);
    
    const solver = new LevelSolver(blocks);
    const solution = solver.solve();

    if (solution) {
      const bestScore = calculateBestScore(levelNum, solution.moveCount);
      
      // Store metadata separately
      if (!levelsData.metadata) {
        levelsData.metadata = {};
      }
      if (!levelsData.metadata[levelNum.toString()]) {
        levelsData.metadata[levelNum.toString()] = {};
      }
      
      levelsData.metadata[levelNum.toString()].bestMoves = solution.moveCount;
      levelsData.metadata[levelNum.toString()].bestScore = bestScore;
      
      console.log(`✓ Solved in ${solution.moveCount} moves, Best Score: ${bestScore.toLocaleString()}`);
      solvedCount++;
    } else {
      console.log(`✗ No solution found`);
      unsolvedCount++;
    }

    // Save progress every 100 levels
    if (levelNum % 100 === 0) {
      fs.writeFileSync(levelsPath, JSON.stringify(levelsData, null, 2));
      console.log(`  → Progress saved (${levelNum} levels processed)\n`);
    }
  }

  // Final save
  console.log('\nSaving final results...');
  fs.writeFileSync(levelsPath, JSON.stringify(levelsData, null, 2));

  console.log(`\n✓ Complete!`);
  console.log(`  Solved: ${solvedCount} levels`);
  console.log(`  Unsolved: ${unsolvedCount} levels`);
  console.log(`  Results saved to: ${levelsPath}`);
}

solveLevels().catch(console.error);
