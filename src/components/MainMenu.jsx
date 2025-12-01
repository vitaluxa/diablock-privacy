import React from 'react';

export function MainMenu({ isOpen, onStartGame, onShowScoreboard, onShowInstructions, onClose, firebaseHook, musicHook }) {
  // Start music on first interaction (clicking menu)
  React.useEffect(() => {
    if (isOpen && musicHook) {
      musicHook.startMusicOnInteraction();
    }
  }, [isOpen, musicHook]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-[300] flex items-center justify-center p-4 overflow-hidden">
      {/* Snowfall Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white/20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            ❄️
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-blue-500 shadow-2xl relative">
        {/* Christmas Lights Decoration */}
        <div className="absolute -top-3 left-0 right-0 flex justify-center gap-4">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full shadow-lg animate-pulse ${
                ['bg-red-500', 'bg-green-500', 'bg-yellow-400', 'bg-blue-500'][i % 4]
              }`}
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-red-500 via-green-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm">
            Dia Block
          </h1>
          <p className="text-gray-400 text-sm md:text-base flex items-center justify-center gap-2">
            <span>🎄</span> Slide • Solve • Escape <span>🎅</span>
          </p>
        </div>

        {/* User Info */}
        {firebaseHook && firebaseHook.isInitialized && (
          <div className="mb-4 md:mb-6 bg-gray-900 rounded-lg p-4 border border-blue-500/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎮</span>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">
                  {firebaseHook.userName && firebaseHook.userName !== 'null' ? firebaseHook.userName : 'Player'}
                </div>
                <div className="text-blue-400 text-xs">Progress saved to cloud ☁️</div>
              </div>
            </div>
          </div>
        )}

        {/* Music Control */}
        {musicHook && (
          <div className="mb-4 md:mb-6 flex items-center justify-between bg-gray-900 rounded-lg p-3 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <button
                onClick={musicHook.toggleMute}
                className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                title={musicHook.isMuted ? 'Unmute Music' : 'Mute Music'}
              >
                {musicHook.isMuted ? '🔇' : '🔊'}
              </button>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={musicHook.volume}
                  onChange={(e) => musicHook.setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  title={`Volume: ${Math.round(musicHook.volume * 100)}%`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Menu Options */}
        <div className="space-y-3 md:space-y-4 mb-6">
          <button
            onClick={(e) => {
              e.currentTarget.disabled = true;
              musicHook?.startMusicOnInteraction();
              onStartGame();
              onClose();
            }}
            className="w-full bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 md:py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:transform-none shadow-lg text-base md:text-lg border border-white/20"
          >
            🎮 Start Game
          </button>

          <button
            onClick={(e) => {
              e.currentTarget.disabled = true;
              onShowScoreboard();
              onClose();
            }}
            className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold py-3 md:py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:transform-none text-base md:text-lg"
          >
            📊 Scoreboard
          </button>

          <button
            onClick={(e) => {
              e.currentTarget.disabled = true;
              onShowInstructions();
              onClose();
            }}
            className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold py-3 md:py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:transform-none text-base md:text-lg"
          >
            📖 How to Play
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs md:text-sm pt-4 border-t border-gray-700">
          <p>Drag blocks to solve puzzles</p>
          <p className="mt-1 text-yellow-500 font-bold animate-pulse">Get to Level 500! 🏆 & win new iPhone 17 pro</p>
        </div>
      </div>
    </div>
  );
}

