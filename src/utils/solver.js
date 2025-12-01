/**
 * BFS Solver for Dia Block puzzle
 * Verifies if a level is solvable by finding if the red block can reach the exit
 */

export class PuzzleSolver {
  constructor(gridSize = 6) {
    this.gridSize = gridSize;
    this.exitRow = 2; // Red block must be on row 2 (0-indexed)
  }

  /**
   * Check if a level is solvable
   * @param {Array} blocks - Array of block objects with {id, row, col, length, isHorizontal, isRed}
   * @returns {boolean} - True if solvable
   */
  isSolvable(blocks) {
    // Find the red block
    const redBlock = blocks.find(b => b.isRed);
    if (!redBlock) return false;
    if (!redBlock.isHorizontal) return false; // Red must be horizontal
    if (redBlock.row !== this.exitRow) return false;

    // BFS to find if red block can reach the exit
    const initialState = this.serializeState(blocks);
    const queue = [{ state: initialState, blocks: blocks }];
    const visited = new Set([initialState]);
    
    let iterations = 0;
    const MAX_ITERATIONS = 50000; // Prevent infinite loops/hanging

    while (queue.length > 0) {
      iterations++;
      if (iterations > MAX_ITERATIONS) {
        console.warn('Solver timed out (isSolvable)');
        return false;
      }

      const { state, blocks: currentBlocks } = queue.shift();
      
      // Check if red block reached the exit
      const redBlock = currentBlocks.find(b => b.isRed);
      if (redBlock.col + redBlock.length === this.gridSize) {
        return true; // Solvable!
      }

      // Try all possible moves
      for (let i = 0; i < currentBlocks.length; i++) {
        const moves = this.getPossibleMoves(currentBlocks, i);
        
        for (const move of moves) {
          const newBlocks = this.applyMove(currentBlocks, i, move);
          const newState = this.serializeState(newBlocks);
          
          if (!visited.has(newState)) {
            visited.add(newState);
            queue.push({ state: newState, blocks: newBlocks });
          }
        }
      }
    }

    return false; // Not solvable
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
          break; // Can't move further
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
   * Optimized to use intersection checks instead of grid construction
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
      
      // Check intersection
      // Two rectangles intersect if their x and y ranges overlap
      
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
    // Map preserves order, so no need to sort in serializeState
    return blocks.map((block, i) => {
      if (i === blockIndex) {
        return { ...block, row: newPos.row, col: newPos.col };
      }
      return block; // Return same object reference for unchanged blocks (shallow copy done by map)
    });
  }

  /**
   * Find solution path (returns moves needed to solve)
   * @param {Array} blocks - Array of block objects
   * @returns {Array} - Array of moves {blockId, fromRow, fromCol, toRow, toCol}
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
        console.warn('Solver timed out (findSolution)');
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
   * Serialize block state for visited set
   */
  serializeState(blocks) {
    // Blocks order is preserved, so we don't need to sort.
    // This is much faster.
    return blocks
      .map(b => `${b.row},${b.col}`) // ID is implied by position in array
      .join('|');
  }
}

