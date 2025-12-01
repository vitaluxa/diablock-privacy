import React, { useState, useEffect } from 'react';

export function Scoreboard({ globalScore, currentLevelScore, levelNumber, isOpen, onClose, firebaseHook }) {
  const [highScores, setHighScores] = useState([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);

  useEffect(() => {
    async function loadScores() {
      setIsLoadingScores(true);
      
      // Initialize test users if leaderboard is empty
      const initializeTestUsers = () => {
        const testUsers = [
          { name: 'MasterPlayer', score: 15000, level: 8 },
          { name: 'SwiftSolver', score: 12500, level: 6 },
          { name: 'PuzzlePro', score: 9800, level: 5 },
          { name: 'BlockBuster', score: 7600, level: 4 },
          { name: 'QuickMind', score: 5400, level: 3 },
          { name: 'SmartMove', score: 3200, level: 2 },
          { name: 'NewPlayer', score: 2100, level: 2 },
        ];
        
        const existingScores = JSON.parse(localStorage.getItem('diaBlockHighScores') || '[]');
        const existingLeaderboard = JSON.parse(localStorage.getItem('diaBlockLeaderboard') || '[]');
        
        // Only add test users if leaderboard is empty or has very few entries
        if (existingScores.length < 3 && existingLeaderboard.length < 3) {
          const formattedTestUsers = testUsers.map(user => ({
            username: user.name,
            name: user.name,
            score: user.score,
            level: user.level,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date in last week
            date: new Date().toISOString(),
          }));
          
          // Add to both localStorage locations for compatibility
          try {
            localStorage.setItem('diaBlockHighScores', JSON.stringify([...existingScores, ...formattedTestUsers]));
            localStorage.setItem('diaBlockLeaderboard', JSON.stringify([...existingLeaderboard, ...formattedTestUsers]));
          } catch (error) {
            if (error.name === 'QuotaExceededError') {
              console.warn('localStorage quota exceeded, unable to save test users');
            }
          }
        }
      };
      
      // Try to load from Firebase first
      if (firebaseHook && firebaseHook.isInitialized) {
        try {
          const leaderboardScores = await firebaseHook.getLeaderboard(10);
          if (leaderboardScores && leaderboardScores.length > 0) {
            const formattedScores = leaderboardScores.map((entry) => ({
              name: entry.username || entry.name || 'Anonymous',
              score: entry.score || 0,
              level: entry.level || 1,
              date: entry.timestamp ? (entry.timestamp instanceof Date ? entry.timestamp.toISOString() : new Date(entry.timestamp).toISOString()) : new Date().toISOString()
            }));
            setHighScores(formattedScores.sort((a, b) => b.score - a.score));
            setIsLoadingScores(false);
            return;
          }
        } catch (error) {
          console.error('Failed to load leaderboard scores:', error);
        }
      }

      // Initialize test users if needed (only once)
      initializeTestUsers();

      // Fallback to localStorage with validation
      let scores = [];
      let leaderboardScores = [];
      
      try {
        const scoresStr = localStorage.getItem('diaBlockHighScores');
        if (scoresStr) {
          const parsed = JSON.parse(scoresStr);
          if (Array.isArray(parsed)) {
            scores = parsed;
          }
        }
      } catch (error) {
        console.error('Failed to parse diaBlockHighScores:', error);
      }
      
      try {
        const leaderboardStr = localStorage.getItem('diaBlockLeaderboard');
        if (leaderboardStr) {
          const parsed = JSON.parse(leaderboardStr);
          if (Array.isArray(parsed)) {
            leaderboardScores = parsed;
          }
        }
      } catch (error) {
        console.error('Failed to parse diaBlockLeaderboard:', error);
      }
      
      // Combine both sources and deduplicate
      const allScores = [...scores, ...leaderboardScores.map(entry => ({
        name: entry.username || entry.name || 'Anonymous',
        score: entry.score || 0,
        level: entry.level || 1,
        date: entry.timestamp ? (entry.timestamp instanceof Date ? entry.timestamp.toISOString() : new Date(entry.timestamp).toISOString()) : new Date().toISOString()
      }))];
      
      // Deduplicate by username, keeping highest score
      const userScores = {};
      allScores.forEach(entry => {
        const name = entry.name || 'Anonymous';
        if (!userScores[name] || entry.score > userScores[name].score) {
          userScores[name] = entry;
        }
      });
      
      const deduplicated = Object.values(userScores).sort((a, b) => b.score - a.score).slice(0, 10);
      setHighScores(deduplicated);
      setIsLoadingScores(false);
    }

    if (isOpen) {
      loadScores();
    }
  }, [globalScore, isOpen, firebaseHook]);

  const saveScore = async () => {
    // If Firebase is initialized, score is automatically submitted with username
    if (firebaseHook && firebaseHook.isInitialized) {
      try {
        // Submit score - this will use the current username from Firebase
        await firebaseHook.submitScore(globalScore, levelNumber);
        // Reload scores
        const leaderboardScores = await firebaseHook.getLeaderboard(10);
        if (leaderboardScores && leaderboardScores.length > 0) {
          const formattedScores = leaderboardScores.map((entry) => ({
            name: entry.username || entry.name || 'Anonymous',
            score: entry.score || 0,
            level: entry.level || 1,
            date: entry.timestamp ? (entry.timestamp instanceof Date ? entry.timestamp.toISOString() : new Date(entry.timestamp).toISOString()) : new Date().toISOString()
          }));
          setHighScores(formattedScores.sort((a, b) => b.score - a.score));
        }
        return;
      } catch (error) {
        console.error('Failed to submit score to Firebase:', error);
        // Fall through to localStorage
      }
    }

    // Fallback to localStorage
    const name = prompt('Enter your name for the leaderboard:') || 'Anonymous';
    if (name.trim()) {
      try {
        const scoresStr = localStorage.getItem('diaBlockHighScores') || '[]';
        const scores = Array.isArray(JSON.parse(scoresStr)) ? JSON.parse(scoresStr) : [];
        
        // Validate score and level before adding
        if (typeof globalScore === 'number' && !isNaN(globalScore) && globalScore >= 0 &&
            typeof levelNumber === 'number' && !isNaN(levelNumber) && levelNumber >= 1) {
          scores.push({
            name: name.trim(),
            score: globalScore,
            level: levelNumber,
            date: new Date().toISOString()
          });
          const sorted = scores.sort((a, b) => b.score - a.score).slice(0, 10);
          
          try {
            localStorage.setItem('diaBlockHighScores', JSON.stringify(sorted));
            setHighScores(sorted);
          } catch (error) {
            if (error.name === 'QuotaExceededError') {
              console.warn('localStorage quota exceeded, unable to save score');
            }
          }
        }
      } catch (error) {
        console.error('Failed to save score to localStorage:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border-2 border-blue-500 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Scoreboard</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Global Score</div>
            <div className="text-3xl font-bold text-green-400">{globalScore.toLocaleString()}</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Current Level</div>
            <div className="text-xl font-bold text-yellow-400">Level {levelNumber}</div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-2">
            {firebaseHook && firebaseHook.isInitialized ? '🏆 Global Leaderboard' : '📊 Top Scores'}
          </h3>
          {isLoadingScores ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Loading scores...</p>
            </div>
          ) : highScores.length === 0 ? (
            <p className="text-gray-400 text-sm">No high scores yet. Be the first!</p>
          ) : (
            <div className="space-y-2">
              {highScores.map((entry, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-900 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{entry.name}</div>
                      <div className="text-gray-400 text-xs">Level {entry.level}</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-bold">{entry.score.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

