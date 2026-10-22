/**
 * CloudSyncService – bidirectional background sync between local storage and Supabase.
 *
 * Design principles:
 * - Sync Up: called after any local mutation (habit toggle, new post, profile update).
 *   Pushes only the changed entity to Supabase. Failures are silent to the user.
 * - Sync Down: called on app mount and every 5 minutes. Pulls remote records and
 *   merges them into localStorage so the local state stays current across devices.
 * - Graceful offline/unconfigured fallback: when Supabase is not configured or the
 *   network is unavailable the app continues to work entirely from localStorage/IndexedDB.
 *   No error banners are shown; a console.warn is emitted for debugging.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { StorageService } from './storage';
import type { CheckInPost, Habit, UserProfile } from '../types';

// ---------------------------------------------------------------------------
// Internal merge helpers
// ---------------------------------------------------------------------------

/**
 * Merge remote habits into the local list.
 * Remote records take precedence for fields that Supabase owns; local-only habits
 * (not yet pushed) are preserved.
 */
function mergeHabits(local: Habit[], remote: Habit[]): Habit[] {
  const byId = new Map<string, Habit>(local.map((h) => [h.id, h]));
  for (const r of remote) {
    byId.set(r.id, {
      ...(byId.get(r.id) ?? r),
      // Remote fields override local metadata
      title: r.title,
      category: r.category,
      icon: r.icon,
      targetDaysPerWeek: r.targetDaysPerWeek,
      reminderTime: r.reminderTime,
    });
  }
  return Array.from(byId.values());
}

/**
 * Merge remote posts into the local list.
 * Posts are append-only from remote – we only add what is missing locally.
 */
function mergePosts(local: CheckInPost[], remote: CheckInPost[]): CheckInPost[] {
  const localIds = new Set(local.map((p) => p.id));
  const newRemote = remote.filter((p) => !localIds.has(p.id));
  // Newest first
  return [...newRemote, ...local];
}

// ---------------------------------------------------------------------------
// Row-shape adapters (Supabase → app types)
// ---------------------------------------------------------------------------

function rowToHabit(row: Record<string, unknown>): Habit {
  return {
    id: String(row['id']),
    title: String(row['title'] ?? ''),
    category: (row['category'] as Habit['category']) ?? 'other',
    icon: String(row['icon'] ?? 'other'),
    streakCount: Number(row['streak_count'] ?? 0),
    completedToday: Boolean(row['completed_today'] ?? false),
    history: Array.isArray(row['history']) ? (row['history'] as string[]) : [],
    targetDaysPerWeek: Number(row['target_days'] ?? 7),
    reminderTime: row['reminder_time'] ? String(row['reminder_time']) : undefined,
    createdAt: String(row['created_at'] ?? new Date().toISOString().split('T')[0]),
  };
}

function rowToPost(row: Record<string, unknown>): CheckInPost {
  return {
    id: String(row['id']),
    habitId: String(row['habit_id'] ?? ''),
    habitTitle: String(row['habit_title'] ?? ''),
    imageUrl: String(row['image_url'] ?? ''),
    note: String(row['note'] ?? ''),
    timestamp: String(row['created_at'] ?? 'Vừa xong'),
    authorName: String(row['author_name'] ?? ''),
    authorAvatar: String(row['author_avatar'] ?? ''),
    isFriend: Boolean(row['is_friend'] ?? false),
    reactions: (typeof row['reactions'] === 'object' && row['reactions'] !== null
      ? (row['reactions'] as Record<string, number>)
      : { '❤️': 1 }),
    hasVoiceNote: Boolean(row['has_voice_note'] ?? false),
    voiceUrl: row['voice_url'] ? String(row['voice_url']) : undefined,
  };
}

function rowToProfile(row: Record<string, unknown>): Partial<UserProfile> {
  return {
    xp: Number(row['xp'] ?? 0),
    currentStreak: Number(row['current_streak'] ?? 0),
    bestStreak: Number(row['best_streak'] ?? 0),
    streakFreezeCount: Number(row['freeze_count'] ?? 0),
    lastActiveDate: String(row['last_active_date'] ?? ''),
  };
}

// ---------------------------------------------------------------------------
// Public service
// ---------------------------------------------------------------------------

export interface SyncUpPayload {
  habits?: Habit[];
  post?: CheckInPost;
  profile?: UserProfile;
}

export const CloudSyncService = {
  isEnabled(): boolean {
    return isSupabaseConfigured;
  },

  /**
   * Sync Up: push a subset of local data to Supabase.
   * All failures are non-fatal and do not propagate to the caller.
   */
  async syncUp(payload: SyncUpPayload): Promise<void> {
    if (!this.isEnabled()) return;

    const { habits, post, profile } = payload;

    // Push habits
    if (habits && habits.length > 0) {
      try {
        await supabase.from('habits').upsert(
          habits.map((h) => ({
            id: h.id,
            title: h.title,
            category: h.category,
            icon: h.icon,
            streak_count: h.streakCount,
            completed_today: h.completedToday,
            target_days: h.targetDaysPerWeek,
            reminder_time: h.reminderTime ?? null,
            history: h.history,
            created_at: h.createdAt,
          }))
        );
      } catch (e) {
        console.warn('[CloudSync] syncUp habits failed:', e);
      }
    }

    // Push a single new post
    if (post) {
      try {
        await supabase.from('posts').upsert({
          id: post.id,
          habit_id: post.habitId,
          habit_title: post.habitTitle,
          image_url: post.imageUrl,
          note: post.note,
          author_name: post.authorName,
          author_avatar: post.authorAvatar,
          is_friend: post.isFriend,
          reactions: post.reactions,
          has_voice_note: Boolean(post.hasVoiceNote),
          voice_url: post.voiceUrl ?? null,
          created_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('[CloudSync] syncUp post failed:', e);
      }
    }

    // Push profile
    if (profile) {
      try {
        await supabase.from('profiles').upsert({
          id: profile.inviteCode || profile.name,
          name: profile.name,
          avatar: profile.avatar,
          xp: profile.xp,
          current_streak: profile.currentStreak,
          best_streak: profile.bestStreak,
          freeze_count: profile.streakFreezeCount,
          last_active_date: profile.lastActiveDate,
          invite_code: profile.inviteCode,
          friend_codes: profile.friendCodes,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('[CloudSync] syncUp profile failed:', e);
      }
    }
  },

  /**
   * Sync Down: pull the latest habits, posts, and profile from Supabase and
   * merge them into localStorage so the app picks up remote changes.
   * This is a best-effort operation; any error leaves local data untouched.
   */
  async syncDown(): Promise<void> {
    if (!this.isEnabled()) return;

    const localProfile = StorageService.getProfile();
    const userId = localProfile.inviteCode || localProfile.name;

    // Pull habits owned by this user
    try {
      const { data: remoteHabits, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && remoteHabits && remoteHabits.length > 0) {
        const parsed = (remoteHabits as Record<string, unknown>[]).map(rowToHabit);
        const merged = mergeHabits(StorageService.getHabits(), parsed);
        StorageService.saveHabits(merged);
      }
    } catch (e) {
      console.warn('[CloudSync] syncDown habits failed:', e);
    }

    // Pull posts (own + friends)
    try {
      const { data: remotePosts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && remotePosts && remotePosts.length > 0) {
        const parsed = (remotePosts as Record<string, unknown>[]).map(rowToPost);
        const merged = mergePosts(StorageService.getPosts(), parsed);
        // Persist merged list (cap at 200 entries to bound localStorage size)
        const capped = merged.slice(0, 200);
        localStorage.setItem('locket_posts_data', JSON.stringify(capped));
      }
    } catch (e) {
      console.warn('[CloudSync] syncDown posts failed:', e);
    }

    // Pull profile for this user
    try {
      const { data: remoteProfiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .limit(1);

      if (!error && remoteProfiles && remoteProfiles.length > 0) {
        const remotePartial = rowToProfile(remoteProfiles[0] as Record<string, unknown>);
        // Merge: take the higher value for XP and streaks to avoid regression
        const current = StorageService.getProfile();
        const merged: UserProfile = {
          ...current,
          xp: Math.max(current.xp, remotePartial.xp ?? 0),
          currentStreak: Math.max(current.currentStreak, remotePartial.currentStreak ?? 0),
          bestStreak: Math.max(current.bestStreak, remotePartial.bestStreak ?? 0),
          streakFreezeCount: Math.max(current.streakFreezeCount, remotePartial.streakFreezeCount ?? 0),
        };
        StorageService.saveProfile(merged);
      }
    } catch (e) {
      console.warn('[CloudSync] syncDown profile failed:', e);
    }
  },
};
