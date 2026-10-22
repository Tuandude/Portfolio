import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2 } from 'lucide-react';
import type { CheckInPost } from '../../types';
import { Badge } from '../ui/Badge';
import { SoundService } from '../../services/sound';

interface LocketWallTabProps {
  posts: CheckInPost[];
  onAddReaction: (postId: string, emoji: string) => void;
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
}

export const LocketWallTab: React.FC<LocketWallTabProps> = ({
  posts,
  onAddReaction,
}) => {
  const [filter, setFilter] = useState<'all' | 'friends' | 'solo'>('all');
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

  const filteredPosts = posts.filter((p) => {
    if (filter === 'friends') return p.isFriend;
    if (filter === 'solo') return !p.isFriend;
    return true;
  });

  const handleReactionClick = (postId: string, emoji: string) => {
    SoundService.playPop();
    onAddReaction(postId, emoji);

    // Create floating emoji particle
    const newFloating: FloatingEmoji = {
      id: Math.random().toString(),
      emoji,
      x: (Math.random() - 0.5) * 60,
    };
    setFloatingEmojis((prev) => [...prev, newFloating]);

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== newFloating.id));
    }, 1200);
  };

  const handleShareStory = async (post: CheckInPost) => {
    SoundService.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Locket Habits - ${post.habitTitle}`,
          text: post.note || `Vừa check-in locket thói quen ${post.habitTitle}!`,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard?.writeText?.(window.location.href);
      alert('📸 Đã sao chép liên kết Locket Story vào bộ nhớ tạm!');
    }
  };

  const reactionEmojis = ['🔥', '👏', '❤️', '⚡', '✨'];

  return (
    <div className="flex flex-col gap-4 pb-20 relative">
      {/* Tab Filter Switcher */}
      <div className="flex bg-white dark:bg-[#1A1A20] rounded-2xl brutal-border dark:border-[#2E2E38] p-1 gap-1">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-[#FFD166] text-[#18181B] brutal-border brutal-shadow-sm'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Tất Cả 🌟
        </button>
        <button
          onClick={() => setFilter('friends')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            filter === 'friends'
              ? 'bg-[#3A86FF] text-white brutal-border brutal-shadow-sm'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Bạn Bè 👥
        </button>
        <button
          onClick={() => setFilter('solo')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            filter === 'solo'
              ? 'bg-[#FF6B8B] text-white brutal-border brutal-shadow-sm'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Của Tôi 👤
        </button>
      </div>

      {/* Locket Posts List */}
      <div className="flex flex-col gap-6">
        {filteredPosts.map((post) => (
          <div key={post.id} className="flex flex-col gap-2">
            {/* Author bar */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-8 h-8 rounded-full brutal-border dark:border-[#2E2E38] object-cover"
                />
                <div className="flex flex-col">
                  <span className="font-black text-xs text-[#18181B] dark:text-[#F4F4F6] leading-tight">
                    {post.authorName}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{post.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Badge variant={post.isFriend ? 'blue' : 'yellow'}>
                  {post.habitTitle}
                </Badge>
                <button
                  onClick={() => handleShareStory(post)}
                  aria-label="Chia sẻ Locket Story"
                  className="p-1.5 rounded-xl bg-white dark:bg-[#23232C] brutal-border brutal-shadow-sm hover:scale-105 active:scale-95 transition-transform text-[#18181B] dark:text-[#F4F4F6]"
                  title="Chia sẻ Locket Story"
                >
                  <Share2 size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Squircle Photo View with Retro Comic Frame */}
            <div className="relative w-full aspect-square rounded-[32px] brutal-border-3 dark:border-[#2E2E38] brutal-shadow-lg overflow-hidden bg-black/20">
              <img
                src={post.imageUrl}
                alt={post.habitTitle}
                className="w-full h-full object-cover"
              />

              {/* Caption Overlay */}
              {post.note && (
                <div className="absolute bottom-3 inset-x-3 bg-[#18181B]/85 dark:bg-[#121215]/90 backdrop-blur-md text-white font-black text-xs p-3 rounded-2xl brutal-border dark:border-[#2E2E38] shadow-md">
                  <span className="text-[#FFD166] mr-1">💬</span> {post.note}
                </div>
              )}
            </div>

            {/* Reaction Bar - Comic Style */}
            <div className="flex items-center justify-between bg-white dark:bg-[#1A1A20] px-3.5 py-2 rounded-2xl brutal-border-3 dark:border-[#2E2E38] brutal-shadow mt-1">
              <div className="flex items-center gap-1.5">
                {reactionEmojis.map((emoji) => {
                  const count = post.reactions[emoji] || 0;
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReactionClick(post.id, emoji)}
                      className="px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-[#23232C] hover:bg-[#FFD166] dark:hover:bg-[#FFD166] dark:hover:text-[#18181B] border border-[#18181B] dark:border-[#383844] flex items-center gap-1 font-black text-xs active:scale-90 transition-all cursor-pointer"
                    >
                      <span className="text-sm">{emoji}</span>
                      {count > 0 && <span className="text-xs font-black text-[#18181B] dark:text-[#F4F4F6]">{count}</span>}
                    </button>
                  );
                })}
              </div>

              <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">THẢ TIM! ✨</span>
            </div>
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12 text-gray-400 font-bold text-sm">
            Chưa có ảnh locket nào ở mục này 📷
          </div>
        )}
      </div>

      {/* Floating Reaction Emojis Animation */}
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
        <AnimatePresence>
          {floatingEmojis.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 1, scale: 0.8, y: 50, x: item.x }}
              animate={{ opacity: 0, scale: 1.8, y: -180, x: item.x + (Math.random() - 0.5) * 40 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="text-4xl absolute drop-shadow-md"
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
