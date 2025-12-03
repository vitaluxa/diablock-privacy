# Installation Guide - Unblock Me Game

## Prerequisites Installation

### Step 1: Install Node.js

You need Node.js (which includes npm) to run this project.

#### For Windows:

1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Download the **LTS version** (recommended for most users)
3. Run the installer (.msi file)
4. Follow the installation wizard (keep all default settings)
5. Restart your terminal/PowerShell after installation

#### Verify Installation:

Open a new terminal/PowerShell window and run:

```powershell
node --version
npm --version
```

You should see version numbers (e.g., v18.x.x and 9.x.x). If you see these, Node.js is installed correctly!

### Step 2: Install Project Dependencies

Once Node.js is installed, navigate to the project directory in your terminal:

```powershell
cd D:\Downloads\temp\testgame
```

Then install all dependencies:

```powershell
npm install
```

This will download and install:
- React 18.3.1
- Vite 5.4.10
- Tailwind CSS 3.4.15
- Google Generative AI 0.21.0
- And all other required packages

**Note**: This may take 1-3 minutes depending on your internet speed.

### Step 3: Get Your Google AI API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Copy the generated API key (it starts with "AI...")
5. Keep this key handy - you'll need it when you first launch the game

**Important**: The API key is free to use with rate limits. Don't share your key publicly.

### Step 4: Start the Game

Run the development server:

```powershell
npm run dev
```

You should see output like:

```
  VITE v5.4.10  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 5: Open in Browser

1. Open your web browser (Chrome, Firefox, or Edge recommended)
2. Go to `http://localhost:5173`
3. Enter your Google AI API key when prompted
4. Click "Start Playing"
5. Choose a difficulty and click "New Game"

## That's It!

You're now ready to play! The game will:
- Use AI to generate unique puzzles
- Validate each puzzle is solvable using BFS algorithm
- Track your time, moves, and score
- Increase difficulty as you progress

## Troubleshooting

### "npm is not recognized"
- Make sure you installed Node.js
- Restart your terminal/PowerShell after installing Node.js
- Verify installation with `node --version`

### Port 5173 is already in use
- Close any other applications using that port, or
- Vite will automatically use the next available port (5174, 5175, etc.)

### "Failed to generate level"
- Check your internet connection
- Verify your API key is correct
- The app will use fallback levels if AI generation fails

### Slow performance
- Use a modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- Close unnecessary browser tabs
- First level generation may take a few seconds

## Development Commands

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
testgame/
├── src/
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # AI level generator
│   ├── utils/           # BFS solver
│   ├── App.jsx          # Main app
│   └── main.jsx         # Entry point
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies
├── tailwind.config.js   # Tailwind configuration
├── vite.config.js       # Vite configuration
└── README.md            # Documentation
```

## Features Implemented

✅ 6×6 game board with grid display  
✅ AI-powered level generation using Google Gemini  
✅ BFS solver that validates every level is solvable  
✅ Automatic level fixing (removes blocks until solvable)  
✅ Smooth drag-and-drop with collision detection  
✅ Touch support for mobile devices  
✅ Timer tracking gameplay duration  
✅ Move counter  
✅ Dynamic scoring system (rewards speed and efficiency)  
✅ 3 difficulty levels (Easy, Medium, Hard)  
✅ Victory modal with performance stats  
✅ Dark-themed UI with Tailwind CSS  
✅ Responsive design  
✅ Local storage for API key  

## Need More Help?

- Check the README.md for game rules and how to play
- See SETUP.md for detailed technical information
- Console errors? Press F12 in your browser to see the developer console

Enjoy the game! 🎮






