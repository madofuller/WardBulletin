import React from 'react';
import { useTranslation } from 'react-i18next';
import { QrCode, Type, Maximize2 } from 'lucide-react';
import BulletinPrintLayout from './BulletinPrintLayout';
import { BulletinData } from '../types/bulletin';

const FONT_SCALE_OPTIONS = [
  { value: 1, labelKey: 'printPreview.fontSizeNormal' },
  { value: 1.15, labelKey: 'printPreview.fontSizeLarge' },
  { value: 1.25, labelKey: 'printPreview.fontSizeExtraLarge' }
] as const;

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bulletinData: BulletinData;
  onUpdateData: (data: BulletinData) => void;
}

export default function PrintPreviewModal({ isOpen, onClose, bulletinData, onUpdateData }: PrintPreviewModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const currentScale = typeof bulletinData.printFontScale === 'number' && bulletinData.printFontScale >= 1 && bulletinData.printFontScale <= 1.5
    ? bulletinData.printFontScale
    : 1;

  const toggleQRCode = () => {
    onUpdateData({
      ...bulletinData,
      showQRCodeOnPrint: !bulletinData.showQRCodeOnPrint
    });
  };

  const setFontScale = (scale: number) => {
    onUpdateData({ ...bulletinData, printFontScale: scale });
  };

  const toggleTightMargins = () => {
    onUpdateData({ ...bulletinData, printTightMargins: !bulletinData.printTightMargins });
  };

  return (
    <div className="print-preview-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-7xl mx-2 sm:mx-4 h-full max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-semibold">{t('printPreview.printPreview')}</h3>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <Type className="w-4 h-4 text-gray-500" aria-hidden />
              <span className="text-sm text-gray-600 mr-1.5 hidden sm:inline">{t('printPreview.fontSize')}:</span>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {FONT_SCALE_OPTIONS.map(({ value, labelKey }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFontScale(value)}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      currentScale === value
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                    }`}
                    title={value === 1 ? '100%' : value === 1.15 ? '115%' : '125%'}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={toggleTightMargins}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                bulletinData.printTightMargins
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={t('printPreview.tightMarginsTooltip')}
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('printPreview.tightMargins')}</span>
              {bulletinData.printTightMargins && <span className="sm:ml-1">✓</span>}
            </button>
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
