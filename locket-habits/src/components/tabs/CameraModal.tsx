import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, Upload, Video, RefreshCw, Zap, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { SoundService } from '../../services/sound';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitTitle: string;
  onCapture: (imageUrl: string, note: string) => void;
}

export type PhotoFilter = 'normal' | 'halftone' | 'comic-bw' | 'y2k' | 'cyber';

interface PlacedSticker {
  id: string;
  type: string; // text, emoji, or badge
  label: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  rotation: number;
  scale: number;
  bg?: string;
  textColor?: string;
}

const STICKER_PRESETS = [
  { id: 'pow', label: '💥 POW!', bg: '#FFD166', color: '#18181B' },
  { id: 'done', label: '✅ DONE!', bg: '#52B788', color: '#FFFFFF' },
  { id: 'streak', label: '🔥 ON FIRE', bg: '#FF6B8B', color: '#FFFFFF' },
  { id: 'bolt', label: '⚡ 100%', bg: '#3A86FF', color: '#FFFFFF' },
  { id: 'shades', label: '🕶️ COOL', bg: '#18181B', color: '#FFD166' },
  { id: 'no_excuse', label: '🛑 NO EXCUSES', bg: '#E63946', color: '#FFFFFF' },
  { id: 'chill', label: '☕ CHILL', bg: '#FDFBF7', color: '#18181B' },
  { id: 'goat', label: '👑 TOP TIER', bg: '#9B5DE5', color: '#FFFFFF' },
];

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  habitTitle,
  onCapture,
}) => {
  const [note, setNote] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [flashEffect, setFlashEffect] = useState(false);

  // Editor states
  const [activeFilter, setActiveFilter] = useState<PhotoFilter>('normal');
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [_isEditorMode, setIsEditorMode] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Stop camera helper
  const stopLiveCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveActive(false);
  }, []);

  // Start camera helper
  const startLiveCamera = useCallback(async (mode: 'user' | 'environment' = 'user') => {
    stopLiveCamera();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsLiveActive(true);
      setHasCameraPermission(true);
      setPreviewUrl(null);
      setIsEditorMode(false);
    } catch {
      setHasCameraPermission(false);
      setIsLiveActive(false);
    }
  }, [stopLiveCamera]);

  useEffect(() => {
    if (isOpen) {
      startLiveCamera(facingMode);
    } else {
      stopLiveCamera();
      setPreviewUrl(null);
      setNote('');
      setStickers([]);
      setActiveFilter('normal');
      setIsEditorMode(false);
    }
    return () => {
      stopLiveCamera();
    };
  }, [isOpen, facingMode, startLiveCamera, stopLiveCamera]);

  if (!isOpen) return null;

  // Snapshot from video stream
  const takeSnapshot = () => {
    SoundService.playShutter();
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const startX = ((video.videoWidth || size) - size) / 2;
        const startY = ((video.videoHeight || size) - size) / 2;

        if (facingMode === 'user') {
          ctx.translate(size, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPreviewUrl(dataUrl);
        setIsEditorMode(true);
        stopLiveCamera();
      }
    }
  };

  const toggleCameraFacing = () => {
    SoundService.playClick();
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    SoundService.playClick();
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setIsEditorMode(true);
        stopLiveCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const samplePhotos = [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
  ];

  // Add Sticker to Canvas
  const addSticker = (preset: typeof STICKER_PRESETS[0]) => {
    SoundService.playPop();
    const newSticker: PlacedSticker = {
      id: 'stk_' + Date.now(),
      type: 'badge',
      label: preset.label,
      bg: preset.bg,
      textColor: preset.color,
      x: 35 + (Math.random() * 20 - 10),
      y: 40 + (Math.random() * 20 - 10),
      rotation: Math.floor(Math.random() * 24 - 12),
      scale: 1,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  // Remove Sticker
  const removeSticker = (id: string) => {
    SoundService.playClick();
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  // Render composite image with filter & stickers for publishing
  const generateFinalImage = async (): Promise<string> => {
    if (!previewUrl) return samplePhotos[0];

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 640;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(previewUrl);
          return;
        }

        // 1. Draw base photo
        ctx.drawImage(img, 0, 0, size, size);

        // 2. Apply Retro Filter Effects
        if (activeFilter === 'comic-bw') {
          const imgData = ctx.getImageData(0, 0, size, size);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
            const v = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
            const bw = v > 125 ? 255 : 15;
            d[i] = bw;
            d[i + 1] = bw;
            d[i + 2] = bw;
          }
          ctx.putImageData(imgData, 0, 0);
        } else if (activeFilter === 'halftone') {
          // Halftone color pop effect
          ctx.fillStyle = 'rgba(255, 209, 102, 0.2)';
          ctx.fillRect(0, 0, size, size);
          // Dot grid overlay
          ctx.fillStyle = 'rgba(24, 24, 27, 0.12)';
          for (let x = 0; x < size; x += 10) {
            for (let y = 0; y < size; y += 10) {
              ctx.beginPath();
              ctx.arc(x, y, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        } else if (activeFilter === 'y2k') {
          ctx.fillStyle = 'rgba(255, 107, 139, 0.18)';
          ctx.fillRect(0, 0, size, size);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.fillRect(0, 0, size, size / 3);
        } else if (activeFilter === 'cyber') {
          ctx.fillStyle = 'rgba(58, 134, 255, 0.2)';
          ctx.fillRect(0, 0, size, size);
          ctx.strokeStyle = '#00F0FF';
          ctx.lineWidth = 6;
          ctx.strokeRect(8, 8, size - 16, size - 16);
        }

        // 3. Render Stickers
        stickers.forEach((stk) => {
          ctx.save();
          const posX = (stk.x / 100) * size;
          const posY = (stk.y / 100) * size;
          ctx.translate(posX, posY);
          ctx.rotate((stk.rotation * Math.PI) / 180);
          ctx.scale(stk.scale, stk.scale);

          // Draw Brutalist Badge
          ctx.font = '900 24px system-ui, sans-serif';
          const textMetrics = ctx.measureText(stk.label);
          const paddingX = 18;
          const badgeW = textMetrics.width + paddingX * 2;
          const badgeH = 44;

          // Hard black shadow
          ctx.fillStyle = '#18181B';
          ctx.beginPath();
          ctx.roundRect(-badgeW / 2 + 4, -badgeH / 2 + 4, badgeW, badgeH, 12);
          ctx.fill();

          // Background
          ctx.fillStyle = stk.bg || '#FFD166';
          ctx.beginPath();
          ctx.roundRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 12);
          ctx.fill();

          // Border
          ctx.strokeStyle = '#18181B';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Text
          ctx.fillStyle = stk.textColor || '#18181B';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(stk.label, 0, 2);

          ctx.restore();
        });

        // 4. Locket Bottom Watermark
        ctx.fillStyle = 'rgba(24, 24, 27, 0.65)';
        ctx.fillRect(0, size - 56, size, 56);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 20px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`⚡ ${habitTitle}`, 20, size - 22);

        // Date right stamp
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFD166';
        ctx.fillText(new Date().toLocaleDateString('vi-VN'), size - 20, size - 22);

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => resolve(previewUrl);
      img.src = previewUrl;
    });
  };

  const handleConfirm = async () => {
    SoundService.playSuccess();
    const finalImage = await generateFinalImage();
    onCapture(finalImage, note || `Đã hoàn thành ${habitTitle}! 🎉`);
    stopLiveCamera();
    onClose();
  };

  // Filter CSS style for on-screen live preview
  const getFilterStyle = (): React.CSSProperties => {
    switch (activeFilter) {
      case 'comic-bw':
        return { filter: 'grayscale(100%) contrast(160%)' };
      case 'halftone':
        return { filter: 'contrast(130%) saturate(140%)' };
      case 'y2k':
        return { filter: 'sepia(30%) saturate(150%) hue-rotate(-15deg)' };
      case 'cyber':
        return { filter: 'hue-rotate(180deg) contrast(120%)' };
      default:
        return {};
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      {/* Fullscreen Locket Viewfinder View */}
      <div className="bg-[#18181B] brutal-border-3 brutal-shadow-lg rounded-[36px] w-full max-w-sm flex flex-col overflow-hidden relative shadow-2xl">
        {/* Top Floating Comic App Header */}
        <div className="absolute top-4 inset-x-4 flex justify-between items-center z-30 pointer-events-none">
          <div className="flex items-center gap-2 bg-[#FDFBF7] px-3 py-1 rounded-full brutal-border brutal-shadow-sm pointer-events-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-black text-xs text-[#18181B] tracking-wide uppercase">
              {habitTitle}
            </span>
          </div>
          <button
            onClick={() => {
              SoundService.playClick();
              stopLiveCamera();
              onClose();
            }}
            className="w-10 h-10 rounded-full brutal-border bg-[#FDFBF7] text-[#18181B] flex items-center justify-center font-black hover:bg-gray-100 cursor-pointer pointer-events-auto brutal-shadow-sm active:scale-95 transition-transform"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Viewfinder Main Stage (1:1 Aspect Ratio) */}
        <div
          ref={previewContainerRef}
          className="relative aspect-square w-full bg-black overflow-hidden flex flex-col items-center justify-center select-none"
        >
          {/* Comic Halftone Overlay Background for Camera View */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10 z-10"
            style={{
              backgroundImage: 'radial-gradient(#FFF 2px, transparent 2px)',
              backgroundSize: '12px 12px',
            }}
          />

          {/* Flash animation */}
          {flashEffect && (
            <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-ping" />
          )}

          {/* Captured Preview Mode with Stickers and Filters */}
          {previewUrl ? (
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                style={getFilterStyle()}
                className="w-full h-full object-cover"
              />

              {/* Halftone Dot Overlay CSS if selected */}
              {activeFilter === 'halftone' && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-25"
                  style={{
                    backgroundImage: 'radial-gradient(#000 2.5px, transparent 2.5px)',
                    backgroundSize: '10px 10px',
                  }}
                />
              )}

              {/* Render Draggable / Tappable Stickers */}
              {stickers.map((stk) => {
                const isSelected = selectedStickerId === stk.id;
                return (
                  <div
                    key={stk.id}
                    onClick={() => {
                      SoundService.playClick();
                      setSelectedStickerId(isSelected ? null : stk.id);
                    }}
                    style={{
                      left: `${stk.x}%`,
                      top: `${stk.y}%`,
                      transform: `translate(-50%, -50%) rotate(${stk.rotation}deg) scale(${stk.scale})`,
                      backgroundColor: stk.bg || '#FFD166',
                      color: stk.textColor || '#18181B',
                    }}
                    className={`absolute z-30 px-3.5 py-1.5 rounded-xl brutal-border font-black text-xs select-none cursor-pointer flex items-center gap-1.5 brutal-shadow-sm active:scale-95 transition-transform ${
                      isSelected ? 'ring-3 ring-[#3A86FF]' : ''
                    }`}
                  >
                    <span>{stk.label}</span>
                    {isSelected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSticker(stk.id);
                        }}
                        className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center ml-1 text-[10px] font-black"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Bottom Locket Timestamp Watermark */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white px-4 py-3 flex justify-between items-end text-xs font-black z-20 pointer-events-none">
                <span className="drop-shadow-[1px_1px_0px_#18181B]">⚡ {habitTitle}</span>
                <span className="text-[#FFD166] text-[10px] font-black tracking-wider uppercase drop-shadow-[1px_1px_0px_#18181B]">
                  LOCKET V2.0
                </span>
              </div>
            </div>
          ) : isLiveActive ? (
            /* Live Stream Video Viewfinder */
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Comic Viewfinder Corner Focus Crosshairs */}
              <div className="absolute inset-8 pointer-events-none border-2 border-white/30 rounded-2xl flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <span className="w-3 h-3 border-t-2 border-l-2 border-[#FFD166]" />
                  <span className="w-3 h-3 border-t-2 border-r-2 border-[#FFD166]" />
                </div>
                <div className="flex justify-between">
                  <span className="w-3 h-3 border-b-2 border-l-2 border-[#FFD166]" />
                  <span className="w-3 h-3 border-b-2 border-r-2 border-[#FFD166]" />
                </div>
              </div>
            </div>
          ) : (
            /* Fallback or Camera initializing */
            <div className="flex flex-col items-center gap-3 text-white p-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#FFD166] text-[#18181B] brutal-border flex items-center justify-center brutal-shadow">
                <Camera size={32} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-black text-white">
                  {hasCameraPermission === false
                    ? 'Không có quyền truy cập Camera'
                    : 'Đang mở ống ngắm Live Cam...'}
                </p>
                <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                  Bạn có thể chọn ảnh mẫu hoặc tải ảnh có sẵn từ máy
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                <Button
                  size="sm"
                  variant="yellow"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} className="mr-1" /> Tải từ máy
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    SoundService.playClick();
                    setPreviewUrl(samplePhotos[Math.floor(Math.random() * samplePhotos.length)]);
                    setIsEditorMode(true);
                  }}
                >
                  Dùng ảnh mẫu
                </Button>
                <Button
                  size="sm"
                  variant="pink"
                  onClick={() => startLiveCamera(facingMode)}
                >
                  <Video size={14} className="mr-1" /> Thử lại Cam
                </Button>
              </div>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* BOTTOM CONTROLS DECK */}
        <div className="bg-[#FDFBF7] dark:bg-[#1A1A20] p-4 flex flex-col gap-3 transition-colors border-t-2 border-black/10 dark:border-white/10">
          {previewUrl ? (
            /* EDIT & SUBMIT CONTROLS */
            <div className="flex flex-col gap-3">
              {/* Filter Selector Strip */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-black uppercase text-[#18181B] dark:text-[#F4F4F6] flex items-center gap-1">
                    <Sparkles size={12} className="text-[#FF6B8B]" /> Bộ Lọc Retro Comic
                  </span>
                  <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase">{activeFilter}</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {(['normal', 'halftone', 'comic-bw', 'y2k', 'cyber'] as PhotoFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        SoundService.playClick();
                        setActiveFilter(f);
                      }}
                      className={`px-3 py-1 rounded-xl text-[11px] font-black whitespace-nowrap brutal-border transition-all cursor-pointer ${
                        activeFilter === f
                          ? 'bg-[#FFD166] brutal-shadow-sm text-[#18181B]'
                          : 'bg-white dark:bg-[#23232C] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2C2C38]'
                      }`}
                    >
                      {f === 'normal' && 'Gốc 📸'}
                      {f === 'halftone' && 'Halftone 🟡'}
                      {f === 'comic-bw' && 'Comic B&W 🖤'}
                      {f === 'y2k' && 'Y2K Cam 🌸'}
                      {f === 'cyber' && 'Cyber ⚡'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sticker Selector Strip */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-black uppercase text-[#18181B] dark:text-[#F4F4F6] flex items-center gap-1">
                    <Zap size={12} className="text-[#3A86FF]" /> Dán Sticker Comic ({stickers.length})
                  </span>
                  {stickers.length > 0 && (
                    <button
                      onClick={() => {
                        SoundService.playClick();
                        setStickers([]);
                        setSelectedStickerId(null);
                      }}
                      className="text-[10px] font-black text-red-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Trash2 size={10} /> Xóa hết
                    </button>
                  )}
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {STICKER_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => addSticker(preset)}
                      style={{ backgroundColor: preset.bg, color: preset.color }}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-black brutal-border whitespace-nowrap brutal-shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note input */}
              <input
                type="text"
                placeholder="Viết caption cho bạn bè..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-[#23232C] dark:text-white brutal-border rounded-xl text-sm font-bold placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
              />

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    SoundService.playClick();
                    setStickers([]);
                    setActiveFilter('normal');
                    startLiveCamera(facingMode);
                  }}
                >
                  <RefreshCw size={14} className="mr-1" /> Chụp Lại
                </Button>
                <Button
                  variant="pink"
                  className="flex-2"
                  onClick={handleConfirm}
                >
                  Gửi Lên Locket (+15 XP) 🚀
                </Button>
              </div>
            </div>
          ) : (
            /* LIVE SHOOTING DOCK (True Locket Camera Feel) */
            <div className="flex flex-col gap-3 py-1">
              <div className="flex items-center justify-around px-2">
                {/* Switch Camera facing */}
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="w-12 h-12 rounded-2xl bg-white dark:bg-[#23232C] brutal-border brutal-shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2C2C38] active:translate-x-0.5 active:translate-y-0.5 transition-all text-[#18181B] dark:text-white"
                  title="Đổi camera trước/sau"
                >
                  <RefreshCw size={20} strokeWidth={2.5} />
                </button>

                {/* Big Mechanical Locket Shutter Button */}
                <button
                  type="button"
                  onClick={takeSnapshot}
                  className="w-20 h-20 rounded-full bg-white brutal-border-3 brutal-shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 active:scale-90 transition-all p-1"
                  title="Nhấn để chụp locket"
                >
                  <div className="w-full h-full rounded-full bg-[#FF6B8B] brutal-border flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-white opacity-80" />
                  </div>
                </button>

                {/* Pick file upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-12 rounded-2xl bg-white brutal-border brutal-shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50 active:translate-x-0.5 active:translate-y-0.5 transition-all text-[#18181B]"
                  title="Tải ảnh có sẵn"
                >
                  <Upload size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Quick sample photo shortcut */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    SoundService.playClick();
                    setPreviewUrl(samplePhotos[Math.floor(Math.random() * samplePhotos.length)]);
                    setIsEditorMode(true);
                  }}
                  className="text-[11px] font-black text-gray-500 hover:text-[#18181B] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={12} className="text-[#FFD166]" /> Hoặc thử với ảnh mẫu demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
