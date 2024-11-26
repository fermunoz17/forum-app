import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, onSnapshot, deleteDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './TopBar.css';

const TopBar = () => {
  const [notifications, setNotifications] = useState([]); // Estado para notificaciones
  const [showDropdown, setShowDropdown] = useState(false); // Estado para el desplegable
  const auth = getAuth();
  const db = getFirestore();

  // Función para limpiar todas las notificaciones
  const clearNotifications = async () => {
    const userId = auth.currentUser?.uid; // Asegúrate de que el usuario esté autenticado
    if (!userId) return;

    try {
      // Crear una consulta para obtener todas las notificaciones del usuario
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );

      // Obtener todas las notificaciones del usuario
      const querySnapshot = await getDocs(q);

      // Eliminar cada documento de notificación
      const batch = [];
      querySnapshot.forEach((doc) => {
        batch.push(deleteDoc(doc.ref)); // Agrega cada notificación a la lista de eliminaciones
      });

      await Promise.all(batch); // Espera a que todas las notificaciones sean eliminadas
      console.log('All notifications cleared!');
      setNotifications([]); // Actualiza el estado local de notificaciones
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Consultar las notificaciones del usuario actual
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notificationsData);
    });

    return () => unsubscribe();
  }, [db, auth.currentUser]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="top-bar">
      <button className="top-bar-bttn">
        <img src="/favicon.ico" alt="Y-logo" className="logo" />
      </button>
      <h1 className="title">Welcome to Y</h1>
      <div className="notification-icon" onClick={toggleDropdown}>
        <div className="n-icon">N</div>
        {notifications.length > 0 && (
          <span className="notification-count">{notifications.length}</span>
        )}
      </div>
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
