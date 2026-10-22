import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Camera, Sparkles, Flame } from 'lucide-react';
import type { Habit } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BrutalCheckbox } from '../ui/BrutalCheckbox';
import { RetroHabitIcon } from '../ui/RetroHabitIcon';
import { CameraModal } from './CameraModal';
import { CreateHabitModal } from './CreateHabitModal';
import { SoundService } from '../../services/sound';

interface TasksTabProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onAddHabit: (
    title: string,
    category: Habit['category'],
    icon: string,
    targetDaysPerWeek?: number,
    reminderTime?: string
  ) => void;
  onCheckInPhoto: (habitId: string, imageUrl: string, note: string, voiceUrl?: string) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  habits,
  onToggleHabit,
  onAddHabit,
  onCheckInPhoto,
}) => {
  const [selectedHabitForCamera, setSelectedHabitForCamera] = useState<Habit | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Mechanical sound toggle without confetti
  const handleCheck = (habit: Habit) => {
    if (!habit.completedToday) {
      SoundService.playSuccess();
    } else {
      SoundService.playClick();
    }
    onToggleHabit(habit.id);
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-[#18181B] dark:text-[#F4F4F6] tracking-wide">
            Thói Quen Hôm Nay ⚡
          </h2>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
            {habits.filter((h) => h.completedToday).length}/{habits.length} hoàn thành
          </p>
        </div>

        <Button
          size="sm"
          variant="yellow"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 uppercase tracking-wider font-black text-xs"
        >
          <Plus size={16} strokeWidth={3.5} /> Thêm Mới
        </Button>
      </div>

      {/* Habit List with Retro Comic Stylings */}
      <div className="flex flex-col gap-3">
        {habits.map((habit) => (
          <motion.div
            key={habit.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`brutal-card rounded-2xl p-3.5 flex items-center justify-between transition-colors ${
              habit.completedToday
                ? 'bg-[#D8F3DC] dark:bg-[#153426]'
                : 'bg-white dark:bg-[#1E1E26]'
            }`}
          >
            <div className="flex items-center gap-3">
              <BrutalCheckbox
                checked={habit.completedToday}
                onChange={() => handleCheck(habit)}
                size="md"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#2A2A36] brutal-border brutal-shadow-sm flex items-center justify-center p-1">
                    <RetroHabitIcon name={habit.icon} size={26} />
                  </div>
                  <span
                    className={`font-black text-sm text-ink dark:text-dark-text uppercase tracking-tight ${
                      habit.completedToday ? 'line-through opacity-60 dark:opacity-50' : ''
                    }`}
                  >
                    {habit.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-0.5 text-xs font-black text-orange-600 dark:text-amber-400 bg-[#FFD166]/50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-[#18181B] dark:border-[#3E3E4C]">
                    <Flame size={13} fill="#FB923C" /> {habit.streakCount} ngày
                  </span>
                  <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase">
                    {habit.reminderTime || 'Hàng ngày'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Locket Cam Button */}
            <button
              onClick={() => setSelectedHabitForCamera(habit)}
              aria-label={`Chụp ảnh Locket xác nhận nhiệm vụ ${habit.title}`}
              className={`w-11 h-11 rounded-2xl brutal-border-3 brutal-shadow-sm flex items-center justify-center cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                habit.completedToday
                  ? 'bg-gray-100 text-ink dark:bg-[#2A2A36] dark:text-gray-300'
                  : 'bg-[#FF6B8B] text-white hover:scale-105'
              }`}
              title="Chụp ảnh Locket"
            >
              <Camera size={20} strokeWidth={2.5} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Tomorrow preview section - Comic Editorial Banner */}
      <div className="bg-[#FFF3B0] dark:bg-[#2A2617] rounded-3xl brutal-border-3 brutal-shadow p-4 relative overflow-hidden mt-2 border-[#18181B] dark:border-[#423C26]">
        <div
          className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#18181B 2px, transparent 2px)',
            backgroundSize: '10px 10px',
          }}
        />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#18181B] dark:text-[#FFD166]" />
            <span className="font-black text-xs uppercase tracking-wider text-[#18181B] dark:text-[#FFD166]">
              NHIỆM VỤ NGÀY MAI ⚡
            </span>
          </div>
          <Badge variant="dark">+50 XP BONUS</Badge>
        </div>
        <p className="text-xs font-black text-gray-800 dark:text-gray-200 mt-2 relative z-10 leading-relaxed">
          Duy trì đều đặn để giữ ngọn lửa Streak không bị đóng băng nhé! ❄️🔥
        </p>
      </div>

      {/* Camera Check-in Modal */}
      {selectedHabitForCamera && (
        <CameraModal
          isOpen={Boolean(selectedHabitForCamera)}
          onClose={() => setSelectedHabitForCamera(null)}
          habitTitle={selectedHabitForCamera.title}
          onCapture={(img, note, voiceUrl) => {
            onCheckInPhoto(selectedHabitForCamera.id, img, note, voiceUrl);
            if (!selectedHabitForCamera.completedToday) {
              onToggleHabit(selectedHabitForCamera.id);
            }
          }}
        />
      )}

      {/* Create Habit Modal */}
      <CreateHabitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddHabit={(title, category, icon, targetDaysPerWeek, reminderTime) => {
          onAddHabit(title, category, icon, targetDaysPerWeek, reminderTime);
        }}
      />
    </div>
  );
};
