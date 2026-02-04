import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createTweet } from '../api/tweet.api';
import { useNavigate } from 'react-router-dom';
import './CreateTweet.css';

const CreateTweet = () => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            setIsSubmitting(true);
            setError(null);
            await createTweet({ content });
            // Success! Redirect to home feed
            navigate('/tweets');
        } catch (err) {
            console.error('Error creating tweet:', err);
            setError(err.response?.data?.message || 'Failed to create vox');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="vox-create-container">
            <div className="vox-create-card">
                <div className="vox-create-header">
                    <h1>Create a Vox</h1>
                    <p>Share your thoughts with the world</p>
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
                                    {isSubmitting ? 'Posting...' : 'Vox It'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTweet;
