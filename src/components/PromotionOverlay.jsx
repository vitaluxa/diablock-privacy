import React from 'react';

export function PromotionOverlay({ onClose, onShowTerms }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-1 shadow-2xl max-w-md w-full transform transition-all scale-100 hover:scale-105 border border-gold-400">
        <div className="bg-gray-900 rounded-xl p-6 text-center relative overflow-hidden">
          {/* Christmas decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-red-500 to-green-500"></div>
          
          <div className="mb-4 text-5xl">🎁</div>
          <h2 className="text-2xl font-bold text-white mb-2 font-display">
            Holiday Special!
          </h2>
          <p className="text-gray-300 mb-4">
            Reach <span className="text-yellow-400 font-bold text-xl">Level 500</span> and win a new
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold text-xl block mt-1">
              iPhone 17 Pro
            </span>
          </p>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Target Level</span>
              <span className="text-xl font-bold text-white">Level 500</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Min Score</span>
              <span className="text-xl font-bold text-yellow-400">125,193,460</span>
            </div>
          </div>

          {/* iPhone Image */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <img 
                src="/iphone-17-pro-orange.png" 
                alt="iPhone 17 Pro Desert Titanium" 
                className="w-48 h-auto rounded-2xl shadow-2xl border-4 border-gray-700 transform rotate-3 hover:rotate-0 transition-transform duration-300"
                onError={(e) => {
                  // Fallback if image fails to load - show placeholder
                  e.target.style.display = 'none';
                  const placeholder = e.target.parentElement.querySelector('.iphone-placeholder');
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
              <div className="iphone-placeholder hidden w-48 h-64 bg-gradient-to-br from-orange-800 to-orange-900 rounded-2xl shadow-2xl border-4 border-gray-700 items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">📱</div>
                  <div className="text-white font-bold text-lg">iPhone 17 Pro</div>
                  <div className="text-orange-400 text-sm">Desert Titanium</div>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold rounded-lg shadow-lg transform transition-transform active:scale-95 flex items-center justify-center gap-2 mb-3"
          >
            <span>Start Playing</span>
            <span>🎮</span>
          </button>

          <button
            onClick={onShowTerms}
            className="w-full py-2 px-4 text-blue-400 hover:text-blue-300 text-sm underline transition-colors"
          >
            View Terms & Conditions
          </button>
          
          <p className="text-xs text-gray-500 mt-2">
            *Terms and conditions apply. Limited time offer.
          </p>
        </div>
      </div>
    </div>
  );
}
