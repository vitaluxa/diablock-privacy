# Unblock Me - Project Summary

## 🎮 What Was Built

A fully functional React-based "Unblock Me" puzzle game with AI-powered level generation and intelligent solvability validation.

## ✨ Key Features Delivered

### 1. **AI-Powered Level Generation**
- Uses `@google/generative-ai` (Google Gemini) to create unique puzzle levels
- Generates different complexity levels based on difficulty (Easy, Medium, Hard)
- Intelligent prompting ensures varied and interesting puzzles

### 2. **BFS Solver with Auto-Fix** ⭐
- **Critical Feature**: Client-side Breadth-First Search algorithm validates every generated level
- If AI generates an impossible puzzle, the system automatically removes blocks one by one
- Continues until the internal solver confirms the level is solvable
- **Guarantees**: 100% of puzzles are completable - no frustration!

### 3. **6×6 Game Board**
- Professional grid layout with visual grid lines
- Red block always positioned on Row 2 (0-indexed)
- Clear exit indicator showing where the red block needs to go
- Responsive sizing for different screen sizes

### 4. **Advanced Drag-and-Drop Physics**
- Smooth dragging with mouse and touch support
- **Collision Detection**: Blocks cannot pass through each other
- Constraint-based movement:
  - Horizontal blocks only move left/right
  - Vertical blocks only move up/down
- Real-time position validation during drag
- Snap-to-grid positioning

### 5. **Timer & Scoring System**
- **Timer**: Tracks gameplay duration in MM:SS format
- **Move Counter**: Counts only actual moves (not just drag attempts)
- **Dynamic Scoring**:
  ```
  Score = Base Score - Time Penalty - Move Penalty
  
  Base Score: 1000 × difficulty level
  Time Penalty: 5 points per second
  Move Penalty: 10 points per move
  ```
- Performance ratings: Excellent, Great, Good, Complete

### 6. **Polished Dark-Themed UI**
- Built with **Tailwind CSS**
- Modern gradient backgrounds
- Smooth transitions and animations
- Color-coded blocks (red for target, various colors for obstacles)
- Responsive layout works on desktop and mobile
- Professional card-based stats display
- Victory modal with performance breakdown

## 📁 File Structure

```
testgame/
├── src/
│   ├── components/
│   │   ├── ApiKeySetup.jsx      # API key input screen
│   │   ├── Block.jsx            # Draggable block component
│   │   ├── GameBoard.jsx        # Main game grid with event handling
│   │   ├── GameStats.jsx        # Stats display panel
│   │   └── WinModal.jsx         # Victory celebration modal
│   ├── hooks/
│   │   └── useGameLogic.js      # Core game state and drag logic
│   ├── services/
│   │   └── levelGenerator.js    # AI generation + solver validation
│   ├── utils/
│   │   └── solver.js            # BFS solvability checker
│   ├── App.jsx                  # Main application component
│   ├── main.jsx                 # React entry point
│   └── index.css                # Tailwind imports
├── public/
│   └── vite.svg                 # Favicon
├── index.html                   # HTML template
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
├── .gitignore                  # Git ignore rules
├── README.md                   # Project documentation
├── SETUP.md                    # Technical setup guide
├── INSTALLATION.md             # Step-by-step installation
└── PROJECT_SUMMARY.md          # This file
```

## 🔧 Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| Vite | 5.4.10 | Build tool & dev server |
| Tailwind CSS | 3.4.15 | Styling framework |
| Google Generative AI | 0.21.0 | Level generation |
| Custom BFS Solver | - | Validation algorithm |

## 🎯 How It Works

### Level Generation Flow

```
1. User clicks "New Game" with difficulty selection
   ↓
2. AI receives detailed prompt about puzzle requirements
   ↓
3. Gemini generates block configuration (JSON)
   ↓
4. Parser validates and fixes block data
   ↓
5. BFS Solver checks if puzzle is solvable
   ↓
6. If NOT solvable:
   - Remove blocking blocks one by one
   - Re-check with solver after each removal
   - Repeat until solvable
   ↓
7. If still not solvable after max attempts:
   - Use hand-crafted fallback level
   ↓
8. Player receives guaranteed-solvable puzzle!
```

### Drag-and-Drop Flow

```
1. User starts dragging a block
   ↓
2. Store initial position for move counting
   ↓
3. During drag:
   - Calculate new grid position
   - Check collision with other blocks
   - Only update if position is valid
   ↓
4. On release:
   - Compare with initial position
   - Increment move counter if changed
   - Check win condition
```

### Win Detection

```
Red block position checked after every move:
- If red.col + red.length === 6
- Player has won!
- Show victory modal with stats
```

## 🚀 Getting Started

### Prerequisites
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Get Google AI API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
# Enter API key when prompted
# Start playing!
```

See **INSTALLATION.md** for detailed setup instructions.

## 🎮 How to Play

1. **Objective**: Move the red block to the exit on the right side
2. **Controls**: Click/touch and drag blocks to move them
3. **Constraints**: 
   - Blocks can only move in their orientation
   - Blocks cannot overlap or pass through each other
4. **Scoring**: Faster completion with fewer moves = higher score
5. **Difficulty**: Choose Easy, Medium, or Hard for different challenges

## 🏆 Scoring Guide

### Performance Ratings
- **Excellent** (⭐): 80%+ of base score retained
- **Great** (✨): 60-79% of base score
- **Good** (👍): 40-59% of base score
- **Complete** (✓): Less than 40%

### Scoring Tips
- Complete puzzles quickly to minimize time penalty
- Plan your moves to minimize move penalty
- Try harder difficulties for higher base scores

## 🔍 Technical Highlights

### BFS Solver Algorithm
```javascript
- State space: All possible block configurations
- State representation: Serialized block positions
- Search strategy: Breadth-first (finds shortest solution)
- Optimization: Early exit when red block reaches goal
- Visited tracking: Prevents infinite loops
- Time complexity: O(b^d) where b=branches, d=depth
```

### Collision Detection
```javascript
- Grid-based validation
- Checks all cells a block would occupy
- Prevents overlapping during drag
- Real-time validation (no post-move corrections)
```

### Move Validation
```javascript
- Tracks initial position on drag start
- Only counts as move if position changed
- Prevents "fake moves" from clicking without dragging
```

## 📊 Stats Tracked

| Stat | Description |
|------|-------------|
| Time | Duration from first move to completion |
| Moves | Number of successful block movements |
| Score | Calculated based on time, moves, difficulty |
| Difficulty | Current puzzle difficulty level |

## 🎨 UI/UX Features

- **Loading States**: Spinner during level generation
- **Visual Feedback**: 
  - Blocks scale and glow when dragged
  - Color-coded blocks for easy identification
  - Exit indicator shows target position
- **Responsive**: Works on desktop, tablet, and mobile
- **Accessibility**: Clear visual hierarchy and contrasts
- **Performance**: Smooth 60fps animations

## 🔐 Security

- API key stored in browser localStorage (client-side only)
- Option to change API key anytime
- No server-side storage of user data
- All processing happens in browser

## 📦 Deployment Ready

The project is ready to build and deploy:

```bash
npm run build
```

Generates optimized production build in `dist/` folder.

Deploy to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## 🐛 Error Handling

- **AI Generation Fails**: Falls back to hand-crafted levels
- **Invalid API Key**: Clear error message with link to get new key
- **Network Issues**: Graceful degradation to fallback levels
- **Unsolvable Levels**: Auto-fixed by removing blocks

## 📈 Possible Extensions

Future enhancements could include:
- Local leaderboard with best times/scores
- Hint system using solver's solution path
- Level editor for custom puzzles
- Multiplayer race mode
- Achievement system
- Sound effects and music
- More grid sizes (7×7, 8×8)
- Different block shapes

## 🎓 Learning Resources

This project demonstrates:
- React hooks and state management
- AI API integration
- Graph search algorithms (BFS)
- Drag-and-drop implementation
- Collision detection
- Game logic architecture
- Tailwind CSS styling
- Vite build tooling

## 📝 License

MIT License - Free to use, modify, and distribute.

---

**Built with ❤️ using React, Vite, Tailwind CSS, and Google AI**

Enjoy playing Unblock Me! 🎮





