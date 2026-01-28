import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    Play,
    Pause,
    Square,
    Check,
    Clock,
    Flame,
    BookOpen,
    ChevronDown,
    Mic,
} from 'lucide-react';
import Card from '../components/common/Card';
import BottomNavbar from '../components/common/BottomNavbar';
import RecordingPopup from '../components/common/RecordingPopup/RecordingPopup';
import AudioPlayer from '../components/common/AudioPlayer/AudioPlayer';
import { audioStorage } from '../services/storageService';
import { surahList, practiceLogs, tahfeezProgress, PracticeLog } from '../data/studentData';
import './LogPractice.css';

type PracticeType = 'memorization' | 'revision' | 'recitation';

const LogPractice: React.FC = () => {
    const navigate = useNavigate();
    const [isRunning, setIsRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [selectedSurah, setSelectedSurah] = useState(surahList[11]); // Yusuf
    const [practiceType, setPracticeType] = useState<PracticeType>('memorization');
    const [showSurahPicker, setShowSurahPicker] = useState(false);
    const [logs, setLogs] = useState<PracticeLog[]>(practiceLogs);
    const [showRecordingPopup, setShowRecordingPopup] = useState(false);
    const [lastRecording, setLastRecording] = useState<{ blob: Blob; duration: number } | null>(null);
    const { t } = useTranslation();

    // Timer logic
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds((s) => s + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning]);

    const formatTime = useCallback((totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const handleStartPause = () => {
        setIsRunning(!isRunning);
    };

    const handleStop = () => {
        if (seconds > 0) {
            const newLog: PracticeLog = {
                id: `log-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                duration: Math.ceil(seconds / 60),
                surahName: selectedSurah.name,
                surahNumber: selectedSurah.number,
                ayahStart: 1,
                ayahEnd: selectedSurah.ayahCount,
                type: practiceType,
            };
            setLogs([newLog, ...logs]);
        }
        setIsRunning(false);
        setSeconds(0);
    };

    const handleRecordingComplete = async (blob: Blob, duration: number) => {
        setLastRecording({ blob, duration });

        // Save recording to localStorage
        const recordingId = `rec-${Date.now()}`;
        await audioStorage.saveRecording(recordingId, blob, {
            duration,
            surahName: selectedSurah.name,
            surahNumber: selectedSurah.number,
            type: practiceType,
        });

        // Create a practice log with recording
        const newLog: PracticeLog = {
            id: `log-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            duration: Math.ceil(duration / 60) || 1,
            surahName: selectedSurah.name,
            surahNumber: selectedSurah.number,
            ayahStart: 1,
            ayahEnd: selectedSurah.ayahCount,
            type: practiceType,
            notes: 'Recorded audio practice',
        };
        setLogs([newLog, ...logs]);
    };

    const practiceTypes: { id: PracticeType; label: string }[] = [
        { id: 'memorization', label: t('logPractice.memorization') },
        { id: 'revision', label: t('logPractice.revision') },
        { id: 'recitation', label: t('logPractice.recitation') },
    ];

    return (
        <div className="log-practice-page">
            {/* Header */}
            <header className="practice-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="header-title">{t('logPractice.title')}</h1>
                <div className="header-spacer" />
            </header>

            {/* Main Content */}
            <main className="practice-content">
                {/* Stats Row */}
                <div className="stats-row">
                    <Card className="stat-card" padding="md">
                        <div className="stat-icon">
                            <Clock size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{tahfeezProgress.todayPracticeMinutes} min</span>
                            <span className="stat-label">{t('logPractice.today')}</span>
                        </div>
                    </Card>
                    <Card className="stat-card streak" padding="md">
                        <div className="stat-icon">
                            <Flame size={20} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{tahfeezProgress.streak} days</span>
                            <span className="stat-label">{t('logPractice.streak')} 🔥</span>
                        </div>
                    </Card>
                </div>

                {/* Timer Card */}
                <Card className="timer-card" padding="lg">
                    <div className="timer-display">
                        <span className="timer-text">{formatTime(seconds)}</span>
                    </div>

                    {/* Surah Selector */}
                    <button
                        className="surah-selector"
                        onClick={() => setShowSurahPicker(!showSurahPicker)}
                    >
                        <BookOpen size={18} />
                        <span>{selectedSurah.name}</span>
                        <span className="surah-arabic">{selectedSurah.arabicName}</span>
                        <ChevronDown size={18} />
                    </button>

                    {showSurahPicker && (
                        <div className="surah-picker">
                            {surahList.slice(0, 20).map((surah) => (
                                <button
                                    key={surah.number}
                                    className={`surah-option ${selectedSurah.number === surah.number ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedSurah(surah);
                                        setShowSurahPicker(false);
                                    }}
                                >
                                    <span className="surah-number">{surah.number}</span>
                                    <span className="surah-name">{surah.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Practice Type */}
                    <div className="practice-types">
                        {practiceTypes.map((type) => (
                            <button
                                key={type.id}
                                className={`type-btn ${practiceType === type.id ? 'active' : ''}`}
                                onClick={() => setPracticeType(type.id)}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    {/* Timer Controls */}
                    <div className="timer-controls">
                        <button
                            className={`control-btn primary ${isRunning ? 'pause' : 'play'}`}
                            onClick={handleStartPause}
                        >
                            {isRunning ? <Pause size={28} /> : <Play size={28} />}
                        </button>
                        {seconds > 0 && (
                            <button className="control-btn stop" onClick={handleStop}>
                                <Square size={24} />
                            </button>
                        )}
                        <button
                            className="control-btn record"
                            onClick={() => setShowRecordingPopup(true)}
                        >
                            <Mic size={24} />
                        </button>
                    </div>

                    {/* Last Recording Preview */}
                    {lastRecording && (
                        <div className="recording-preview">
                            <p className="preview-label">{t('logPractice.lastRecording')}</p>
                            <AudioPlayer audioBlob={lastRecording.blob} compact />
                        </div>
                    )}
                </Card>

                {/* Recent Sessions */}
                <section className="recent-section">
                    <h3 className="section-title">{t('logPractice.recentSessions')}</h3>
                    <div className="sessions-list">
                        {logs.slice(0, 5).map((log) => (
                            <Card key={log.id} className="session-card" padding="sm">
                                <div className="session-icon">
                                    <Check size={16} />
                                </div>
                                <div className="session-info">
                                    <span className="session-surah">{log.surahName}</span>
                                    <span className="session-meta">
                                        {log.type} · {log.duration} min
                                    </span>
                                </div>
                                <span className="session-date">{log.date}</span>
                            </Card>
                        ))}
                    </div>
                </section>
            </main>

            <BottomNavbar />

            {/* Recording Popup */}
            <RecordingPopup
                isOpen={showRecordingPopup}
                onClose={() => setShowRecordingPopup(false)}
                onRecordingComplete={handleRecordingComplete}
            />
        </div>
    );
};

export default LogPractice;
