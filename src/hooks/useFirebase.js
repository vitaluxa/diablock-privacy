import { useState, useEffect, useCallback, useMemo } from 'react';
import { firebaseService } from '../services/firebaseService';

export function useFirebase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState(null);
  const [error, setError] = useState(null);

  // Initialize Firebase
  useEffect(() => {
    async function initialize() {
      setIsLoading(true);
      setError(null);
      
      try {
        const success = await firebaseService.initialize();
        console.log('🔥 Firebase initialization result:', success);
        setIsInitialized(success);
        
        if (success) {
          // Get username immediately and with retries
          const updateUsername = () => {
            const username = firebaseService.getUsername();
            if (username && username !== 'null' && username !== 'null' && username !== null) {
              setUserName(username);
              return true;
            }
            return false;
          };
          
          // Try multiple times to get username
          updateUsername(); // Immediate
          setTimeout(updateUsername, 200); // After 200ms
          setTimeout(updateUsername, 500); // After 500ms
          setTimeout(updateUsername, 1000); // After 1s
          
          // Final fallback
          setTimeout(() => {
            const currentUsername = firebaseService.getUsername();
            if (currentUsername && currentUsername !== 'null' && currentUsername !== 'null' && currentUsername !== null) {
              setUserName(currentUsername);
            } else {
              // Clear any null values from localStorage
              const savedUsername = localStorage.getItem('firebaseUsername');
              if (savedUsername === 'null' || savedUsername === null) {
                localStorage.removeItem('firebaseUsername');
              }
              const newUsername = firebaseService.getUsername(); // This will generate one if needed
              setUserName(newUsername || 'Player');
            }
          }, 1500);
        }
      } catch (err) {
        console.error('Failed to initialize Firebase:', err);
        setError(err.message);
        setIsInitialized(false);
        // Fallback username even if Firebase fails
        const savedUsername = localStorage.getItem('firebaseUsername');
        setUserName(savedUsername || 'Player');
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  // Watch for username updates
  useEffect(() => {
    if (isInitialized && (!userName || userName === 'null')) {
      const checkUsername = setInterval(() => {
        const username = firebaseService.getUsername();
        if (username && username !== 'null' && username !== 'null' && username !== null) {
          setUserName(username);
          clearInterval(checkUsername);
        }
      }, 500);
      
      // Stop checking after 5 seconds
      setTimeout(() => clearInterval(checkUsername), 5000);
      
      return () => clearInterval(checkUsername);
    }
  }, [isInitialized, userName]);

  // Save game state
  const saveGameState = useCallback(async (gameState) => {
    // Validate gameState before saving
    if (!gameState || typeof gameState !== 'object') {
      console.error('Invalid game state:', gameState);
      return false;
    }

    if (!isInitialized || !firebaseService.isAuthenticated()) {
      // Fallback to localStorage
      try {
        localStorage.setItem('diaBlockGameState', JSON.stringify(gameState));
        return true;
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, unable to save game state');
        }
        return false;
      }
    }

    try {
      console.log('🔥 Calling firebaseService.saveGameState...', gameState);
      await firebaseService.saveGameState(gameState);
      return true;
    } catch (err) {
      console.error('Failed to save game state:', err);
      // Fallback to localStorage
      try {
        localStorage.setItem('diaBlockGameState', JSON.stringify(gameState));
        return true;
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, unable to save game state');
        }
        return false;
      }
    }
  }, [isInitialized]);

  // Load game state
  const loadGameState = useCallback(async () => {
    if (!isInitialized || !firebaseService.isAuthenticated()) {
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('diaBlockGameState');
        return saved ? JSON.parse(saved) : null;
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return null;
      }
    }

    try {
      const gameState = await firebaseService.loadGameState();
      // Validate loaded game state
      if (gameState && typeof gameState === 'object') {
        return gameState;
      }
      return null;
    } catch (err) {
      console.error('Failed to load game state:', err);
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('diaBlockGameState');
        return saved ? JSON.parse(saved) : null;
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return null;
      }
    }
  }, [isInitialized]);

  // Submit score
  const submitScore = useCallback(async (score, level) => {
    // Validate score and level
    if (typeof score !== 'number' || score < 0 || isNaN(score)) {
      console.error('Invalid score:', score);
      return false;
    }
    if (typeof level !== 'number' || level < 1 || isNaN(level)) {
      console.error('Invalid level:', level);
      return false;
    }

    if (!isInitialized || !firebaseService.isAuthenticated()) {
      // Fallback: save to localStorage
      try {
        const scores = JSON.parse(localStorage.getItem('diaBlockLeaderboard') || '[]');
        scores.push({
          username: userName || 'Anonymous',
          name: userName || 'Anonymous',
          score: score,
          level: level,
          timestamp: new Date(),
        });
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem('diaBlockLeaderboard', JSON.stringify(scores.slice(0, 100)));
        return true;
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, unable to save score');
        }
        return false;
      }
    }

    try {
      await firebaseService.submitScore(score, level);
      return true;
    } catch (err) {
      console.error('Failed to submit score:', err);
      // Fallback: save to localStorage
      try {
        const scores = JSON.parse(localStorage.getItem('diaBlockLeaderboard') || '[]');
        scores.push({
          username: userName || 'Anonymous',
          name: userName || 'Anonymous',
          score: score,
          level: level,
          timestamp: new Date(),
        });
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem('diaBlockLeaderboard', JSON.stringify(scores.slice(0, 100)));
        return true;
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, unable to save score');
        }
        return false;
      }
    }
  }, [isInitialized, userName]);

  // Get leaderboard
  const getLeaderboard = useCallback(async (limit = 10) => {
    try {
      const scores = await firebaseService.getLeaderboardScores(limit);
      return scores;
    } catch (err) {
      console.error('Failed to get leaderboard:', err);
      return [];
    }
  }, []);

  return useMemo(() => ({
    isInitialized,
    isLoading,
    userName,
    error,
    saveGameState,
    loadGameState,
    submitScore,
    getLeaderboard,
    isAuthenticated: firebaseService.isAuthenticated(),
  }), [isInitialized, isLoading, userName, error, saveGameState, loadGameState, submitScore, getLeaderboard]);
}

