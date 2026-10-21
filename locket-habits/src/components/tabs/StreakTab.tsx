import React, { useState } from 'react';
import { Flame, ShoppingBag, Snowflake, Zap, CheckCircle2 } from 'lucide-react';
import type { UserProfile, Habit } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface StreakTabProps {
  profile: UserProfile;
  habits: Habit[];
  onBuyFreeze: () => void;
}

export const StreakTab: React.FC<StreakTabProps> = ({
  profile,
  habits: _habits,
  onBuyFreeze,
}) => {
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Generate 7-day calendar for current week
  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const todayIndex = 2; // Wednesday

  const handleBuy = () => {
    onBuyFreeze();
    setPurchaseSuccess(true);
    setTimeout(() => setPurchaseSuccess(false), 2000);
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
    </div>
  );
};
