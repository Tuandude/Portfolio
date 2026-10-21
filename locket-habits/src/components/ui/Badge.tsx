import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pink' | 'yellow' | 'blue' | 'green' | 'dark';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'yellow',
  className = '',
}) => {
  const styles = {
    pink: 'bg-[#FF6B8B] text-white',
    yellow: 'bg-[#FFD166] text-[#18181B]',
    blue: 'bg-[#3A86FF] text-white',
    green: 'bg-[#52B788] text-white',
    dark: 'bg-[#18181B] text-white',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black brutal-border brutal-shadow-sm select-none ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
