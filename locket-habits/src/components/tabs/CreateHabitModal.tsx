import React, { useState } from 'react';
import { X, Clock, Calendar, Bell, Sparkles } from 'lucide-react';
import type { Habit } from '../../types';
import { Button } from '../ui/Button';
import { RetroHabitIcon } from '../ui/RetroHabitIcon';
import { SoundService } from '../../services/sound';
import { HapticService } from '../../services/haptic';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (
    title: string,
    category: Habit['category'],
    icon: string,
    targetDaysPerWeek?: number,
    reminderTime?: string
  ) => void;
}

const RETRO_ICON_OPTIONS = [
  { key: 'water', label: 'Uống nước', category: 'health' as const },
  { key: 'gym', label: 'Tập gym / Tạ', category: 'fitness' as const },
  { key: 'run', label: 'Chạy bộ', category: 'fitness' as const },
  { key: 'book', label: 'Đọc sách', category: 'learning' as const },
  { key: 'code', label: 'Lập trình', category: 'learning' as const },
  { key: 'meditate', label: 'Thiền / Yoga', category: 'mind' as const },
  { key: 'salad', label: 'Ăn lành mạnh', category: 'health' as const },
  { key: 'sleep', label: 'Ngủ sớm', category: 'health' as const },
  { key: 'sparkle', label: 'Tự do', category: 'other' as const },
];

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  isOpen,
  onClose,
  onAddHabit,
}) => {
  const [title, setTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('water');
  const [category, setCategory] = useState<Habit['category']>('health');
  const [targetDays, setTargetDays] = useState(7);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [enableReminder, setEnableReminder] = useState(true);

  if (!isOpen) return null;

  const handleSelectIcon = (key: string, cat: Habit['category']) => {
    SoundService.playClick();
    HapticService.checkboxComplete();
    setSelectedIcon(key);
    setCategory(cat);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    SoundService.playSuccess();
    HapticService.shutterClick();

    onAddHabit(
      title.trim(),
      category,
      selectedIcon,
      targetDays,
      enableReminder ? reminderTime : undefined
    );

    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-sm bg-[#FDFBF7] dark:bg-[#1E1E24] brutal-border-3 brutal-shadow-lg rounded-[32px] p-5 flex flex-col gap-4 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-white dark:bg-[#27272A] text-[#18181B] dark:text-white brutal-border rounded-xl font-black hover:bg-[#FF6B8B] hover:text-white transition-all cursor-pointer"
        >
          <X size={16} strokeWidth={3} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFD166] text-[#18181B] brutal-border flex items-center justify-center">
            <Sparkles size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-black text-base text-[#18181B] dark:text-[#F4F4F6] uppercase tracking-wide">
              Thói Quen Mới
            </h3>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
              Khởi tạo mục tiêu Locket mỗi ngày
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Habit Title Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">
              Tên Thói Quen
            </label>
            <input
              type="text"
              placeholder="Vd: Chạy bộ 3km, Uống 2L nước..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#23232C] dark:text-white brutal-border rounded-xl text-sm font-bold placeholder:text-gray-400 focus:outline-none"
              autoFocus
              maxLength={40}
            />
          </div>

          {/* Retro Vector Icon Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">
              Chọn Biểu Tượng Retro Comic
            </label>
            <div className="grid grid-cols-5 gap-2">
              {RETRO_ICON_OPTIONS.map((item) => {
                const isSelected = selectedIcon === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelectIcon(item.key, item.category)}
                    className={`h-11 rounded-xl brutal-border flex items-center justify-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#FFD166] ring-2 ring-[#FF5400] brutal-shadow-sm scale-105'
                        : 'bg-white dark:bg-[#23232C] hover:bg-gray-50'
                    }`}
                    title={item.label}
                  >
                    <RetroHabitIcon name={item.key} size={24} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Frequency */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider flex items-center gap-1">
                <Calendar size={13} /> Mục Tiêu Tuần
              </label>
              <span className="text-[11px] font-black text-[#FF5400]">
                {targetDays === 7 ? 'Cả tuần (7/7 ngày)' : `${targetDays} ngày / tuần`}
              </span>
            </div>
            <div className="flex gap-1.5">
              {[3, 5, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => {
                    SoundService.playClick();
                    setTargetDays(days);
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    targetDays === days
                      ? 'bg-[#3A86FF] text-white brutal-border brutal-shadow-sm'
                      : 'bg-white dark:bg-[#23232C] text-gray-600 dark:text-gray-300 brutal-border'
                  }`}
                >
                  {days === 7 ? 'Mỗi ngày' : `${days} ngày`}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder Time Picker */}
          <div className="flex flex-col gap-1.5 bg-[#FFF3B0] dark:bg-[#2A2617] p-3 rounded-2xl brutal-border">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-[#18181B] dark:text-[#FFD166] tracking-wider flex items-center gap-1">
                <Bell size={13} /> Giờ Nhắc Check-in
              </label>
              <button
                type="button"
                onClick={() => setEnableReminder(!enableReminder)}
                className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border border-[#18181B] cursor-pointer ${
                  enableReminder ? 'bg-[#52B788] text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {enableReminder ? 'Bật' : 'Tắt'}
              </button>
            </div>

            {enableReminder && (
              <div className="flex items-center gap-2 mt-1">
                <Clock size={16} className="text-[#18181B] dark:text-[#FFD166]" />
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-[#1E1E24] dark:text-white brutal-border rounded-xl text-xs font-black"
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 mt-1">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="yellow"
              fullWidth
              disabled={!title.trim()}
              className="bg-[#FFD166] text-[#18181B]"
            >
              Tạo Ngay ⚡
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
