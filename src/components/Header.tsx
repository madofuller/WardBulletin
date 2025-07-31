import React from 'react';
import Logo from './Logo';
import UserMenu from './UserMenu';
import { Plus, Download, QrCode, LogIn, Menu, X, Settings } from 'lucide-react';

export default function Header({
  user,
  loading,
  currentBulletinId,
  hasUnsavedChanges,
  showQRCode,
  setShowQRCode,
  setShowAuthModal,
  handleNewBulletin,
  handleExportPDF,
  handleSaveBulletin,
  handleViewSavedBulletins,
  setUser,
  setShowProfile,
  showMobileMenu,
  setShowMobileMenu,
  isSupabaseConfigured,
  hideExportPDF = false,
  hideQRCode = false,
  onlyNewBulletin = false,
  onOpenCustomizationTest
}) {
  return (
    <header className="bg-white shadow-lg border-b-4 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-shadow no-underline" style={{ textDecoration: 'none' }}>
            <Logo size={40} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MyWardBulletin</h1>
              <p className="text-sm text-gray-600">Ward Bulletin Creator</p>
            </div>
          </a>
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={handleNewBulletin}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Bulletin
            </button>
            {!onlyNewBulletin && !hideExportPDF && (
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </button>
            )}
            {!onlyNewBulletin && user && (
              <button
                onClick={handleSaveBulletin}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Saving...' : (currentBulletinId ? 'Update Bulletin' : 'Save Bulletin')}
              </button>
            )}
            {!onlyNewBulletin && !hideQRCode && (
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title="Manage your permanent QR code"
              >
                <QrCode className="w-4 h-4 mr-2" />
                My QR Code
              </button>
            )}
            {!onlyNewBulletin && onOpenCustomizationTest && (
              <button
                onClick={onOpenCustomizationTest}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                title="Test customization functionality"
              >
                <Settings className="w-4 h-4 mr-2" />
                Test Customization
              </button>
            )}
            {!onlyNewBulletin && (user ? (
              <UserMenu
                user={user}
                onSignOut={() => setUser(null)}
                onSaveBulletin={handleSaveBulletin}
                onViewSavedBulletins={handleViewSavedBulletins}
                hasUnsavedChanges={hasUnsavedChanges}
                onOpenProfile={() => setShowProfile(true)}
              />
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                title="Sign In"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </button>
            ))}
          </div>
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-3">
              <button
                onClick={() => {
                  handleNewBulletin();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Bulletin
              </button>
              {!onlyNewBulletin && !hideExportPDF && (
                <button
                  onClick={() => {
                    handleExportPDF();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </button>
              )}
              {!onlyNewBulletin && user && (
                <button
                  onClick={() => {
                    handleSaveBulletin();
                    setShowMobileMenu(false);
                  }}
                  disabled={loading}
                  className="w-full flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Saving...' : (currentBulletinId ? 'Update Bulletin' : 'Save Bulletin')}
                </button>
              )}
              {!onlyNewBulletin && !hideQRCode && (
                <button
                  onClick={() => {
                    setShowQRCode(!showQRCode);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  My QR Code
                </button>
              )}
              {!onlyNewBulletin && (user ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      handleViewSavedBulletins();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    My Bulletins
                  </button>
                  <button
                    onClick={() => {
                      setUser(null);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setShowMobileMenu(false);
                  }}
                  disabled={!isSupabaseConfigured()}
                  className="w-full flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {isSupabaseConfigured() ? 'Sign In' : 'Sign In (Setup Required)'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 