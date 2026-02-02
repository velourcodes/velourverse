import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './Header.css';

const Header = ({ context }) => {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
    };

    const handleLogout = async () => {
        setIsDropdownOpen(false);
        await logout();
        navigate('/login');
    };

    return (
        <header className="app-header">
            <div className="header-content">
                <Link to="/" className="logo-section">
                    <img src="/logo.svg" alt="Velour Logo" className="header-logo" />
                    <span className="logo gradient-text">
                        Velour {context === 'vox' ? 'Vox' : 'Vortex'}
                    </span>
                </Link>
                <div className="header-right">
                    {user ? (
                        <div className="user-profile-actions" ref={dropdownRef}>
                            {context === 'vortex' && location.pathname !== '/my-videos' && (
                                <button className="btn-upload-header" onClick={() => navigate('/upload')}>
                                    Upload Video
                                </button>
                            )}

                            <div className="profile-dropdown-container">
                                <div
                                    className={`user-info ${isDropdownOpen ? 'active' : ''}`}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span className="username" onClick={(e) => { e.stopPropagation(); navigate(`/channel/${user.username}`); setIsDropdownOpen(false); }}>
                                        {user.username}
                                    </span>
                                    <div className="user-avatar-small" onClick={(e) => { e.stopPropagation(); navigate(`/channel/${user.username}`); setIsDropdownOpen(false); }}>
                                        {user.avatar?.secure_url ? (
                                            <img src={user.avatar.secure_url} alt={user.username} />
                                        ) : (
                                            <div className="avatar-placeholder-small">👤</div>
                                        )}
                                    </div>
                                    <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▾</span>
                                </div>

                                {isDropdownOpen && (
                                    <div className="premium-dropdown">
                                        <div className="dropdown-header">
                                            <p className="user-full-name">{user.fullName}</p>
                                            <p className="user-email-text">{user.email}</p>
                                        </div>

                                        <div className="dropdown-divider"></div>

                                        <Link to={`/channel/${user.username}`} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                            <span className="item-icon">👤</span> Your Channel
                                        </Link>
                                        <Link to="/dashboard" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                            <span className="item-icon">📊</span> Channel Dashboard
                                        </Link>
                                        <Link to="/settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                            <span className="item-icon">⚙️</span> Settings
                                        </Link>

                                        <div className="dropdown-divider"></div>

                                        <div className="theme-switcher-section">
                                            <p className="section-title">Theme</p>
                                            <div className="theme-options">
                                                <button
                                                    className={`theme-opt ${theme === 'light' ? 'active' : ''}`}
                                                    onClick={() => handleThemeChange('light')}
                                                    title="Light Mode"
                                                >☀️</button>
                                                <button
                                                    className={`theme-opt ${theme === 'dark' ? 'active' : ''}`}
                                                    onClick={() => handleThemeChange('dark')}
                                                    title="Dark Mode"
                                                >🌙</button>
                                                <button
                                                    className={`theme-opt ${theme === 'system' ? 'active' : ''}`}
                                                    onClick={() => handleThemeChange('system')}
                                                    title="System Preference"
                                                >💻</button>
                                            </div>
                                        </div>

                                        <div className="dropdown-divider"></div>

                                        <button onClick={handleLogout} className="dropdown-item logout-item">
                                            <span className="item-icon">🚪</span> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="login-link">Login</Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
