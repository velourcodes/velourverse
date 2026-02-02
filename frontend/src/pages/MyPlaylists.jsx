import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import { getUserPlaylists, createPlaylist, deletePlaylist } from '../api/playlist.api';
import Loader from '../components/common/Loader';
import './MyPlaylists.css';

const MyPlaylists = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast, confirmAction } = useFeedback();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '' });

    useEffect(() => {
        if (user?._id) {
            fetchPlaylists();
        }
    }, [user]);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const response = await getUserPlaylists(user._id);
            if (response.data?.data?.playlists) {
                setPlaylists(response.data.data.playlists);
            }
            setError('');
        } catch (err) {
            if (err.response?.status === 404) {
                setPlaylists([]);
            } else {
                setError('Failed to load playlists');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        if (!newPlaylist.name.trim() || !newPlaylist.description.trim()) {
            return;
        }

        try {
            setCreateLoading(true);
            await createPlaylist(newPlaylist);
            setNewPlaylist({ name: '', description: '' });
            setShowCreateModal(false);
            fetchPlaylists();
            showToast('Playlist created successfully!', 'success');
        } catch (err) {
            console.error('Failed to create playlist:', err);
            showToast('Failed to create playlist. Please try again.', 'error');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeletePlaylist = async (playlistId, playlistName) => {
        confirmAction({
            title: 'Delete Playlist',
            message: `Are you sure you want to delete "${playlistName}"? This action cannot be undone.`,
            confirmText: 'Delete',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await deletePlaylist(playlistId);
                    fetchPlaylists();
                    showToast('Playlist deleted successfully', 'success');
                } catch (err) {
                    console.error('Failed to delete playlist:', err);
                    showToast('Failed to delete playlist. Please try again.', 'error');
                }
            }
        });
    };

    if (loading) return <Loader />;

    return (
        <div className="my-playlists-container">
            <div className="my-playlists-header-premium">
                <h1 className="gradient-text">My Playlist</h1>
                <div className="playlists-meta-animated">
                    <span className="count-badge">{playlists.length}</span>
                    <span className="count-text">{playlists.length === 1 ? 'playlist' : 'playlists'} created</span>
                </div>
                <div className="header-actions">
                    <button className="btn-primary-solid" onClick={() => setShowCreateModal(true)}>
                        + Create Playlist
                    </button>
                </div>
            </div>

            {playlists.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📚</div>
                    <h3>No playlists yet</h3>
                    <p>Create your first playlist to organize your favorite videos</p>
                </div>
            ) : (
                <div className="playlists-grid">
                    {playlists.map((playlist) => (
                        <div key={playlist._id} className="playlist-card">
                            <div className="playlist-thumbnail">
                                <div className="playlist-count-label">
                                    {playlist.playlistVideoCount} videos
                                </div>
                            </div>
                            <div className="playlist-info">
                                <h3 className="playlist-name">{playlist.name}</h3>
                                <p className="playlist-description">{playlist.description}</p>
                                <div className="playlist-actions">
                                    <button
                                        className="btn-secondary-small"
                                        onClick={() => navigate(`/playlist/${playlist._id}`)}
                                    >
                                        Manage
                                    </button>
                                    <button
                                        className="btn-text delete-btn"
                                        onClick={() => handleDeletePlaylist(playlist._id, playlist.name)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Playlist Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Create New Playlist</h2>
                        <form onSubmit={handleCreatePlaylist}>
                            <div className="form-group">
                                <label htmlFor="name">Playlist Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={newPlaylist.name}
                                    onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                                    placeholder="Enter playlist name"
                                    required
                                    maxLength={50}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={newPlaylist.description}
                                    onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                                    placeholder="Describe your playlist"
                                    required
                                    rows={4}
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-text"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={createLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={createLoading}
                                >
                                    {createLoading ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyPlaylists;
