import { useEffect, useState, useCallback } from 'react';
import { musicService } from '../services/musicService';

/**
 * Hook for managing background music
 */
export function useBackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.16); // Reduced by 20% from 0.2 (now 16% volume)

  // Initialize music service on mount
  useEffect(() => {
    // Load saved settings
    musicService.loadSettings();
    
    // Initialize music (you can pass a music file URL here)
    // Example: musicService.initialize('/sounds/background-music.mp3');
    musicService.initialize();
    
    // Update state from service
    setIsMuted(musicService.getMuted());
    setVolumeState(musicService.getVolume());

    // Try to start playing (may require user interaction)
    // On Android/Capacitor, audio context starts suspended, so we'll wait for user interaction
    const startMusic = async () => {
      try {
        // Check if audio context is suspended (common on Android/Capacitor)
        if (musicService.audioContext && musicService.audioContext.state === 'suspended') {
          console.log('Audio context is suspended, waiting for user interaction');
          setIsPlaying(false);
          return; // Will start on first user interaction
        }
        
        if (!musicService.getMuted()) {
          await musicService.play();
          setIsPlaying(musicService.isPlaying);
        }
      } catch (error) {
        console.log('Music will start after first user interaction:', error);
        // Music will start after first user interaction
        setIsPlaying(false);
      }
    };

    // Small delay to ensure audio is ready
    const timer = setTimeout(() => {
      startMusic();
    }, 500);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      musicService.pause();
    };
  }, []);

  // Start music when user interacts (handles browser autoplay restrictions)
  const startMusicOnInteraction = useCallback(async () => {
    console.log('startMusicOnInteraction called, isPlaying:', isPlaying, 'isMuted:', isMuted);
    if (!isMuted) {
      try {
        // Ensure audio context is resumed (required for autoplay)
        if (musicService.audioContext && musicService.audioContext.state === 'suspended') {
          await musicService.audioContext.resume();
        }
        
        // Force play even if already playing (in case it failed before)
        await musicService.play();
        
        // Update state based on actual service state
        setIsPlaying(musicService.isPlaying);
        console.log('Music play initiated, service isPlaying:', musicService.isPlaying);
      } catch (error) {
        console.error('Failed to start music:', error);
        // Don't set isPlaying to false - it might play after retry
        setIsPlaying(musicService.isPlaying);
      }
    } else {
      console.log('Music is muted, not starting');
    }
  }, [isPlaying, isMuted]);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    const muted = await musicService.toggleMute();
    setIsMuted(muted);
    // After unmuting, ensure music actually starts
    if (!muted) {
      // Music was unmuted - ensure it's playing
      try {
        // Give it a moment for the service to start
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsPlaying(musicService.isPlaying);
        // If still not playing, try to start it
        if (!musicService.isPlaying) {
          await musicService.play();
          setIsPlaying(musicService.isPlaying);
        }
      } catch (error) {
        console.error('Failed to start music after unmute:', error);
        setIsPlaying(musicService.isPlaying);
      }
    } else {
      setIsPlaying(false);
    }
  }, []);

  // Set volume
  const setVolume = useCallback((newVolume) => {
    musicService.setVolume(newVolume);
    setVolumeState(newVolume);
  }, []);

  // Play
  const play = useCallback(async () => {
    await musicService.play();
    setIsPlaying(true);
  }, []);

  // Pause
  const pause = useCallback(() => {
    musicService.pause();
    setIsPlaying(false);
  }, []);

  return {
    isPlaying,
    isMuted,
    volume,
    toggleMute,
    setVolume,
    play,
    pause,
    startMusicOnInteraction,
  };
}

