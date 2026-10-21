import React from 'react';
import { SoundService } from '../../services/sound';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'yellow' | 'pink' | 'green' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disableSound?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disableSound = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wide rounded-2xl brutal-btn cursor-pointer select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantStyles = {
    primary: 'bg-[#3A86FF] text-white',
    secondary: 'bg-[#FFFFFF] text-[#18181B]',
    yellow: 'bg-[#FFD166] text-[#18181B]',
    pink: 'bg-[#FF6B8B] text-white',
    green: 'bg-[#52B788] text-white',
    ghost: 'bg-transparent border-transparent shadow-none hover:bg-black/5 active:translate-none',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disableSound) {
      SoundService.playClick();
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};
