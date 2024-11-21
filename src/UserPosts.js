import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';

const UserPosts = () => {
  const { userId } = useParams();
  const [posts, setPosts] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const postsRef = collection(db, 'threads');
    const q = query(postsRef, where('authorId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(userPosts);
    });

    return () => unsubscribe();
  }, [db, userId]);

  return (
    <div className="user-posts">
      <h1>Posts by User</h1>
      {posts.length > 0 ? (
        <ul>
          {posts.map(post => (
            <li key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts found for this user.</p>
      )}
    </div>
  );
};

export default UserPosts;
