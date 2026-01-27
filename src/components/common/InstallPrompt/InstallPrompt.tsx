import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import './InstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if user has previously dismissed the prompt
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed, 10);
            // Show again after 7 days
            if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
                return;
            }
        }

        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setShowPrompt(false);
            }
        } catch (error) {
            console.error('Install prompt error:', error);
        }

        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    if (!showPrompt) return null;

    return (
        <div className="install-prompt-overlay">
            <div className="install-prompt-card">
                <div className="install-prompt-icon">
                    <Download size={24} />
                </div>
                <div className="install-prompt-content">
                    <h3 className="install-prompt-title">Install MakTab</h3>
                    <p className="install-prompt-text">Add to home screen for quick access</p>
                </div>
                <div className="install-prompt-actions">
                    <button className="install-btn secondary" onClick={handleDismiss}>
                        <X size={16} />
                    </button>
                    <button className="install-btn primary" onClick={handleInstall}>
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
