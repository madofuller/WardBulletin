import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from './lib/SessionContext';
const queryClient = new QueryClient();

// Safely inject Vercel analytics with error handling
// This prevents the app from crashing when analytics scripts are blocked
const initializeAnalytics = async () => {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Dynamically import analytics to avoid blocking if module is blocked
      const { inject } = await import('@vercel/analytics');
      if (typeof inject === 'function') {
        inject();
      }
    }
  } catch (error) {
    // Silently fail if analytics can't be loaded (e.g., due to script blocking)
    console.warn('Vercel analytics could not be loaded:', error);
  }
};

// Initialize analytics asynchronously after app renders to not block app loading
setTimeout(initializeAnalytics, 100);

// Suppress findDOMNode warnings from react-quill (third-party library issue)
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && message.includes('findDOMNode is deprecated')) {
    return; // Suppress this specific warning
  }
  originalWarn.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <App />
        </SessionProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
