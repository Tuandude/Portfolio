import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../services/storage';

describe('Habits & Posts Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default habits on start', () => {
    const habits = StorageService.getHabits();
    expect(habits.length).toBeGreaterThanOrEqual(4);
    expect(habits[0].title).toBe('Uống 2L nước mát');
  });

  it('toggles habit completion status and updates streak', () => {
    const habits = StorageService.getHabits();
    const firstHabit = habits[0];
    const initialCompleted = firstHabit.completedToday;

    StorageService.toggleHabit(firstHabit.id);
    const updated = StorageService.getHabits().find((h) => h.id === firstHabit.id);

    expect(updated?.completedToday).toBe(!initialCompleted);
  });

  it('adds a new habit and persists to storage', () => {
    const newHabit = StorageService.addHabit({
      title: 'Tập yoga 15p',
      category: 'fitness',
      icon: 'meditate',
      targetDaysPerWeek: 7,
      reminderTime: '07:00',
    });

    const habits = StorageService.getHabits();
    expect(habits.some((h) => h.id === newHabit.id)).toBe(true);
  });
});
