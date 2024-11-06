import React from 'react';
import './TopBar.css'; // Import a CSS file for styling
import { useNavigate } from 'react-router-dom';

const TopBar = () => {
  const navigate = useNavigate();

  const handledashboard = () => {
    navigate('/dashboard');  // Navigate to the create post page
  };

  return (
    <div className="top-bar">
      <button onClick={handledashboard}>
        <img src="/Red-letter-Y-isolated-on-transparent-background-PNG.png" alt="Y-logo" className="logo" />
      </button>
      <h1 className="title">Welcome to Y</h1>
    </div>
  );
};

export default TopBar;
