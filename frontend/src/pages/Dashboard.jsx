import React, { useState, useEffect, useCallback } from 'react';
import { getChannelStats } from '../api/dashboard.api';
import { useFeedback } from '../context/FeedbackContext';
import { getRelativeTime } from '../utils/timeUtils';
import {
    FiEye, FiUsers, FiHeart, FiVideo,
    FiRefreshCw, FiMessageSquare, FiTrendingUp,
    FiStar
} from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [commentTab, setCommentTab] = useState('recent'); // 'recent' or 'top'
    const [subscriberTab, setSubscriberTab] = useState('newest'); // 'newest' or 'oldest'
    const { setFeedback } = useFeedback();

    const fetchDashboardData = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const response = await getChannelStats();
            setStats(response.data.data);

            if (isRefresh) {
                setFeedback({
                    type: 'success',
                    message: 'Dashboard updated with latest data'
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setFeedback({
                type: 'error',
                message: 'Failed to load channel statistics'
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [setFeedback]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="skeleton" style={{ width: '300px', height: '40px' }}></div>
                    <div className="skeleton" style={{ width: '120px', height: '45px' }}></div>
                </div>
                <div className="stats-grid">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton skeleton-stat"></div>)}
                </div>
                <div className="dashboard-sections">
                    <div className="skeleton skeleton-section"></div>
                    <div className="skeleton skeleton-section"></div>
                </div>
            </div>
        );
    }

    const { videoStats, likeStats, commentStats, subscriptionStats, playlistStats } = stats || {};

    const formatDuration = (seconds) => {
        if (!seconds) return '0s';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    return (
        <div className="dashboard-page-container">
            <header className="dashboard-header-premium">
                <h1 className="gradient-text">Channel Dashboard</h1>
                <div className="dashboard-meta-animated">
                    <span className="subtitle">Real-time performance metrics</span>
                </div>
                <div className="header-actions">
                    <button
                        className={`btn-primary-glass ${refreshing ? 'loading' : ''}`}
                        onClick={() => fetchDashboardData(true)}
                        disabled={refreshing}
                    >
                        <FiRefreshCw className={refreshing ? 'spin' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>
            </header>

            <div className="dashboard-content-wrapper">

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon"><FiUsers /></div>
                        <div className="stat-info">
                            <h3>Subscribers</h3>
                            <div className="stat-value">{subscriptionStats?.subscriberCount || 0}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><FiEye /></div>
                        <div className="stat-info">
                            <h3>Total Views</h3>
                            <div className="stat-value">{videoStats?.overview?.totalViews || 0}</div>
                            <div className="stat-sub-value">Avg: {videoStats?.overview?.averageViews?.toFixed(1) || 0} / video</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><FiTrendingUp /></div>
                        <div className="stat-info">
                            <h3>Watch Time</h3>
                            <div className="stat-value">{formatDuration(videoStats?.overview?.totalDuration)}</div>
                            <div className="stat-sub-value">Avg: {formatDuration(videoStats?.overview?.averageDuration)}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><FiHeart /></div>
                        <div className="stat-info">
                            <h3>Global Likes</h3>
                            <div className="stat-value">{likeStats?.totalLikes?.totalLikes || 0}</div>
                            <div className="stat-sub-value">On {videoStats?.overview?.totalVideosUploaded || 0} videos</div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-full-width-section section-card">
                    <h2><FiStar color="var(--color-primary)" /> Video Spotlight</h2>
                    <div className="spotlight-grid-wide">
                        {/* Latest Video */}
                        {videoStats?.latestVideo && (
                            <div className="spotlight-card accent-blue">
                                <div className="card-badge">LATEST</div>
                                <div className="card-thumb" style={{ backgroundImage: `url(${videoStats.latestVideo.thumbnailURL})` }} />
                                <div className="card-body">
                                    <h4>{videoStats.latestVideo.title}</h4>
                                    <div className="card-stats">
                                        <span><FiEye /> {videoStats.latestVideo.views}</span>
                                        <span>{getRelativeTime(videoStats.latestVideo.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Rising Star (Most Viewed) */}
                        {videoStats?.mostViewedVideo && (
                            <div className="spotlight-card accent-green">
                                <div className="card-badge">MOST VIEWED</div>
                                <div className="card-thumb" style={{ backgroundImage: `url(${videoStats.mostViewedVideo.thumbnailURL})` }} />
                                <div className="card-body">
                                    <h4>{videoStats.mostViewedVideo.title}</h4>
                                    <div className="card-stats">
                                        <span><FiEye /> {videoStats.mostViewedVideo.views}</span>
                                        <span className="rising-tag">Trending</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top Engagement (Most Liked) */}
                        {likeStats?.mostLikedVideo && (
                            <div className="spotlight-card accent-primary">
                                <div className="card-badge">MOST LIKED</div>
                                <div className="card-thumb" style={{ backgroundImage: `url(${likeStats.mostLikedVideo.thumbnailURL})` }} />
                                <div className="card-body">
                                    <h4>{likeStats.mostLikedVideo.title}</h4>
                                    <div className="card-stats">
                                        <span><FiHeart /> {likeStats.mostLikedVideo.noOfLikesOnVideo}</span>
                                        <span>Top Choice</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Hidden Gem (Least Viewed) */}
                        {videoStats?.leastViewedVideo && (
                            <div className="spotlight-card accent-yellow">
                                <div className="card-badge">HIDDEN GEM</div>
                                <div className="card-thumb" style={{ backgroundImage: `url(${videoStats.leastViewedVideo.thumbnailURL})` }} />
                                <div className="card-body">
                                    <h4>{videoStats.leastViewedVideo.title}</h4>
                                    <div className="card-stats">
                                        <span><FiEye /> {videoStats.leastViewedVideo.views}</span>
                                        <span>Needs Love</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="stats-footer-grid">
                        <div className="footer-stat">
                            <span>Total Playlists</span>
                            <strong>{playlistStats?.totalPlaylistsOnChannel || 0}</strong>
                        </div>
                        <div className="footer-stat">
                            <span>Shared in Playlists</span>
                            <strong>{playlistStats?.playlistsHavingChannelVideos || 0}</strong>
                        </div>
                        <div className="footer-stat">
                            <span>Global Comments</span>
                            <strong>{commentStats?.totalComments || 0}</strong>
                        </div>
                    </div>
                </div>

                <div className="dashboard-sections">
                    <div className="section-card engagement-section">
                        <div className="section-header-row">
                            <h2><FiMessageSquare color="var(--color-primary)" /> Comments</h2>
                            <div className="tab-switcher">
                                <button
                                    className={`tab-btn ${commentTab === 'recent' ? 'active' : ''}`}
                                    onClick={() => setCommentTab('recent')}
                                >
                                    Recent
                                </button>
                                <button
                                    className={`tab-btn ${commentTab === 'top' ? 'active' : ''}`}
                                    onClick={() => setCommentTab('top')}
                                >
                                    Top Liked
                                </button>
                            </div>
                        </div>

                        <div className="data-list scrollable">
                            {commentTab === 'recent' ? (
                                commentStats?.top5MostRecentComments?.length > 0 ? (
                                    commentStats.top5MostRecentComments.map((comment, index) => (
                                        <div key={index} className="list-item">
                                            <img src={comment.commenterAvatar} alt={comment.commenterUsername} className="user-avatar" />
                                            <div className="item-content">
                                                <div className="item-header">
                                                    <span className="username">@{comment.commenterUsername}</span>
                                                    <span className="time">{comment.createdAt ? getRelativeTime(comment.createdAt) : 'recent'}</span>
                                                </div>
                                                <p className="comment-text">"{comment.comment}"</p>
                                                <div className="video-ref">on: {comment.title}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="placeholder-text">No recent comments.</p>
                                )
                            ) : (
                                commentStats?.top5MostLikedComments?.length > 0 ? (
                                    commentStats.top5MostLikedComments.map((comment, index) => (
                                        <div key={index} className="list-item top-liked">
                                            <div className="like-badge"><FiHeart /> {comment.commentLikeCount}</div>
                                            <img src={comment.commenterAvatar} alt={comment.commenterUsername} className="user-avatar" />
                                            <div className="item-content">
                                                <div className="item-header">
                                                    <span className="username">@{comment.commenterUsername}</span>
                                                </div>
                                                <p className="comment-text">"{comment.comment}"</p>
                                                <div className="video-ref">on: {comment.title}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="placeholder-text">No highly liked comments yet.</p>
                                )
                            )}
                        </div>
                    </div>

                    <div className="section-card engagement-section">
                        <div className="section-header-row">
                            <h2><FiUsers color="var(--color-primary)" /> Audience</h2>
                            <div className="tab-switcher">
                                <button
                                    className={`tab-btn ${subscriberTab === 'newest' ? 'active' : ''}`}
                                    onClick={() => setSubscriberTab('newest')}
                                >
                                    Newest
                                </button>
                                <button
                                    className={`tab-btn ${subscriberTab === 'oldest' ? 'active' : ''}`}
                                    onClick={() => setSubscriberTab('oldest')}
                                >
                                    Oldest
                                </button>
                            </div>
                        </div>

                        <div className="data-list scrollable">
                            {subscriberTab === 'newest' ? (
                                subscriptionStats?.newest5Subscribers?.length > 0 ? (
                                    subscriptionStats.newest5Subscribers.map((sub, index) => (
                                        <div key={index} className="list-item">
                                            <img src={sub.subscriberAvatarURL} alt={sub.subscriberUsername} className="user-avatar" />
                                            <div className="item-content">
                                                <div className="item-header">
                                                    <span className="username">@{sub.subscriberUsername}</span>
                                                    <span className="time">{getRelativeTime(sub.subscribedAt)}</span>
                                                </div>
                                                <div className="sub-status">Subscribed</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="placeholder-text">No recent subscribers.</p>
                                )
                            ) : (
                                subscriptionStats?.oldest5Subscribers?.length > 0 ? (
                                    subscriptionStats.oldest5Subscribers.map((sub, index) => (
                                        <div key={index} className="list-item">
                                            <img src={sub.subscriberAvatarURL} alt={sub.subscriberUsername} className="user-avatar" />
                                            <div className="item-content">
                                                <div className="item-header">
                                                    <span className="username">@{sub.subscriberUsername}</span>
                                                    <span className="time">Joined {getRelativeTime(sub.subscribedAt)}</span>
                                                </div>
                                                <div className="sub-status-old">OG Fan</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="placeholder-text">No subscriber history found.</p>
                                )
                            )}
                        </div>

                        <div className="sub-summary-banner">
                            <FiTrendingUp />
                            <span>Total Channel Reach: <strong>{subscriptionStats?.subscriberCount || 0} subscribers</strong></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
