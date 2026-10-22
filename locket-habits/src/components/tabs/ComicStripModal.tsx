import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Share2, Sparkles } from 'lucide-react';
import type { CheckInPost, UserProfile } from '../../types';
import { Button } from '../ui/Button';
import { SoundService } from '../../services/sound';
import { HapticService } from '../../services/haptic';

interface ComicStripModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: CheckInPost[];
  profile: UserProfile;
}

export const ComicStripModal: React.FC<ComicStripModalProps> = ({
  isOpen,
  onClose,
  posts,
  profile,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Filter user posts or friend posts, get up to 4 recent photos
  const candidatePosts = posts
    .filter((p) => p.imageUrl && p.imageUrl.startsWith('data:image'))
    .concat(posts.filter((p) => p.imageUrl && !p.imageUrl.startsWith('data:image')))
    .slice(0, 4);

  useEffect(() => {
    if (!isOpen) {
      setRenderedImageUrl(null);
      return;
    }

    setIsRendering(true);
    const canvas = document.createElement('canvas');
    // Story 9:16 resolution: 1080 x 1920
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsRendering(false);
      return;
    }

    const drawComicPage = async () => {
      // 1. Warm vintage paper background
      ctx.fillStyle = '#FDFBF7';
      ctx.fillRect(0, 0, W, H);

      // 2. Comic Halftone Dots
      ctx.fillStyle = '#18181B';
      ctx.globalAlpha = 0.04;
      for (let x = 0; x < W; x += 18) {
        for (let y = 0; y < H; y += 18) {
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      // Outer Heavy Comic Border
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#18181B';
      ctx.strokeRect(36, 36, W - 72, H - 72);

      // 3. Top Banner: "LOCKET COMICS" Title
      ctx.fillStyle = '#FFD166';
      ctx.fillRect(50, 50, W - 100, 200);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#18181B';
      ctx.strokeRect(50, 50, W - 100, 200);

      // Issue Stamp Pill
      ctx.fillStyle = '#FF6B8B';
      ctx.fillRect(75, 75, 230, 48);
      ctx.strokeRect(75, 75, 230, 48);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 24px sans-serif';
      ctx.fillText('WEEKLY ISSUE #01', 90, 108);

      // Issue Date
      ctx.fillStyle = '#18181B';
      ctx.font = '900 22px sans-serif';
      ctx.fillText(new Date().toLocaleDateString('vi-VN').toUpperCase(), W - 320, 108);

      // Main Headline
      ctx.fillStyle = '#18181B';
      ctx.font = '900 68px sans-serif';
      ctx.fillText('LOCKET CHRONICLES', 75, 195);

      // Sub-tag: User name & Streak
      ctx.fillStyle = '#3A86FF';
      ctx.fillRect(75, 265, W - 150, 70);
      ctx.lineWidth = 6;
      ctx.strokeRect(75, 265, W - 150, 70);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 32px sans-serif';
      ctx.fillText(
        `HERO: ${profile.name.toUpperCase()}  ★  STREAK: ${profile.currentStreak} DAYS  ★  XP: ${profile.xp}`,
        95,
        312
      );

      // 4. Panels Layout (4 panels: 2x2 grid)
      const panelPositions = [
        { x: 75, y: 360, w: 440, h: 540, tilt: -0.015, bg: '#FFE5D9', title: 'THỨ HAI • KHỞI ĐỘNG' },
        { x: 565, y: 360, w: 440, h: 540, tilt: 0.015, bg: '#E8F5E9', title: 'GIỮ VỮNG KỶ LUẬT' },
        { x: 75, y: 940, w: 440, h: 540, tilt: 0.012, bg: '#FFF3B0', title: 'BỨT PHÁ BẤT BẠI' },
        { x: 565, y: 940, w: 440, h: 540, tilt: -0.012, bg: '#E0F2FE', title: 'VỀ ĐÍCH VINH QUANG' },
      ];

      for (let i = 0; i < 4; i++) {
        const p = panelPositions[i];
        const post = candidatePosts[i];

        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.tilt);

        // Panel Shadow
        ctx.fillStyle = '#18181B';
        ctx.fillRect(-p.w / 2 + 10, -p.h / 2 + 10, p.w, p.h);

        // Panel Background
        ctx.fillStyle = p.bg;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#18181B';
        ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);

        // Panel Header Pill
        ctx.fillStyle = '#18181B';
        ctx.fillRect(-p.w / 2 + 15, -p.h / 2 + 15, p.w - 30, 42);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 18px sans-serif';
        ctx.fillText(post ? post.habitTitle.toUpperCase() : p.title, -p.w / 2 + 25, -p.h / 2 + 43);

        // Image Canvas or Placeholder
        if (post && post.imageUrl) {
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = post.imageUrl;
            });

            // Draw cropped square photo inside panel
            const photoSize = p.w - 40;
            const photoX = -p.w / 2 + 20;
            const photoY = -p.h / 2 + 70;
            ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#18181B';
            ctx.strokeRect(photoX, photoY, photoSize, photoSize);

            // Comic caption bubble below photo
            if (post.note) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(photoX, photoY + photoSize + 15, photoSize, 40);
              ctx.strokeRect(photoX, photoY + photoSize + 15, photoSize, 40);
              ctx.fillStyle = '#18181B';
              ctx.font = '900 16px sans-serif';
              ctx.fillText(`💬 "${post.note.slice(0, 24)}"`, photoX + 10, photoY + photoSize + 41);
            }
          } catch {
            // Draw placeholder if image load failed
            ctx.fillStyle = '#18181B';
            ctx.font = '900 24px sans-serif';
            ctx.fillText('📷 CHECK-IN COMPLETED', -120, 20);
          }
        } else {
          // Empty State Comic Illustration
          ctx.fillStyle = '#18181B';
          ctx.font = '900 36px sans-serif';
          ctx.fillText('⚡ LOCKET', -90, -20);
          ctx.font = '900 20px sans-serif';
          ctx.fillStyle = '#52B788';
          ctx.fillText('COMPLETED HABIT!', -95, 30);
        }

        ctx.restore();
      }

      // 5. Bottom Comic Seal & Speech Bubble
      // Big Comic Speech Bubble
      const bubbleX = 75;
      const bubbleY = 1520;
      const bubbleW = W - 150;
      const bubbleH = 190;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(bubbleX, bubbleY, bubbleW, bubbleH);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#18181B';
      ctx.strokeRect(bubbleX, bubbleY, bubbleW, bubbleH);

      // Tail
      ctx.beginPath();
      ctx.moveTo(bubbleX + 60, bubbleY + bubbleH);
      ctx.lineTo(bubbleX + 40, bubbleY + bubbleH + 40);
      ctx.lineTo(bubbleX + 90, bubbleY + bubbleH);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FF5400';
      ctx.font = '900 34px sans-serif';
      ctx.fillText('🔥 BẢN LĨNH CHIẾN BINH THÓI QUEN!', bubbleX + 35, bubbleY + 65);

      ctx.fillStyle = '#18181B';
      ctx.font = '800 24px sans-serif';
      ctx.fillText(
        'Đã hoàn thành 100% mục tiêu tuần. Tiếp tục giữ ngọn lửa Locket cháy rực!',
        bubbleX + 35,
        bubbleY + 115
      );
      ctx.font = '700 20px sans-serif';
      ctx.fillStyle = '#71717A';
      ctx.fillText('Tạo bởi Locket Habits • Retro Comic Edition', bubbleX + 35, bubbleY + 155);

      // Red Comic Verification Seal (Watermark Stamp)
      ctx.save();
      ctx.translate(W - 200, 1615);
      ctx.rotate(-0.15);
      ctx.beginPath();
      ctx.arc(0, 0, 75, 0, Math.PI * 2);
      ctx.strokeStyle = '#E63946';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.fillStyle = '#E63946';
      ctx.font = '900 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LOCKET', 0, -25);
      ctx.font = '900 26px sans-serif';
      ctx.fillText('APPROVED', 0, 8);
      ctx.font = '900 18px sans-serif';
      ctx.fillText('★ 100% ★', 0, 36);
      ctx.restore();

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setRenderedImageUrl(dataUrl);
      setIsRendering(false);
    };

    drawComicPage();
  }, [isOpen, posts, profile]);

  const handleDownload = () => {
    if (!renderedImageUrl) return;
    SoundService.playPop();
    HapticService.shutterClick();

    const link = document.createElement('a');
    link.download = `locket-comic-story-${Date.now()}.jpg`;
    link.href = renderedImageUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!renderedImageUrl) return;
    SoundService.playPop();
    HapticService.reactionBurst();

    if (navigator.share) {
      try {
        const blob = await (await fetch(renderedImageUrl)).blob();
        const file = new File([blob], 'locket-comic-story.jpg', { type: 'image/jpeg' });
        await navigator.share({
          title: 'Locket Chronicles - Tuần San Thói Quen',
          text: `Xem trang truyện tranh tuần san của mình trên Locket Habits! Chuỗi streak: ${profile.currentStreak} ngày!`,
          files: [file],
        });
      } catch {
        // cancelled or unsupported
      }
    } else {
      handleDownload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-sm bg-[#FDFBF7] dark:bg-[#1E1E24] rounded-3xl brutal-border-3 brutal-shadow-lg p-5 flex flex-col items-center my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 bg-white dark:bg-[#27272A] text-[#18181B] dark:text-white brutal-border rounded-xl font-black hover:bg-[#FF6B8B] hover:text-white transition-all cursor-pointer"
        >
          <X size={18} strokeWidth={3} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} className="text-[#FF5400]" />
          <span className="font-black text-sm uppercase tracking-wide text-[#18181B] dark:text-[#FFD166]">
            Tuần San Truyện Tranh 🗞️
          </span>
        </div>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 text-center mb-3">
          Ảnh chuẩn Story 9:16 sẵn sàng khoe lên Instagram / TikTok!
        </p>

        {/* Story Preview */}
        <div className="w-full aspect-[9/16] max-h-[60vh] bg-black rounded-2xl brutal-border-2 overflow-hidden shadow-inner flex items-center justify-center mb-4 relative">
          {isRendering ? (
            <div className="flex flex-col items-center gap-2 text-white font-black text-xs animate-pulse">
              <span className="text-2xl">⚡</span>
              <span>Đang xuất bản trang truyện tranh...</span>
            </div>
          ) : renderedImageUrl ? (
            <img
              src={renderedImageUrl}
              alt="Weekly Comic Story"
              className="w-full h-full object-contain"
            />
          ) : null}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            disabled={!renderedImageUrl || isRendering}
            className="flex-1 flex items-center justify-center gap-1.5"
          >
            <Download size={15} /> Tải Ảnh Về
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleShare}
            disabled={!renderedImageUrl || isRendering}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#FF5400] text-white"
          >
            <Share2 size={15} strokeWidth={2.5} /> Đăng Story 🚀
          </Button>
        </div>
      </div>
    </div>
  );
};
