import { describe, it, expect } from 'vitest';
import { analyzeHabitPhoto } from '../services/aiVision';

describe('analyzeHabitPhoto (AI Vision)', () => {
  // analyzeHabitPhoto is deterministic except for its random branching.
  // We run it multiple times to verify structural invariants that always hold.
  const SAMPLES = 50;

  function runMany(title: string) {
    return Array.from({ length: SAMPLES }, () => analyzeHabitPhoto(title));
  }

  it('always returns a result with required fields', () => {
    const results = runMany('Uống 2L nước mát');
    for (const r of results) {
      expect(typeof r.verified).toBe('boolean');
      expect(typeof r.confidence).toBe('number');
      expect(typeof r.comment).toBe('string');
      expect(['verified', 'suspicious', 'failed']).toContain(r.stamp);
    }
  });

  it('confidence is within 0-100 for a water habit', () => {
    const results = runMany('Uống nước every day');
    for (const r of results) {
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(100);
    }
  });

  it('always returns stamp verified or suspicious for a matched keyword habit', () => {
    // "sách" matches the book/read pattern
    const results = runMany('Đọc sách 20 phút');
    for (const r of results) {
      // The function never returns "failed" from its current implementation
      expect(r.stamp).not.toBe('failed');
    }
  });

  it('always returns verified=true regardless of keyword match', () => {
    // The implementation never returns verified=false in any branch
    const waterResults = runMany('uống water');
    const gymResults = runMany('chạy bộ morning run');
    const unknownResults = runMany('random unrecognised habit');
    for (const r of [...waterResults, ...gymResults, ...unknownResults]) {
      expect(r.verified).toBe(true);
    }
  });

  it('returns a non-empty comment string', () => {
    const titles = [
      'Thiền trước khi ngủ',
      'Ăn salad healthy',
      'Tập yoga buổi sáng',
      'Something completely different',
    ];
    for (const title of titles) {
      const r = analyzeHabitPhoto(title);
      expect(r.comment.length).toBeGreaterThan(0);
    }
  });

  it('recognises fitness keywords and returns a plausible confidence', () => {
    const results = runMany('workout gym session');
    for (const r of results) {
      // Matched fitness pattern gives 80+ (verified) or 55+ (suspicious)
      expect(r.confidence).toBeGreaterThanOrEqual(55);
    }
  });

  it('recognises meditation keywords', () => {
    const results = runMany('thiền buổi tối 10 phút');
    for (const r of results) {
      expect(r.confidence).toBeGreaterThanOrEqual(55);
    }
  });

  it('handles empty habit title without throwing', () => {
    expect(() => analyzeHabitPhoto('')).not.toThrow();
  });
});
