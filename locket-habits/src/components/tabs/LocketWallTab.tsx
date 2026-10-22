import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Volume2, Mic, Users, Camera } from 'lucide-react';
import type { CheckInPost, UserProfile } from '../../types';
import { Badge } from '../ui/Badge';
import { SoundService } from '../../services/sound';
import { AudioDB } from '../../services/db';
import { HapticService } from '../../services/haptic';
import { StorageService } from '../../services/storage';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { FriendsInvitePanel } from './FriendsInvitePanel';
import { CameoModal } from './CameoModal';

interface LocketWallTabProps {
  posts: CheckInPost[];
  onAddReaction: (postId: string, emoji: string) => void;
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  onNewFriendPost?: (post: CheckInPost) => void;
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
}

export const LocketWallTab: React.FC<LocketWallTabProps> = ({
  posts,
  onAddReaction,
  profile,
  onProfileChange,
  onNewFriendPost,
}) => {
  const [filter, setFilter] = useState<'all' | 'friends' | 'solo'>('all');
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [playingAudioPostId, setPlayingAudioPostId] = useState<string | null>(null);
  const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set());
  const [showFriendsPanel, setShowFriendsPanel] = useState(false);
  const [cameoTargetPost, setCameoTargetPost] = useState<CheckInPost | null>(null);
  const [activeSelfieZoom, setActiveSelfieZoom] = useState<string | null>(null);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const synthIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
      }
    };
  }, []);

  // Supabase Realtime: subscribe to new checkin_posts from friends
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('locket-wall-realtime')
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'checkin_posts',
        },
        (payload: { new: Record<string, unknown> }) => {
          const raw = payload.new;
          // Only surface posts from known friend codes or different authors
          const incomingAuthor = String(raw['author_name'] || '');
          const isFriend = profile.friendCodes.length > 0 || incomingAuthor !== profile.name;
          if (!isFriend) return;

          const newPost: CheckInPost = {
            id: String(raw['id'] || `rt_${Date.now()}`),
            habitId: String(raw['habit_id'] || ''),
            habitTitle: String(raw['habit_title'] || ''),
            imageUrl: String(raw['image_url'] || ''),
            note: String(raw['note'] || ''),
            timestamp: 'Vừa xong',
            authorName: incomingAuthor,
            authorAvatar: String(raw['author_avatar'] || ''),
            isFriend: true,
            reactions: {},
          };

          // Mark this post as "New!" for 30s
          setNewPostIds((prev) => {
            const next = new Set(prev);
            next.add(newPost.id);
            return next;
          });
          setTimeout(() => {
            setNewPostIds((prev) => {
              const next = new Set(prev);
              next.delete(newPost.id);
              return next;
            });
          }, 30000);

          if (onNewFriendPost) onNewFriendPost(newPost);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.friendCodes, profile.name, onNewFriendPost]);

  const filteredPosts = posts.filter((p) => {
    if (filter === 'friends') return p.isFriend;
    if (filter === 'solo') return !p.isFriend;
    return true;
  });

  const handleReactionClick = (postId: string, emoji: string) => {
    SoundService.playPop();
    HapticService.reactionBurst();
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

  // Play/Toggle voice note for a post
  const toggleVoicePlayback = async (post: CheckInPost) => {
    if (playingAudioPostId === post.id) {
      // Pause
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
        synthIntervalRef.current = null;
      }
      setPlayingAudioPostId(null);
      return;
    }

    // Stop current audio if playing
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }

    SoundService.playClick();

    // Check voice source: direct voiceUrl or from AudioDB
    let audioSrc = post.voiceUrl;
    if (!audioSrc) {
      audioSrc = (await AudioDB.getAudio(post.id)) || undefined;
    }

    if (audioSrc) {
      const audio = new Audio(audioSrc);
      audioPlayerRef.current = audio;
      setPlayingAudioPostId(post.id);
      audio.play().catch(() => setPlayingAudioPostId(null));
      audio.onended = () => {
        setPlayingAudioPostId(null);
      };
    } else {
      // If mock demo with no actual audio file recorded, play simulated comic robot voice note
      setPlayingAudioPostId(post.id);
      let noteStep = 0;
      const pitches = [520, 650, 780, 520, 880, 650];
      synthIntervalRef.current = window.setInterval(() => {
        if (noteStep >= pitches.length) {
          if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
          synthIntervalRef.current = null;
          setPlayingAudioPostId(null);
          return;
        }
        SoundService.playBeep(pitches[noteStep], 0.12);
        noteStep++;
      }, 200);
    }
  };

  const reactionEmojis = ['🔥', '👏', '❤️', '⚡', '✨'];

  return (
    <div className="flex flex-col gap-4 pb-20 relative">
      {/* Friends Invite Panel toggle button */}
      <div className="flex justify-between items-center">
        <span className="font-black text-base text-[#18181B] dark:text-[#F4F4F6] tracking-wide">
          Locket Wall ⚡
        </span>
        <button
          type="button"
          onClick={() => {
            SoundService.playClick();
            setShowFriendsPanel((v) => !v);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl brutal-border brutal-shadow-sm text-xs font-black cursor-pointer transition-all ${
            showFriendsPanel
              ? 'bg-[#3A86FF] text-white'
              : 'bg-white dark:bg-[#1A1A20] text-[#18181B] dark:text-[#F4F4F6]'
          }`}
        >
          <Users size={13} strokeWidth={2.5} />
          Bạn Bè {profile.friendCodes.length > 0 && `(${profile.friendCodes.length})`}
        </button>
      </div>

      {/* Collapsible FriendsInvitePanel */}
      {showFriendsPanel && (
        <FriendsInvitePanel profile={profile} onProfileChange={onProfileChange} />
      )}

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
        {filteredPosts.map((post) => {
          const hasVoice = Boolean(post.voiceUrl || post.hasVoiceNote);
          const isAudioPlaying = playingAudioPostId === post.id;
          const isNewPost = newPostIds.has(post.id);

          return (
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
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-[#18181B] dark:text-[#F4F4F6] leading-tight">
                        {post.authorName}
                      </span>
                      {isNewPost && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#FF6B8B] text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                          New!
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                      {post.timestamp}
                    </span>
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

              {/* Squircle Photo View with Retro Comic Frame & Tap to Play Voice Note */}
              <div
                onClick={() => {
                  if (hasVoice) toggleVoicePlayback(post);
                }}
                className={`relative w-full aspect-square rounded-[32px] brutal-border-3 dark:border-[#2E2E38] brutal-shadow-lg overflow-hidden bg-black/20 ${
                  hasVoice ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''
                }`}
              >
                <img
                  src={post.imageUrl}
                  alt={post.habitTitle}
                  className="w-full h-full object-cover"
                />

                {/* Voice Note Comic Badge & Soundwave Overlay */}
                {hasVoice && (
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                    <div
                      className={`px-3 py-1.5 rounded-full brutal-border flex items-center gap-1.5 brutal-shadow-sm transition-all ${
                        isAudioPlaying
                          ? 'bg-[#00F0FF] text-[#18181B] scale-105 ring-2 ring-white animate-pulse'
                          : 'bg-[#18181B]/85 text-white'
                      }`}
                    >
                      {isAudioPlaying ? (
                        <Volume2 size={14} className="animate-bounce" />
                      ) : (
                        <Mic size={14} className="text-[#FFD166]" />
                      )}
                      <span className="font-black text-[10px] uppercase tracking-wider">
                        {isAudioPlaying ? 'Đang phát...' : 'Voice 5s'}
                      </span>

                      {/* Comic Soundwave Animated Bars */}
                      <div className="flex items-end gap-0.5 h-3 ml-0.5">
                        <span
                          className={`w-1 bg-current rounded-full ${
                            isAudioPlaying ? 'animate-[bounce_0.6s_infinite_100ms] h-3' : 'h-1.5'
                          }`}
                        />
                        <span
                          className={`w-1 bg-current rounded-full ${
                            isAudioPlaying ? 'animate-[bounce_0.6s_infinite_200ms] h-3.5' : 'h-3'
                          }`}
                        />
                        <span
                          className={`w-1 bg-current rounded-full ${
                            isAudioPlaying ? 'animate-[bounce_0.6s_infinite_300ms] h-2.5' : 'h-2'
                          }`}
                        />
                        <span
                          className={`w-1 bg-current rounded-full ${
                            isAudioPlaying ? 'animate-[bounce_0.6s_infinite_150ms] h-3' : 'h-1'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Caption Overlay */}
                {post.note && (
                  <div className="absolute bottom-3 inset-x-3 bg-[#18181B]/85 dark:bg-[#121215]/90 backdrop-blur-md text-white font-black text-xs p-3 rounded-2xl brutal-border dark:border-[#2E2E38] shadow-md flex justify-between items-center z-10">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="text-[#FFD166] flex-shrink-0">💬</span>
                      <span className="truncate">{post.note}</span>
                    </div>
                    {hasVoice && (
                      <span className="text-[10px] text-[#00F0FF] uppercase tracking-wider flex-shrink-0 ml-2">
                        {isAudioPlaying ? '🔊 Chạm để ngưng' : '🎙️ Chạm để nghe'}
                      </span>
                    )}
                  </div>
                )}

                {/* Overlaid Circular Cameo Reactions (BeReal / Locket Style) */}
                {post.cameoReactions && post.cameoReactions.length > 0 && (
                  <div className="absolute top-3 left-3 z-20 flex items-center -space-x-3">
                    {post.cameoReactions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          SoundService.playPop();
                          setActiveSelfieZoom(c.selfieUrl);
                        }}
                        className="relative w-11 h-11 rounded-full overflow-hidden brutal-border-2 dark:border-white shadow-md hover:scale-110 active:scale-95 transition-transform bg-black cursor-pointer"
                        title={`${c.authorName} phản hồi biểu cảm`}
                      >
                        <img src={c.selfieUrl} alt={c.authorName} className="w-full h-full object-cover" />
                      </button>
                    ))}
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
                        {count > 0 && (
                          <span className="text-xs font-black text-[#18181B] dark:text-[#F4F4F6]">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Cameo Selfie Button */}
                  <button
                    onClick={() => {
                      SoundService.playClick();
                      setCameoTargetPost(post);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-[#FFE5D9] dark:bg-[#2C1D18] hover:bg-[#FF6B8B] hover:text-white border border-[#18181B] dark:border-[#4A322B] flex items-center gap-1 font-black text-xs active:scale-90 transition-all cursor-pointer text-[#18181B] dark:text-[#F4F4F6]"
                    title="Bắn selfie phản hồi Cameo"
                  >
                    <Camera size={13} strokeWidth={2.5} />
                    <span className="text-[10px]">Cameo</span>
                  </button>
                </div>

                <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                  THẢ TIM! ✨
                </span>
              </div>
            </div>
          );
        })}

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
      {/* Cameo Selfie Modal */}
      {cameoTargetPost && (
        <CameoModal
          isOpen={Boolean(cameoTargetPost)}
          onClose={() => setCameoTargetPost(null)}
          targetPostAuthor={cameoTargetPost.authorName}
          onCaptureCameo={(selfieUrl) => {
            StorageService.addCameoReaction(cameoTargetPost.id, {
              authorName: profile.name,
              avatarUrl: profile.avatar,
              selfieUrl,
            });
            // Update local post state
            cameoTargetPost.cameoReactions = [
              ...(cameoTargetPost.cameoReactions || []),
              {
                id: 'cameo_' + Date.now(),
                authorName: profile.name,
                avatarUrl: profile.avatar,
                selfieUrl,
                timestamp: new Date().toISOString(),
              },
            ];
          }}
        />
      )}

      {/* Selfie Zoom Modal */}
      {activeSelfieZoom && (
        <div
          onClick={() => setActiveSelfieZoom(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer animate-fade-in"
        >
          <div className="relative w-64 h-64 rounded-full overflow-hidden brutal-border-3 dark:border-white shadow-2xl bg-black animate-scale-up">
            <img src={activeSelfieZoom} alt="Zoomed Selfie" className="w-full h-full object-cover" />
          </div>
        </div>
      )}
    </div>
  );
};