import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    User,
    Clock,
    MoreVertical,
    ClipboardList,
    BookOpen,
    Users,
} from 'lucide-react';
import Card from '../../components/common/Card';
import TeacherBottomNavbar from '../../components/common/TeacherBottomNavbar';
import './TeacherClasses.css';

type ClassType = 'all' | 'tahfeez' | 'islamiyya' | 'tajweed';

interface ClassItem {
    id: string;
    name: string;
    type: 'tahfeez' | 'islamiyya' | 'tajweed';
    schedule: string;
    location: string;
    students: number;
}

const TeacherClasses: React.FC = () => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<ClassType>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filters: { id: ClassType; label: string }[] = [
        { id: 'all', label: 'All Classes' },
        { id: 'tahfeez', label: 'Tahfeez' },
        { id: 'islamiyya', label: 'Islamiyya' },
    ];

    const classes: ClassItem[] = [
        {
            id: '1',
            name: 'Halaqah Group A (Juz 1 - 5)',
            type: 'tahfeez',
            schedule: '04:00 PM',
            location: 'Main Hall',
            students: 28,
        },
        {
            id: '2',
            name: 'Fiqhu & Hadith (Level 2)',
            type: 'islamiyya',
            schedule: 'Mon, Wed',
            location: 'Room 104',
            students: 34,
        },
        {
            id: '3',
            name: 'Tajweed Fundamentals',
            type: 'tajweed',
            schedule: 'Fri Only',
            location: 'Library Hall',
            students: 12,
        },
    ];

    const filteredClasses = classes.filter((c) => {
        if (activeFilter !== 'all' && c.type !== activeFilter) return false;
        if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'tahfeez':
                return { bg: '#DBEAFE', text: '#2563EB' };
            case 'islamiyya':
                return { bg: '#D1FAE5', text: '#059669' };
            case 'tajweed':
                return { bg: '#F3E8FF', text: '#9333EA' };
            default:
                return { bg: '#E5E7EB', text: '#4B5563' };
        }
    };

    return (
        <div className="teacher-classes-page">
            {/* Header */}
            <header className="classes-header">
                <div className="header-top">
                    <div className="logo">
                        <div className="logo-icon-box">
                            <BookOpen size={20} />
                        </div>
                        <span className="logo-text">MakTab</span>
                    </div>
                    <div className="header-actions">
                        <button className="header-btn">
                            <Plus size={22} />
                        </button>
                        <button className="header-btn avatar-btn">
                            <User size={20} />
                        </button>
                    </div>
                </div>

                <h1 className="page-title">My Classes</h1>

                {/* Search */}
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search class, students..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filters */}
                <div className="filter-tabs">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter.id)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Classes List */}
            <main className="classes-content">
                <div className="classes-list">
                    {filteredClasses.map((classItem) => {
                        const typeColor = getTypeColor(classItem.type);
                        return (
                            <Card
                                key={classItem.id}
                                className="class-card"
                                padding="none"
                                onClick={() => navigate(`/teacher/records/${classItem.id}`)}
                            >
                                <div className="class-header">
                                    <span
                                        className="class-type-badge"
                                        style={{ backgroundColor: typeColor.bg, color: typeColor.text }}
                                    >
                                        {classItem.type}
                                    </span>
                                    <div className="class-schedule">
                                        <Clock size={16} />
                                        <span>{classItem.schedule}</span>
                                    </div>
                                    <button className="more-btn" onClick={(e) => e.stopPropagation()}>
                                        <MoreVertical size={20} />
                                    </button>
                                </div>

                                <h3 className="class-name">{classItem.name}</h3>
                                <p className="class-location">
                                    {classItem.location} &nbsp; {classItem.students} Students
                                </p>

                                <div className="class-participants">
                                    <div className="participant-avatars">
                                        <div className="avatar" />
                                        <div className="avatar" />
                                        <div className="avatar" />
                                        <span className="participant-count">+{classItem.students - 3}</span>
                                    </div>
                                    <div className="participant-divider" />
                                </div>

                                <div className="class-actions">
                                    <button
                                        className="class-action-btn attendance"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/teacher/records');
                                        }}
                                    >
                                        <div className="action-icon-container">
                                            <ClipboardList size={22} />
                                        </div>
                                        <span>Attendance</span>
                                    </button>

                                    <button
                                        className="class-action-btn record"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/teacher/records');
                                        }}
                                    >
                                        <div className="action-icon-container">
                                            <BookOpen size={22} />
                                        </div>
                                        <span>Record Hifz</span>
                                    </button>

                                    <button
                                        className="class-action-btn roster"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/teacher/records');
                                        }}
                                    >
                                        <div className="action-icon-container">
                                            <Users size={22} />
                                        </div>
                                        <span>Roster</span>
                                    </button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </main>

            <TeacherBottomNavbar />
        </div>
    );
};

export default TeacherClasses;
