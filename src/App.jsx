import { DebugPanel } from './components/DebugPanel';
import React, { useState, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameStats } from './components/GameStats';
import { WinModal } from './components/WinModal';
import { Scoreboard } from './components/Scoreboard';
import { LoadingOverlay } from './components/LoadingOverlay';
import { MainMenu } from './components/MainMenu';
import { Instructions } from './components/Instructions';
import { PromotionOverlay } from './components/PromotionOverlay';
import ErrorBoundary from './components/ErrorBoundary';
import { useGameLogic } from './hooks/useGameLogic';
import { useFirebase } from './hooks/useFirebase';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import { adService } from './services/adService';

function App() {
  const [showWinModal, setShowWinModal] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(true); // Show main menu on start
  const [showInstructions, setShowInstructions] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showPromotion, setShowPromotion] = useState(true); // Show promotion on start

  // Initialize Firebase (anonymous authentication)
  const firebaseHook = useFirebase();

  // Initialize background music
  const musicHook = useBackgroundMusic();

  // Initialize Ads
  useEffect(() => {
    adService.init();
  }, []);

  const {
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
  } = useGameLogic(firebaseHook);



  // Show win modal when puzzle is solved
  useEffect(() => {
    if (isWon) {
      setShowWinModal(true);
    }
  }, [isWon]);

  // Note: Next level is handled by WinModal's onNextLevel button

  const handleNextLevel = async () => {
    setShowWinModal(false);
    
    // Try to show interstitial ad before next level
    await adService.showInterstitial();

    // Don't add +1 here because nextLevelRef.current already has the correct next level
    // from the win save logic (it was set to levelNumber + 1 when the level was won)
    generateLevel(false, levelNumber, levelNumber);
  };

  const handleStartOver = () => {
    // Restart current level (don't reset to level 1, just regenerate current level)
    setShowWinModal(false);
    generateLevel(false, levelNumber, levelNumber);
  };

  const handlePurchaseNoAds = () => {
    if (window.confirm('Purchase "No Ads" version for $2.99? (Mock)')) {
      adService.purchaseNoAds();
      alert('Thank you! Ads have been removed.');
    }
  };

  const cellSize = getCellSize();

  // Start music on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (musicHook && !musicHook.isPlaying && !musicHook.isMuted) {
        musicHook.startMusicOnInteraction();
      }
    };
    
    // Add event listeners for user interaction
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [musicHook]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-16">
        {showPromotion && (
          <PromotionOverlay onClose={() => setShowPromotion(false)} />
        )}

        <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {/* Header - Mobile Optimized */}
        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Dia Block
          </h1>
          <p className="text-xs md:text-base text-gray-400">Slide • Solve • Escape</p>
        </div>

        {/* Top Bar - Mobile Friendly */}
        {!showMainMenu && (
          <div className="flex justify-between items-center mb-4 md:mb-6 px-2">
            <div className="text-sm md:text-base">
              <span className="text-gray-400">Level </span>
              <span className="font-bold text-blue-400">{levelNumber}</span>
            </div>
            <div className="flex gap-2 md:gap-4">
              <button
                onClick={() => {
                  if (isLoading) return;
                  musicHook?.startMusicOnInteraction();
                  setShowMainMenu(true);
                }}
                disabled={isLoading}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-xs md:text-sm font-semibold rounded-lg transition-colors"
                title="Main Menu"
              >
                ☰ Menu
              </button>
                <button
                  onClick={() => {
                    if (isLoading) return;
                    setShowScoreboard(true);
                  }}
                  disabled={isLoading}
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-xs md:text-sm font-semibold rounded-lg transition-colors"
                >
                  📊 Score
                </button>
                
                {/* No Ads Button */}
                <button
                  onClick={handlePurchaseNoAds}
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs md:text-sm font-semibold rounded-lg transition-colors"
                  title="Remove Ads"
                >
                  🚫 Ads
                </button>

              {/* Music Toggle Button */}
              <button
                onClick={musicHook.toggleMute}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs md:text-sm font-semibold rounded-lg transition-colors"
                title={musicHook.isMuted ? 'Unmute Music' : 'Mute Music'}
              >
                {musicHook.isMuted ? '🔇' : '🔊'}
              </button>
              <button
                onClick={handleStartOver}
                disabled={isLoading}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-xs md:text-sm font-semibold rounded-lg transition-colors"
              >
                🔄 Start Over
              </button>
            </div>
          </div>
        )}

        {/* Main game area - Mobile First */}
        {!showMainMenu && (
        <div className="flex flex-col items-center gap-4 md:gap-8 mb-4 md:mb-8">
          {/* Game board with loading overlay */}
          <div className="flex-shrink-0 w-full flex justify-center">
            <div className="relative" style={{ width: cellSize * GRID_SIZE, height: cellSize * GRID_SIZE, minHeight: '300px' }}>
              {/* Always render game board if blocks exist */}
              {blocks.length > 0 && (
                <GameBoard
                  blocks={blocks}
                  gridSize={GRID_SIZE}
                  cellSize={cellSize}
                  draggingBlock={isLoading ? null : draggingBlock}
                  onDragStart={isLoading ? () => {} : handleDragStart}
                  onDragMove={isLoading ? () => {} : handleDragMove}
                  onDragEnd={isLoading ? () => {} : handleDragEnd}
                />
              )}
              
              {/* Show loading overlay when loading (only during level generation, not when scoreboard/menu is open) */}
              {isLoading && !showScoreboard && !showMainMenu && (
                <LoadingOverlay isLoading={isLoading} />
              )}
              
              {/* Show empty state only if no blocks and not loading */}
              {blocks.length === 0 && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-xl">
                  <p className="text-gray-400 text-sm md:text-base">Click "New Game" to start</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats - Mobile Optimized */}
          <div className="w-full max-w-md">
            <GameStats
              moves={moves}
              elapsedTime={elapsedTime}
              globalScore={globalScore}
              levelNumber={levelNumber}
            />
          </div>
        </div>
        )}

        {/* Main Menu */}
        <MainMenu
          isOpen={showMainMenu}
          onStartGame={() => {
            musicHook.startMusicOnInteraction();
            setShowMainMenu(false);
            // Resume current level (false = don't start new game)
            // If blocks are empty (first load), it will generate the current levelNumber
            if (blocks.length === 0) {
              generateLevel(false);
            }
          }}
          onShowScoreboard={() => setShowScoreboard(true)}
          onShowInstructions={() => setShowInstructions(true)}
          onClose={() => setShowMainMenu(false)}
          firebaseHook={firebaseHook}
          musicHook={musicHook}
        />

        {/* Instructions */}
        <Instructions
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
        />

        {/* Win Modal */}
        <WinModal
          isOpen={showWinModal}
          moves={moves}
          elapsedTime={elapsedTime}
          levelNumber={levelNumber}
          currentLevelScore={currentLevelScore}
          globalScore={globalScore}
          onNextLevel={handleNextLevel}
          onClose={() => {
            setShowWinModal(false);
            setShowMainMenu(true);
          }}
        />

        {/* Scoreboard */}
        <Scoreboard
          globalScore={globalScore}
          currentLevelScore={currentLevelScore}
          levelNumber={levelNumber}
          isOpen={showScoreboard}
          onClose={() => setShowScoreboard(false)}
          firebaseHook={firebaseHook}
        />
        
        {/* Debug Panel (Hidden/Removed from UI but component kept for safety if needed later) */}
        {showDebugPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
             <DebugPanel onClose={() => setShowDebugPanel(false)} />
          </div>
        )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
