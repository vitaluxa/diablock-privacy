/**
 * DEBUG CONTROLS - FOR TESTING ONLY
 * DO NOT INCLUDE IN PRODUCTION BUILD
 * 
 * This module provides debug controls for testing the game:
 * - Tab/Shift+Tab to select blocks
 * - Arrow keys to move selected block
 * - Number keys to jump to specific levels
 * - 'S' to auto-solve current level
 * - 'A' to auto-test multiple levels
 * - 'R' to reset level
 * - 'C' to check for errors
 */

class DebugControls {
  constructor() {
    this.enabled = false;
    this.blocks = [];
    this.setBlocks = null;
    this.selectedBlockIndex = 0;
    this.keyHandler = null;
    this.errorLog = [];
    this.gameLogic = null;
  }

  /**
   * Initialize debug controls
   * @param {Array} blocks - Current blocks array
   * @param {Function} setBlocks - Blocks setter function
   * @param {Object} gameLogic - Game logic object with methods
   */
  init(blocks, setBlocks, gameLogic) {
    this.blocks = blocks;
    this.setBlocks = setBlocks;
    this.gameLogic = gameLogic;
    
    // Only enable in development
    if (import.meta.env.DEV) {
      this.enabled = true;
      this.attachKeyboardControls();
      this.logToConsole('Debug controls enabled');
      this.showHelp();
      
      // Expose to window for console access
      window.debugControls = this;
    }
  }

  /**
   * Update blocks reference (call this when blocks change)
   */
  updateBlocks(blocks) {
    this.blocks = blocks;
  }

  /**
   * Attach keyboard event listeners
   */
  attachKeyboardControls() {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
    }

    this.keyHandler = (e) => {
      // Don't interfere with normal game controls
      
      switch(e.key) {
        case 'Tab':
          e.preventDefault();
          this.selectNextBlock(e.shiftKey);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.moveSelectedBlock('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.moveSelectedBlock('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.moveSelectedBlock('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.moveSelectedBlock('right');
          break;
        case 's':
        case 'S':
          e.preventDefault();
          this.autoSolve();
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          this.autoTest();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          this.resetLevel();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          this.checkErrors();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          this.showHelp();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          this.nextLevel();
          break;
      }
      
      // Number keys for level jumping
      if (e.key >= '0' && e.key <= '9') {
        if (e.ctrlKey) {
          e.preventDefault();
          const levelNum = e.key === '0' ? 10 : parseInt(e.key);
          this.jumpToLevel(levelNum);
        }
      }
    };

    window.addEventListener('keydown', this.keyHandler);
  }

  /**
   * Select next/previous block
   */
  selectNextBlock(reverse = false) {
    if (this.blocks.length === 0) return;
    
    if (reverse) {
      this.selectedBlockIndex = (this.selectedBlockIndex - 1 + this.blocks.length) % this.blocks.length;
    } else {
      this.selectedBlockIndex = (this.selectedBlockIndex + 1) % this.blocks.length;
    }
    
    const selectedBlock = this.blocks[this.selectedBlockIndex];
    this.logToConsole(`Selected block ${this.selectedBlockIndex + 1}/${this.blocks.length}: ${selectedBlock.isRed ? 'RED' : 'BLUE'} at (${selectedBlock.row}, ${selectedBlock.col})`);
    
    // Highlight selected block visually
    this.highlightBlock(selectedBlock.id);
  }

  /**
   * Highlight a block visually
   */
  highlightBlock(blockId) {
    // Remove previous highlights
    document.querySelectorAll('.debug-highlight').forEach(el => {
      el.classList.remove('debug-highlight');
    });
    
    // Add highlight to selected block
    const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
    if (blockElement) {
      blockElement.classList.add('debug-highlight');
    }
  }

  /**
   * Move selected block in a direction
   */
  moveSelectedBlock(direction) {
    if (!this.blocks || this.blocks.length === 0 || !this.setBlocks) {
      this.logError('No blocks available');
      return;
    }

    const block = this.blocks[this.selectedBlockIndex];
    if (!block) return;

    let newRow = block.row;
    let newCol = block.col;

    // Calculate new position
    switch(direction) {
      case 'up':
        if (!block.isHorizontal) newRow = Math.max(0, block.row - 1);
        break;
      case 'down':
        if (!block.isHorizontal) newRow = Math.min(6 - block.length, block.row + 1);
        break;
      case 'left':
        if (block.isHorizontal) newCol = Math.max(0, block.col - 1);
        break;
      case 'right':
        if (block.isHorizontal) newCol = Math.min(6 - block.length, block.col + 1);
        break;
    }

    // Check if position changed
    if (newRow === block.row && newCol === block.col) {
      this.logToConsole(`Cannot move ${direction} - ${block.isHorizontal ? 'horizontal' : 'vertical'} block or boundary reached`);
      return;
    }

    // Check if blocked by other blocks
    if (this.isPositionBlocked(block.id, newRow, newCol, block.length, block.isHorizontal)) {
      this.logToConsole(`Cannot move ${direction} - blocked by another block`);
      return;
    }

    // Update block position
    this.setBlocks(prevBlocks => 
      prevBlocks.map(b => 
        b.id === block.id ? { ...b, row: newRow, col: newCol } : b
      )
    );

    this.logToConsole(`Moved block ${direction} to (${newRow}, ${newCol})`);
  }

  /**
   * Check if position is blocked
   */
  isPositionBlocked(blockId, row, col, length, isHorizontal) {
    const GRID_SIZE = 6;
    const occupied = new Set();
    
    // Mark all blocks except the one being moved
    for (const block of this.blocks) {
      if (block.id === blockId) continue;
      
      if (block.isHorizontal) {
        for (let c = block.col; c < block.col + block.length; c++) {
          occupied.add(`${block.row},${c}`);
        }
      } else {
        for (let r = block.row; r < block.row + block.length; r++) {
          occupied.add(`${r},${block.col}`);
        }
      }
    }
    
    // Check if new position overlaps
    if (isHorizontal) {
      for (let c = col; c < col + length; c++) {
        if (c < 0 || c >= GRID_SIZE) return true;
        if (occupied.has(`${row},${c}`)) return true;
      }
    } else {
      for (let r = row; r < row + length; r++) {
        if (r < 0 || r >= GRID_SIZE) return true;
        if (occupied.has(`${r},${col}`)) return true;
      }
    }
    
    return false;
  }

  /**
   * Auto-solve current level (move red block to exit)
   */
  autoSolve() {
    const redBlock = this.blocks.find(b => b.isRed);
    if (!redBlock) {
      this.logError('Red block not found');
      return;
    }

    this.logToConsole('Auto-solving level...');
    
    // Move red block to the right until it reaches the exit
    const targetCol = 6 - redBlock.length;
    
    if (redBlock.col === targetCol) {
      this.logToConsole('Already at exit!');
      return;
    }

    // Try to move red block to exit
    let currentCol = redBlock.col;
    const moveInterval = setInterval(() => {
      if (currentCol >= targetCol) {
        clearInterval(moveInterval);
        this.logToConsole('✅ Level auto-solved!');
        return;
      }

      currentCol++;
      
      // Check if blocked
      if (this.isPositionBlocked(redBlock.id, redBlock.row, currentCol, redBlock.length, true)) {
        clearInterval(moveInterval);
        this.logError('Cannot auto-solve - path is blocked');
        return;
      }

      // Move block
      this.setBlocks(prevBlocks => 
        prevBlocks.map(b => 
          b.isRed ? { ...b, col: currentCol } : b
        )
      );
    }, 200);
  }

  /**
   * Auto-test multiple levels
   */
  async autoTest(startLevel = null, endLevel = 50) {
    const start = startLevel || (this.gameLogic?.levelNumber || 1);
    this.logToConsole(`🚀 Starting auto-test from level ${start} to ${endLevel}...`);
    
    for (let level = start; level <= endLevel; level++) {
      this.logToConsole(`Testing level ${level}...`);
      
      // Jump to level
      if (this.gameLogic?.generateLevel) {
        await this.gameLogic.generateLevel(false, level, level);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Check for errors
      const errors = this.checkErrors();
      if (errors && errors.length > 0) {
        this.logError(`❌ Level ${level} has errors!`);
        break;
      }
      
      this.logToConsole(`✅ Level ${level} passed`);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    this.logToConsole('🎉 Auto-test complete!');
  }

  /**
   * Reset current level
   */
  resetLevel() {
    if (this.gameLogic?.generateLevel) {
      this.gameLogic.generateLevel(false, this.gameLogic.levelNumber, this.gameLogic.levelNumber);
      this.logToConsole('Level reset');
    }
  }

  /**
   * Next level
   */
  nextLevel() {
    if (this.gameLogic?.nextLevel) {
      this.gameLogic.nextLevel();
      this.logToConsole('Next level');
    }
  }

  /**
   * Jump to a specific level
   */
  jumpToLevel(levelNum) {
    if (this.gameLogic?.generateLevel) {
      this.gameLogic.generateLevel(false, levelNum, levelNum);
      this.logToConsole(`Jumped to level ${levelNum}`);
    }
  }

  /**
   * Check for errors in game state
   */
  checkErrors() {
    const errors = [];
    const GRID_SIZE = 6;

    // Check if blocks exist
    if (!this.blocks || this.blocks.length === 0) {
      errors.push('No blocks found');
      return errors;
    }

    // Check for red block
    const redBlock = this.blocks.find(b => b.isRed);
    if (!redBlock) {
      errors.push('No red block found');
    } else {
      // Check red block is in correct row
      if (redBlock.row !== 2) {
        errors.push(`Red block should be in row 2, but is in row ${redBlock.row}`);
      }
      // Check red block is horizontal
      if (!redBlock.isHorizontal) {
        errors.push('Red block should be horizontal');
      }
    }

    // Check all blocks for validity
    for (const block of this.blocks) {
      // Check bounds
      if (block.row < 0 || block.row >= GRID_SIZE) {
        errors.push(`Block ${block.id} row ${block.row} is out of bounds`);
      }
      if (block.col < 0 || block.col >= GRID_SIZE) {
        errors.push(`Block ${block.id} col ${block.col} is out of bounds`);
      }
      
      // Check length
      if (block.isHorizontal && block.col + block.length > GRID_SIZE) {
        errors.push(`Block ${block.id} extends beyond grid horizontally`);
      }
      if (!block.isHorizontal && block.row + block.length > GRID_SIZE) {
        errors.push(`Block ${block.id} extends beyond grid vertically`);
      }
    }

    // Check for overlapping blocks
    const occupied = new Map();
    for (const block of this.blocks) {
      if (block.isHorizontal) {
        for (let c = block.col; c < block.col + block.length; c++) {
          const key = `${block.row},${c}`;
          if (occupied.has(key)) {
            errors.push(`Blocks ${occupied.get(key)} and ${block.id} overlap at (${block.row}, ${c})`);
          }
          occupied.set(key, block.id);
        }
      } else {
        for (let r = block.row; r < block.row + block.length; r++) {
          const key = `${r},${block.col}`;
          if (occupied.has(key)) {
            errors.push(`Blocks ${occupied.get(key)} and ${block.id} overlap at (${r}, ${block.col})`);
          }
          occupied.set(key, block.id);
        }
      }
    }

    // Log results
    if (errors.length === 0) {
      this.logToConsole('✅ No errors found');
      console.log('Current blocks:', this.blocks);
    } else {
      this.logError('❌ Errors found:');
      errors.forEach(err => this.logError(`  - ${err}`));
    }

    return errors;
  }

  /**
   * Show help message
   */
  showHelp() {
    console.log('%c🎮 DEBUG CONTROLS', 'color: #00ff00; font-size: 16px; font-weight: bold');
    console.log('%cTab/Shift+Tab', 'color: #ffff00', '- Select block');
    console.log('%cArrow Keys', 'color: #ffff00', '- Move selected block');
    console.log('%cCtrl+0-9', 'color: #ffff00', '- Jump to level');
    console.log('%cS', 'color: #ffff00', '- Auto-solve level');
    console.log('%cA', 'color: #ffff00', '- Auto-test levels 1-50');
    console.log('%cN', 'color: #ffff00', '- Next level');
    console.log('%cR', 'color: #ffff00', '- Reset level');
    console.log('%cC', 'color: #ffff00', '- Check for errors');
    console.log('%cH', 'color: #ffff00', '- Show this help');
    console.log('\n%cConsole Commands:', 'color: #00ffff; font-weight: bold');
    console.log('%cdebugControls.autoTest(1, 50)', 'color: #ffff00', '- Test levels 1-50');
    console.log('%cdebugControls.jumpToLevel(N)', 'color: #ffff00', '- Jump to level N');
  }

  /**
   * Log message to console
   */
  logToConsole(message) {
    console.log(`%c[DEBUG] ${message}`, 'color: #00ff00');
  }

  /**
   * Log error to console
   */
  logError(message) {
    console.error(`[DEBUG ERROR] ${message}`);
    this.errorLog.push({ timestamp: Date.now(), message });
  }

  /**
   * Get error log
   */
  getErrorLog() {
    return this.errorLog;
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
    }
    this.enabled = false;
    this.blocks = [];
    this.setBlocks = null;
    this.gameLogic = null;
  }
}

// Export singleton instance
export const debugControls = new DebugControls();
