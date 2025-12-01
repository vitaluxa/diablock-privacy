/**
 * Sound Effects Service
 * Generates 8-bit style sound effects for game actions
 */

class SoundEffectsService {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.volume = 0.3; // Default volume for sound effects (lower than music)
    this.isMuted = false;
  }

  /**
   * Initialize audio context
   */
  initializeAudioContext() {
    if (!this.audioContext) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContextClass();
        
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = this.volume * (this.isMuted ? 0 : 1);
        
        return true;
      } catch (error) {
        console.error('Failed to initialize sound effects audio context:', error);
        return false;
      }
    }
    return true;
  }

  /**
   * Resume audio context if suspended
   */
  async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        // Ignore - may require user interaction
      }
    }
  }

  /**
   * Create a short 8-bit style sound
   */
  createSound(frequency, duration, type = 'square', volume = 0.1) {
    if (!this.audioContext || !this.masterGain || this.isMuted) return null;

    try {
      this.initializeAudioContext();
      
      const osc = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      osc.type = type;
      osc.frequency.value = frequency;
      
      // Quick attack, quick release for 8-bit feel
      const now = this.audioContext.currentTime;
      const attackTime = 0.01;
      const releaseTime = 0.05;
      const actualDuration = Math.max(duration, releaseTime + 0.01);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + attackTime);
      gainNode.gain.setValueAtTime(volume, now + actualDuration - releaseTime);
      gainNode.gain.linearRampToValueAtTime(0, now + actualDuration);
      
      osc.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      osc.start(now);
      osc.stop(now + actualDuration);
      
      return { oscillator: osc, gainNode: gainNode };
    } catch (error) {
      console.warn('Failed to create sound:', error);
      return null;
    }
  }

  /**
   * Play block slide sound - subtle sliding/click sound
   */
  async playBlockSlide() {
    await this.resumeAudioContext();
    
    // Create a gentle slide sound with two tones
    // Lower tone for the "whoosh" effect
    const baseFreq = 200 + Math.random() * 50; // 200-250 Hz
    this.createSound(baseFreq, 0.08, 'sawtooth', 0.08);
    
    // Higher tone for the "click" effect
    setTimeout(() => {
      const clickFreq = 600 + Math.random() * 100; // 600-700 Hz
      this.createSound(clickFreq, 0.05, 'square', 0.06);
    }, 20);
  }

  /**
   * Play block move sound - when block successfully moves to new position
   */
  async playBlockMove() {
    await this.resumeAudioContext();
    
    // Play a subtle two-tone chime
    const freq1 = 400 + Math.random() * 30; // 400-430 Hz
    const freq2 = 600 + Math.random() * 40; // 600-640 Hz
    
    // First tone
    this.createSound(freq1, 0.1, 'square', 0.09);
    
    // Second tone slightly after (harmonious interval)
    setTimeout(() => {
      this.createSound(freq2, 0.08, 'triangle', 0.07);
    }, 30);
  }

  /**
   * Play block click sound - when block is grabbed
   */
  async playBlockClick() {
    await this.resumeAudioContext();
    
    // Very subtle click/pickup sound
    const freq = 350 + Math.random() * 50; // 350-400 Hz
    this.createSound(freq, 0.04, 'square', 0.05);
  }

  /**
   * Play invalid move sound - when block can't move
   */
  async playInvalidMove() {
    await this.resumeAudioContext();
    
    // Lower, slightly dissonant sound
    const freq = 150 + Math.random() * 20; // 150-170 Hz
    this.createSound(freq, 0.1, 'sawtooth', 0.07);
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume * (this.isMuted ? 0 : 1);
    }
    
    try {
      localStorage.setItem('diaBlockSoundEffectsVolume', this.volume.toString());
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
   * Mute/unmute sound effects
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume * (this.isMuted ? 0 : 1);
    }
    
    try {
      localStorage.setItem('diaBlockSoundEffectsMuted', this.isMuted.toString());
    } catch (error) {
      // Ignore
    }
    
    return this.isMuted;
  }

  /**
   * Check if muted
   */
  getMuted() {
    return this.isMuted;
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      const savedVolume = localStorage.getItem('diaBlockSoundEffectsVolume');
      const savedMuted = localStorage.getItem('diaBlockSoundEffectsMuted');
      
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
}

// Export singleton instance
export const soundEffectsService = new SoundEffectsService();



