/**
 * Google Play Games Services Integration
 * Handles authentication, cloud save, and leaderboards
 * Uses Google Identity Services for authentication
 */

class GooglePlayGamesService {
  constructor() {
    this.isInitialized = false;
    this.isAuthenticated = false;
    this.user = null;
    this.clientId = import.meta.env.VITE_GOOGLE_PLAY_CLIENT_ID || '';
    this.tokenClient = null;
  }

  /**
   * Initialize Google Play Games Services
   */
  async initialize() {
    if (!this.clientId) {
      console.warn('Google Play Games Client ID not configured. Using local storage fallback.');
      return false;
    }

    try {
      // Load Google Identity Services (new method)
      await this.loadGoogleIdentityServices();
      this.isInitialized = true;
      console.log('Google Identity Services initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Services:', error);
      return false;
    }
  }

  /**
   * Load Google Identity Services script
   */
  loadGoogleIdentityServices() {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: this.handleCredentialResponse.bind(this),
        });
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Handle credential response from Google Sign-In
   */
  handleCredentialResponse(response) {
    if (response.credential) {
      // Decode the JWT token
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      this.isAuthenticated = true;
      this.user = {
        getBasicProfile: () => ({
          getName: () => payload.name || 'User',
          getEmail: () => payload.email,
          getImageUrl: () => payload.picture,
          getId: () => payload.sub,
        }),
        getAuthResponse: () => ({
          access_token: response.credential,
          id_token: response.credential,
        }),
      };
    }
  }

  /**
   * Sign in to Google using OAuth2 flow
   */
  async signIn() {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Google Services not initialized');
      }
    }

    try {
      // Initialize OAuth2 token client
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/games https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        callback: async (response) => {
          if (response.access_token) {
            this.isAuthenticated = true;
            await this.getUserInfo(response.access_token);
            // Store token
            localStorage.setItem('googleAuthToken', JSON.stringify(response));
            return true;
          } else {
            throw new Error('Sign-in cancelled or failed');
          }
        },
      });

      // Request access token
      return new Promise((resolve, reject) => {
        this.tokenClient.callback = async (response) => {
          if (response.access_token) {
            this.isAuthenticated = true;
            try {
              await this.getUserInfo(response.access_token);
              localStorage.setItem('googleAuthToken', JSON.stringify(response));
              resolve(true);
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error('Sign-in cancelled or failed'));
          }
        };
        
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    } catch (error) {
      console.error('Failed to sign in:', error);
      throw error;
    }
  }

  /**
   * Get user info from access token
   */
  async getUserInfo(accessToken) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const userInfo = await response.json();
        this.user = {
          getBasicProfile: () => ({
            getName: () => userInfo.name || 'User',
            getEmail: () => userInfo.email,
            getImageUrl: () => userInfo.picture,
            getId: () => userInfo.id,
          }),
          getAuthResponse: () => ({
            access_token: accessToken,
          }),
        };
      }
    } catch (error) {
      console.error('Failed to get user info:', error);
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    this.isAuthenticated = false;
    this.user = null;
    this.tokenClient = null;
  }

  /**
   * Check if user is signed in
   */
  async checkSignInStatus() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check if we have a saved token
    const savedAuth = localStorage.getItem('googleAuthToken');
    if (savedAuth) {
      try {
        const token = JSON.parse(savedAuth);
        // Verify token is still valid and get user info
        await this.getUserInfo(token.access_token);
        this.isAuthenticated = true;
        
        // Re-initialize token client with existing token
        if (window.google && window.google.accounts) {
          this.tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: this.clientId,
            scope: 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/games https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
            callback: () => {},
          });
          // Set the token
          window.google.accounts.oauth2.setToken(token);
        }
        
        return true;
      } catch (error) {
        console.warn('Token invalid, clearing:', error);
        localStorage.removeItem('googleAuthToken');
        this.isAuthenticated = false;
        return false;
      }
    }
    return false;
  }

  /**
   * Save game state to cloud (Google Drive App Data)
   */
  async saveGameState(gameState) {
    if (!this.isAuthenticated || !this.user) {
      throw new Error('Not authenticated');
    }

    try {
      const saveData = {
        levelNumber: gameState.levelNumber,
        globalScore: gameState.globalScore,
        timestamp: Date.now(),
        achievements: gameState.achievements || [],
      };

      const accessToken = this.user.getAuthResponse().access_token;

      // Save to Google Drive App Data folder
      try {
        // Check if file exists
        const listResponse = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name=\'DiaBlockSave.json\'&fields=files(id,name)', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        const listData = await listResponse.json();
        const fileData = JSON.stringify(saveData);
        const blob = new Blob([fileData], { type: 'application/json' });

        if (listData.files && listData.files.length > 0) {
          // Update existing file
          const fileId = listData.files[0].id;
          const metadata = { name: 'DiaBlockSave.json' };
          const form = new FormData();
          form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
          form.append('file', blob);

          const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
            body: form,
          });

          if (response.ok) {
            return await response.json();
          }
        } else {
          // Create new file
          const metadata = {
            name: 'DiaBlockSave.json',
            parents: ['appDataFolder'],
          };
          const form = new FormData();
          form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
          form.append('file', blob);

          const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
            body: form,
          });

          if (response.ok) {
            return await response.json();
          }
        }
      } catch (driveError) {
        console.warn('Drive API not available, using localStorage fallback:', driveError);
      }

      // Fallback: Store in localStorage with Google user ID
      const profile = this.user.getBasicProfile();
      const userId = profile.getId();
      localStorage.setItem(`diaBlockCloudSave_${userId}`, JSON.stringify(saveData));
      localStorage.setItem('googleAuthToken', JSON.stringify({ access_token: accessToken }));
      
      return saveData;
    } catch (error) {
      console.error('Failed to save game state:', error);
      throw error;
    }
  }

  /**
   * Load game state from cloud
   */
  async loadGameState() {
    if (!this.isAuthenticated || !this.user) {
      throw new Error('Not authenticated');
    }

    try {
      const accessToken = this.user.getAuthResponse().access_token;

      // Try Drive API first
      try {
        const listResponse = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name=\'DiaBlockSave.json\'&fields=files(id,name)', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        const listData = await listResponse.json();

        if (listData.files && listData.files.length > 0) {
          const fileId = listData.files[0].id;
          const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            const saveData = await response.json();
            return saveData;
          }
        }
      } catch (driveError) {
        console.warn('Drive API not available, using localStorage fallback:', driveError);
      }

      // Fallback: Load from localStorage
      const profile = this.user.getBasicProfile();
      const userId = profile.getId();
      const savedData = localStorage.getItem(`diaBlockCloudSave_${userId}`);
      
      if (savedData) {
        return JSON.parse(savedData);
      }

      return null;
    } catch (error) {
      console.error('Failed to load game state:', error);
      throw error;
    }
  }

  /**
   * Submit score to leaderboard
   */
  async submitScore(score, leaderboardId) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      // For web apps, we'll store scores locally until packaged as Android app
      // When published as Android app, this will use Google Play Games API
      console.log('Score would be submitted to leaderboard:', score);
      
      // Store in localStorage for now
      const scores = JSON.parse(localStorage.getItem('diaBlockLeaderboard') || '[]');
      scores.push({
        score: score,
        timestamp: Date.now(),
        userId: this.user?.getBasicProfile()?.getId() || 'anonymous',
      });
      localStorage.setItem('diaBlockLeaderboard', JSON.stringify(scores));
      
      return true;
    } catch (error) {
      console.error('Failed to submit score:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard scores
   */
  async getLeaderboardScores(leaderboardId, collection = 'PUBLIC', timeSpan = 'ALL_TIME', maxResults = 10) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      // For web apps, return local leaderboard
      // When published as Android app, this will fetch from Google Play Games
      const scores = JSON.parse(localStorage.getItem('diaBlockLeaderboard') || '[]');
      return scores.sort((a, b) => b.score - a.score).slice(0, maxResults);
    } catch (error) {
      console.error('Failed to get leaderboard scores:', error);
      throw error;
    }
  }

  /**
   * Unlock achievement
   */
  async unlockAchievement(achievementId) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      // Store achievements locally for now
      const achievements = JSON.parse(localStorage.getItem('diaBlockAchievements') || '[]');
      if (!achievements.includes(achievementId)) {
        achievements.push(achievementId);
        localStorage.setItem('diaBlockAchievements', JSON.stringify(achievements));
      }
      return true;
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const googlePlayGames = new GooglePlayGamesService();
