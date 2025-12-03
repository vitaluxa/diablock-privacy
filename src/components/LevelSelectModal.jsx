import React from 'react';
import { X, Star, Lock } from 'lucide-react';

export function LevelSelectModal({ isOpen, onClose, currentLevel, maxLevel, levelScores, onSelectLevel }) {
  if (!isOpen) return null;

  // Generate array of levels up to max reached (or current level)
  const levels = Array.from({ length: Math.max(currentLevel, maxLevel || 1) }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Select Level</h2>
            <p className="text-gray-400 text-sm">Replay levels to improve your score</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {levels.map((level) => {
              const score = levelScores[level] || 0;
              const isCurrent = level === currentLevel;
              const isLocked = level > (maxLevel || currentLevel); // Should not happen with current logic but good for safety

              return (
                <button
                  key={level}
                  onClick={() => {
                    if (!isLocked) {
                      onSelectLevel(level);
                      onClose();
                    }
                  }}
                  disabled={isLocked}
                  className={`
                    relative group flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200
                    ${isCurrent 
                      ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                      : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600 hover:scale-105'
                    }
                  `}
                >
                  <span className={`text-2xl font-bold mb-2 ${isCurrent ? 'text-blue-400' : 'text-white'}`}>
                    {level}
                  </span>
                  
                  {score > 0 ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 text-yellow-400 mb-1">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs font-bold">Best</span>
                      </div>
                      <span className="text-sm font-mono text-gray-300">
                        {score.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <div className="h-10 flex items-center justify-center text-gray-600 text-xs">
                      No Score
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                      CURRENT
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
