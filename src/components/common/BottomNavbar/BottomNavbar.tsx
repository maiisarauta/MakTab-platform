import React from 'react';
// import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Calendar, User, Plus, LucideIcon } from 'lucide-react';
import './BottomNavbar.css';

interface NavItem {
    id: string;
    icon: LucideIcon;
    label: string;
    route: string;
}

const BottomNavbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // const { t } = useTranslation();

    const navItems: NavItem[] = [
        { id: 'home', icon: Home, label: 'Home', route: '/dashboard' },
        { id: 'quran', icon: BookOpen, label: "Qur'an", route: '/quran' },
        { id: 'timetable', icon: Calendar, label: 'Schedule', route: '/timetable' },
        { id: 'profile', icon: User, label: 'Profile', route: '/profile' },
    ];

    const isActive = (route: string) => location.pathname === route;

    const handleAddClick = () => {
        // Navigate to Log Practice page
        navigate('/log-practice');
    };

    return (
        <nav className="bottom-navbar">
            <div className="nav-items">
                {navItems.slice(0, 2).map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${isActive(item.route) ? 'active' : ''}`}
                        onClick={() => navigate(item.route)}
                    >
                        <item.icon size={22} className="nav-icon" />
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}

                {/* Center Add Button - navigates to Log Practice */}
                <button className="nav-add-btn" onClick={handleAddClick}>
                    <Plus size={24} />
                </button>

                {navItems.slice(2).map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${isActive(item.route) ? 'active' : ''}`}
                        onClick={() => navigate(item.route)}
                    >
                        <item.icon size={22} className="nav-icon" />
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default BottomNavbar;
