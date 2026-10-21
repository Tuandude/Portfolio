import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Camera, Sparkles, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Habit } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BrutalCheckbox } from '../ui/BrutalCheckbox';
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

  // Trigger confetti and toggle
  const handleCheck = (habit: Habit) => {
    if (!habit.completedToday) {
      SoundService.playSuccess();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF6B8B', '#FFD166', '#3A86FF', '#52B788'],
      });
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
          <h2 className="text-xl font-black text-[#18181B] tracking-wide">
            Thói Quen Hôm Nay ⚡
          </h2>
          <p className="text-xs font-bold text-gray-500">
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
            className={`brutal-card rounded-2xl p-3.5 flex items-center justify-between transition-colors border-[3px] border-[#18181B] ${
              habit.completedToday ? 'bg-[#D8F3DC]' : 'bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <BrutalCheckbox
                checked={habit.completedToday}
                onChange={() => handleCheck(habit)}
                size="md"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl drop-shadow-[1px_1px_0px_#18181B]">{habit.icon}</span>
                  <span
                    className={`font-black text-sm text-[#18181B] uppercase tracking-tight ${
                      habit.completedToday ? 'line-through opacity-70' : ''
                    }`}
                  >
                    {habit.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-0.5 text-xs font-black text-orange-600 bg-[#FFD166]/50 px-2 py-0.5 rounded-md border border-[#18181B]">
                    <Flame size={13} fill="#FB923C" /> {habit.streakCount} ngày
                  </span>
                  <span className="text-[10px] font-black text-gray-500 uppercase">
                    {habit.reminderTime || 'Hàng ngày'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Locket Cam Button */}
            <button
              onClick={() => setSelectedHabitForCamera(habit)}
              className={`w-11 h-11 rounded-2xl brutal-border-3 brutal-shadow-sm flex items-center justify-center cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                habit.completedToday ? 'bg-gray-100 text-[#18181B]' : 'bg-[#FF6B8B] text-white hover:scale-105'
              }`}
              title="Chụp ảnh Locket"
            >
              <Camera size={20} strokeWidth={2.5} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Tomorrow preview section - Comic Editorial Banner */}
      <div className="bg-[#FFF3B0] rounded-3xl brutal-border-3 brutal-shadow p-4 relative overflow-hidden mt-2">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#18181B 2px, transparent 2px)',
            backgroundSize: '10px 10px',
          }}
        />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#18181B]" />
            <span className="font-black text-xs uppercase tracking-wider text-[#18181B]">
              NHIỆM VỤ NGÀY MAI ⚡
            </span>
          </div>
          <Badge variant="dark">+50 XP BONUS</Badge>
        </div>
        <p className="text-xs font-black text-gray-800 mt-2 relative z-10 leading-relaxed">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FDFBF7] brutal-border brutal-shadow-lg rounded-[32px] p-5 w-full max-w-sm flex flex-col gap-4">
            <h3 className="font-black text-lg text-[#18181B]">Thêm Thói Quen Mới ✨</h3>
            <form onSubmit={handleCreateHabit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Tên thói quen (vd: Uống nước, Yoga...)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-white brutal-border rounded-xl text-sm font-bold placeholder:text-gray-400 focus:outline-none"
                autoFocus
              />

              <div className="flex gap-2">
                {['💧', '📖', '🏃', '🧘', '🥗', '💻'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewIcon(emoji)}
                    className={`w-9 h-9 rounded-xl brutal-border text-lg flex items-center justify-center cursor-pointer ${
                      newIcon === emoji ? 'bg-[#FFD166] brutal-shadow-sm' : 'bg-white'
                    }`}
                  >
                    {emoji}
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
