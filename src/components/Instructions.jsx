import React from 'react';

export function Instructions({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[250] p-4">
      <div className="bg-gray-800 rounded-2xl p-6 md:p-8 max-w-lg w-full border-2 border-blue-500 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">How to Play</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Objective */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-5">
            <h3 className="text-lg md:text-xl font-bold text-blue-400 mb-2">🎯 Objective</h3>
            <p className="text-gray-300 text-sm md:text-base">
              Move the <span className="text-red-400 font-semibold">red block</span> to the exit on the right side of the board.
            </p>
          </div>

          {/* Controls */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-5">
            <h3 className="text-lg md:text-xl font-bold text-green-400 mb-2">🎮 Controls</h3>
            <ul className="space-y-2 text-gray-300 text-sm md:text-base">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong>Desktop:</strong> Click and drag blocks to move them</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong>Mobile:</strong> Touch and drag blocks to move them</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Horizontal blocks can only move left or right</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Vertical blocks can only move up or down</span>
              </li>
            </ul>
          </div>

          {/* Rules */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-5">
            <h3 className="text-lg md:text-xl font-bold text-yellow-400 mb-2">📋 Rules</h3>
            <ul className="space-y-2 text-gray-300 text-sm md:text-base">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>Blocks cannot pass through each other</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>Blocks cannot overlap</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>The red block must reach the exit on row 2</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>Complete puzzles quickly for higher scores!</span>
              </li>
            </ul>
          </div>

          {/* Scoring */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-5">
            <h3 className="text-lg md:text-xl font-bold text-purple-400 mb-2">🏆 Scoring</h3>
            <ul className="space-y-2 text-gray-300 text-sm md:text-base">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong>Base Score:</strong> 1000 × Level Number</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong>Time Penalty:</strong> -5 points per second</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong>Move Penalty:</strong> -10 points per move</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span><strong>Global Score:</strong> Cumulative across all levels</span>
              </li>
            </ul>
          </div>

          {/* Difficulty */}
          <div className="bg-gray-900 rounded-lg p-4 md:p-5">
            <h3 className="text-lg md:text-xl font-bold text-green-400 mb-2">📈 Difficulty</h3>
            <p className="text-gray-300 text-sm md:text-base">
              The game starts at medium difficulty and gets progressively harder with each level. 
              Higher levels have more blocks and require more strategic thinking!
            </p>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4 md:p-5 border border-blue-500/30">
            <h3 className="text-lg md:text-xl font-bold text-blue-300 mb-2">💡 Tips</h3>
            <ul className="space-y-2 text-gray-300 text-sm md:text-base">
              <li className="flex items-start gap-2">
                <span className="text-blue-300 mt-1">✨</span>
                <span>Plan your moves in advance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-300 mt-1">✨</span>
                <span>Move blocks out of the way to clear a path</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-300 mt-1">✨</span>
                <span>Complete levels faster for bonus points</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-300 mt-1">✨</span>
                <span>Use fewer moves to maximize your score</span>
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}





