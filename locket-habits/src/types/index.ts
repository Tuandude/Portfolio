export interface Habit {
  id: string;
  title: string;
  category: 'health' | 'mind' | 'fitness' | 'learning' | 'other';
  icon: string;
  streakCount: number;
  completedToday: boolean;
  history: string[]; // dates 'YYYY-MM-DD'
  targetDaysPerWeek: number;
  reminderTime?: string;
  createdAt: string;
}

export interface CameoReaction {
  id: string;
  authorName: string;
  avatarUrl: string;
  selfieUrl: string;
  timestamp: string;
}

export interface CheckInPost {
  id: string;
  habitId: string;
  habitTitle: string;
  imageUrl: string;
  note: string;
  timestamp: string;
  authorName: string;
  authorAvatar: string;
  isFriend: boolean;
  reactions: Record<string, number>;
  voiceUrl?: string;
  hasVoiceNote?: boolean;
  cameoReactions?: CameoReaction[];
}

export interface DuoBond {
  friendCode: string;
  friendName: string;
  friendAvatar: string;
  streakCount: number;
  userCheckedToday: boolean;
  friendCheckedToday: boolean;
  lastSyncDate: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  xp: number;
  streakFreezeCount: number;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string;
  /** 6-character invite code of the form LK-XXXX, generated once and persisted */
  inviteCode: string;
  /** Invite codes of connected friends */
  friendCodes: string[];
  /** Active Duo Bond with best friend */
  duoBond?: DuoBond | null;
}
