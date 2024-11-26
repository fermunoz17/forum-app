import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const Profiles = () => {
  const [profiles, setProfiles] = useState([]);
  const db = getFirestore();
  const navigate = useNavigate();

  const handleViewPosts = (userId) => {
    navigate(`/user-posts/${userId}`);
  };

  useEffect(() => {
    const q = query(collection(db, 'threads'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setProfiles([]);
      } else {
        const authorsSet = new Set();
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          authorsSet.add(data.authorId);
        });

        const uniqueProfiles = Array.from(authorsSet).map((authorId) => ({
          id: authorId,
        }));
        setProfiles(uniqueProfiles);
      }
    });

    return () => unsubscribe();
  }, [db]);

  return (
    <div className="profiles-container">
      <h1 className="profiles-title">User Profiles</h1>
      {profiles.length > 0 ? (
        <ul className="profiles-list">
          {profiles.map((profile) => (
            <li key={profile.id} className="profile-card">
              <h3>User ID: {profile.id}</h3>
              <button
                className="view-posts-btn"
                onClick={() => handleViewPosts(profile.id)}
              >
                View Posts
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-profiles">No profiles found.</p>
      )}
    </div>
  );
};

export default Profiles;