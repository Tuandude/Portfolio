import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Camera, Sparkles, Flame } from 'lucide-react';
import type { Habit } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BrutalCheckbox } from '../ui/BrutalCheckbox';
import { RetroHabitIcon } from '../ui/RetroHabitIcon';
import { CameraModal } from './CameraModal';
import { SoundService } from '../../services/sound';

interface TasksTabProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onAddHabit: (title: string, category: Habit['category'], icon: string) => void;
  onCheckInPhoto: (habitId: string, imageUrl: string, note: string) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  habits,
  onToggleHabit,
  onAddHabit,
  onCheckInPhoto,
}) => {
  const [selectedHabitForCamera, setSelectedHabitForCamera] = useState<Habit | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory] = useState<Habit['category']>('health');
  const [newIcon, setNewIcon] = useState('✨');

  // Mechanical sound toggle without confetti
  const handleCheck = (habit: Habit) => {
    if (!habit.completedToday) {
      SoundService.playSuccess();
    } else {
      SoundService.playClick();
    }
    onToggleHabit(habit.id);
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddHabit(newTitle, newCategory, newIcon);
    setNewTitle('');
    setShowAddModal(false);
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
          onCapture={(img, note) => {
            onCheckInPhoto(selectedHabitForCamera.id, img, note);
            if (!selectedHabitForCamera.completedToday) {
              onToggleHabit(selectedHabitForCamera.id);
            }
          }}
        />
      )}

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#FDFBF7] dark:bg-[#1A1A20] brutal-border brutal-shadow-lg rounded-[32px] p-5 w-full max-w-sm flex flex-col gap-4">
            <h3 className="font-black text-lg text-[#18181B] dark:text-[#F4F4F6]">Thêm Thói Quen Mới ✨</h3>
            <form onSubmit={handleCreateHabit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Tên thói quen (vd: Uống nước, Yoga...)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-[#23232C] dark:text-white brutal-border rounded-xl text-sm font-bold placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
                autoFocus
              />

              <div className="flex gap-2">
                {[
                  { key: 'water', label: '💧 Nước' },
                  { key: 'book', label: '📖 Sách' },
                  { key: 'run', label: '🏃 Chạy' },
                  { key: 'meditate', label: '🧘 Thiền' },
                  { key: 'salad', label: '🥗 Healthy' },
                  { key: 'code', label: '💻 Code' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setNewIcon(item.key)}
                    className={`w-10 h-10 rounded-xl brutal-border flex items-center justify-center cursor-pointer transition-transform ${
                      newIcon === item.key
                        ? 'bg-[#FFD166] text-[#18181B] brutal-shadow-sm scale-105'
                        : 'bg-white dark:bg-[#23232C] hover:bg-gray-100 dark:hover:bg-[#2E2E38]'
                    }`}
                    title={item.label}
                  >
                    <RetroHabitIcon name={item.key} size={22} />
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowAddModal(false)}
                >
                  Huỷ
                </Button>
                <Button type="submit" variant="yellow" fullWidth>
                  Tạo Thói Quen
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
