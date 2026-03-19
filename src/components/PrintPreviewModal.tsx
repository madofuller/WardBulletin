import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QrCode, Type, Maximize2, Printer, Download, X } from 'lucide-react';
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
  onExportPDF?: () => Promise<void>;
}

export default function PrintPreviewModal({ isOpen, onClose, bulletinData, onUpdateData, onExportPDF }: PrintPreviewModalProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

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

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!onExportPDF) return;
    setIsExporting(true);
    try {
      await onExportPDF();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl mx-2 sm:mx-4 h-full max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* Header toolbar */}
        <div className="flex flex-col gap-3 p-4 sm:p-5 border-b border-gray-200 flex-shrink-0">
          {/* Top row: title + action buttons */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{t('printPreview.printPreview')}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.print')}</span>
              </button>
              {onExportPDF && (
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isExporting ? t('common.exporting') : t('common.exportPdf')}
                  </span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={t('common.close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom row: layout options */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Font size selector */}
            <div className="flex items-center gap-1.5">
              <Type className="w-4 h-4 text-gray-400" aria-hidden />
              <span className="text-sm text-gray-500 mr-1 hidden sm:inline">{t('printPreview.fontSize')}:</span>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {FONT_SCALE_OPTIONS.map(({ value, labelKey }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFontScale(value)}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      currentScale === value
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                    title={value === 1 ? '100%' : value === 1.15 ? '115%' : '125%'}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px h-6 bg-gray-200 hidden sm:block" />

            {/* Tight margins toggle */}
            <button
              onClick={toggleTightMargins}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                bulletinData.printTightMargins
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={t('printPreview.tightMarginsTooltip')}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('printPreview.tightMargins')}</span>
              {bulletinData.printTightMargins && <span className="text-blue-600">&#10003;</span>}
            </button>

            {/* QR code toggle */}
            <button
              onClick={toggleQRCode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                bulletinData.showQRCodeOnPrint !== false
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={t('printPreview.toggleQrCodeTooltip', { action: bulletinData.showQRCodeOnPrint !== false ? t('common.hide') : t('common.show') })}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{bulletinData.showQRCodeOnPrint !== false ? t('printPreview.qrCodeOn') : t('printPreview.qrCodeOff')}</span>
              <span className="sm:hidden">{bulletinData.showQRCodeOnPrint !== false ? t('printPreview.qrOnShort') : t('printPreview.qrOffShort')}</span>
            </button>
          </div>
        </div>

        {/* Duplex printing hint */}
        <div className="mx-4 sm:mx-5 mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm text-blue-800 flex-shrink-0">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <span>{t('printPreview.duplexHint')}</span>
        </div>

        {/* Preview area - wrapped in .print-preview so Tailwind print: utilities are replicated */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 sm:p-6">
          <div className="print-preview mx-auto" style={{ maxWidth: '1100px' }}>
            <BulletinPrintLayout data={bulletinData} />
          </div>
        </div>
      </div>
    </div>
  );
}
