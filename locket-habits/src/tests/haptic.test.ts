import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HapticService } from '../services/haptic';

describe('HapticService', () => {
  beforeEach(() => {
    // Provide a mock vibrate function so tests are deterministic in jsdom
    vi.stubGlobal('navigator', { vibrate: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shutterClick calls vibrate with the expected pattern', () => {
    HapticService.shutterClick();
    expect(navigator.vibrate).toHaveBeenCalledWith([30, 20, 50]);
  });

  it('checkboxComplete calls vibrate with a single-tap pattern', () => {
    HapticService.checkboxComplete();
    expect(navigator.vibrate).toHaveBeenCalledWith([40]);
  });

  it('reactionBurst calls vibrate with triple-tap pattern', () => {
    HapticService.reactionBurst();
    expect(navigator.vibrate).toHaveBeenCalledWith([20, 15, 20]);
  });

  it('error calls vibrate with heavy double-bump pattern', () => {
    HapticService.error();
    expect(navigator.vibrate).toHaveBeenCalledWith([60, 50, 60]);
  });

  it('does not throw when navigator.vibrate is absent', () => {
    vi.stubGlobal('navigator', {});
    expect(() => HapticService.shutterClick()).not.toThrow();
    expect(() => HapticService.checkboxComplete()).not.toThrow();
    expect(() => HapticService.reactionBurst()).not.toThrow();
    expect(() => HapticService.error()).not.toThrow();
  });
});
