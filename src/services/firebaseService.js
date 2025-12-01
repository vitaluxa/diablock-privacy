/**
 * Firebase Service for Dia Block Game
 * Handles anonymous authentication, cloud save, and leaderboards
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { debugService } from './debugService';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '', // Optional: for Analytics
};

class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.isInitialized = false;
    this.user = null;
    this.userName = null;
  }

  /**
   * Initialize Firebase
   */
  async initialize() {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn('Firebase not configured. Using local storage fallback.');
      return false;
    }

    try {
      this.app = initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);

      // Initialize debug service with Firebase app
      debugService.init(this.app);
      debugService.logEvent('firebase_init', { success: true });

      // Check if user is already signed in
      return new Promise((resolve) => {
        onAuthStateChanged(this.auth, async (user) => {
          if (user) {
            this.user = user;
            await this.loadUserData();
            this.isInitialized = true;
            debugService.logEvent('user_auth', { method: 'existing', userId: user.uid });
            resolve(true);
          } else {
            // Sign in anonymously
            try {
              const userCredential = await signInAnonymously(this.auth);
              this.user = userCredential.user;
              await this.createUserProfile();
              this.isInitialized = true;
              debugService.logEvent('user_auth', { method: 'anonymous', userId: userCredential.user.uid });
              resolve(true);
            } catch (error) {
              console.error('Failed to sign in anonymously:', error);
              debugService.logError('auth_failed', error);
              resolve(false);
            }
          }
        });
      });
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      debugService.logError('firebase_init_failed', error);
      return false;
    }
  }

  /**
   * Generate random username
   */
  generateRandomUsername() {
    const adjectives = ['Cool', 'Fast', 'Smart', 'Brave', 'Swift', 'Bold', 'Quick', 'Sharp', 'Wild', 'Bright', 'Clever', 'Neat', 'Calm', 'Bold', 'Wise'];
    const nouns = ['Player', 'Gamer', 'Solver', 'Master', 'Champion', 'Hero', 'Warrior', 'Ninja', 'Ace', 'Pro', 'Star', 'Elite', 'King', 'Queen', 'Legend'];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 9999) + 1;
    
    return `${adj}${noun}${number}`;
  }

  /**
   * Create user profile in Firestore
   */
  async createUserProfile() {
    if (!this.user) return;

    try {
      // Check if profile already exists
      const userDoc = await getDoc(doc(this.db, 'users', this.user.uid));
      
      if (!userDoc.exists()) {
        // Create new profile with random username
        this.userName = this.generateRandomUsername();
        
        await setDoc(doc(this.db, 'users', this.user.uid), {
          username: this.userName,
          createdAt: new Date(),
          lastPlayed: new Date(),
          level: 1,
          globalScore: 0,
        });

        // Store username in localStorage for quick access
        try {
          localStorage.setItem('firebaseUsername', this.userName);
          localStorage.setItem('firebaseUserId', this.user.uid);
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded, unable to save username');
          }
        }
      } else {
        // Load existing profile
        const data = userDoc.data();
        this.userName = data.username || this.generateRandomUsername();
        if (!data.username) {
          // Update Firestore with generated username if missing
          await setDoc(doc(this.db, 'users', this.user.uid), {
            username: this.userName,
          }, { merge: true });
        }
        try {
          localStorage.setItem('firebaseUsername', this.userName);
          localStorage.setItem('firebaseUserId', this.user.uid);
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded, unable to save username');
          }
        }
      }
    } catch (error) {
      console.error('Failed to create user profile:', error);
      // Fallback to localStorage or generate new
      const savedUsername = localStorage.getItem('firebaseUsername');
      this.userName = (savedUsername && savedUsername !== 'null') ? savedUsername : this.generateRandomUsername();
      if (this.userName && this.userName !== 'null') {
        localStorage.setItem('firebaseUsername', this.userName);
      }
    }
  }

  /**
   * Load user data from Firestore
   */
  async loadUserData() {
    if (!this.user) return;

    try {
      const userDoc = await getDoc(doc(this.db, 'users', this.user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        this.userName = data.username || this.generateRandomUsername();
        if (!data.username || data.username === 'null') {
          // Update Firestore with generated username if missing or null
          this.userName = this.generateRandomUsername();
          await setDoc(doc(this.db, 'users', this.user.uid), {
            username: this.userName,
          }, { merge: true });
        }
        try {
          localStorage.setItem('firebaseUsername', this.userName);
          localStorage.setItem('firebaseUserId', this.user.uid);
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded, unable to save username');
          }
        }
      } else {
        // Create profile if it doesn't exist
        await this.createUserProfile();
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      const savedUsername = localStorage.getItem('firebaseUsername');
      this.userName = (savedUsername && savedUsername !== 'null') ? savedUsername : this.generateRandomUsername();
      if (this.userName && this.userName !== 'null') {
        localStorage.setItem('firebaseUsername', this.userName);
      }
    }
  }

  /**
   * Save game state to Firestore
   */
  async saveGameState(gameState) {
    if (!this.user || !this.db) {
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
      await setDoc(doc(this.db, 'users', this.user.uid), {
        username: this.userName,
        lastPlayed: new Date(),
        level: gameState.levelNumber || 1,
        globalScore: gameState.globalScore || 0,
        achievements: gameState.achievements || [],
      }, { merge: true });

      // Also save to localStorage as backup
      try {
        localStorage.setItem('diaBlockGameState', JSON.stringify(gameState));
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, unable to save backup');
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save game state:', error);
      // Fallback to localStorage
      try {
        localStorage.setItem('diaBlockGameState', JSON.stringify(gameState));
        return true;
      } catch (localError) {
        if (localError.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, unable to save game state');
        }
        return false;
      }
    }
  }

  /**
   * Load game state from Firestore
   */
  async loadGameState() {
    if (!this.user || !this.db) {
      // Fallback to localStorage
      const saved = localStorage.getItem('diaBlockGameState');
      return saved ? JSON.parse(saved) : null;
    }

    try {
      const userDoc = await getDoc(doc(this.db, 'users', this.user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Validate and sanitize loaded data
        let levelNumber = data.level || 1;
        let globalScore = data.globalScore || 0;
        
        // Ensure levelNumber is valid
        if (typeof levelNumber !== 'number' || isNaN(levelNumber) || levelNumber < 1 || levelNumber > 10000) {
          levelNumber = 1;
        }
        
        // Ensure globalScore is valid
        if (typeof globalScore !== 'number' || isNaN(globalScore) || globalScore < 0) {
          globalScore = 0;
        }
        
        // Ensure achievements is an array
        const achievements = Array.isArray(data.achievements) ? data.achievements : [];
        
        const gameState = {
          levelNumber,
          globalScore,
          achievements,
        };
        
        // Also save to localStorage as backup
        try {
          localStorage.setItem('diaBlockGameState', JSON.stringify(gameState));
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded, unable to save backup');
          }
        }
        
        return gameState;
      }

      return null;
    } catch (error) {
      console.error('Failed to load game state:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('diaBlockGameState');
      return saved ? JSON.parse(saved) : null;
    }
  }

  /**
   * Submit score to leaderboard
   */
  async submitScore(score, level) {
    // Ensure username is set before submitting
    const username = this.getUsername();
    
    if (!this.user || !this.db) {
      // Fallback to localStorage
      const scores = JSON.parse(localStorage.getItem('diaBlockLeaderboard') || '[]');
      scores.push({
        username: username || 'Anonymous',
        name: username || 'Anonymous',
        score: score,
        level: level,
        timestamp: new Date(),
      });
      scores.sort((a, b) => b.score - a.score);
      try {
        localStorage.setItem('diaBlockLeaderboard', JSON.stringify(scores.slice(0, 100)));
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, unable to save score');
        }
      }
      return;
    }

    try {
      // Ensure username is saved in user profile
      if (!this.userName || this.userName === 'null' || this.userName === null) {
        await this.loadUserData(); // This will create/get username
        this.userName = this.getUsername();
      }
      
      // Add score to leaderboard collection
      await setDoc(doc(this.db, 'leaderboard', `${this.user.uid}_${Date.now()}`), {
        userId: this.user.uid,
        username: this.userName || username || 'Anonymous',
        score: score,
        level: level,
        timestamp: new Date(),
      });

      // Update user's best score
      const userDoc = await getDoc(doc(this.db, 'users', this.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (score > (userData.bestScore || 0)) {
          await setDoc(doc(this.db, 'users', this.user.uid), {
            bestScore: score,
          }, { merge: true });
        }
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
      // Fallback to localStorage
      const scores = JSON.parse(localStorage.getItem('diaBlockLeaderboard') || '[]');
      scores.push({
        username: this.userName || 'Anonymous',
        score: score,
        level: level,
        timestamp: new Date(),
      });
      scores.sort((a, b) => b.score - a.score);
      try {
        localStorage.setItem('diaBlockLeaderboard', JSON.stringify(scores.slice(0, 100)));
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, unable to save score');
        }
      }
    }
  }

  /**
   * Get leaderboard scores (deduplicated - highest score per user)
   */
  async getLeaderboardScores(limitCount = 10) {
    if (!this.db) {
      // Fallback to localStorage with deduplication
      const scores = JSON.parse(localStorage.getItem('diaBlockLeaderboard') || '[]');
      return this.deduplicateScores(scores).slice(0, limitCount);
    }

    try {
      const leaderboardRef = collection(this.db, 'leaderboard');
      // Get more scores than needed to ensure we have enough after deduplication
      const q = query(leaderboardRef, orderBy('score', 'desc'), limit(limitCount * 3));
      const querySnapshot = await getDocs(q);

      const scores = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Ensure username is always present, never null
        const username = data.username || data.name || 'Anonymous';
        if (username && username !== 'null' && username !== null) {
          scores.push({
            userId: data.userId || null,
            username: username,
            name: username, // Also include as 'name' for compatibility
            score: data.score || 0,
            level: data.level || 1,
            timestamp: data.timestamp?.toDate() || new Date(),
          });
        }
      });

      // Also get localStorage scores for fallback
      const localScores = JSON.parse(localStorage.getItem('diaBlockLeaderboard') || '[]');
      const formattedLocalScores = localScores.map(score => ({
        userId: score.userId || null,
        username: score.username || score.name || 'Anonymous',
        score: score.score || 0,
        level: score.level || 1,
        timestamp: score.timestamp ? new Date(score.timestamp) : new Date(),
      }));
      
      // Combine Firebase and localStorage scores
      const allScores = [...scores, ...formattedLocalScores];
      
      // Deduplicate - keep only highest score per user
      const deduplicated = this.deduplicateScores(allScores);
      
      return deduplicated.slice(0, limitCount);
    } catch (error) {
      console.error('Failed to get leaderboard scores:', error);
      // Fallback to localStorage with deduplication
      const scores = JSON.parse(localStorage.getItem('diaBlockLeaderboard') || '[]');
      return this.deduplicateScores(scores).slice(0, limitCount);
    }
  }

  /**
   * Deduplicate scores - keep only highest score per user
   */
  deduplicateScores(scores) {
    // Group scores by username
    const userScores = {};
    
    scores.forEach(entry => {
      const username = entry.username || entry.name || 'Anonymous';
      
      // If user doesn't exist or this score is higher, update
      if (!userScores[username] || entry.score > userScores[username].score) {
        userScores[username] = {
          userId: entry.userId || null,
          username: username,
          score: entry.score || 0,
          level: entry.level || 1,
          timestamp: entry.timestamp ? (entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp)) : new Date(),
        };
      }
    });
    
    // Convert back to array and sort by score descending
    return Object.values(userScores).sort((a, b) => b.score - a.score);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.user !== null && this.isInitialized;
  }

  /**
   * Get current username
   */
  getUsername() {
    // Check if username is set and valid
    if (this.userName && this.userName !== 'null' && this.userName !== null && this.userName !== 'undefined') {
      return this.userName;
    }
    
    // Try localStorage
    const savedUsername = localStorage.getItem('firebaseUsername');
    if (savedUsername && savedUsername !== 'null' && savedUsername !== 'undefined' && savedUsername !== null) {
      this.userName = savedUsername;
      return savedUsername;
    }
    
    // Clear invalid values from localStorage
    if (savedUsername === 'null' || savedUsername === null || savedUsername === 'undefined') {
      localStorage.removeItem('firebaseUsername');
    }
    
    // Generate a new username if none exists
    if (!this.userName || this.userName === 'null' || this.userName === null) {
      this.userName = this.generateRandomUsername();
      if (this.userName && this.userName !== 'null') {
        try {
          localStorage.setItem('firebaseUsername', this.userName);
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded, unable to save username');
          }
        }
      }
    }
    
    return this.userName || 'Player';
  }

  /**
   * Get user ID
   */
  getUserId() {
    return this.user?.uid || localStorage.getItem('firebaseUserId') || null;
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();

