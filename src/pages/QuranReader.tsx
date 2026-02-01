import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    Play,
    Pause,
    SkipForward,
    SkipBack,
    ChevronLeft,
    ChevronRight,
    Bookmark,
    BookMarked,
    Settings,
    Type,
    Volume2,
    VolumeX,
    Loader2,
    List,
    Globe,
    Download,
} from 'lucide-react';
import {
    fetchPageDataOfflineFirst,
    fetchPageAudioOfflineFirst,
    getChapterStartPage,
    getJuzStartPage,
    getReciterId,
    type Verse,
    type Word,
    type QuranPageData,
} from '../services/quranApi';
import { storage, STORAGE_KEYS, type Bookmark as BookmarkType, type QuranSettings, DEFAULT_QURAN_SETTINGS } from '../services/storageService';
import { PageDownloadManager } from '../components/PageDownloadManager';
import './QuranReader.css';

// Arabic numeral mapping
const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const toArabicNumerals = (num: number): string => {
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
};

// Total pages in the Mushaf
const TOTAL_PAGES = 604;

const QuranReader: React.FC = () => {
    const { surahNumber, pageNumber: urlPageNumber, juzNumber } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    // State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageData, setPageData] = useState<QuranPageData | null>(null);
    const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);

    // Settings State
    const [settings, setSettings] = useState<QuranSettings>(() => {
        const saved = storage.get<QuranSettings | null>(STORAGE_KEYS.QURAN_SETTINGS, null);
        if (saved) return saved;

        const appLang = i18n.language.startsWith('ha') ? 'ha' : 'en';
        return {
            ...DEFAULT_QURAN_SETTINGS,
            translationLanguage: appLang as 'en' | 'ha',
            fontSize: 18
        };
    });
    const [audioEnabled, setAudioEnabled] = useState(() => {
        // Load audio state from localStorage for session persistence
        return localStorage.getItem('maktab_audio_enabled') === 'true';
    });
    const [showSettings, setShowSettings] = useState(false);
    const [showDownloadManager, setShowDownloadManager] = useState(false);

    // Persist audio enabled state to localStorage
    useEffect(() => {
        localStorage.setItem('maktab_audio_enabled', audioEnabled.toString());
    }, [audioEnabled]);

    const { fontSize, showTranslation, translationLanguage: translationLang, reciter } = settings;

    // Audio state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
    const [audioUrls, setAudioUrls] = useState<{ verseKey: string; audioUrl: string }[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const autoPlay = searchParams.get('autoplay') === 'true';

    // Group words by line for traditional Mushaf view
    const wordsByLine = React.useMemo(() => {
        if (!pageData) return {};

        const grouped: { [line: number]: (Word & { verseKey: string; ayahIndex: number })[] } = {};

        pageData.verses.forEach((verse, ayahIndex) => {
            if (verse.words) {
                verse.words.forEach(word => {
                    const lineNum = word.line_number;
                    if (!grouped[lineNum]) {
                        grouped[lineNum] = [];
                    }
                    grouped[lineNum].push({ ...word, verseKey: verse.verse_key, ayahIndex });
                });
            }
        });

        return grouped;
    }, [pageData]);

    // Determine initial page based on URL params
    useEffect(() => {
        const initializePage = async () => {
            setLoading(true);
            try {
                let startPage = 1;

                if (urlPageNumber) {
                    startPage = parseInt(urlPageNumber);
                } else if (surahNumber) {
                    startPage = await getChapterStartPage(parseInt(surahNumber));
                } else if (juzNumber) {
                    startPage = getJuzStartPage(parseInt(juzNumber));
                }

                setCurrentPage(Math.max(1, Math.min(startPage, TOTAL_PAGES)));
            } catch (err) {
                console.error('Failed to initialize page:', err);
                setCurrentPage(1);
            }
        };

        initializePage();
    }, [surahNumber, urlPageNumber, juzNumber]);

    // Load bookmarks
    useEffect(() => {
        const saved = storage.get<BookmarkType[]>(STORAGE_KEYS.BOOKMARKS, []);
        setBookmarks(saved);
    }, []);

    // Fetch page content when currentPage changes
    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            setError(null);

            try {
                // Use offline-first functions to check cache before API
                const data = await fetchPageDataOfflineFirst(currentPage, translationLang);
                setPageData(data);

                // Fetch audio if enabled (also offline-first)
                if (audioEnabled) {
                    const reciterId = getReciterId(reciter);
                    const audio = await fetchPageAudioOfflineFirst(currentPage, reciterId);
                    setAudioUrls(audio);
                }
            } catch (err) {
                console.error('Failed to fetch page content:', err);
                setError(t('quran.loadError') || 'Failed to load Quran content');
            } finally {
                setLoading(false);
            }
        };

        if (currentPage > 0) {
            fetchContent();
        }
    }, [currentPage, translationLang, audioEnabled, reciter, t]);

    // Background pre-fetching for neighboring pages
    useEffect(() => {
        const prefetch = async () => {
            // Wait a bit before prefetching to avoid competing with main fetch
            await new Promise(resolve => setTimeout(resolve, 2000));

            const pagesToPrefetch = [];
            if (currentPage < TOTAL_PAGES) pagesToPrefetch.push(currentPage + 1);
            if (currentPage > 1) pagesToPrefetch.push(currentPage - 1);

            for (const page of pagesToPrefetch) {
                try {
                    // This will fetch and cache silently
                    await fetchPageDataOfflineFirst(page, translationLang);
                } catch (err) {
                    // Ignore prefetch errors
                }
            }
        };

        if (!loading && currentPage > 0) {
            prefetch();
        }
    }, [currentPage, translationLang, loading]);

    // Fetch audio when audioEnabled changes
    useEffect(() => {
        const fetchAudio = async () => {
            console.log('Audio effect triggered:', { audioEnabled, currentPage, reciter });
            if (audioEnabled && currentPage > 0) {
                try {
                    console.log('Fetching audio for page:', currentPage);
                    const reciterId = getReciterId(reciter);
                    console.log('Reciter ID:', reciterId);
                    // Use offline-first to check cache before API
                    const audio = await fetchPageAudioOfflineFirst(currentPage, reciterId);
                    console.log('Audio fetched:', audio.length, 'files');
                    setAudioUrls(audio);
                } catch (err) {
                    console.error('Failed to fetch audio:', err);
                    setAudioUrls([]); // Set empty array on error
                }
            }
        };

        fetchAudio();
    }, [audioEnabled, reciter, currentPage]);

    // Auto-play if requested
    useEffect(() => {
        if (autoPlay && audioUrls.length > 0 && !loading) {
            handlePlay();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoPlay, audioUrls, loading]);

    // Audio playback handlers
    const handlePlay = useCallback(() => {
        if (audioRef.current && audioUrls[currentAyahIndex]) {
            audioRef.current.src = audioUrls[currentAyahIndex].audioUrl;
            audioRef.current.play().catch(err => {
                console.error('Audio playback failed:', err);
            });
            setIsPlaying(true);
        }
    }, [audioUrls, currentAyahIndex]);

    const handlePause = () => {
        audioRef.current?.pause();
        setIsPlaying(false);
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            handlePause();
        } else {
            handlePlay();
        }
    };

    const handleNextAyah = () => {
        if (currentAyahIndex < audioUrls.length - 1) {
            setCurrentAyahIndex(prev => prev + 1);
            if (isPlaying && audioRef.current) {
                audioRef.current.src = audioUrls[currentAyahIndex + 1].audioUrl;
                audioRef.current.play();
            }
        }
    };

    const handlePrevAyah = () => {
        if (currentAyahIndex > 0) {
            setCurrentAyahIndex(prev => prev - 1);
            if (isPlaying && audioRef.current) {
                audioRef.current.src = audioUrls[currentAyahIndex - 1].audioUrl;
                audioRef.current.play();
            }
        }
    };

    const handleAudioEnded = () => {
        if (currentAyahIndex < audioUrls.length - 1) {
            handleNextAyah();
        } else {
            setIsPlaying(false);
            setCurrentAyahIndex(0);
        }
    };

    // Page Navigation
    const handleBack = () => navigate('/quran');

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            setCurrentAyahIndex(0);
            navigate(`/quran/page/${currentPage - 1}`, { replace: true });
        }
    };

    const handleNextPage = () => {
        if (currentPage < TOTAL_PAGES) {
            setCurrentPage(prev => prev + 1);
            setCurrentAyahIndex(0);
            navigate(`/quran/page/${currentPage + 1}`, { replace: true });
        }
    };

    // Bookmark toggle
    const toggleBookmark = (verse: Verse) => {
        const [surahNum, ayahNum] = verse.verse_key.split(':').map(Number);
        const chapterInfo = pageData?.chapters.find(c => c.id === surahNum);

        const existing = bookmarks.find(
            b => b.surahNumber === surahNum && b.ayahNumber === ayahNum
        );

        let newBookmarks: BookmarkType[];
        if (existing) {
            newBookmarks = bookmarks.filter(b => b.id !== existing.id);
        } else {
            const newBm: BookmarkType = {
                id: `bm-${Date.now()}`,
                surahNumber: surahNum,
                surahName: chapterInfo?.name || `Surah ${surahNum}`,
                ayahNumber: ayahNum,
                createdAt: new Date().toISOString(),
            };
            newBookmarks = [...bookmarks, newBm];
        }

        setBookmarks(newBookmarks);
        storage.set(STORAGE_KEYS.BOOKMARKS, newBookmarks);
    };

    const isVerseBookmarked = (verseKey: string) => {
        const [surahNum, ayahNum] = verseKey.split(':').map(Number);
        return bookmarks.some(b => b.surahNumber === surahNum && b.ayahNumber === ayahNum);
    };

    // Setting update handlers
    const updateSetting = <K extends keyof QuranSettings>(key: K, value: QuranSettings[K]) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        storage.set(STORAGE_KEYS.QURAN_SETTINGS, newSettings);
    };

    const increaseFontSize = () => updateSetting('fontSize', Math.min(fontSize + 2, 48));
    const decreaseFontSize = () => updateSetting('fontSize', Math.max(fontSize - 2, 18));
    const toggleTranslation = () => updateSetting('showTranslation', !showTranslation);
    const setTranslationLanguage = (lang: string) => updateSetting('translationLanguage', lang as 'en' | 'ha');
    const setReciterName = (name: string) => updateSetting('reciter', name);

    // Click on ayah to play
    const handleAyahClick = (index: number) => {
        if (!audioEnabled) return;

        setCurrentAyahIndex(index);
        if (audioUrls[index] && audioRef.current) {
            audioRef.current.src = audioUrls[index].audioUrl;
            audioRef.current.play().catch(err => {
                console.error('Audio playback failed:', err);
            });
            setIsPlaying(true);
        }
    };

    // Helper to format ayah number based on language
    const formatNumber = (num: number): string => {
        return i18n.language === 'ar' ? toArabicNumerals(num) : num.toString();
    };

    // Get header title
    const getHeaderTitle = () => {
        if (!pageData || pageData.chapters.length === 0) {
            return `Page ${currentPage}`;
        }

        if (pageData.chapters.length === 1) {
            return pageData.chapters[0].name;
        }

        return pageData.chapters.map(c => c.name).join(' / ');
    };

    const getHeaderArabicTitle = () => {
        if (!pageData || pageData.chapters.length === 0) return '';

        if (pageData.chapters.length === 1) {
            return pageData.chapters[0].nameArabic;
        }

        return pageData.chapters.map(c => c.nameArabic).join(' / ');
    };

    if (loading) {
        return (
            <div className="quran-reader-page loading-state">
                <div className="loading-content">
                    <Loader2 size={48} className="spinner" />
                    <p>{t('common.loading') || 'Loading...'}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="quran-reader-page error-state">
                <div className="error-content">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>
                        {t('common.retry') || 'Retry'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="quran-reader-page">
            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                onEnded={handleAudioEnded}
                muted={isMuted}
            />

            {/* Header */}
            <header className="reader-header">
                <button className="back-btn" onClick={handleBack}>
                    <ArrowLeft size={24} />
                </button>
                <div className="header-info">
                    <h1 className="surah-title">{getHeaderTitle()}</h1>
                    <p className="surah-arabic-title">{getHeaderArabicTitle()}</p>
                    <p className="page-info">
                        {t('surah.page') || 'Page'} {formatNumber(currentPage)} • {t('surah.juz') || 'Juz'} {formatNumber(pageData?.juzNumber || 1)}
                    </p>
                </div>
                <div className="header-actions">
                    <button
                        className="download-audio-btn"
                        onClick={() => setShowDownloadManager(true)}
                        title="Download Audio for Offline"
                    >
                        <Download size={22} />
                    </button>
                    <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
                        <Settings size={22} />
                    </button>
                </div>
            </header>

            {/* Settings Panel */}
            {showSettings && (
                <div className="settings-overlay" onClick={() => setShowSettings(false)}>
                    <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="settings-header">
                            <h3>{t('quran.settings') || 'Settings'}</h3>
                            <button className="close-settings-btn" onClick={() => setShowSettings(false)}>
                                ×
                            </button>
                        </div>

                        <div className="settings-row">
                            <span className="settings-label">
                                <Type size={16} /> {t('quran.fontSize') || 'Font Size'}
                            </span>
                            <div className="font-controls">
                                <button onClick={decreaseFontSize}>A-</button>
                                <span>{fontSize}</span>
                                <button onClick={increaseFontSize}>A+</button>
                            </div>
                        </div>

                        <div className="settings-row">
                            <span className="settings-label">
                                <Volume2 size={16} /> {t('quran.audioMode') || 'Audio Mode'}
                            </span>
                            <button
                                className={`toggle-btn ${audioEnabled ? 'active' : ''}`}
                                onClick={() => {
                                    setAudioEnabled(!audioEnabled);
                                    if (audioEnabled && isPlaying) {
                                        handlePause();
                                    }
                                }}
                            >
                                {audioEnabled ? 'On' : 'Off'}
                            </button>
                        </div>

                        <div className="settings-row">
                            <span className="settings-label">
                                <Globe size={16} /> {t('quran.translation') || 'Translation'}
                            </span>
                            <button
                                className={`toggle-btn ${showTranslation ? 'active' : ''}`}
                                onClick={toggleTranslation}
                            >
                                {showTranslation ? 'On' : 'Off'}
                            </button>
                        </div>

                        {showTranslation && (
                            <div className="settings-row">
                                <span className="settings-label">
                                    {t('quran.translationLanguage') || 'Language'}
                                </span>
                                <select
                                    value={translationLang}
                                    onChange={(e) => setTranslationLanguage(e.target.value)}
                                    className="reciter-select"
                                >
                                    <option value="en">English</option>
                                    <option value="ha">Hausa</option>
                                </select>
                            </div>
                        )}

                        {audioEnabled && (
                            <div className="settings-row">
                                <span className="settings-label">
                                    {t('quran.reciter') || 'Reciter'}
                                </span>
                                <select
                                    value={reciter}
                                    onChange={(e) => setReciterName(e.target.value)}
                                    className="reciter-select"
                                >
                                    <option value="mishary-rashid">Mishary Rashid</option>
                                    <option value="abdul-basit">Abdul Basit</option>
                                    <option value="sudais">Al-Sudais</option>
                                    <option value="minshawi">Al-Minshawi</option>
                                    <option value="husary">Al-Husary</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Page Content */}
            <main className={`reader-content ${!showTranslation ? 'traditional-mode' : ''} ${!audioEnabled ? 'no-audio' : ''}`}>
                {/* Traditional Quran Layout - Like reading from a real Mushaf */}
                {!showTranslation ? (
                    <div className="traditional-quran-text" style={{ fontSize: `${fontSize}px` }}>
                        {Object.keys(wordsByLine).sort((a, b) => Number(a) - Number(b)).map((lineNum) => {
                            const lineWords = wordsByLine[Number(lineNum)];
                            const firstWord = lineWords[0];
                            const [surahNum, ayahNum] = firstWord.verseKey.split(':').map(Number);
                            const isFirstAyahOfSurah = ayahNum === 1 && firstWord.position === 1;

                            return (
                                <React.Fragment key={lineNum}>
                                    {isFirstAyahOfSurah && (
                                        <div className="surah-separator">
                                            <img
                                                src="/sura-frame.png"
                                                alt="Surah Frame"
                                                className="surah-frame"
                                            />
                                            <span className="surah-name-wrapper">
                                                سورة {pageData?.chapters.find(c => c.id === surahNum)?.nameArabic}
                                            </span>
                                        </div>
                                    )}
                                    {isFirstAyahOfSurah && surahNum !== 1 && surahNum !== 9 && (
                                        <div className="bismillah-text">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
                                    )}
                                    <div className="quran-line">
                                        {lineWords.map((word, wIdx) => {
                                            const currentlyPlaying = audioUrls[currentAyahIndex]?.verseKey === word.verseKey && isPlaying;
                                            const isEndMarker = word.char_type_name === 'end';
                                            const verseNum = word.verseKey.split(':')[1];

                                            return (
                                                <span
                                                    key={`${word.id}-${wIdx}`}
                                                    className={`quran-word ${isEndMarker ? 'ayah-marker' : ''} ${currentlyPlaying ? 'playing' : ''}`}
                                                    onClick={() => handleAyahClick(word.ayahIndex)}
                                                >
                                                    {isEndMarker ? (
                                                        <span className="verse-end-marker">﴿{toArabicNumerals(parseInt(verseNum))}﴾</span>
                                                    ) : (
                                                        word.text_qpc_hafs
                                                    )}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                ) : (
                    /* Card Layout - When Translation is ON */
                    <div className="ayahs-container">
                        {pageData?.verses.map((verse, index) => {
                            const [surahNum, ayahNum] = verse.verse_key.split(':').map(Number);
                            const isFirstAyah = ayahNum === 1;
                            const currentlyPlaying = audioUrls[currentAyahIndex]?.verseKey === verse.verse_key && isPlaying;
                            const translationText = verse.translations?.[0]?.text || '';
                            const cleanTranslation = translationText.replace(/<[^>]*>/g, '');

                            return (
                                <React.Fragment key={verse.verse_key}>
                                    {isFirstAyah && (
                                        <div className="surah-header-card">
                                            <h2>{pageData.chapters.find(c => c.id === surahNum)?.name}</h2>
                                            {surahNum !== 1 && surahNum !== 9 && (
                                                <p className="bismillah-card">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                                            )}
                                        </div>
                                    )}
                                    <div
                                        className={`ayah-block ${currentlyPlaying ? 'playing' : ''}`}
                                        onClick={() => handleAyahClick(index)}
                                    >
                                        <div className="ayah-header">
                                            <span className="ayah-number">{verse.verse_key}</span>
                                            <button
                                                className={`bookmark-btn-small ${isVerseBookmarked(verse.verse_key) ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleBookmark(verse);
                                                }}
                                            >
                                                {isVerseBookmarked(verse.verse_key) ? (
                                                    <BookMarked size={18} />
                                                ) : (
                                                    <Bookmark size={18} />
                                                )}
                                            </button>
                                        </div>
                                        <p className="ayah-arabic" style={{ fontSize: `${fontSize}px` }}>
                                            {verse.text_qpc_hafs}
                                        </p>
                                        {cleanTranslation && (
                                            <p className="ayah-translation">{cleanTranslation}</p>
                                        )}
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Bottom Control Bar - Audio Player + Navigation */}
            <div className="bottom-control-bar">
                {/* Ayah Info */}
                {audioEnabled && (
                    <div className="player-ayah-info">
                        <List size={16} />
                        <span>
                            {audioUrls.length > 0 ? audioUrls[currentAyahIndex]?.verseKey : 'Loading...'}
                        </span>
                    </div>
                )}

                {/* Audio Controls */}
                {audioEnabled && (
                    <div className="player-controls">
                        <button onClick={handlePrevAyah} disabled={currentAyahIndex === 0 || audioUrls.length === 0}>
                            <SkipBack size={20} />
                        </button>
                        <button className="play-pause-btn" onClick={handlePlayPause} disabled={audioUrls.length === 0}>
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <button onClick={handleNextAyah} disabled={currentAyahIndex >= audioUrls.length - 1 || audioUrls.length === 0}>
                            <SkipForward size={20} />
                        </button>
                    </div>
                )}

                {/* Mute Button */}
                {audioEnabled && audioUrls.length > 0 && (
                    <button className="mute-btn" onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                )}

                {/* Page Navigation Controls */}
                <div className="nav-controls">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage <= 1}
                        className="nav-btn"
                        title={t('quran.previous') || 'Previous Page'}
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <span className="nav-indicator">
                        {formatNumber(currentPage)} / {formatNumber(TOTAL_PAGES)}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage >= TOTAL_PAGES}
                        className="nav-btn"
                        title={t('quran.next') || 'Next Page'}
                    >
                        <ChevronRight size={22} />
                    </button>
                </div>
            </div>

            {/* Page Download Manager Modal */}
            <PageDownloadManager
                isOpen={showDownloadManager}
                onClose={() => setShowDownloadManager(false)}
                chaptersOnPage={pageData?.chapters || []}
            />
        </div>
    );
};

export default QuranReader;
