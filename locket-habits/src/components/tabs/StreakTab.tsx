import React, { useState } from 'react';
import { Flame, ShoppingBag, Snowflake, Zap, CheckCircle2, HeartHandshake, Newspaper } from 'lucide-react';
import type { UserProfile, Habit, CheckInPost } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SoundService } from '../../services/sound';
import { StorageService } from '../../services/storage';
import { HapticService } from '../../services/haptic';
import { ComicStripModal } from './ComicStripModal';

interface StreakTabProps {
  profile: UserProfile;
  habits: Habit[];
  posts?: CheckInPost[];
  onBuyFreeze: () => void;
  onProfileChange?: (profile: UserProfile) => void;
}

export const StreakTab: React.FC<StreakTabProps> = ({
  profile,
  habits: _habits,
  posts = [],
  onBuyFreeze,
  onProfileChange,
}) => {
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [duoCodeInput, setDuoCodeInput] = useState('');
  const [duoError, setDuoError] = useState('');
  const [showComicStrip, setShowComicStrip] = useState(false);

  // Generate 7-day calendar for current week
  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const todayIndex = 2; // Wednesday

  const handleBuy = () => {
    onBuyFreeze();
    SoundService.playSuccess();
    setPurchaseSuccess(true);
    setTimeout(() => setPurchaseSuccess(false), 2000);
  };

  const handleBindDuo = () => {
    setDuoError('');
    const code = duoCodeInput.trim().toUpperCase();
    if (!code) {
      setDuoError('Nhập mã của bạn thân!');
      HapticService.error();
      return;
    }
    if (code === profile.inviteCode) {
      setDuoError('Không thể ghép đôi với chính mình!');
      HapticService.error();
      return;
    }

    const newBond = {
      friendCode: code,
      friendName: `Bestie (${code})`,
      friendAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      streakCount: Math.min(profile.currentStreak, 5) || 1,
      userCheckedToday: profile.currentStreak > 0,
      friendCheckedToday: true,
      lastSyncDate: new Date().toISOString(),
    };

    StorageService.setDuoBond(newBond);
    SoundService.playSuccess();
    HapticService.checkboxComplete();
    setDuoCodeInput('');
    if (onProfileChange) {
      onProfileChange(StorageService.getProfile());
    }
  };

  const handleUnbindDuo = () => {
    SoundService.playClick();
    StorageService.setDuoBond(null);
    if (onProfileChange) {
      onProfileChange(StorageService.getProfile());
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Flame Widget with Halftone Retro Comic Glow */}
      <div className="bg-[#FF6B8B] dark:bg-[#C92A52] rounded-[32px] brutal-border-3 brutal-shadow-lg p-6 text-white text-center flex flex-col items-center relative overflow-hidden">
        {/* Halftone Dot Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#18181B 2px, transparent 2px)',
            backgroundSize: '10px 10px',
          }}
        />

        <div className="absolute top-3 right-3 z-10">
          <Badge variant="dark">🔥 RECORD: {profile.bestStreak} DAYS</Badge>
        </div>

        <div className="relative my-2 z-10">
          <div className="w-24 h-24 bg-[#FFD166] dark:bg-[#F4A261] rounded-full flex items-center justify-center brutal-border-3 brutal-shadow">
            <Flame size={56} fill="#FF5400" stroke="#18181B" strokeWidth={3} className="animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-[#18181B] bg-white dark:bg-[#1A1A20] dark:text-[#F4F4F6] px-4 py-1 rounded-xl brutal-border brutal-shadow-sm mt-1 uppercase tracking-tight z-10">
          {profile.currentStreak} NGÀY LIÊN TIẾP
        </h1>
        <p className="text-xs font-black text-[#18181B] bg-[#FFD166] px-3 py-1 rounded-lg brutal-border mt-2 z-10 uppercase tracking-wide">
          ⚡ NĂNG LƯỢNG RỰC CHÁY - BẢO TOÀN LOCKET!
        </p>

        {/* Comic Strip Export CTA Button */}
        <button
          onClick={() => {
            SoundService.playPop();
            HapticService.shutterClick();
            setShowComicStrip(true);
          }}
          className="mt-4 px-4 py-2 bg-white dark:bg-[#1E1E24] hover:bg-[#FFD166] text-[#18181B] dark:text-white dark:hover:text-[#18181B] brutal-border-2 brutal-shadow-sm rounded-2xl font-black text-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer z-10"
        >
          <Newspaper size={16} className="text-[#FF5400]" />
          <span>Xuất Báo Cáo Tuần: Trang Truyện Tranh 🗞️</span>
        </button>

        {/* 7-day mini calendar - Retro Comic Style */}
        <div className="flex justify-between w-full max-w-xs mt-5 bg-white dark:bg-[#1A1A20] p-3 rounded-2xl brutal-border-3 brutal-shadow z-10">
          {daysOfWeek.map((day, idx) => {
            const isCompleted = idx <= todayIndex;
            return (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-black text-[#18181B] dark:text-[#F4F4F6] uppercase">{day}</span>
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs brutal-border ${
                    isCompleted
                      ? 'bg-[#52B788] text-white brutal-shadow-sm'
                      : 'bg-gray-100 dark:bg-[#2A2A34] text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={15} strokeWidth={3.5} /> : '·'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP Wallet & Freeze inventory */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#FFD166] dark:bg-[#2D2614] rounded-3xl brutal-border-3 brutal-shadow p-4 relative overflow-hidden dark:border-[#4D4222]">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#18181B 2px, transparent 2px)',
              backgroundSize: '8px 8px',
            }}
          />
          <div className="flex items-center gap-1.5 relative z-10">
            <Zap size={18} fill="#18181B" className="text-[#18181B] dark:text-[#FFD166] dark:fill-[#FFD166]" />
            <span className="text-[11px] font-black uppercase text-[#18181B] dark:text-[#FFD166] tracking-wider">VÍ ĐIỂM XP</span>
          </div>
          <div className="text-3xl font-black text-[#18181B] dark:text-[#FFD166] mt-2 relative z-10">{profile.xp} XP</div>
          <p className="text-[10px] font-bold text-[#18181B]/80 dark:text-[#FFD166]/70 mt-1 relative z-10">+15 XP mỗi check-in locket</p>
        </div>

        <div className="bg-[#3A86FF] dark:bg-[#193256] rounded-3xl brutal-border-3 brutal-shadow p-4 text-white relative overflow-hidden dark:border-[#28497A]">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#FFF 2px, transparent 2px)',
              backgroundSize: '8px 8px',
            }}
          />
          <div className="flex items-center gap-1.5 relative z-10">
            <Snowflake size={18} className="text-white dark:text-[#90CAFF]" strokeWidth={3} />
            <span className="text-[11px] font-black uppercase text-white dark:text-[#90CAFF] tracking-wider">KHIÊN BĂNG</span>
          </div>
          <div className="text-3xl font-black text-white dark:text-[#90CAFF] mt-2 drop-shadow-[2px_2px_0px_#18181B] relative z-10">
            {profile.streakFreezeCount} BĂNG
          </div>
          <p className="text-[10px] font-bold text-white/90 dark:text-[#90CAFF]/80 mt-1 relative z-10">Bảo vệ chuỗi khi quên task</p>
        </div>
      </div>

      {/* Co-op Duo Streak Widget */}
      <div className="bg-[#FFF3B0] dark:bg-[#2A2617] rounded-3xl brutal-border-3 brutal-shadow p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HeartHandshake size={22} className="text-[#FF5400]" strokeWidth={2.5} />
            <h3 className="font-black text-sm text-[#18181B] dark:text-[#FFD166] uppercase tracking-wide">
              Chuỗi Đôi Bạn Thân 🤝 Duo Streak
            </h3>
          </div>
          {profile.duoBond && (
            <Badge variant="pink">🔥 DUO ON FIRE</Badge>
          )}
        </div>

        {profile.duoBond ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between bg-white dark:bg-[#1E1E24] p-3 rounded-2xl brutal-border">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-10 h-10 rounded-full brutal-border object-cover relative z-10"
                  />
                  <img
                    src={profile.duoBond.friendAvatar}
                    alt={profile.duoBond.friendName}
                    className="w-10 h-10 rounded-full brutal-border object-cover relative z-0"
                  />
                </div>
                <div>
                  <div className="font-black text-xs text-[#18181B] dark:text-[#F4F4F6]">
                    {profile.name} 🤝 {profile.duoBond.friendName}
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                    Mã liên kết: {profile.duoBond.friendCode}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-[#FF5400]">
                  {profile.duoBond.streakCount} 🔥
                </span>
                <div className="text-[9px] font-black uppercase text-gray-500">Ngày song hành</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs font-black">
              <div className="p-2 rounded-xl bg-white dark:bg-[#1E1E24] brutal-border flex items-center justify-center gap-1.5">
                <span>{profile.name}:</span>
                <span className="text-[#52B788]">Đã check-in ✓</span>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-[#1E1E24] brutal-border flex items-center justify-center gap-1.5">
                <span>Bạn thân:</span>
                <span className="text-[#52B788]">Đã check-in ✓</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleUnbindDuo}
                className="text-[10px] font-black text-red-500 hover:underline cursor-pointer"
              >
                Hủy ghép đôi
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-[#18181B]/80 dark:text-[#FFD166]/80">
              Ghép đôi với 1 bạn thân: Cả hai cùng check-in mỗi ngày để nuôi ngọn lửa chuỗi chung!
            </p>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                placeholder="Nhập mã bạn thân LK-XXXX"
                value={duoCodeInput}
                onChange={(e) => {
                  setDuoCodeInput(e.target.value.toUpperCase());
                  setDuoError('');
                }}
                maxLength={7}
                className="flex-1 px-3 py-2 bg-white dark:bg-[#1E1E24] dark:text-white brutal-border rounded-xl text-xs font-black placeholder:text-gray-400 uppercase"
              />
              <Button size="sm" variant="primary" onClick={handleBindDuo}>
                Ghép Đôi 🤝
              </Button>
            </div>
            {duoError && (
              <span className="text-[10px] font-bold text-red-500">{duoError}</span>
            )}
          </div>
        )}
      </div>

      {/* Freeze Store */}
      <div className="bg-white dark:bg-[#1A1A20] rounded-3xl brutal-border-3 brutal-shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} strokeWidth={2.5} className="text-[#18181B] dark:text-[#F4F4F6]" />
            <h3 className="font-black text-sm text-[#18181B] dark:text-[#F4F4F6] uppercase tracking-wide">Cửa Hàng Cứu Chuỗi ❄️</h3>
          </div>
          <Badge variant="pink">HOT DEAL</Badge>
        </div>

        <div className="flex items-center justify-between mt-3 p-3 bg-[#FFE5D9] dark:bg-[#2C1D18] rounded-2xl brutal-border dark:border-[#4A322B]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#23232C] brutal-border brutal-shadow-sm flex items-center justify-center">
              <Snowflake size={24} className="text-[#3A86FF] dark:text-[#90CAFF]" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-black text-xs text-[#18181B] dark:text-[#F4F4F6] uppercase">1x Streak Freeze</div>
              <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400">Đóng băng bảo vệ streak 24h</div>
            </div>
          </div>

          <Button
            size="sm"
            variant={profile.xp >= 100 ? 'yellow' : 'secondary'}
            disabled={profile.xp < 100}
            onClick={handleBuy}
          >
            {profile.xp >= 100 ? 'Mua 100 XP' : 'Thiếu XP'}
          </Button>
        </div>

        {purchaseSuccess && (
          <p className="text-xs font-black text-green-700 dark:text-green-300 bg-[#D8F3DC] dark:bg-[#1B382B] brutal-border rounded-xl p-2 text-center mt-3">
            🎉 Đã mua Streak Freeze thành công!
          </p>
        )}
      </div>

      {/* 30-Day Heatmap Comic Grid */}
      <div className="bg-white dark:bg-[#1A1A20] rounded-3xl brutal-border-3 brutal-shadow p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-[#18181B] dark:text-[#FFD166]" strokeWidth={2.5} />
            <h3 className="font-black text-sm text-[#18181B] dark:text-[#F4F4F6] uppercase tracking-wide">
              Nhật Ký Đóng Dấu 30 Ngày 📅
            </h3>
          </div>
          <span className="text-xs font-black bg-[#FFD166] text-[#18181B] px-2 py-0.5 rounded-md border border-[#18181B]">
            85% HOÀN THÀNH
          </span>
        </div>

        <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-3">
          Mỗi ô là một ngày duy trì thói quen. Đóng dấu tem comic để thắp sáng bản đồ!
        </p>

        {/* 30 cells grid */}
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 30 }).map((_, i) => {
            const isCompleted = (i + 1) <= 24 && (i + 1) !== 7 && (i + 1) !== 16;
            const isToday = i === 24;
            return (
              <div
                key={i}
                className={`h-11 rounded-xl brutal-border flex flex-col items-center justify-center relative transition-transform hover:scale-105 cursor-pointer ${
                  isToday
                    ? 'bg-[#FFD166] ring-2 ring-[#FF5400] text-[#18181B] font-black'
                    : isCompleted
                    ? 'bg-[#52B788] text-white dark:bg-[#1B4332]'
                    : 'bg-gray-100 dark:bg-[#23232C] text-gray-400 dark:text-gray-600'
                }`}
                title={`Ngày ${i + 1}: ${isCompleted ? 'Hoàn thành' : 'Chưa check-in'}`}
              >
                <span className="text-[9px] font-black">{i + 1}</span>
                {isCompleted && (
                  <span className="text-xs leading-none">⚡</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comic Badges & Milestones */}
      <div className="bg-white dark:bg-[#1A1A20] rounded-3xl brutal-border-3 brutal-shadow p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={20} className="text-[#FF5400]" strokeWidth={2.5} />
          <h3 className="font-black text-sm text-[#18181B] dark:text-[#F4F4F6] uppercase tracking-wide">
            Huy Hiệu Comic & Cấp Độ 🎖️
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[#FFE5D9] dark:bg-[#2A1E1A] rounded-2xl brutal-border flex items-center gap-3">
            <span className="text-2xl">🥉</span>
            <div>
              <div className="font-black text-xs text-[#18181B] dark:text-[#F4F4F6] uppercase">3 NGÀY • TẬP SỰ</div>
              <div className="text-[10px] font-bold text-green-700 dark:text-green-400">Đã mở khóa ✓</div>
            </div>
          </div>

          <div className="p-3 bg-[#FFD166] dark:bg-[#2F2716] rounded-2xl brutal-border flex items-center gap-3">
            <span className="text-2xl">🥈</span>
            <div>
              <div className="font-black text-xs text-[#18181B] dark:text-[#F4F4F6] uppercase">7 NGÀY • CHIẾN BINH</div>
              <div className="text-[10px] font-bold text-green-700 dark:text-green-400">Đã mở khóa ✓</div>
            </div>
          </div>

          <div className="p-3 bg-gray-100 dark:bg-[#23232C] rounded-2xl brutal-border opacity-70 flex items-center gap-3">
            <span className="text-2xl">🥇</span>
            <div>
              <div className="font-black text-xs text-[#18181B] dark:text-[#F4F4F6] uppercase">14 NGÀY • BẤT TỬ</div>
              <div className="text-[10px] font-bold text-gray-500">Tiến độ: 5/14</div>
            </div>
          </div>

          <div className="p-3 bg-gray-100 dark:bg-[#23232C] rounded-2xl brutal-border opacity-70 flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <div className="font-black text-xs text-[#18181B] dark:text-[#F4F4F6] uppercase">30 NGÀY • HUYỀN THOẠI</div>
              <div className="text-[10px] font-bold text-gray-500">Tiến độ: 5/30</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Auto-Sync status indicator (subtle, no user action needed) */}
      <div className="flex items-center justify-center gap-1.5 py-2 opacity-40">
        <div className="w-1.5 h-1.5 rounded-full bg-[#52B788] animate-pulse" />
        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Cloud Auto-Sync đang chạy ngầm
        </span>
      </div>

      {/* Comic Strip Story Modal */}
      <ComicStripModal
        isOpen={showComicStrip}
        onClose={() => setShowComicStrip(false)}
        posts={posts}
        profile={profile}
      />
    </div>
  );
};
