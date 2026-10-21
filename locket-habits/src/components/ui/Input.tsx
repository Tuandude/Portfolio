import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && <label className="text-xs font-black uppercase text-[#18181B] tracking-wider">{label}</label>}
      <input
        className={`w-full px-4 py-2.5 bg-white text-[#18181B] font-bold rounded-2xl brutal-border brutal-shadow-sm focus:outline-none focus:brutal-shadow placeholder:text-gray-400 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-bold text-red-500">{error}</span>}
    </div>
  );
};
