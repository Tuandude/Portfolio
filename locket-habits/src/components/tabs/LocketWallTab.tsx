import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CheckInPost } from '../../types';
import { SquircleFrame } from '../ui/SquircleFrame';
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

  const reactionEmojis = ['🔥', '👏', '❤️', '⚡', '✨'];

  return (
    <div className="flex flex-col gap-4 pb-20 relative">
      {/* Tab Filter Switcher */}
      <div className="flex bg-white rounded-2xl brutal-border p-1 gap-1">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
            filter === 'all' ? 'bg-[#FFD166] brutal-border brutal-shadow-sm' : 'text-gray-500'
          }`}
        >
          Tất Cả 🌟
        </button>
        <button
          onClick={() => setFilter('friends')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
            filter === 'friends' ? 'bg-[#3A86FF] text-white brutal-border brutal-shadow-sm' : 'text-gray-500'
          }`}
        >
          Bạn Bè 👥
        </button>
        <button
          onClick={() => setFilter('solo')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
            filter === 'solo' ? 'bg-[#FF6B8B] text-white brutal-border brutal-shadow-sm' : 'text-gray-500'
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
                  className="w-8 h-8 rounded-full brutal-border object-cover"
                />
                <div className="flex flex-col">
                  <span className="font-black text-xs text-[#18181B] leading-tight">
                    {post.authorName}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500">{post.timestamp}</span>
                </div>
              </div>

              <Badge variant={post.isFriend ? 'blue' : 'yellow'}>
                {post.habitTitle}
              </Badge>
            </div>

            {/* Squircle Photo View */}
            <SquircleFrame aspectRatio="square">
              <img
                src={post.imageUrl}
                alt={post.habitTitle}
                className="w-full h-full object-cover"
              />

              {/* Caption Overlay */}
              {post.note && (
                <div className="absolute bottom-3 inset-x-3 bg-black/60 backdrop-blur-md text-white font-bold text-xs p-2.5 rounded-2xl border border-white/20">
                  {post.note}
                </div>
              )}
            </SquircleFrame>

            {/* Reaction Bar */}
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-2xl brutal-border brutal-shadow-sm mt-0.5">
              <div className="flex items-center gap-1.5">
                {reactionEmojis.map((emoji) => {
                  const count = post.reactions[emoji] || 0;
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReactionClick(post.id, emoji)}
                      className="px-2 py-1 rounded-xl hover:bg-gray-100 flex items-center gap-1 font-black text-xs active:scale-90 transition-transform cursor-pointer"
                    >
                      <span>{emoji}</span>
                      {count > 0 && <span className="text-[11px] text-gray-600">{count}</span>}
                    </button>
                  );
                })}
              </div>

              <span className="text-[10px] font-black text-gray-400">Gõ để thả tim!</span>
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
