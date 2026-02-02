import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ context }) => {
    return (
        <aside className="app-sidebar">
            <nav className="sidebar-nav">
                {context === 'vox' ? (
                    <>
                        <Link to="/tweets" className="nav-link">
                            <span className="nav-icon">🏠</span> Home Feed
                        </Link>
                        <Link to="/explore" className="nav-link">
                            <span className="nav-icon">🔍</span> Explore
                        </Link>
                        <Link to="/notifications" className="nav-link">
                            <span className="nav-icon">🔔</span> Notifications
                        </Link>
                        <Link to="/trending" className="nav-link">
                            <span className="nav-icon">📈</span> Trending
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/" className="nav-link">
                            <span className="nav-icon">🏠</span> Home
                        </Link>
                        <Link to="/history" className="nav-link">
                            <span className="nav-icon">🕒</span> History
                        </Link>
                        <Link to="/liked-videos" className="nav-link">
                            <span className="nav-icon">❤️</span> Liked Videos
                        </Link>
                        <Link to="/subscriptions" className="nav-link">
                            <span className="nav-icon">👥</span> Subscriptions
                        </Link>
                        <Link to="/my-playlists" className="nav-link">
                            <span className="nav-icon">📁</span> My Playlists
                        </Link>
                        <div style={{ margin: '1rem 0', borderTop: '1px solid var(--color-border)' }}></div>
                        <Link to="/my-videos" className="nav-link">
                            <span className="nav-icon">🎬</span> My Videos
                        </Link>
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
