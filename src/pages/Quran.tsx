import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Play, Settings, Check, BookMarked, Bookmark } from 'lucide-react';
import Card from '../components/common/Card';
import BottomNavbar from '../components/common/BottomNavbar';
import QuranSettingsModal from '../components/QuranSettings/QuranSettings';
import { storage, STORAGE_KEYS, Bookmark as BookmarkType } from '../services/storageService';
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
    const [activeTab, setActiveTab] = useState<TabType>('surah');
    const [showSettings, setShowSettings] = useState(false);
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
        arabicName: 'سورة البقرة',
        juz: 3,
        ayah: 253,
        totalAyahs: 286,
    };

    const muraja = [
        { id: '1', status: 'due', juz: 28, pages: 5 },
        { id: '2', status: 'on-track', juz: 28, pages: 5 },
    ];

    const surahs: Surah[] = [
        { number: 1, name: 'Al-Fatiha', arabicName: 'الفاتحة', translation: 'The Opening', verses: 7, type: 'Meccan', status: 'completed' },
        { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', translation: 'The Cow', verses: 286, type: 'Madinan', status: 'in-progress' },
        { number: 3, name: 'Aali Imran', arabicName: 'آل عمران', translation: 'Family of Imran', verses: 200, type: 'Madinan', status: 'not-started' },
        { number: 4, name: 'An-Nisa', arabicName: 'النساء', translation: 'The Women', verses: 176, type: 'Madinan', status: 'not-started' },
        { number: 5, name: 'Al-Ma\'idah', arabicName: 'المائدة', translation: 'The Table Spread', verses: 120, type: 'Madinan', status: 'not-started' },
        { number: 6, name: 'Al-An\'am', arabicName: 'الأنعام', translation: 'The Cattle', verses: 165, type: 'Meccan', status: 'not-started' },
    ];

    const juzList: JuzInfo[] = [
        { number: 1, startSurah: 'Al-Fatiha', endSurah: 'Al-Baqarah (141)', pages: 20, status: 'completed' },
        { number: 2, startSurah: 'Al-Baqarah (142)', endSurah: 'Al-Baqarah (252)', pages: 20, status: 'completed' },
        { number: 3, startSurah: 'Al-Baqarah (253)', endSurah: 'Ali Imran (92)', pages: 20, status: 'in-progress' },
        { number: 4, startSurah: 'Ali Imran (93)', endSurah: 'An-Nisa (23)', pages: 20, status: 'not-started' },
        { number: 5, startSurah: 'An-Nisa (24)', endSurah: 'An-Nisa (147)', pages: 20, status: 'not-started' },
        { number: 6, startSurah: 'An-Nisa (148)', endSurah: 'Al-Ma\'idah (81)', pages: 20, status: 'not-started' },
    ];

    const pages = Array.from({ length: 30 }, (_, i) => ({
        number: i + 1,
        surah: surahs[Math.min(i % 6, 5)].name,
        ayahStart: (i * 10) + 1,
        ayahEnd: (i + 1) * 10,
    }));

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
                <Card key={surah.number} className="surah-card" padding="md">
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
                <Card key={juz.number} className="juz-card" padding="md">
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
                <Card key={page.number} className="page-card" padding="sm">
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
                    <button className="settings-btn" onClick={() => setShowSettings(true)}>
                        <Settings size={22} />
                    </button>
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
                        <button className="play-btn">
                            <Play size={18} fill="white" />
                        </button>
                        <div className="progress-info">
                            <span className="progress-current">{t('surah.ayah')} {currentProgress.ayah}</span>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
                            </div>
                        </div>
                        <span className="progress-total">{t('dashboard.viewAll')} {currentProgress.totalAyahs}</span>
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
            </main>

            <BottomNavbar />

            {/* Settings Modal */}
            <QuranSettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </div>
    );
};

export default Quran;
