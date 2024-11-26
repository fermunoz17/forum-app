import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [displayName, setDisplayName] = useState(''); // State to store the user's displayName
    const auth = getAuth();  // Get Firebase Auth instance
    const db = getFirestore();  // Get Firestore instance
    const navigate = useNavigate();  // Initialize navigation hook

    // Retrieve the user's displayName on component mount
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setDisplayName(user.displayName || 'Anonymous'); // Default to 'Anonymous' if no displayName
            } else {
                setDisplayName('Anonymous');
            }
        });

        return () => unsubscribe();
    }, [auth]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = auth.currentUser;  // Ensure the user is logged in
        if (!user) {
            setError('You must be logged in to create a post.');
            return;
        }

        try {
            // Add a new thread to the Firestore `threads` collection
            await addDoc(collection(db, 'threads'), {
                title: title,
                content: content,
                authorId: user.uid,  // Store the current user's ID
                displayName: displayName,  // Include the displayName
                createdAt: serverTimestamp(),  // Use server-side timestamp
            });

            // Reset form and show success message
            setTitle('');
            setContent('');
            setSuccess('Post created successfully!');
            setError('');

        } catch (err) {
            console.error('Error creating post:', err);
            setError('Failed to create post. Please try again.');
        }
    };

    // Handle back navigation to the dashboard
    const handleBack = () => {
        navigate('/dashboard');  // Navigate back to the dashboard
    };

    return (
        <div className="create-post">
            <h1>Create a New Thread</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={handleSubmit} className="submit-form">
                <div className="post-form">
                    <input
                        type="text"
                        placeholder="Post Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Post Content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="submit-btn">Submit</button>
            </form>
        </div>
    );
};

export default CreatePost;
