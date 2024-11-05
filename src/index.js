import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Global styles
import App from './App';
import reportWebVitals from './reportWebVitals';
//import { initializeApp } from 'firebase/app';
//import { getAuth } from 'firebase/auth';


const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}

reportWebVitals();
