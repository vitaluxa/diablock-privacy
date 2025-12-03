/**
 * Haptics Service
 * Handles vibration feedback for mobile devices
 * Uses navigator.vibrate API
 */

class HapticsService {
  constructor() {
    this.isEnabled = true;
    this.hasSupport = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  /**
   * Trigger a light impact vibration (good for UI clicks, block grabs)
   */
  lightImpact() {
    if (!this.isEnabled || !this.hasSupport) return;
    try {
      navigator.vibrate(10); // 10ms
    } catch (e) {
      // Ignore errors
    }
  }

  /**
   * Trigger a medium impact vibration (good for block drops/moves)
   */
  mediumImpact() {
    if (!this.isEnabled || !this.hasSupport) return;
    try {
      navigator.vibrate(20); // 20ms
    } catch (e) {
      // Ignore errors
    }
  }

  /**
   * Trigger a heavy impact vibration (good for collisions/errors)
   */
  heavyImpact() {
    if (!this.isEnabled || !this.hasSupport) return;
    try {
      navigator.vibrate(40); // 40ms
    } catch (e) {
      // Ignore errors
    }
  }

  /**
   * Trigger a success vibration pattern (good for level completion)
   */
  success() {
    if (!this.isEnabled || !this.hasSupport) return;
    try {
      // Two pulses: short then long
      navigator.vibrate([30, 50, 100]);
    } catch (e) {
      // Ignore errors
    }
  }

  /**
   * Trigger a very light tick (good for sliding)
   * Note: Many devices might ignore < 5ms or merge them
   */
  tick() {
    if (!this.isEnabled || !this.hasSupport) return;
    try {
      navigator.vibrate(5);
    } catch (e) {
      // Ignore errors
    }
  }

  /**
   * Toggle haptics on/off
   */
  toggle() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }
}

export const hapticsService = new HapticsService();
