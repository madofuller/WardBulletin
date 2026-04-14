import React from 'react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import UserMenu from './UserMenu';
import TerminologyToggle from './TerminologyToggle';
import LanguageSelector from './LanguageSelector';
import BulletinActions from './BulletinActions';
import { Plus, Download, QrCode, LogIn, Menu, X, Droplet } from 'lucide-react';
import { getUnitLabel, getTranslatedUnitLabel } from '../lib/terminology';
import { BulletinData } from '../types/bulletin';

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
  hideExportPDF = false,
  hideQRCode = false,
  onlyNewBulletin = false,
  // New props for bulletin actions
  bulletinData,
  onMakeActive,
  onScheduleBulletin,
  onSaveAsTemplate,
  currentBulletinStatus,
  currentProfileSlug
}: {
  user: any;
  loading: boolean;
  currentBulletinId: string | null;
  hasUnsavedChanges: boolean;
  showQRCode: boolean;
  setShowQRCode: (show: boolean) => void;
  setShowAuthModal: (show: boolean) => void;
  handleNewBulletin: () => void;
  handleExportPDF: () => void;
  handleSaveBulletin: () => void;
  handleViewSavedBulletins: () => void;
  setUser: (user: any) => void;
  setShowProfile: (show: boolean) => void;
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
  hideExportPDF?: boolean;
  hideQRCode?: boolean;
  onlyNewBulletin?: boolean;
  bulletinData?: BulletinData;
  onMakeActive?: () => void;
  onScheduleBulletin?: (scheduledDate: string) => void;
  onSaveAsTemplate?: () => void;
  currentBulletinStatus?: string;
  currentProfileSlug?: string;
}) {
  const { t } = useTranslation();
  return (
    <header className="bg-white shadow-lg border-b-4 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-shadow no-underline" style={{ textDecoration: 'none' }}>
            <Logo size={40} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">WardBulletin</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">{getUnitLabel()} Bulletin Creator</p>
                {currentProfileSlug && (
                  <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium truncate max-w-[150px]" title={t('header.currentlyViewingProfile', { slug: currentProfileSlug })}>
                    {t('header.profile')}: {currentProfileSlug}
                  </span>
                )}
              </div>
            </div>
          </a>
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            <TerminologyToggle />
            <LanguageSelector />
            <button
              onClick={handleNewBulletin}
              className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm rounded-full hover:bg-gray-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">{t('common.newBulletin')}</span>
            </button>
            <a
              href={currentProfileSlug ? `/baptism/${currentProfileSlug}` : '/baptism'}
              className="inline-flex items-center px-3 py-2 bg-cyan-600 text-white text-sm rounded-full hover:bg-cyan-700 transition-colors whitespace-nowrap"
              title="Baptism Program"
            >
              <Droplet className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">Baptism</span>
            </a>
            {!onlyNewBulletin && !hideExportPDF && (
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-full hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span className="truncate">{t('common.exportPdf')}</span>
              </button>
            )}
            {!onlyNewBulletin && bulletinData && onMakeActive && onScheduleBulletin && onSaveAsTemplate && (
              <BulletinActions
                user={user}
                bulletinData={bulletinData}
                onMakeActive={onMakeActive}
                onSchedule={onScheduleBulletin}
                onSaveAsTemplate={onSaveAsTemplate}
                loading={loading}
                currentStatus={currentBulletinStatus}
              />
            )}
            {!onlyNewBulletin && !hideQRCode && (
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700 transition-colors whitespace-nowrap"
                title={t('qrCode.printQrCode')}
              >
                <QrCode className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span className="truncate">{t('common.myQrCode')}</span>
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
                className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm rounded-full hover:bg-gray-700 transition-colors whitespace-nowrap"
                title={t('common.signIn')}
              >
                <LogIn className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span className="truncate">{t('common.signIn')}</span>
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
              <div className="flex justify-center gap-2">
                <TerminologyToggle />
                <LanguageSelector />
              </div>
              <button
                onClick={() => {
                  handleNewBulletin();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('common.newBulletin')}
              </button>
              <a
                href={currentProfileSlug ? `/baptism/${currentProfileSlug}` : '/baptism'}
                onClick={() => setShowMobileMenu(false)}
                className="w-full flex items-center px-4 py-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition-colors"
              >
                <Droplet className="w-4 h-4 mr-2" />
                Baptism Program
              </a>
              {!onlyNewBulletin && !hideExportPDF && (
                <button
                  onClick={() => {
                    handleExportPDF();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('common.exportPdf')}
                </button>
              )}
              {!onlyNewBulletin && user && (
                <button
                  onClick={() => {
                    handleSaveBulletin();
                    setShowMobileMenu(false);
                  }}
                  disabled={loading}
                  className="w-full flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {loading ? t('common.saving') : (currentBulletinId ? t('bulletin.updateBulletin') : t('bulletin.saveBulletin'))}
                </button>
              )}
              {!onlyNewBulletin && !hideQRCode && (
                <button
                  onClick={() => {
                    setShowQRCode(!showQRCode);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  {t('common.myQrCode')}
                </button>
              )}
              {!onlyNewBulletin && (user ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      handleViewSavedBulletins();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {t('bulletin.myBulletins')}
                  </button>
                  <button
                    onClick={() => {
                      setUser(null);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    {t('common.signOut')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('common.signIn')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 