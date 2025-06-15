import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Import global styles
import '@styles/index.css';

// Import component styles
import '@components/ui/Loading.css';
import '@components/ui/Alert.css';
import '@components/layout/Navigation.css';
import '@components/layout/Footer.css';
import '@components/common/ErrorBoundary.css';

// Development mode logging
if (import.meta.env.DEV) {
  console.log('🚀 Dark Blog starting in development mode');
  console.log('📋 Environment variables:', {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    APP_NAME: import.meta.env.VITE_APP_NAME,
    APP_VERSION: import.meta.env.VITE_APP_VERSION,
    MODE: import.meta.env.MODE,
  });
}

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);