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
    setDoc,
    getDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const ViewPosts = () => {
    const [threads, setThreads] = useState([]); // Stores threads/posts
    const [likedThreads, setLikedThreads] = useState([]); // Tracks liked threads by the user
    const [replies, setReplies] = useState({}); // Tracks replies for threads
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
        return () => unsubscribe();
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

    // Fetch liked threads by the current user
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const likesRef = collection(db, 'likes', user.uid, 'threadLikes');
        const q = query(likesRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const likes = snapshot.docs.map((doc) => doc.id);
            setLikedThreads(likes);
        });

        return () => unsubscribe();
    }, [db, auth.currentUser]);

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
    // Handle liking/unliking a thread
    const handleLike = async (threadId) => {
        const user = auth.currentUser; // Get the current user
        if (!user) {
            alert('You must be logged in to like a post.');
            return;
        }

        const likeRef = doc(db, 'likes', user.uid, 'threadLikes', threadId); // Reference to user's like on this thread
        const threadRef = doc(db, 'threads', threadId); // Reference to the thread

        try {
            if (likedThreads.includes(threadId)) {
                // Unlike the thread
                await deleteDoc(likeRef); // Remove the like from the user's subcollection
                await updateDoc(threadRef, {
                    likes: (threads.find((thread) => thread.id === threadId).likes || 0) - 1, // Decrement the like count
                });
                setLikedThreads((prev) => prev.filter((id) => id !== threadId)); // Update local state
            } else {
                // Check if the user has already liked the thread in Firestore
                const likeSnapshot = await getDoc(likeRef);
                if (likeSnapshot.exists()) {
                    console.warn('User has already liked this post.');
                    return; // Exit if already liked
                }

                // Like the thread
                await setDoc(likeRef, { likedAt: serverTimestamp() }); // Add like in user's subcollection
                await updateDoc(threadRef, {
                    likes: (threads.find((thread) => thread.id === threadId).likes || 0) + 1, // Increment the like count
                });
                setLikedThreads((prev) => [...prev, threadId]); // Update local state
            }
        } catch (err) {
            console.error('Error liking/unliking thread:', err);
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
                                    className={`like-bttn ${likedThreads.includes(thread.id) ? 'liked' : ''
                                        }`}
                                    onClick={() => handleLike(thread.id)}
                                >
                                    {likedThreads.includes(thread.id) ? '❤️' : '🤍'}
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
