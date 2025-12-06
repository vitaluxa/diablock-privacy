import { DebugPanel } from './components/DebugPanel';
import React, { useState, useEffect, useCallback } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameStats } from './components/GameStats';
import { WinModal } from './components/WinModal';
import { Scoreboard } from './components/Scoreboard';
import { LoadingOverlay } from './components/LoadingOverlay';
import { MainMenu } from './components/MainMenu';
import { Instructions } from './components/Instructions';
import { PromotionOverlay } from './components/PromotionOverlay';
import { TermsOverlay } from './components/TermsOverlay';
import { LevelSelectModal } from './components/LevelSelectModal'; // Added
import { SoundSettingsButton } from './components/SoundSettingsButton'; // Added
import ErrorBoundary from './components/ErrorBoundary';
import { useGameLogic } from './hooks/useGameLogic';
import { useFirebase } from './hooks/useFirebase';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import { adService } from './services/adService';
import { billingService } from './services/billingService';
import { soundEffectsService } from './services/soundEffectsService';
import {
  Settings,
  RotateCcw,
  Trophy,
  Menu,
  X,
  Volume2,
  VolumeX,
  Music,
  Music2,
  ArrowRight,
  Grid,
  Star
} from 'lucide-react'; // Added

function App() {
  const [showWinModal, setShowWinModal] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(true); // Show main menu on start
  const [showInstructions, setShowInstructions] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showPromotion, setShowPromotion] = useState(true); // Show promotion on start
  const [showTerms, setShowTerms] = useState(false); // Show terms overlay
  const [showLevelSelect, setShowLevelSelect] = useState(false); // Added
  const [soundEffectsMuted, setSoundEffectsMuted] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    isSubscribed: false,
    expirationDate: null,
    priceString: '$5.99/month',
    isPurchasing: false,
    isRestoring: false
  });

  // Initialize Firebase (anonymous authentication)
  const firebaseHook = useFirebase();

  // Initialize background music
  const musicHook = useBackgroundMusic();

  // Update subscription status UI
  const updateSubscriptionStatus = useCallback(async () => {
    try {
      const isSubscribed = billingService.hasNoAdsSubscription();
      const expirationDate = billingService.getSubscriptionExpiration();
      const priceString = billingService.getPriceString();
      
      // Try to get real price from store
      try {
        const productDetails = await billingService.getProductDetails();
        if (productDetails && productDetails.priceString) {
          setSubscriptionStatus({
            isSubscribed,
            expirationDate: expirationDate ? billingService.getFormattedExpirationDate() : null,
            priceString: productDetails.priceString,
            isPurchasing: false,
            isRestoring: false
          });
        } else {
          setSubscriptionStatus(prev => ({
            ...prev,
            isSubscribed,
            expirationDate: expirationDate ? billingService.getFormattedExpirationDate() : null,
            priceString
          }));
        }
      } catch (err) {
        // Fallback to cached price
        setSubscriptionStatus(prev => ({
          ...prev,
          isSubscribed,
          expirationDate: expirationDate ? billingService.getFormattedExpirationDate() : null,
          priceString
        }));
      }
    } catch (err) {
      console.error('Error updating subscription status:', err);
    }
  }, []);

  // Initialize Ads, Billing, and Sound Effects (with error handling)
  useEffect(() => {
    let statusCheckInterval = null;
    
    async function initializeServices() {
      // Initialize billing first to check subscription status
      try {
        await billingService.initialize();
        console.log('💰 Billing service initialized, subscription active:', billingService.hasNoAdsSubscription());
        
        // Update subscription status UI
        await updateSubscriptionStatus();
        
        // Set up periodic subscription status checks (every 5 minutes when app is active)
        // This ensures subscription expiration is detected even if app stays open
        statusCheckInterval = setInterval(async () => {
          try {
            const wasSubscribed = billingService.hasNoAdsSubscription();
            await billingService.checkSubscriptionStatus();
            const isSubscribed = billingService.hasNoAdsSubscription();
            
            if (wasSubscribed !== isSubscribed) {
              // Subscription status changed - update UI and ads
              await updateSubscriptionStatus();
              
              if (!isSubscribed) {
                // Subscription expired - re-enable ads
                try {
                  await adService.init();
                  await adService.ensureBannerVisible();
                } catch (err) {
                  console.error('Failed to re-enable ads:', err);
                }
              } else {
                // Subscription activated - remove ads
                try {
                  await adService.removeAds();
                } catch (err) {
                  console.error('Failed to remove ads:', err);
                }
              }
            }
          } catch (err) {
            console.error('Periodic subscription check error:', err);
          }
        }, 5 * 60 * 1000); // Check every 5 minutes
      } catch (err) {
        console.error('Billing service init failed:', err);
      }
      
      // Initialize ads only if user doesn't have active subscription
      try {
        if (!billingService.hasNoAdsSubscription()) {
          await adService.init();
          // Ensure banner is visible after initialization
          await adService.ensureBannerVisible();
        } else {
          console.log('🚫 Skipping ad initialization - user has active subscription');
        }
      } catch (err) {
        console.error('Ad service init failed:', err);
        // Don't crash if ads fail to initialize, but try to show banner anyway
        if (!billingService.hasNoAdsSubscription()) {
          try {
            await adService.ensureBannerVisible();
          } catch (bannerErr) {
            console.error('Failed to show banner:', bannerErr);
          }
        }
      }
      
      try {
        soundEffectsService.loadSettings();
        soundEffectsService.initializeAudioContext();
        setSoundEffectsMuted(soundEffectsService.getMuted());
      } catch (err) {
        console.error('Sound effects init error:', err);
        // Continue without sound effects
      }
    }
    
    initializeServices();
    
    // Cleanup interval on unmount
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [updateSubscriptionStatus]);

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
    levelScores,
    bestLevelScore,
    bestMoves,
    generateLevel,
    nextLevel,
    resetLevel,
    setLevel,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    getCellSize,
    GRID_SIZE,
    levelBestMoves,
    levelBestScores,
    maxReachedLevel,
    completedLevels
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
    
    // Only show ads if user doesn't have active subscription
    if (!billingService.hasNoAdsSubscription()) {
      // Call ad service to check if interstitial should be shown
      // This uses the new 5-10 level random frequency logic
      await adService.onLevelCompleted();
    }

    // Don't add +1 here because nextLevelRef.current already has the correct next level
    // from the win save logic (it was set to levelNumber + 1 when the level was won)
    nextLevel(); // Changed from generateLevel(false, levelNumber, levelNumber);
    
    // Ensure banner stays visible after level transition (only if no subscription)
    if (!billingService.hasNoAdsSubscription()) {
      await adService.ensureBannerVisible();
    }
  };

  const handleReplayLevel = () => { // Added
    setShowWinModal(false);
    resetLevel();
  };

  const handleSelectLevel = (level) => { // Added
    setLevel(level);
    setShowLevelSelect(false);
  };

  const handleStartOver = () => {
    // Restart current level (don't reset to level 1, just regenerate current level)
    setShowWinModal(false);
    generateLevel(false, levelNumber, levelNumber);
  };

  const handlePurchaseNoAds = async () => {
    // Check if already subscribed
    if (billingService.hasNoAdsSubscription()) {
      alert('You already have an active No Ads subscription!');
      return;
    }
    
    console.log('🛒 User clicked "Remove Ads" button');
    setSubscriptionStatus(prev => ({ ...prev, isPurchasing: true }));
    
    try {
      const result = await billingService.purchaseSubscription();
      console.log('🛒 Purchase result received:', result);
      
      if (result.success) {
        // Check if this was a mock purchase
        if (result.mock) {
          alert('Mock subscription activated (web/development mode). On device, this will open Google Play purchase dialog.');
        } else {
          alert('Thank you for subscribing! Ads have been removed.');
        }
        
        // Remove ads from UI immediately
        try {
          await adService.removeAds();
          console.log('✅ Ads removed from UI');
        } catch (err) {
          console.error('❌ Error removing ads:', err);
        }
        
        // Refresh subscription status from billing service (ensures sync)
        try {
          await billingService.checkSubscriptionStatus();
          console.log('✅ Subscription status verified');
        } catch (err) {
          console.error('❌ Error checking subscription status:', err);
        }
        
        // Update subscription status UI
        await updateSubscriptionStatus();
        
      } else {
        // Show error only if user didn't cancel
        if (result.error && result.error !== 'User cancelled') {
          console.error('❌ Purchase failed:', result.error);
          alert('Subscription failed: ' + result.error + '\n\nCheck console logs for details.');
        } else if (result.error === 'User cancelled') {
          console.log('ℹ️ User cancelled purchase');
          // Don't show alert for user cancellation
        }
      }
    } catch (error) {
      console.error('❌ Purchase error (outer catch):', error);
      alert('Subscription failed: ' + (error.message || 'Unknown error') + '\n\nCheck console logs for details.');
    } finally {
      setSubscriptionStatus(prev => ({ ...prev, isPurchasing: false }));
    }
  };

  const handleRestorePurchases = async () => {
    setSubscriptionStatus(prev => ({ ...prev, isRestoring: true }));
    
    try {
      const restored = await billingService.restorePurchases();
      
      if (restored) {
        // Update subscription status
        await updateSubscriptionStatus();
        
        // Update ads based on subscription status
        if (billingService.hasNoAdsSubscription()) {
          await adService.removeAds();
          alert('Purchases restored! Your subscription is active.');
        } else {
          alert('No active subscriptions found.');
        }
      } else {
        alert('No active subscriptions found to restore.');
      }
    } catch (error) {
      console.error('Restore error:', error);
      alert('Failed to restore purchases: ' + (error.message || 'Unknown error'));
    } finally {
      setSubscriptionStatus(prev => ({ ...prev, isRestoring: false }));
    }
  };

  const handleManageSubscription = async () => {
    try {
      await billingService.manageSubscriptions();
    } catch (error) {
      console.error('Manage subscription error:', error);
      alert('Failed to open subscription management: ' + (error.message || 'Unknown error'));
    }
  };

  const handleToggleSoundEffects = () => {
    const newMutedState = soundEffectsService.toggleMute();
    setSoundEffectsMuted(newMutedState);
  };

  const cellSize = getCellSize();

  // Start music and sound effects on first user interaction
  useEffect(() => {
    const handleFirstInteraction = async () => {
      // Resume sound effects audio context (critical for Android/Capacitor)
      try {
        await soundEffectsService.resumeAudioContext();
      } catch (error) {
        console.warn('Failed to resume sound effects audio context:', error);
      }
      
      // Start music if not muted
      if (musicHook && !musicHook.isPlaying && !musicHook.isMuted) {
        await musicHook.startMusicOnInteraction();
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

  // Pause music when app goes to background, resume when foreground
  // Also check subscription status when app comes to foreground
  useEffect(() => {
    let appStateListener = null;
    
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // App went to background - pause music
        if (musicHook && musicHook.isPlaying) {
          musicHook.pause();
        }
      } else {
        // App came to foreground - resume if not muted
        if (musicHook && !musicHook.isMuted && !musicHook.isPlaying) {
          musicHook.startMusicOnInteraction();
        }
        
        // Check subscription status when app comes to foreground
        try {
          const wasSubscribed = billingService.hasNoAdsSubscription();
          await billingService.checkSubscriptionStatus();
          const isSubscribed = billingService.hasNoAdsSubscription();
          
          // If subscription status changed, update ads accordingly
          if (wasSubscribed !== isSubscribed) {
            if (!isSubscribed) {
              // Subscription expired - re-enable ads
              try {
                await adService.init();
                await adService.ensureBannerVisible();
                console.log('📢 Ads re-enabled due to subscription expiration');
              } catch (err) {
                console.error('Failed to re-enable ads:', err);
              }
            } else {
              // Subscription activated - remove ads
              try {
                await adService.removeAds();
                console.log('🚫 Ads removed due to active subscription');
              } catch (err) {
                console.error('Failed to remove ads:', err);
              }
            }
          }
        } catch (err) {
          console.error('Error checking subscription status on foreground:', err);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also handle Capacitor app state changes for native platforms
    if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins) {
      const { App } = window.Capacitor.Plugins;
      if (App) {
        appStateListener = App.addListener('appStateChange', async ({ isActive }) => {
          if (!isActive) {
            // App went to background
            if (musicHook && musicHook.isPlaying) {
              musicHook.pause();
            }
          } else {
            // App came to foreground
            if (musicHook && !musicHook.isMuted && !musicHook.isPlaying) {
              musicHook.startMusicOnInteraction();
            }
            
            // Check subscription status when app comes to foreground
            try {
              const wasSubscribed = billingService.hasNoAdsSubscription();
              await billingService.checkSubscriptionStatus();
              const isSubscribed = billingService.hasNoAdsSubscription();
              
              // If subscription status changed, update ads accordingly
              if (wasSubscribed !== isSubscribed) {
                if (!isSubscribed) {
                  // Subscription expired - re-enable ads
                  try {
                    await adService.init();
                    await adService.ensureBannerVisible();
                    console.log('📢 Ads re-enabled due to subscription expiration');
                  } catch (err) {
                    console.error('Failed to re-enable ads:', err);
                  }
                } else {
                  // Subscription activated - remove ads
                  try {
                    await adService.removeAds();
                    console.log('🚫 Ads removed due to active subscription');
                  } catch (err) {
                    console.error('Failed to remove ads:', err);
                  }
                }
                // Update UI status
                await updateSubscriptionStatus();
              }
            } catch (err) {
              console.error('Error checking subscription status on foreground:', err);
            }
          }
        });
      }
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (appStateListener) {
        appStateListener.remove();
      }
    };
  }, [musicHook, updateSubscriptionStatus]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-16">
        {showPromotion && (
          <PromotionOverlay 
            onClose={() => setShowPromotion(false)} 
            onShowTerms={() => setShowTerms(true)}
          />
        )}
        {showTerms && (
          <TermsOverlay onClose={() => setShowTerms(false)} />
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
          <div className="flex justify-between items-center mb-4 md:mb-6 px-1 md:px-2">
            <div className="text-sm md:text-base">
              <span className="text-gray-400">Level </span>
              <span className="font-bold text-blue-400">{levelNumber}</span>
            </div>
            <div className="flex flex-wrap gap-1 md:gap-2 items-center">
              <button
                onClick={() => {
                  if (isLoading) return;
                  musicHook?.startMusicOnInteraction();
                  setShowMainMenu(true);
                }}
                disabled={isLoading}
                className="px-2 md:px-3 py-1.5 md:py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-xs md:text-sm font-semibold rounded-lg transition-colors"
                title="Main Menu"
              >
                ☰ Menu
              </button>
              <button
                onClick={() => {
                  if (isLoading) return;
                  setShowLevelSelect(true);
                }}
                disabled={isLoading}
                className="px-2 md:px-3 py-1.5 md:py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-xs md:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center"
                title="Select Level"
              >
                <Grid size={16} className="md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => {
                  if (isLoading) return;
                  setShowScoreboard(true);
                }}
                disabled={isLoading}
                className="px-2 md:px-3 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-xs md:text-sm font-semibold rounded-lg transition-colors"
                title="Scoreboard"
              >
                📊
              </button>
              
              {/* Subscription Buttons */}
              {subscriptionStatus.isSubscribed ? (
                <>
                  <button
                    onClick={handleManageSubscription}
                    className="px-2 md:px-3 py-1.5 md:py-2 bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm font-semibold rounded-lg transition-colors"
                    title={`No Ads Active${subscriptionStatus.expirationDate ? ` until ${subscriptionStatus.expirationDate}` : ''}`}
                  >
                    ✓ No Ads
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handlePurchaseNoAds}
                    disabled={subscriptionStatus.isPurchasing}
                    className="px-2 md:px-3 py-1.5 md:py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs md:text-sm font-semibold rounded-lg transition-colors"
                    title={`Remove Ads - ${subscriptionStatus.priceString}`}
                  >
                    {subscriptionStatus.isPurchasing ? '...' : '🚫'}
                  </button>
                  <button
                    onClick={handleRestorePurchases}
                    disabled={subscriptionStatus.isRestoring}
                    className="px-2 md:px-3 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs md:text-sm font-semibold rounded-lg transition-colors"
                    title="Restore Purchases"
                  >
                    {subscriptionStatus.isRestoring ? '...' : '↻'}
                  </button>
                </>
              )}

              {/* Combined Sound Settings Button */}
              <SoundSettingsButton
                musicHook={musicHook}
                soundEffectsMuted={soundEffectsMuted}
                onToggleSoundEffects={handleToggleSoundEffects}
              />
              
              <button
                onClick={handleStartOver}
                disabled={isLoading}
                className="px-2 md:px-3 py-1.5 md:py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-xs md:text-sm font-semibold rounded-lg transition-colors"
                title="Start Over"
              >
                🔄
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
          bestLevelScore={bestLevelScore}
          optimalMoves={levelBestMoves[levelNumber]}
          optimalScore={levelBestScores[levelNumber]}
          globalScore={globalScore}
          onNextLevel={handleNextLevel}
          onReplay={handleReplayLevel}
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

        {/* Level Select Modal */}
        <LevelSelectModal
          isOpen={showLevelSelect}
          onClose={() => setShowLevelSelect(false)}
          currentLevel={levelNumber}
          maxLevel={maxReachedLevel}
          levelScores={levelScores}
          completedLevels={completedLevels}
          onSelectLevel={handleSelectLevel}
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
