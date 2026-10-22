import { describe, it, expect, beforeEach } from 'vitest';
import { BackupService, type BackupData } from '../services/backup';
import type { Habit, CheckInPost, UserProfile } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeValidBackup(overrides: Partial<BackupData> = {}): BackupData {
  const profile: UserProfile = {
    name: 'Test User',
    avatar: '',
    xp: 100,
    streakFreezeCount: 1,
    currentStreak: 3,
    bestStreak: 7,
    lastActiveDate: '2026-10-22',
    inviteCode: 'LK-TEST',
    friendCodes: [],
  };

  const habit: Habit = {
    id: 'h1',
    title: 'Uống nước',
    category: 'health',
    icon: 'water',
    streakCount: 2,
    completedToday: false,
    history: ['2026-10-21'],
    targetDaysPerWeek: 7,
    createdAt: '2026-10-01',
  };

  const post: CheckInPost = {
    id: 'p1',
    habitId: 'h1',
    habitTitle: 'Uống nước',
    imageUrl: 'https://example.com/img.jpg',
    note: 'Done!',
    timestamp: '08:00',
    authorName: 'Test User',
    authorAvatar: '',
    isFriend: false,
    reactions: { '❤️': 1 },
  };

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    profile,
    habits: [habit],
    posts: [post],
    images: {},
    audios: {},
    ...overrides,
  };
}

/** Wrap a plain object as a File whose text content is the JSON of that object */
function makeBackupFile(data: unknown, filename = 'backup.json'): File {
  const json = JSON.stringify(data);
  return new File([json], filename, { type: 'application/json' });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BackupService – importBackup', () => {
  beforeEach(() => {
    localStorage.clear();
    // PhotoDB and AudioDB rely on IndexedDB which is not available in jsdom.
    // importBackup calls them only when images/audios entries are present.
    // Our default fixture uses empty maps so the async paths are skipped.
  });

  it('returns null (success) for a valid v1.0 backup', async () => {
    const file = makeBackupFile(makeValidBackup());
    const result = await BackupService.importBackup(file);
    expect(result).toBeNull();
  });

  it('restores profile to localStorage', async () => {
    const backup = makeValidBackup();
    await BackupService.importBackup(makeBackupFile(backup));
    const stored = JSON.parse(localStorage.getItem('locket_user_profile') ?? 'null');
    expect(stored.name).toBe('Test User');
    expect(stored.xp).toBe(100);
  });

  it('restores habits to localStorage', async () => {
    const backup = makeValidBackup();
    await BackupService.importBackup(makeBackupFile(backup));
    const stored: Habit[] = JSON.parse(localStorage.getItem('locket_habits_data') ?? '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe('h1');
  });

  it('restores posts to localStorage', async () => {
    const backup = makeValidBackup();
    await BackupService.importBackup(makeBackupFile(backup));
    const stored: CheckInPost[] = JSON.parse(localStorage.getItem('locket_posts_data') ?? '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe('p1');
  });

  it('returns an error message for wrong version', async () => {
    const bad = makeValidBackup({ version: '2.0' as '1.0' });
    const result = await BackupService.importBackup(makeBackupFile(bad));
    expect(typeof result).toBe('string');
    expect(result!.length).toBeGreaterThan(0);
  });

  it('returns an error message when habits is missing', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bad: any = { ...makeValidBackup(), habits: undefined };
    const result = await BackupService.importBackup(makeBackupFile(bad));
    expect(typeof result).toBe('string');
  });

  it('returns an error message when posts is missing', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bad: any = { ...makeValidBackup(), posts: undefined };
    const result = await BackupService.importBackup(makeBackupFile(bad));
    expect(typeof result).toBe('string');
  });

  it('returns an error message when profile is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bad: any = { ...makeValidBackup(), profile: null };
    const result = await BackupService.importBackup(makeBackupFile(bad));
    expect(typeof result).toBe('string');
  });

  it('returns an error message for completely invalid JSON content', async () => {
    const file = new File(['not valid json !!!'], 'bad.json', { type: 'application/json' });
    const result = await BackupService.importBackup(file);
    expect(typeof result).toBe('string');
  });
});
