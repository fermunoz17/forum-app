import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import './styles.css';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const auth = getAuth();
    setUser(auth.currentUser);
  }, []);

  const handleUpdateDisplayName = async () => {
    if (!newDisplayName.trim()) {
      setErrorMessage('Display name cannot be empty.');
      return;
    }

    const auth = getAuth();
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: newDisplayName,
        });
        setUser({ ...auth.currentUser, displayName: newDisplayName });
        setSuccessMessage('Display name updated successfully!');
        setErrorMessage('');
      } catch (error) {
        setErrorMessage('Failed to update display name. Please try again.');
      }
    }
  };

  return (
    <div className="settings-container">
      <h1 className="settings-title">Settings</h1>
      {user ? (
        <div className="settings-details">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>User ID:</strong> {user.uid}
          </p>
          <p>
            <strong>Display Name:</strong>{' '}
            {user.displayName || 'Not set'}
          </p>
        </div>
      ) : (
        <p className="loading-text">Loading user information...</p>
      )}

      <div className="settings-update">
        <h2>Update Display Name</h2>
        <input
          type="text"
          placeholder="New Display Name"
          value={newDisplayName}
          onChange={(e) => setNewDisplayName(e.target.value)}
          className="display-name-input"
        />
        <button
          onClick={handleUpdateDisplayName}
          className="update-btn"
        >
          Update
        </button>
        {successMessage && (
          <p className="success-text">{successMessage}</p>
        )}
        {errorMessage && (
          <p className="error-text">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default Settings;
