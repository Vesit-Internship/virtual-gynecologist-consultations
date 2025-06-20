import React from 'react';
import ReactDOM from 'react-dom/client';
import VirtualGynecologistApp from './app.jsx';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
  <React.StrictMode>
    <VirtualGynecologistApp />
  </React.StrictMode>
); 