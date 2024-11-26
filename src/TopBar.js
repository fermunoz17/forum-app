import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, onSnapshot, deleteDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './TopBar.css';

const TopBar = () => {
    const [notifications, setNotifications] = useState([]); // Notification state
    const [showDropdown, setShowDropdown] = useState(false); // Dropdown for notifications
    const [showMenu, setShowMenu] = useState(false); // Dropdown for left button menu
    const auth = getAuth();
    const db = getFirestore();
    const navigate = useNavigate();

    // Clear all notifications
    const clearNotifications = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        try {
            const q = query(collection(db, 'notifications'), where('userId', '==', userId));
            const querySnapshot = await getDocs(q);

            const batch = [];
            querySnapshot.forEach((doc) => {
                batch.push(deleteDoc(doc.ref));
            });

            await Promise.all(batch);
            console.log('All notifications cleared!');
            setNotifications([]);
        } catch (err) {
            console.error('Error clearing notifications:', err);
        }
    };

    useEffect(() => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const q = query(collection(db, 'notifications'), where('userId', '==', userId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notificationsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setNotifications(notificationsData);
        });

        return () => unsubscribe();
    }, [db, auth.currentUser]);

    // Toggle notification dropdown
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    // Toggle menu dropdown
    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    // Navigate to different pages
    const goToPage = (page) => {
        navigate(page);
        setShowMenu(false); // Close menu after navigation
    };

    return (
        <div className="top-bar">
            {/* Left Menu Button */}
            <button className="top-bar-bttn" onClick={toggleMenu}>
                <img src="/favicon.ico" alt="Y-logo" className="logo" />
            </button>

            {/* Dropdown for menu */}
            {showMenu && (
                <div className="menu-dropdown">
                    <ul>
                        <li onClick={() => goToPage('/dashboard')}>Main page</li>
                        <li onClick={() => goToPage('/profiles')}>Profiles</li>
                        <li onClick={() => goToPage('/settings')}>Settings</li>
                    </ul>
                </div>
            )}

            {/* Center Title */}
            <h1 className="title">Welcome to Y</h1>

            {/* Right Notification Bell */}
            <div className="notification-btn" onClick={toggleDropdown}>
                <div className="n-icon">
                    <img
                        src="/transparent-red-flat-bell-notification-icon-701751695033975wbdrqhav11.png"
                        alt="Notification Bell"
                        className="n-icon"
                    />
                </div>
                {notifications.length > 0 && (
                    <span className="notification-count">{notifications.length}</span>
                )}
            </div>

            {/* Notification Dropdown */}
            {showDropdown && (
                <div className="notification-dropdown">
                    <h4>Notifications</h4>
                    {notifications.length > 0 ? (
                        <>
                            <ul>
                                {notifications.map((notification) => (
                                    <li key={notification.id}>{notification.message}</li>
                                ))}
                            </ul>
                            <button onClick={clearNotifications} className="clear-btn">
                                Clear All
                            </button>
                        </>
                    ) : (
                        <p>No new notifications</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default TopBar;