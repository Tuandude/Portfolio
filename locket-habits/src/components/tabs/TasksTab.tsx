import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Camera, Sparkles, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Habit } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
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
          className="flex items-center gap-1"
        >
          <Plus size={16} strokeWidth={3} /> Thêm Mới
        </Button>
      </div>

      {/* Habit List */}
      <div className="flex flex-col gap-3">
        {habits.map((habit) => (
          <motion.div
            key={habit.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`brutal-card rounded-2xl p-3.5 flex items-center justify-between transition-colors ${
              habit.completedToday ? 'bg-[#D8F3DC]/60' : 'bg-white'
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
                  <span className="text-lg">{habit.icon}</span>
                  <span
                    className={`font-black text-sm text-[#18181B] ${
                      habit.completedToday ? 'line-through opacity-70' : ''
                    }`}
                  >
                    {habit.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-0.5 text-xs font-black text-orange-500">
                    <Flame size={13} fill="#FB923C" /> {habit.streakCount} ngày
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">
                    {habit.reminderTime || 'Hàng ngày'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Locket Cam Button */}
            <Button
              size="sm"
              variant={habit.completedToday ? 'secondary' : 'pink'}
              onClick={() => setSelectedHabitForCamera(habit)}
              className="p-2 aspect-square rounded-xl cursor-pointer"
              title="Chụp ảnh Locket"
            >
              <Camera size={16} strokeWidth={2.5} />
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Tomorrow preview section */}
      <Card variant="yellow" className="mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#18181B]" />
            <span className="font-black text-xs uppercase tracking-wider text-[#18181B]">
              Nhiệm Vụ Ngày Mai
            </span>
          </div>
          <Badge variant="dark">+50 XP Bonus</Badge>
        </div>
        <p className="text-xs font-bold text-gray-700 mt-2">
          Duy trì đều đặn để giữ ngọn lửa Streak không bị đóng băng nhé! ❄️🔥
        </p>
      </Card>

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
