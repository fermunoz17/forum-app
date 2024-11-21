import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Profiles = () => {
  const [profiles, setProfiles] = useState([]);
  const db = getFirestore();
  const navigate = useNavigate();

  // Función para navegar a los posts de un usuario específico
  const handleViewPosts = (userId) => {
    navigate(`/user-posts/${userId}`);
  };

  useEffect(() => {
    const q = query(collection(db, 'threads')); // Accedemos a la colección threads
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        console.log('No data found in threads collection');
        setProfiles([]);
      } else {
        const authorsSet = new Set();
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          console.log('Document Data:', data); // Depuración
          authorsSet.add(data.authorId); // Guardamos los IDs únicos
        });

        // Creamos perfiles únicos basados en authorId
        const uniqueProfiles = Array.from(authorsSet).map((authorId) => ({
          id: authorId,
        }));
        console.log('Unique Profiles:', uniqueProfiles); // Depuración
        setProfiles(uniqueProfiles);
      }
    });

    return () => unsubscribe();
  }, [db]);

  return (
    <div className="profiles">
      <h1>All User Profiles</h1>
      {profiles.length > 0 ? (
        <ul>
          {profiles.map((profile) => (
            <li key={profile.id}>
              <h3>User ID: {profile.id}</h3>
              <button onClick={() => handleViewPosts(profile.id)}>View Posts</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No profiles found.</p>
      )}
    </div>
  );
};

export default Profiles;
