import React from 'react';

export function PromotionOverlay({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-1 shadow-2xl max-w-sm w-full transform transition-all scale-100 hover:scale-105 border border-gold-400">
        <div className="bg-gray-900 rounded-xl p-6 text-center relative overflow-hidden">
          {/* Christmas decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-red-500 to-green-500"></div>
          
          <div className="mb-4 text-5xl">🎁</div>
          <h2 className="text-2xl font-bold text-white mb-2 font-display">
            Holiday Special!
          </h2>
          <p className="text-gray-300 mb-6">
            Reach <span className="text-yellow-400 font-bold text-xl">Level 500</span> and win a new
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold text-xl block mt-1">
              iPhone 17 Pro
            </span>
          </p>
          
          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold rounded-lg shadow-lg transform transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Start Playing</span>
            <span>🎮</span>
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            *Terms and conditions apply. Limited time offer.
          </p>
        </div>
      </div>
    </div>
  );
}
