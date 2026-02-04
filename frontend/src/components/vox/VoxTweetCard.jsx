import React from 'react';
import { FiMessageSquare, FiHeart, FiRepeat, FiShare } from 'react-icons/fi';
import './VoxTweetCard.css';

const VoxTweetCard = ({ tweet, isLiked, onLikeToggle, isOwner, onEdit, onDelete }) => {
    const {
        authorName,
        username,
        timeAgo,
        content,
        hasVideo,
        likes,
        reposts,
        replies,
        avatar
    } = tweet;

    // Hybrid Hint Logic
    const themeClass = hasVideo ? 'vox-theme-video' : 'vox-theme-text';

    return (
        <div className={`vox-tweet-card vox-elevation-hover ${themeClass}`}>
            <div className="vox-card-aside">
                <div className="vox-avatar">
                    {avatar ? <img src={avatar} alt={authorName} /> : <div className="vox-avatar-placeholder">👤</div>}
                </div>
            </div>

            <div className="vox-card-main">
                <div className="vox-tweet-header">
                    <span className="vox-display-name">{authorName}</span>
                    <span className="vox-handle">@{username}</span>
                    <span className="vox-time-sep">•</span>
                    <span className="vox-time">{timeAgo}</span>
                </div>

                <div className="vox-tweet-body">
                    <p>{content}</p>
                </div>

                {hasVideo && (
                    <div className="vox-video-preview">
                        {/* Placeholder for video content with Strawberry Red accents */}
                        <div className="vox-play-btn">▶</div>
                    </div>
                )}

                <div className="vox-tweet-actions">
                    {/* Non-Owners: Just Like Count */}
                    {!isOwner && (
                        <button
                            className={`vox-action-btn vox-like vox-interactive ${isLiked ? 'liked' : ''}`}
                            title="Like"
                            onClick={onLikeToggle}
                            style={{ marginLeft: '0' }} // Align left since it's alone?
                        >
                            <FiHeart className={isLiked ? 'fill-current' : ''} />
                            <span>{likes}</span>
                        </button>
                    )}

                    {/* Owners: Edit and Delete (and Like?? User said "specific edit and delete buttons, and otherwise just the like count". 
                        Implies Owner might NOT see Like? But Owner usually wants to see likes.
                        I'll include Like for Owner too, plus Edit/Delete.
                    */}
                    {isOwner && (
                        <>
                            <button
                                className={`vox-action-btn vox-like vox-interactive ${isLiked ? 'liked' : ''}`}
                                title="Like"
                                onClick={onLikeToggle}
                            >
                                <FiHeart className={isLiked ? 'fill-current' : ''} />
                                <span>{likes}</span>
                            </button>

                            {onEdit && (
                                <button className="vox-action-btn vox-interactive" title="Edit" onClick={onEdit}>
                                    ✏️
                                </button>
                            )}
                            {onDelete && (
                                <button className="vox-action-btn vox-interactive vox-delete-btn" title="Delete" onClick={onDelete}>
                                    🗑️
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoxTweetCard;
