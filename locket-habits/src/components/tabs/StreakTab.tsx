import React, { useState } from 'react';
import { Flame, ShoppingBag, Snowflake, Zap, CheckCircle2 } from 'lucide-react';
import type { UserProfile, Habit } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
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
      {/* Flame Widget */}
      <div className="bg-gradient-to-br from-[#FF6B8B] to-[#FFD166] rounded-[32px] brutal-border brutal-shadow-lg p-6 text-white text-center flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-3 right-3">
          <Badge variant="dark">🔥 Chuỗi Kỷ Lục: {profile.bestStreak}N</Badge>
        </div>

        <div className="relative my-2">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm brutal-border shadow-inner">
            <Flame size={54} fill="#FFD166" stroke="#18181B" strokeWidth={2.5} className="animate-pulse" />
          </div>
        </div>

        <h1 className="text-4xl font-black text-[#18181B] drop-shadow-sm mt-1">
          {profile.currentStreak} Ngày Liên Tiếp
        </h1>
        <p className="text-xs font-bold text-[#18181B]/80 max-w-xs mt-1">
          Tuyệt vời! Bạn đang duy trì phong độ cực kỳ ổn định.
        </p>

        {/* 7-day mini calendar */}
        <div className="flex justify-between w-full max-w-xs mt-5 bg-white/40 p-2.5 rounded-2xl brutal-border">
          {daysOfWeek.map((day, idx) => {
            const isCompleted = idx <= todayIndex;
            return (
              <div key={day} className="flex flex-col items-center gap-1">
                <span className="text-[11px] font-black text-[#18181B]">{day}</span>
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs brutal-border ${
                    isCompleted ? 'bg-[#52B788] text-white brutal-shadow-sm' : 'bg-white/70 text-gray-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={14} strokeWidth={3} /> : '·'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP Wallet & Freeze inventory */}
      <div className="grid grid-cols-2 gap-3">
        <Card variant="yellow">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-[#18181B]" />
            <span className="text-xs font-black uppercase text-[#18181B]">Ví Điểm XP</span>
          </div>
          <div className="text-2xl font-black text-[#18181B] mt-1">{profile.xp} XP</div>
          <p className="text-[10px] font-bold text-gray-600 mt-1">Hoàn thành task để kiếm thêm XP</p>
        </Card>

        <Card variant="blue">
          <div className="flex items-center gap-2">
            <Snowflake size={20} className="text-[#3A86FF]" />
            <span className="text-xs font-black uppercase text-[#18181B]">Khiên Băng</span>
          </div>
          <div className="text-2xl font-black text-[#18181B] mt-1">{profile.streakFreezeCount} Băng</div>
          <p className="text-[10px] font-bold text-gray-600 mt-1">Tự động cứu streak khi quên làm</p>
        </Card>
      </div>

      {/* Freeze Store */}
      <Card variant="white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#18181B]" />
            <h3 className="font-black text-sm text-[#18181B]">Cửa Hàng Cứu Chuỗi ❄️</h3>
          </div>
          <Badge variant="pink">Hot Deal</Badge>
        </div>

        <div className="flex items-center justify-between mt-3 p-3 bg-[#E0E7FF] rounded-2xl brutal-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white brutal-border flex items-center justify-center">
              <Snowflake size={22} className="text-blue-500" />
            </div>
            <div>
              <div className="font-black text-xs text-[#18181B]">1x Streak Freeze</div>
              <div className="text-[11px] font-bold text-gray-600">Bảo vệ ngọn lửa trong 24h</div>
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
          <p className="text-xs font-bold text-green-600 text-center mt-2">
            🎉 Đã mua Streak Freeze thành công!
          </p>
        )}
      </Card>
    </div>
  );
};
