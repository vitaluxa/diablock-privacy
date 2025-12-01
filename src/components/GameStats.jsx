import React from 'react';

export function GameStats({ moves, elapsedTime, globalScore, levelNumber }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-2 gap-2 md:gap-4 w-full">
      <div className="bg-gray-800 rounded-lg p-3 md:p-4 shadow-lg border border-gray-700">
        <div className="text-gray-400 text-xs md:text-sm mb-1">Time</div>
        <div className="text-xl md:text-2xl font-bold text-white font-mono">
          {formatTime(elapsedTime)}
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-3 md:p-4 shadow-lg border border-gray-700">
        <div className="text-gray-400 text-xs md:text-sm mb-1">Moves</div>
        <div className="text-xl md:text-2xl font-bold text-white">
          {moves}
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-3 md:p-4 shadow-lg border border-gray-700">
        <div className="text-gray-400 text-xs md:text-sm mb-1">Global Score</div>
        <div className="text-xl md:text-2xl font-bold text-green-400">
          {globalScore.toLocaleString()}
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-3 md:p-4 shadow-lg border border-gray-700">
        <div className="text-gray-400 text-xs md:text-sm mb-1">Level</div>
        <div className="text-xl md:text-2xl font-bold text-blue-400">
          {levelNumber}
        </div>
      </div>
    </div>
  );
}
