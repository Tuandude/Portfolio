import { useState, useEffect } from 'react';
import { CheckSquare, Image as ImageIcon, Flame, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import type { Habit, CheckInPost, UserProfile } from './types';
import { StorageService } from './services/storage';
import { SoundService } from './services/sound';
import { NotificationService } from './services/notification';
import { CloudSyncService } from './services/cloudSync';
import { AtmosphericHeader } from './components/header/AtmosphericHeader';
import { TasksTab } from './components/tabs/TasksTab';
import { LocketWallTab } from './components/tabs/LocketWallTab';
import { StreakTab } from './components/tabs/StreakTab';

export function App() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'locket' | 'streak'>('tasks');

  const [habits, setHabits] = useState<Habit[]>([]);
  const [posts, setPosts] = useState<CheckInPost[]>([]);
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
  const [isMuted, setIsMuted] = useState(SoundService.getMuted());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('locket_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Handle system theme listener if user has not explicitly locked
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('locket_theme_manual');
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Handle theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('locket_theme', theme);
  }, [theme]);

  // Load local data and kick off the initial Cloud Sync Down on mount
  useEffect(() => {
    setHabits(StorageService.getHabits());
    setPosts(StorageService.getPosts());
    setProfile(StorageService.getProfile());

    // Request notification permission and check reminders every minute
    NotificationService.requestPermission();
    const notifInterval = setInterval(() => {
      NotificationService.checkAndNotifyHabits(StorageService.getHabits());
    }, 60000);

    // Sync Down: pull latest data from Supabase and merge into local state
    CloudSyncService.syncDown().then(() => {
      setHabits([...StorageService.getHabits()]);
      setPosts([...StorageService.getPosts()]);
      setProfile({ ...StorageService.getProfile() });
    });

    // Periodic Sync Down every 5 minutes to stay current with remote changes
    const syncInterval = setInterval(() => {
      CloudSyncService.syncDown().then(() => {
        setHabits([...StorageService.getHabits()]);
        setPosts([...StorageService.getPosts()]);
        setProfile({ ...StorageService.getProfile() });
      });
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(notifInterval);
      clearInterval(syncInterval);
    };
  }, []);

  const handleToggleHabit = (id: string) => {
    StorageService.toggleHabit(id);
    const updatedHabits = StorageService.getHabits();
    const updatedProfile = StorageService.getProfile();
    setHabits([...updatedHabits]);
    setProfile({ ...updatedProfile });
    // Sync Up: push habit and profile changes to Supabase in background
    CloudSyncService.syncUp({ habits: updatedHabits, profile: updatedProfile });
  };

  const handleAddHabit = (title: string, category: Habit['category'], icon: string) => {
    StorageService.addHabit({
      title,
      category,
      icon,
      targetDaysPerWeek: 7,
    });
    const updatedHabits = StorageService.getHabits();
    setHabits([...updatedHabits]);
    // Sync Up: push new habit list to Supabase in background
    CloudSyncService.syncUp({ habits: updatedHabits });
  };

  const handleCheckInPhoto = (habitId: string, imageUrl: string, note: string, voiceUrl?: string) => {
    const habit = habits.find((h) => h.id === habitId);
    const newPost = StorageService.addPost({
      habitId,
      habitTitle: habit ? habit.title : 'Check-in thói quen',
      imageUrl,
      note,
      authorName: profile.name,
      authorAvatar: profile.avatar,
      isFriend: false,
      voiceUrl,
    });
    const updatedPosts = StorageService.getPosts();
    const updatedProfile = StorageService.getProfile();
    setPosts([...updatedPosts]);
    setProfile({ ...updatedProfile });
    // Sync Up: push new post and updated profile to Supabase in background
    CloudSyncService.syncUp({ post: newPost, profile: updatedProfile });
  };

  const handleAddReaction = (postId: string, emoji: string) => {
    StorageService.addReaction(postId, emoji);
    setPosts([...StorageService.getPosts()]);
  };

  const handleNewFriendPost = (post: CheckInPost) => {
    // Prepend the realtime post to the feed and refresh profile XP
    setPosts((prev) => [post, ...prev]);
  };

  const handleBuyFreeze = () => {
    const success = StorageService.buyStreakFreeze(100);
    if (success) {
      SoundService.playSuccess();
      const updatedProfile = StorageService.getProfile();
      setProfile({ ...updatedProfile });
      // Sync Up: push updated profile (XP + freeze count) to Supabase in background
      CloudSyncService.syncUp({ profile: updatedProfile });
    }
  };

  const handleToggleMute = () => {
    const muted = SoundService.toggleMute();
    setIsMuted(muted);
    if (!muted) SoundService.playClick();
  };

  const handleToggleTheme = () => {
    SoundService.playClick();
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-[var(--bg-paper)] text-[#18181B] dark:text-[#F4F4F6] flex justify-center selection:bg-[#FFD166] transition-colors duration-200`}>
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md min-h-screen flex flex-col px-4 pt-3 pb-8 relative">
        {/* Daily Focus Header */}
        <AtmosphericHeader
          habits={habits}
          posts={posts}
          currentTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Dynamic Content Views */}
        <main className="flex-1">
          {activeTab === 'tasks' && (
            <TasksTab
              habits={habits}
              onToggleHabit={handleToggleHabit}
              onAddHabit={handleAddHabit}
              onCheckInPhoto={handleCheckInPhoto}
            />
          )}

          {activeTab === 'locket' && (
            <LocketWallTab
              posts={posts}
              onAddReaction={handleAddReaction}
              profile={profile}
              onProfileChange={setProfile}
              onNewFriendPost={handleNewFriendPost}
            />
          )}

          {activeTab === 'streak' && (
            <StreakTab
              profile={profile}
              habits={habits}
              posts={posts}
              onBuyFreeze={handleBuyFreeze}
              onProfileChange={setProfile}
            />
          )}
        </main>

        {/* Bottom Floating Navigation Dock */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-white dark:bg-[#1E1E22] rounded-3xl brutal-border brutal-shadow-lg p-1.5 flex items-center justify-between z-40 transition-colors">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                SoundService.playClick();
                setActiveTab('tasks');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-[#FFD166] text-[#18181B] brutal-border brutal-shadow-sm'
                  : 'text-gray-500 hover:text-[#18181B] dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <CheckSquare size={16} strokeWidth={2.5} />
              Nhiệm Vụ
            </button>

            <button
              onClick={() => {
                SoundService.playClick();
                setActiveTab('locket');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer ${
                activeTab === 'locket'
                  ? 'bg-[#3A86FF] text-white brutal-border brutal-shadow-sm'
                  : 'text-gray-500 hover:text-[#18181B] dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <ImageIcon size={16} strokeWidth={2.5} />
              Locket
            </button>

            <button
              onClick={() => {
                SoundService.playClick();
                setActiveTab('streak');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer ${
                activeTab === 'streak'
                  ? 'bg-[#FF6B8B] text-white brutal-border brutal-shadow-sm'
                  : 'text-gray-500 hover:text-[#18181B] dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <Flame size={16} strokeWidth={2.5} />
              Chuỗi
            </button>
          </div>

          {/* Action buttons: Theme & Sound Toggles */}
          <div className="flex items-center gap-1 mr-0.5">
            {/* Dark Mode Toggle */}
            <button
              onClick={handleToggleTheme}
              className="w-8 h-8 rounded-2xl flex items-center justify-center brutal-border transition-all cursor-pointer bg-[#FFD166] text-[#18181B] dark:bg-[#9B5DE5] dark:text-white brutal-shadow-sm"
              title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
            >
              {theme === 'dark' ? <Sun size={15} strokeWidth={2.5} /> : <Moon size={15} strokeWidth={2.5} />}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleMute}
              className={`w-8 h-8 rounded-2xl flex items-center justify-center brutal-border transition-all cursor-pointer ${
                isMuted
                  ? 'bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                  : 'bg-[#D8F3DC] text-[#18181B] dark:bg-[#52B788] dark:text-white brutal-shadow-sm'
              }`}
              title={isMuted ? 'Bật âm thanh cơ học' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default App;
