import React, { useState } from 'react';
import Header from '../components/Header';
import AuthModal from '../components/AuthModal';

export default function AboutPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const goHome = () => { window.location.href = '/'; };
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

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto mt-8">
          <h1 className="text-4xl font-bold mb-4 text-blue-800">About MyWardBulletin</h1>
          <p className="mb-4 text-lg text-gray-700">
            MyWardBulletin is a free, private, and modern tool built specifically for Latter-day Saint wards and branches. It simplifies how Sunday programs and announcements are created, shared, and printed.
          </p>
          <p className="mb-4 text-gray-700">
            I originally built this for my wife when she was called as the ward bulletin specialist. The tools out there were either too clunky, too rigid, or over-engineered. She just needed something that was simple, flexible, and worked every week.
          </p>
          <p className="mb-4 text-gray-700">
            <b>Simple to Use. Built for Sharing.</b>
          </p>
          <p className="mb-4 text-gray-700">
          You can start building a bulletin instantly. When you're ready to save or share it, just create a free account. That gives you access to:
          </p>
          <ul className="mb-4 ml-6 list-disc text-gray-700">
            <li>A custom link for easy sharing</li>
            <li>A built-in QR code to print or display</li>
            <li>Secure cloud storage to manage multiple bulletins</li>
            <li>Access from any device, anytime</li>
          </ul>
          <h2 className="text-2xl font-bold mt-8 mb-4 text-blue-700">What Makes It Different</h2>
          <ul className="mb-6 space-y-3 text-gray-700">
            <li>✅ <b>Quick and Clean</b><br/>Start editing right away. The layout is designed to be fast and frustration-free.</li>
            <li>🔗 <b>Instant Sharing</b><br/>Every bulletin gets a unique link and QR code. Share by text, email, printed poster, or slide.</li>
            <li>🖨️ <b>Print-Optimized</b><br/>Generate foldable, PDF bulletins that look clean and modern. Designed for sacrament meeting tables.</li>
            <li>🔒 <b>Private by Design</b><br/>No cookies. No trackers. No data sales. You control what’s shared and who sees it.</li>
            <li>📱 <b>Mobile-Friendly</b><br/>Use it from your phone, tablet, or laptop. No download or app required.</li>
            <li>💾 <b>Auto-Saving and Cloud Sync</b><br/>Drafts are saved in your browser. If you make an account, you can save, manage, and edit multiple bulletins from anywhere.</li>
            <li>🚫 <b>Zero Ads. Zero Distractions.</b><br/>No analytics scripts, no popups, no upsells. Just the tool you need, nothing more.</li>
          </ul>
          <p className="mb-4 text-gray-700 italic">
            Not an official Church product—just something built to make Sundays simpler.
          </p>
          <p className="mb-4 text-gray-700">
            If it helps your ward, I’m glad. If you have suggestions, let me know.
          </p>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 text-base font-medium">
              MyWardBulletin.com — Free Ward Bulletin Creator
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
