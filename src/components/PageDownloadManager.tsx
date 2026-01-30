import React, { useState, useEffect } from 'react';
import { X, Download, Loader2, CheckCircle, Check } from 'lucide-react';
import {
    fetchVerseAudio,
    getFullAudioUrl,
    fetchAllChapters,
    type Chapter
} from '../services/quranApi';
import {
    saveAudioBlob,
    getStorageUsage,
    getDownloadedChapters,
} from '../services/indexedDbService';
import './DownloadManager.css';

interface PageDownloadManagerProps {
    isOpen: boolean;
    onClose: () => void;
    chaptersOnPage: { id: number; name: string; nameArabic: string }[];
}

const RECITER_OPTIONS = [
    { id: 'mishary-rashid', name: 'Mishary Rashid Alafasy', apiId: 7 },
    { id: 'abdul-basit', name: 'Abdul Basit', apiId: 2 },
    { id: 'sudais', name: 'Abdur-Rahman as-Sudais', apiId: 3 },
    { id: 'husary', name: 'Mahmoud Khalil Al-Husary', apiId: 6 },
    { id: 'minshawi', name: 'Mohamed Siddiq al-Minshawi', apiId: 9 },
];

export const PageDownloadManager: React.FC<PageDownloadManagerProps> = ({ isOpen, onClose, chaptersOnPage }) => {
    const [allChapters, setAllChapters] = useState<Chapter[]>([]);
    const [selectedReciter, setSelectedReciter] = useState(RECITER_OPTIONS[0]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0, chapter: '' });
    const [showSuccess, setShowSuccess] = useState(false);
    const [storageInfo, setStorageInfo] = useState({ used: 0, quota: 0 });
    const [downloadedChapters, setDownloadedChapters] = useState<number[]>([]);

    // Load all chapters, downloaded status, and storage info
    useEffect(() => {
        if (isOpen) {
            loadChapters();
            loadStorageInfo();
            loadDownloadedChapters();
            setShowSuccess(false);
        }
    }, [isOpen, selectedReciter]);

    const loadChapters = async () => {
        try {
            const data = await fetchAllChapters();
            setAllChapters(data);
        } catch (err) {
            console.error('Failed to load chapters:', err);
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

    // Check which chapters need to be downloaded (not already downloaded)
    const chaptersToDownload = chaptersOnPage.filter(c => !downloadedChapters.includes(c.id));
    const allDownloaded = chaptersToDownload.length === 0 && chaptersOnPage.length > 0;

    const handleDownload = async () => {
        if (chaptersToDownload.length === 0) return;

        setIsDownloading(true);
        setShowSuccess(false);

        let totalVerses = 0;
        let downloadedVerses = 0;

        // Calculate total verses to download (only for chapters not yet downloaded)
        for (const pageChapter of chaptersToDownload) {
            const fullChapter = allChapters.find(c => c.id === pageChapter.id);
            if (fullChapter) {
                totalVerses += fullChapter.verses_count;
            }
        }

        setDownloadProgress({ current: 0, total: totalVerses, chapter: '' });

        // Download audio for each chapter that needs downloading
        for (const pageChapter of chaptersToDownload) {
            const fullChapter = allChapters.find(c => c.id === pageChapter.id);
            if (!fullChapter) continue;

            setDownloadProgress(prev => ({ ...prev, chapter: pageChapter.name }));

            try {
                const audioFiles = await fetchVerseAudio(selectedReciter.apiId, pageChapter.id);

                for (const audioFile of audioFiles) {
                    try {
                        const audioUrl = getFullAudioUrl(audioFile.url);
                        const response = await fetch(audioUrl);
                        const blob = await response.blob();

                        await saveAudioBlob(audioFile.verse_key, selectedReciter.apiId, blob);

                        downloadedVerses++;
                        setDownloadProgress(prev => ({
                            ...prev,
                            current: downloadedVerses
                        }));

                        await new Promise(resolve => setTimeout(resolve, 10));
                    } catch (err) {
                        console.error(`Failed to download audio for ${audioFile.verse_key}:`, err);
                        downloadedVerses++;
                        setDownloadProgress(prev => ({ ...prev, current: downloadedVerses }));
                    }
                }
            } catch (err) {
                console.error(`Failed to download chapter ${pageChapter.id}:`, err);
            }
        }

        setIsDownloading(false);
        setShowSuccess(true);
        await loadStorageInfo();
        await loadDownloadedChapters();
    };

    const progressPercent = downloadProgress.total > 0
        ? Math.round((downloadProgress.current / downloadProgress.total) * 100)
        : 0;

    if (!isOpen) return null;

    const surahNames = chaptersOnPage.map(c => c.name).join(', ');

    return (
        <div className="download-manager-overlay">
            <div className="download-manager-modal page-download-modal">
                <div className="download-manager-header">
                    <h2>
                        <Download size={24} />
                        Download Audio
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
                            <p>Audio for {surahNames} is now available offline.</p>
                            <button className="success-dismiss-btn" onClick={onClose}>
                                Done
                            </button>
                        </div>
                    )}

                    {!showSuccess && (
                        <>
                            {/* Surahs to download info with status */}
                            <div className="page-download-info">
                                <p className="info-label">Surahs on this page:</p>
                                <div className="surah-status-list">
                                    {chaptersOnPage.map(chapter => {
                                        const isDownloaded = downloadedChapters.includes(chapter.id);
                                        return (
                                            <div key={chapter.id} className={`surah-status-item ${isDownloaded ? 'downloaded' : ''}`}>
                                                <span className="surah-name">{chapter.name}</span>
                                                {isDownloaded && (
                                                    <span className="downloaded-badge">
                                                        <Check size={14} />
                                                        Downloaded
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {allDownloaded ? (
                                    <p className="info-hint all-downloaded">
                                        ✓ All surahs on this page are already downloaded for this reciter.
                                    </p>
                                ) : chaptersToDownload.length < chaptersOnPage.length ? (
                                    <p className="info-hint">
                                        {chaptersToDownload.length} surah(s) will be downloaded. Others are already available.
                                    </p>
                                ) : (
                                    <p className="info-hint">
                                        {chaptersOnPage.length === 1
                                            ? 'The complete surah audio will be downloaded.'
                                            : `All ${chaptersOnPage.length} complete surahs will be downloaded.`
                                        }
                                    </p>
                                )}
                            </div>

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

                            {/* Download Progress */}
                            {isDownloading && (
                                <div className="download-progress">
                                    <div className="progress-header">
                                        <Loader2 size={18} className="spinning" />
                                        <span>Downloading {downloadProgress.chapter}...</span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <div className="progress-text">
                                        {downloadProgress.current} / {downloadProgress.total} verses ({progressPercent}%)
                                    </div>
                                </div>
                            )}

                            {/* Storage Info */}
                            <div className="storage-info-bottom">
                                <span>Storage: {formatBytes(storageInfo.used)} used</span>
                            </div>
                        </>
                    )}
                </div>

                {!showSuccess && (
                    <div className="download-manager-footer">
                        <button
                            className="download-btn"
                            onClick={handleDownload}
                            disabled={isDownloading || allDownloaded || chaptersToDownload.length === 0}
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 size={18} className="spinning" />
                                    Downloading...
                                </>
                            ) : allDownloaded ? (
                                <>
                                    <Check size={18} />
                                    Already Downloaded
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    Download Audio
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageDownloadManager;
