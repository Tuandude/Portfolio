import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../services/storage';

describe('StorageService – extended coverage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ---- addPost ----
  describe('addPost', () => {
    it('prepends a new post and awards 15 XP', () => {
      const initialXP = StorageService.getProfile().xp;
      const post = StorageService.addPost({
        habitId: 'h1',
        habitTitle: 'Uống nước',
        imageUrl: 'https://example.com/photo.jpg',
        note: 'Done!',
        authorName: 'Tester',
        authorAvatar: '',
        isFriend: false,
      });

      const posts = StorageService.getPosts();
      expect(posts[0].id).toBe(post.id);
      expect(StorageService.getProfile().xp).toBe(initialXP + 15);
    });

    it('sets timestamp to "Vừa xong" and seeds initial ❤️ reaction', () => {
      const post = StorageService.addPost({
        habitId: 'h2',
        habitTitle: 'Đọc sách',
        imageUrl: 'https://example.com/img.jpg',
        note: 'Nice',
        authorName: 'User',
        authorAvatar: '',
        isFriend: false,
      });

      expect(post.timestamp).toBe('Vừa xong');
      expect(post.reactions['❤️']).toBe(1);
    });

    it('sets hasVoiceNote=true when voiceUrl is provided', () => {
      const post = StorageService.addPost({
        habitId: 'h3',
        habitTitle: 'Chạy bộ',
        imageUrl: 'https://example.com/img.jpg',
        note: '',
        authorName: 'User',
        authorAvatar: '',
        isFriend: false,
        voiceUrl: 'data:audio/webm;base64,abc',
      });

      expect(post.hasVoiceNote).toBe(true);
    });

    it('sets hasVoiceNote=false when no voice data', () => {
      const post = StorageService.addPost({
        habitId: 'h1',
        habitTitle: 'Thiền',
        imageUrl: 'https://example.com/img.jpg',
        note: '',
        authorName: 'User',
        authorAvatar: '',
        isFriend: false,
      });

      expect(post.hasVoiceNote).toBe(false);
    });
  });

  // ---- addReaction ----
  describe('addReaction', () => {
    it('increments an existing reaction count', () => {
      const post = StorageService.addPost({
        habitId: 'h1',
        habitTitle: 'Water',
        imageUrl: 'https://example.com/img.jpg',
        note: '',
        authorName: 'User',
        authorAvatar: '',
        isFriend: false,
      });

      StorageService.addReaction(post.id, '🔥');
      const updated = StorageService.getPosts().find((p) => p.id === post.id);
      expect(updated?.reactions['🔥']).toBe(1);

      StorageService.addReaction(post.id, '🔥');
      const updated2 = StorageService.getPosts().find((p) => p.id === post.id);
      expect(updated2?.reactions['🔥']).toBe(2);
    });

    it('returns null for a non-existent post id', () => {
      const result = StorageService.addReaction('does-not-exist', '💥');
      expect(result).toBeNull();
    });
  });

  // ---- addFriendCode / removeFriendCode ----
  describe('addFriendCode', () => {
    it('adds a valid friend code and returns true', () => {
      const added = StorageService.addFriendCode('LK-ABCD');
      expect(added).toBe(true);
      expect(StorageService.getProfile().friendCodes).toContain('LK-ABCD');
    });

    it('normalises the code to upper-case before storing', () => {
      StorageService.addFriendCode('lk-wxyz');
      expect(StorageService.getProfile().friendCodes).toContain('LK-WXYZ');
    });

    it('rejects a duplicate friend code', () => {
      StorageService.addFriendCode('LK-DUPE');
      const second = StorageService.addFriendCode('LK-DUPE');
      expect(second).toBe(false);
      // Still only one entry
      expect(StorageService.getProfile().friendCodes.filter((c) => c === 'LK-DUPE').length).toBe(1);
    });

    it("rejects the user's own invite code", () => {
      const ownCode = StorageService.getProfile().inviteCode;
      const result = StorageService.addFriendCode(ownCode);
      expect(result).toBe(false);
    });

    it('rejects an empty string', () => {
      const result = StorageService.addFriendCode('');
      expect(result).toBe(false);
    });
  });

  describe('removeFriendCode', () => {
    it('removes an existing friend code', () => {
      StorageService.addFriendCode('LK-RMVE');
      StorageService.removeFriendCode('LK-RMVE');
      expect(StorageService.getProfile().friendCodes).not.toContain('LK-RMVE');
    });

    it('is a no-op for a code that was never added', () => {
      // Should not throw
      expect(() => StorageService.removeFriendCode('LK-NONE')).not.toThrow();
    });
  });
});
