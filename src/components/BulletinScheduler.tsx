import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Check, X, AlertCircle } from 'lucide-react';
import { BulletinStatus } from '../types/bulletin';
import { toast } from 'react-toastify';

interface BulletinSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduledDate: string, autoActivate: boolean) => void;
  currentStatus?: BulletinStatus;
  currentScheduledDate?: string;
  currentAutoActivate?: boolean;
}

export default function BulletinScheduler({
  isOpen,
  onClose,
  onSchedule,
  currentStatus = 'draft',
  currentScheduledDate,
  currentAutoActivate = false
}: BulletinSchedulerProps) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(currentScheduledDate || '');
  const [selectedTime, setSelectedTime] = useState('00:00');
  const [autoActivate, setAutoActivate] = useState(currentAutoActivate);

  // Parse current scheduled date if it exists - MUST be before early return
  React.useEffect(() => {
    if (currentScheduledDate) {
      try {
        // Parse the date without timezone conversion
        const dateStr = currentScheduledDate.split('T')[0]; // Get just the date part
        setSelectedDate(dateStr);
        // Extract time part if it exists
        const timePart = currentScheduledDate.split('T')[1];
        if (timePart) {
          setSelectedTime(timePart.substring(0, 5));
        }
      } catch (error) {
        // Invalid date format, ignore
      }
    }
  }, [currentScheduledDate]);

  if (!isOpen) return null;

  const handleSchedule = () => {
    if (!selectedDate) return;

    // Validate that the scheduled date/time is not in the past
    const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
    const now = new Date();
    
    if (scheduledDateTime < now) {
      toast.error(t('bulletin.pastDateError'));
      return;
    }

    try {
      // Create date/time string in local timezone format (no UTC conversion)
      const dateTimeString = `${selectedDate}T${selectedTime}:00`;
      onSchedule(dateTimeString, autoActivate);
      onClose();
    } catch (error) {
      // Scheduling error handled by toast
    }
  };

  const isScheduled = currentStatus === 'scheduled';
  const isInPast = selectedDate && new Date(`${selectedDate}T${selectedTime}:00`) < new Date();

  // Get minimum date (today) - using local date
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            {t('bulletin.scheduleBulletin')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isScheduled && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                {t('bulletin.currentlyScheduled')}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('bulletin.activationDate')}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={todayString}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('bulletin.activationTime')}
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="auto-activate"
              checked={autoActivate}
              onChange={(e) => setAutoActivate(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="auto-activate" className="ml-2 text-sm text-gray-700">
              <span className="font-medium">{t('bulletin.autoActivateBulletin')}</span>
              <p className="text-gray-500 text-xs mt-1">
                {t('bulletin.autoActivateDescription')}
              </p>
            </label>
          </div>

          {isInPast && selectedDate && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-red-800">
                {t('bulletin.cannotSchedulePast')}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSchedule}
            disabled={!selectedDate || isInPast}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Check className="w-4 h-4 mr-1" />
            {t('bulletin.scheduleBulletin')}
          </button>
        </div>
      </div>
    </div>
  );
}