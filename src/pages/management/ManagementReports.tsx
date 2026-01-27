import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';
import Card from '../../components/common/Card';
import ManagementBottomNavbar from '../../components/common/ManagementBottomNavbar';
import './ManagementReports.css';

const ManagementReports: React.FC = () => {
    const navigate = useNavigate();

    const stats = [
        { id: 'students', label: 'STUDENTS', value: '1,240', change: '▲ 2.4%', positive: true },
        { id: 'teachers', label: 'TEACHERS', value: '86', change: '-0%', positive: false },
        { id: 'classes', label: 'CLASSES', value: '42', change: '+3', positive: true },
    ];

    const tahfeezProgress = [
        { id: '1', name: 'Halaqa A (Senior)', progress: 82, color: '#3B82F6' },
        { id: '2', name: 'Halaqa B (Intermediate)', progress: 64, color: '#3B82F6' },
        { id: '3', name: 'Halaqa C (Junior)', progress: 41, color: '#3B82F6' },
    ];

    const subjectScores = [
        { id: 'fiqh', name: 'FIQH', score: 78 },
        { id: 'hadith', name: 'HADITH', score: 84 },
        { id: 'tauhid', name: 'TAUHID', score: 91 },
        { id: 'sirah', name: 'SIRAH', score: 72 },
    ];

    const weekDays = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed'];

    return (
        <div className="management-reports-page">
            {/* Header */}
            <header className="reports-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="header-title">Performance Reports</h1>
                <button className="calendar-btn">
                    <Calendar size={20} />
                </button>
            </header>

            {/* Main Content */}
            <main className="reports-content">
                {/* Stats Cards */}
                <div className="stats-row">
                    {stats.map((stat, index) => (
                        <Card
                            key={stat.id}
                            className={`stats-card ${index === 0 ? 'primary' : ''}`}
                            padding="md"
                        >
                            <p className="stats-label">{stat.label}</p>
                            <p className="stats-value">{stat.value}</p>
                            <span className={`stats-change ${stat.positive ? 'positive' : 'neutral'}`}>
                                {stat.positive ? <TrendingUp size={12} /> : null}
                                {stat.change}
                            </span>
                        </Card>
                    ))}
                </div>

                {/* Attendance Trends */}
                <Card className="attendance-card">
                    <div className="attendance-header">
                        <div>
                            <h3 className="card-title">Attendance Trends</h3>
                            <p className="card-subtitle">School-wide weekly average</p>
                        </div>
                        <span className="attendance-avg">94% Average</span>
                    </div>
                    <div className="chart-placeholder">
                        <div className="chart-area" />
                    </div>
                    <div className="chart-x-axis">
                        {weekDays.map((day) => (
                            <span key={day}>{day}</span>
                        ))}
                    </div>
                </Card>

                {/* Tahfeez Progress */}
                <Card className="progress-card">
                    <div className="progress-header">
                        <div className="progress-icon">
                            📖
                        </div>
                        <div>
                            <h3 className="card-title">Average Tahfeez Progress</h3>
                            <p className="card-subtitle">Completion across all Halaqas</p>
                        </div>
                    </div>
                    <div className="progress-list">
                        {tahfeezProgress.map((item) => (
                            <div key={item.id} className="progress-item">
                                <div className="progress-info">
                                    <span className="progress-name">{item.name}</span>
                                    <span className="progress-percent">{item.progress}%</span>
                                </div>
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar"
                                        style={{
                                            width: `${item.progress}%`,
                                            backgroundColor: item.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Islamic Subjects Mastery */}
                <Card className="subjects-card">
                    <div className="subjects-header">
                        <div className="subjects-icon">
                            📚
                        </div>
                        <div>
                            <h3 className="card-title">Islamic Subjects Mastery</h3>
                            <p className="card-subtitle">Mid-term assessment average</p>
                        </div>
                    </div>
                    <div className="subjects-grid">
                        {subjectScores.map((subject) => (
                            <div key={subject.id} className="subject-item">
                                <span className="subject-name">{subject.name}</span>
                                <span className="subject-score">
                                    {subject.score}<span className="subject-max">/100</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </main>

            <ManagementBottomNavbar />
        </div>
    );
};

export default ManagementReports;
