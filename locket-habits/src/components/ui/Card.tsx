import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'white' | 'yellow' | 'pink' | 'blue' | 'green';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'white',
  className = '',
  ...props
}) => {
  const variantStyles = {
    white: 'bg-white',
    yellow: 'bg-[#FFF3B0]',
    pink: 'bg-[#FFE5EC]',
    blue: 'bg-[#E0E7FF]',
    green: 'bg-[#D8F3DC]',
  };

  return (
    <div
      className={`rounded-3xl brutal-border brutal-shadow p-4 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
