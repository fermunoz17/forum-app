import React, { useState, useEffect } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import SignUp from './SignUp';
import Dashboard from './dashboard';
import CreatePost from './CreatePost';
import ViewPosts from './ViewPosts';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTBzcOASlhZqaoNDLTsuDvmVZD7ZAN4HM",
  authDomain: "forum-app-36bf6.firebaseapp.com",
  projectId: "forum-app-36bf6",
  storageBucket: "forum-app-36bf6.appspot.com",
  messagingSenderId: "877596523195",
  appId: "1:877596523195:web:8132f3ff5d191eb009879e",
  measurementId: "G-XZ92PLZDG7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [user, setUser] = useState(null);

  // Handle authentication state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ? user : null);
    });
    return () => unsubscribe();
  }, []);

  // Handle logout
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
        <Routes>
          {/* Default route - if the user is logged in, go to dashboard; otherwise, show login/signup */}
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LoginOrSignUp />} />
          {/* If the user is logged in, go to dashboard; otherwise, redirect to login */}
          <Route path="/dashboard" element={user ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/" />} />
          {/* If the user is logged in, allow post creation; otherwise, redirect to login */}
          <Route path="/create-post" element={user ? <CreatePost /> : <Navigate to="/" />} />
          {/* If the user is logged in, show posts; otherwise, redirect to login */}
          <Route path="/view-posts" element={user ? <ViewPosts /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

// Login or Sign-Up Component (Toggles between Login and Sign-Up)
const LoginOrSignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);  // Toggle between Login and Sign-Up

  // Handle login form submission
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

  // Handle sign-up form submission
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
    <header className="App-header">
      <h1>{showSignUp ? 'Sign Up for MyTwitter' : 'Login to MyTwitter'}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={showSignUp ? handleSignUp : handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{showSignUp ? 'Sign Up' : 'Login'}</button>
      </form>
      <p>{showSignUp ? 'Already have an account?' : "Don't have an account?"}</p>
      <button onClick={() => setShowSignUp(!showSignUp)}>
        {showSignUp ? 'Login' : 'Sign Up'}
      </button>
    </header>
  );
};

export default App;
