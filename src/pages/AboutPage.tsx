import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AuthModal from '../components/AuthModal';

export default function AboutPage() {
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
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => setShowAuthModal(false)}
      />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-4 text-blue-800">About MyWardBulletin</h1>
          <p className="mb-4 text-lg text-gray-700">
            <b>MyWardBulletin</b> is a free, privacy-focused tool for creating, sharing, and printing digital ward bulletins for Latter-day Saint congregations.
          </p>
          <ul className="mb-6 space-y-2 text-gray-700">
            <li>• <b>Easy to Use:</b> Create beautiful bulletins in minutes with a simple, modern interface.</li>
            <li>• <b>Share Instantly:</b> Share a link or QR code with your ward members—no sign-in required for viewing.</li>
            <li>• <b>Print-Ready:</b> Download a PDF for easy printing and distribution.</li>
            <li>• <b>Private & Secure:</b> All data is processed in your browser. Your information is never sold or shared.</li>
          </ul>
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <div className="flex-1 bg-blue-50 rounded-lg p-4 shadow">
              <h2 className="text-xl font-semibold text-blue-700 mb-2">Contact & Support</h2>
              <p className="text-gray-700">Questions? <a href="mailto:matthew@mywardbulletin.com" className="text-blue-600 underline">Email us</a> any time.</p>
            </div>
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
