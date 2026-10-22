// Native IndexedDB wrapper for Locket Habits image and post offline storage
const DB_NAME = 'LocketHabitsDB';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredPhoto {
  id: string;
  dataUrl: string;
  createdAt: number;
}

export const PhotoDB = {
  async savePhoto(id: string, dataUrl: string): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const item: StoredPhoto = { id, dataUrl, createdAt: Date.now() };
        store.put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('Fallback to memory for savePhoto:', e);
    }
  },

  async getPhoto(id: string): Promise<string | null> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => {
          resolve(request.result?.dataUrl || null);
        };
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  async getAllPhotos(): Promise<Record<string, string>> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => {
          const map: Record<string, string> = {};
          (request.result as StoredPhoto[]).forEach((item) => {
            map[item.id] = item.dataUrl;
          });
          resolve(map);
        };
        request.onerror = () => resolve({});
      });
    } catch {
      return {};
    }
  },

  async deletePhoto(id: string): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // ignore
    }
  },
};
