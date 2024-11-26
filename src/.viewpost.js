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
    getDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const ViewPosts = () => {
    const [threads, setThreads] = useState([]); // Stores threads/posts
    const [replies, setReplies] = useState({}); // Stores replies for threads
    const [replyContent, setReplyContent] = useState({}); // Tracks reply input values
    const auth = getAuth();
    const db = getFirestore();

    // Fetch threads/posts when component mounts
    useEffect(() => {
        const q = query(collection(db, 'threads'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const threadsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setThreads(threadsData);

            // Fetch replies for each thread
            snapshot.docs.forEach((docSnapshot) => fetchReplies(docSnapshot.id));
        });
        return () => unsubscribe(); // Cleanup listener on unmount
    }, [db]);

    // Fetch replies for a specific thread
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

    // Handle submitting a reply
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
            displayName: user.displayName || 'Anonymous',
            createdAt: serverTimestamp(),
        };

        try {
            await addDoc(collection(db, 'threads', threadId, 'replies'), reply);
            setReplyContent((prev) => ({ ...prev, [threadId]: '' })); // Reset input
        } catch (err) {
            console.error('Error submitting reply:', err);
        }
    };

    // Handle liking a thread
    const handleLike = async (threadId, authorId) => {
        const currentUser = auth.currentUser;

        // Prevent liking your own post
        if (currentUser.uid === authorId) {
            alert('You cannot like your own post.');
            return;
        }

        const threadRef = doc(db, 'threads', threadId);

        try {
            // Increment the like count in Firestore
            await updateDoc(threadRef, {
                likes: increment(1),
            });

            console.log(`Like added to thread: ${threadId}`);
        } catch (err) {
            console.error('Error liking thread:', err);
        }
    };

    // Handle deleting a thread/post
    const handleDeleteThread = async (threadId, authorId) => {
        const user = auth.currentUser;
        if (!user || user.uid !== authorId) {
            alert('You can only delete your own posts.');
            return;
        }

        try {
            await deleteDoc(doc(db, 'threads', threadId));
            setThreads((prevThreads) => prevThreads.filter((thread) => thread.id !== threadId));
        } catch (err) {
            console.error('Error deleting thread:', err);
        }
    };

    // Handle changes in the reply input
    const handleReplyChange = (threadId, content) => {
        setReplyContent((prev) => ({
            ...prev,
            [threadId]: content,
        }));
    };

    return (
        <div className="view-posts">
            <h2>Threads</h2>
            {threads.length > 0 ? (
                <ul className="box-threads">
                    {threads.map((thread) => (
                        <li key={thread.id}>
                            <h3>{thread.title}</h3>
                            <p>{thread.content}</p>
                            <small>
                                Posted by {thread.displayName || 'Anonymous'} on{' '}
                                {thread.createdAt?.toDate().toLocaleString()}
                            </small>

                            <div className="thread-actions">
                                <button
                                    className="like-bttn"
                                    onClick={() => handleLike(thread.id, thread.authorId)}
                                >
                                    Like
                                </button>
                                <span>{thread.likes || 0} Likes</span>

                                <button
                                    onClick={() => handleDeleteThread(thread.id, thread.authorId)}
                                    className="submit-btn back-btn delete-btn"
                                >
                                    Delete
                                </button>
                            </div>

                            <div className="replies-section">
                                <h4>Replies:</h4>
                                {replies[thread.id] && replies[thread.id].length > 0 ? (
                                    <ul>
                                        {replies[thread.id].map((reply) => (
                                            <li key={reply.id}>
                                                <p>{reply.content}</p>
                                                <small>
                                                    By {reply.displayName || 'Anonymous'} on{' '}
                                                    {reply.createdAt?.toDate().toLocaleString()}
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
                                        placeholder="Add a reply..."
                                        value={replyContent[thread.id] || ''}
                                        onChange={(e) =>
                                            handleReplyChange(thread.id, e.target.value)
                                        }
                                        required
                                    />
                                    <button type="submit">Reply</button>
                                </form>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No threads available yet.</p>
            )}
        </div>
    );
};

export default ViewPosts;
