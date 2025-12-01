import React from 'react';

const SantaHat = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full absolute -top-3 -left-2 z-20 drop-shadow-lg transform -rotate-12 scale-110 pointer-events-none">
    <path d="M20,80 Q50,10 80,80" fill="#ef4444" />
    <circle cx="20" cy="80" r="12" fill="white" />
    <path d="M10,80 L90,80 Q90,95 10,95 Z" fill="white" />
  </svg>
);

export function Block({ block, cellSize, isDragging, onDragStart }) {
  const handleMouseDown = (e) => {
    e.preventDefault();
    onDragStart(block.id, e.clientX, e.clientY);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    onDragStart(block.id, touch.clientX, touch.clientY);
  };

  const width = block.isHorizontal ? block.length * cellSize : cellSize;
  const height = block.isHorizontal ? cellSize : block.length * cellSize;

  const getBlockStyle = () => {
    if (block.isRed) {
      return {
        className: 'bg-gradient-to-r from-red-600 via-red-500 to-red-700 border-red-300 shadow-red-900/50 animate-shiver',
        inner: (
          <div className="absolute inset-0 flex items-center justify-center">
            <SantaHat />
            <div className="w-full h-full opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )
      };
    }
    
    // Premium Christmas themes
    const themes = [
      // Ice/Frost
      { 
        className: 'bg-gradient-to-br from-cyan-300 via-blue-200 to-blue-400 border-white/60 text-blue-900 shadow-blue-900/20',
        icon: '❄️',
        overlay: 'bg-white/30 backdrop-blur-[1px]'
      },
      // Pine Tree
      { 
        className: 'bg-gradient-to-br from-green-700 via-green-600 to-green-800 border-green-400 text-yellow-200 shadow-green-900/30',
        icon: '🎄',
        overlay: 'bg-gradient-to-b from-white/20 to-transparent'
      },
      // Gold Ornament
      { 
        className: 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 border-yellow-200 text-red-600 shadow-yellow-900/30',
        icon: '⭐',
        overlay: 'bg-gradient-to-tr from-transparent via-white/40 to-transparent'
      },
      // Candy Cane
      { 
        className: 'bg-[repeating-linear-gradient(45deg,_#ef4444,_#ef4444_10px,_#ffffff_10px,_#ffffff_20px)] border-red-200 shadow-red-900/20',
        icon: '',
        overlay: 'bg-gradient-to-b from-white/10 to-transparent'
      },
      // Royal Gift
      { 
        className: 'bg-gradient-to-br from-purple-600 via-purple-500 to-purple-800 border-purple-300 text-white shadow-purple-900/30',
        icon: '🎁',
        overlay: 'bg-white/10'
      },
      // Reindeer/Wood
      { 
        className: 'bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 border-amber-400 text-amber-100 shadow-amber-900/30',
        icon: '🦌',
        overlay: 'bg-black/10'
      }
    ];
    
    const hash = block.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // Use random themeIndex if available, otherwise fallback to hash
    const index = block.themeIndex !== undefined ? block.themeIndex : hash;
    return themes[index % themes.length];
  };

  const style = getBlockStyle();

  return (
    <div
      data-block-id={block.id}
      className={`
        absolute rounded-xl cursor-move touch-none transition-all duration-200
        ${style.className}
        ${isDragging ? 'opacity-100 scale-105 shadow-2xl z-50 ring-4 ring-white/50' : 'shadow-lg z-10'}
        border-[3px]
        select-none
        overflow-visible
      `}
      style={{
        left: `${block.col * cellSize + 2}px`,
        top: `${block.row * cellSize + 2}px`,
        width: `${width - 4}px`,
        height: `${height - 4}px`,
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Container for internal effects that should be clipped */}
      <div className="absolute inset-0 rounded-[9px] overflow-hidden">
        {/* Snow Cap Effect */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-white/90 rounded-b-[50%] transform scale-x-110 -translate-y-1 blur-[1px]"></div>
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-white"></div>
        
        {/* Glossy Shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/10 pointer-events-none"></div>
        
        {/* Theme Overlay */}
        {style.overlay && <div className={`absolute inset-0 ${style.overlay}`}></div>}

        {/* Inner Pattern/Icon */}
        <div className="w-full h-full flex items-center justify-center relative z-10">
          {style.inner || (
            <div className={`
              ${block.isHorizontal ? 'flex-row' : 'flex-col'}
              flex gap-1 items-center justify-center
            `}>
              {style.icon && [...Array(Math.ceil(block.length))].map((_, i) => (
                <span key={i} className="text-2xl drop-shadow-md filter animate-float" style={{ animationDelay: `${i * 0.2}s` }}>
                  {style.icon}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


