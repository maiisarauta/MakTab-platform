import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import './AudioPlayer.css';

interface AudioPlayerProps {
    audioUrl?: string;
    audioBlob?: Blob;
    compact?: boolean;
    label?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
    audioUrl,
    audioBlob,
    compact = false,
    label = 'Play Audio'
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Create URL from blob if needed
    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        if (audioBlob) {
            const url = URL.createObjectURL(audioBlob);
            setBlobUrl(url);
            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [audioBlob]);

    const src = audioUrl || blobUrl;

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setIsLoaded(true);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [src]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newTime = parseFloat(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (time: number): string => {
        if (!isFinite(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!src) {
        return null;
    }

    if (compact) {
        return (
            <div className="audio-player-compact">
                <audio ref={audioRef} src={src} preload="metadata" />
                <button
                    className={`audio-play-btn ${isPlaying ? 'playing' : ''}`}
                    onClick={togglePlay}
                    disabled={!isLoaded}
                >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    <span>{label}</span>
                </button>
                {isPlaying && (
                    <span className="audio-time">{formatTime(currentTime)}</span>
                )}
            </div>
        );
    }

    return (
        <div className="audio-player">
            <audio ref={audioRef} src={src} preload="metadata" />
            <button
                className={`audio-control-btn ${isPlaying ? 'playing' : ''}`}
                onClick={togglePlay}
                disabled={!isLoaded}
            >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className="audio-progress-wrapper">
                <input
                    type="range"
                    className="audio-progress"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    disabled={!isLoaded}
                />
                <div
                    className="audio-progress-fill"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
            </div>
            <span className="audio-duration">
                {formatTime(currentTime)} / {formatTime(duration)}
            </span>
        </div>
    );
};

export default AudioPlayer;
