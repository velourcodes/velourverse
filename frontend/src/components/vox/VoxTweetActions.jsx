import React from 'react';
import { FiHeart, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toggleTweetLike } from '../../api/like.api';
import './VoxTweetActions.css';

const VoxTweetActions = ({
    tweetId,
    isLiked,
    likeCount,
    isOwner,
    onLikeToggle,
    onEdit,
    onDelete
}) => {
    const [isLiking, setIsLiking] = React.useState(false);

    const handleLike = async () => {
        if (isLiking) return;

        try {
            setIsLiking(true);
            const response = await toggleTweetLike(tweetId);
            const newLikeStatus = response.data?.data?.tweetLikeStatus;

            // Call parent callback to update state
            if (onLikeToggle) {
                onLikeToggle(tweetId, newLikeStatus);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <div className="vox-tweet-actions">
            <button
                className={`vox-action-btn vox-like vox-interactive ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
                disabled={isLiking}
                title={isLiked ? 'Unlike' : 'Like'}
            >
                <FiHeart className={isLiked ? 'filled' : ''} />
                <span>{likeCount || 0}</span>
            </button>

            {isOwner && (
                <>
                    {onEdit && (
                        <button
                            className="vox-action-btn vox-edit vox-interactive"
                            onClick={onEdit}
                            title="Edit"
                        >
                            <FiEdit2 />
                            <span>Edit</span>
                        </button>
                    )}
                    <button
                        className="vox-action-btn vox-delete vox-interactive"
                        onClick={onDelete}
                        title="Delete"
                    >
                        <FiTrash2 />
                        <span>Delete</span>
                    </button>
                </>
            )}
        </div>
    );
};

export default VoxTweetActions;
