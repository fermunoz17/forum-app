import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'; // Added `deleteDoc` and `doc` imports
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const ViewPosts = () => {
    const [threads, setThreads] = useState([]);
    const [replies, setReplies] = useState({});
    const [replyContent, setReplyContent] = useState({});
    const auth = getAuth();
    const db = getFirestore();
    const navigate = useNavigate();

    useEffect(() => {
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
    
            return unsubscribe;
        };
        const q = query(collection(db, 'threads'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const threadsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setThreads(threadsData);

            snapshot.docs.forEach(docSnapshot => {
                fetchReplies(docSnapshot.id);
            });
        });

        return () => unsubscribe();
    }, [db]);

   

    const handleReplySubmit = async (e, threadId) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) {
            alert('You must be logged in to reply.');
            return;
        }

        const reply = {
            content: replyContent[threadId] || '',
            authorId: user.uid,
            createdAt: serverTimestamp(),
        };

        try {
            await addDoc(collection(db, 'threads', threadId, 'replies'), reply);
            setReplyContent(prev => ({ ...prev, [threadId]: '' }));
        } catch (err) {
            console.error('Error submitting reply:', err);
        }
    };

    const handleReplyChange = (threadId, content) => {
        setReplyContent(prev => ({ ...prev, [threadId]: content }));
    };
    const handleDeleteThread = async (threadId) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                alert('You must be logged in to delete a post.');
                return;
            }
    
            // Log the thread ID before attempting deletion
            console.log('Attempting to delete thread with ID:', threadId);
    
            // Attempt to delete the document from Firestore
            await deleteDoc(doc(db, 'threads', threadId));
            
            // Log success if deletion goes through
            console.log(`Thread with ID ${threadId} deleted from Firestore.`);
    
            // Update state to remove the deleted thread from the local UI
            setThreads(threads.filter(thread => thread.id !== threadId));  // Remove deleted thread from state
    
        } catch (err) {
            // Log any errors with detailed message
            console.error('Error deleting thread:', err.message);
            alert('Failed to delete the post. Check console for details.');
        }
    };
    

    const handleBack = () => {
        navigate('/dashboard');
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
                                Posted by {thread.authorId} on{' '}
                                {thread.createdAt?.toDate().toLocaleString()}
                            </small>

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDeleteThread(thread.id)} // Added Delete button with onClick handler
                                style={{ color: 'red', marginLeft: '10px' }}
                            >
                                Delete
                            </button>

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

            <button onClick={handleBack} className="back-btn">
                Back to Dashboard
            </button>
        </div>
    );
};

export default ViewPosts;
