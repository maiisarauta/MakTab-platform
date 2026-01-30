/**
 * IndexedDB Service for MakTab Platform
 * Handles offline storage of Quran audio files
 */

const DB_NAME = 'MakTabQuranDB';
const DB_VERSION = 1;
const AUDIO_STORE = 'quranAudio';
const TEXT_STORE = 'quranText';

interface AudioRecord {
    id: string; // Format: "reciterId-verseKey" e.g., "7-1:1"
    reciterId: number;
    chapterId: number;
    verseKey: string;
    audioBlob: Blob;
    downloadedAt: string;
}

interface TextRecord {
    id: string; // Format: "page-{pageNumber}-{lang}"
    pageNumber: number;
    lang: string;
    data: unknown; // The QuranPageData
    cachedAt: string;
}

interface DownloadProgress {
    chapterId: number;
    reciterId: string;
    totalVerses: number;
    downloadedVerses: number;
    status: 'pending' | 'downloading' | 'complete' | 'error';
}

let db: IDBDatabase | null = null;

/**
 * Initialize the IndexedDB database
 */
export async function initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Failed to open IndexedDB:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('IndexedDB initialized successfully');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            // Create audio store with indexes
            if (!database.objectStoreNames.contains(AUDIO_STORE)) {
                const audioStore = database.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
                audioStore.createIndex('reciterId', 'reciterId', { unique: false });
                audioStore.createIndex('chapterId', 'chapterId', { unique: false });
                audioStore.createIndex('verseKey', 'verseKey', { unique: false });
                audioStore.createIndex('reciterChapter', ['reciterId', 'chapterId'], { unique: false });
            }

            // Create text cache store
            if (!database.objectStoreNames.contains(TEXT_STORE)) {
                const textStore = database.createObjectStore(TEXT_STORE, { keyPath: 'id' });
                textStore.createIndex('pageNumber', 'pageNumber', { unique: true });
            }
        };
    });
}

/**
 * Save audio blob to IndexedDB
 */
export async function saveAudioBlob(
    verseKey: string,
    reciterId: number,
    audioBlob: Blob
): Promise<void> {
    const database = await initDB();
    const chapterId = parseInt(verseKey.split(':')[0]);
    const id = `${reciterId}-${verseKey}`;

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([AUDIO_STORE], 'readwrite');
        const store = transaction.objectStore(AUDIO_STORE);

        const record: AudioRecord = {
            id,
            reciterId,
            chapterId,
            verseKey,
            audioBlob,
            downloadedAt: new Date().toISOString()
        };

        const request = store.put(record);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get audio blob from IndexedDB
 */
export async function getAudioBlob(
    verseKey: string,
    reciterId: number
): Promise<Blob | null> {
    const database = await initDB();
    const id = `${reciterId}-${verseKey}`;

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([AUDIO_STORE], 'readonly');
        const store = transaction.objectStore(AUDIO_STORE);
        const request = store.get(id);

        request.onsuccess = () => {
            const record = request.result as AudioRecord | undefined;
            resolve(record?.audioBlob || null);
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Check if audio is downloaded for a verse
 */
export async function hasAudioDownloaded(
    verseKey: string,
    reciterId: number
): Promise<boolean> {
    const blob = await getAudioBlob(verseKey, reciterId);
    return blob !== null;
}

/**
 * Get all downloaded verses for a chapter and reciter
 */
export async function getDownloadedVersesForChapter(
    chapterId: number,
    reciterId: number
): Promise<string[]> {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([AUDIO_STORE], 'readonly');
        const store = transaction.objectStore(AUDIO_STORE);
        const index = store.index('reciterChapter');
        const request = index.getAll([reciterId, chapterId]);

        request.onsuccess = () => {
            const records = request.result as AudioRecord[];
            resolve(records.map(r => r.verseKey));
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get list of chapters that have been fully downloaded for a reciter
 */
export async function getDownloadedChapters(reciterId: number): Promise<number[]> {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([AUDIO_STORE], 'readonly');
        const store = transaction.objectStore(AUDIO_STORE);
        const index = store.index('reciterId');
        const request = index.getAll(reciterId);

        request.onsuccess = () => {
            const records = request.result as AudioRecord[];
            const chapterCounts = new Map<number, number>();

            records.forEach(r => {
                chapterCounts.set(r.chapterId, (chapterCounts.get(r.chapterId) || 0) + 1);
            });

            // Return chapters that have significant downloads (at least 1 verse)
            const downloadedChapters = Array.from(chapterCounts.keys());
            resolve(downloadedChapters.sort((a, b) => a - b));
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delete all audio for a chapter and reciter
 */
export async function deleteChapterAudio(
    chapterId: number,
    reciterId: number
): Promise<void> {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([AUDIO_STORE], 'readwrite');
        const store = transaction.objectStore(AUDIO_STORE);
        const index = store.index('reciterChapter');
        const request = index.openCursor([reciterId, chapterId]);

        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            } else {
                resolve();
            }
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Save page text data to cache
 */
export async function savePageData(
    pageNumber: number,
    data: unknown,
    lang: string = 'en'
): Promise<void> {
    const database = await initDB();
    const id = `page-${pageNumber}-${lang}`;

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([TEXT_STORE], 'readwrite');
        const store = transaction.objectStore(TEXT_STORE);

        const record: TextRecord = {
            id,
            pageNumber,
            lang,
            data,
            cachedAt: new Date().toISOString()
        };

        const request = store.put(record);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get cached page text data
 */
export async function getPageData(pageNumber: number, lang: string = 'en'): Promise<unknown | null> {
    const database = await initDB();
    const id = `page-${pageNumber}-${lang}`;

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([TEXT_STORE], 'readonly');
        const store = transaction.objectStore(TEXT_STORE);
        const request = store.get(id);

        request.onsuccess = () => {
            const record = request.result as TextRecord | undefined;
            resolve(record?.data || null);
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get storage usage estimate
 */
export async function getStorageUsage(): Promise<{ used: number; quota: number }> {
    if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        return {
            used: estimate.usage || 0,
            quota: estimate.quota || 0
        };
    }
    return { used: 0, quota: 0 };
}

/**
 * Clear all cached data
 */
export async function clearAllCache(): Promise<void> {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([AUDIO_STORE, TEXT_STORE], 'readwrite');

        transaction.objectStore(AUDIO_STORE).clear();
        transaction.objectStore(TEXT_STORE).clear();

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

export type { AudioRecord, TextRecord, DownloadProgress };
