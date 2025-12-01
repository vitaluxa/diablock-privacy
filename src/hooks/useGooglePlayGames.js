import { useState, useEffect, useCallback } from 'react';
import { googlePlayGames } from '../services/googlePlayGames';

export function useGooglePlayGames() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState(null);
  const [error, setError] = useState(null);

  // Initialize and check sign-in status
  useEffect(() => {
    async function checkStatus() {
      try {
        await googlePlayGames.initialize();
        const signedIn = await googlePlayGames.checkSignInStatus();
        setIsSignedIn(signedIn);
        
        if (signedIn && googlePlayGames.user) {
          const profile = googlePlayGames.user.getBasicProfile();
          setUserName(profile.getName());
        }
      } catch (err) {
        console.error('Failed to check Google Play Games status:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    checkStatus();
  }, []);

  // Sign in
  const signIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await googlePlayGames.signIn();
      setIsSignedIn(success);
      
      if (success && googlePlayGames.user) {
        const profile = googlePlayGames.user.getBasicProfile();
        setUserName(profile.getName());
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      setIsSignedIn(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await googlePlayGames.signOut();
      setIsSignedIn(false);
      setUserName(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save game state
  const saveGameState = useCallback(async (gameState) => {
    if (!isSignedIn) {
      throw new Error('Not signed in');
    }
    
    try {
      await googlePlayGames.saveGameState(gameState);
      return true;
    } catch (err) {
      console.error('Failed to save game state:', err);
      throw err;
    }
  }, [isSignedIn]);

  // Load game state
  const loadGameState = useCallback(async () => {
    if (!isSignedIn) {
      throw new Error('Not signed in');
    }
    
    try {
      const gameState = await googlePlayGames.loadGameState();
      return gameState;
    } catch (err) {
      console.error('Failed to load game state:', err);
      throw err;
    }
  }, [isSignedIn]);

  // Submit score
  const submitScore = useCallback(async (score, leaderboardId) => {
    if (!isSignedIn) {
      throw new Error('Not signed in');
    }
    
    try {
      await googlePlayGames.submitScore(score, leaderboardId);
      return true;
    } catch (err) {
      console.error('Failed to submit score:', err);
      throw err;
    }
  }, [isSignedIn]);

  // Get leaderboard
  const getLeaderboard = useCallback(async (leaderboardId, maxResults = 10) => {
    if (!isSignedIn) {
      throw new Error('Not signed in');
    }
    
    try {
      const scores = await googlePlayGames.getLeaderboardScores(leaderboardId, 'PUBLIC', 'ALL_TIME', maxResults);
      return scores;
    } catch (err) {
      console.error('Failed to get leaderboard:', err);
      throw err;
    }
  }, [isSignedIn]);

  // Unlock achievement
  const unlockAchievement = useCallback(async (achievementId) => {
    if (!isSignedIn) {
      throw new Error('Not signed in');
    }
    
    try {
      await googlePlayGames.unlockAchievement(achievementId);
      return true;
    } catch (err) {
      console.error('Failed to unlock achievement:', err);
      throw err;
    }
  }, [isSignedIn]);

  return {
    isSignedIn,
    isLoading,
    userName,
    error,
    signIn,
    signOut,
    saveGameState,
    loadGameState,
    submitScore,
    getLeaderboard,
    unlockAchievement,
  };
}





