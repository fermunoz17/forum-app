import React from 'react';


import './styles.css'; // Import dashboard-specific styles
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const Dashboard = ({ onLogout }) => {
    const navigate = useNavigate(); // Initialize the navigation hook

    // Function to navigate to the Create Post page
    const handleCreatePost = () => {
        navigate('/create-post');  // Navigate to the create post page
    };

    // Function to navigate to the View Posts page
    const handleViewPosts = () => {
        navigate('/view-posts');  // Navigate to the view posts page
    };

    // Modified onLogout function
    const handleLogout = () => {
        onLogout();  // Call the original onLogout passed from App.js
        navigate('/');  // Navigate back to the home or login page
    };
    const handleViewProfiles = () => {
        navigate('/profiles'); // Redirige al usuario a la página de perfiles
    };
    const handleSettings = () => {
        navigate('/settings'); // Redirige al usuario a la página de perfiles
    };


    return (
        <div>
            <div className="dashboard-actions">
                <div className="top-buttons">
                    <button onClick={handleCreatePost} className="dashboard-btn">
                        Create Post
                    </button>
                    <button onClick={handleViewPosts} className="dashboard-btn">
                        View Posts
                    </button>
                    <button onClick={handleViewProfiles} className="dashboard-btn">
                        View Profiles
                    </button>
                    <button onClick={handleSettings} className="dashboard-btn">
                        Settings
                    </button>
                </div>
                <button onClick={handleLogout} className="dashboard-btn logout-btn">
                    Logout
                </button>




            </div>
        </div>
    );
};

export default Dashboard;
