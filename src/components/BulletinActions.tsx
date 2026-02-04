import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Archive, CheckCircle } from 'lucide-react';
import { BulletinData } from '../types/bulletin';

interface BulletinActionsProps {
  user: any;
  bulletinData: BulletinData;
  onMakeActive: () => void;
  onSaveAsTemplate: () => void;
  loading?: boolean;
  currentStatus?: string;
}

export default function BulletinActions({
  user,
  bulletinData,
  onMakeActive,
  onSaveAsTemplate,
  loading = false,
  currentStatus
}: BulletinActionsProps) {
  const { t } = useTranslation();

  if (!user) {
    return null; // Don't show actions if not logged in
  }

  const isActive = currentStatus === 'active';

  return (
    <div className="flex items-center space-x-3">
      {/* Make Active Now Button */}
      <button
        onClick={onMakeActive}
        disabled={loading || isActive}
        className={`inline-flex items-center px-3 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${
          isActive
            ? 'bg-green-100 text-green-800 cursor-default'
            : 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
        title={isActive ? t('bulletin.qrActive') : t('bulletin.makeQrActive')}
      >
        {isActive ? (
          <>
            <CheckCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">{t('bulletin.qrActive')}</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">{t('bulletin.makeQrActive')}</span>
          </>
        )}
      </button>


      {/* Save as Template Button */}
      <button
        onClick={onSaveAsTemplate}
        disabled={loading}
        className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm whitespace-nowrap"
        title={t('bulletin.saveAsTemplate')}
      >
        <Archive className="w-4 h-4 mr-1.5 flex-shrink-0" />
        <span className="truncate">{t('bulletin.saveAsTemplate')}</span>
      </button>
    </div>
  );
}