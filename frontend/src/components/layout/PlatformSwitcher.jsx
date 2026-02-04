import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PlatformSwitcher.css';

const PlatformSwitcher = ({ context }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine the active platform based on prop or current path
    const isVoxPath = location.pathname.startsWith('/tweets');
    const activePlatform = context || (isVoxPath ? 'vox' : 'vortex');
    const isVox = activePlatform === 'vox';

    // Auto-hide logic
    const [isVisible, setIsVisible] = React.useState(true);
    const lastScrollY = React.useRef(0);

    React.useEffect(() => {
        const controlSwitcher = () => {
            if (typeof window !== 'undefined') {
                if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
                    // Scrolling DOWN and not at top
                    setIsVisible(false);
                } else {
                    // Scrolling UP or at top
                    setIsVisible(true);
                }
                lastScrollY.current = window.scrollY;
            }
        };

        window.addEventListener('scroll', controlSwitcher);
        return () => window.removeEventListener('scroll', controlSwitcher);
    }, []);

    const handleSwitch = (platform) => {
        if (platform === 'vortex') {
            navigate('/videos');
        } else {
            navigate('/tweets');
        }
    };

    return (
        <div
            className={`platform-switcher-container ${isVox ? 'vox-mode' : ''}`}
            style={{
                transform: `translateX(-50%) ${isVisible ? 'translateY(0)' : 'translateY(200%)'}`,
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
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
