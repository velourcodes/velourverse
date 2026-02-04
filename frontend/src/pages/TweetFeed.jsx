import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import VoxTweetCard from '../components/vox/VoxTweetCard';
import VoxTweetActions from '../components/vox/VoxTweetActions';
import { getAllTweets, createTweet as apiCreateTweet, updateTweet, deleteTweet } from '../api/tweet.api';
import { getRelativeTime } from '../utils/timeUtils';
import { useNavigate } from 'react-router-dom';
import './TweetFeed.css';

const TweetFeed = () => {
    const { user } = useAuth();
    const [tweetText, setTweetText] = useState('');

    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const navigate = useNavigate();

    const mockProfile = {
        displayName: user?.fullName || 'User',
        username: user?.username || 'username',
        bio: 'Velourverse enthusiast. Web3 and luxury brand focus.',
        avatar: user?.avatar?.secure_url || null,
        coverImage: user?.coverImage?.secure_url || null,
        isFollowing: false,
        stats: { posts: 0, following: 0, followers: 0 }
    };

    const fetchTweets = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllTweets(page, 10);
            if (response.data?.success) {
                const fetchedTweets = response.data.data.populatedTweets || [];
                const paginationData = response.data.data.pagination || {};
                setTweets(fetchedTweets);
                setPagination(paginationData);
                setCurrentPage(page);
            }
        } catch (err) {
            console.error('Error fetching tweets:', err);
            setError('Failed to load tweets.');
        } finally {
            setLoading(false);
        }
    };

    const handleLikeToggle = (tweetId, newLikeStatus) => {
        setTweets(prevTweets =>
            prevTweets.map(tweet =>
                tweet._id === tweetId
                    ? {
                        ...tweet,
                        isLikedByUser: newLikeStatus,
                        tweetLikeCount: newLikeStatus
                            ? tweet.tweetLikeCount + 1
                            : tweet.tweetLikeCount - 1
                    }
                    : tweet
            )
        );
    };

    const handleEdit = (tweetId) => {
        navigate(`/edit-tweet/${tweetId}`);
    };

    const handleDelete = async (tweetId) => {
        if (!window.confirm('Are you sure you want to delete this tweet?')) return;

        try {
            await deleteTweet(tweetId);
            setTweets(prevTweets => prevTweets.filter(t => t._id !== tweetId));
        } catch (err) {
            console.error('Error deleting tweet:', err);
            alert('Failed to delete tweet');
        }
    };

    React.useEffect(() => {
        fetchTweets(currentPage);
    }, []);

    const handleTweetSubmit = async (e) => {
        e.preventDefault();
        if (!tweetText.trim()) return;

        try {
            await apiCreateTweet({ content: tweetText });
            setTweetText('');
            // Refresh feed
            fetchTweets();
        } catch (err) {
            console.error('Error creating tweet:', err);
        }
    };

    return (
        <div className="vox-feed-container">
            <div className="vox-feed-content">
                <div className="my-tweets-header" style={{ marginBottom: '25px' }}>
                    <h1>Home</h1>
                    <p>Your personal collection of thoughts</p>
                </div>

                <div className="vox-composer-card">
                    <div className="vox-composer-header">
                        <div className="vox-composer-avatar">
                            {user?.avatar?.secure_url ? (
                                <img src={user.avatar.secure_url} alt={user.username} />
                            ) : (
                                <div className="vox-avatar-placeholder">👤</div>
                            )}
                        </div>
                        <form onSubmit={handleTweetSubmit} className="vox-composer-form">
                            <textarea
                                className="vox-composer-input"
                                placeholder="What's happening?"
                                value={tweetText}
                                onChange={(e) => setTweetText(e.target.value)}
                                maxLength={280}
                            />
                            <div className="vox-composer-footer">
                                <span className="vox-char-count">{tweetText.length}/280</span>
                                <button
                                    type="submit"
                                    className="vox-btn-gold vox-interactive"
                                    disabled={!tweetText.trim()}
                                >
                                    Vox It
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="vox-tweets-list">
                    {loading ? (
                        <div className="vox-loading">Loading luxury thoughts...</div>
                    ) : error ? (
                        <div className="vox-error">{error}</div>
                    ) : tweets.length === 0 ? (
                        <div className="vox-empty">No tweets found. Be the first to Vox!</div>
                    ) : (
                        <>
                            {tweets.map((tweet) => (
                                <div key={tweet._id} className="vox-tweet-card vox-elevation-hover">
                                    <div className="vox-card-aside">
                                        <div className="vox-avatar">
                                            {tweet.ownerAvatarURL ? (
                                                <img src={tweet.ownerAvatarURL} alt={tweet.ownerUsername} />
                                            ) : (
                                                <div className="vox-avatar-placeholder">👤</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="vox-card-main">
                                        <div className="vox-tweet-header">
                                            <span className="vox-display-name">{tweet.ownerUsername}</span>
                                            <span className="vox-handle">@{tweet.ownerUsername}</span>
                                            <span className="vox-time-sep">•</span>
                                            <span className="vox-time">{getRelativeTime(tweet.createdAt)}</span>
                                            {user && tweet.ownerUsername === user.username && (
                                                <span className="vox-owner-badge">You</span>
                                            )}
                                        </div>

                                        <div className="vox-tweet-body">
                                            <p>{tweet.content}</p>
                                        </div>

                                        <VoxTweetActions
                                            tweetId={tweet._id}
                                            isLiked={tweet.isLikedByUser}
                                            likeCount={tweet.tweetLikeCount}
                                            isOwner={user && tweet.ownerUsername === user.username}
                                            onLikeToggle={handleLikeToggle}
                                            onEdit={() => handleEdit(tweet._id)}
                                            onDelete={() => handleDelete(tweet._id)}
                                        />
                                    </div>
                                </div>
                            ))}

                            {pagination && pagination.totalPages > 1 && (
                                <div className="vox-pagination">
                                    <button
                                        className="vox-btn-pagination vox-interactive"
                                        onClick={() => fetchTweets(currentPage - 1)}
                                        disabled={!pagination.hasPrev || loading}
                                    >
                                        Previous
                                    </button>
                                    <span className="vox-page-info">
                                        Page {pagination.currentPage} of {pagination.totalPages}
                                    </span>
                                    <button
                                        className="vox-btn-pagination vox-interactive"
                                        onClick={() => fetchTweets(currentPage + 1)}
                                        disabled={!pagination.hasNext || loading}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TweetFeed;
