/**
 * BackupService: Export/Import all app data (Habits, Posts, Profile) as a single JSON file.
 *
 * Export gathers data from localStorage (metadata) and IndexedDB (binary blobs for images
 * and audio), embeds them as base64 data-URLs, and triggers a browser download.
 *
 * Import reads a backup file, validates its structure, and writes back to localStorage
 * and IndexedDB, replacing existing data.
 */

import type { Habit, CheckInPost, UserProfile } from '../types';
import { PhotoDB, AudioDB } from './db';

export interface BackupData {
  /** Semver-style version for forward-compat checking */
  version: '1.0';
  exportedAt: string;
  profile: UserProfile;
  habits: Habit[];
  posts: CheckInPost[];
  /** post id -> base64 image data-URL */
  images: Record<string, string>;
  /** post id -> base64 audio data-URL */
  audios: Record<string, string>;
}

const HABITS_KEY = 'locket_habits_data';
const POSTS_KEY = 'locket_posts_data';
const PROFILE_KEY = 'locket_user_profile';

function isValidBackup(data: unknown): data is BackupData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  if (d['version'] !== '1.0') return false;
  if (!Array.isArray(d['habits'])) return false;
  if (!Array.isArray(d['posts'])) return false;
  if (typeof d['profile'] !== 'object' || d['profile'] === null) return false;
  return true;
}

export const BackupService = {
  /**
   * Collect all app data (including binary blobs from IndexedDB) and download as JSON.
   */
  async exportBackup(): Promise<void> {
    const profile: UserProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null') ?? {
      name: 'User',
      avatar: '',
      xp: 0,
      streakFreezeCount: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastActiveDate: '',
      inviteCode: '',
      friendCodes: [],
    };

    const habits: Habit[] = JSON.parse(localStorage.getItem(HABITS_KEY) || '[]');
    const posts: CheckInPost[] = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');

    // Collect binary blobs from IndexedDB
    const images = await PhotoDB.getAllPhotos();
    const audios: Record<string, string> = {};
    for (const post of posts) {
      const audio = await AudioDB.getAudio(post.id);
      if (audio) audios[post.id] = audio;
    }

    const backup: BackupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      habits,
      posts,
      images,
      audios,
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().split('T')[0];
    const a = document.createElement('a');
    a.href = url;
    a.download = `locket-habits-backup-${date}.json`;
    a.click();

    // Release object URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  },

  /**
   * Read a JSON backup file selected by the user, validate it, and restore all data.
   * Returns an error string on failure, or null on success.
   */
  async importBackup(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const raw = JSON.parse(reader.result as string);
          if (!isValidBackup(raw)) {
            resolve('File sao lưu không hợp lệ hoặc sai phiên bản.');
            return;
          }

          // Write metadata to localStorage
          localStorage.setItem(PROFILE_KEY, JSON.stringify(raw.profile));
          localStorage.setItem(HABITS_KEY, JSON.stringify(raw.habits));
          // Strip inline images from post objects (stored separately in IndexedDB)
          const postsClean: CheckInPost[] = raw.posts.map((p) => ({
            ...p,
            // If imageUrl is a data-URL it will be in raw.images; use a placeholder reference
            imageUrl: p.imageUrl,
          }));
          localStorage.setItem(POSTS_KEY, JSON.stringify(postsClean));

          // Restore binary blobs to IndexedDB
          const imageEntries = Object.entries(raw.images ?? {});
          for (const [id, dataUrl] of imageEntries) {
            await PhotoDB.savePhoto(id, dataUrl);
          }

          const audioEntries = Object.entries(raw.audios ?? {});
          for (const [id, dataUrl] of audioEntries) {
            await AudioDB.saveAudio(id, dataUrl);
          }

          resolve(null);
        } catch (err) {
          resolve(`Lỗi khi đọc file: ${String(err)}`);
        }
      };
      reader.onerror = () => resolve('Không đọc được file.');
      reader.readAsText(file);
    });
  },
};
