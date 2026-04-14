import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkErrorHandler from './components/NetworkErrorHandler';

const EditorApp = lazy(() => import('./pages/EditorApp'));
const PublicBulletinPage = lazy(() => import('./pages/PublicBulletinPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const HowToUsePage = lazy(() => import('./pages/HowToUsePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AnnouncementSubmissionPage = lazy(() => import('./pages/AnnouncementSubmissionPage'));
const InvitePage = lazy(() => import('./pages/InvitePage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const BulletinGuidePage = lazy(() => import('./pages/BulletinGuidePage'));
const TemplateIdeasPage = lazy(() => import('./pages/TemplateIdeasPage'));
const ProgramGuidePage = lazy(() => import('./pages/ProgramGuidePage'));
const BaptismEditor = lazy(() => import('./pages/BaptismEditor'));

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
            <Route path="/guide/create-ward-bulletin" element={<BulletinGuidePage />} />
            <Route path="/guide/bulletin-templates" element={<TemplateIdeasPage />} />
            <Route path="/guide/sacrament-meeting-program" element={<ProgramGuidePage />} />
            <Route path="/baptism" element={<BaptismEditor />} />
            <Route path="/baptism/:slug" element={<BaptismEditor />} />
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
