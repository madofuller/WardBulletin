import React from 'react';
import { useTranslation } from 'react-i18next';
import { QrCode } from 'lucide-react';
import BulletinPrintLayout from './BulletinPrintLayout';
import { BulletinData } from '../types/bulletin';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bulletinData: BulletinData;
  onUpdateData: (data: BulletinData) => void;
}

export default function PrintPreviewModal({ isOpen, onClose, bulletinData, onUpdateData }: PrintPreviewModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const toggleQRCode = () => {
    onUpdateData({
      ...bulletinData,
      showQRCodeOnPrint: !bulletinData.showQRCodeOnPrint
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-7xl mx-2 sm:mx-4 h-full max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-semibold">{t('printPreview.printPreview')}</h3>
          <div className="flex items-center justify-between sm:space-x-4">
            <button
              onClick={toggleQRCode}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                bulletinData.showQRCodeOnPrint !== false
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={t('printPreview.toggleQrCodeTooltip', { action: bulletinData.showQRCodeOnPrint !== false ? t('common.hide') : t('common.show') })}
            >
              <QrCode className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{bulletinData.showQRCodeOnPrint !== false ? t('printPreview.qrCodeOn') : t('printPreview.qrCodeOff')}</span>
              <span className="sm:hidden">{bulletinData.showQRCodeOnPrint !== false ? t('printPreview.qrOnShort') : t('printPreview.qrOffShort')}</span>
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <BulletinPrintLayout data={bulletinData} />
        </div>
      </div>
    </div>
  );
}
