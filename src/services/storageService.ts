/**
 * LocalStorage Service for MakTab Platform
 * Centralized data persistence layer
 */

// Storage Keys
export const STORAGE_KEYS = {
    // User & Settings
    USER_SETTINGS: 'maktab_user_settings',
    THEME: 'maktab_theme',
    LANGUAGE: 'maktab_language',

    // Audio & Recordings
    RECORDINGS: 'maktab_recordings',
    FEEDBACK_AUDIO: 'maktab_feedback_audio',
    AUDIO_ENABLED: 'maktab_audio_enabled', // Persistent audio session

    // Practice & Progress
    PRACTICE_LOGS: 'maktab_practice_logs',
    TAHFEEZ_PROGRESS: 'maktab_tahfeez_progress',

    // Quran
    QURAN_SETTINGS: 'maktab_quran_settings',
    BOOKMARKS: 'maktab_bookmarks',
    LAST_READ: 'maktab_last_read',
    QURAN_TEXT_CACHE: 'maktab_quran_text_cache', // Offline text cache
    DOWNLOADED_AUDIO: 'maktab_downloaded_audio', // Track downloaded audio

    // Notifications
    NOTIFICATIONS: 'maktab_notifications',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Generic Storage Functions
export const storage = {
    /**
     * Get item from localStorage with type safety
     */
    get<T>(key: StorageKey, defaultValue: T): T {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue;
            }
            return JSON.parse(item) as T;
        } catch (error) {
            console.warn(`Error reading from localStorage key "${key}":`, error);
            return defaultValue;
        }
    },

    /**
     * Set item in localStorage
     */
    set<T>(key: StorageKey, value: T): boolean {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
            return false;
        }
    },

    /**
     * Remove item from localStorage
     */
    remove(key: StorageKey): boolean {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
            return false;
        }
    },

    /**
     * Clear all MakTab data from localStorage
     */
    clearAll(): boolean {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Audio Storage Helpers (for storing audio blobs as Base64)
export const audioStorage = {
    /**
     * Convert audio blob to Base64 string for storage
     */
    async blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    /**
     * Convert Base64 string back to audio blob
     */
    base64ToBlob(base64: string, mimeType: string = 'audio/webm'): Blob {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    },

    /**
     * Save audio recording to localStorage
     */
    async saveRecording(id: string, blob: Blob, metadata: RecordingMetadata): Promise<boolean> {
        try {
            const base64 = await this.blobToBase64(blob);
            const recordings = storage.get<StoredRecording[]>(STORAGE_KEYS.RECORDINGS, []);

            const newRecording: StoredRecording = {
                id,
                base64,
                mimeType: blob.type,
                ...metadata,
                createdAt: new Date().toISOString(),
            };

            recordings.push(newRecording);
            return storage.set(STORAGE_KEYS.RECORDINGS, recordings);
        } catch (error) {
            console.error('Error saving recording:', error);
            return false;
        }
    },

    /**
     * Get audio recording from localStorage
     */
    getRecording(id: string): { blob: Blob; metadata: RecordingMetadata } | null {
        const recordings = storage.get<StoredRecording[]>(STORAGE_KEYS.RECORDINGS, []);
        const recording = recordings.find(r => r.id === id);

        if (!recording) return null;

        const blob = this.base64ToBlob(recording.base64, recording.mimeType);
        return {
            blob,
            metadata: {
                duration: recording.duration,
                surahName: recording.surahName,
                surahNumber: recording.surahNumber,
                type: recording.type,
            }
        };
    },

    /**
     * Get all recordings
     */
    getAllRecordings(): StoredRecording[] {
        return storage.get<StoredRecording[]>(STORAGE_KEYS.RECORDINGS, []);
    },

    /**
     * Delete a recording
     */
    deleteRecording(id: string): boolean {
        const recordings = storage.get<StoredRecording[]>(STORAGE_KEYS.RECORDINGS, []);
        const filtered = recordings.filter(r => r.id !== id);
        return storage.set(STORAGE_KEYS.RECORDINGS, filtered);
    }
};

// Types
export interface RecordingMetadata {
    duration: number; // in seconds
    surahName?: string;
    surahNumber?: number;
    type?: 'memorization' | 'revision' | 'recitation';
}

export interface StoredRecording extends RecordingMetadata {
    id: string;
    base64: string;
    mimeType: string;
    createdAt: string;
}

export interface UserSettings {
    notifications: boolean;
    darkMode: boolean;
    language: 'en' | 'ar' | 'ha';
    prayerReminders: boolean;
}

export interface QuranSettings {
    fontSize: number; // 16-32
    reciter: string;
    showTranslation: boolean;
    translationLanguage: 'en' | 'ha';
    readingMode: 'page' | 'continuous';
}

export interface Bookmark {
    id: string;
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    createdAt: string;
    note?: string;
}

// Default Values
export const DEFAULT_USER_SETTINGS: UserSettings = {
    notifications: true,
    darkMode: false,
    language: 'en',
    prayerReminders: true,
};

export const DEFAULT_QURAN_SETTINGS: QuranSettings = {
    fontSize: 18,
    reciter: 'mishary-rashid',
    showTranslation: false,
    translationLanguage: 'en',
    readingMode: 'page',
};
