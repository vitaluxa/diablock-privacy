# Dia Block - Puzzle Game

A React-based "Dia Block" puzzle game with procedural level generation. Features intelligent level validation using a BFS solver to ensure all puzzles are solvable.

## Features

- **Procedural Level Generation**: Uses built-in random algorithms to create unique puzzle levels
- **Intelligent Solver**: Client-side BFS algorithm validates solvability and automatically fixes impossible levels
- **Smooth Drag-and-Drop**: Physics-based block movement with collision detection
- **Scoring System**: Rewards speed and efficiency with a dynamic scoring system
- **Multiple Difficulties**: Easy, Medium, and Hard levels with varying complexity
- **Dark Theme UI**: Beautiful, modern interface built with Tailwind CSS
- **Responsive Design**: Works on desktop and mobile devices

## How It Works

### Level Generation
1. A procedural algorithm randomly places blocks on the board based on difficulty
2. The built-in BFS solver verifies the puzzle is solvable
3. If unsolvable, blocks are automatically removed one by one until a valid solution exists
4. Multiple generation attempts ensure varied and interesting puzzles
5. This guarantees every generated puzzle is completable

### Game Rules
- Move blocks horizontally or vertically by dragging
- The red block must reach the exit on the right side (row 2)
- Blocks cannot pass through each other
- Complete puzzles in fewer moves and less time for higher scores

## Setup

### Prerequisites
- Node.js (v16 or higher)
- No API keys required! The game uses built-in procedural generation

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

4. Click "New Game" to start playing! No API keys needed.

### Building for Production

```bash
npm run build
npm run preview
```

## Technical Details

### Core Components

- **BFS Solver** (`src/utils/solver.js`): Validates puzzle solvability using breadth-first search
- **Level Generator** (`src/services/levelGenerator.js`): Generates and validates levels using procedural algorithms
- **Game Logic Hook** (`src/hooks/useGameLogic.js`): Manages game state, drag-and-drop, and collision detection
- **Game Board** (`src/components/GameBoard.jsx`): Renders the 6x6 grid and handles user interactions
- **Block Component** (`src/components/Block.jsx`): Individual draggable blocks with touch support

### Scoring System

Score is calculated based on:
- Base score: 1000 × difficulty level
- Time penalty: -5 points per second
- Move penalty: -10 points per move

Faster completion with fewer moves yields higher scores!

## Technologies Used

- **React 18**: Modern UI framework
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Procedural Algorithm**: Built-in random level generation
- **Custom BFS Solver**: Ensures puzzle solvability

## License

MIT License - feel free to use this project for learning or building your own puzzle games!

## Notes

- **No internet connection required** - all level generation happens client-side
- All level validation happens client-side for instant feedback
- The BFS solver ensures 100% of generated levels are solvable
- Procedural generation creates unique puzzles every time

