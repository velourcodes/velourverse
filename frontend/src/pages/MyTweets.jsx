import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import VoxTweetCard from '../components/vox/VoxTweetCard';
import VoxProfileHeader from '../components/vox/VoxProfileHeader';
import { getUserTweets, deleteTweet } from '../api/tweet.api';
import { getRelativeTime } from '../utils/timeUtils';
import { useNavigate } from 'react-router-dom';
import './MyTweets.css';

const MyTweets = () => {
    const { user } = useAuth();
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const navigate = useNavigate();

    const fetchMyTweets = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getUserTweets();
            if (response.data?.success) {
                const data = response.data.data || {};
                const fetchedTweets = data.populatedUserTweets || [];
                const paginationData = data.pagination || {};
                setTweets(fetchedTweets);
                setPagination(paginationData);
                setCurrentPage(page);
            }
        } catch (err) {
            console.error('Error fetching my tweets:', err);
            setError('Failed to load your tweets.');
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
        }
    };

    // Construct profile object for header
    const userProfile = user ? {
        displayName: user.fullName || user.username,
        username: user.username,
        avatar: user.avatar?.secure_url,
        coverImage: user.coverImage?.secure_url,
        bio: user.bio || "Welcome to my Vox profile!",
        isFollowing: false,
    } : null;

    useEffect(() => {
        fetchMyTweets(currentPage);
    }, [currentPage]);

    // Don't block render on loading, show shell
    return (
        <div className="my-tweets-container">
            <div className="my-tweets-header">
                <h1>My Voxes</h1>
                <p>Your personal collection of thoughts</p>
            </div>

            {userProfile && <VoxProfileHeader profile={userProfile} />}

            <div className="vox-feed-content">
                <div className="vox-tweets-list">
                    {loading && tweets.length === 0 ? (
                        <div className="vox-loading">Loading your voxes...</div>
                    ) : error ? (
                        <div className="vox-error">{error}</div>
                    ) : tweets.length === 0 ? (
                        <div className="vox-empty">
                            <p>You haven't posted any voxes yet.</p>
                            <button
                                className="vox-btn-gold vox-interactive"
                                onClick={() => navigate('/create-tweet')}
                            >
                                Create Your First Vox
                            </button>
                        </div>
                    ) : (
                        <>
                            {tweets.map((tweet) => (
                                <VoxTweetCard
                                    key={tweet._id}
                                    tweet={{
                                        authorName: tweet.ownerUsername || user?.username || 'You',
                                        username: tweet.ownerUsername || user?.username,
                                        timeAgo: getRelativeTime(tweet.createdAt),
                                        content: tweet.content,
                                        likes: tweet.tweetLikeCount || 0,
                                        reposts: 0,
                                        replies: 0,
                                        hasVideo: false,
                                        avatar: tweet.ownerAvatarURL || user?.avatar?.secure_url
                                    }}
                                    isLiked={tweet.isLikedByUser}
                                    isOwner={true}
                                    onLikeToggle={() => handleLikeToggle(tweet._id, !tweet.isLikedByUser)}
                                    onEdit={() => handleEdit(tweet._id)}
                                    onDelete={() => handleDelete(tweet._id)}
                                />
                            ))}
                        </>
                    )}
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <div className="vox-pagination">
                        <button
                            className="vox-btn-pagination vox-interactive"
                            onClick={() => fetchMyTweets(currentPage - 1)}
                            disabled={!pagination.hasPrev || loading}
                        >
                            Previous
                        </button>
                        <span className="vox-page-info">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <button
                            className="vox-btn-pagination vox-interactive"
                            onClick={() => fetchMyTweets(currentPage + 1)}
                            disabled={!pagination.hasNext || loading}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTweets;
