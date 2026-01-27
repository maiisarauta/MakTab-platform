import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Play, Settings, Check } from 'lucide-react';
import Card from '../components/common/Card';
import BottomNavbar from '../components/common/BottomNavbar';
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

const Quran: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('surah');
    useTranslation();

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

    const tabs: { id: TabType; label: string }[] = [
        { id: 'surah', label: 'Surah' },
        { id: 'juz', label: 'Juz' },
        { id: 'page', label: 'Page' },
        { id: 'bookmark', label: 'Bookmark' },
    ];

    const progressPercent = (currentProgress.ayah / currentProgress.totalAyahs) * 100;

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
                            <h1 className="header-title">Al- Qur'an</h1>
                            <p className="header-subtitle">Keep up your recitation, Ibrahim</p>
                        </div>
                    </div>
                    <button className="settings-btn">
                        <Settings size={22} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search Surah, Juz or Ayah..."
                        className="search-input"
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="quran-content">
                {/* Continue Reading Card */}
                <Card className="continue-card">
                    <span className="continue-badge">● CONTINUE READING</span>
                    <div className="continue-content">
                        <div className="continue-info">
                            <h2 className="surah-name">{currentProgress.surah}</h2>
                            <p className="surah-details">Juz {currentProgress.juz} • Ayah {currentProgress.ayah}</p>
                        </div>
                        <p className="surah-arabic">{currentProgress.arabicName}</p>
                    </div>
                    <div className="progress-row">
                        <button className="play-btn">
                            <Play size={18} fill="white" />
                        </button>
                        <div className="progress-info">
                            <span className="progress-current">Ayah {currentProgress.ayah}</span>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
                            </div>
                        </div>
                        <span className="progress-total">Total {currentProgress.totalAyahs}</span>
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
                                    {item.status === 'due' ? 'Due' : 'On Track'}
                                </span>
                            </div>
                            <p className="muraja-label">Muraja'a Today</p>
                            <p className="muraja-juz">Juz {item.juz} ({item.pages} pgs)</p>
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

                {/* Surah List */}
                <div className="surah-list">
                    {surahs.map((surah) => (
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
                                    <span className="status-progress">In Progress</span>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </main>

            <BottomNavbar />
        </div>
    );
};

export default Quran;
