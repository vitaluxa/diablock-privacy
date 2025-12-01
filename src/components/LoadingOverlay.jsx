import React from 'react';

export function LoadingOverlay({ isLoading }) {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-gray-900/98 backdrop-blur-md z-[200] flex items-center justify-center rounded-xl pointer-events-auto" style={{ minHeight: '300px' }}>
      <div className="text-center">
        {/* Animated spinner */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 border-4 border-transparent border-r-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
        {/* Loading text with animation */}
        <div className="space-y-2">
          <p className="text-xl md:text-2xl font-bold text-white animate-pulse">
            Generating Level...
          </p>
          <p className="text-sm md:text-base text-gray-400">
            Creating a challenging puzzle
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}

