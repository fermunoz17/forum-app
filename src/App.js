import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './dashboard';
import CreatePost from './CreatePost';
import ViewPosts from './ViewPosts';
import Profiles from './Profiles';
import UserPosts from './UserPosts';
import Settings from './Settings'; // Import the new Settings component


// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ? user : null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('User logged out');
      })
      .catch((error) => {
        console.error('Error logging out:', error.message);
      });
  };

  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LoginOrSignUp />} />
            <Route path="/dashboard" element={user ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/" />} />
            <Route path="/create-post" element={user ? <CreatePost /> : <Navigate to="/" />} />
            <Route path="/view-posts" element={user ? <ViewPosts /> : <Navigate to="/" />} />
            <Route path="/profiles" element={user ? <Profiles /> : <Navigate to="/" />} />
            <Route path="/user-posts/:userId" element={user ? <UserPosts /> : <Navigate to="/" />} />
            <Route path="/settings" element={user ? <Settings /> : <Navigate to="/" />} />

          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

const LoginOrSignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('User logged in:', userCredential.user);
      })
      .catch((error) => {
        console.error('Error logging in:', error.message);
        setError(error.message);
      });
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('User signed up:', userCredential.user);
      })
      .catch((error) => {
        console.error('Error signing up:', error.message);
        setError(error.message);
      });
  };

  return (
    <div className="form-container">
      <h1>{showSignUp ? 'Sign Up' : 'Login'}</h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={showSignUp ? handleSignUp : handleLogin} className="form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input-field"
        />
        <button type="submit" className="submit-btn">{showSignUp ? 'Sign Up' : 'Login'}</button>
      </form>
      <p className="toggle-text">
        {showSignUp ? 'Already have an account?' : "Don't have an account?"}
      </p>
      <button onClick={() => setShowSignUp(!showSignUp)} className="toggle-btn">
        {showSignUp ? 'Login' : 'Sign Up'}
      </button>
    </div>
  );
};

export default App;
