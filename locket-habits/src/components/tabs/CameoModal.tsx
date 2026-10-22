import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RotateCcw, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { SoundService } from '../../services/sound';
import { HapticService } from '../../services/haptic';

interface CameoModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPostAuthor: string;
  onCaptureCameo: (selfieDataUrl: string) => void;
}

export const CameoModal: React.FC<CameoModalProps> = ({
  isOpen,
  onClose,
  targetPostAuthor,
  onCaptureCameo,
}) => {
  const [, setStream] = useState<MediaStream | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMsg('Camera không khả dụng');
        return;
      }
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = media;
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
        videoRef.current.play().catch(() => {});
      }
      setErrorMsg(null);
    } catch {
      setErrorMsg('Không thể mở Camera trước');
    }
  }, [stopCamera]);

  useEffect(() => {
    if (isOpen) {
      setCapturedUrl(null);
      setCountdown(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  const triggerCountdown = () => {
    SoundService.playClick();
    HapticService.shutterClick();
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          takeSelfieSnapshot();
          return null;
        }
        SoundService.playBeep(880, 0.05);
        return prev - 1;
      });
    }, 700);
  };

  const takeSelfieSnapshot = () => {
    if (!videoRef.current) return;
    SoundService.playShutter();
    HapticService.shutterClick();

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth || 360, video.videoHeight || 360);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Center crop circle selfie
    const startX = ((video.videoWidth || size) - size) / 2;
    const startY = ((video.videoHeight || size) - size) / 2;

    // Mirror user camera
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedUrl(dataUrl);
    stopCamera();
  };

  const handleConfirm = () => {
    if (!capturedUrl) return;
    SoundService.playPop();
    HapticService.reactionBurst();
    onCaptureCameo(capturedUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xs bg-[#FDFBF7] dark:bg-[#27272A] rounded-3xl brutal-border-3 brutal-shadow-lg p-5 flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 bg-white dark:bg-[#18181B] text-[#18181B] dark:text-white brutal-border rounded-xl font-black hover:bg-[#FF6B8B] hover:text-white transition-all cursor-pointer"
        >
          <X size={18} strokeWidth={3} />
        </button>

        {/* Title */}
        <div className="inline-block px-3 py-1 bg-[#FFD166] text-[#18181B] rounded-lg brutal-border font-black text-xs uppercase tracking-wider mb-2">
          CAMEO REACTION 📸
        </div>
        <p className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] mb-4">
          Bắn biểu cảm phản hồi đến <span className="text-[#18181B] dark:text-white font-black">{targetPostAuthor}</span>!
        </p>

        {/* Circle Viewfinder */}
        <div className="relative w-48 h-48 rounded-full overflow-hidden brutal-border-3 brutal-shadow bg-[#18181B] flex items-center justify-center mb-4">
          {capturedUrl ? (
            <img src={capturedUrl} alt="Selfie Cameo" className="w-full h-full object-cover" />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <span className="text-6xl font-black text-[#FFD166] drop-shadow-[3px_3px_0px_#18181B] animate-ping">
                    {countdown}
                  </span>
                </div>
              )}
            </>
          )}

          {errorMsg && (
            <div className="p-3 text-xs text-white font-bold bg-[#E63946] m-2 rounded-xl">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full justify-center">
          {capturedUrl ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCapturedUrl(null);
                  startCamera();
                }}
                className="flex items-center gap-1.5"
              >
                <RotateCcw size={16} /> Chụp lại
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirm}
                className="flex items-center gap-1.5 bg-[#52B788] text-white"
              >
                <Check size={16} strokeWidth={3} /> Đính lên ảnh!
              </Button>
            </>
          ) : (
            <button
              onClick={triggerCountdown}
              disabled={countdown !== null}
              className="w-14 h-14 rounded-full bg-[#FF6B8B] hover:bg-[#FF006E] text-white flex items-center justify-center brutal-border-3 brutal-shadow active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              title="Chụp Selfie"
            >
              <Camera size={26} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
