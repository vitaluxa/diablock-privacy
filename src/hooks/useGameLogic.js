import { useState, useEffect, useCallback, useRef } from 'react';
import { LevelGenerator } from '../services/levelGenerator';
import { soundEffectsService } from '../services/soundEffectsService';
import { debugControls } from '../utils/debugControls';
import { debugService } from '../services/debugService';

const CELL_SIZE = 70; // Size of each cell in pixels (will be responsive)
const GRID_SIZE = 6;

export function useGameLogic(firebaseHook = null) {
  const [blocks, setBlocks] = useState([]);
  const [draggingBlock, setDraggingBlock] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPosition, setDragStartPosition] = useState(null);
  const lastBlockPositionRef = useRef({ row: null, col: null });
  const soundThrottleRef = useRef(0);
  const [isWon, setIsWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [levelNumber, setLevelNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [globalScore, setGlobalScore] = useState(0);
  const [currentLevelScore, setCurrentLevelScore] = useState(0);

  // Level pre-generation cache
  const levelCacheRef = useRef(new Map()); // Map of levelNumber -> blocks array
  const isGeneratingRef = useRef(false); // Track if background generation is in progress

  // Track played levels to avoid duplicates
  const [playedLevelHashes, setPlayedLevelHashes] = useState(new Set());

  // Load game state - try Firebase first, fallback to localStorage
  useEffect(() => {
    async function loadGameState() {
      // Prevent reloading if we just won (to avoid level skipping bug)
      if (isWon) return;

      if (firebaseHook && firebaseHook.isInitialized) {
        try {
          const cloudState = await firebaseHook.loadGameState();
          if (cloudState) {
            // Validate and load the saved level number (which is the next level to play)
            const savedLevel = cloudState.levelNumber;
            const savedScore = cloudState.globalScore;
            
            // Validate level number
            if (savedLevel !== undefined && !isNaN(savedLevel) && savedLevel >= 1 && savedLevel <= 10000) {
              setLevelNumber(savedLevel);
            } else {
              setLevelNumber(1); // Default to level 1 if invalid
            }
            
            // Validate global score
            if (savedScore !== undefined && !isNaN(savedScore) && savedScore >= 0) {
              setGlobalScore(savedScore);
            } else {
              setGlobalScore(0); // Default to 0 if invalid
            }
            return;
          }
        } catch (error) {
          console.error('Failed to load from cloud, using local storage:', error);
        }
      }

      // Fallback to localStorage with validation
      try {
        const savedScore = localStorage.getItem('diaBlockGlobalScore');
        const savedLevel = localStorage.getItem('diaBlockLevel');
        
        if (savedScore !== null && savedScore !== undefined) {
          const parsedScore = parseInt(savedScore, 10);
          // Validate score is a valid positive number
          if (!isNaN(parsedScore) && parsedScore >= 0) {
            setGlobalScore(parsedScore);
          }
        }
        
        if (savedLevel !== null && savedLevel !== undefined) {
          // Load saved level (which is the next level to play after last completion)
          const parsedLevel = parseInt(savedLevel, 10);
          // Validate level is a valid positive number
          if (!isNaN(parsedLevel) && parsedLevel >= 1 && parsedLevel <= 10000) {
            setLevelNumber(parsedLevel);
          }
        }
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
      }
    }

    loadGameState();
    loadGameState();
  }, [firebaseHook.isInitialized, firebaseHook.loadGameState]); // Only depend on initialization and load function

  // Track if we've saved for current win to prevent double saves
  const hasSavedForWin = useRef(false);
  const lastWonLevel = useRef(0);
  // Track isWon state in a ref for timer to access latest value
  const isWonRef = useRef(false);
  // Track the next level to prevent race conditions
  const nextLevelRef = useRef(null);
  // Track if we're currently saving to prevent multiple simultaneous saves
  const isSavingRef = useRef(false);
  
  // Load played hashes from localStorage on mount
  useEffect(() => {
    try {
      const savedHashes = localStorage.getItem('diaBlockPlayedHashes');
      if (savedHashes) {
        setPlayedLevelHashes(new Set(JSON.parse(savedHashes)));
      }
    } catch (e) {
      console.error('Failed to load played hashes:', e);
    }
  }, []);

  // Save played hashes when updated
  useEffect(() => {
    try {
      localStorage.setItem('diaBlockPlayedHashes', JSON.stringify([...playedLevelHashes]));
    } catch (e) {
      console.error('Failed to save played hashes:', e);
    }
  }, [playedLevelHashes]);

  // Keep ref in sync with state
  useEffect(() => {
    isWonRef.current = isWon;
  }, [isWon]);

  // Save game state immediately when level is completed - save next level for next game start
  useEffect(() => {
    if (isWon && lastWonLevel.current !== levelNumber) {
      // Reset flag for new win
      hasSavedForWin.current = false;
      lastWonLevel.current = levelNumber;
      nextLevelRef.current = levelNumber + 1; // Track the next level
    }

    if (isWon && !hasSavedForWin.current && !isSavingRef.current) {
      async function saveOnWin() {
        isSavingRef.current = true; // Prevent other saves
        hasSavedForWin.current = true; // Mark as saved immediately
        
        // Calculate next level (level user will start from next time)
        const nextLevelNumber = levelNumber + 1;
        nextLevelRef.current = nextLevelNumber; // Update ref
        
        if (firebaseHook && firebaseHook.isInitialized) {
          try {
            console.log('☁️ Attempting to save win state to cloud...', { nextLevelNumber, globalScore });
            // Save game state with next level number (so next start will be from next level)
            await firebaseHook.saveGameState({
              levelNumber: nextLevelNumber, // Save next level, not current completed one
              globalScore,
              achievements: [], // Can add achievements later
            });
            console.log('✅ Win state saved to cloud successfully');
            
            // Also submit score to leaderboard immediately
            if (globalScore > 0) {
              await firebaseHook.submitScore(globalScore, levelNumber);
            }
          } catch (error) {
            console.error('❌ Failed to save to cloud when level won:', error);
          }
        }

        // Always save to localStorage as backup immediately with next level number
        try {
          localStorage.setItem('diaBlockGlobalScore', globalScore.toString());
          localStorage.setItem('diaBlockLevel', nextLevelNumber.toString()); // Save next level
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded, unable to save game state');
          } else {
            console.error('Failed to save to localStorage:', error);
          }
        }
        
        isSavingRef.current = false; // Allow saves again
      }

      saveOnWin();
    }
  }, [isWon, levelNumber, globalScore, firebaseHook.isInitialized, firebaseHook.saveGameState, firebaseHook.submitScore]);

  // Save game state - try Firebase first, fallback to localStorage (on score/level changes)
  // But skip if we just won a level (handled by win condition useEffect)
  // Also skip if we're currently loading (level transition in progress)
  useEffect(() => {
    if (isWon || isLoading || isSavingRef.current) return; // Skip regular save if level is won, loading, or currently saving
    
    // Debounce saves to prevent rapid-fire saves
    const timeoutId = setTimeout(() => {
      async function saveGameState() {
        if (isSavingRef.current) return; // Double-check we're not already saving
        
        isSavingRef.current = true;
        
        if (firebaseHook && firebaseHook.isInitialized) {
          try {
            console.log('☁️ Auto-saving game state to cloud...', { levelNumber, globalScore });
            await firebaseHook.saveGameState({
              levelNumber,
              globalScore,
              achievements: [], // Can add achievements later
            });
            console.log('✅ Game state auto-saved to cloud');
          } catch (error) {
            console.error('❌ Failed to save to cloud, using local storage:', error);
          }
        }

        // Always save to localStorage as backup
        try {
          localStorage.setItem('diaBlockGlobalScore', globalScore.toString());
          localStorage.setItem('diaBlockLevel', levelNumber.toString());
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded, unable to save game state');
          } else {
            console.error('Failed to save to localStorage:', error);
          }
        }
        
        isSavingRef.current = false;
      }

      if (globalScore > 0 || levelNumber > 1) {
        saveGameState();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [globalScore, levelNumber, firebaseHook.isInitialized, firebaseHook.saveGameState, isWon, isLoading]);

  // Timer effect - stops immediately when won
  useEffect(() => {
    if (!startTime || isWon) {
      // If won, don't start timer or stop if already running
      return;
    }

    const interval = setInterval(() => {
      // Check latest isWon state via ref to ensure we stop immediately
      if (isWonRef.current) {
        return; // Stop timer immediately if won
      }
      
      // Update elapsed time only if not won
      setElapsedTime(prev => {
        // Double-check ref value inside state update callback
        if (isWonRef.current) {
          return prev; // Return previous value without updating
        }
        return Math.floor((Date.now() - startTime) / 1000);
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, isWon]);

  // Pre-generate next level in the background
  const pregenerateNextLevel = useCallback(async (nextLevelNum) => {
    // Don't pre-generate if already generating or if already cached
    if (isGeneratingRef.current || levelCacheRef.current.has(nextLevelNum)) {
      return;
    }

    isGeneratingRef.current = true;
    
    try {
      console.log(`🔄 Pre-generating level ${nextLevelNum} in background...`);
      const generator = new LevelGenerator();
      const newBlocks = await generator.generateLevel(nextLevelNum);
      
      // Store in cache
      levelCacheRef.current.set(nextLevelNum, newBlocks);
      console.log(`✅ Level ${nextLevelNum} pre-generated and cached`);
      
      // Keep cache size manageable - only cache next 2 levels
      if (levelCacheRef.current.size > 2) {
        const oldestLevel = Math.min(...levelCacheRef.current.keys());
        levelCacheRef.current.delete(oldestLevel);
      }
    } catch (error) {
      console.error(`Failed to pre-generate level ${nextLevelNum}:`, error);
    } finally {
      isGeneratingRef.current = false;
    }
  }, []);

  // Generate new level (progressive difficulty)
  const generateLevel = useCallback(async (startNewGame = false, targetLevel = null, updateLevelNumber = null) => {
    // Set loading immediately - this triggers the overlay
    setIsLoading(true);
    setIsWon(false);
    hasSavedForWin.current = false; // Reset save flag for new level
    setMoves(0);
    setStartTime(null);
    setElapsedTime(0);
    setCurrentLevelScore(0);

    let levelToGenerate = targetLevel !== null ? targetLevel : levelNumber;
    let newLevelNumber = levelNumber;

    if (startNewGame) {
      newLevelNumber = 1;
      setLevelNumber(1);
      setGlobalScore(0);
      lastWonLevel.current = 0;
      nextLevelRef.current = null; // Clear next level ref
      setBlocks([]); // Clear blocks immediately to prevent ghost blocks
      try {
        localStorage.setItem('diaBlockGlobalScore', '0');
        localStorage.setItem('diaBlockLevel', '1');
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded');
        }
      }
      levelToGenerate = 1;
    } else if (updateLevelNumber !== null) {
      // Update level number immediately when transitioning
      // If nextLevelRef is set (from win), use it. Otherwise use the provided value.
      const actualNextLevel = nextLevelRef.current !== null ? nextLevelRef.current : updateLevelNumber;
      newLevelNumber = actualNextLevel;
      setLevelNumber(actualNextLevel);
      nextLevelRef.current = null; // Clear after using
      // Immediately save the correct level to prevent race conditions
      try {
        localStorage.setItem('diaBlockLevel', actualNextLevel.toString());
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded');
        }
      }
      levelToGenerate = actualNextLevel;
    }

    // Add a small delay to ensure loading state is visible (only if not using cache)
    const hasCachedLevel = levelCacheRef.current.has(levelToGenerate);
    
    if (!hasCachedLevel) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      let newBlocks;
      
      // Check if we have a cached level
      if (hasCachedLevel) {
        console.log(`⚡ Using cached level ${levelToGenerate}`);
        newBlocks = levelCacheRef.current.get(levelToGenerate);
        // Remove from cache after using
        levelCacheRef.current.delete(levelToGenerate);
        debugService.logLevelGeneration(levelToGenerate, true, { source: 'cache', blockCount: newBlocks.length });
      } else {
        // Generate level normally
        console.log(`🔨 Generating level ${levelToGenerate}...`);
        const generator = new LevelGenerator();
        try {
          // Try to generate a unique level
          let attempts = 0;
          let isUnique = false;
          
          while (!isUnique && attempts < 5) {
            newBlocks = await generator.generateLevel(levelToGenerate);
            const hash = generator.getLevelHash(newBlocks);
            
            // For first few levels, don't worry about uniqueness as much (they are simple)
            // For higher levels, ensure we haven't played this exact layout before
            if (levelToGenerate <= 5 || !playedLevelHashes.has(hash)) {
              isUnique = true;
            } else {
              console.log(`⚠️ Generated duplicate level (hash: ${hash}), retrying...`);
              attempts++;
            }
          }
          
          if (!isUnique) {
             console.warn('Could not generate unique level after 5 attempts, using last generated');
          }

          debugService.logLevelGeneration(levelToGenerate, true, { source: 'generated', blockCount: newBlocks.length });
        } catch (genError) {
          debugService.logError('level_generation_failed', genError, { levelNumber: levelToGenerate });
          throw genError;
        }
      }
      
      // Validate all blocks before setting them
      debugService.validateBlocks(newBlocks, GRID_SIZE);
      
      // Log each block for debugging
      newBlocks.forEach((block, index) => {
        debugService.validateBlock(block, GRID_SIZE);
        debugService.logBlockEvent('created', {
          id: block.id,
          type: block.isHorizontal ? 'horizontal' : 'vertical',
          x: block.col,
          y: block.row,
          orientation: block.isHorizontal ? 'h' : 'v',
          size: block.length
        }, { levelNumber: levelToGenerate, blockIndex: index });
      });
      
      setBlocks(newBlocks);
      
      // Track game state
      debugService.trackGameState({
        levelNumber: levelToGenerate,
        blockCount: newBlocks.length,
        moves: 0,
        isWon: false
      });
      
      // Start pre-generating the next level in the background
      const nextLevelNum = levelToGenerate + 1;
      // Use setTimeout to ensure this happens after current level is rendered
      setTimeout(() => {
        pregenerateNextLevel(nextLevelNum);
      }, 500); // Wait 500ms before starting background generation
      
    } catch (error) {
      console.error('Error generating level:', error);
      debugService.logError('level_generation_error', error, { levelNumber: levelToGenerate });
    } finally {
      setIsLoading(false);
    }
  }, [levelNumber, pregenerateNextLevel]);

  // Pre-generate next level when current level is loaded and user starts playing
  useEffect(() => {
    // Only pre-generate if we have blocks (level is loaded) and not won yet
    if (blocks.length > 0 && !isWon && !isLoading) {
      const nextLevelNum = levelNumber + 1;
      // Delay pre-generation slightly to not interfere with current level
      const timeoutId = setTimeout(() => {
        pregenerateNextLevel(nextLevelNum);
      }, 2000); // Wait 2 seconds after level loads before pre-generating
      
      return () => clearTimeout(timeoutId);
    }
  }, [blocks.length, isWon, isLoading, levelNumber, pregenerateNextLevel]);

  // Check win condition - only calculate score once when first won
  useEffect(() => {
    // Don't check win condition if no blocks loaded yet or if already won
    if (blocks.length === 0 || isWon) return;
    
    const redBlock = blocks.find(b => b.isRed);
    if (redBlock && redBlock.col + redBlock.length === GRID_SIZE) {
      // Ensure player has actually played - require at least one move
      // This prevents immediate wins when level loads
      if (moves > 0) {
        // Freeze timer immediately
        setIsWon(true);
        
        // Calculate level score only once - ensure score >= 0
        const baseScore = 1000 * levelNumber;
        const timePenalty = elapsedTime * 5;
        const movePenalty = moves * 10;
        const levelScore = Math.max(0, baseScore - timePenalty - movePenalty);
        
        // Log win event
        debugService.logEvent('level_won', {
          levelNumber,
          moves,
          elapsedTime,
          levelScore,
          baseScore,
          timePenalty,
          movePenalty
        });
        
        // Add current level hash to played set
        const generator = new LevelGenerator();
        const currentHash = generator.getLevelHash(blocks);
        if (currentHash) {
          setPlayedLevelHashes(prev => {
            const newSet = new Set(prev);
            newSet.add(currentHash);
            return newSet;
          });
        }
        
        setCurrentLevelScore(levelScore);
        setGlobalScore(prev => {
          const newScore = Math.max(0, prev + levelScore); // Ensure global score >= 0
          try {
            localStorage.setItem('diaBlockGlobalScore', newScore.toString());
          } catch (error) {
            if (error.name === 'QuotaExceededError') {
              console.warn('localStorage quota exceeded, unable to save score');
            } else {
              console.error('Failed to save score to localStorage:', error);
            }
          }
          return newScore;
        });
      }
    }
  }, [blocks, elapsedTime, moves, levelNumber, isWon]);

  // Check if a position is blocked by other blocks
  const isPositionBlocked = useCallback((blockId, row, col, length, isHorizontal) => {
    // Validate input parameters
    if (typeof row !== 'number' || typeof col !== 'number' || typeof length !== 'number') {
      return true; // Invalid parameters, consider blocked
    }
    
    // Strict boundary checks - ensure all coordinates are within valid range
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
      return true; // Out of bounds, consider blocked
    }
    
    if (isHorizontal) {
      if (col + length > GRID_SIZE || col + length < 1) {
        return true; // Horizontal block would be out of bounds
      }
    } else {
      if (row + length > GRID_SIZE || row + length < 1) {
        return true; // Vertical block would be out of bounds
      }
    }
    
    // Create a grid to check all occupied positions
    const occupied = new Set();
    
    // Mark all blocks except the one being moved
    for (const block of blocks) {
      if (block.id === blockId) continue;
      
      // Validate block data
      if (typeof block.row !== 'number' || typeof block.col !== 'number' || typeof block.length !== 'number') {
        continue; // Skip invalid blocks
      }
      
      if (block.isHorizontal) {
        for (let c = block.col; c < block.col + block.length; c++) {
          if (c >= 0 && c < GRID_SIZE && block.row >= 0 && block.row < GRID_SIZE) {
            occupied.add(`${block.row},${c}`);
          }
        }
      } else {
        for (let r = block.row; r < block.row + block.length; r++) {
          if (r >= 0 && r < GRID_SIZE && block.col >= 0 && block.col < GRID_SIZE) {
            occupied.add(`${r},${block.col}`);
          }
        }
      }
    }
    
    // Check if new position overlaps with any occupied cell
    if (isHorizontal) {
      for (let c = col; c < col + length; c++) {
        if (c < 0 || c >= GRID_SIZE) return true; // Out of bounds
        if (occupied.has(`${row},${c}`)) {
          return true;
        }
      }
    } else {
      for (let r = row; r < row + length; r++) {
        if (r < 0 || r >= GRID_SIZE) return true; // Out of bounds
        if (occupied.has(`${r},${col}`)) {
          return true;
        }
      }
    }
    
    return false;
  }, [blocks]);

  // Handle drag start
  const handleDragStart = useCallback((blockId, clientX, clientY) => {
    // Prevent dragging during loading or when won
    if (isLoading || isWon) return;
    
    if (!startTime) {
      setStartTime(Date.now());
    }

    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const boardElement = document.getElementById('game-board');
    if (!boardElement) return;
    
    const boardRect = boardElement.getBoundingClientRect();
    const cellSize = boardRect.width / GRID_SIZE;
    const blockX = boardRect.left + block.col * cellSize;
    const blockY = boardRect.top + block.row * cellSize;

    // Play subtle click sound when grabbing block
    soundEffectsService.playBlockClick().catch(() => {});

    // Log drag start
    debugService.logUserAction('drag_start', {
      blockId,
      blockType: block.isHorizontal ? 'horizontal' : 'vertical',
      startPosition: `${block.col},${block.row}`,
      levelNumber
    });

    setDraggingBlock(blockId);
    setDragStartPosition({ row: block.row, col: block.col });
    setDragOffset({
      x: clientX - blockX,
      y: clientY - blockY
    });
  }, [blocks, startTime, isLoading, isWon, levelNumber]);

  // Handle drag move
  const handleDragMove = useCallback((clientX, clientY) => {
    // Prevent dragging during loading or when won
    if (isLoading || isWon || !draggingBlock) return;

    const block = blocks.find(b => b.id === draggingBlock);
    if (!block) return;

    const boardElement = document.getElementById('game-board');
    if (!boardElement) return;
    
    const boardRect = boardElement.getBoundingClientRect();
    const cellSize = boardRect.width / GRID_SIZE;
    
    // Calculate new position
    let newRow = block.row;
    let newCol = block.col;

    if (block.isHorizontal) {
      // Only allow horizontal movement
      const newX = clientX - boardRect.left - dragOffset.x;
      newCol = Math.round(newX / cellSize);
      // Strict bounds checking: ensure block stays within 0 to GRID_SIZE - block.length
      newCol = Math.max(0, Math.min(GRID_SIZE - block.length, newCol));
      // Ensure newCol is valid integer
      newCol = Math.floor(newCol);
      if (newCol < 0 || newCol + block.length > GRID_SIZE) return;
    } else {
      // Only allow vertical movement
      const newY = clientY - boardRect.top - dragOffset.y;
      newRow = Math.round(newY / cellSize);
      // Strict bounds checking: ensure block stays within 0 to GRID_SIZE - block.length
      newRow = Math.max(0, Math.min(GRID_SIZE - block.length, newRow));
      // Ensure newRow is valid integer
      newRow = Math.floor(newRow);
      if (newRow < 0 || newRow + block.length > GRID_SIZE) return;
    }

      // Removed redundant double-check bounds; earlier clamping ensures valid positions
      // if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE) return;
      // if (block.isHorizontal && (newCol < 0 || newCol + block.length > GRID_SIZE || newCol + block.length < 1)) return;
      // if (!block.isHorizontal && (newRow < 0 || newRow + block.length > GRID_SIZE || newRow + block.length < 1)) return;

    // Check if new position is valid (not blocked) - must check BEFORE updating
    // IMPORTANT: Check all positions between current and target to prevent jumping over blocks
    let canMove = true;
    if (newRow !== block.row || newCol !== block.col) {
      if (block.isHorizontal) {
        // Check all intermediate columns
        const start = Math.min(block.col, newCol);
        const end = Math.max(block.col, newCol);
        for (let checkCol = start; checkCol <= end; checkCol++) {
          if (isPositionBlocked(block.id, block.row, checkCol, block.length, block.isHorizontal)) {
            canMove = false;
            break;
          }
        }
      } else {
        // Check all intermediate rows
        const start = Math.min(block.row, newRow);
        const end = Math.max(block.row, newRow);
        for (let checkRow = start; checkRow <= end; checkRow++) {
          if (isPositionBlocked(block.id, checkRow, block.col, block.length, block.isHorizontal)) {
            canMove = false;
            break;
          }
        }
      }
    }

    if (canMove && (newRow !== block.row || newCol !== block.col)) {
      // Play sliding sound when block moves to a new cell (throttled)
      const now = Date.now();
      const lastPos = lastBlockPositionRef.current;
      if (lastPos.row !== newRow || lastPos.col !== newCol) {
        if (now - soundThrottleRef.current > 50) { // Throttle to max once per 50ms for smoother sound
          soundEffectsService.playBlockSlide().catch(() => {});
          soundThrottleRef.current = now;
          lastBlockPositionRef.current = { row: newRow, col: newCol };
        }
      }
      
      // Update blocks only if position is valid
      setBlocks(prevBlocks => {
        const updatedBlocks = prevBlocks.map(b => {
          if (b.id === draggingBlock) {
            // Log block movement
            debugService.logBlockEvent('moved', {
              id: b.id,
              type: b.isHorizontal ? 'horizontal' : 'vertical',
              x: newCol,
              y: newRow,
              orientation: b.isHorizontal ? 'h' : 'v',
              size: b.length
            }, {
              oldPosition: `${b.col},${b.row}`,
              newPosition: `${newCol},${newRow}`,
              levelNumber
            });
            return { ...b, row: newRow, col: newCol };
          }
          return b;
        });
        
        // Validate blocks after update
        debugService.validateBlocks(updatedBlocks, GRID_SIZE);
        
        return updatedBlocks;
      });
    } else if (newRow !== block.row || newCol !== block.col) {
      // Position is blocked - log collision issue
      debugService.logCollisionIssue('blocked_movement', {
        blockId: block.id,
        attemptedPosition: `${newCol},${newRow}`,
        currentPosition: `${block.col},${block.row}`,
        blockType: block.isHorizontal ? 'horizontal' : 'vertical',
        levelNumber
      });
    }
  }, [draggingBlock, blocks, dragOffset, isPositionBlocked, isLoading, isWon]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (draggingBlock && dragStartPosition) {
      const block = blocks.find(b => b.id === draggingBlock);
      
      // Check if block actually moved from its starting position
      if (block && (block.row !== dragStartPosition.row || block.col !== dragStartPosition.col)) {
        setMoves(prev => prev + 1);
        // Play move confirmation sound
        soundEffectsService.playBlockMove().catch(() => {});
      }
    }
    
    // Reset position tracking
    lastBlockPositionRef.current = { row: null, col: null };
    soundThrottleRef.current = 0;
    
    setDraggingBlock(null);
    setDragStartPosition(null);
  }, [draggingBlock, blocks, dragStartPosition]);

  // Next level handler
  const nextLevel = useCallback((targetLevel = null) => {
    if (targetLevel !== null) {
      setLevelNumber(targetLevel);
    } else {
      setLevelNumber(prev => prev + 1);
    }
    setIsWon(false);
    setMoves(0);
    setStartTime(null);
    setElapsedTime(0);
    setCurrentLevelScore(0);
  }, []);

  const [cellSize, setCellSize] = useState(CELL_SIZE);

  // Calculate responsive cell size
  useEffect(() => {
    const updateCellSize = () => {
      if (typeof window === 'undefined') return;
      
      const isMobile = window.innerWidth < 768;
      const horizontalPadding = isMobile ? 20 : 40; // Smaller padding on mobile
      const verticalPadding = isMobile ? 200 : 250; // Space for header, stats, etc.
      
      const availableWidth = window.innerWidth - horizontalPadding;
      const availableHeight = window.innerHeight - verticalPadding;
      
      // Calculate max possible size based on width and height constraints
      const maxCellWidth = availableWidth / GRID_SIZE;
      const maxCellHeight = availableHeight / GRID_SIZE;
      
      // Use the smaller of the two to ensure it fits
      let newSize = Math.min(maxCellWidth, maxCellHeight);
      
      if (isMobile) {
        // On mobile, allow it to be bigger but cap it reasonable
        newSize = Math.min(newSize, 75); 
      } else {
        // On desktop, keep the original limit
        newSize = Math.min(newSize, CELL_SIZE);
      }
      
      setCellSize(Math.floor(newSize));
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    
    return () => {
      window.removeEventListener('resize', updateCellSize);
    };
  }, []);

  const getCellSize = useCallback(() => cellSize, [cellSize]);

  // Initialize debug controls (development only)
  useEffect(() => {
    if (blocks.length > 0) {
      debugControls.init(blocks, setBlocks, {
        levelNumber,
        generateLevel,
        nextLevel,
        isWon,
        isLoading
      });
    }
    
    return () => {
      debugControls.destroy();
    };
  }, [blocks.length > 0]); // Initialize when blocks become available

  // Update debug controls when blocks change
  useEffect(() => {
    if (blocks.length > 0) {
      debugControls.updateBlocks(blocks);
      
      // Continuously validate blocks during gameplay
      debugService.validateBlocks(blocks, GRID_SIZE);
      
      // Track current game state
      debugService.trackGameState({
        levelNumber,
        blockCount: blocks.length,
        moves,
        elapsedTime,
        isWon,
        isLoading
      });
    }
  }, [blocks, levelNumber, moves, elapsedTime, isWon, isLoading]);


  return {
    blocks,
    isWon,
    moves,
    levelNumber,
    isLoading,
    elapsedTime,
    draggingBlock,
    globalScore,
    currentLevelScore,
    generateLevel,
    nextLevel,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    getCellSize,
    GRID_SIZE
  };
}
