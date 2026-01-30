import React, { useState, useEffect } from 'react';
import { X, Download, Check, Loader2, HardDrive, Volume2, CheckCircle } from 'lucide-react';
import {
    fetchVerseAudio,
    getFullAudioUrl,
    fetchAllChapters,
    fetchPageDataOfflineFirst,
    type Chapter
} from '../services/quranApi';
import {
    saveAudioBlob,
    getDownloadedChapters,
    getStorageUsage,
    deleteChapterAudio
} from '../services/indexedDbService';
import './DownloadManager.css';

interface DownloadManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

const RECITER_OPTIONS = [
    { id: 'mishary-rashid', name: 'Mishary Rashid Alafasy', apiId: 7 },
    { id: 'abdul-basit', name: 'Abdul Basit', apiId: 2 },
    { id: 'sudais', name: 'Abdur-Rahman as-Sudais', apiId: 3 },
    { id: 'husary', name: 'Mahmoud Khalil Al-Husary', apiId: 6 },
    { id: 'minshawi', name: 'Mohamed Siddiq al-Minshawi', apiId: 9 },
];

export const DownloadManager: React.FC<DownloadManagerProps> = ({ isOpen, onClose }) => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedReciter, setSelectedReciter] = useState(RECITER_OPTIONS[0]);
    const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
    const [downloadedChapters, setDownloadedChapters] = useState<number[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0, chapter: '', type: 'text' });
    const [storageInfo, setStorageInfo] = useState({ used: 0, quota: 0 });
    const [loadingChapters, setLoadingChapters] = useState(false);

    // New state for audio toggle and success popup
    const [includeAudio, setIncludeAudio] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Load chapters, downloaded chapters and storage info
    useEffect(() => {
        if (isOpen) {
            loadChapters();
            loadDownloadedChapters();
            loadStorageInfo();
            setShowSuccess(false);
        }
    }, [isOpen, selectedReciter]);

    const loadChapters = async () => {
        if (chapters.length > 0) return;
        setLoadingChapters(true);
        try {
            const data = await fetchAllChapters();
            setChapters(data);
        } catch (err) {
            console.error('Failed to load chapters:', err);
        } finally {
            setLoadingChapters(false);
        }
    };

    const loadDownloadedChapters = async () => {
        try {
            const downloaded = await getDownloadedChapters(selectedReciter.apiId);
            setDownloadedChapters(downloaded);
        } catch (err) {
            console.error('Failed to load downloaded chapters:', err);
        }
    };

    const loadStorageInfo = async () => {
        try {
            const info = await getStorageUsage();
            setStorageInfo(info);
        } catch (err) {
            console.error('Failed to load storage info:', err);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const toggleChapterSelection = (chapterId: number) => {
        setSelectedChapters(prev =>
            prev.includes(chapterId)
                ? prev.filter(id => id !== chapterId)
                : [...prev, chapterId]
        );
    };

    const handleDownload = async () => {
        // For text-only, download ALL chapters; for audio, use selected chapters
        const chaptersToDownload = includeAudio ? selectedChapters : chapters.map(c => c.id);

        if (chaptersToDownload.length === 0) return;

        setIsDownloading(true);
        setShowSuccess(false);

        let totalItems = 0;
        let downloadedItems = 0;

        // Calculate total items (pages for text, verses for audio)
        if (includeAudio) {
            chaptersToDownload.forEach(chapterId => {
                const chapter = chapters.find(c => c.id === chapterId);
                if (chapter) totalItems += chapter.verses_count;
            });
        } else {
            // Text-only: count pages (604 total pages in Quran)
            totalItems = 604;
        }

        setDownloadProgress({ current: 0, total: totalItems, chapter: '', type: 'text' });

        if (includeAudio) {
            // Audio mode: download selected chapters with audio
            for (const chapterId of chaptersToDownload) {
                const chapter = chapters.find(c => c.id === chapterId);
                if (!chapter) continue;

                setDownloadProgress(prev => ({ ...prev, chapter: chapter.name_simple, type: 'text' }));

                try {
                    // 1. Pre-cache text data for all pages in this chapter
                    const [startPage, endPage] = chapter.pages;
                    for (let p = startPage; p <= endPage; p++) {
                        await fetchPageDataOfflineFirst(p);
                        await new Promise(resolve => setTimeout(resolve, 5));
                    }

                    // 2. Download audio files for this chapter
                    setDownloadProgress(prev => ({ ...prev, type: 'audio' }));
                    const audioFiles = await fetchVerseAudio(selectedReciter.apiId, chapterId);

                    for (const audioFile of audioFiles) {
                        try {
                            const audioUrl = getFullAudioUrl(audioFile.url);
                            const response = await fetch(audioUrl);
                            const blob = await response.blob();

                            await saveAudioBlob(audioFile.verse_key, selectedReciter.apiId, blob);

                            downloadedItems++;
                            setDownloadProgress(prev => ({
                                ...prev,
                                current: downloadedItems
                            }));

                            await new Promise(resolve => setTimeout(resolve, 10));
                        } catch (err) {
                            console.error(`Failed to download audio for ${audioFile.verse_key}:`, err);
                            downloadedItems++;
                            setDownloadProgress(prev => ({ ...prev, current: downloadedItems }));
                        }
                    }
                } catch (err) {
                    console.error(`Failed to download chapter ${chapterId}:`, err);
                }
            }
        } else {
            // Text-only mode: download all 604 pages
            setDownloadProgress(prev => ({ ...prev, chapter: 'Full Quran', type: 'text' }));

            for (let page = 1; page <= 604; page++) {
                try {
                    await fetchPageDataOfflineFirst(page);
                    downloadedItems++;
                    setDownloadProgress(prev => ({ ...prev, current: downloadedItems }));

                    // Small delay to prevent overwhelming the browser
                    if (page % 10 === 0) {
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                } catch (err) {
                    console.error(`Failed to cache page ${page}:`, err);
                    downloadedItems++;
                    setDownloadProgress(prev => ({ ...prev, current: downloadedItems }));
                }
            }
        }

        setIsDownloading(false);
        setSelectedChapters([]);
        setShowSuccess(true);
        await loadDownloadedChapters();
        await loadStorageInfo();
    };

    const handleDeleteChapter = async (chapterId: number) => {
        try {
            await deleteChapterAudio(chapterId, selectedReciter.apiId);
            loadDownloadedChapters();
            loadStorageInfo();
        } catch (err) {
            console.error('Failed to delete chapter audio:', err);
        }
    };

    const progressPercent = downloadProgress.total > 0
        ? Math.round((downloadProgress.current / downloadProgress.total) * 100)
        : 0;

    // For text-only: always enable download (downloads all surahs)
    // For audio: require surah selection
    const canDownload = includeAudio
        ? (selectedChapters.length > 0 && !isDownloading && !loadingChapters)
        : (!isDownloading && !loadingChapters && chapters.length > 0);

    if (!isOpen) return null;

    return (
        <div className="download-manager-overlay">
            <div className="download-manager-modal">
                <div className="download-manager-header">
                    <h2>
                        <Download size={24} />
                        Download Quran for Offline
                    </h2>
                    <button className="close-btn" onClick={onClose} disabled={isDownloading}>
                        <X size={24} />
                    </button>
                </div>

                <div className="download-manager-content">
                    {/* Success Popup */}
                    {showSuccess && (
                        <div className="success-popup">
                            <CheckCircle size={48} className="success-icon" />
                            <h3>Download Complete!</h3>
                            <p>{includeAudio ? 'Your selected surahs are now available offline.' : 'The entire Quran text is now available offline.'}</p>
                            <button className="success-dismiss-btn" onClick={() => setShowSuccess(false)}>
                                Continue
                            </button>
                        </div>
                    )}

                    {!showSuccess && (
                        <>
                            {/* Storage Info */}
                            <div className="storage-info">
                                <HardDrive size={18} />
                                <span>Storage: {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.quota)}</span>
                            </div>

                            {/* Audio Toggle Switch */}
                            <div className="audio-toggle-section">
                                <div className="toggle-info">
                                    <Volume2 size={20} />
                                    <div>
                                        <span className="toggle-label">Download with Audio</span>
                                        <span className="toggle-hint">
                                            {includeAudio ? 'Select surahs and reciter below' : 'Text only - downloads entire Quran'}
                                        </span>
                                    </div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={includeAudio}
                                        onChange={(e) => setIncludeAudio(e.target.checked)}
                                        disabled={isDownloading}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            {/* Download Progress */}
                            {isDownloading && (
                                <div className="download-progress">
                                    <div className="progress-header">
                                        <Loader2 size={18} className="spinning" />
                                        <span>
                                            {downloadProgress.type === 'text' ? 'Downloading Text...' : 'Downloading Audio...'}
                                            ({downloadProgress.chapter})
                                        </span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <div className="progress-text">
                                        {downloadProgress.current} / {downloadProgress.total} {includeAudio ? 'verses' : 'pages'} ({progressPercent}%)
                                    </div>
                                </div>
                            )}

                            {/* Audio-only section: Reciter and Surah Selection */}
                            {includeAudio && (
                                <>
                                    {/* Reciter Selection */}
                                    <div className="reciter-selection">
                                        <label>Select Reciter (Imam):</label>
                                        <select
                                            value={selectedReciter.id}
                                            onChange={(e) => {
                                                const reciter = RECITER_OPTIONS.find(r => r.id === e.target.value);
                                                if (reciter) setSelectedReciter(reciter);
                                            }}
                                            disabled={isDownloading}
                                        >
                                            {RECITER_OPTIONS.map(reciter => (
                                                <option key={reciter.id} value={reciter.id}>
                                                    {reciter.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Chapter Selection */}
                                    <div className="chapter-selection">
                                        <div className="chapter-selection-header">
                                            <label>Select Surahs to Download:</label>
                                            <div className="select-all-btns">
                                                <button
                                                    className="select-all-btn"
                                                    onClick={() => {
                                                        const notDownloaded = chapters
                                                            .filter(c => !downloadedChapters.includes(c.id))
                                                            .map(c => c.id);
                                                        setSelectedChapters(notDownloaded);
                                                    }}
                                                    disabled={isDownloading || loadingChapters}
                                                >
                                                    Select All
                                                </button>
                                                <button
                                                    className="select-all-btn"
                                                    onClick={() => setSelectedChapters([])}
                                                    disabled={isDownloading || loadingChapters}
                                                >
                                                    Deselect All
                                                </button>
                                            </div>
                                        </div>

                                        {loadingChapters ? (
                                            <div className="loading-chapters">
                                                <Loader2 size={24} className="spinning" />
                                                <span>Loading Surahs...</span>
                                            </div>
                                        ) : (
                                            <div className="chapter-grid">
                                                {chapters.map(chapter => {
                                                    const isDownloaded = downloadedChapters.includes(chapter.id);
                                                    const isSelected = selectedChapters.includes(chapter.id);

                                                    return (
                                                        <div
                                                            key={chapter.id}
                                                            className={`chapter-item ${isSelected ? 'selected' : ''} ${isDownloaded ? 'downloaded' : ''}`}
                                                            onClick={() => !isDownloading && !isDownloaded && toggleChapterSelection(chapter.id)}
                                                        >
                                                            <span className="chapter-number">{chapter.id}</span>
                                                            <span className="chapter-name">{chapter.name_simple}</span>
                                                            {isDownloaded && (
                                                                <button
                                                                    className="delete-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteChapter(chapter.id);
                                                                    }}
                                                                    title="Delete downloaded audio"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            )}
                                                            {isDownloaded && <Check size={16} className="downloaded-icon" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Text-only info message */}
                            {!includeAudio && !isDownloading && (
                                <div className="text-only-info">
                                    <p>Click download to cache the entire Quran text (604 pages) for offline reading.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {!showSuccess && (
                    <div className="download-manager-footer">
                        <button
                            className="download-btn"
                            onClick={handleDownload}
                            disabled={!canDownload}
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 size={18} className="spinning" />
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    {includeAudio
                                        ? `Download ${selectedChapters.length > 0 ? `(${selectedChapters.length} surahs)` : ''}`
                                        : 'Download Full Quran Text'
                                    }
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DownloadManager;
