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
    // Ensure audio context is initialized first
    if (!this.audioContext) {
      this.initializeAudioContext();
    }
    
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('Sound effects audio context resumed');
      } catch (error) {
        console.warn('Failed to resume sound effects audio context:', error);
      }
    }
  }

  /**
   * Create a short 8-bit style sound
   */
  createSound(frequency, duration, type = 'square', volume = 0.1) {
    // Ensure audio context is initialized
    if (!this.audioContext) {
      this.initializeAudioContext();
    }
    
    if (!this.audioContext || !this.masterGain || this.isMuted) return null;

    try {
      // Ensure audio context is resumed (critical for Android/Capacitor)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
      
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
  /**
   * Play block slide sound - friction sound
   */
  async playBlockSlide() {
    await this.resumeAudioContext();
    
    // Lower pitch sawtooth for "grinding/sliding" feel (friction)
    const baseFreq = 100 + Math.random() * 20; // 100-120 Hz
    this.createSound(baseFreq, 0.05, 'sawtooth', 0.0845); // Increased by 30% from 0.065 (0.065 * 1.3 = 0.0845)
  }

  /**
   * Play block move sound - "thud/click" when settling
   */
  async playBlockMove() {
    await this.resumeAudioContext();
    
    // "Thud" sound - low frequency square/triangle for impact
    const freq1 = 80 + Math.random() * 10; 
    this.createSound(freq1, 0.08, 'square', 0.169); // Increased by 30% from 0.13 (0.13 * 1.3 = 0.169)
    
    // Subtle high click for definition (snap into place)
    setTimeout(() => {
       this.createSound(400, 0.03, 'triangle', 0.0845); // Increased by 30% from 0.065 (0.065 * 1.3 = 0.0845)
    }, 5);
  }

  /**
   * Play block click sound - when block is grabbed
   */
  async playBlockClick() {
    await this.resumeAudioContext();
    
    // Short, crisp click
    const freq = 600 + Math.random() * 50;
    this.createSound(freq, 0.03, 'triangle', 0.05);
  }

  /**
   * Play level win sound - fanfare
   */
  async playLevelWin() {
    await this.resumeAudioContext();
    
    // Bright, ascending major arpeggio (C Major)
    const notes = [
      523.25, // C5
      659.25, // E5
      783.99, // G5
      1046.50 // C6
    ];
    
    // Play arpeggio
    notes.forEach((freq, index) => {
      setTimeout(() => {
        // Layer square and triangle for a retro-console coin/win sound
        this.createSound(freq, 0.15, 'square', 0.08);
        this.createSound(freq, 0.2, 'triangle', 0.08); 
      }, index * 80);
    });
    
    // Final flourish/chord
    setTimeout(() => {
       this.createSound(523.25, 0.4, 'sawtooth', 0.05); // Root
       this.createSound(1046.50, 0.4, 'square', 0.05); // Octave
    }, 350);
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




