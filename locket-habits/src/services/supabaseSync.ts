import { supabase, isSupabaseConfigured } from './supabase';
import { StorageService } from './storage';
import type { CheckInPost, Habit } from '../types';

export const SupabaseSyncService = {
  isEnabled(): boolean {
    return isSupabaseConfigured;
  },

  async syncProfile(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      const profile = StorageService.getProfile();
      await supabase.from('profiles').upsert({
        id: profile.name,
        name: profile.name,
        xp: profile.xp,
        current_streak: profile.currentStreak,
        best_streak: profile.bestStreak,
        freeze_count: profile.streakFreezeCount,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase syncProfile failed:', e);
    }
  },

  async syncHabits(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      const habits = StorageService.getHabits();
      await supabase.from('habits').upsert(
        habits.map((h: Habit) => ({
          id: h.id,
          title: h.title,
          category: h.category,
          icon: h.icon,
          streak_count: h.streakCount,
          completed_today: h.completedToday,
          target_days: h.targetDaysPerWeek,
          reminder_time: h.reminderTime,
        }))
      );
    } catch (e) {
      console.warn('Supabase syncHabits failed:', e);
    }
  },

  async syncPost(post: CheckInPost): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await supabase.from('posts').insert({
        id: post.id,
        habit_id: post.habitId,
        habit_title: post.habitTitle,
        image_url: post.imageUrl,
        note: post.note,
        author_name: post.authorName,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase syncPost failed:', e);
    }
  },
};
