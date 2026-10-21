import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, Upload, Video, RefreshCw, Zap, Sparkles, Wand2, Trash2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md">
      <div className="bg-[#FDFBF7] brutal-border-3 brutal-shadow-lg rounded-[32px] p-4 w-full max-w-sm flex flex-col gap-3 relative max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-black text-lg text-[#18181B] flex items-center gap-1.5">
              Locket Studio Cam <Wand2 size={16} className="text-[#FF6B8B]" />
            </h3>
            <p className="text-xs font-bold text-gray-500">{habitTitle}</p>
          </div>
          <button
            onClick={() => {
              SoundService.playClick();
              stopLiveCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full brutal-border bg-white flex items-center justify-center font-bold hover:bg-gray-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder Preview Box */}
        <div
          ref={previewContainerRef}
          className="relative aspect-square w-full rounded-[28px] brutal-border-3 bg-black/90 overflow-hidden flex flex-col items-center justify-center select-none"
        >
          {/* Flash animation */}
          {flashEffect && (
            <div className="absolute inset-0 bg-white z-40 pointer-events-none animate-ping" />
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
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: 'radial-gradient(#000 2px, transparent 2px)',
                    backgroundSize: '8px 8px',
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
                    className={`absolute z-30 px-3 py-1 rounded-xl brutal-border font-black text-xs select-none cursor-pointer flex items-center gap-1 brutal-shadow-sm active:scale-95 transition-transform ${
                      isSelected ? 'ring-2 ring-[#3A86FF]' : ''
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
                        className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center ml-1 text-[10px]"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Bottom Watermark Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs text-white px-3 py-1.5 flex justify-between items-center text-xs font-black z-20 pointer-events-none">
                <span>⚡ {habitTitle}</span>
                <span className="text-[#FFD166] text-[10px]">LOCKET STAMP</span>
              </div>

              {/* Retake Camera Button */}
              <button
                onClick={() => {
                  SoundService.playClick();
                  setStickers([]);
                  setActiveFilter('normal');
                  startLiveCamera(facingMode);
                }}
                className="absolute top-3 right-3 px-3 py-1 bg-white brutal-border rounded-xl font-black text-xs brutal-shadow-sm cursor-pointer z-30 hover:bg-gray-100"
              >
                Chụp Lại 🔄
              </button>
            </div>
          ) : isLiveActive ? (
            /* Live Stream Video */
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Shutter Button & Controls overlay */}
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-6 z-20">
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md brutal-border flex items-center justify-center cursor-pointer hover:bg-white active:scale-90"
                  title="Đổi camera trước/sau"
                >
                  <RefreshCw size={18} />
                </button>

                {/* Big Mechanical Shutter Trigger */}
                <button
                  type="button"
                  onClick={takeSnapshot}
                  className="w-16 h-16 rounded-full bg-white brutal-border-3 brutal-shadow flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FF6B8B] brutal-border" />
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md brutal-border flex items-center justify-center cursor-pointer hover:bg-white active:scale-90"
                  title="Chọn ảnh từ máy"
                >
                  <Upload size={18} />
                </button>
              </div>
            </div>
          ) : (
            /* Fallback when webcam permission denied or unavailable */
            <div className="flex flex-col items-center gap-2 text-gray-300 p-4 text-center">
              <Camera size={44} className="text-[#FFD166]" />
              <span className="text-xs font-bold">
                {hasCameraPermission === false
                  ? 'Không truy cập được Webcam'
                  : 'Đang mở ống ngắm...'}
              </span>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                <Button
                  size="sm"
                  variant="yellow"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} className="mr-1" /> Tải ảnh lên
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
                  Ảnh mẫu
                </Button>
                <Button
                  size="sm"
                  variant="pink"
                  onClick={() => startLiveCamera(facingMode)}
                >
                  <Video size={14} className="mr-1" /> Mở lại Cam
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

        {/* PHOTO EDITOR CONTROLS (Only visible after photo is captured) */}
        {previewUrl && (
          <div className="flex flex-col gap-2.5 bg-white p-3 rounded-2xl brutal-border brutal-shadow-sm">
            {/* Filter Selector */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-black uppercase text-[#18181B] flex items-center gap-1">
                  <Sparkles size={12} className="text-[#FF6B8B]" /> Bộ Lọc Retro
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{activeFilter}</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {(['normal', 'halftone', 'comic-bw', 'y2k', 'cyber'] as PhotoFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      SoundService.playClick();
                      setActiveFilter(f);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black whitespace-nowrap brutal-border transition-all cursor-pointer ${
                      activeFilter === f
                        ? 'bg-[#FFD166] brutal-shadow-sm text-[#18181B]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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

            {/* Sticker Tray */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-black uppercase text-[#18181B] flex items-center gap-1">
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
          </div>
        )}

        {/* Note input */}
        <input
          type="text"
          placeholder="Viết caption cho bạn bè..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-4 py-2 bg-white brutal-border rounded-xl text-sm font-bold placeholder:text-gray-400 focus:outline-none"
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              SoundService.playClick();
              stopLiveCamera();
              onClose();
            }}
          >
            Huỷ
          </Button>
          <Button variant="pink" fullWidth onClick={handleConfirm}>
            Gửi Locket (+15 XP) 🚀
          </Button>
        </div>
      </div>
    </div>
  );
};
