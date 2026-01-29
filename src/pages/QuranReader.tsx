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
} from 'lucide-react';
import {
    fetchSurahWithTranslation,
    fetchPageWithTranslation,
    fetchJuzWithTranslation,
    fetchSurahWithAudio,
    combineWithTranslation,
    // RECITERS,
    // EDITIONS,
    type Ayah,
    type SurahData,
} from '../services/quranApi';
import { storage, STORAGE_KEYS, type Bookmark as BookmarkType, type QuranSettings, DEFAULT_QURAN_SETTINGS } from '../services/storageService';
import './QuranReader.css';

type ViewMode = 'surah' | 'page' | 'juz';

interface AyahWithTranslation extends Ayah {
    translation: string;
}

// Arabic numeral mapping
const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const toArabicNumerals = (num: number): string => {
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
};

// Bismillah text patterns - all known variations from the API
const BISMILLAH_PATTERNS = [
    // Standard with hamza above alif
    'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    // With hamza wasl (alif with wasla) - most common from alquran.cloud
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    // With small high meem
    'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ',
    // Plain without diacritics
    'بسم الله الرحمن الرحيم',
    // Another common variation
    'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ'
];

// Map translation language to API edition
const getTranslationEdition = (lang: string): string => {
    switch (lang) {
        case 'ha': return 'ha.gumi';
        case 'en':
        default: return 'en.asad';
    }
};

// Map reciter to API identifier
const getReciterEdition = (reciter: string): string => {
    switch (reciter) {
        case 'mishary-rashid': return 'ar.alafasy';
        case 'abdul-basit': return 'ar.abdulbasitmurattal';
        case 'sudais': return 'ar.abdurrahmaansudais';
        case 'ghamdi': return 'ar.ghamadi';
        case 'minshawi': return 'ar.minshawi';
        default: return 'ar.alafasy';
    }
};

const QuranReader: React.FC = () => {
    const { surahNumber, pageNumber, juzNumber } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    // Determine view mode and reference
    const viewMode: ViewMode = surahNumber ? 'surah' : pageNumber ? 'page' : 'juz';
    const reference = parseInt(surahNumber || pageNumber || juzNumber || '1');

    // State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ayahs, setAyahs] = useState<AyahWithTranslation[]>([]);
    const [surahInfo, setSurahInfo] = useState<Partial<SurahData> | null>(null);
    const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);

    // Settings State (Initialized from storage with smart defaults)
    const [settings, setSettings] = useState<QuranSettings>(() => {
        const saved = storage.get<QuranSettings | null>(STORAGE_KEYS.QURAN_SETTINGS, null);
        if (saved) return saved;

        // Default translation based on app language
        const appLang = i18n.language.startsWith('ha') ? 'ha' : 'en';
        return {
            ...DEFAULT_QURAN_SETTINGS,
            translationLanguage: appLang as 'en' | 'ha',
            fontSize: 28 // Default for reader
        };
    });
    const [audioEnabled, setAudioEnabled] = useState(true); // Temporary session state or add to QuranSettings
    const [showSettings, setShowSettings] = useState(false);

    // Derived values from settings for easier usage
    const { fontSize, showTranslation, translationLanguage: translationLang, reciter } = settings;

    // Audio state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
    const [audioUrls, setAudioUrls] = useState<string[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Should auto-play on mount
    const autoPlay = searchParams.get('autoplay') === 'true';

    // Load bookmarks
    useEffect(() => {
        const saved = storage.get<BookmarkType[]>(STORAGE_KEYS.BOOKMARKS, []);
        setBookmarks(saved);
    }, []);

    // Fetch content based on view mode
    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            setError(null);

            try {
                if (viewMode === 'surah') {
                    const translationEdition = getTranslationEdition(translationLang);
                    const { arabic, translation } = await fetchSurahWithTranslation(reference, translationEdition);
                    setSurahInfo(arabic);
                    setAyahs(combineWithTranslation(arabic.ayahs, translation.ayahs));

                    // Fetch audio URLs using correct reciter edition
                    const reciterEdition = getReciterEdition(reciter);
                    const audioData = await fetchSurahWithAudio(reference, reciterEdition);
                    setAudioUrls(audioData.ayahs.map(a => a.audio || '').filter(Boolean));
                } else if (viewMode === 'page') {
                    const translationEdition = getTranslationEdition(translationLang);
                    const { arabic, translation } = await fetchPageWithTranslation(reference, translationEdition);
                    setSurahInfo({ name: `Page ${reference}`, englishName: `Page ${reference}` });
                    setAyahs(combineWithTranslation(arabic.ayahs, translation.ayahs));
                } else if (viewMode === 'juz') {
                    const translationEdition = getTranslationEdition(translationLang);
                    const { arabic, translation } = await fetchJuzWithTranslation(reference, translationEdition);
                    setSurahInfo({ name: `Juz ${reference}`, englishName: `Juz' ${reference}` });
                    setAyahs(combineWithTranslation(arabic.ayahs, translation.ayahs));
                }
            } catch (err) {
                console.error('Failed to fetch content:', err);
                setError(t('quran.loadError') || 'Failed to load Quran content');
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [viewMode, reference, translationLang, reciter, t]);

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
            audioRef.current.src = audioUrls[currentAyahIndex];
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
        if (currentAyahIndex < ayahs.length - 1) {
            setCurrentAyahIndex(prev => prev + 1);
            if (isPlaying && audioRef.current) {
                audioRef.current.src = audioUrls[currentAyahIndex + 1];
                audioRef.current.play();
            }
        }
    };

    const handlePrevAyah = () => {
        if (currentAyahIndex > 0) {
            setCurrentAyahIndex(prev => prev - 1);
            if (isPlaying && audioRef.current) {
                audioRef.current.src = audioUrls[currentAyahIndex - 1];
                audioRef.current.play();
            }
        }
    };

    const handleAudioEnded = () => {
        if (currentAyahIndex < ayahs.length - 1) {
            handleNextAyah();
        } else {
            setIsPlaying(false);
            setCurrentAyahIndex(0);
        }
    };

    // Navigation
    const handleBack = () => navigate('/quran');

    const handlePrevPage = () => {
        if (viewMode === 'surah' && reference > 1) {
            navigate(`/quran/surah/${reference - 1}`);
        } else if (viewMode === 'page' && reference > 1) {
            navigate(`/quran/page/${reference - 1}`);
        } else if (viewMode === 'juz' && reference > 1) {
            navigate(`/quran/juz/${reference - 1}`);
        }
    };

    const handleNextPage = () => {
        const maxRef = viewMode === 'surah' ? 114 : viewMode === 'page' ? 604 : 30;
        if (reference < maxRef) {
            navigate(`/quran/${viewMode}/${reference + 1}`);
        }
    };

    // Bookmark toggle
    const toggleBookmark = (ayah: AyahWithTranslation, surahNum: number) => {
        const existing = bookmarks.find(
            b => b.surahNumber === surahNum && b.ayahNumber === ayah.numberInSurah
        );

        let newBookmarks: BookmarkType[];
        if (existing) {
            newBookmarks = bookmarks.filter(b => b.id !== existing.id);
        } else {
            const newBm: BookmarkType = {
                id: `bm-${Date.now()}`,
                surahNumber: surahNum,
                surahName: surahInfo?.englishName || `Surah ${surahNum}`,
                ayahNumber: ayah.numberInSurah,
                createdAt: new Date().toISOString(),
            };
            newBookmarks = [...bookmarks, newBm];
        }

        setBookmarks(newBookmarks);
        storage.set(STORAGE_KEYS.BOOKMARKS, newBookmarks);
    };

    const isAyahBookmarked = (surahNum: number, ayahNum: number) => {
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
        setCurrentAyahIndex(index);
        if (audioUrls[index] && audioRef.current) {
            audioRef.current.src = audioUrls[index];
            audioRef.current.play().catch(err => {
                console.error('Audio playback failed:', err);
            });
            setIsPlaying(true);
        }
    };

    // Helper to format ayah number based on language
    const formatAyahNumber = (num: number): string => {
        return i18n.language === 'ar' ? toArabicNumerals(num) : num.toString();
    };

    // Helper to clean Bismillah from first ayah text
    const cleanAyahText = (text: string, index: number, surahNum: number): string => {
        // Only clean first ayah of surahs that show Bismillah separately
        if (index === 0 && surahNum !== 1 && surahNum !== 9 && viewMode === 'surah') {
            let cleanedText = text;
            for (const pattern of BISMILLAH_PATTERNS) {
                cleanedText = cleanedText.replace(pattern, '').trim();
            }
            return cleanedText;
        }
        return text;
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
                    <h1 className="surah-title">{surahInfo?.englishName || surahInfo?.name}</h1>
                    {surahInfo?.name && surahInfo.name !== surahInfo.englishName && (
                        <p className="surah-arabic-title">{surahInfo.name}</p>
                    )}
                </div>
                <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
                    <Settings size={22} />
                </button>
            </header>

            {/* Settings Panel - Fixed Modal Overlay */}
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
                                    <option value="ghamdi">Al-Ghamdi</option>
                                    <option value="minshawi">Al-Minshawi</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Ayah Content */}
            <main className={`reader-content ${!showTranslation ? 'traditional-mode' : ''} ${!audioEnabled ? 'no-audio' : ''}`}>
                {/* Bismillah for surah view (except Surah 1 and 9) */}
                {viewMode === 'surah' && reference !== 1 && reference !== 9 && (
                    <div className="bismillah">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </div>
                )}

                {/* Traditional Quran Layout - When Translation is OFF */}
                {!showTranslation ? (
                    <div className="traditional-quran-text" style={{ fontSize: `${fontSize}px` }}>
                        {ayahs.map((ayah, index) => (
                            <span
                                key={`${ayah.number}-${index}`}
                                className={`traditional-ayah ${index === currentAyahIndex && isPlaying ? 'playing' : ''}`}
                                onClick={() => audioEnabled && handleAyahClick(index)}
                            >
                                {cleanAyahText(ayah.text, index, reference)}
                                <span className="verse-marker">﴿{formatAyahNumber(ayah.numberInSurah)}﴾</span>
                            </span>
                        ))}
                    </div>
                ) : (
                    /* Card Layout - When Translation is ON */
                    <div className="ayahs-container">
                        {ayahs.map((ayah, index) => {
                            const surahNum = ayah.numberInSurah ? (viewMode === 'surah' ? reference : ayah.juz) : reference;
                            const isCurrentAyah = index === currentAyahIndex && isPlaying;

                            return (
                                <div
                                    key={`${ayah.number}-${index}`}
                                    className={`ayah-block ${isCurrentAyah ? 'playing' : ''}`}
                                    onClick={() => audioEnabled && handleAyahClick(index)}
                                >
                                    <div className="ayah-header">
                                        <span className="ayah-number">{formatAyahNumber(ayah.numberInSurah)}</span>
                                        <button
                                            className={`bookmark-icon ${isAyahBookmarked(surahNum, ayah.numberInSurah) ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleBookmark(ayah, surahNum);
                                            }}
                                        >
                                            {isAyahBookmarked(surahNum, ayah.numberInSurah) ? (
                                                <BookMarked size={18} />
                                            ) : (
                                                <Bookmark size={18} />
                                            )}
                                        </button>
                                    </div>
                                    <p className="ayah-arabic" style={{ fontSize: `${fontSize}px` }}>{cleanAyahText(ayah.text, index, surahNum)}</p>
                                    {ayah.translation && (
                                        <p className="ayah-translation">{ayah.translation}</p>
                                    )}
                                </div>
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
                            {t('surah.ayah') || 'Ayah'} {formatAyahNumber(ayahs[currentAyahIndex]?.numberInSurah || 1)}
                        </span>
                    </div>
                )}

                {/* Audio Controls */}
                {audioEnabled && (
                    <div className="player-controls">
                        <button onClick={handlePrevAyah} disabled={currentAyahIndex === 0}>
                            <SkipBack size={20} />
                        </button>
                        <button className="play-pause-btn" onClick={handlePlayPause}>
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <button onClick={handleNextAyah} disabled={currentAyahIndex >= ayahs.length - 1}>
                            <SkipForward size={20} />
                        </button>
                    </div>
                )}

                {/* Mute Button */}
                {audioEnabled && (
                    <button className="mute-btn" onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                )}

                {/* Navigation Controls */}
                <div className="nav-controls">
                    <button
                        onClick={handlePrevPage}
                        disabled={reference <= 1}
                        className="nav-btn"
                        title={t('quran.previous') || 'Previous'}
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <span className="nav-indicator">
                        {viewMode === 'surah' && `${formatAyahNumber(reference)} / ${formatAyahNumber(114)}`}
                        {viewMode === 'page' && `${formatAyahNumber(reference)} / ${formatAyahNumber(604)}`}
                        {viewMode === 'juz' && `${formatAyahNumber(reference)} / ${formatAyahNumber(30)}`}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={
                            (viewMode === 'surah' && reference >= 114) ||
                            (viewMode === 'page' && reference >= 604) ||
                            (viewMode === 'juz' && reference >= 30)
                        }
                        className="nav-btn"
                        title={t('quran.next') || 'Next'}
                    >
                        <ChevronRight size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuranReader;
