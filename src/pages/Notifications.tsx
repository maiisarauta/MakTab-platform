import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCheck, Trophy, AlertCircle, Megaphone, Clock } from 'lucide-react';
import Card from '../components/common/Card';
import BottomNavbar from '../components/common/BottomNavbar';
import { notifications as initialNotifications, Notification } from '../data/studentData';
import './Notifications.css';

const Notifications: React.FC = () => {
    const navigate = useNavigate();
    const [notificationList, setNotificationList] = useState<Notification[]>(initialNotifications);

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'reminder':
                return <Bell size={18} />;
            case 'achievement':
                return <Trophy size={18} />;
            case 'alert':
                return <AlertCircle size={18} />;
            case 'announcement':
                return <Megaphone size={18} />;
            default:
                return <Bell size={18} />;
        }
    };

    const getIconClass = (type: Notification['type']) => {
        switch (type) {
            case 'reminder':
                return 'reminder';
            case 'achievement':
                return 'achievement';
            case 'alert':
                return 'alert';
            case 'announcement':
                return 'announcement';
            default:
                return '';
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const markAsRead = (id: string) => {
        setNotificationList(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotificationList(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    };

    const unreadCount = notificationList.filter(n => !n.read).length;

    return (
        <div className="notifications-page">
            {/* Header */}
            <header className="notifications-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="header-title">Notifications</h1>
                {unreadCount > 0 && (
                    <button className="mark-read-btn" onClick={markAllAsRead}>
                        <CheckCheck size={20} />
                    </button>
                )}
            </header>

            {/* Unread Badge */}
            {unreadCount > 0 && (
                <div className="unread-banner">
                    <span>{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</span>
                </div>
            )}

            {/* Main Content */}
            <main className="notifications-content">
                {notificationList.length > 0 ? (
                    <div className="notifications-list">
                        {notificationList.map((notification) => (
                            <Card
                                key={notification.id}
                                className={`notification-card ${!notification.read ? 'unread' : ''}`}
                                padding="md"
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className={`notification-icon ${getIconClass(notification.type)}`}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="notification-content">
                                    <h4 className="notification-title">{notification.title}</h4>
                                    <p className="notification-message">{notification.message}</p>
                                    <span className="notification-time">
                                        <Clock size={12} />
                                        {formatTime(notification.timestamp)}
                                    </span>
                                </div>
                                {!notification.read && <span className="unread-dot" />}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">🔔</div>
                        <h3 className="empty-title">No Notifications</h3>
                        <p className="empty-text">You're all caught up! Check back later.</p>
                    </div>
                )}
            </main>

            <BottomNavbar />
        </div>
    );
};

export default Notifications;
