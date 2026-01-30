import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Play, Settings, Check, BookMarked, Bookmark, Loader2, Download } from 'lucide-react';
import Card from '../components/common/Card';
import BottomNavbar from '../components/common/BottomNavbar';
import QuranSettingsModal from '../components/QuranSettings/QuranSettings';
import { DownloadManager } from '../components/DownloadManager';
import { storage, STORAGE_KEYS, Bookmark as BookmarkType } from '../services/storageService';
import { fetchAllSurahs, fetchAllJuzs } from '../services/quranApi';
import { userProfile } from '../data/studentData';
import './Quran.css';

type TabType = 'surah' | 'juz' | 'page' | 'bookmark';

interface Surah {
    number: number;
    name: string;
    arabicName: string;
    translation: string;
    verses: number;
    type: 'Meccan' | 'Madinan';
    status: 'completed' | 'in-progress' | 'not-started';
}

interface JuzInfo {
    number: number;
    startSurah: string;
    endSurah: string;
    pages: number;
    status: 'completed' | 'in-progress' | 'not-started';
}

const Quran: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('surah');
    const [showSettings, setShowSettings] = useState(false);
    const [showDownloadManager, setShowDownloadManager] = useState(false);
    const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslation();

    // Load bookmarks from localStorage
    useEffect(() => {
        const savedBookmarks = storage.get<BookmarkType[]>(STORAGE_KEYS.BOOKMARKS, []);
        setBookmarks(savedBookmarks);
    }, []);

    const currentProgress = {
        surah: 'Surah Al-Baqarah',
        surahNumber: 2, // Al-Baqarah
        arabicName: 'سورة البقرة',
        juz: 3,
        ayah: 253,
        totalAyahs: 286,
    };

    // Navigation handlers
    const handlePlayCurrentSurah = () => {
        navigate(`/quran/surah/${currentProgress.surahNumber}?autoplay=false`);
    };

    const handleViewAllCurrentSurah = () => {
        navigate(`/quran/surah/${currentProgress.surahNumber}`);
    };

    const handleSurahClick = (surahNumber: number) => {
        navigate(`/quran/surah/${surahNumber}`);
    };

    const handleJuzClick = (juzNumber: number) => {
        navigate(`/quran/juz/${juzNumber}`);
    };

    const handlePageClick = (pageNumber: number) => {
        navigate(`/quran/page/${pageNumber}`);
    };

    const muraja = [
        { id: '1', status: 'due', juz: 28, pages: 5 },
        { id: '2', status: 'on-track', juz: 28, pages: 5 },
    ];

    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [juzList, setJuzList] = useState<JuzInfo[]>([]);
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [chaptersData, juzsData] = await Promise.all([
                    fetchAllSurahs(), // Real API call
                    fetchAllJuzs(),   // Real API call
                ]);

                // Map API chapters to Surah interface
                const mappedSurahs: Surah[] = chaptersData.map(s => ({
                    number: s.number,
                    name: s.englishName,
                    arabicName: s.name,
                    translation: s.englishNameTranslation,
                    verses: s.numberOfAyahs,
                    type: s.revelationType === 'Meccan' ? 'Meccan' : 'Madinan',
                    status: 'not-started' // Default status
                }));
                setSurahs(mappedSurahs);

                // Map API juzs to JuzInfo interface
                const mappedJuzs: JuzInfo[] = juzsData.map(j => ({
                    number: j.juz_number,
                    startSurah: `Page ${j.first_verse_id}`, // Simplified for now
                    endSurah: `Verses: ${j.verses_count}`,
                    pages: j.verses_count,
                    status: 'not-started'
                }));
                setJuzList(mappedJuzs);

                // Generate a simple pages list for browsing
                const pagesList = Array.from({ length: 604 }, (_, i) => ({
                    number: i + 1,
                    surah: '',
                    ayahStart: 0,
                    ayahEnd: 0,
                }));
                setPages(pagesList); // Show all 604 pages

            } catch (err) {
                console.error('Failed to load Quran data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const tabs: { id: TabType; label: string }[] = [
        { id: 'surah', label: t('surah.surah') },
        { id: 'juz', label: t('surah.juz') },
        { id: 'page', label: t('surah.page') },
        { id: 'bookmark', label: t('surah.bookmark') },
    ];

    const progressPercent = (currentProgress.ayah / currentProgress.totalAyahs) * 100;

    const filteredSurahs = surahs.filter(surah =>
        surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.arabicName.includes(searchQuery) ||
        surah.translation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBookmarkToggle = (surahNumber: number, surahName: string) => {
        const existingIndex = bookmarks.findIndex(b => b.surahNumber === surahNumber);
        let newBookmarks: BookmarkType[];

        if (existingIndex > -1) {
            newBookmarks = bookmarks.filter((_, i) => i !== existingIndex);
        } else {
            const newBookmark: BookmarkType = {
                id: `bm-${Date.now()}`,
                surahNumber,
                surahName,
                ayahNumber: 1,
                createdAt: new Date().toISOString(),
            };
            newBookmarks = [...bookmarks, newBookmark];
        }

        setBookmarks(newBookmarks);
        storage.set(STORAGE_KEYS.BOOKMARKS, newBookmarks);
    };

    const isBookmarked = (surahNumber: number) => {
        return bookmarks.some(b => b.surahNumber === surahNumber);
    };

    const renderSurahList = () => (
        <div className="surah-list">
            {filteredSurahs.map((surah) => (
                <Card
                    key={surah.number}
                    className="surah-card clickable"
                    padding="md"
                    onClick={() => handleSurahClick(surah.number)}
                >
                    <div className="surah-number">
                        <span>{surah.number}</span>
                    </div>
                    <div className="surah-info">
                        <h3 className="surah-title">{surah.name}</h3>
                        <p className="surah-meta">
                            {surah.translation} • {surah.verses} Verses • {surah.type}
                        </p>
                        {surah.status === 'in-progress' && (
                            <div className="surah-progress-bar">
                                <div className="surah-progress" style={{ width: '88%' }} />
                            </div>
                        )}
                    </div>
                    <div className="surah-right">
                        <p className="surah-arabic-name">{surah.arabicName}</p>
                        {surah.status === 'completed' && (
                            <span className="status-completed">
                                <Check size={16} />
                            </span>
                        )}
                        {surah.status === 'in-progress' && (
                            <span className="status-progress">{t('quran.inProgress')}</span>
                        )}
                        <button
                            className={`bookmark-btn ${isBookmarked(surah.number) ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleBookmarkToggle(surah.number, surah.name);
                            }}
                        >
                            {isBookmarked(surah.number) ? <BookMarked size={16} /> : <Bookmark size={16} />}
                        </button>
                    </div>
                </Card>
            ))}
        </div>
    );

    const renderJuzList = () => (
        <div className="juz-list">
            {juzList.map((juz) => (
                <Card
                    key={juz.number}
                    className="juz-card clickable"
                    padding="md"
                    onClick={() => handleJuzClick(juz.number)}
                >
                    <div className="juz-number">
                        <span>{juz.number}</span>
                    </div>
                    <div className="juz-info">
                        <h3 className="juz-title">{t('surah.juz')} {juz.number}</h3>
                        <p className="juz-range">{juz.startSurah} - {juz.endSurah}</p>
                        <p className="juz-pages">{juz.pages} {t('surah.verses')}</p>
                    </div>
                    <div className="juz-status">
                        {juz.status === 'completed' && (
                            <span className="status-badge completed">{t('quran.completed')}</span>
                        )}
                        {juz.status === 'in-progress' && (
                            <span className="status-badge in-progress">{t('quran.inProgress')}</span>
                        )}
                        {juz.status === 'not-started' && (
                            <span className="status-badge not-started">{t('quran.notStarted')}</span>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );

    const renderPageList = () => (
        <div className="page-grid">
            {pages.map((page) => (
                <Card
                    key={page.number}
                    className="page-card clickable"
                    padding="sm"
                    onClick={() => handlePageClick(page.number)}
                >
                    <span className="page-number">{page.number}</span>
                    <span className="page-surah">{page.surah}</span>
                    <span className="page-ayah">{t('surah.ayah')} {page.ayahStart}-{page.ayahEnd}</span>
                </Card>
            ))}
        </div>
    );

    const renderBookmarks = () => (
        <div className="bookmark-list">
            {bookmarks.length === 0 ? (
                <div className="empty-state">
                    <Bookmark size={48} className="empty-icon" />
                    <h3>{t('quran.noBookmarksYet')}</h3>
                    <p>{t('quran.noBookmarksHint')}</p>
                </div>
            ) : (
                bookmarks.map((bookmark) => (
                    <Card key={bookmark.id} className="bookmark-card" padding="md">
                        <div className="bookmark-icon">
                            <BookMarked size={20} />
                        </div>
                        <div className="bookmark-info">
                            <h3 className="bookmark-title">{bookmark.surahName}</h3>
                            <p className="bookmark-detail">{t('surah.surah')} {bookmark.surahNumber} • {t('surah.ayah')} {bookmark.ayahNumber}</p>
                            {bookmark.note && <p className="bookmark-note">{bookmark.note}</p>}
                        </div>
                        <button
                            className="remove-bookmark"
                            onClick={() => handleBookmarkToggle(bookmark.surahNumber, bookmark.surahName)}
                        >
                            ×
                        </button>
                    </Card>
                ))
            )}
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'surah':
                return renderSurahList();
            case 'juz':
                return renderJuzList();
            case 'page':
                return renderPageList();
            case 'bookmark':
                return renderBookmarks();
            default:
                return renderSurahList();
        }
    };

    return (
        <div className="quran-page">
            {/* Gradient Header */}
            <header className="quran-header">
                <div className="header-top">
                    <div className="user-info">
                        <div className="user-avatar-small">
                            <span>👤</span>
                        </div>
                        <div className="header-text">
                            <h1 className="header-title">{t('quran.title')}</h1>
                            <p className="header-subtitle">{t('quran.subtitle')}, {userProfile.name}</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="download-btn" onClick={() => setShowDownloadManager(true)} title="Download for Offline">
                            <Download size={22} />
                        </button>
                        <button className="settings-btn" onClick={() => setShowSettings(true)}>
                            <Settings size={22} />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder={t('quran.searchPlaceholder')}
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="quran-content">
                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="spinner" />
                        <p>{t('common.loading')}</p>
                    </div>
                ) : (
                    <>
                        {/* Continue Reading Card */}
                        <Card className="continue-card">
                            <span className="continue-badge">● {t('quran.continueReading')}</span>
                            <div className="continue-content">
                                <div className="continue-info">
                                    <h2 className="surah-name">{currentProgress.surah}</h2>
                                    <p className="surah-details">{t('surah.juz')} {currentProgress.juz} • {t('surah.ayah')} {currentProgress.ayah}</p>
                                </div>
                                <p className="surah-arabic">{currentProgress.arabicName}</p>
                            </div>
                            <div className="progress-row">
                                <button className="play-btn" onClick={handlePlayCurrentSurah}>
                                    <Play size={18} fill="white" />
                                </button>
                                <div className="progress-info">
                                    <span className="progress-current">{t('surah.ayah')} {currentProgress.ayah}</span>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
                                    </div>
                                </div>
                                <button className="view-all-btn" onClick={handleViewAllCurrentSurah}>
                                    {t('dashboard.viewAll')}
                                </button>
                            </div>
                        </Card>

                        {/* Muraja'a Cards */}
                        <div className="muraja-row">
                            {muraja.map((item) => (
                                <Card
                                    key={item.id}
                                    className={`muraja-status-card ${item.status === 'due' ? 'due' : 'on-track'}`}
                                >
                                    <div className="muraja-card-header">
                                        <span className="muraja-icon">{item.status === 'due' ? '🔄' : '✓'}</span>
                                        <span className={`muraja-badge ${item.status}`}>
                                            {item.status === 'due' ? t('quran.due') : t('quran.onTrack')}
                                        </span>
                                    </div>
                                    <p className="muraja-label">{t('quran.murajaToday')}</p>
                                    <p className="muraja-juz">{t('surah.juz')} {item.juz} ({item.pages} pgs)</p>
                                </Card>
                            ))}
                        </div>

                        {/* Tabs */}
                        <div className="surah-tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`surah-tab ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        {renderTabContent()}
                    </>
                )}
            </main>

            <BottomNavbar />

            {/* Settings Modal */}
            <QuranSettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />

            {/* Download Manager Modal */}
            <DownloadManager
                isOpen={showDownloadManager}
                onClose={() => setShowDownloadManager(false)}
            />
        </div>
    );
};

export default Quran;
