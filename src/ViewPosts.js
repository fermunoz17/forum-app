import React, { useState, useEffect } from 'react';
import {
    getFirestore,
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    updateDoc,
    increment,
} from 'firebase/firestore';
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
                const threadReplies = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setReplies((prev) => ({
                    ...prev,
                    [threadId]: threadReplies,
                }));
            });

            return unsubscribe;
        };

        const q = query(collection(db, 'threads'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const threadsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setThreads(threadsData);

            snapshot.docs.forEach((docSnapshot) => {
                fetchReplies(docSnapshot.id); // Fetch replies for the thread
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
            setReplyContent((prev) => ({ ...prev, [threadId]: '' }));
        } catch (err) {
            console.error('Error submitting reply:', err);
        }
    };

    const handleReplyChange = (threadId, content) => {
        setReplyContent((prev) => ({ ...prev, [threadId]: content }));
    };

    const handleDeleteThread = async (threadId, authorId) => {
        const user = auth.currentUser;
        if (!user) {
            alert('You must be logged in to delete a post.');
            return;
        }

        if (user.uid !== authorId) {
            alert('You can only delete your own posts.');
            return;
        }

        try {
            await deleteDoc(doc(db, 'threads', threadId));
            setThreads(threads.filter((thread) => thread.id !== threadId));
        } catch (err) {
            console.error('Error deleting thread:', err);
        }
    };

    const handleLike = async (threadId) => {
        const threadRef = doc(db, 'threads', threadId);
        try {
            await updateDoc(threadRef, {
                likes: increment(1),
            });
        } catch (err) {
            console.error('Error liking thread:', err);
        }
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    return (
        <div className="view-posts">
            <h1 className="view-posts-title">Threads</h1>
            {threads.length > 0 ? (
                <ul className="box-threads">
                    {threads.map((thread) => (
                        <li key={thread.id}>
                            <h3>{thread.title}</h3>
                            <p>{thread.content}</p>
                            <small>
                                Posted by {thread.displayName || thread.authorId} on{' '}
                                {thread.createdAt?.toDate().toLocaleString()}
                            </small>

                            <div className="thread-actions">
                                <button className="like-bttn" onClick={() => handleLike(thread.id)}>Like</button>
                                <span>{thread.likes || 0} Likes</span>
                            </div>

                            <button
                                onClick={() => handleDeleteThread(thread.id, thread.authorId)}
                                className="submit-btn back-btn delete-btn"
                            >
                                Delete
                            </button>

                            <div className="replies-section">
                                <h4>Replies:</h4>
                                {replies[thread.id] && replies[thread.id].length > 0 ? (
                                    <ul>
                                        {replies[thread.id].map((reply) => (
                                            <li key={reply.id}>
                                                <p>{reply.content}</p>
                                                <small>
                                                    By {reply.authorId} on {reply.createdAt?.toDate().toLocaleString()}
                                                </small>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No replies yet.</p>
                                )}

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

            <button onClick={handleBack} className="submit-btn back-btn">
                Back to Dashboard
            </button>
        </div>
    );
};

export default ViewPosts;
