import React, { useState } from 'react';
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
    Languages,
    Bell,
    Moon,
    LogOut,
    ChevronRight,
} from 'lucide-react';
import Card from '../components/common/Card';
import BottomNavbar from '../components/common/BottomNavbar';
import { userProfile, tahfeezProgress } from '../data/studentData';
import './Profile.css';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const [notifications, setNotifications] = useState(userProfile.settings.notifications);
    const [darkMode, setDarkMode] = useState(userProfile.settings.darkMode);
    const [showLanguageModal, setShowLanguageModal] = useState(false);

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
        { id: 'name', icon: User, label: 'Full Name', value: user.fullName },
        { id: 'dob', icon: Calendar, label: 'Date of Birth', value: user.dateOfBirth },
        { id: 'guardian', icon: Phone, label: 'Guardian Contact', value: user.guardian, action: 'Update' },
    ];

    const academics = [
        { id: 'reports', icon: FileText, label: 'Academic Reports', hasArrow: true },
        { id: 'history', icon: Clock, label: 'Attendance History', hasArrow: true },
    ];

    const languages = [
        { code: 'en', label: 'English', native: 'English' },
        { code: 'ar', label: 'Arabic', native: 'العربية' },
        { code: 'ha', label: 'Hausa', native: 'Hausa' },
    ];

    const handleLanguageChange = (code: string) => {
        i18n.changeLanguage(code);
        setShowLanguageModal(false);
    };

    const handleLogout = () => {
        // Clear any stored data and navigate to onboarding
        navigate('/');
    };

    const handleNotificationToggle = () => {
        setNotifications(!notifications);
        // In a real app, this would persist to storage
    };

    const handleDarkModeToggle = () => {
        setDarkMode(!darkMode);
        // In a real app, this would toggle CSS variables
    };

    return (
        <div className="profile-page">
            {/* Gradient Header */}
            <header className="profile-header">
                <div className="header-top">
                    <button className="back-btn" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className="header-title">My Profile</h1>
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
                    <span className="stat-label">ATTENDANCE</span>
                    <span className="stat-value primary">{user.attendance}</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                    <span className="stat-label">JUZ</span>
                    <span className="stat-value">{user.juz}</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                    <span className="stat-label">GRADE</span>
                    <span className="stat-value">{user.grade}</span>
                </div>
            </div>

            {/* Main Content */}
            <main className="profile-content">
                {/* Personal Information */}
                <section className="section">
                    <h3 className="section-title">PERSONAL INFORMATION</h3>
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
                    <h3 className="section-title">ACADEMICS</h3>
                    <Card className="info-card" padding="none">
                        {academics.map((item, index) => (
                            <button key={item.id} className={`info-item clickable ${index < academics.length - 1 ? 'with-border' : ''}`}>
                                <div className="info-icon">
                                    <item.icon size={18} />
                                </div>
                                <span className="info-label single">{item.label}</span>
                                {item.hasArrow && <ChevronRight size={18} className="arrow-icon" />}
                            </button>
                        ))}
                    </Card>
                </section>

                {/* App Settings */}
                <section className="section">
                    <h3 className="section-title">APP SETTINGS</h3>
                    <Card className="info-card" padding="none">
                        <button
                            className="info-item with-border clickable"
                            onClick={() => setShowLanguageModal(true)}
                        >
                            <div className="info-icon">
                                <Languages size={18} />
                            </div>
                            <span className="info-label single">Language</span>
                            <span className="language-value">{i18n.language === 'ar' ? 'العربية' : i18n.language === 'ha' ? 'Hausa' : 'English'}</span>
                            <ChevronRight size={18} className="arrow-icon" />
                        </button>

                        <div className="info-item with-border">
                            <div className="info-icon">
                                <Bell size={18} />
                            </div>
                            <span className="info-label single">Notifications</span>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={notifications}
                                    onChange={handleNotificationToggle}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">
                                <Moon size={18} />
                            </div>
                            <span className="info-label single">Dark Mode</span>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={darkMode}
                                    onChange={handleDarkModeToggle}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                    </Card>
                </section>

                {/* Sign Out Button */}
                <button className="signout-btn" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>

                {/* Version */}
                <p className="version-text">MakTab Tahfeez & Islamiyya App v1.0</p>
            </main>

            {/* Language Modal */}
            {showLanguageModal && (
                <div className="modal-overlay" onClick={() => setShowLanguageModal(false)}>
                    <div className="language-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Select Language</h3>
                        <div className="language-list">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                                    onClick={() => handleLanguageChange(lang.code)}
                                >
                                    <span className="lang-label">{lang.label}</span>
                                    <span className="lang-native">{lang.native}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <BottomNavbar />
        </div>
    );
};

export default Profile;
