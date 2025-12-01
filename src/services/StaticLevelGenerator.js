import { PuzzleSolver } from '../utils/solver.js';

/**
 * Static Level Generator
 * Generates and validates 1000 pre-made levels with perfect difficulty progression
 */
export class StaticLevelGenerator {
  constructor() {
    this.solver = new PuzzleSolver(6);
    this.gridSize = 6;
    this.totalLevels = 1000;
  }

  /**
   * Calculate target difficulty for a level (0-1 scale)
   * Levels 1-100: Linear progression from 0 to 1
   * Levels 100+: Stay at max difficulty (1)
   */
  calculateTargetDifficulty(levelNum) {
    if (levelNum <= 1) return 0;
    if (levelNum >= 100) return 1;
    // Linear progression from 0 to 1 over levels 1-100
    return (levelNum - 1) / 99;
  }

  /**
   * Calculate target move count based on difficulty
   */
  calculateTargetMoves(difficulty) {
    // Level 1: 2-4 moves, Level 100+: 30-50 moves
    const minMoves = Math.floor(2 + difficulty * 28);
    const maxMoves = Math.floor(4 + difficulty * 46);
    return { minMoves, maxMoves };
  }

  /**
   * Calculate block count based on difficulty
   */
  calculateBlockCount(difficulty) {
    // Level 1: 3-5 blocks, Level 100+: 10-14 blocks
    const minBlocks = Math.floor(3 + difficulty * 7);
    const maxBlocks = Math.floor(5 + difficulty * 9);
    return { minBlocks, maxBlocks };
  }

  /**
   * Generate a single level with specific difficulty requirements
   */
  async generateSingleLevel(levelNum, maxAttempts = 200) {
    const difficulty = this.calculateTargetDifficulty(levelNum);
    const { minMoves, maxMoves } = this.calculateTargetMoves(difficulty);
    const { minBlocks, maxBlocks } = this.calculateBlockCount(difficulty);

    console.log(`Generating level ${levelNum}: difficulty=${difficulty.toFixed(2)}, moves=${minMoves}-${maxMoves}, blocks=${minBlocks}-${maxBlocks}`);

    let bestLevel = null;
    let bestMoves = 0;
    let bestScore = -1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Yield to prevent blocking
      if (attempt % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      // Generate random level
      const blocks = this.generateRandomLevel(minBlocks, maxBlocks, difficulty);
      
      // Ensure solvability
      const solvableBlocks = await this.ensureSolvable(blocks);
      if (!solvableBlocks || solvableBlocks.length < minBlocks) continue;

      // Validate
      if (!this.solver.isSolvable(solvableBlocks)) continue;

      // Get solution
      const solution = this.solver.findSolution(solvableBlocks);
      if (!solution) continue;

      const moveCount = solution.length;

      // Calculate quality score (how close to target range)
      const targetMid = (minMoves + maxMoves) / 2;
      const distance = Math.abs(moveCount - targetMid);
      const score = 100 - distance;

      // Keep track of best
      if (score > bestScore || (score === bestScore && moveCount > bestMoves)) {
        bestScore = score;
        bestMoves = moveCount;
        bestLevel = solvableBlocks;
      }

      // If we found a perfect match, use it
      if (moveCount >= minMoves && moveCount <= maxMoves) {
        console.log(`  ✅ Level ${levelNum} generated (${moveCount} moves, attempt ${attempt + 1})`);
        return solvableBlocks;
      }
    }

    // Return best found
    if (bestLevel) {
      console.log(`  ⚠️ Level ${levelNum} using best found (${bestMoves} moves)`);
      return bestLevel;
    }

    // Fallback
    console.warn(`  ❌ Level ${levelNum} failed, using fallback`);
    return this.getFallbackLevel(difficulty);
  }

  /**
   * Generate random level configuration
   */
  generateRandomLevel(minBlocks, maxBlocks, difficulty) {
    const blocks = [];
    const grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
    
    // Always place red block first on row 2, col 0
    const redBlock = {
      id: 'red',
      row: 2,
      col: 0,
      length: 2,
      isHorizontal: true,
      isRed: true
    };
    blocks.push(redBlock);
    
    // Mark red block on grid
    for (let c = 0; c < 2; c++) {
      grid[2][c] = 'red';
    }

    // Determine number of additional blocks
    const numBlocks = Math.floor(Math.random() * (maxBlocks - minBlocks + 1)) + minBlocks;
    
    // Strategic placement based on difficulty
    let blockId = 1;
    let placedBlocks = 0;
    let attempts = 0;
    const maxPlacementAttempts = 500;

    while (placedBlocks < numBlocks && attempts < maxPlacementAttempts) {
      attempts++;
      
      let row, col, length, isHorizontal;
      
      // Strategic placement probability increases with difficulty
      const strategicChance = 0.3 + (difficulty * 0.5);
      const shouldPlaceStrategic = placedBlocks < numBlocks * 0.7 && Math.random() < strategicChance;
      
      if (shouldPlaceStrategic) {
        // Strategic placement: block row 2 or create vertical obstacles
        if (Math.random() > 0.5) {
          // Place block on row 2 (blocking red block)
          isHorizontal = Math.random() > 0.3;
          row = 2;
          if (isHorizontal) {
            length = Math.random() > 0.5 ? 3 : 2;
            const maxCol = this.gridSize - length;
            if (maxCol < 2) continue;
            col = Math.floor(Math.random() * (maxCol - 2 + 1)) + 2;
          } else {
            length = Math.random() > 0.4 ? 3 : 2;
            if (row + length > this.gridSize) continue;
            const maxCol = this.gridSize - 1;
            if (maxCol < 2) continue;
            col = Math.floor(Math.random() * (maxCol - 2 + 1)) + 2;
          }
        } else {
          // Place vertical blocks
          const longBlockChance = 0.3 + (difficulty * 0.4);
          isHorizontal = false;
          length = Math.random() < longBlockChance ? 3 : 2;
          const maxRow = this.gridSize - length;
          if (maxRow < 0) continue;
          row = Math.floor(Math.random() * (maxRow + 1));
          const strategicCol = difficulty > 0.5 && Math.random() < 0.6;
          if (strategicCol) {
            col = Math.floor(Math.random() * 3) + 2;
          } else {
            const maxCol = this.gridSize - 2;
            if (maxCol < 1) continue;
            col = Math.floor(Math.random() * (maxCol - 1 + 1)) + 1;
          }
        }
      } else {
        // Random placement
        isHorizontal = Math.random() > 0.5;
        const longBlockChance = 0.5 + (difficulty * 0.3);
        length = Math.random() < longBlockChance ? 3 : 2;
        
        if (isHorizontal) {
          row = Math.floor(Math.random() * this.gridSize);
          const maxCol = this.gridSize - length;
          if (maxCol < 0) continue;
          col = Math.floor(Math.random() * (maxCol + 1));
        } else {
          const maxRow = this.gridSize - length;
          if (maxRow < 0) continue;
          row = Math.floor(Math.random() * (maxRow + 1));
          col = Math.floor(Math.random() * this.gridSize);
        }
      }

      // Validate bounds
      if (row < 0 || col < 0 || row >= this.gridSize || col >= this.gridSize) continue;
      if (isHorizontal && (col + length > this.gridSize)) continue;
      if (!isHorizontal && (row + length > this.gridSize)) continue;

      // Check if position is valid
      if (this.canPlaceBlock(grid, row, col, length, isHorizontal)) {
        const block = {
          id: `block${blockId}`,
          row,
          col,
          length,
          isHorizontal,
          isRed: false,
          themeIndex: Math.floor(Math.random() * 6)
        };
        
        blocks.push(block);
        
        // Mark block on grid
        if (isHorizontal) {
          for (let c = col; c < col + length; c++) {
            if (c < this.gridSize && row < this.gridSize) {
              grid[row][c] = block.id;
            }
          }
        } else {
          for (let r = row; r < row + length; r++) {
            if (r < this.gridSize && col < this.gridSize) {
              grid[r][col] = block.id;
            }
          }
        }
        
        placedBlocks++;
        blockId++;
      }
    }

    return blocks;
  }

  /**
   * Check if a block can be placed at the given position
   */
  canPlaceBlock(grid, row, col, length, isHorizontal) {
    if (row < 0 || col < 0) return false;
    if (isHorizontal) {
      if (row >= this.gridSize || col + length > this.gridSize) return false;
    } else {
      if (row + length > this.gridSize || col >= this.gridSize) return false;
    }

    // Check for overlaps
    if (isHorizontal) {
      for (let c = col; c < col + length; c++) {
        if (grid[row][c] !== null) return false;
      }
    } else {
      for (let r = row; r < row + length; r++) {
        if (grid[r][col] !== null) return false;
      }
    }

    return true;
  }

  /**
   * Ensure the level is solvable
   */
  async ensureSolvable(blocks) {
    if (!blocks || blocks.length === 0) return null;

    // Validate red block
    const redBlock = blocks.find(b => b.isRed);
    if (redBlock) {
      if (redBlock.col + redBlock.length >= this.gridSize) {
        redBlock.col = 0;
      }
      if (redBlock.col !== 0) {
        redBlock.col = 0;
      }
    }

    // Remove overlapping blocks
    blocks = this.removeOverlappingBlocks(blocks);

    // Check if already solvable
    if (this.solver.isSolvable(blocks)) {
      return blocks;
    }

    // Try removing blocks to make solvable
    let attempts = 0;
    const maxAttempts = blocks.length * 2;

    while (attempts < maxAttempts && !this.solver.isSolvable(blocks)) {
      const redBlock = blocks.find(b => b.isRed);
      
      // Remove blocks on row 2 first
      const blockingCandidates = blocks.filter(b => 
        !b.isRed && 
        b.row === 2 && 
        b.col > redBlock.col
      );

      if (blockingCandidates.length > 0) {
        const toRemove = blockingCandidates[Math.floor(Math.random() * blockingCandidates.length)];
        blocks = blocks.filter(b => b.id !== toRemove.id);
      } else {
        // Remove vertical blockers
        const verticalBlockers = blocks.filter(b => 
          !b.isRed && 
          !b.isHorizontal && 
          b.row <= 2 && 
          b.row + b.length > 2 &&
          b.col > redBlock.col
        );

        if (verticalBlockers.length > 0) {
          const toRemove = verticalBlockers[Math.floor(Math.random() * verticalBlockers.length)];
          blocks = blocks.filter(b => b.id !== toRemove.id);
        } else {
          // Remove any random block
          const nonRedBlocks = blocks.filter(b => !b.isRed);
          if (nonRedBlocks.length > 0) {
            const toRemove = nonRedBlocks[Math.floor(Math.random() * nonRedBlocks.length)];
            blocks = blocks.filter(b => b.id !== toRemove.id);
          } else {
            break;
          }
        }
      }

      attempts++;
    }

    if (!this.solver.isSolvable(blocks)) {
      return null;
    }

    return blocks;
  }

  /**
   * Remove overlapping blocks
   */
  removeOverlappingBlocks(blocks) {
    const grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
    const validBlocks = [];

    for (const block of blocks) {
      let overlaps = false;
      
      if (block.isHorizontal) {
        for (let c = block.col; c < block.col + block.length; c++) {
          if (c >= this.gridSize || block.row >= this.gridSize || c < 0 || block.row < 0) {
            overlaps = true;
            break;
          }
          if (grid[block.row][c] !== null) {
            overlaps = true;
            break;
          }
        }
      } else {
        for (let r = block.row; r < block.row + block.length; r++) {
          if (r >= this.gridSize || block.col >= this.gridSize || r < 0 || block.col < 0) {
            overlaps = true;
            break;
          }
          if (grid[r][block.col] !== null) {
            overlaps = true;
            break;
          }
        }
      }

      if (!overlaps) {
        validBlocks.push(block);
        if (block.isHorizontal) {
          for (let c = block.col; c < block.col + block.length; c++) {
            if (c >= 0 && c < this.gridSize && block.row >= 0 && block.row < this.gridSize) {
              grid[block.row][c] = block.id;
            }
          }
        } else {
          for (let r = block.row; r < block.row + block.length; r++) {
            if (r >= 0 && r < this.gridSize && block.col >= 0 && block.col < this.gridSize) {
              grid[r][block.col] = block.id;
            }
          }
        }
      }
    }

    return validBlocks;
  }

  /**
   * Get fallback level
   */
  getFallbackLevel(difficulty) {
    const simple = [
      { id: 'red', row: 2, col: 0, length: 2, isHorizontal: true, isRed: true },
      { id: 'block1', row: 0, col: 3, length: 2, isHorizontal: false, isRed: false, themeIndex: 0 },
      { id: 'block2', row: 2, col: 3, length: 2, isHorizontal: false, isRed: false, themeIndex: 1 },
    ];

    const medium = [
      { id: 'red', row: 2, col: 0, length: 2, isHorizontal: true, isRed: true },
      { id: 'block1', row: 0, col: 2, length: 2, isHorizontal: false, isRed: false, themeIndex: 0 },
      { id: 'block2', row: 1, col: 4, length: 2, isHorizontal: false, isRed: false, themeIndex: 1 },
      { id: 'block3', row: 2, col: 3, length: 2, isHorizontal: false, isRed: false, themeIndex: 2 },
      { id: 'block4', row: 4, col: 1, length: 2, isHorizontal: true, isRed: false, themeIndex: 3 },
    ];

    return difficulty >= 0.3 ? medium : simple;
  }

  /**
   * Generate all 1000 levels
   */
  async generateAllLevels() {
    const levels = {};
    
    console.log(`\n🎮 Starting generation of ${this.totalLevels} levels...\n`);

    for (let i = 1; i <= this.totalLevels; i++) {
      const levelBlocks = await this.generateSingleLevel(i);
      levels[i] = levelBlocks;

      // Progress update every 50 levels
      if (i % 50 === 0) {
        console.log(`\n📊 Progress: ${i}/${this.totalLevels} levels generated (${Math.round(i/this.totalLevels*100)}%)\n`);
      }
    }

    console.log(`\n✅ All ${this.totalLevels} levels generated successfully!\n`);
    return levels;
  }

  /**
   * Validate all levels
   */
  validateAllLevels(levels) {
    console.log('\n🔍 Validating all levels...\n');
    
    let validCount = 0;
    let invalidCount = 0;

    for (let i = 1; i <= this.totalLevels; i++) {
      const blocks = levels[i];
      if (!blocks) {
        console.error(`❌ Level ${i}: Missing`);
        invalidCount++;
        continue;
      }

      if (!this.solver.isSolvable(blocks)) {
        console.error(`❌ Level ${i}: Not solvable`);
        invalidCount++;
        continue;
      }

      validCount++;
    }

    console.log(`\n✅ Validation complete: ${validCount} valid, ${invalidCount} invalid\n`);
    return invalidCount === 0;
  }
}
