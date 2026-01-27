import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings,
    Edit2,
    MapPin,
    User,
    Calendar,
    RotateCcw,
    Bell,
    Moon,
    ChevronRight,
    LogOut,
    Languages,
} from 'lucide-react';
import Card from '../../components/common/Card';
import TeacherBottomNavbar from '../../components/common/TeacherBottomNavbar';
import './TeacherProfile.css';

const TeacherProfile: React.FC = () => {
    const navigate = useNavigate();
    const [notifications] = useState(true);

    const teacher = {
        name: 'Malam Ibrahim',
        title: 'Senior Tahfeez Instructor',
        location: 'Bauchi, Nigeria',
        email: 'ibrahim.malam@maktab.ng',
        classes: 4,
        students: 34,
        experience: '5yr',
    };

    const accountInfo = [
        {
            id: 'personal',
            icon: User,
            label: 'Personal Information',
            sublabel: teacher.email,
            hasArrow: true,
        },
        {
            id: 'schedule',
            icon: Calendar,
            label: 'Teaching Schedule',
            hasArrow: true,
        },
        {
            id: 'history',
            icon: RotateCcw,
            label: 'Class History',
            hasArrow: true,
        },
    ];

    const appSetting = [
        {
            id: 'notification',
            icon: Bell,
            label: 'Notification',
            sublabel: notifications ? 'On' : 'Off',
            hasArrow: true,
        },
        {
            id: 'darkmode',
            icon: Moon,
            label: 'Dark Mode',
            hasArrow: true,
        },
        {
            id: 'language',
            icon: Languages,
            label: 'Language',
            hasArrow: true,
        },
    ];
    return (
        <div className="teacher-profile-page">
            {/* Header */}
            <header className="profile-header">
                <div className="header-top">
                    <div className="header-spacer" />
                    <h1 className="header-title">Profile</h1>
                    <button className="settings-btn">
                        <Settings size={22} />
                    </button>
                </div>

                {/* Profile Info */}
                <div className="profile-info">
                    <div className="avatar-container">
                        <div className="avatar-image">
                            <span className="avatar-emoji">👨‍🏫</span>
                        </div>
                        <button className="edit-avatar-btn">
                            <Edit2 size={14} />
                        </button>
                    </div>
                    <h2 className="profile-name">{teacher.name}</h2>
                    <p className="profile-title">{teacher.title}</p>
                    <div className="profile-location">
                        <MapPin size={14} />
                        <span>{teacher.location}</span>
                    </div>
                </div>
            </header>

            {/* Stats Bar */}
            <div className="stats-bar">
                <div className="stat-item">
                    <span className="stat-value">{teacher.classes}</span>
                    <span className="stat-label">Classes</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                    <span className="stat-value">{teacher.students}</span>
                    <span className="stat-label">Students</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                    <span className="stat-value">{teacher.experience}</span>
                    <span className="stat-label">Experience</span>
                </div>
            </div>

            {/* Main Content */}
            <main className="profile-content">
                {/* Account Info */}
                <section className="section">
                    <h3 className="section-title">Account Info</h3>
                    <Card className="info-card" padding="none">
                        {accountInfo.map((item, index) => (
                            <button
                                key={item.id}
                                className={`info-item ${index < accountInfo.length - 1 ? 'with-border' : ''}`}
                            >
                                <div className="info-icon">
                                    <item.icon size={18} />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">{item.label}</span>
                                    {item.sublabel && <span className="info-sublabel">{item.sublabel}</span>}
                                </div>
                                {item.hasArrow && <ChevronRight size={18} className="arrow-icon" />}
                            </button>
                        ))}
                    </Card>
                </section>

                {/* App Settings */}
                <section className="section">
                    <h3 className="section-title">App Settings</h3>
                    <Card className="info-card" padding="none">
                        {appSetting.map((item, index) => (
                            <button key={item.id} className={`info-item ${index < appSetting.length - 1 ? 'with-border' : ''}`}>
                                <div className="info-icon">
                                    <item.icon size={18} />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">{item.label}</span>
                                    {item.sublabel && <span className="info-sublabel">{item.sublabel}</span>}
                                </div>
                                {item.hasArrow && <ChevronRight size={18} className="arrow-icon" />}
                            </button>
                        ))}
                    </Card>
                </section>

                {/* Sign Out Button */}
                <button className="signout-btn" onClick={() => navigate('/')}>
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>

                {/* Version */}
                <p className="version-text">MakTab Tahfeez & Islamiyya App v1.0</p>
            </main>

            <TeacherBottomNavbar />
        </div>
    );
};

export default TeacherProfile;
