import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { deleteAllTweetsByUser } from '../api/tweet.api';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';
import './DeleteAllTweets.css';

const DeleteAllTweets = () => {
    const { user } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!password.trim() || !confirmPassword.trim()) {
            setError('Both password fields are required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!window.confirm('This action is PERMANENT and cannot be undone. Are you absolutely sure?')) {
            return;
        }

        try {
            setIsDeleting(true);
            await deleteAllTweetsByUser({ password, confirmPassword });
            alert('All your voxes have been deleted successfully');
            navigate('/tweets');
        } catch (err) {
            console.error('Error deleting all tweets:', err);
            setError(err.response?.data?.message || 'Failed to delete voxes. Please check your password.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="vox-delete-all-container">
            <div className="vox-delete-all-card">
                <div className="vox-delete-all-header">
                    <FiAlertTriangle className="vox-warning-icon" />
                    <h1>Delete All Voxes</h1>
                    <p>This action cannot be undone</p>
                </div>

                <div className="vox-warning-box">
                    <h3>⚠️ Warning</h3>
                    <p>
                        You are about to permanently delete <strong>ALL</strong> of your voxes.
                        This includes all likes, replies, and interactions associated with them.
                    </p>
                    <p>
                        This action is <strong>irreversible</strong>. Please make sure you want to proceed.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="vox-delete-all-form">
                    <div className="vox-form-group">
                        <label htmlFor="password">Enter Your Password</label>
                        <input
                            type="password"
                            id="password"
                            className="vox-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isDeleting}
                        />
                    </div>

                    <div className="vox-form-group">
                        <label htmlFor="confirmPassword">Confirm Your Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="vox-input"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isDeleting}
                        />
                    </div>

                    {error && (
                        <div className="vox-error-message">
                            {error}
                        </div>
                    )}

                    <div className="vox-delete-all-actions">
                        <button
                            type="button"
                            className="vox-btn-cancel vox-interactive"
                            onClick={() => navigate('/my-tweets-vox')}
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="vox-btn-danger vox-interactive"
                            disabled={isDeleting || !password || !confirmPassword}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete All Voxes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeleteAllTweets;
