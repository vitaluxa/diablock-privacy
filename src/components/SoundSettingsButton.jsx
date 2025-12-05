import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Music, Music2 } from 'lucide-react';

export function SoundSettingsButton({ musicHook, soundEffectsMuted, onToggleSoundEffects }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showDropdown]);

  const handleMusicToggle = () => {
    musicHook.toggleMute();
    // Keep dropdown open so user can toggle both
  };

  const handleSoundEffectsToggle = () => {
    onToggleSoundEffects();
    // Keep dropdown open so user can toggle both
  };

  // Determine icon based on both states
  const getMainIcon = () => {
    if (musicHook.isMuted && soundEffectsMuted) {
      return <VolumeX size={18} />;
    } else if (musicHook.isMuted || soundEffectsMuted) {
      return <Volume2 size={18} className="opacity-50" />;
    } else {
      return <Volume2 size={18} />;
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-2 md:px-3 py-1.5 md:py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs md:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center"
        title="Sound Settings"
      >
        {getMainIcon()}
      </button>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[160px]"
          style={{ marginTop: '4px' }}
        >
          <div className="py-1">
            {/* Music Option */}
            <button
              onClick={handleMusicToggle}
              className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-3 transition-colors"
            >
              <div className="flex-shrink-0">
                {musicHook.isMuted ? (
                  <Music2 size={18} className="text-gray-400" />
                ) : (
                  <Music size={18} className="text-blue-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">Music</div>
                <div className="text-gray-400 text-xs">
                  {musicHook.isMuted ? 'Muted' : 'Playing'}
                </div>
              </div>
              <div className="text-gray-500 text-xs">
                {musicHook.isMuted ? '🔇' : '🔊'}
              </div>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-700 my-1"></div>

            {/* Sound Effects Option */}
            <button
              onClick={handleSoundEffectsToggle}
              className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-3 transition-colors"
            >
              <div className="flex-shrink-0">
                {soundEffectsMuted ? (
                  <VolumeX size={18} className="text-gray-400" />
                ) : (
                  <Volume2 size={18} className="text-green-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">Sound Effects</div>
                <div className="text-gray-400 text-xs">
                  {soundEffectsMuted ? 'Muted' : 'Enabled'}
                </div>
              </div>
              <div className="text-gray-500 text-xs">
                {soundEffectsMuted ? '🔕' : '🔔'}
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

