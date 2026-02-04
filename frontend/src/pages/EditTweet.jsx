import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateTweet, getUserTweets } from '../api/tweet.api';
import { useNavigate, useParams } from 'react-router-dom';
import './CreateTweet.css'; // Reusing CreateTweet CSS

const EditTweet = () => {
    const { user } = useAuth();
    const { tweetId } = useParams();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTweet = async () => {
            try {
                // In a real app we might have a getTweetById endpoint.
                // For now, we fetch user tweets and find it, or we could pass content via state.
                // Fetching user tweets to ensure ownership and get content.
                const response = await getUserTweets();
                if (response.data?.success) {
                    const tweets = response.data.data.populatedUserTweets || [];
                    const tweet = tweets.find(t => t._id === tweetId);

                    if (tweet) {
                        setContent(tweet.content);
                    } else {
                        setError('Vox not found or permission denied');
                    }
                }
            } catch (err) {
                console.error('Error fetching tweet:', err);
                setError('Failed to load vox');
            } finally {
                setLoading(false);
            }
        };

        if (tweetId) {
            fetchTweet();
        }
    }, [tweetId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            setIsSubmitting(true);
            setError(null);
            await updateTweet(tweetId, { content });
            navigate('/tweets'); // Or back to wherever they came from
        } catch (err) {
            console.error('Error updating tweet:', err);
            setError(err.response?.data?.message || 'Failed to update vox');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="vox-create-container"><div className="vox-loading">Loading...</div></div>;
    }

    return (
        <div className="vox-create-container">
            <div className="vox-create-card">
                <div className="vox-create-header">
                    <h1>Edit Vox</h1>
                    <p>Refine your thoughts</p>
                </div>

                <form onSubmit={handleSubmit} className="vox-create-form">
                    <div className="vox-create-avatar">
                        {user?.avatar?.secure_url ? (
                            <img src={user.avatar.secure_url} alt={user.username} />
                        ) : (
                            <div className="vox-avatar-placeholder">👤</div>
                        )}
                    </div>

                    <div className="vox-create-input-wrapper">
                        <textarea
                            className="vox-create-textarea"
                            placeholder="What's on your mind?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            maxLength={280}
                            rows={6}
                            autoFocus
                        />

                        <div className="vox-create-footer">
                            <span className="vox-char-count">
                                {content.length}/280
                            </span>

                            {error && (
                                <span className="vox-create-error">{error}</span>
                            )}

                            <div className="vox-create-actions">
                                <button
                                    type="button"
                                    className="vox-btn-cancel vox-interactive"
                                    onClick={() => navigate('/tweets')}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="vox-btn-gold vox-interactive"
                                    disabled={!content.trim() || isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : 'Update Vox'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTweet;
