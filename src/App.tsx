import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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

export default function App() {
  // Note: Scheduled bulletin activation is handled by SessionContext
  // which properly filters bulletins by the logged-in user

  return (
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
  );
}
