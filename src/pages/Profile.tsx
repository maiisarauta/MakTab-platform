import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    Edit2,
    User,
    Calendar,
    Phone,
    FileText,
    Clock,
    Globe,
    Bell,
    Moon,
    LogOut,
    ChevronRight,
    Check,
} from 'lucide-react';
import Card from '../components/common/Card';
import BottomNavbar from '../components/common/BottomNavbar';
import { useTheme } from '../context/ThemeContext';
import { storage, STORAGE_KEYS, UserSettings, DEFAULT_USER_SETTINGS } from '../services/storageService';
import { userProfile, tahfeezProgress } from '../data/studentData';
import './Profile.css';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { isDarkMode, setDarkMode } = useTheme();

    // Load settings from localStorage
    const [settings, setSettings] = useState<UserSettings>(() => {
        return storage.get<UserSettings>(STORAGE_KEYS.USER_SETTINGS, DEFAULT_USER_SETTINGS);
    });

    const [showLanguageModal, setShowLanguageModal] = useState(false);

    // Sync dark mode with theme context
    useEffect(() => {
        setSettings(prev => ({ ...prev, darkMode: isDarkMode }));
    }, [isDarkMode]);

    const user = {
        name: userProfile.name,
        fullName: userProfile.name,
        id: userProfile.id,
        class: userProfile.halaqa,
        dateOfBirth: '12th Ramadan 1432 AH',
        guardian: userProfile.phone,
        attendance: '96%',
        juz: `${tahfeezProgress.currentJuz} / ${tahfeezProgress.totalJuz}`,
        grade: 'A-',
    };

    const personalInfo = [
        { id: 'name', icon: User, label: t('profile.fullName'), value: user.fullName },
        { id: 'dob', icon: Calendar, label: t('profile.dateOfBirth'), value: user.dateOfBirth },
        { id: 'guardian', icon: Phone, label: t('profile.guardianContact'), value: user.guardian, action: t('common.edit') },
    ];
    const academicActions = [
        { id: 'reports', icon: FileText, label: t('profile.academicReports'), hasArrow: true },
        { id: 'history', icon: Clock, label: t('profile.attendanceHistory'), hasArrow: true },
    ];

    const languages = [
        { code: 'en', label: 'English', native: 'English' },
        { code: 'ar', label: 'Arabic', native: 'العربية' },
        { code: 'ha', label: 'Hausa', native: 'Hausa' },
    ];

    const handleLanguageChange = (code: string) => {
        i18n.changeLanguage(code);

        // Set document direction for RTL languages
        if (code === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
        }

        // Persist language preference
        const newSettings = { ...settings, language: code as 'en' | 'ar' | 'ha' };
        setSettings(newSettings);
        storage.set(STORAGE_KEYS.USER_SETTINGS, newSettings);
        storage.set(STORAGE_KEYS.LANGUAGE, code);

        setShowLanguageModal(false);
    };

    const handleNotificationToggle = () => {
        const newSettings = { ...settings, notifications: !settings.notifications };
        setSettings(newSettings);
        storage.set(STORAGE_KEYS.USER_SETTINGS, newSettings);
    };

    const handleDarkModeToggle = () => {
        setDarkMode(!isDarkMode);
        const newSettings = { ...settings, darkMode: !isDarkMode };
        setSettings(newSettings);
        storage.set(STORAGE_KEYS.USER_SETTINGS, newSettings);
    };

    const getCurrentLanguageLabel = () => {
        const currentLang = languages.find(l => l.code === i18n.language);
        return currentLang ? currentLang.native : 'English';
    };

    return (
        <div className="profile-page">
            {/* Gradient Header */}
            <header className="profile-header">
                <div className="header-top">
                    <button className="back-btn" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={22} />
                    </button>
                    <div className="header-spacer" />
                    <h1 className="header-title">{t('profile.title')}</h1>
                    <div className="header-spacer" />
                    <button className="edit-btn">
                        <Edit2 size={18} />
                    </button>
                </div>

                <div className="profile-info">
                    <div className="profile-avatar">
                        <span className="avatar-emoji">👦🏽</span>
                    </div>
                    <h2 className="profile-name">{user.name}</h2>
                    <p className="profile-id">ID: {user.id} • {user.class}</p>
                </div>
            </header>

            {/* Stats Bar */}
            <div className="stats-bar">
                <div className="stat-item">
                    <span className="stat-label">{t('profile.attendance')}</span>
                    <span className="stat-value primary">{user.attendance}</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                    <span className="stat-label">{t('profile.juz')}</span>
                    <span className="stat-value">{user.juz}</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                    <span className="stat-label">{t('profile.grade')}</span>
                    <span className="stat-value">{user.grade}</span>
                </div>
            </div>

            {/* Main Content */}
            <main className="profile-content">
                {/* Personal Information */}
                <section className="section">
                    <h3 className="section-title">{t('profile.personalInfo')}</h3>
                    <Card className="info-card" padding="none">
                        {personalInfo.map((item, index) => (
                            <div key={item.id} className={`info-item ${index < personalInfo.length - 1 ? 'with-border' : ''}`}>
                                <div className="info-icon">
                                    <item.icon size={18} />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">{item.label}</span>
                                    <span className="info-value">{item.value}</span>
                                </div>
                                {item.action && (
                                    <button className="info-action">{item.action}</button>
                                )}
                            </div>
                        ))}
                    </Card>
                </section>

                {/* Academics */}
                <section className="section">
                    <h3 className="section-title">{t('profile.academics')}</h3>
                    <Card className="settings-card" padding="none">
                        {academicActions.map((action) => (
                            <button
                                key={action.id}
                                className="settings-item info"
                                onClick={() => navigate(`/${action.id}`)}
                            >
                                <div className="info-icon">
                                    <action.icon size={18} />
                                </div>
                                <span className="info-label">{action.label}</span>
                                {action.hasArrow && <ChevronRight size={18} className="arrow-icon" />}
                            </button>
                        ))}
                    </Card>
                </section>

                {/* App Settings */}
                <section className="section">
                    <h3 className="section-title">{t('profile.appSettings')}</h3>
                    <Card className="info-card" padding="none">
                        <button className="settings-item with-border clickable info" onClick={() => setShowLanguageModal(true)}>
                            <div className="info-icon">
                                <Globe size={18} />
                            </div>
                            <span className="info-label single">{t('profile.language')}</span>
                            <span className="language-value">{getCurrentLanguageLabel()}</span>
                            <ChevronRight size={18} className="arrow-icon" />
                        </button>

                        <div className="info-item with-border">
                            <div className="info-icon">
                                <Bell size={18} />
                            </div>
                            <span className="info-label single">{t('profile.notifications')}</span>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications}
                                    onChange={handleNotificationToggle}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">
                                <Moon size={18} />
                            </div>
                            <span className="info-label single">{t('profile.darkMode')}</span>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={isDarkMode}
                                    onChange={handleDarkModeToggle}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                    </Card>
                </section>

                {/* Sign Out Button */}
                <button className="signout-btn" onClick={() => navigate('/login')}>
                    <LogOut size={20} />
                    <span>{t('profile.signOut')}</span>
                </button>

                {/* Version */}
                <p className="version-text">{t('footer.version')}</p>
            </main >

            {/* Language Modal */}
            {
                showLanguageModal && (
                    <div className="modal-overlay" onClick={() => setShowLanguageModal(false)}>
                        <div className="language-modal" onClick={e => e.stopPropagation()}>
                            <h3 className="modal-title">{t('profile.selectLanguage')}</h3>
                            <div className="language-list">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                                        onClick={() => handleLanguageChange(lang.code)}
                                    >
                                        <div className="lang-info">
                                            <span className="lang-label">{lang.label}</span>
                                            <span className="lang-native">{lang.native}</span>
                                        </div>
                                        {i18n.language === lang.code && (
                                            <Check size={20} className="check-icon" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            <BottomNavbar />
        </div >
    );
};

export default Profile;
