import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkErrorHandler from './components/NetworkErrorHandler';
import EditorApp from './pages/EditorApp';
import AboutPage from './pages/AboutPage';
import HowToUsePage from './pages/HowToUsePage';
import ContactPage from './pages/ContactPage';
import PublicBulletinPage from './pages/PublicBulletinPage';
import AnnouncementSubmissionPage from './pages/AnnouncementSubmissionPage';
import InvitePage from './pages/InvitePage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Loading fallback for i18n
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export default function App() {
  // Note: Scheduled bulletin activation is handled by SessionContext
  // which properly filters bulletins by the logged-in user

  return (
    <HelmetProvider>
      <Suspense fallback={<LoadingFallback />}>
        <ErrorBoundary>
          <NetworkErrorHandler>
            <Routes>
            <Route path="/" element={<EditorApp />} />
            <Route path="/profile/:slug" element={<EditorApp />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-to-use" element={<HowToUsePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/invite/:token" element={<InvitePage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/submit/:slug" element={<AnnouncementSubmissionPage />} />
            <Route path="/:slug" element={<PublicBulletinPage />} />
            </Routes>
          </NetworkErrorHandler>
        </ErrorBoundary>
      </Suspense>
    </HelmetProvider>
  );
}
