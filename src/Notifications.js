import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const auth = getAuth();
    const db = getFirestore();
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        if (!userId) return;

        // Consultar notificaciones para el usuario actual
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notificationsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setNotifications(notificationsData);
        });

        return () => unsubscribe();
    }, [db, userId]);

    return (
        <div>
            <h2>Notifications</h2>
            {notifications.length > 0 ? (
                <ul>
                    {notifications.map((notification) => (
                        <li key={notification.id}>
                            {notification.message} (Post ID: {notification.postId})
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No notifications yet.</p>
            )}
        </div>
    );
};

export default Notifications;
