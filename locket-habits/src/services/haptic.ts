/**
 * Haptic feedback service wrapping navigator.vibrate with retro-comic patterns.
 * Gracefully no-ops on desktop where vibration API is absent.
 */

function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern);
  }
}

export const HapticService = {
  /**
   * Mechanical shutter click: sharp double-tap mimicking a camera shutter.
   * Pattern: 30ms on, 20ms off, 50ms on
   */
  shutterClick(): void {
    vibrate([30, 20, 50]);
  },

  /**
   * Checkbox complete: single strong tap on task completion.
   * Pattern: 40ms on
   */
  checkboxComplete(): void {
    vibrate([40]);
  },

  /**
   * Reaction burst: quick triple-tap for heart/fire reactions.
   * Pattern: 20ms on, 15ms off, 20ms on
   */
  reactionBurst(): void {
    vibrate([20, 15, 20]);
  },

  /**
   * Error / denied: heavy double-bump to signal rejection.
   * Pattern: 60ms on, 50ms off, 60ms on
   */
  error(): void {
    vibrate([60, 50, 60]);
  },
};
