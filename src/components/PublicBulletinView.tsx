import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Home } from 'lucide-react';
import BulletinPreview from './BulletinPreview';
import { BulletinData } from '../types/bulletin';
import { UnitType } from '../lib/terminology';

interface PublicBulletinViewProps {
  bulletinData: BulletinData | null;
  loading: boolean;
  error: string;
  onBackToEditor: () => void;
  unitTypeOverride?: UnitType;
}

export default function PublicBulletinView({
  bulletinData,
  loading,
  error,
  onBackToEditor,
  unitTypeOverride
}: PublicBulletinViewProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('bulletin.bulletinNotAvailable')}</h2>

            {/* Description */}
            <div className="text-gray-600 mb-6 space-y-2">
              <p>{t('bulletin.bulletinNotAvailableDescription')}</p>
              <p className="text-sm">{t('bulletin.couldHappenIf')}</p>
              <ul className="text-sm text-left max-w-sm mx-auto space-y-1">
                <li>• {t('bulletin.linkTypedIncorrectly')}</li>
                <li>• {t('bulletin.bulletinWasDeleted')}</li>
                <li>• {t('bulletin.wardNotPublished')}</li>
              </ul>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onBackToEditor}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Home className="w-4 h-4 mr-2" />
                {t('bulletin.createYourOwnBulletin')}
              </button>

              <button
                onClick={() => window.history.back()}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {t('bulletin.needHelp')}{' '}
                <a href="/contact" className="text-blue-600 hover:underline">WardBulletin.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bulletinData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Icon */}
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('bulletin.noBulletinPublished')}</h2>

            {/* Description */}
            <div className="text-gray-600 mb-6 space-y-2">
              <p>{t('bulletin.wardNotPublishedYet')}</p>
              <p className="text-sm">{t('bulletin.bulletinAdminMayBe')}</p>
              <ul className="text-sm text-left max-w-sm mx-auto space-y-1">
                <li>• {t('bulletin.settingUpFirstBulletin')}</li>
                <li>• {t('bulletin.workingOnCurrentWeek')}</li>
                <li>• {t('bulletin.takingBreak')}</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onBackToEditor}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Home className="w-4 h-4 mr-2" />
                {t('bulletin.createYourOwnBulletin')}
              </button>

              <button
                onClick={() => window.history.back()}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {t('bulletin.wantToCreateBulletins')}{' '}
                <a href="/" className="text-blue-600 hover:underline">WardBulletin.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Bulletin Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-8">
        <BulletinPreview data={bulletinData} hideImageControls={true} unitTypeOverride={unitTypeOverride} />
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            {t('bulletin.builtWithMyWardBulletin')}
          </p>
          <button
            onClick={onBackToEditor}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
          >
            {t('bulletin.createYourOwnBulletin')}
          </button>
        </div>
      </main>
    </div>
  );
}