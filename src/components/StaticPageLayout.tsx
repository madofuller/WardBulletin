import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import AuthModal from './AuthModal';

interface StaticPageLayoutProps {
  children: React.ReactNode;
}

export default function StaticPageLayout({ children }: StaticPageLayoutProps) {
  const { t } = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const goHome = () => { window.location.href = '/'; };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header
        user={null}
        loading={false}
        currentBulletinId={null}
        hasUnsavedChanges={false}
        showQRCode={false}
        setShowQRCode={() => {}}
        setShowAuthModal={() => setShowAuthModal(true)}
        handleNewBulletin={goHome}
        handleExportPDF={goHome}
        handleSaveBulletin={goHome}
        handleViewSavedBulletins={goHome}
        setUser={goHome}
        setShowProfile={goHome}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        hideExportPDF={true}
        hideQRCode={true}
        onlyNewBulletin={true}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => setShowAuthModal(false)}
      />

      {children}

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 text-base font-medium">
              &copy; WardBulletin
            </p>
            <nav className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
              <a href="/about" className="text-gray-600 hover:text-gray-900">{t('footer.about')}</a>
              <a href="/how-to-use" className="text-gray-600 hover:text-gray-900">{t('footer.howToUse')}</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900">{t('footer.contact')}</a>
            </nav>
            <nav className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
              <span className="text-gray-400 text-sm">Guides:</span>
              <a href="/guide/create-ward-bulletin" className="text-sm text-gray-500 hover:text-gray-900">Create a Bulletin</a>
              <a href="/guide/bulletin-templates" className="text-sm text-gray-500 hover:text-gray-900">Templates &amp; Ideas</a>
              <a href="/guide/sacrament-meeting-program" className="text-sm text-gray-500 hover:text-gray-900">Program Guide</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
