# Setup Guide for Unblock Me Game

## Quick Start

### Step 1: Install Dependencies

Open a terminal in this directory and run:

```bash
npm install
```

This will install all required packages including:
- React and React DOM
- Vite (build tool)
- Tailwind CSS (styling)
- Google Generative AI SDK
- And all necessary dev dependencies

### Step 2: Get Your Google AI API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

**Important**: Keep your API key secure. The app stores it locally in your browser.

### Step 3: Start the Development Server

```bash
npm run dev
```

This will start the Vite development server. You'll see output like:

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 4: Open the Game

1. Open your browser and go to `http://localhost:5173`
2. Enter your Google AI API key when prompted
3. Click "Start Playing"
4. Choose a difficulty and click "New Game"

## Game Controls

### Desktop
- **Click and drag** blocks to move them
- Blocks can only move in their orientation (horizontal blocks move left/right, vertical blocks move up/down)

### Mobile/Touch
- **Touch and drag** blocks to move them
- Same movement restrictions apply

## Scoring System

Your score is calculated based on:
- **Base Score**: 1000 × difficulty level
  - Easy: 1000 points
  - Medium: 2000 points
  - Hard: 3000 points
- **Time Penalty**: -5 points per second
- **Move Penalty**: -10 points per move

**Tip**: Solve puzzles quickly with fewer moves for higher scores!

## Difficulty Levels

### Easy (1)
- 4-6 additional blocks
- Solvable in 10-15 moves
- Great for learning the game mechanics

### Medium (2)
- 7-9 additional blocks
- Solvable in 20-30 moves
- Requires strategic thinking

### Hard (3)
- 10-12 additional blocks
- Solvable in 30-50 moves
- Challenging puzzles that test your skills

## How the AI Generation Works

1. **AI Prompt**: The app sends a detailed prompt to Google's Gemini AI describing the puzzle requirements
2. **Generate Layout**: AI creates a puzzle configuration with blocks positioned on the 6×6 grid
3. **BFS Validation**: A built-in solver uses Breadth-First Search to verify the puzzle is solvable
4. **Auto-Fix**: If the puzzle is impossible, blocks are removed one by one until it becomes solvable
5. **Play**: You receive a guaranteed-solvable puzzle to play!

This ensures every puzzle you play is completable - no frustration from impossible levels!

## Technical Architecture

```
src/
├── components/
│   ├── ApiKeySetup.jsx      # API key input screen
│   ├── Block.jsx            # Individual draggable block
│   ├── GameBoard.jsx        # Main 6×6 game grid
│   ├── GameStats.jsx        # Stats display (time, moves, score)
│   └── WinModal.jsx         # Victory screen
├── hooks/
│   └── useGameLogic.js      # Core game logic and state management
├── services/
│   └── levelGenerator.js    # AI-powered level generation
├── utils/
│   └── solver.js            # BFS solver for validation
├── App.jsx                  # Main app component
└── main.jsx                 # React entry point
```

## Troubleshooting

### "API key is invalid"
- Make sure you copied the entire API key
- Verify the key is active in Google AI Studio
- Try generating a new key if problems persist

### "Failed to generate level"
- Check your internet connection
- Ensure the API key has not exceeded its quota
- The app will use fallback levels if generation fails

### Blocks not moving smoothly
- Ensure you're running the latest version of Chrome, Firefox, or Safari
- Try refreshing the page
- Clear browser cache if issues persist

### Game is slow
- Close unnecessary browser tabs
- The first level generation may take a few seconds (AI is thinking!)
- Subsequent levels should generate faster

## Building for Production

To create a production build:

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## Environment Variables (Optional)

While the game prompts for the API key on first launch, you can also set it via environment variable:

1. Create a `.env` file in the project root
2. Add: `VITE_GOOGLE_AI_API_KEY=your_key_here`
3. Restart the dev server

**Note**: This is less secure and mainly useful for development.

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

- The BFS solver runs entirely in the browser - no server needed
- Level validation happens instantly after AI generation
- All game logic is client-side for responsive gameplay
- Touch events are optimized for mobile devices

## Need Help?

If you encounter issues:
1. Check the browser console for error messages (F12 → Console tab)
2. Verify your API key is valid
3. Make sure you're using a supported browser
4. Try a different difficulty level

Enjoy playing Unblock Me! 🎮





