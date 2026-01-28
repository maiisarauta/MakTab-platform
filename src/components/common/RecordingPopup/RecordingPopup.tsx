import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Square, X } from 'lucide-react';
import { useAudioRecording } from '../../../hooks/useAudioRecording';
import './RecordingPopup.css';

interface RecordingPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onRecordingComplete: (blob: Blob, duration: number) => void;
    countdownSeconds?: number;
}

type PopupState = 'countdown' | 'recording' | 'complete' | 'error';

const RecordingPopup: React.FC<RecordingPopupProps> = ({
    isOpen,
    onClose,
    onRecordingComplete,
    countdownSeconds = 3
}) => {
    const [state, setState] = useState<PopupState>('countdown');
    const [countdown, setCountdown] = useState(countdownSeconds);
    const { t } = useTranslation();

    const {
        isRecording,
        recordingTime,
        audioBlob,
        error,
        startRecording,
        stopRecording,
        resetRecording
    } = useAudioRecording();

    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            setState('countdown');
            setCountdown(countdownSeconds);
            resetRecording();
        }
    }, [isOpen, countdownSeconds, resetRecording]);

    // Countdown logic
    useEffect(() => {
        if (!isOpen || state !== 'countdown') return;

        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            // Start recording after countdown
            setState('recording');
            startRecording();
        }
    }, [isOpen, state, countdown, startRecording]);

    // Handle recording errors
    useEffect(() => {
        if (error) {
            setState('error');
        }
    }, [error]);

    // Handle recording complete
    useEffect(() => {
        if (audioBlob && !isRecording && state === 'recording') {
            setState('complete');
        }
    }, [audioBlob, isRecording, state]);

    const handleStopRecording = useCallback(() => {
        stopRecording();
    }, [stopRecording]);

    const handleSave = useCallback(() => {
        if (audioBlob) {
            onRecordingComplete(audioBlob, recordingTime);
            onClose();
        }
    }, [audioBlob, recordingTime, onRecordingComplete, onClose]);

    const handleCancel = useCallback(() => {
        if (isRecording) {
            stopRecording();
        }
        resetRecording();
        onClose();
    }, [isRecording, stopRecording, resetRecording, onClose]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="recording-popup-overlay" onClick={handleCancel}>
            <div className="recording-popup" onClick={e => e.stopPropagation()}>
                <button className="popup-close-btn" onClick={handleCancel}>
                    <X size={24} />
                </button>

                {/* Countdown State */}
                {state === 'countdown' && (
                    <div className="countdown-container">
                        <div className="countdown-ring">
                            <div className="countdown-number" key={countdown}>
                                {countdown}
                            </div>
                        </div>
                        <p className="countdown-text">{t('recording.getReady')}</p>
                        <p className="countdown-hint">{t('recording.recordingWillStartIn', { seconds: countdown })}</p>
                    </div>
                )}

                {/* Recording State */}
                {state === 'recording' && (
                    <div className="recording-container">
                        <div className="recording-indicator">
                            <div className="recording-pulse" />
                            <Mic size={32} className="recording-icon" />
                        </div>
                        <p className="recording-status">{t('recording.recording')}</p>
                        <p className="recording-timer">{formatTime(recordingTime)}</p>
                        <button className="stop-recording-btn" onClick={handleStopRecording}>
                            <Square size={24} />
                            <span>{t('recording.stopRecording')}</span>
                        </button>
                    </div>
                )}

                {/* Complete State */}
                {state === 'complete' && (
                    <div className="complete-container">
                        <div className="complete-icon">✓</div>
                        <p className="complete-text">{t('recording.recordingComplete')}</p>
                        <p className="complete-duration">{t('recording.duration')}: {formatTime(recordingTime)}</p>
                        <div className="complete-actions">
                            <button className="action-btn secondary" onClick={handleCancel}>
                                {t('common.discard')}
                            </button>
                            <button className="action-btn primary" onClick={handleSave}>
                                {t('recording.saveRecording')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {state === 'error' && (
                    <div className="error-container">
                        <div className="error-icon">!</div>
                        <p className="error-text">{error || t('recording.failed')}</p>
                        <button className="action-btn secondary" onClick={handleCancel}>
                            {t('common.back')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecordingPopup;
