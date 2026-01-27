import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, MapPin } from 'lucide-react';
import Card from '../components/common/Card';
import BottomNavbar from '../components/common/BottomNavbar';
import './Qibla.css';

const Qibla: React.FC = () => {
    const navigate = useNavigate();
    const [qiblaDirection, setQiblaDirection] = useState(135); // Default direction to Makkah
    const [compassRotation, setCompassRotation] = useState(0);
    const [location, setLocation] = useState({ lat: 9.0765, lng: 7.3986 }); // Default: Abuja, Nigeria
    const [locationName, setLocationName] = useState('Abuja, Nigeria');
    const [distanceToMakkah, setDistanceToMakkah] = useState('4,732 km');

    // Makkah coordinates
    const makkah = { lat: 21.4225, lng: 39.8262 };

    // Calculate Qibla direction
    useEffect(() => {
        const calculateQiblaDirection = (lat: number, lng: number) => {
            const latRad = (lat * Math.PI) / 180;
            const lngRad = (lng * Math.PI) / 180;
            const makkahLatRad = (makkah.lat * Math.PI) / 180;
            const makkahLngRad = (makkah.lng * Math.PI) / 180;

            const x = Math.sin(makkahLngRad - lngRad);
            const y = Math.cos(latRad) * Math.tan(makkahLatRad) -
                Math.sin(latRad) * Math.cos(makkahLngRad - lngRad);

            let qibla = Math.atan2(x, y) * (180 / Math.PI);
            if (qibla < 0) qibla += 360;

            return qibla;
        };

        const direction = calculateQiblaDirection(location.lat, location.lng);
        setQiblaDirection(Math.round(direction));
    }, [location]);

    // Simulate compass rotation (in real app, would use device orientation)
    useEffect(() => {
        const interval = setInterval(() => {
            // Small random movement to simulate compass
            setCompassRotation((prev) => prev + (Math.random() - 0.5) * 2);
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const prayerTimes = [
        { name: 'Fajr', time: '05:30 AM', active: false },
        { name: 'Dhuhr', time: '01:15 PM', active: false },
        { name: 'Asr', time: '04:30 PM', active: true },
        { name: 'Maghrib', time: '06:45 PM', active: false },
        { name: 'Isha', time: '08:00 PM', active: false },
    ];

    return (
        <div className="qibla-page">
            {/* Header */}
            <header className="qibla-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={22} />
                </button>
                <h1 className="header-title">Qibla Direction</h1>
                <div className="header-spacer" />
            </header>

            {/* Main Content */}
            <main className="qibla-content">
                {/* Location Card */}
                <Card className="location-card" padding="md">
                    <div className="location-icon">
                        <MapPin size={20} />
                    </div>
                    <div className="location-info">
                        <span className="location-name">{locationName}</span>
                        <span className="location-distance">{distanceToMakkah} to Makkah</span>
                    </div>
                </Card>

                {/* Compass */}
                <div className="compass-container">
                    <div
                        className="compass"
                        style={{ transform: `rotate(${compassRotation}deg)` }}
                    >
                        <div className="compass-ring">
                            <span className="direction n">N</span>
                            <span className="direction e">E</span>
                            <span className="direction s">S</span>
                            <span className="direction w">W</span>
                        </div>
                        <div
                            className="qibla-pointer"
                            style={{ transform: `rotate(${qiblaDirection - compassRotation}deg)` }}
                        >
                            <Navigation size={32} />
                        </div>
                        <div className="compass-center">
                            <span className="kaaba-icon">🕋</span>
                        </div>
                    </div>
                    <p className="qibla-degrees">{qiblaDirection}° from North</p>
                </div>

                {/* Prayer Times */}
                <section className="prayer-section">
                    <h3 className="section-title">Prayer Times</h3>
                    <Card className="prayer-card" padding="md">
                        <div className="prayer-list">
                            {prayerTimes.map((prayer) => (
                                <div
                                    key={prayer.name}
                                    className={`prayer-item ${prayer.active ? 'active' : ''}`}
                                >
                                    <span className="prayer-name">{prayer.name}</span>
                                    <span className="prayer-time">{prayer.time}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </section>
            </main>

            <BottomNavbar />
        </div>
    );
};

export default Qibla;
