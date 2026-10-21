import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, Upload, Video, RefreshCw, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { SoundService } from '../../services/sound';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitTitle: string;
  onCapture: (imageUrl: string, note: string) => void;
}

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } catch {
      setHasCameraPermission(false);
      setIsLiveActive(false);
    }
  }, [stopLiveCamera]);

  // Handle open / close lifecycle
  useEffect(() => {
    if (isOpen) {
      startLiveCamera(facingMode);
    } else {
      stopLiveCamera();
      setPreviewUrl(null);
      setNote('');
    }
    return () => {
      stopLiveCamera();
    };
  }, [isOpen, facingMode, startLiveCamera, stopLiveCamera]);

  if (!isOpen) return null;

  // Take Snapshot from Video Stream
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
        // Center crop to 1:1 squircle frame
        const startX = ((video.videoWidth || size) - size) / 2;
        const startY = ((video.videoHeight || size) - size) / 2;

        // Mirror if user facing mode
        if (facingMode === 'user') {
          ctx.translate(size, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

        // Watermark timestamp & habit name like Locket
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, size - 48, size, 48);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillText(`⚡ ${habitTitle}`, 16, size - 18);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPreviewUrl(dataUrl);
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

  const handleConfirm = () => {
    SoundService.playSuccess();
    const finalImage = previewUrl || samplePhotos[0];
    onCapture(finalImage, note || `Đã hoàn thành ${habitTitle}! 🎉`);
    stopLiveCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#FDFBF7] brutal-border brutal-shadow-lg rounded-[32px] p-5 w-full max-w-sm flex flex-col gap-4 relative">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-black text-lg text-[#18181B] flex items-center gap-1.5">
              Locket Live Cam <Zap size={16} fill="#FFD166" className="text-[#18181B]" />
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

        {/* Viewfinder Preview */}
        <div className="relative aspect-square w-full rounded-3xl brutal-border bg-black/90 overflow-hidden flex flex-col items-center justify-center">
          {/* Flash animation */}
          {flashEffect && (
            <div className="absolute inset-0 bg-white z-30 pointer-events-none animate-ping" />
          )}

          {/* Captured Preview */}
          {previewUrl ? (
            <div className="relative w-full h-full">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={() => {
                  SoundService.playClick();
                  startLiveCamera(facingMode);
                }}
                className="absolute top-3 right-3 px-3 py-1 bg-white brutal-border rounded-xl font-black text-xs brutal-shadow-sm cursor-pointer"
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
                  }}
                >
                  Ảnh mẫu
                </Button>
                <Button
                  size="sm"
                  variant="pink"
                  onClick={() => startLiveCamera(facingMode)}
                >
                  <Video size={14} className="mr-1" /> Thử lại cam
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

        {/* Note input */}
        <input
          type="text"
          placeholder="Viết caption cho bạn bè..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-4 py-2.5 bg-white brutal-border rounded-xl text-sm font-bold placeholder:text-gray-400 focus:outline-none"
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
