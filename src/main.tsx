import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeApiRouter } from './apiMock.ts';

// Initialize transparent full-stack local/static API router fallback
initializeApiRouter();

// Register Service Worker for offline capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[MIGO SW] Registered successfully with scope:', reg.scope);
      })
      .catch((err) => {
        console.error('[MIGO SW] Registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
