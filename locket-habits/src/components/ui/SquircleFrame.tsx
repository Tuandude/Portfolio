import React from 'react';

interface SquircleFrameProps {
  children: React.ReactNode;
  aspectRatio?: 'square' | 'video' | 'portrait';
  className?: string;
  badge?: React.ReactNode;
}

export const SquircleFrame: React.FC<SquircleFrameProps> = ({
  children,
  aspectRatio = 'square',
  className = '',
  badge,
}) => {
  const aspectStyles = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[4/5]',
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[32px] brutal-border brutal-shadow ${aspectStyles[aspectRatio]} bg-black/5 ${className}`}
    >
      {children}
      {badge && <div className="absolute top-3 left-3 z-10">{badge}</div>}
    </div>
  );
};
