import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// تسجيل الـ Service Worker يتم تلقائياً عبر vite-plugin-pwa (virtual:pwa-register)
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  }).catch(() => {
    // في وضع التطوير بدون PWA build، يتم تجاهل الخطأ بأمان
  });
}
