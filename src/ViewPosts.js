import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for navigation

const ViewPosts = () => {
    const [threads, setThreads] = useState([]);
    const [userEmails, setUserEmails] = useState({});  // State to store emails mapped by authorId
    const db = getFirestore();  // Get Firestore instance
    const navigate = useNavigate();  // Initialize navigation hook

    useEffect(() => {
        // Fetch threads from Firestore, ordered by the creation time (newest first)
        const q = query(collection(db, 'threads'), orderBy('createdAt', 'desc'));

        // Real-time listener for Firestore data
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const threadsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setThreads(threadsData);

            // Fetch emails for each thread's author
            snapshot.docs.forEach(async (docSnapshot) => {
                const thread = docSnapshot.data();
                const authorId = thread.authorId;

                // If the email for this authorId is not already fetched, fetch it
                if (!userEmails[authorId]) {
                    const userDocRef = doc(db, 'users', authorId);  // Fetching user document
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setUserEmails(prevEmails => ({
                            ...prevEmails,
                            [authorId]: userDoc.data().email,  // Add the email to the state
                        }));
                    }
                }
            });
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [db, userEmails]);

    // Handle back navigation to the dashboard
    const handleBack = () => {
        navigate('/dashboard');  // Navigate back to the dashboard
    };

    return (
        <div className="view-posts">
            <h1>All Threads</h1>
            {threads.length > 0 ? (
                <ul>
                    {threads.map((thread) => (
                        <li key={thread.id}>
                            <h3>{thread.title}</h3>
                            <p>{thread.content}</p>
                            <small>
                                Posted by {userEmails[thread.authorId] || thread.authorId} on{' '}
                                {thread.createdAt?.toDate().toLocaleString()}
                            </small>
                            {/* Placeholder for replies feature */}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No threads available yet. Be the first to create one!</p>
            )}

            {/* Back to Dashboard Button */}
            <button onClick={handleBack} className="back-btn">
                Back to Dashboard
            </button>
        </div>
    );
};

export default ViewPosts;
