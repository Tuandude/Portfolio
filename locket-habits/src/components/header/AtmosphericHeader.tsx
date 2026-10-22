import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import type { Habit, CheckInPost } from '../../types';

interface AtmosphericHeaderProps {
  habits: Habit[];
  posts: CheckInPost[];
  currentTab: 'tasks' | 'locket' | 'streak';
  onTabChange: (tab: 'tasks' | 'locket' | 'streak') => void;
}

/** Vietnamese weekday + date label, e.g. "THỨ NĂM • 24 THÁNG 10" */
function buildDateLabel(): string {
  const now = new Date();
  const weekdays = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
  const day = weekdays[now.getDay()];
  const date = now.getDate();
  const month = now.getMonth() + 1;
  return `${day} • ${date} THÁNG ${month}`;
}

/** Count habits completed today vs total */
function getTodayProgress(habits: Habit[]): { done: number; total: number; pct: number } {
  if (habits.length === 0) return { done: 0, total: 0, pct: 0 };
  const done = habits.filter((h) => h.completedToday).length;
  const total = habits.length;
  const pct = Math.round((done / total) * 100);
  return { done, total, pct };
}

/** Motivational message based on progress percentage */
function getMotivationMessage(pct: number): string {
  if (pct === 0) return 'Khởi động ngày mới nào!';
  if (pct === 100) return 'HÔM NAY ĐÃ XONG TẤT CẢ! TOP TIER';
  return 'Đang giữ phong độ cực cháy!';
}

/** Pick the latest friend post (isFriend === true) or null */
function getLatestFriendPost(posts: CheckInPost[]): CheckInPost | null {
  const friendPosts = posts.filter((p) => p.isFriend);
  if (friendPosts.length === 0) return null;
  return friendPosts.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];
}

/** Mascot SVG — changes expression based on progress */
const MascotIcon: React.FC<{ pct: number }> = ({ pct }) => {
  if (pct === 100) {
    // Sunglasses king — TOP TIER
    return (
      <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[3px_3px_0px_#18181B]">
        {/* Crown */}
        <polygon
          points="10,24 18,10 26,20 32,8 38,20 46,10 54,24"
          fill="#FFD166"
          stroke="#18181B"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Face */}
        <circle cx="32" cy="40" r="18" fill="#FFAE00" stroke="#18181B" strokeWidth="2.5" />
        {/* Sunglasses */}
        <polygon points="14,36 50,36 46,45 18,45" fill="#18181B" stroke="#18181B" strokeWidth="2" />
        <line x1="18" y1="39" x2="30" y2="39" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="34" y1="39" x2="46" y2="39" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        {/* Big grin */}
        <path d="M 22,52 Q 32,60 42,52 Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
        <line x1="32" y1="52" x2="32" y2="57" stroke="#18181B" strokeWidth="2" />
      </svg>
    );
  }

  if (pct > 0) {
    // Flame face — in progress
    return (
      <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[3px_3px_0px_#18181B]">
        {/* Flame */}
        <path
          d="M32,4 C28,12 20,14 22,22 C18,18 20,10 16,14 C12,22 16,32 24,36 C22,30 26,26 28,30 C26,36 30,42 32,42 C34,42 38,36 36,30 C38,26 42,30 40,36 C48,32 52,22 48,14 C44,10 46,18 42,22 C44,14 36,12 32,4Z"
          fill="#FF5400"
          stroke="#18181B"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Face circle */}
        <circle cx="32" cy="48" r="13" fill="#FFD166" stroke="#18181B" strokeWidth="2.5" />
        {/* Eyes */}
        <circle cx="27" cy="46" r="2" fill="#18181B" />
        <circle cx="37" cy="46" r="2" fill="#18181B" />
        {/* Determined mouth */}
        <path d="M 26,53 Q 32,58 38,53" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Coffee mug — fresh start
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[3px_3px_0px_#18181B]">
      {/* Steam wisps */}
      <path d="M22,14 Q24,8 22,4" fill="none" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <path d="M32,12 Q34,6 32,2" fill="none" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <path d="M42,14 Q44,8 42,4" fill="none" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      {/* Mug body */}
      <rect x="12" y="18" width="40" height="36" rx="6" fill="#3A86FF" stroke="#18181B" strokeWidth="2.5" />
      {/* Mug handle */}
      <path
        d="M52,26 Q62,26 62,36 Q62,46 52,46"
        fill="none"
        stroke="#18181B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Inner coffee liquid */}
      <rect x="17" y="22" width="30" height="8" rx="3" fill="#FFAE00" stroke="#18181B" strokeWidth="1.5" />
      {/* Smile */}
      <path d="M 22,42 Q 32,50 42,42" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
      {/* Eyes */}
      <circle cx="25" cy="37" r="2" fill="#18181B" />
      <circle cx="39" cy="37" r="2" fill="#18181B" />
    </svg>
  );
};

export const AtmosphericHeader: React.FC<AtmosphericHeaderProps> = ({
  habits,
  posts,
  currentTab: _currentTab,
  onTabChange,
}) => {
  const dateLabel = useMemo(() => buildDateLabel(), []);
  const { done, total, pct } = useMemo(() => getTodayProgress(habits), [habits]);
  const motivationMsg = useMemo(() => getMotivationMessage(pct), [pct]);
  const latestFriendPost = useMemo(() => getLatestFriendPost(posts), [posts]);

  // Progress bar colour: yellow when in-progress, green when done, muted when 0
  const progressBarColour =
    pct === 100 ? '#52B788' : pct > 0 ? '#FFD166' : '#D1D5DB';

  return (
    <div className="w-full rounded-[20px] brutal-border-3 brutal-shadow-lg overflow-hidden mb-4 bg-[#FDFBF7] dark:bg-[#1E1E26]">
      {/* Main body */}
      <div className="relative bg-[#FDFBF7] dark:bg-[#1E1E26] px-4 pt-4 pb-3">
        {/* Halftone dot texture — subtle background layer */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none rounded-t-[20px]"
          style={{
            backgroundImage: `radial-gradient(#18181B 1.5px, transparent 1.5px)`,
            backgroundSize: '10px 10px',
          }}
        />

        <div className="relative z-10 flex items-start justify-between gap-3">
          {/* LEFT: Date + Progress */}
          <div className="flex-1 min-w-0">
            {/* Date pill */}
            <div className="inline-block bg-[#18181B] dark:bg-[#3F3F4D] text-white px-2.5 py-0.5 font-black text-[10px] uppercase tracking-widest brutal-shadow-sm rounded-lg mb-2">
              {dateLabel}
            </div>

            {/* Habit count */}
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-2xl font-black leading-none text-[#18181B] dark:text-[#F4F4F6]">
                {done}
              </span>
              <span className="text-xs font-black text-gray-400 dark:text-gray-500">
                / {total} thói quen
              </span>
            </div>

            {/* Retro progress bar */}
            <div className="w-full h-4 bg-white dark:bg-[#121215] brutal-border rounded-md overflow-hidden">
              <motion.div
                className="h-full rounded-sm"
                style={{
                  backgroundColor: progressBarColour,
                  // Diagonal stripe pattern overlay for retro look
                  backgroundImage:
                    'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 6px)',
                  border: 'none',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>

            {/* Progress percent label */}
            <div className="flex items-center justify-between mt-1.5">
              <span className="font-black text-[10px] text-[#18181B] dark:text-[#F4F4F6] uppercase tracking-wide">
                {pct}% HOÀN THÀNH
              </span>
              <span
                className={`font-black text-[10px] uppercase tracking-wide ${
                  pct === 100
                    ? 'text-[#52B788]'
                    : pct > 0
                    ? 'text-[#FF5400]'
                    : 'text-gray-400'
                }`}
              >
                {pct === 0 ? '⚡' : pct === 100 ? '👑' : '🔥'}
              </span>
            </div>
          </div>

          {/* RIGHT: Mascot */}
          <div className="flex-shrink-0 w-16 h-16">
            <motion.div
              key={pct === 0 ? 'zero' : pct === 100 ? 'done' : 'progress'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-full h-full"
            >
              <MascotIcon pct={pct} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom strip: motivation message + friend pill */}
      <div className="bg-white dark:bg-[#18181B] border-t-[2.5px] border-[#18181B] dark:border-[#3F3F4D] px-4 py-2 flex items-center justify-between gap-2">
        {/* Motivation message */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#52B788] brutal-border flex-shrink-0 inline-block" />
          <span className="font-black text-[11px] text-[#18181B] dark:text-[#F4F4F6] uppercase tracking-wide truncate">
            {motivationMsg}
          </span>
        </div>

        {/* Friend check-in pill — only shown when friend posts exist */}
        {latestFriendPost && (
          <button
            onClick={() => onTabChange('locket')}
            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-[#3A86FF] text-white brutal-border brutal-shadow-sm rounded-xl font-black text-[10px] uppercase tracking-wide active:translate-x-0.5 active:translate-y-0.5 transition-transform cursor-pointer"
            title="Xem bài đăng mới nhất của bạn bè"
          >
            {latestFriendPost.authorAvatar ? (
              <img
                src={latestFriendPost.authorAvatar}
                alt={latestFriendPost.authorName}
                className="w-4 h-4 rounded-full object-cover border border-white"
              />
            ) : (
              <Camera size={11} strokeWidth={3} />
            )}
            <span>Bạn bè check-in</span>
          </button>
        )}
      </div>
    </div>
  );
};
