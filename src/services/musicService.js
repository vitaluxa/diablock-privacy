/**
 * Background Music Service
 * Plays beautiful 8-bit chiptune music tracks
 * 
 * To add music:
 * 1. Download free 8-bit music from:
 *    - Eric Skiff's Resistor Anthems: https://ericskiff.com/music/
 *    - Skyhammer Sound: https://skyhammersound.itch.io/8-bit-action-game-music-pack
 *    - Rodrigo Teodoro: https://teodorocomposer.itch.io/8-bit-chiptune-adventure-music-pack
 *    - Fesliyan Studios: https://soundcloud.com/video-background-music/sets/8-bit-background-music
 * 2. Place MP3/OGG files in public/music/ folder
 * 3. Add filenames to the tracks array below
 */

class MusicService {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.volume = 0.5;
    this.isMuted = false;
    this.currentTrackIndex = 0;
    this.audioContext = null; // For fallback if audio element fails
    this.fallbackNodes = null; // Store fallback oscillator nodes
    this.fallbackInterval = null; // For looping fallback music
    
    // List of music tracks - add your downloaded files here
    // Place music files in public/music/ folder
    // 
    // Free 8-bit music sources:
    // - OpenGameArt: https://opengameart.org/content/5-free-tracks-for-your-game-8-bit-style-0
    // - Eric Skiff: https://ericskiff.com/music/
    // - Ozzed.net: https://ozzed.net/music/
    // 
    // Music tracks - downloaded from OpenGameArt
    // Files are in public/music/ folder
    this.tracks = [
      '/music/adventure_quest.mp3',
      '/music/battle_song.mp3',
      '/music/bonus_level.mp3',
      '/music/main_menu.mp3',
      '/music/outro_song.mp3',
    ];
    
    // Disable procedural fallback - only play actual music tracks
    // Set to true if you want fallback music when no tracks are available
    this.useProceduralFallback = false;
  }

  /**
   * Initialize audio context for fallback generation
   */
  initializeAudioContext() {
    if (!this.audioContext) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContextClass();
        return true;
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
        return false;
      }
    }
    return true;
  }

  /**
   * Create a simple pleasant 8-bit style tone for fallback
   */
  createFallbackMusic() {
    if (!this.initializeAudioContext()) return false;
    
    try {
      // Stop any existing fallback
      this.stopFallbackMusic();
      
      // Create a simple pleasant melody using oscillators
      const osc1 = this.audioContext.createOscillator();
      const osc2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      osc1.type = 'square';
      osc2.type = 'triangle';
      
      // Pleasant chord progression: C major to A minor
      osc1.frequency.value = 523.25; // C5
      osc2.frequency.value = 659.25; // E5
      
      const masterGain = this.audioContext.createGain();
      masterGain.gain.value = this.volume * (this.isMuted ? 0 : 1);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(masterGain);
      masterGain.connect(this.audioContext.destination);
      
      gainNode.gain.value = 0.1;
      
      // Start the oscillators
      osc1.start();
      osc2.start();
      
      // Store nodes for later control
      this.fallbackNodes = { osc1, osc2, gainNode, masterGain };
      
      // Create a looping pattern by changing frequencies periodically
      let noteIndex = 0;
      const notes = [
        { f1: 523.25, f2: 659.25 }, // C-E
        { f1: 440.00, f2: 554.37 }, // A-C#
        { f1: 493.88, f2: 622.25 }, // B-D#
        { f1: 523.25, f2: 659.25 }, // C-E
      ];
      
      this.fallbackInterval = setInterval(() => {
        if (this.fallbackNodes && this.isPlaying && !this.isMuted) {
          noteIndex = (noteIndex + 1) % notes.length;
          const note = notes[noteIndex];
          this.fallbackNodes.osc1.frequency.setValueAtTime(note.f1, this.audioContext.currentTime);
          this.fallbackNodes.osc2.frequency.setValueAtTime(note.f2, this.audioContext.currentTime);
        }
      }, 2000); // Change note every 2 seconds
      
      return true;
    } catch (error) {
      console.warn('Fallback music creation failed:', error);
      return false;
    }
  }

  /**
   * Stop fallback music
   */
  stopFallbackMusic() {
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
    
    if (this.fallbackNodes) {
      try {
        if (this.fallbackNodes.osc1) {
          this.fallbackNodes.osc1.stop();
          this.fallbackNodes.osc1.disconnect();
        }
        if (this.fallbackNodes.osc2) {
          this.fallbackNodes.osc2.stop();
          this.fallbackNodes.osc2.disconnect();
        }
        if (this.fallbackNodes.gainNode) {
          this.fallbackNodes.gainNode.disconnect();
        }
        if (this.fallbackNodes.masterGain) {
          this.fallbackNodes.masterGain.disconnect();
        }
      } catch (error) {
        // Ignore errors when stopping
      }
      this.fallbackNodes = null;
    }
  }

  /**
   * Load and play a music track
   */
  async loadTrack(trackPath) {
    if (!trackPath) {
      console.warn('No track path provided');
      return false;
    }
    
    try {
      // Stop current track
      if (this.audio) {
        this.audio.pause();
        this.audio.removeEventListener('error', this.audio._errorHandler);
        this.audio.removeEventListener('canplaythrough', this.audio._canPlayHandler);
        this.audio.removeEventListener('loadeddata', this.audio._loadedHandler);
        this.audio.removeEventListener('ended', this.audio._endedHandler);
        this.audio = null;
      }
      
      // Stop fallback music
      this.stopFallbackMusic();
      
      console.log('Loading music track:', trackPath);
      
      // Create new audio element
      this.audio = new Audio(trackPath);
      this.audio.loop = true;
      this.audio.volume = this.volume * (this.isMuted ? 0 : 1);
      this.audio.preload = 'auto';
      this.audio.crossOrigin = 'anonymous'; // Allow CORS if needed
      
      // Create handler functions that can be removed later
      const errorHandler = (e) => {
        console.error('Failed to load music track:', trackPath, e);
        if (this.audio) {
          console.error('Audio error details:', this.audio.error);
          if (this.audio.error) {
            console.error('Error code:', this.audio.error.code, 'Message:', this.audio.error.message);
          }
        }
        // Try next track or fallback
        this.tryNextTrack();
      };
      
      const canPlayHandler = () => {
        console.log('Track ready to play:', trackPath);
        // Stop fallback music when real track is ready
        this.stopFallbackMusic();
        if (this.isPlaying && !this.isMuted && this.audio) {
          this.audio.play().catch(err => {
            console.log('Auto-play prevented (will need user interaction):', err.message);
          });
        }
      };
      
      const loadedHandler = () => {
        console.log('Track data loaded:', trackPath, 'readyState:', this.audio?.readyState);
        if (this.isPlaying && !this.isMuted && this.audio && this.audio.readyState >= 2) {
          this.audio.play().catch(err => {
            console.log('Play attempt failed (may need user interaction):', err.message);
          });
        }
      };
      
      const endedHandler = () => {
        if (this.isPlaying && !this.isMuted) {
          this.playNextTrack();
        }
      };
      
      // Store handlers for cleanup
      this.audio._errorHandler = errorHandler;
      this.audio._canPlayHandler = canPlayHandler;
      this.audio._loadedHandler = loadedHandler;
      this.audio._endedHandler = endedHandler;
      
      // Handle errors
      this.audio.addEventListener('error', errorHandler);
      
      // When track is ready, update state
      this.audio.addEventListener('canplaythrough', canPlayHandler);
      
      // Also try on loadeddata event
      this.audio.addEventListener('loadeddata', loadedHandler);
      
      // When track ends, play next one
      this.audio.addEventListener('ended', endedHandler);
      
      // Start loading
      this.audio.load();
      
      return true;
    } catch (error) {
      console.error('Failed to load track:', error);
      return false;
    }
  }

  /**
   * Try to play the next track
   */
  tryNextTrack() {
    if (this.tracks.length === 0) {
      // No tracks available
      if (this.useProceduralFallback && this.isPlaying) {
        this.createFallbackMusic();
      } else {
        // Stop playing if no tracks and fallback disabled
        this.stop();
      }
      return;
    }
    
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    const nextTrack = this.tracks[this.currentTrackIndex];
    this.loadTrack(nextTrack);
  }

  /**
   * Play next track in playlist
   */
  playNextTrack() {
    if (this.tracks.length === 0) return;
    
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    const nextTrack = this.tracks[this.currentTrackIndex];
    
    if (this.isPlaying) {
      this.loadTrack(nextTrack).then(() => {
        if (this.isPlaying && !this.isMuted) {
          this.audio?.play().catch(() => {});
        }
      });
    }
  }

  /**
   * Initialize background music
   */
  initialize() {
    console.log('Initializing music service. Tracks available:', this.tracks.length);
    
    // Try to load first track if available
    if (this.tracks.length > 0) {
      console.log('Loading first track:', this.tracks[0]);
      this.loadTrack(this.tracks[0]);
      return true;
    }
    
    // Otherwise, prepare for fallback
    if (this.useProceduralFallback) {
      console.log('No tracks available, using fallback music');
      this.initializeAudioContext();
    } else {
      console.log('No tracks available and fallback disabled');
    }
    
    return true;
  }

  /**
   * Start playing music
   */
  async play() {
    console.log('Play called. isPlaying:', this.isPlaying, 'tracks:', this.tracks.length, 'audio:', !!this.audio, 'muted:', this.isMuted);
    
    // Resume audio context if needed
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('Audio context resumed');
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
      }
    }
    
    if (this.isMuted) {
      console.log('Music is muted, not playing');
      return;
    }
    
    if (this.isPlaying && this.audio && !this.audio.paused) {
      console.log('Already playing');
      return;
    }
    
    this.isPlaying = true;
    
    if (this.audio) {
      // We have an audio track loaded
      console.log('Playing loaded track, readyState:', this.audio.readyState);
      try {
        // Ensure volume is set
        this.audio.volume = this.volume * (this.isMuted ? 0 : 1);
        
        // If audio is not ready, wait for it
        if (this.audio.readyState < 2) {
          console.log('Audio not ready, waiting...');
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Audio load timeout'));
            }, 5000);
            
            const onCanPlay = () => {
              clearTimeout(timeout);
              this.audio.removeEventListener('canplaythrough', onCanPlay);
              this.audio.removeEventListener('error', onError);
              resolve();
            };
            
            const onError = (e) => {
              clearTimeout(timeout);
              this.audio.removeEventListener('canplaythrough', onCanPlay);
              this.audio.removeEventListener('error', onError);
              reject(e);
            };
            
            this.audio.addEventListener('canplaythrough', onCanPlay, { once: true });
            this.audio.addEventListener('error', onError, { once: true });
          });
        }
        
        await this.audio.play();
        console.log('Track playing successfully');
      } catch (error) {
        console.log('Play failed (may require user interaction):', error.message);
        // Don't set isPlaying to false - it will play after user interaction
        // Try to load track again if it failed
        if (this.tracks.length > 0 && !this.audio.src) {
          console.log('Retrying track load...');
          await this.loadTrack(this.tracks[this.currentTrackIndex]);
        }
      }
    } else if (this.tracks.length > 0) {
      // Load first track
      console.log('Loading first track to play:', this.tracks[this.currentTrackIndex]);
      const loaded = await this.loadTrack(this.tracks[this.currentTrackIndex]);
      if (loaded && this.audio && !this.isMuted) {
        try {
          // Wait a bit for audio to be ready
          if (this.audio.readyState < 2) {
            await new Promise((resolve) => {
              const checkReady = () => {
                if (this.audio.readyState >= 2) {
                  resolve();
                } else {
                  setTimeout(checkReady, 100);
                }
              };
              checkReady();
            });
          }
          await this.audio.play();
          console.log('Track started playing');
        } catch (error) {
          console.log('Play failed after load:', error.message);
        }
      }
    } else if (this.useProceduralFallback) {
      // Use fallback music only if enabled
      console.log('Using fallback music');
      if (!this.isMuted) {
        this.createFallbackMusic();
      }
    } else {
      // No tracks and fallback disabled - stop playing
      console.log('No music tracks available. Add tracks to public/music/ and update tracks array in musicService.js');
      this.isPlaying = false;
    }
  }

  /**
   * Stop playing music
   */
  stop() {
    this.isPlaying = false;
    
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    
    this.stopFallbackMusic();
  }

  /**
   * Pause music
   */
  pause() {
    this.isPlaying = false;
    if (this.audio) {
      this.audio.pause();
    }
    this.stopFallbackMusic();
  }

  /**
   * Resume music
   */
  async resume() {
    if (!this.isPlaying && !this.isMuted) {
      await this.play();
    } else if (this.isPlaying && !this.isMuted && !this.fallbackNodes && this.tracks.length === 0 && this.useProceduralFallback) {
      // Resume fallback if it was playing but nodes were stopped
      this.createFallbackMusic();
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    if (this.audio) {
      this.audio.volume = this.volume * (this.isMuted ? 0 : 1);
    }
    
    if (this.fallbackNodes && this.fallbackNodes.masterGain) {
      this.fallbackNodes.masterGain.gain.value = this.volume * (this.isMuted ? 0 : 1);
    }
    
    try {
      localStorage.setItem('diaBlockMusicVolume', this.volume.toString());
    } catch (error) {
      // Ignore
    }
  }

  /**
   * Get current volume
   */
  getVolume() {
    return this.volume;
  }

  /**
   * Mute/unmute music
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.audio) {
      this.audio.volume = this.volume * (this.isMuted ? 0 : 1);
    }
    
    if (this.fallbackNodes && this.fallbackNodes.masterGain) {
      this.fallbackNodes.masterGain.gain.value = this.volume * (this.isMuted ? 0 : 1);
    }
    
    if (this.isMuted) {
      this.pause();
    } else {
      this.resume();
    }
    
    try {
      localStorage.setItem('diaBlockMusicMuted', this.isMuted.toString());
    } catch (error) {
      // Ignore
    }
    
    return this.isMuted;
  }

  /**
   * Check if music is muted
   */
  getMuted() {
    return this.isMuted;
  }

  /**
   * Load music settings from localStorage
   */
  loadSettings() {
    try {
      const savedVolume = localStorage.getItem('diaBlockMusicVolume');
      const savedMuted = localStorage.getItem('diaBlockMusicMuted');
      
      if (savedVolume !== null) {
        const volume = parseFloat(savedVolume);
        if (!isNaN(volume) && volume >= 0 && volume <= 1) {
          this.volume = volume;
        }
      }
      
      if (savedMuted !== null) {
        this.isMuted = savedMuted === 'true';
      }
    } catch (error) {
      // Ignore
    }
  }

  /**
   * Add a music track to the playlist
   */
  addTrack(trackPath) {
    if (!this.tracks.includes(trackPath)) {
      this.tracks.push(trackPath);
    }
  }

  /**
   * Remove a music track from the playlist
   */
  removeTrack(trackPath) {
    const index = this.tracks.indexOf(trackPath);
    if (index > -1) {
      this.tracks.splice(index, 1);
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stop();
    this.stopFallbackMusic();
    
    if (this.audio) {
      this.audio = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }
}

// Export singleton instance
export const musicService = new MusicService();