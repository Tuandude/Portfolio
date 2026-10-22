// Notification service for habit reminders
export const NotificationService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    return await Notification.requestPermission();
  },

  sendNotification(title: string, body: string, icon: string = '/favicon.svg') {
    if (!this.isSupported() || Notification.permission !== 'granted') return;
    try {
      new Notification(title, {
        body,
        icon,
        badge: '/favicon.svg',
      });
    } catch {
      // ignore
    }
  },

  checkAndNotifyHabits(habits: Array<{ id: string; title: string; reminderTime?: string; completedToday: boolean }>) {
    if (!this.isSupported() || Notification.permission !== 'granted') return;
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    habits.forEach((h) => {
      if (h.reminderTime === currentTimeStr && !h.completedToday) {
        this.sendNotification(
          `⚡ Đã đến giờ: ${h.title}!`,
          'Bảo vệ ngọn lửa Streak của bạn bằng cách check-in Locket ngay bây giờ!'
        );
      }
    });
  },
};
