import { PuzzleSolver } from '../utils/solver.js';

export class LevelGenerator {
  constructor() {
    this.solver = new PuzzleSolver(6);
    this.gridSize = 6;
    this.preGeneratedLevels = null; // Cache for pre-generated levels
    this.loadingPromise = null; // Promise for loading levels
  }

  /**
   * Load pre-generated levels from JSON file
   */
  async loadPreGeneratedLevels() {
    // Return cached levels if already loaded
    if (this.preGeneratedLevels) {
      return this.preGeneratedLevels;
    }

    // Return existing promise if already loading
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Start loading
    this.loadingPromise = (async () => {
      try {
        const response = await fetch('/levels.json');
        if (!response.ok) {
          console.warn('Pre-generated levels not found, using runtime generation');
          return null;
        }
        const levels = await response.json();
        this.preGeneratedLevels = levels;
        console.log('✅ Loaded pre-generated levels');
        return levels;
      } catch (error) {
        console.warn('Failed to load pre-generated levels:', error);
        return null;
      }
    })();

    return this.loadingPromise;
  }

  /**
   * Load a specific pre-generated level
   * @param {number} levelNumber - Level number to load
   * @returns {Promise<Array|null>} - Array of blocks or null if not found
   */
  async loadPreGeneratedLevel(levelNumber) {
    const levels = await this.loadPreGeneratedLevels();
    if (!levels) return null;

    const levelBlocks = levels[levelNumber.toString()];
    if (!levelBlocks) {
      console.warn(`Pre-generated level ${levelNumber} not found`);
      return null;
    }

    return levelBlocks;
  }

  /**
   * Calculate difficulty value (0-1) based on level number
   * Scales from 0 at level 1 to 1 at level 200, then stays at 1
   */
  calculateDifficulty(levelNumber) {
    if (levelNumber <= 1) return 0;
    if (levelNumber >= 200) return 1;
    // Smooth curve from 0 to 1 over 200 levels
    // Using exponential curve for better progression
    const normalized = (levelNumber - 1) / 199;
    return Math.pow(normalized, 0.7); // Slightly faster early, slower later
  }

  /**
   * Calculate minimum moves required based on difficulty
   */
  calculateMinMoves(difficulty) {
    // Level 1: 2-3 moves, Level 200+: 50+ moves
    // Adjusted to be more achievable: Level 1: 2, Level 20: ~10, Level 200: 40
    const minMoves = Math.floor(2 + difficulty * 38);
    return minMoves;
  }

  /**
   * Calculate block count based on difficulty
   */
  calculateBlockCount(difficulty) {
    // Level 1: 4-6 blocks, Level 200+: 12-15 blocks
    const minBlocks = Math.floor(4 + difficulty * 8);
    const maxBlocks = Math.floor(6 + difficulty * 9);
    return { minBlocks, maxBlocks };
  }

  /**
   * Generate a new level using procedural random algorithm
   * @param {number} levelNumber - Current level number (starts at 1, gets harder)
   * @returns {Promise<Array>} - Array of blocks
   */
  async generateLevel(levelNumber = 1) {
    // Try to load pre-generated level first
    try {
      const preGeneratedBlocks = await this.loadPreGeneratedLevel(levelNumber);
      if (preGeneratedBlocks) {
        console.log(`✅ Loaded pre-generated level ${levelNumber}`);
        return preGeneratedBlocks;
      }
    } catch (error) {
      console.warn(`Failed to load pre-generated level ${levelNumber}, using runtime generation:`, error);
    }

    // Fallback to runtime generation if pre-generated level not available
    console.log(`🛠️ Generating level ${levelNumber} at runtime...`);
    
    // Calculate difficulty (0-1 scale)
    const difficulty = this.calculateDifficulty(levelNumber);
    
    // Calculate requirements based on difficulty
    const minMoves = this.calculateMinMoves(difficulty);
    const { minBlocks, maxBlocks } = this.calculateBlockCount(difficulty);
    
    console.log(`Generating level ${levelNumber}: difficulty=${difficulty.toFixed(2)}, minMoves=${minMoves}, blocks=${minBlocks}-${maxBlocks}`);
    
    // Try multiple times to generate a good level that meets difficulty requirements
    // Track best level found so far (fallback if strict requirements fail)
    let bestLevel = null;
    let bestMoves = -1;

    // Try multiple times to generate a good level that meets difficulty requirements
    const maxAttempts = 50; // More attempts for harder levels
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Yield to main thread to prevent UI freeze
      if (attempt % 3 === 0) await new Promise(resolve => setTimeout(resolve, 0));

      // Generate blocks with strategic placement based on difficulty
      const blocks = this.generateRandomLevel(minBlocks, maxBlocks, difficulty);
      
      // Ensure solvability
      const solvableBlocks = await this.ensureSolvable(blocks, difficulty);
      
      if (!solvableBlocks || solvableBlocks.length < minBlocks) {
        continue;
      }

      // Validate all blocks are within bounds
      const allValid = solvableBlocks.every(block => this.validateBlockBounds(block));
      if (!allValid) {
        continue;
      }

      // STRICT SOLVABILITY CHECK
      if (!this.solver.isSolvable(solvableBlocks)) {
        continue;
      }

      // Calculate moves
      const solution = this.solver.findSolution(solvableBlocks);
      const moveCount = solution ? solution.length : 0;

      // Keep track of the best level found so far
      if (moveCount > bestMoves) {
        bestMoves = moveCount;
        bestLevel = solvableBlocks;
      }

      // Check minimum moves requirement
      if (moveCount < minMoves) {
        // console.warn(`Attempt ${attempt}: Level too easy (${moveCount} moves, need ${minMoves}), retrying...`);
        continue;
      }

      // Check if level requires most blocks to move (for higher difficulty)
      if (difficulty > 0.3) { 
        const requiresMostBlocks = await this.requiresMostBlocksToMove(solvableBlocks);
        if (!requiresMostBlocks) {
          continue;
        }
      }

      // Final validation before returning
      const finalBlocks = solvableBlocks.filter(block => this.validateBlockBounds(block));
      
      // One more solvability check on final blocks
      if (finalBlocks.length >= minBlocks && this.solver.isSolvable(finalBlocks)) {
        console.log(`✅ Level ${levelNumber} generated successfully (attempt ${attempt + 1}): ${moveCount} moves`);
        return finalBlocks;
      }
    }

    // If all attempts failed, try one more pass with relaxed constraints
    console.warn(`⚠️ Initial generation failed for level ${levelNumber}, retrying with relaxed constraints...`);
    
    // Relaxed constraints: 50% of min moves (was 70%)
    const relaxedMinMoves = Math.floor(minMoves * 0.5);
    const relaxedDifficulty = Math.max(0, difficulty - 0.2);
    
    for (let attempt = 0; attempt < 20; attempt++) {
       if (attempt % 5 === 0) await new Promise(resolve => setTimeout(resolve, 0));
       
       const blocks = this.generateRandomLevel(minBlocks, maxBlocks, relaxedDifficulty);
       const solvableBlocks = await this.ensureSolvable(blocks, relaxedDifficulty);
       
       if (!solvableBlocks || solvableBlocks.length < minBlocks) continue;
       
       const allValid = solvableBlocks.every(block => this.validateBlockBounds(block));
       if (!allValid) continue;
       
       if (this.solver.isSolvable(solvableBlocks)) {
         const solution = this.solver.findSolution(solvableBlocks);
         const moveCount = solution ? solution.length : 0;
         
         // Update best level if this is better
         if (moveCount > bestMoves) {
            bestMoves = moveCount;
            bestLevel = solvableBlocks;
         }

         if (moveCount >= relaxedMinMoves) {
            console.log(`✅ Level ${levelNumber} generated with relaxed constraints: ${moveCount} moves`);
            return solvableBlocks;
         }
       }
    }

    // If all attempts failed, return the best level found instead of static fallback
    if (bestLevel && bestMoves > 0) {
      console.warn(`⚠️ Failed to meet requirements for level ${levelNumber}, returning best found (${bestMoves} moves)`);
      return bestLevel;
    }

    // Only use static fallback if we absolutely couldn't generate ANYTHING solvable
    console.warn(`⚠️ CRITICAL: Failed to generate any solvable level for ${levelNumber}, using static fallback`);
    const fallbackDifficulty = Math.min(0.5, difficulty); 
    return this.getFallbackLevel(fallbackDifficulty);
  }

  /**
   * Generate a unique hash for the level configuration
   * Used to prevent duplicate levels
   */
  getLevelHash(blocks) {
    if (!blocks || !Array.isArray(blocks)) return '';
    
    // Sort blocks to ensure consistent hash regardless of array order
    // Sort by row, then col, then length, then orientation
    const sortedBlocks = [...blocks].sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      if (a.col !== b.col) return a.col - b.col;
      if (a.length !== b.length) return a.length - b.length;
      return (a.isHorizontal === b.isHorizontal) ? 0 : (a.isHorizontal ? -1 : 1);
    });
    
    // Create string representation: "r,c,l,h|r,c,l,h|..."
    return sortedBlocks.map(b => 
      `${b.row},${b.col},${b.length},${b.isHorizontal ? '1' : '0'}`
    ).join('|');
  }

  /**
   * Check if solving requires moving 80%+ of blocks
   */
  async requiresMostBlocksToMove(blocks) {
    // Use solver to find solution path
    const solution = this.solver.findSolution(blocks);
    
    if (!solution || solution.length === 0) {
      return false;
    }

    // Count unique blocks that need to move
    const blocksThatMove = new Set();
    solution.forEach(move => {
      if (move.blockId !== 'red') {
        blocksThatMove.add(move.blockId);
      }
    });

    const totalBlocks = blocks.length - 1; // Exclude red block
    if (totalBlocks === 0) return false;
    
    const blocksToMoveRatio = blocksThatMove.size / totalBlocks;

    // Require at least 70% of blocks to move (relaxed from 80% for better generation)
    return blocksToMoveRatio >= 0.7;
  }

  /**
   * Generate a random level configuration with strategic placement
   * @param {number} minBlocks - Minimum number of blocks
   * @param {number} maxBlocks - Maximum number of blocks
   * @param {number} difficulty - Difficulty value (0-1)
   */
  generateRandomLevel(minBlocks, maxBlocks, difficulty = 0) {
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
    
    // Strategic placement: create obstacles that require multiple moves
    // Higher difficulty = more strategic blocking
    let blockId = 1;
    let placedBlocks = 0;
    let attempts = 0;
    const maxPlacementAttempts = 500; // More attempts for harder levels

    // Priority: place blocks that create dependencies
    // 1. Place blocks on row 2 (blocking red block's path) - more likely at higher difficulty
    // 2. Place vertical blocks that block horizontal movement
    // 3. Create dependency chains (blocks that block other blocks)
    // 4. Fill remaining spaces

    while (placedBlocks < numBlocks && attempts < maxPlacementAttempts) {
      attempts++;
      
      let row, col, length, isHorizontal;
      
      // Strategic placement probability increases with difficulty
      const strategicChance = 0.3 + (difficulty * 0.5); // 30% at level 1, 80% at level 200+
      const shouldPlaceStrategic = placedBlocks < numBlocks * 0.7 && Math.random() < strategicChance;
      
      if (shouldPlaceStrategic) {
        // Strategic placement: block row 2 or create vertical obstacles
        if (Math.random() > 0.5) {
          // Place block on row 2 (blocking red block)
          isHorizontal = Math.random() > 0.3; // 70% horizontal on row 2
          row = 2;
          if (isHorizontal) {
            length = Math.random() > 0.5 ? 3 : 2;
            // Ensure block fits: col must be >= 2 (after red block) and col + length <= gridSize
            const maxCol = this.gridSize - length;
            if (maxCol < 2) continue; // Can't place block after red block
            col = Math.floor(Math.random() * (maxCol - 2 + 1)) + 2; // After red block
          } else {
            length = Math.random() > 0.4 ? 3 : 2;
            // Ensure vertical block fits: row + length <= gridSize
            if (row + length > this.gridSize) continue;
            const maxCol = this.gridSize - 1;
            if (maxCol < 2) continue;
            col = Math.floor(Math.random() * (maxCol - 2 + 1)) + 2; // After red block
          }
        } else {
          // Place vertical blocks that create dependencies
          // At higher difficulty, prefer longer blocks (3 units) to create more obstacles
          const longBlockChance = 0.3 + (difficulty * 0.4); // 30% at level 1, 70% at level 200+
          isHorizontal = false;
          length = Math.random() < longBlockChance ? 3 : 2;
          // Ensure block fits within grid
          const maxRow = this.gridSize - length;
          if (maxRow < 0) continue;
          row = Math.floor(Math.random() * (maxRow + 1));
          // At higher difficulty, place blocks closer to the exit path (columns 2-4)
          const strategicCol = difficulty > 0.5 && Math.random() < 0.6;
          if (strategicCol) {
            // Place in columns 2-4 (blocking the exit path)
            col = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
          } else {
            const maxCol = this.gridSize - 2;
            if (maxCol < 1) continue;
            col = Math.floor(Math.random() * (maxCol - 1 + 1)) + 1; // Not on edges
          }
        }
      } else {
        // Random placement (but still consider difficulty for block lengths)
        isHorizontal = Math.random() > 0.5;
        // At higher difficulty, prefer longer blocks
        const longBlockChance = 0.5 + (difficulty * 0.3); // 50% at level 1, 80% at level 200+
        length = Math.random() < longBlockChance ? 3 : 2;
        
        if (isHorizontal) {
          row = Math.floor(Math.random() * this.gridSize);
          // Ensure col + length <= gridSize
          const maxCol = this.gridSize - length;
          if (maxCol < 0) continue;
          col = Math.floor(Math.random() * (maxCol + 1));
        } else {
          // Ensure row + length <= gridSize
          const maxRow = this.gridSize - length;
          if (maxRow < 0) continue;
          row = Math.floor(Math.random() * (maxRow + 1));
          col = Math.floor(Math.random() * this.gridSize);
        }
      }

      // Validate bounds before checking placement
      if (row < 0 || col < 0 || row >= this.gridSize || col >= this.gridSize) continue;
      if (isHorizontal && (col + length > this.gridSize)) continue;
      if (!isHorizontal && (row + length > this.gridSize)) continue;

      // Check if position is valid and doesn't overlap
      if (this.canPlaceBlock(grid, row, col, length, isHorizontal)) {
        const block = {
          id: `block${blockId}`,
          row,
          col,
          length,
          isHorizontal,
          isHorizontal,
          isRed: false,
          themeIndex: Math.floor(Math.random() * 6) // Random theme 0-5
        };
        
        // Double-check bounds before adding
        if (!this.validateBlockBounds(block)) {
          console.warn('Invalid block bounds detected, skipping:', block);
          continue;
        }
        
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
   * Remove overlapping blocks from the array
   */
  removeOverlappingBlocks(blocks) {
    const grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
    const validBlocks = [];

    for (const block of blocks) {
      // First validate block bounds
      if (!this.validateBlockBounds(block)) {
        console.warn('Removing invalid block (out of bounds):', block);
        continue;
      }

      let overlaps = false;
      
      // Check for overlaps
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

      // If no overlap, add to valid blocks and mark grid
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
   * Validate that a block is within grid boundaries
   */
  validateBlockBounds(block) {
    if (!block || typeof block.row !== 'number' || typeof block.col !== 'number' || typeof block.length !== 'number') {
      return false;
    }

    const { row, col, length, isHorizontal } = block;

    // Check basic bounds
    if (row < 0 || col < 0 || length < 1) return false;

    // Check horizontal block bounds
    if (isHorizontal) {
      if (row >= this.gridSize) return false;
      if (col + length > this.gridSize) return false;
    } else {
      // Check vertical block bounds
      if (col >= this.gridSize) return false;
      if (row + length > this.gridSize) return false;
    }

    return true;
  }

  /**
   * Check if a block can be placed at the given position
   */
  canPlaceBlock(grid, row, col, length, isHorizontal) {
    // Check bounds using validation
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
   * Ensure the level is solvable, remove blocks if needed
   */
  async ensureSolvable(blocks, difficulty) {
    if (!blocks || blocks.length === 0) {
      return this.getFallbackLevel(Math.min(0.5, difficulty));
    }

    // Validate red block position - must be at col 0, not at exit
    const redBlock = blocks.find(b => b.isRed);
    if (redBlock) {
      if (redBlock.col + redBlock.length >= this.gridSize) {
        // Red block is at or past exit - reset to start
        redBlock.col = 0;
      }
      if (redBlock.col !== 0) {
        // Red block should always start at col 0
        redBlock.col = 0;
      }
    }

    // Remove any overlapping blocks first
    blocks = this.removeOverlappingBlocks(blocks);

    // First check if it's already solvable
    if (this.solver.isSolvable(blocks)) {
      return blocks;
    }

    console.log('Level not solvable, attempting to fix...');

    // Try removing blocks one by one (except red block)
    let attempts = 0;
    const maxAttempts = blocks.length * 2; // Allow more attempts to fix

    while (attempts < maxAttempts && !this.solver.isSolvable(blocks)) {
      // Find non-red blocks that might be blocking the path
      const redBlock = blocks.find(b => b.isRed);
      
      // Prioritize removing blocks directly in front of the red block
      const blockingCandidates = blocks.filter(b => 
        !b.isRed && 
        b.row === 2 && 
        b.col > redBlock.col
      );

      if (blockingCandidates.length > 0) {
        // Remove a blocking block on row 2
        const toRemove = blockingCandidates[Math.floor(Math.random() * blockingCandidates.length)];
        blocks = blocks.filter(b => b.id !== toRemove.id);
      } else {
        // If no direct blocks, remove a random vertical block that intersects row 2
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
           // Fallback: remove any random non-red block
           const nonRedBlocks = blocks.filter(b => !b.isRed);
           if (nonRedBlocks.length > 0) {
             const toRemove = nonRedBlocks[Math.floor(Math.random() * nonRedBlocks.length)];
             blocks = blocks.filter(b => b.id !== toRemove.id);
           } else {
             break; // Only red block left
           }
        }
      }

      attempts++;
    }

    // If still not solvable, use fallback
    if (!this.solver.isSolvable(blocks)) {
      console.log('Could not fix level, using fallback');
      return this.getFallbackLevel(Math.min(0.5, difficulty));
    }

    console.log('Level fixed and is now solvable!');
    return blocks;
  }

  /**
   * Get a fallback level if generation fails
   */
  getFallbackLevel(difficulty) {
    // Simple, guaranteed solvable level (very easy)
    const simple = [
      { id: 'red', row: 2, col: 0, length: 2, isHorizontal: true, isRed: true },
      { id: 'block1', row: 0, col: 3, length: 2, isHorizontal: false, isRed: false, themeIndex: Math.floor(Math.random() * 6) },
      { id: 'block2', row: 2, col: 3, length: 2, isHorizontal: false, isRed: false, themeIndex: Math.floor(Math.random() * 6) },
      { id: 'block3', row: 4, col: 2, length: 2, isHorizontal: true, isRed: false, themeIndex: Math.floor(Math.random() * 6) },
      { id: 'block4', row: 5, col: 4, length: 2, isHorizontal: true, isRed: false, themeIndex: Math.floor(Math.random() * 6) },
    ];

    // Medium difficulty fallback
    const medium = [
      { id: 'red', row: 2, col: 0, length: 2, isHorizontal: true, isRed: true },
      { id: 'block1', row: 0, col: 2, length: 2, isHorizontal: false, isRed: false, themeIndex: Math.floor(Math.random() * 6) },
      { id: 'block2', row: 1, col: 4, length: 2, isHorizontal: false, isRed: false, themeIndex: Math.floor(Math.random() * 6) },
      { id: 'block3', row: 2, col: 3, length: 2, isHorizontal: false, isRed: false, themeIndex: Math.floor(Math.random() * 6) },
      { id: 'block4', row: 4, col: 1, length: 2, isHorizontal: true, isRed: false, themeIndex: Math.floor(Math.random() * 6) },
      { id: 'block5', row: 5, col: 3, length: 2, isHorizontal: true, isRed: false, themeIndex: Math.floor(Math.random() * 6) },
    ];

    // Choose fallback based on difficulty (0-1 scale)
    const fallback = difficulty >= 0.3 ? medium : simple;
    
    // Verify fallback is actually solvable
    if (!this.solver.isSolvable(fallback)) {
      console.error('⚠️ CRITICAL: Fallback level is not solvable! Using simple level.');
      return simple;
    }
    
    return fallback;
  }

  /**
   * Get minimal solvable level (absolute fallback)
   */
  getMinimalSolvableLevel() {
    return [
      { id: 'red', row: 2, col: 0, length: 2, isHorizontal: true, isRed: true },
      { id: 'block1', row: 2, col: 3, length: 2, isHorizontal: false, isRed: false, themeIndex: 0 },
    ];
  }
}
