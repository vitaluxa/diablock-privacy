import { getAnalytics, logEvent } from 'firebase/analytics';

/**
 * Debug Service for tracking game issues and analytics
 * Logs to console in development and Firebase Analytics in production
 */
class DebugService {
  constructor() {
    this.analytics = null;
    this.isInitialized = false;
    this.eventQueue = [];
    this.errorLog = [];
    this.gameStateHistory = [];
    this.maxHistorySize = 50;
  }

  /**
   * Initialize the debug service with Firebase Analytics
   */
  init(firebaseApp) {
    try {
      if (firebaseApp && !this.isInitialized) {
        this.analytics = getAnalytics(firebaseApp);
        this.isInitialized = true;
        console.log('🔍 Debug Service initialized with Firebase Analytics');
        
        // Flush any queued events
        this.flushQueue();
      }
    } catch (error) {
      console.error('Failed to initialize Debug Service:', error);
    }
  }

  /**
   * Log a custom event
   */
  logEvent(eventName, params = {}) {
    const timestamp = new Date().toISOString();
    const eventData = {
      timestamp,
      eventName,
      params
    };

    // Always log to console in development
    console.log(`📊 [${eventName}]`, params);

    // Store in event queue
    this.eventQueue.push(eventData);
    if (this.eventQueue.length > this.maxHistorySize) {
      this.eventQueue.shift();
    }

    // Send to Firebase Analytics if initialized
    if (this.isInitialized && this.analytics) {
      try {
        logEvent(this.analytics, eventName, {
          ...params,
          timestamp
        });
      } catch (error) {
        console.error('Failed to log event to Firebase:', error);
      }
    }
  }

  /**
   * Log an error with context
   */
  logError(errorName, error, context = {}) {
    const errorData = {
      timestamp: new Date().toISOString(),
      errorName,
      message: error?.message || String(error),
      stack: error?.stack,
      context
    };

    console.error(`❌ [${errorName}]`, errorData);

    this.errorLog.push(errorData);
    if (this.errorLog.length > this.maxHistorySize) {
      this.errorLog.shift();
    }

    // Log to Firebase Analytics
    this.logEvent('game_error', {
      error_name: errorName,
      error_message: errorData.message,
      ...context
    });
  }

  /**
   * Track game state for debugging
   */
  trackGameState(state) {
    const stateSnapshot = {
      timestamp: new Date().toISOString(),
      ...state
    };

    this.gameStateHistory.push(stateSnapshot);
    if (this.gameStateHistory.length > this.maxHistorySize) {
      this.gameStateHistory.shift();
    }
  }

  /**
   * Log block-related events
   */
  logBlockEvent(eventType, blockData, context = {}) {
    this.logEvent(`block_${eventType}`, {
      block_id: blockData.id,
      block_type: blockData.type,
      block_position: `${blockData.x},${blockData.y}`,
      block_orientation: blockData.orientation,
      ...context
    });
  }

  /**
   * Log level generation events
   */
  logLevelGeneration(levelNumber, success, details = {}) {
    this.logEvent('level_generation', {
      level_number: levelNumber,
      success,
      ...details
    });
  }

  /**
   * Log collision/stacking issues
   */
  logCollisionIssue(type, details) {
    console.warn(`⚠️ Collision Issue [${type}]:`, details);
    this.logEvent('collision_issue', {
      issue_type: type,
      ...details
    });
  }

  /**
   * Log abnormal block states
   */
  logAbnormalBlock(blockData, reason) {
    console.warn('⚠️ Abnormal Block Detected:', { blockData, reason });
    this.logEvent('abnormal_block', {
      block_id: blockData.id,
      block_type: blockData.type,
      reason,
      position: `${blockData.x},${blockData.y}`,
      orientation: blockData.orientation
    });
  }

  /**
   * Log game performance metrics
   */
  logPerformance(metricName, value, context = {}) {
    this.logEvent('performance_metric', {
      metric_name: metricName,
      value,
      ...context
    });
  }

  /**
   * Log user interactions
   */
  logUserAction(action, details = {}) {
    this.logEvent('user_action', {
      action,
      ...details
    });
  }

  /**
   * Validate block state and log issues
   */
  validateBlock(block, gridSize = 6) {
    const issues = [];

    // Check if block is within grid bounds
    if (block.x < 0 || block.x >= gridSize) {
      issues.push(`x position out of bounds: ${block.x}`);
    }
    if (block.y < 0 || block.y >= gridSize) {
      issues.push(`y position out of bounds: ${block.y}`);
    }

    // Check if block has valid type
    if (!block.type || !['horizontal', 'vertical'].includes(block.type)) {
      issues.push(`invalid block type: ${block.type}`);
    }

    // Check if block has valid orientation
    if (block.orientation === undefined || block.orientation === null) {
      issues.push(`missing orientation`);
    }

    // Check if block has valid size
    if (!block.size || block.size < 2 || block.size > gridSize) {
      issues.push(`invalid block size: ${block.size}`);
    }

    // Check if block extends beyond grid
    if (block.type === 'horizontal' && block.x + block.size > gridSize) {
      issues.push(`horizontal block extends beyond grid: x=${block.x}, size=${block.size}`);
    }
    if (block.type === 'vertical' && block.y + block.size > gridSize) {
      issues.push(`vertical block extends beyond grid: y=${block.y}, size=${block.size}`);
    }

    // Log any issues found
    if (issues.length > 0) {
      this.logAbnormalBlock(block, issues.join('; '));
      return false;
    }

    return true;
  }

  /**
   * Validate entire blocks array
   */
  validateBlocks(blocks, gridSize = 6) {
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    const overlaps = [];

    blocks.forEach((block, index) => {
      // Validate individual block
      this.validateBlock(block, gridSize);

      // Check for overlaps
      const cells = this.getBlockCells(block);
      cells.forEach(([x, y]) => {
        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
          if (grid[y][x] !== null) {
            overlaps.push({
              block1: grid[y][x],
              block2: index,
              position: [x, y]
            });
          }
          grid[y][x] = index;
        }
      });
    });

    if (overlaps.length > 0) {
      this.logCollisionIssue('block_overlap', {
        overlap_count: overlaps.length,
        overlaps: overlaps.map(o => `blocks ${o.block1} and ${o.block2} at [${o.position}]`).join('; ')
      });
    }

    return overlaps.length === 0;
  }

  /**
   * Get all cells occupied by a block
   */
  getBlockCells(block) {
    const cells = [];
    for (let i = 0; i < block.size; i++) {
      if (block.type === 'horizontal') {
        cells.push([block.x + i, block.y]);
      } else {
        cells.push([block.x, block.y + i]);
      }
    }
    return cells;
  }

  /**
   * Flush queued events
   */
  flushQueue() {
    if (this.isInitialized && this.analytics && this.eventQueue.length > 0) {
      console.log(`Flushing ${this.eventQueue.length} queued events`);
      // Events are already logged, just clear the queue
      this.eventQueue = [];
    }
  }

  /**
   * Get debug report
   */
  getDebugReport() {
    return {
      recentEvents: this.eventQueue.slice(-20),
      recentErrors: this.errorLog.slice(-10),
      gameStateHistory: this.gameStateHistory.slice(-10)
    };
  }

  /**
   * Export debug data as JSON
   */
  exportDebugData() {
    const data = {
      timestamp: new Date().toISOString(),
      events: this.eventQueue,
      errors: this.errorLog,
      gameState: this.gameStateHistory
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-log-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const debugService = new DebugService();
