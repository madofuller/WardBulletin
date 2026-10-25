import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from './lib/SessionContext';

const queryClient = new QueryClient();

const initializeAnalytics = async () => {
  try {
    if (typeof window !== 'undefined') {
      const { inject } = await import('@vercel/analytics');
      if (typeof inject === 'function') {
        inject();
      }
    }
  } catch (error) {
    console.warn('Vercel analytics could not be loaded:', error);
  }
};

setTimeout(initializeAnalytics, 100);

const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && message.includes('findDOMNode is deprecated')) {
    return;
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
