import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import './Home.css';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();


    return (
        <div className="home-container">


            <div className="welcome-text">
                <img src="/logo.svg" alt="Velour Logo" className="home-logo" />
                <h1>Welcome to <span className="gradient-text">Velour Verse</span></h1>
                <p className="app-description">
                    A sophisticated hybrid for those who demand more.<br />
                    Seamlessly transition from the immersive depths of <strong>Velour Vortex</strong> to the sharp clarity of <strong>Velour Vox</strong>.
                </p>
            </div>

            <div className="big-buttons-container">
                <div className="big-button" onClick={() => navigate('/videos')}>
                    <div className="big-button-icon">🎬</div>
                    <div className="big-button-text gradient-text">Velour Vortex</div>
                    <div className="big-button-subtitle">Watch and upload videos</div>
                </div>

                <div className="big-button" onClick={() => navigate('/tweets')}>
                    <div className="big-button-icon">💬</div>
                    <div className="big-button-text gradient-text">Velour Vox</div>
                    <div className="big-button-subtitle">Share your thoughts</div>
                </div>
            </div>
        </div>
    );
};

export default Home;
