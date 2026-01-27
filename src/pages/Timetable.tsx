import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, User } from 'lucide-react';
import Card from '../components/common/Card';
import BottomNavbar from '../components/common/BottomNavbar';
import { getScheduleByDay, getTypeColor } from '../data/studentData';
import './Timetable.css';

type DayType = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

const Timetable: React.FC = () => {
    const navigate = useNavigate();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
                <h1 className="header-title">Timetable</h1>
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
                    {dayLabels[days.indexOf(selectedDay)]}day
                    {selectedDay === today && <span className="today-badge">Today</span>}
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
                        <h3 className="empty-title">No Classes</h3>
                        <p className="empty-text">You don't have any classes scheduled for this day.</p>
                    </div>
                )}
            </main>

            <BottomNavbar />
        </div>
    );
};

export default Timetable;
