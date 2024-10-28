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

    return (
        <div className="dashboard">
            <h1>Welcome to Y</h1>
            <p>Manage your account and posts here.</p>

            <div className="dashboard-actions">
                <button onClick={handleCreatePost} className="dashboard-btn">
                    Create Post
                </button>
                <button onClick={handleViewPosts} className="dashboard-btn">
                    View Posts
                </button>
            </div>

            <button onClick={handleLogout} className="dashboard-btn logout-btn">
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
