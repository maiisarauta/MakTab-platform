import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, User } from 'lucide-react';
import Card from '../components/common/Card';
import BottomNavbar from '../components/common/BottomNavbar';
import { getScheduleByDay, getTypeColor } from '../data/studentData';
import './Timetable.css';

type DayType = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

const Timetable: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayLabels = [
        t('timetable.sun'),
        t('timetable.mon'),
        t('timetable.tue'),
        t('timetable.wed'),
        t('timetable.thu'),
        t('timetable.fri'),
        t('timetable.sat')
    ];

    const today = days[new Date().getDay()] as DayType;
    const [selectedDay, setSelectedDay] = useState<DayType>(today);

    const todaySchedule = getScheduleByDay(selectedDay);

    return (
        <div className="timetable-page">
            {/* Header */}
            <header className="timetable-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="header-title">{t('timetable.title')}</h1>
                <div className="header-spacer" />
            </header>

            {/* Day Tabs */}
            <div className="day-tabs-container">
                <div className="day-tabs">
                    {days.map((day, index) => (
                        <button
                            key={day}
                            className={`day-tab ${selectedDay === day ? 'active' : ''} ${day === today ? 'today' : ''}`}
                            onClick={() => setSelectedDay(day as DayType)}
                        >
                            <span className="day-label">{dayLabels[index]}</span>
                            {day === today && <span className="today-dot" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Schedule Content */}
            <main className="timetable-content">
                <h2 className="day-title">
                    {t(`timetable.${selectedDay}`)}
                    {selectedDay === today && <span className="today-badge">{t('timetable.today')}</span>}
                </h2>

                {todaySchedule.length > 0 ? (
                    <div className="schedule-list">
                        {todaySchedule.map((item) => {
                            const typeColor = getTypeColor(item.type);
                            return (
                                <Card key={item.id} className="schedule-card" padding="md">
                                    <div className="schedule-time">
                                        <Clock size={16} />
                                        <span>{item.startTime} - {item.endTime}</span>
                                    </div>
                                    <div className="schedule-content">
                                        <div className="schedule-header">
                                            <h3 className="schedule-subject">{item.subject}</h3>
                                            <span
                                                className="schedule-type"
                                                style={{ backgroundColor: typeColor.bg, color: typeColor.text }}
                                            >
                                                {item.type}
                                            </span>
                                        </div>
                                        <div className="schedule-details">
                                            <span className="detail-item">
                                                <MapPin size={14} />
                                                {item.location}
                                            </span>
                                            <span className="detail-item">
                                                <User size={14} />
                                                {item.teacher}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📚</div>
                        <h3 className="empty-title">{t('timetable.noClasses')}</h3>
                        <p className="empty-text">{t('timetable.noClassesHint')}</p>
                    </div>
                )}
            </main>

            <BottomNavbar />
        </div>
    );
};

export default Timetable;
