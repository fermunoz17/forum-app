import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for navigation

const ViewPosts = () => {
    const [threads, setThreads] = useState([]);
    const [replies, setReplies] = useState({});  // State to store replies for each thread
    const [replyContent, setReplyContent] = useState({});
    const auth = getAuth();
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

            // Automatically fetch replies for each thread
            snapshot.docs.forEach(docSnapshot => {
                fetchReplies(docSnapshot.id);  // Fetch replies as soon as the thread is loaded
            });
        });

        return () => unsubscribe();
    }, [db]);

    // Fetch replies for a specific thread
    const fetchReplies = (threadId) => {
        const repliesRef = collection(db, 'threads', threadId, 'replies');
        const q = query(repliesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const threadReplies = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReplies(prev => ({
                ...prev,
                [threadId]: threadReplies
            }));
        });

        return unsubscribe;  // Cleanup listener on unmount
    };

    // Handle reply submission
    const handleReplySubmit = async (e, threadId) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) {
            alert('You must be logged in to reply.');
            return;
        }

        const reply = {
            content: replyContent[threadId] || '',  // Use the reply content for the specific thread
            authorId: user.uid,
            createdAt: serverTimestamp(),
        };

        try {
            await addDoc(collection(db, 'threads', threadId, 'replies'), reply);
            setReplyContent(prev => ({ ...prev, [threadId]: '' }));  // Clear the reply input for the thread
        } catch (err) {
            console.error('Error submitting reply:', err);
        }
    };

    // Handle reply content input change
    const handleReplyChange = (threadId, content) => {
        setReplyContent(prev => ({ ...prev, [threadId]: content }));
    };

    // Handle back navigation to the dashboard
    const handleBack = () => {
        navigate('/dashboard');  // Navigate back to the dashboard
    };

    return (
        <div className="view-posts">
            <h1>All Threads</h1>
            {threads.length > 0 ? (
                <ul className='box-threads'>
                    {threads.map((thread) => (
                        <li key={thread.id}>
                            <h3>{thread.title}</h3>
                            <p>{thread.content}</p>
                            <small>
                                Posted by {thread.authorId} on{' '}
                                {thread.createdAt?.toDate().toLocaleString()}
                            </small>

                            {/* Display Replies */}
                            <div className="replies-section">
                                <h4>Replies:</h4>
                                {replies[thread.id] && replies[thread.id].length > 0 ? (
                                    <ul>
                                        {replies[thread.id].map(reply => (
                                            <li key={reply.id}>
                                                <p>{reply.content}</p>
                                                <small>By {reply.authorId} on {reply.createdAt?.toDate().toLocaleString()}</small>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No replies yet.</p>
                                )}

                                {/* Reply Form */}
                                <form onSubmit={(e) => handleReplySubmit(e, thread.id)}>
                                    <input
                                        type="text"
                                        placeholder="Your reply"
                                        value={replyContent[thread.id] || ''}
                                        onChange={(e) => handleReplyChange(thread.id, e.target.value)}
                                        required
                                    />
                                    <button type="submit">Submit Reply</button>
                                </form>
                            </div>
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
