import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { storage, STORAGE_KEYS, QuranSettings, DEFAULT_QURAN_SETTINGS } from '../../services/storageService';
import './QuranSettings.css';

interface QuranSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const QuranSettingsModal: React.FC<QuranSettingsModalProps> = ({ isOpen, onClose }) => {
    const [settings, setSettings] = useState<QuranSettings>(DEFAULT_QURAN_SETTINGS);
    const { t } = useTranslation();

    useEffect(() => {
        if (isOpen) {
            const savedSettings = storage.get<QuranSettings>(STORAGE_KEYS.QURAN_SETTINGS, DEFAULT_QURAN_SETTINGS);
            setSettings(savedSettings);
        }
    }, [isOpen]);

    const handleChange = <K extends keyof QuranSettings>(key: K, value: QuranSettings[K]) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        storage.set(STORAGE_KEYS.QURAN_SETTINGS, newSettings);
    };

    const reciters = [
        { id: 'mishary-rashid', name: 'Mishary Rashid Alafasy' },
        { id: 'abdul-basit', name: 'Abdul Basit Abdul Samad' },
        { id: 'sudais', name: 'Abdul Rahman Al-Sudais' },
        { id: 'ghamdi', name: 'Saad Al-Ghamdi' },
        { id: 'minshawi', name: 'Mohamed Siddiq Al-Minshawi' },
    ];

    if (!isOpen) return null;

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={e => e.stopPropagation()}>
                <div className="settings-header">
                    <h2 className="settings-title">{t('quranSettings.title')}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="settings-content">
                    {/* Font Size */}
                    <div className="setting-group">
                        <label className="setting-label">{t('quranSettings.arabicFontSize')}</label>
                        <div className="font-size-control">
                            <span className="font-preview" style={{ fontSize: `${settings.fontSize}px` }}>
                                بِسْمِ اللَّهِ
                            </span>
                            <input
                                type="range"
                                min="16"
                                max="40"
                                value={settings.fontSize}
                                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                                className="font-slider"
                            />
                            <span className="font-size-value">{settings.fontSize}px</span>
                        </div>
                    </div>

                    {/* Reciter Selection */}
                    <div className="setting-group">
                        <label className="setting-label">{t('quranSettings.reciter')}</label>
                        <select
                            className="setting-select"
                            value={settings.reciter}
                            onChange={(e) => handleChange('reciter', e.target.value)}
                        >
                            {reciters.map(reciter => (
                                <option key={reciter.id} value={reciter.id}>
                                    {reciter.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Show Translation */}
                    <div className="setting-group row">
                        <label className="setting-label">{t('quranSettings.showTranslation')}</label>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.showTranslation}
                                onChange={(e) => handleChange('showTranslation', e.target.checked)}
                            />
                            <span className="toggle-slider-round" />
                        </label>
                    </div>

                    {/* Translation Language */}
                    {settings.showTranslation && (
                        <div className="setting-group">
                            <label className="setting-label">{t('quranSettings.translationLanguage')}</label>
                            <div className="radio-group">
                                <label className={`radio-option ${settings.translationLanguage === 'en' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="translationLanguage"
                                        value="en"
                                        checked={settings.translationLanguage === 'en'}
                                        onChange={() => handleChange('translationLanguage', 'en')}
                                    />
                                    <span>{t('languages.english')}</span>
                                </label>
                                <label className={`radio-option ${settings.translationLanguage === 'ha' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="translationLanguage"
                                        value="ha"
                                        checked={settings.translationLanguage === 'ha'}
                                        onChange={() => handleChange('translationLanguage', 'ha')}
                                    />
                                    <span>{t('languages.hausa')}</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Reading Mode */}
                    <div className="setting-group">
                        <label className="setting-label">{t('quranSettings.readingMode')}</label>
                        <div className="radio-group">
                            <label className={`radio-option ${settings.readingMode === 'page' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="readingMode"
                                    value="page"
                                    checked={settings.readingMode === 'page'}
                                    onChange={() => handleChange('readingMode', 'page')}
                                />
                                <span>{t('quranSettings.pageByPage')}</span>
                            </label>
                            <label className={`radio-option ${settings.readingMode === 'continuous' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="readingMode"
                                    value="continuous"
                                    checked={settings.readingMode === 'continuous'}
                                    onChange={() => handleChange('readingMode', 'continuous')}
                                />
                                <span>{t('quranSettings.continuous')}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="settings-footer">
                    <button className="save-btn" onClick={onClose}>
                        {t('common.done')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuranSettingsModal;
