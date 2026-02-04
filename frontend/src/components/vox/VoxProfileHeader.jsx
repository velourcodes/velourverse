import React from 'react';
import './VoxProfileHeader.css';

const VoxProfileHeader = ({ profile }) => {
    const {
        displayName,
        username,
        bio,
        avatar,
        coverImage,
        isFollowing,
        stats = { posts: 0, following: 0, followers: 0 }
    } = profile;

    // Helper to render bio with gold highlights for #hashtags and @mentions
    const renderBio = (text) => {
        if (!text) return null;
        return text.split(/(\s+)/).map((part, index) => {
            if (part.startsWith('#') || part.startsWith('@')) {
                return (
                    <span key={index} className="vox-accent-gold">
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <div className="vox-profile-header">
            <div className="vox-cover-container">
                {coverImage ? <img src={coverImage} alt="Cover" /> : <div className="vox-cover-placeholder"></div>}
            </div>

            <div className="vox-profile-info-container">
                <div className="vox-profile-top-row">
                    <div className="vox-profile-avatar-container">
                        <div className="vox-profile-avatar">
                            {avatar ? <img src={avatar} alt={displayName} /> : <div className="vox-avatar-placeholder">👤</div>}
                        </div>
                    </div>
                    <div className="vox-profile-actions">
                        {/* Follow button removed for v1 */}
                    </div>
                </div>

                <div className="vox-profile-details">
                    <h2 className="vox-profile-display-name">{displayName}</h2>
                    <p className="vox-profile-handle">@{username}</p>
                    <div className="vox-profile-bio">
                        {renderBio(bio)}
                    </div>

                    {/* Stats removed for v1 */}
                </div>
            </div>
        </div>
    );
};

export default VoxProfileHeader;
