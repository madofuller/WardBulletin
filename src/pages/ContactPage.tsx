import React, { useState } from 'react';
import Header from '../components/Header';
import AuthModal from '../components/AuthModal';

export default function ContactPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  // Handler to redirect to homepage
  const goHome = () => { window.location.href = '/'; };
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
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto mt-8">
          <h1 className="text-3xl font-bold mb-4 text-blue-800">Contact</h1>
          <p className="mb-4 text-lg text-gray-700">
            Have a question, need help, or want to suggest a feature?<br/>
            I’d love to hear from you.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-2 text-blue-700">📬 Email</h2>
          <p className="mb-4 text-gray-700">
            You can reach me directly at:<br/>
            <a href="mailto:matthew@mywardbulletin.com" className="text-blue-600 underline">matthew@mywardbulletin.com</a>
          </p>
          <p className="mb-4 text-gray-700">
            I try to respond to all messages within 1–2 days. If it’s urgent (like something broke on Sunday morning), please include <b>URGENT</b> in the subject line.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-2 text-blue-700">💡 Feedback or Feature Requests</h2>
          <p className="mb-4 text-gray-700">
          If there's something you'd like the tool to do, or something that's confusing, feel free to send it my way. MyWardBulletin is constantly improving based on real user input.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-2 text-blue-700">🙏 Built with Purpose</h2>
          <p className="mb-4 text-gray-700">
            This is a personal project built to support callings like the one my wife received. If it’s helping your ward, I’d love to know. And if it’s falling short, I want to fix it.
          </p>
          <p className="mb-4 text-gray-700">
            No forms. No bots. Just email me.<br/>
            <a href="mailto:matthew@mywardbulletin.com" className="text-blue-600 underline">matthew@mywardbulletin.com</a>
          </p>
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              MyWardBulletin.com - Free Ward Bulletin Creator
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
