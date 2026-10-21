import React from 'react';

export type RetroHabitIconType =
  | 'water'
  | 'book'
  | 'run'
  | 'meditate'
  | 'dumbbell'
  | 'code'
  | 'salad'
  | 'sleep'
  | 'sparkle'
  | string;

interface RetroHabitIconProps {
  name: RetroHabitIconType;
  className?: string;
  size?: number;
}

export const RetroHabitIcon: React.FC<RetroHabitIconProps> = ({
  name,
  className = '',
  size = 32,
}) => {
  // Map legacy emoji or icon key to retro SVG
  const normalized = name.toLowerCase();

  const renderIconSvg = () => {
    switch (true) {
      // Water / Hydration
      case normalized.includes('water') || normalized.includes('💧') || normalized.includes('nước'):
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} className="drop-shadow-[1.5px_1.5px_0px_#18181B]">
            {/* Retro Comic Water Droplet with comic glare */}
            <path
              d="M16 3 C16 3 6 15 6 22 A10 10 0 0 0 26 22 C26 15 16 3 16 3 Z"
              fill="#3A86FF"
              stroke="#18181B"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* White comic specular highlight */}
            <path
              d="M12 18 C11 20 12 24 15 25"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="19" cy="14" r="1.5" fill="#FFFFFF" />
          </svg>
        );

      // Book / Reading / Learning
      case normalized.includes('book') || normalized.includes('📖') || normalized.includes('sách') || normalized.includes('learn'):
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} className="drop-shadow-[1.5px_1.5px_0px_#18181B]">
            {/* Comic Open Book with Hard Outline */}
            <path
              d="M4 8 C9 6 15 8 16 11 C17 8 23 6 28 8 L28 24 C23 22 17 24 16 27 C15 24 9 22 4 24 Z"
              fill="#FFD166"
              stroke="#18181B"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <line x1="16" y1="11" x2="16" y2="27" stroke="#18181B" strokeWidth="2.5" />
            <line x1="8" y1="13" x2="13" y2="14" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="8" y1="17" x2="13" y2="18" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="19" y1="14" x2="24" y2="13" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="19" y1="18" x2="24" y2="17" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );

      // Running / Sport / Speed
      case normalized.includes('run') || normalized.includes('🏃') || normalized.includes('chạy') || normalized.includes('bộ'):
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} className="drop-shadow-[1.5px_1.5px_0px_#18181B]">
            {/* Retro Comic Speed Sneaker */}
            <path
              d="M5 21 L13 21 L16 15 L23 15 L26 19 L28 21 C28 25 24 26 21 26 L8 26 C5 26 3 24 5 21 Z"
              fill="#FF6B8B"
              stroke="#18181B"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Sneaker sole */}
            <path d="M4 25 L28 25" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
            {/* Speed streak lines */}
            <line x1="2" y1="14" x2="8" y2="14" stroke="#FFD166" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="1" y1="18" x2="5" y2="18" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
            {/* Lightning bolt emblem on shoe */}
            <polygon points="17,17 19,17 18,20 21,20 16,24 17,21 15,21" fill="#FFD166" stroke="#18181B" strokeWidth="1" />
          </svg>
        );

      // Meditate / Mind / Zen
      case normalized.includes('meditate') || normalized.includes('🧘') || normalized.includes('thiền') || normalized.includes('mind'):
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} className="drop-shadow-[1.5px_1.5px_0px_#18181B]">
            {/* Retro Comic Third Eye / Lotus Star Burst */}
            <circle cx="16" cy="16" r="11" fill="#9B5DE5" stroke="#18181B" strokeWidth="2.5" />
            <polygon
              points="16,6 18,12 24,10 20,16 26,16 20,18 24,24 18,20 16,26 14,20 8,24 12,18 6,16 12,16 8,10 14,12"
              fill="#FFD166"
              stroke="#18181B"
              strokeWidth="1.5"
            />
            <circle cx="16" cy="16" r="4" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
            <circle cx="16" cy="16" r="1.8" fill="#18181B" />
          </svg>
        );

      // Fitness / Dumbbell / Gym
      case normalized.includes('gym') || normalized.includes('fitness') || normalized.includes('tạ') || normalized.includes('dumbbell'):
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} className="drop-shadow-[1.5px_1.5px_0px_#18181B]">
            {/* Angular Comic Dumbbell */}
            <rect x="13" y="14" width="6" height="4" fill="#FFD166" stroke="#18181B" strokeWidth="2" />
            {/* Left weights */}
            <rect x="8" y="9" width="5" height="14" rx="2" fill="#18181B" stroke="#18181B" strokeWidth="2" />
            <rect x="4" y="11" width="4" height="10" rx="1.5" fill="#52B788" stroke="#18181B" strokeWidth="2" />
            {/* Right weights */}
            <rect x="19" y="9" width="5" height="14" rx="2" fill="#18181B" stroke="#18181B" strokeWidth="2" />
            <rect x="24" y="11" width="4" height="10" rx="1.5" fill="#52B788" stroke="#18181B" strokeWidth="2" />
          </svg>
        );

      // Code / Tech / Laptop
      case normalized.includes('code') || normalized.includes('💻') || normalized.includes('tech'):
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} className="drop-shadow-[1.5px_1.5px_0px_#18181B]">
            {/* Retro 80s Terminal Monitor */}
            <rect x="5" y="6" width="22" height="16" rx="3" fill="#18181B" stroke="#18181B" strokeWidth="2.5" />
            <rect x="7" y="8" width="18" height="12" rx="1.5" fill="#3A86FF" stroke="#18181B" strokeWidth="1.5" />
            <polyline points="10,12 13,14 10,16" fill="none" stroke="#FFD166" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="15" y1="16" x2="19" y2="16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <polygon points="12,22 20,22 23,26 9,26" fill="#D8F3DC" stroke="#18181B" strokeWidth="2" />
          </svg>
        );

      // Salad / Diet / Apple
      case normalized.includes('salad') || normalized.includes('🥗') || normalized.includes('ăn') || normalized.includes('diet'):
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} className="drop-shadow-[1.5px_1.5px_0px_#18181B]">
            {/* Retro Comic Apple / Nutrition with Star highlight */}
            <path
              d="M16 8 C11 4 5 7 5 15 C5 24 12 28 16 28 C20 28 27 24 27 15 C27 7 21 4 16 8 Z"
              fill="#52B788"
              stroke="#18181B"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Leaf */}
            <path d="M16 8 C18 4 23 4 24 6 C24 9 20 9 16 8 Z" fill="#FFD166" stroke="#18181B" strokeWidth="2" />
            {/* Comic shine mark */}
            <circle cx="10" cy="14" r="2" fill="#FFFFFF" />
            <circle cx="13" cy="18" r="1" fill="#FFFFFF" />
          </svg>
        );

      // Sleep / Rest
      case normalized.includes('sleep') || normalized.includes('ngủ') || normalized.includes('rest'):
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} className="drop-shadow-[1.5px_1.5px_0px_#18181B]">
            {/* Retro Comic Night Crescent Moon with ZZZ */}
            <path
              d="M19 5 A11 11 0 1 0 27 19 A10 10 0 0 1 19 5 Z"
              fill="#FFD166"
              stroke="#18181B"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Comic Z letters */}
            <path d="M21 7 L25 7 L21 11 L25 11" fill="none" stroke="#FF6B8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 13 L27 13 L24 16 L27 16" fill="none" stroke="#3A86FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      // Default: Retro Comic Exploding Starburst
      default:
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} className="drop-shadow-[1.5px_1.5px_0px_#18181B]">
            <polygon
              points="16,3 19,10 27,6 23,14 30,16 23,19 27,26 19,23 16,30 13,23 5,26 9,19 2,16 9,14 5,6 13,10"
              fill="#FFD166"
              stroke="#18181B"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="16" r="4.5" fill="#FF6B8B" stroke="#18181B" strokeWidth="2" />
          </svg>
        );
    }
  };

  return (
    <div className={`flex items-center justify-center flex-shrink-0 select-none ${className}`}>
      {renderIconSvg()}
    </div>
  );
};
