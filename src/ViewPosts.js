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
import { useNavigate } from 'react-router-dom';

const ViewPosts = () => {
    const [threads, setThreads] = useState([]);
    const [replies, setReplies] = useState({});
    const [replyContent, setReplyContent] = useState({});
    const auth = getAuth();
    const db = getFirestore();
    const navigate = useNavigate();

    // Fetch threads
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

        return () => unsubscribe(); // Cleanup listener when the component unmounts
    }, [db]);

    // Fetch replies for a thread
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
            createdAt: serverTimestamp(),
        };

        const notificationsRef = collection(db, 'notifications');
        const threadRef = doc(db, 'threads', threadId);

        try {
            // Add the reply to the subcollection
            await addDoc(collection(db, 'threads', threadId, 'replies'), reply);

            // Fetch the thread details to get the original author
            const threadDoc = await getDoc(threadRef);
            if (threadDoc.exists()) {
                const threadData = threadDoc.data();

                // Create a notification for the original thread author (if the replier is not the author)
                if (user.uid !== threadData.authorId) {
                    await addDoc(notificationsRef, {
                        userId: threadData.authorId,
                        message: `${user.displayName || 'Someone'} replied to your post!`,
                        postId: threadId,
                        createdAt: serverTimestamp(),
                    });
                    console.log('Notification for reply created!');
                }
            }

            // Reset the reply content field for the thread
            setReplyContent((prev) => ({ ...prev, [threadId]: '' }));
        } catch (err) {
            console.error('Error submitting reply or creating notification:', err);
        }
    };

    const handleLike = async (threadId, authorId) => {
        const currentUser = auth.currentUser;
    
        // Prevent the user from liking their own post
        if (currentUser.uid === authorId) {
            alert("You cannot like your own post.");
            return;
        }
    
        const threadRef = doc(db, 'threads', threadId);
        const notificationsRef = collection(db, 'notifications');
    
        try {
            // Increment the like count in Firestore
            await updateDoc(threadRef, {
                likes: increment(1),
            });
    
            console.log(`Like added to thread: ${threadId}`);
    
            // Create a notification for the author
            const likerName = currentUser.displayName || 'Someone';
            await addDoc(notificationsRef, {
                userId: authorId,
                message: `${likerName} liked your post!`,
                postId: threadId,
                createdAt: serverTimestamp(),
            });
            console.log('Notification created!');
        } catch (err) {
            console.error('Error liking thread or creating notification:', err);
        }
    };
    

    // Handle deleting a thread
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
            setThreads((prevThreads) => prevThreads.filter((thread) => thread.id !== threadId));
            console.log(`Thread ${threadId} deleted successfully.`);
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

    // Navigate back to the dashboard
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
                                <button className="like-bttn" onClick={() => handleLike(thread.id, thread.authorId)}>Like</button>

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
