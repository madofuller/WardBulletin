import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AuthModal from '../components/AuthModal';

export default function HowToUsePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  // Handler to redirect to homepage
  const goHome = () => navigate('/');
  // Handler to open auth modal
  const openAuthModal = () => setShowAuthModal(true);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header
        user={null}
        loading={false}
        currentBulletinId={null}
        hasUnsavedChanges={false}
        showQRCode={false}
        setShowQRCode={() => {}}
        setShowAuthModal={openAuthModal}
        handleNewBulletin={goHome}
        handleExportPDF={goHome}
        handleSaveBulletin={goHome}
        handleViewSavedBulletins={goHome}
        setUser={goHome}
        setShowProfile={goHome}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        isSupabaseConfigured={true}
        hideExportPDF={true}
        hideQRCode={true}
        onlyNewBulletin={true}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => setShowAuthModal(false)}
      />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-4 text-blue-800">How To Use MyWardBulletin</h1>
          <ol className="list-decimal list-inside text-lg text-gray-700 space-y-3 mb-6">
            <li>
              <b>Create a Bulletin:</b> Fill out the form with your ward’s information, announcements, and program details.
            </li>
            <li>
              <b>Preview Instantly:</b> See a live preview of your bulletin as you type.
            </li>
            <li>
              <b>Save or Update:</b> Save your bulletin to your account for future editing, or update an existing one.
            </li>
            <li>
              <b>Share:</b> Share a public link or QR code with your ward members. No sign-in required to view.
            </li>
            <li>
              <b>Print:</b> Download a print-ready PDF for physical distribution.
            </li>
          </ol>
          <div className="bg-blue-50 rounded-lg p-4 shadow text-blue-700">
            <b>Tip:</b> All your data is private and processed in your browser. You can use MyWardBulletin on any device!
          </div>
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              MyWardBulletin.com - Free Ward Bulletin Creator
            </p>
            <p className="text-sm text-gray-500 mt-2">
              All data is processed locally in your browser for privacy and security
            </p>
            <nav className="mt-4 space-x-4">
              <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="/how-to-use" className="text-gray-600 hover:text-gray-900">How To Use</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
