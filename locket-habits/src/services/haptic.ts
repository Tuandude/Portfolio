import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Haptic feedback service wrapping @capacitor/haptics for native environments
 * with retro-comic fallback to navigator.vibrate.
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
   * Native: Medium impact; Fallback: 30ms on, 20ms off, 50ms on
   */
  shutterClick(): void {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
      return;
    }
    vibrate([30, 20, 50]);
  },

  /**
   * Checkbox complete: single strong tap on task completion.
   * Native: Success notification; Fallback: 40ms on
   */
  checkboxComplete(): void {
    if (Capacitor.isNativePlatform()) {
      Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      return;
    }
    vibrate([40]);
  },

  /**
   * Reaction burst: quick triple-tap for heart/fire reactions.
   * Native: Light impact; Fallback: 20ms on, 15ms off, 20ms on
   */
  reactionBurst(): void {
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      return;
    }
    vibrate([20, 15, 20]);
  },

  /**
   * Error / denied: heavy double-bump to signal rejection.
   * Native: Error notification; Fallback: 60ms on, 50ms off, 60ms on
   */
  error(): void {
    if (Capacitor.isNativePlatform()) {
      Haptics.notification({ type: NotificationType.Error }).catch(() => {});
      return;
    }
    vibrate([60, 50, 60]);
  },
};

