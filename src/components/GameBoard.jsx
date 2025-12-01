import React, { useEffect, useState } from 'react';
import { Block } from './Block';

export function GameBoard({
  blocks,
  gridSize,
  cellSize,
  draggingBlock,
  onDragStart,
  onDragMove,
  onDragEnd
}) {
  // Handle mouse/touch events
  useEffect(() => {
    const handleMove = (e) => {
      if (draggingBlock) {
        e.preventDefault(); // Prevent scrolling on mobile
        if (e.type === 'mousemove') {
          onDragMove(e.clientX, e.clientY);
        } else if (e.type === 'touchmove') {
          const touch = e.touches[0];
          onDragMove(touch.clientX, touch.clientY);
        }
      }
    };

    const handleEnd = () => {
      if (draggingBlock) {
        onDragEnd();
      }
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [draggingBlock, onDragMove, onDragEnd]);

  const boardSize = cellSize * gridSize;

  return (
    <div className="flex flex-col items-center gap-2 md:gap-4 w-full h-full">
      <div
        id="game-board"
        className="relative bg-gray-800 rounded-xl shadow-2xl touch-none"
        style={{
          width: `${boardSize}px`,
          height: `${boardSize}px`,
          maxWidth: '100%',
        }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
          {[...Array(36)].map((_, i) => (
            <div
              key={i}
              className="border border-gray-700/50"
            />
          ))}
        </div>

        {/* Exit indicator */}
        <div
          className="absolute bg-green-500/30 border-2 border-green-500 border-dashed rounded"
          style={{
            right: '-4px',
            top: `${2 * cellSize}px`,
            width: '8px',
            height: `${cellSize}px`,
          }}
        >
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 font-bold text-xs whitespace-nowrap">
            EXIT →
          </div>
        </div>

        {/* Blocks */}
        {blocks.map(block => (
          <Block
            key={block.id}
            block={block}
            cellSize={cellSize}
            isDragging={draggingBlock === block.id}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
}
