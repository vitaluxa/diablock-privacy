import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Add global error handlers to catch startup errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Prevent app from crashing silently
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent default browser error handling
});

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (error) {
  console.error('Failed to render app:', error);
  // Show error message to user
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; text-align: center; color: white; background: #1a1a2e; min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column;">
      <h1>App Failed to Load</h1>
      <p>Error: ${error.message}</p>
      <p>Please restart the app.</p>
    </div>
  `;
}






