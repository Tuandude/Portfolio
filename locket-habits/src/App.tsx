import { useState, useEffect } from 'react';
import { CheckSquare, Image as ImageIcon, Flame, Volume2, VolumeX } from 'lucide-react';
import type { TimePhase, WeatherState, Habit, CheckInPost, UserProfile } from './types';
import { StorageService } from './services/storage';
import { SoundService } from './services/sound';
import { AtmosphericHeader } from './components/header/AtmosphericHeader';
import { TasksTab } from './components/tabs/TasksTab';
import { LocketWallTab } from './components/tabs/LocketWallTab';
import { StreakTab } from './components/tabs/StreakTab';

export function App() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'locket' | 'streak'>('tasks');
  const [timePhase, setTimePhase] = useState<TimePhase>('day');
  const [weather, setWeather] = useState<WeatherState>('clear');

  const [habits, setHabits] = useState<Habit[]>([]);
  const [posts, setPosts] = useState<CheckInPost[]>([]);
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
  const [isMuted, setIsMuted] = useState(SoundService.getMuted());

  // Load data on start
  useEffect(() => {
    setHabits(StorageService.getHabits());
    setPosts(StorageService.getPosts());
    setProfile(StorageService.getProfile());

    // Determine initial time phase based on current local hour
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 9) setTimePhase('dawn');
    else if (hour >= 9 && hour < 17) setTimePhase('day');
    else if (hour >= 17 && hour < 20) setTimePhase('dusk');
    else setTimePhase('night');
  }, []);

  const handleToggleHabit = (id: string) => {
    StorageService.toggleHabit(id);
    setHabits([...StorageService.getHabits()]);
    setProfile({ ...StorageService.getProfile() });
  };

  const handleAddHabit = (title: string, category: Habit['category'], icon: string) => {
    StorageService.addHabit({
      title,
      category,
      icon,
      targetDaysPerWeek: 7,
    });
    setHabits([...StorageService.getHabits()]);
  };

  const handleCheckInPhoto = (habitId: string, imageUrl: string, note: string) => {
    const habit = habits.find((h) => h.id === habitId);
    StorageService.addPost({
      habitId,
      habitTitle: habit ? habit.title : 'Check-in thói quen',
      imageUrl,
      note,
      authorName: profile.name,
      authorAvatar: profile.avatar,
      isFriend: false,
    });
    setPosts([...StorageService.getPosts()]);
    setProfile({ ...StorageService.getProfile() });
  };

  const handleAddReaction = (postId: string, emoji: string) => {
    StorageService.addReaction(postId, emoji);
    setPosts([...StorageService.getPosts()]);
  };

  const handleBuyFreeze = () => {
    const success = StorageService.buyStreakFreeze(100);
    if (success) {
      SoundService.playSuccess();
      setProfile({ ...StorageService.getProfile() });
    }
  };

  const handleToggleMute = () => {
    const muted = SoundService.toggleMute();
    setIsMuted(muted);
    if (!muted) SoundService.playClick();
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex justify-center selection:bg-[#FFD166]">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md min-h-screen flex flex-col px-4 pt-3 pb-8 relative">
        {/* Sky Header */}
        <AtmosphericHeader
          timePhase={timePhase}
          weather={weather}
          onTimeChange={setTimePhase}
          onWeatherChange={setWeather}
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
            />
          )}

          {activeTab === 'streak' && (
            <StreakTab
              profile={profile}
              habits={habits}
              onBuyFreeze={handleBuyFreeze}
            />
          )}
        </main>

        {/* Bottom Floating Navigation Dock */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-white rounded-3xl brutal-border brutal-shadow-lg p-1.5 flex items-center justify-between z-40">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                SoundService.playClick();
                setActiveTab('tasks');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-[#FFD166] text-[#18181B] brutal-border brutal-shadow-sm'
                  : 'text-gray-500 hover:text-[#18181B]'
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
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer ${
                activeTab === 'locket'
                  ? 'bg-[#3A86FF] text-white brutal-border brutal-shadow-sm'
                  : 'text-gray-500 hover:text-[#18181B]'
              }`}
            >
              <ImageIcon size={16} strokeWidth={2.5} />
              Locket Wall
            </button>

            <button
              onClick={() => {
                SoundService.playClick();
                setActiveTab('streak');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer ${
                activeTab === 'streak'
                  ? 'bg-[#FF6B8B] text-white brutal-border brutal-shadow-sm'
                  : 'text-gray-500 hover:text-[#18181B]'
              }`}
            >
              <Flame size={16} strokeWidth={2.5} />
              Chuỗi Ngày
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className={`w-9 h-9 rounded-2xl flex items-center justify-center brutal-border transition-all cursor-pointer mr-1 ${
              isMuted ? 'bg-gray-200 text-gray-400' : 'bg-[#D8F3DC] text-[#18181B] brutal-shadow-sm'
            }`}
            title={isMuted ? 'Bật âm thanh cơ học' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </nav>
      </div>
    </div>
  );
}

export default App;
