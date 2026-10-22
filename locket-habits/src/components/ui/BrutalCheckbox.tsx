import React from 'react';
import { Check } from 'lucide-react';
import { SoundService } from '../../services/sound';
import { HapticService } from '../../services/haptic';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'md' | 'lg';
  className?: string;
}

export const BrutalCheckbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  const handleClick = () => {
    if (!checked) {
      HapticService.checkboxComplete();
    } else {
      SoundService.playClick();
    }
    onChange(!checked);
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={handleClick}
      className={`${sizeClasses} rounded-xl brutal-border flex items-center justify-center transition-all cursor-pointer ${
        checked ? 'bg-[#52B788] brutal-shadow-sm text-white' : 'bg-white hover:bg-gray-100'
      } ${className}`}
    >
      {checked && <Check strokeWidth={3.5} className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
    </button>
  );
};
