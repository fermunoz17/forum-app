import React, { useState } from 'react';
import CreatePost from './CreatePost';
import ViewPosts from './ViewPosts';
import './styles.css';

const Dashboard = ({ onLogout }) => {
    const [showCreatePostModal, setShowCreatePostModal] = useState(false); // Modal visibility state

    // Function to toggle the modal
    const toggleCreatePostModal = () => {
        setShowCreatePostModal(!showCreatePostModal);
    };

    return (
        <div className="dashboard-container">
          <ViewPosts />
            <div className='dashboard-content'>
              <button onClick={toggleCreatePostModal} className="dashboard-btn create-btn">
                  Create Post
              </button>
              <button onClick={onLogout} className="dashboard-btn logout-btn">
                      Logout
              </button>
            </div>
            {showCreatePostModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button onClick={toggleCreatePostModal} className="close-btn">
                            &times;
                        </button>
                        <CreatePost />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
