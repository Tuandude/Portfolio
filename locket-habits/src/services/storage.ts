import type { Habit, CheckInPost, UserProfile } from '../types';
import { PhotoDB } from './db';

const HABITS_KEY = 'locket_habits_data';
const POSTS_KEY = 'locket_posts_data';
const PROFILE_KEY = 'locket_user_profile';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Nguyễn',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  xp: 150,
  streakFreezeCount: 1,
  currentStreak: 5,
  bestStreak: 12,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

const DEFAULT_HABITS: Habit[] = [
  {
    id: 'h1',
    title: 'Uống 2L nước mát',
    category: 'health',
    icon: 'water',
    streakCount: 5,
    completedToday: false,
    history: ['2026-10-17', '2026-10-18', '2026-10-19', '2026-10-20'],
    targetDaysPerWeek: 7,
    reminderTime: '08:00',
    createdAt: '2026-10-01',
  },
  {
    id: 'h2',
    title: 'Đọc sách 15 phút',
    category: 'learning',
    icon: 'book',
    streakCount: 3,
    completedToday: true,
    history: ['2026-10-18', '2026-10-19', '2026-10-20', '2026-10-21'],
    targetDaysPerWeek: 5,
    reminderTime: '21:00',
    createdAt: '2026-10-05',
  },
  {
    id: 'h3',
    title: 'Chạy bộ sáng 2km',
    category: 'fitness',
    icon: 'run',
    streakCount: 8,
    completedToday: false,
    history: ['2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19', '2026-10-20'],
    targetDaysPerWeek: 6,
    reminderTime: '06:30',
    createdAt: '2026-10-02',
  },
  {
    id: 'h4',
    title: 'Thiền 10 phút trước ngủ',
    category: 'mind',
    icon: 'meditate',
    streakCount: 2,
    completedToday: false,
    history: ['2026-10-19', '2026-10-20'],
    targetDaysPerWeek: 7,
    reminderTime: '22:30',
    createdAt: '2026-10-10',
  },
];

const DEFAULT_POSTS: CheckInPost[] = [
  {
    id: 'p1',
    habitId: 'h2',
    habitTitle: 'Đọc sách 15 phút',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    note: 'Đọc xong chương 3 Atomic Habits rồi nè! 🚀',
    timestamp: '10:30 Hôm nay',
    authorName: 'Alex Nguyễn',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isFriend: false,
    reactions: { '🔥': 4, '👏': 2, '❤️': 5 },
  },
  {
    id: 'p2',
    habitId: 'h3',
    habitTitle: 'Chạy bộ 5km ven hồ',
    imageUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&auto=format&fit=crop&q=80',
    note: 'Gió hồ Tây siêu mát lành 🌅',
    timestamp: '07:15 Hôm nay',
    authorName: 'Bảo Linh',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isFriend: true,
    reactions: { '🔥': 8, '⚡': 3, '💪': 6 },
  },
  {
    id: 'p3',
    habitId: 'h1',
    habitTitle: 'Uống ly matcha latte healthy',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
    note: 'Nạp năng lượng xanh cho ngày mới 🍵',
    timestamp: '09:00 Hôm nay',
    authorName: 'Minh Khang',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isFriend: true,
    reactions: { '💚': 7, '🍵': 4, '✨': 2 },
  },
];

export const StorageService = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },

  getHabits(): Habit[] {
    try {
      const data = localStorage.getItem(HABITS_KEY);
      return data ? JSON.parse(data) : DEFAULT_HABITS;
    } catch {
      return DEFAULT_HABITS;
    }
  },

  saveHabits(habits: Habit[]): void {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  },

  addHabit(habit: Omit<Habit, 'id' | 'streakCount' | 'completedToday' | 'history' | 'createdAt'>): Habit {
    const habits = this.getHabits();
    const newHabit: Habit = {
      ...habit,
      id: 'h_' + Date.now(),
      streakCount: 0,
      completedToday: false,
      history: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    habits.unshift(newHabit);
    this.saveHabits(habits);
    return newHabit;
  },

  toggleHabit(id: string): { habit: Habit; earnedXp: number } {
    const habits = this.getHabits();
    const profile = this.getProfile();
    const today = new Date().toISOString().split('T')[0];
    let earnedXp = 0;

    const habit = habits.find((h) => h.id === id);
    if (!habit) throw new Error('Habit not found');

    if (!habit.completedToday) {
      habit.completedToday = true;
      habit.streakCount += 1;
      if (!habit.history.includes(today)) {
        habit.history.push(today);
      }
      earnedXp = 25;
      profile.xp += earnedXp;
      if (habit.streakCount > profile.bestStreak) {
        profile.bestStreak = habit.streakCount;
      }
    } else {
      habit.completedToday = false;
      habit.streakCount = Math.max(0, habit.streakCount - 1);
      habit.history = habit.history.filter((d) => d !== today);
    }

    this.saveHabits(habits);
    this.saveProfile(profile);
    return { habit, earnedXp };
  },

  getPosts(): CheckInPost[] {
    try {
      const data = localStorage.getItem(POSTS_KEY);
      return data ? JSON.parse(data) : DEFAULT_POSTS;
    } catch {
      return DEFAULT_POSTS;
    }
  },

  addPost(post: Omit<CheckInPost, 'id' | 'timestamp' | 'reactions'>): CheckInPost {
    const posts = this.getPosts();
    const postId = 'p_' + Date.now();

    // Persist heavy image to IndexedDB
    if (post.imageUrl?.startsWith('data:image')) {
      PhotoDB.savePhoto(postId, post.imageUrl);
    }

    const newPost: CheckInPost = {
      ...post,
      id: postId,
      timestamp: 'Vừa xong',
      reactions: { '❤️': 1 },
    };
    posts.unshift(newPost);
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));

    // Also award check-in bonus XP
    const profile = this.getProfile();
    profile.xp += 15;
    this.saveProfile(profile);

    return newPost;
  },

  addReaction(postId: string, emoji: string): CheckInPost | null {
    const posts = this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) return null;

    post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    return post;
  },

  buyStreakFreeze(cost: number = 100): boolean {
    const profile = this.getProfile();
    if (profile.xp >= cost) {
      profile.xp -= cost;
      profile.streakFreezeCount += 1;
      this.saveProfile(profile);
      return true;
    }
    return false;
  },
};
