import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Bell,
    User,
    Clock,
    ClipboardList,
    BookOpen,
    FileText,
    Users,
    ArrowRight,
    Check,
} from 'lucide-react';
import Card from '../../components/common/Card';
import TeacherBottomNavbar from '../../components/common/TeacherBottomNavbar';
import './TeacherDashboard.css';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    useTranslation();

    const teacherData = {
        name: 'Malam Ibrahim',
        hijriDate: '12 Rajab 1446 AH',
        gregorianDate: '23 Jan',
    };

    const upcomingClass = {
        title: 'Juz 30 Revision',
        classCode: 'Class 4B',
        location: 'Tahfeez Hall 2',
        startsIn: '15 mins',
        participants: 28,
    };

    const quickActions = [
        { id: 'attendance', icon: ClipboardList, label: 'Attendance', route: '/teacher/records' },
        { id: 'record', icon: BookOpen, label: 'Record Hifz', route: '/teacher/records' },
        { id: 'lesson', icon: FileText, label: 'Lesson Plan', route: '/teacher/classes' },
        { id: 'students', icon: Users, label: 'Students', route: '/teacher/classes' },
    ];

    const overview = [
        { id: 'attendance', label: "Today's Attendance", value: '92%', icon: ClipboardList },
        { id: 'reviews', label: 'Pending Reviews', value: '5', icon: FileText },
    ];

    const recentActivity = [
        {
            id: '1',
            student: 'Ahmed',
            action: 'completed Surah Al-Fatiha',
            group: 'Tahfeez Group A',
            time: '2 mins ago',
        },
    ];

    return (
        <div className="teacher-dashboard-page">
            {/* Header */}
            <header className="td-header">
                <div className="header-top">
                    <div className="logo">
                        <div className="logo-icon-box">
                            <BookOpen size={20} />
                        </div>
                        <span className="logo-text">MakTab</span>
                    </div>
                    <div className="header-actions">
                        <button className="header-btn">
                            <Bell size={22} />
                        </button>
                        <button className="header-btn avatar-btn">
                            <User size={20} />
                        </button>
                    </div>
                </div>

                <div className="greeting-section">
                    <h1 className="greeting-text">
                        Assalmu Alaikum,<br />
                        <span className="teacher-name">{teacherData.name}</span>
                    </h1>
                    <p className="date-text">
                        {teacherData.hijriDate} | {teacherData.gregorianDate}
                    </p>
                </div>

                {/* Upcoming Class Card */}
                <Card className="upcoming-card">
                    <div className="upcoming-header">
                        <span className="upcoming-badge">UP NEXT</span>
                        <div className="starts-in">
                            <Clock size={14} />
                            <span>Starts in {upcomingClass.startsIn}</span>
                        </div>
                        <button className="alarm-btn">
                            <Bell size={18} />
                        </button>
                    </div>
                    <h2 className="upcoming-title">{upcomingClass.title}</h2>
                    <p className="upcoming-details">
                        {upcomingClass.classCode} &nbsp; {upcomingClass.location}
                    </p>
                    <div className="upcoming-footer">
                        <div className="participants">
                            <div className="participant-avatars">
                                <span className="avatar" />
                                <span className="avatar" />
                                <span className="avatar" />
                            </div>
                            <span className="participant-count">+{upcomingClass.participants}</span>
                        </div>
                        <button className="start-session-btn" onClick={() => navigate('/teacher/records')}>
                            Start Session
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </Card>
            </header>

            {/* Main Content */}
            <main className="teacher-content">
                {/* Quick Actions */}
                <div className="quick-actions-grid">
                    {quickActions.map((action) => (
                        <button
                            key={action.id}
                            className="quick-action-btn"
                            onClick={() => navigate(action.route)}
                        >
                            <div className="action-icon">
                                <action.icon size={24} />
                            </div>
                            <span className="action-label">{action.label}</span>
                        </button>
                    ))}
                </div>

                {/* Overview Section */}
                <section className="section">
                    <h3 className="section-title">Overview</h3>
                    <div className="overview-grid">
                        {overview.map((item) => (
                            <Card key={item.id} className="overview-card" padding="md">
                                <div className="overview-icon">
                                    <item.icon size={18} />
                                </div>
                                <p className="overview-label">{item.label}</p>
                                <p className="overview-value">{item.value}</p>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Recent Activity */}
                <section className="section">
                    <div className="section-header">
                        <h3 className="section-title">Recent Activity</h3>
                        <button className="view-all-btn">View All</button>
                    </div>
                    <div className="activity-list">
                        {recentActivity.map((activity) => (
                            <Card key={activity.id} className="activity-card" padding="md">
                                <div className="activity-icon success">
                                    <Check size={16} />
                                </div>
                                <div className="activity-content">
                                    <p className="activity-text">
                                        <strong>{activity.student}</strong> {activity.action}
                                    </p>
                                    <p className="activity-meta">
                                        {activity.group} &nbsp;·&nbsp; {activity.time}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            </main>

            <TeacherBottomNavbar />
        </div>
    );
};

export default TeacherDashboard;
