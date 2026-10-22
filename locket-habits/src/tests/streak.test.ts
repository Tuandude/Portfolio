import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../services/storage';

describe('Streak & Freeze Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('calculates profile streak and returns defaults properly', () => {
    const profile = StorageService.getProfile();
    expect(profile.currentStreak).toBe(5);
    expect(profile.xp).toBe(150);
    expect(profile.streakFreezeCount).toBe(1);
  });

  it('allows buying streak freeze when XP is sufficient', () => {
    const initialXP = StorageService.getProfile().xp;
    const bought = StorageService.buyStreakFreeze(100);
    expect(bought).toBe(true);

    const updatedProfile = StorageService.getProfile();
    expect(updatedProfile.xp).toBe(initialXP - 100);
    expect(updatedProfile.streakFreezeCount).toBe(2);
  });

  it('rejects buying streak freeze when XP is insufficient', () => {
    const profile = StorageService.getProfile();
    profile.xp = 50;
    StorageService.saveProfile(profile);

    const bought = StorageService.buyStreakFreeze(100);
    expect(bought).toBe(false);
  });
});
