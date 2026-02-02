import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PlatformSwitcher.css';

const PlatformSwitcher = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine the active platform based on the current path
    const isVox = location.pathname.startsWith('/tweets');
    const activePlatform = isVox ? 'vox' : 'vortex';

    const handleSwitch = (platform) => {
        if (platform === 'vortex') {
            navigate('/videos');
        } else {
            navigate('/tweets');
        }
    };

    return (
        <div className="platform-switcher-container">
            <div className="platform-switcher-pill">
                <div
                    className={`platform-option ${activePlatform === 'vortex' ? 'active' : ''}`}
                    onClick={() => handleSwitch('vortex')}
                >
                    <span className="platform-icon">🎬</span>
                    <span className="platform-name">Vortex</span>
                </div>
                <div
                    className={`platform-option ${activePlatform === 'vox' ? 'active' : ''}`}
                    onClick={() => handleSwitch('vox')}
                >
                    <span className="platform-icon">💬</span>
                    <span className="platform-name">Vox</span>
                </div>
                <div
                    className="platform-slider-bg"
                    style={{ transform: `translateX(${activePlatform === 'vortex' ? '0' : '100'}%)` }}
                />
            </div>
        </div>
    );
};

export default PlatformSwitcher;
