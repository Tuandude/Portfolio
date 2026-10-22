import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Undo2, Trash2, MessageSquare, X } from 'lucide-react';
import { SoundService } from '../../services/sound';

export type BrushTool = 'pencil' | 'highlighter' | 'comic-ink';

export interface StrokePoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  tool: BrushTool;
  color: string;
  points: StrokePoint[];
}

export interface SpeechBubbleData {
  id: string;
  text: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  tailDirection: 'bottom-left' | 'bottom-right' | 'top-left';
}

interface DoodleCanvasProps {
  width: number;
  height: number;
  strokes: DrawingStroke[];
  onStrokesChange: (strokes: DrawingStroke[]) => void;
  bubbles: SpeechBubbleData[];
  onBubblesChange: (bubbles: SpeechBubbleData[]) => void;
  isDrawingMode: boolean;
}

export const RETRO_COLORS = [
  { name: 'Comic Red', hex: '#E63946' },
  { name: 'Comic Yellow', hex: '#FFD166' },
  { name: 'Cyan Blue', hex: '#00F0FF' },
  { name: 'Comic White', hex: '#FFFFFF' },
  { name: 'Brutal Black', hex: '#18181B' },
];

export const BUBBLE_PRESETS = [
  'Vừa chạy 2km xỉu ngang! 🏃💨',
  'Đã uống đủ 2L nước! 💧✨',
  '100% On Fire! 🔥💪',
  'Tuyệt đối không lười! ⚡',
];

export const DoodleCanvas: React.FC<DoodleCanvasProps> = ({
  width,
  height,
  strokes,
  onStrokesChange,
  bubbles,
  onBubblesChange,
  isDrawingMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<BrushTool>('comic-ink');
  const [currentColor, setCurrentColor] = useState<string>('#FFD166');
  const [isPainting, setIsPainting] = useState(false);
  const currentStrokeRef = useRef<StrokePoint[]>([]);

  // Speech bubble editing state
  const [showAddBubble, setShowAddBubble] = useState(false);
  const [customBubbleText, setCustomBubbleText] = useState('');
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);
  const [isDraggingBubble, setIsDraggingBubble] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; initialBubbleX: number; initialBubbleY: number }>({
    x: 0,
    y: 0,
    initialBubbleX: 50,
    initialBubbleY: 50,
  });

  // Render strokes onto canvas
  const renderStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'pencil') {
        ctx.lineWidth = 3;
        ctx.strokeStyle = stroke.color;
        ctx.stroke();
      } else if (stroke.tool === 'highlighter') {
        ctx.lineWidth = 18;
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 0.45;
        ctx.stroke();
      } else if (stroke.tool === 'comic-ink') {
        // Comic Ink: thick outline in black + inner color or bold black ink with outline
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#18181B';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.lineWidth = 5;
        ctx.strokeStyle = stroke.color === '#18181B' ? '#FFFFFF' : stroke.color;
        ctx.stroke();
      }
      ctx.restore();
    });
  }, [strokes]);

  useEffect(() => {
    renderStrokes();
  }, [renderStrokes]);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleStartDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingMode) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    setIsPainting(true);
    currentStrokeRef.current = [coords];
  };

  const handleMoveDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPainting || !isDrawingMode) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    currentStrokeRef.current.push(coords);

    // Live stroke rendering
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pts = currentStrokeRef.current;
    if (pts.length >= 2) {
      const p1 = pts[pts.length - 2];
      const p2 = pts[pts.length - 1];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (currentTool === 'pencil') {
        ctx.lineWidth = 3;
        ctx.strokeStyle = currentColor;
        ctx.stroke();
      } else if (currentTool === 'highlighter') {
        ctx.lineWidth = 18;
        ctx.strokeStyle = currentColor;
        ctx.globalAlpha = 0.45;
        ctx.stroke();
      } else if (currentTool === 'comic-ink') {
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#18181B';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineWidth = 5;
        ctx.strokeStyle = currentColor === '#18181B' ? '#FFFFFF' : currentColor;
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  const handleEndDraw = () => {
    if (!isPainting) return;
    setIsPainting(false);
    if (currentStrokeRef.current.length > 1) {
      const newStroke: DrawingStroke = {
        tool: currentTool,
        color: currentColor,
        points: [...currentStrokeRef.current],
      };
      onStrokesChange([...strokes, newStroke]);
    }
    currentStrokeRef.current = [];
  };

  const handleUndo = () => {
    SoundService.playClick();
    if (strokes.length > 0) {
      onStrokesChange(strokes.slice(0, -1));
    }
  };

  const handleClearAll = () => {
    SoundService.playClick();
    onStrokesChange([]);
  };

  // Add Speech Bubble
  const addSpeechBubble = (text: string) => {
    SoundService.playPop();
    const newBubble: SpeechBubbleData = {
      id: 'bbl_' + Date.now(),
      text,
      x: 50,
      y: 40 + (Math.random() * 20 - 10),
      tailDirection: 'bottom-left',
    };
    onBubblesChange([...bubbles, newBubble]);
    setSelectedBubbleId(newBubble.id);
    setShowAddBubble(false);
    setCustomBubbleText('');
  };

  const removeSpeechBubble = (id: string) => {
    SoundService.playClick();
    onBubblesChange(bubbles.filter((b) => b.id !== id));
    if (selectedBubbleId === id) setSelectedBubbleId(null);
  };

  // Dragging bubble handling
  const handleBubbleTouchStart = (
    e: React.MouseEvent | React.TouchEvent,
    bubble: SpeechBubbleData
  ) => {
    e.stopPropagation();
    setSelectedBubbleId(bubble.id);
    setIsDraggingBubble(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      initialBubbleX: bubble.x,
      initialBubbleY: bubble.y,
    };
  };

  const handleContainerTouchMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingBubble || !selectedBubbleId) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    // Convert pixel delta to percentage
    const deltaXPercent = (deltaX / width) * 100;
    const deltaYPercent = (deltaY / height) * 100;

    const updatedX = Math.max(10, Math.min(90, dragStartRef.current.initialBubbleX + deltaXPercent));
    const updatedY = Math.max(10, Math.min(90, dragStartRef.current.initialBubbleY + deltaYPercent));

    onBubblesChange(
      bubbles.map((b) => (b.id === selectedBubbleId ? { ...b, x: updatedX, y: updatedY } : b))
    );
  };

  const handleContainerTouchEnd = () => {
    if (isDraggingBubble) {
      setIsDraggingBubble(false);
    }
  };

  return (
    <div
      className="absolute inset-0 select-none overflow-hidden"
      onMouseMove={handleContainerTouchMove}
      onMouseUp={handleContainerTouchEnd}
      onTouchMove={handleContainerTouchMove}
      onTouchEnd={handleContainerTouchEnd}
    >
      {/* HTML5 Transparent Overlay Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleStartDraw}
        onMouseMove={handleMoveDraw}
        onMouseUp={handleEndDraw}
        onMouseLeave={handleEndDraw}
        onTouchStart={handleStartDraw}
        onTouchMove={handleMoveDraw}
        onTouchEnd={handleEndDraw}
        className={`absolute inset-0 w-full h-full z-20 ${
          isDrawingMode ? 'cursor-crosshair pointer-events-auto touch-none' : 'pointer-events-none'
        }`}
      />

      {/* Render Speech Bubbles */}
      {bubbles.map((bubble) => {
        const isSelected = selectedBubbleId === bubble.id;
        return (
          <div
            key={bubble.id}
            onMouseDown={(e) => handleBubbleTouchStart(e, bubble)}
            onTouchStart={(e) => handleBubbleTouchStart(e, bubble)}
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className={`absolute z-30 cursor-move select-none active:scale-95 transition-transform ${
              isSelected ? 'ring-2 ring-[#00F0FF]' : ''
            }`}
          >
            {/* Comic Speech Bubble UI Container */}
            <div className="relative bg-white text-[#18181B] font-black text-xs px-3.5 py-2.5 rounded-2xl brutal-border-3 brutal-shadow max-w-[200px] text-center leading-snug">
              <span>{bubble.text}</span>

              {/* Triangle Tail pointing down-left */}
              <div
                className="absolute -bottom-3 left-4 w-0 h-0 pointer-events-none"
                style={{
                  borderLeft: '7px solid transparent',
                  borderRight: '7px solid transparent',
                  borderTop: '12px solid #18181B',
                }}
              />
              <div
                className="absolute -bottom-[9px] left-[17px] w-0 h-0 pointer-events-none"
                style={{
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '9px solid #FFFFFF',
                }}
              />

              {isSelected && (
                <div className="absolute -top-3 -right-3 flex gap-1 z-40">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSpeechBubble(bubble.id);
                    }}
                    className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-black brutal-border cursor-pointer shadow"
                    title="Xóa bubble"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Floating Toolbar when Drawing Mode is active */}
      {isDrawingMode && (
        <div className="absolute top-14 inset-x-3 z-40 flex flex-col gap-2 pointer-events-auto bg-[#18181B]/95 p-2 rounded-2xl brutal-border-2 brutal-shadow">
          <div className="flex items-center justify-between gap-1">
            {/* Brush styles */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => {
                  SoundService.playClick();
                  setCurrentTool('comic-ink');
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                  currentTool === 'comic-ink'
                    ? 'bg-[#FFD166] text-[#18181B] brutal-border'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                ✒️ Bút Comic
              </button>
              <button
                type="button"
                onClick={() => {
                  SoundService.playClick();
                  setCurrentTool('highlighter');
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                  currentTool === 'highlighter'
                    ? 'bg-[#FFD166] text-[#18181B] brutal-border'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                🖍️ Dạ Quang
              </button>
              <button
                type="button"
                onClick={() => {
                  SoundService.playClick();
                  setCurrentTool('pencil');
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                  currentTool === 'pencil'
                    ? 'bg-[#FFD166] text-[#18181B] brutal-border'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                ✏️ Bút Chì
              </button>
            </div>

            {/* Undo / Clear */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handleUndo}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Hoàn tác nét vẽ"
              >
                <Undo2 size={14} />
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 cursor-pointer"
                title="Xóa toàn bộ nét vẽ"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Retro Color Palette Picker */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-white/15">
            <span className="text-[10px] font-black text-gray-400 uppercase mr-1">Màu:</span>
            {RETRO_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => {
                  SoundService.playClick();
                  setCurrentColor(c.hex);
                }}
                style={{ backgroundColor: c.hex }}
                className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform ${
                  currentColor === c.hex ? 'scale-125 border-[#00F0FF] shadow-sm' : 'border-black'
                }`}
                title={c.name}
              />
            ))}

            <button
              type="button"
              onClick={() => {
                SoundService.playClick();
                setShowAddBubble(true);
              }}
              className="ml-auto px-2 py-1 rounded-lg bg-[#3A86FF] text-white text-[10px] font-black flex items-center gap-1 cursor-pointer hover:bg-blue-600 active:scale-95"
            >
              <MessageSquare size={12} /> + Bong Bóng Thoại
            </button>
          </div>
        </div>
      )}

      {/* Add Speech Bubble Modal Picker */}
      {showAddBubble && (
        <div className="absolute inset-x-2 top-16 z-50 bg-[#FDFBF7] dark:bg-[#1A1A20] brutal-border-3 brutal-shadow-lg rounded-2xl p-3 flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase text-[#18181B] dark:text-[#F4F4F6] flex items-center gap-1">
              💬 Chọn Bong Bóng Thoại Comic
            </span>
            <button
              type="button"
              onClick={() => setShowAddBubble(false)}
              className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-black cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Presets */}
          <div className="flex flex-col gap-1.5">
            {BUBBLE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => addSpeechBubble(preset)}
                className="text-left px-3 py-1.5 rounded-xl bg-white dark:bg-[#23232C] brutal-border text-xs font-black text-[#18181B] dark:text-white hover:bg-[#FFD166] dark:hover:bg-[#FFD166] dark:hover:text-[#18181B] transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Custom text input */}
          <div className="flex gap-1.5 pt-1 border-t border-black/10 dark:border-white/10">
            <input
              type="text"
              placeholder="Nhập lời thoại tùy chỉnh..."
              value={customBubbleText}
              onChange={(e) => setCustomBubbleText(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-[#23232C] dark:text-white brutal-border focus:outline-none"
            />
            <button
              type="button"
              disabled={!customBubbleText.trim()}
              onClick={() => {
                if (customBubbleText.trim()) {
                  addSpeechBubble(customBubbleText.trim());
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-[#FF6B8B] text-white text-xs font-black disabled:opacity-50 brutal-border cursor-pointer"
            >
              Thêm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};