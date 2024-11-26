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
    const [threads, setThreads] = useState([]);
    const [likedThreads, setLikedThreads] = useState([]);
    const [replies, setReplies] = useState({});
    const [replyContent, setReplyContent] = useState({});
    const auth = getAuth();
    const db = getFirestore();

    // Fetch threads when component mounts
    useEffect(() => {
        const q = query(collection(db, 'threads'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const threadsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setThreads(threadsData);

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

        const notificationsRef = collection(db, 'notifications');
        const threadRef = doc(db, 'threads', threadId);

        try {
            await addDoc(collection(db, 'threads', threadId, 'replies'), reply);

            const threadDoc = await getDoc(threadRef);
            if (threadDoc.exists()) {
                const threadData = threadDoc.data();

                // Create notification for the thread author
                if (user.uid !== threadData.authorId) {
                    await addDoc(notificationsRef, {
                        userId: threadData.authorId,
                        message: `${user.displayName || 'Someone'} replied to your post!`,
                        postId: threadId,
                        createdAt: serverTimestamp(),
                    });
                }
            }

            setReplyContent((prev) => ({ ...prev, [threadId]: '' }));
        } catch (err) {
            console.error('Error submitting reply or creating notification:', err);
        }
    };

    // Handle liking/unliking a thread
    const handleLike = async (threadId) => {
        const user = auth.currentUser;
        if (!user) {
            alert('You must be logged in to like a post.');
            return;
        }

        const likeRef = doc(db, 'likes', user.uid, 'threadLikes', threadId);
        const threadRef = doc(db, 'threads', threadId);
        const notificationsRef = collection(db, 'notifications');

        try {
            if (likedThreads.includes(threadId)) {
                // Unlike the thread
                await deleteDoc(likeRef);
                await updateDoc(threadRef, {
                    likes: (threads.find((thread) => thread.id === threadId).likes || 0) - 1,
                });
                setLikedThreads((prev) => prev.filter((id) => id !== threadId));
            } else {
                // Like the thread
                await setDoc(likeRef, { likedAt: serverTimestamp() });
                await updateDoc(threadRef, {
                    likes: (threads.find((thread) => thread.id === threadId).likes || 0) + 1,
                });

                // Fetch thread data to create a notification
                const threadDoc = await getDoc(threadRef);
                if (threadDoc.exists()) {
                    const threadData = threadDoc.data();

                    if (user.uid !== threadData.authorId) {
                        await addDoc(notificationsRef, {
                            userId: threadData.authorId,
                            message: `${user.displayName || 'Someone'} liked your post!`,
                            postId: threadId,
                            createdAt: serverTimestamp(),
                        });
                    }
                }

                setLikedThreads((prev) => [...prev, threadId]);
            }
        } catch (err) {
            console.error('Error liking/unliking thread:', err);
        }
    };

    // Handle deleting a thread
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
