import React from 'react';

import { RotateCcw, Star } from 'lucide-react';

export function WinModal({ isOpen, moves, elapsedTime, levelNumber, currentLevelScore, bestLevelScore, globalScore, onNextLevel, onReplay, onClose }) {
  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformance = () => {
    const baseScore = 1000 * levelNumber;
    const percentage = currentLevelScore > 0 ? (currentLevelScore / baseScore) * 100 : 0;
    
    if (percentage >= 80) return { label: 'Excellent!', emoji: '🌟', color: 'text-yellow-400' };
    if (percentage >= 60) return { label: 'Great!', emoji: '✨', color: 'text-green-400' };
    if (percentage >= 40) return { label: 'Good!', emoji: '👍', color: 'text-blue-400' };
    return { label: 'Complete!', emoji: '✓', color: 'text-gray-400' };
  };

  const performance = getPerformance();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-green-500 shadow-2xl">
        <div className="text-center mb-4 md:mb-6">
          <div className="text-5xl md:text-6xl mb-3 md:mb-4">{performance.emoji}</div>
          <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${performance.color}`}>
            {performance.label}
          </h2>
          <p className="text-gray-400 text-sm md:text-base">Level {levelNumber} Complete!</p>
        </div>

        <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
          <div className="flex justify-between items-center bg-gray-900 rounded-lg p-2 md:p-3">
            <span className="text-gray-400 text-sm md:text-base">Time</span>
            <span className="text-white font-bold font-mono text-sm md:text-base">{formatTime(elapsedTime)}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-900 rounded-lg p-2 md:p-3">
            <span className="text-gray-400 text-sm md:text-base">Moves</span>
            <span className="text-white font-bold text-sm md:text-base">{moves}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-900 rounded-lg p-2 md:p-3">
            <span className="text-gray-400 text-sm md:text-base">Level Score</span>
            <span className="text-green-400 font-bold text-lg md:text-xl">{currentLevelScore.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-900 rounded-lg p-2 md:p-3">
            <span className="text-gray-400 text-sm md:text-base flex items-center gap-1">
              <Star size={14} className="text-yellow-400" />
              Best Score
            </span>
            <span className="text-yellow-400 font-bold text-lg md:text-xl">{bestLevelScore.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-900 rounded-lg p-2 md:p-3">
            <span className="text-gray-400 text-sm md:text-base">Global Score</span>
            <span className="text-blue-400 font-bold text-lg md:text-xl">{globalScore.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={(e) => {
              e.currentTarget.disabled = true;
              onNextLevel();
            }}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold py-3 md:py-4 px-4 md:px-6 rounded-xl transition-colors text-base md:text-lg shadow-lg shadow-green-500/20"
          >
            Next Level
          </button>

          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.currentTarget.disabled = true;
                onReplay();
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg transition-colors text-sm md:text-base flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              Replay
            </button>
            <button
              onClick={(e) => {
                e.currentTarget.disabled = true;
                onClose();
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg transition-colors text-sm md:text-base"
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
