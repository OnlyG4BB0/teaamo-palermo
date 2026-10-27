import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Prevent unwanted double-tap zoom and pinch gestures on mobile devices
if (typeof window !== 'undefined') {
  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        // Only prevent if not targeting native form inputs
        const target = event.target as HTMLElement | null;
        if (target && !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
          event.preventDefault();
        }
      }
      lastTouchEnd = now;
    },
    { passive: false }
  );

  document.addEventListener(
    'gesturestart',
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
