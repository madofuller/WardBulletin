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
import { bulletinScheduler } from './lib/bulletinScheduler';

export default function App() {
  useEffect(() => {
    // Start the bulletin scheduler when the app loads
    bulletinScheduler.start();

    // Cleanup on unmount
    return () => {
      bulletinScheduler.stop();
    };
  }, []);

  return (
    <ErrorBoundary>
      <NetworkErrorHandler>
        <Routes>
          <Route path="/" element={<EditorApp />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-to-use" element={<HowToUsePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/invite/:token" element={<InvitePage />} />
          <Route path="/submit/:slug" element={<AnnouncementSubmissionPage />} />
          <Route path="/:slug" element={<PublicBulletinPage />} />
        </Routes>
      </NetworkErrorHandler>
    </ErrorBoundary>
  );
}
