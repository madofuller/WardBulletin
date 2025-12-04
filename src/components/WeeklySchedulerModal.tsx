import React, { useState } from 'react';
import { Calendar, Check, X, Clock, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { bulletinService } from '../lib/supabase';
import { toast } from 'react-toastify';

interface WeeklyScheduleItem {
  bulletinId: string;
  bulletinTitle: string;
  weekOf: string; // YYYY-MM-DD format
  wardName: string;
  meetingDate: string;
  meetingType: string;
}

interface WeeklySchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (schedules: Array<{bulletinId: string; scheduledDate: string}>) => void;
  bulletins: Array<{
    id: string;
    ward_name: string;
    date: string;  // This is the actual field name from getUserBulletins
    meeting_type: string;
    status?: string;
    scheduled_date?: string;
  }>;
  userId?: string;
}

export default function WeeklySchedulerModal({
  isOpen,
  onClose,
  onSchedule,
  bulletins,
  userId
}: WeeklySchedulerModalProps) {
  const queryClient = useQueryClient();
  const [scheduleItems, setScheduleItems] = useState<WeeklyScheduleItem[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showBulletinSelector, setShowBulletinSelector] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showNoBulletinsModal, setShowNoBulletinsModal] = useState(false);

  // Safety check: ensure bulletins is an array (do this early)
  const safeBulletins = Array.isArray(bulletins) ? bulletins : [];

  // Refetch bulletins when modal opens to ensure fresh data (especially for shared profiles)
  React.useEffect(() => {
    if (isOpen && userId) {
      // Don't refetch immediately - let the parent component handle it
      // This prevents the modal from closing due to re-renders
      console.log('WeeklySchedulerModal opened, bulletins count:', safeBulletins.length);
    }
  }, [isOpen, userId, safeBulletins.length]);

  const existingScheduledBulletins = React.useMemo(() => {
    return safeBulletins.filter(b => {
      // Defensive check: ensure bulletin exists and has required properties
      if (!b || !b.id) return false;
      // Include bulletins that are scheduled OR have a scheduled_date (even if active)
      return (b.status || 'draft') === 'scheduled' || (b.scheduled_date && b.scheduled_date.length > 0);
    });
  }, [safeBulletins]);
  
  // Initialize with existing scheduled bulletins
  React.useEffect(() => {
    if (isOpen && existingScheduledBulletins.length > 0) {
      const existingItems = existingScheduledBulletins.map(bulletin => ({
        bulletinId: bulletin.id,
        bulletinTitle: `${bulletin.ward_name} - ${bulletin.date}`,
        wardName: bulletin.ward_name,
        meetingDate: bulletin.date,
        meetingType: bulletin.meeting_type,
        weekOf: bulletin.scheduled_date ? bulletin.scheduled_date.split('T')[0] : ''
      }));
      setScheduleItems(existingItems);
    } else if (isOpen && existingScheduledBulletins.length === 0) {
      // Clear schedule items if no scheduled bulletins when modal opens
      setScheduleItems([]);
    }
  }, [isOpen, existingScheduledBulletins]);

  // Get available bulletins - show all bulletins that aren't already in the current schedule
  // When rescheduling, include the currently scheduled bulletin as an option
  const availableBulletins = React.useMemo(() => {
    return safeBulletins.filter(b => {
      // Defensive check: ensure bulletin exists and has required properties
      if (!b || !b.id) return false;
      
      // If we're rescheduling (selectedDate has a scheduled item), include the currently scheduled bulletin
      if (selectedDate && scheduleItems.find(item => item.weekOf === selectedDate)) {
        const currentScheduledItem = scheduleItems.find(item => item.weekOf === selectedDate);
        if (currentScheduledItem && b.id === currentScheduledItem.bulletinId) {
          return true; // Include the currently scheduled bulletin
        }
      }
      
      // Show all bulletins except those already in the current schedule items
      return !scheduleItems.some(item => item.bulletinId === b.id);
    });
  }, [safeBulletins, scheduleItems, selectedDate]);
  
  const scheduledBulletinIds = React.useMemo(() => {
    return scheduleItems.map(item => item.bulletinId);
  }, [scheduleItems]);

  if (!isOpen) return null;

  // Get scheduled dates for calendar dots
  const getScheduledDates = () => {
    const dates = new Set<string>();
    scheduleItems.forEach(item => {
      if (item.weekOf) {
        dates.add(item.weekOf);
      }
    });
    return dates;
  };

  const handleAddBulletin = (bulletin: any) => {
    // Defensive check: ensure bulletin exists and has required properties
    if (!bulletin || !bulletin.id) {
      console.error('Invalid bulletin data:', bulletin);
      return;
    }
    
    const newItem: WeeklyScheduleItem = {
      bulletinId: bulletin.id,
      bulletinTitle: `${bulletin.ward_name || 'Unnamed Ward'} - ${bulletin.date || 'No date'}`,
      wardName: bulletin.ward_name || 'Unnamed Ward',
      meetingDate: bulletin.date || '',
      meetingType: bulletin.meeting_type || 'sacrament',
      weekOf: ''
    };
    setScheduleItems([...scheduleItems, newItem]);
  };

  const handleRemoveBulletin = async (index: number) => {
    const itemToRemove = scheduleItems[index];
    if (!itemToRemove || !userId) return;

    try {
      // Update the database to unschedule the bulletin
      await bulletinService.updateBulletinSchedule(itemToRemove.bulletinId, userId, {
        scheduledDate: '',
        status: 'draft',
        autoActivate: false
      });
      
      // Remove from local state
      setScheduleItems(scheduleItems.filter((_, i) => i !== index));
      
      console.log(`Unscheduled bulletin ${itemToRemove.bulletinId}`);
    } catch (error) {
      console.error('Failed to unschedule bulletin:', error);
      // Still remove from local state even if database update fails
      setScheduleItems(scheduleItems.filter((_, i) => i !== index));
    }
  };

  const handleWeekChange = (index: number, weekOf: string) => {
    const updated = [...scheduleItems];
    updated[index].weekOf = weekOf;
    setScheduleItems(updated);
  };

  const handleSchedule = () => {
    const validSchedules = scheduleItems.filter(item => item.weekOf);
    if (validSchedules.length === 0) return;
    
    const now = new Date();
    
    // Validate that all scheduled dates are in the future
    const pastDates: string[] = [];
    const schedulesWithDates = validSchedules.map(item => {
      const scheduledDate = item.weekOf + 'T00:00:00';
      const scheduledDateTime = new Date(scheduledDate);
      
      if (scheduledDateTime < now) {
        pastDates.push(item.weekOf);
      }
      
      return {
        bulletinId: item.bulletinId,
        scheduledDate
      };
    });
    
    if (pastDates.length > 0) {
      toast.error(`Cannot schedule bulletins for past dates: ${pastDates.join(', ')}. Please select future dates.`);
      return;
    }
    
    onSchedule(schedulesWithDates);
    onClose();
  };

  const handleDayClick = (day: number) => {
    if (!day) return;
    
    // Create date string for the clicked day
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Check if this date is already scheduled
    const existingScheduledItem = scheduleItems.find(item => item.weekOf === dateString);
    const existingScheduledBulletin = existingScheduledBulletins.find(bulletin => {
      if (!bulletin.scheduled_date) return false;
      const scheduledDate = bulletin.scheduled_date.split('T')[0];
      return scheduledDate === dateString;
    });
    
    if (existingScheduledItem || existingScheduledBulletin) {
      // Show reschedule modal for already scheduled day
      setSelectedDate(dateString);
      setShowBulletinSelector(true);
      return;
    }
    
    // Check if there are available bulletins to schedule
    if (availableBulletins.length === 0) {
      setSelectedDate(dateString);
      setShowNoBulletinsModal(true);
      return;
    }
    
    // If there's only one available bulletin, schedule it automatically
    if (availableBulletins.length === 1) {
      const bulletin = availableBulletins[0];
      const newItem: WeeklyScheduleItem = {
        bulletinId: bulletin.id,
        bulletinTitle: `${bulletin.ward_name} - ${bulletin.date}`,
        wardName: bulletin.ward_name,
        meetingDate: bulletin.date,
        meetingType: bulletin.meeting_type,
        weekOf: dateString
      };
      setScheduleItems([...scheduleItems, newItem]);
    } else {
      // Show bulletin selector modal
      setSelectedDate(dateString);
      setShowBulletinSelector(true);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      // Parse as local date (not UTC) - same method as SavedBulletinsModal
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  const handleBulletinSelect = (bulletin: any) => {
    // Defensive check: ensure bulletin exists and has required properties
    if (!bulletin || !bulletin.id) {
      console.error('Invalid bulletin data:', bulletin);
      return;
    }
    
    // Check if this date already has a scheduled bulletin
    const existingItemIndex = scheduleItems.findIndex(item => item.weekOf === selectedDate);
    
    if (existingItemIndex >= 0) {
      // Update existing scheduled item
      const updatedItems = [...scheduleItems];
      updatedItems[existingItemIndex] = {
        bulletinId: bulletin.id,
        bulletinTitle: `${bulletin.ward_name || 'Unnamed Ward'} - ${bulletin.date || 'No date'}`,
        wardName: bulletin.ward_name || 'Unnamed Ward',
        meetingDate: bulletin.date || '',
        meetingType: bulletin.meeting_type || 'sacrament',
        weekOf: selectedDate
      };
      setScheduleItems(updatedItems);
    } else {
      // Add new scheduled item
      const newItem: WeeklyScheduleItem = {
        bulletinId: bulletin.id,
        bulletinTitle: `${bulletin.ward_name || 'Unnamed Ward'} - ${bulletin.date || 'No date'}`,
        wardName: bulletin.ward_name || 'Unnamed Ward',
        meetingDate: bulletin.date || '',
        meetingType: bulletin.meeting_type || 'sacrament',
        weekOf: selectedDate
      };
      setScheduleItems([...scheduleItems, newItem]);
    }
    
    setShowBulletinSelector(false);
    setSelectedDate('');
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const getPrevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const formatWeekDisplay = (weekValue: string) => {
    if (!weekValue) return 'Select date';
    try {
      // Parse as local date (not UTC) - same method as other components
      const [year, month, day] = weekValue.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const daysOfWeek = [
    { short: 'S', full: 'Sunday' },
    { short: 'M', full: 'Monday' },
    { short: 'T', full: 'Tuesday' },
    { short: 'W', full: 'Wednesday' },
    { short: 'T', full: 'Thursday' },
    { short: 'F', full: 'Friday' },
    { short: 'S', full: 'Saturday' }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1 sm:p-4"
      onClick={(e) => {
        // Only close if clicking on the backdrop (not the modal content)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Schedule</h2>
              <p className="text-xs sm:text-sm text-gray-600">Plan your bulletins for upcoming weeks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
          {/* Mobile: Calendar Only */}
          <div className="w-full lg:w-2/3 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col min-h-0">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Calendar View</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={getPrevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-lg font-medium text-gray-900 min-w-[140px] text-center">
                  {formatMonthYear(currentMonth)}
                </span>
                <button
                  onClick={getNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Days of week header */}
              <div className="grid grid-cols-7 bg-gray-50">
                {daysOfWeek.map((day, index) => (
                  <div key={day.full} className="p-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200 last:border-r-0">
                    {day.short}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7">
                {getDaysInMonth(currentMonth).map((day, index) => (
                  <div
                    key={index}
                    onClick={() => day && handleDayClick(day)}
                    className={`p-3 text-center text-sm border-r border-b border-gray-200 last:border-r-0 min-h-[60px] flex items-center justify-center touch-manipulation ${
                      day ? 'hover:bg-blue-50 cursor-pointer transition-colors active:bg-blue-100' : 'bg-gray-50'
                    }`}
                  >
                    {day && (
                      <div className="flex flex-col items-center justify-center w-full">
                        <span className="text-gray-900 text-sm font-medium">{day}</span>
                        {scheduleItems.some(item => {
                          if (!item.weekOf) return false;
                          const weekDate = new Date(item.weekOf + 'T00:00:00');
                          return weekDate.getDate() === day && weekDate.getMonth() === currentMonth.getMonth();
                        }) && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Available Bulletins - Hidden on mobile */}
            <div className="mt-6 flex-1 flex flex-col min-h-0 hidden lg:flex">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex-shrink-0">Available Bulletins</h4>
              <div className="space-y-2 flex-1 overflow-y-auto">
                {availableBulletins.map((bulletin) => (
                  <div
                    key={bulletin.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors touch-manipulation ${
                      scheduledBulletinIds.includes(bulletin.id)
                        ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100'
                    }`}
                    onClick={() => {
                      if (!scheduledBulletinIds.includes(bulletin.id)) {
                        handleAddBulletin(bulletin);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-blue-700 text-sm">
                          Meeting: {bulletin.date ? (
                            isNaN(new Date(bulletin.date).getTime()) ?
                              bulletin.date :
                              formatDate(bulletin.date)
                          ) : 'No date set'}
                        </div>
                        <div className="font-medium text-gray-900 text-sm">
                          {bulletin.ward_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {bulletin.meeting_type}
                        </div>
                      </div>
                      {!scheduledBulletinIds.includes(bulletin.id) && (
                        <div className="w-10 h-10 flex items-center justify-center text-blue-600 hover:bg-blue-100 rounded-lg transition-colors touch-manipulation flex-shrink-0">
                          <Plus className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Scheduled Bulletins Table */}
          <div className="hidden lg:flex w-1/3 p-6 bg-gray-50 flex-col min-h-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">Scheduled Bulletins</h3>
            
            {scheduleItems.length > 0 ? (
              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {scheduleItems
                  .sort((a, b) => {
                    // Sort by scheduled date (weekOf), with items without dates at the end
                    if (!a.weekOf && !b.weekOf) return 0;
                    if (!a.weekOf) return 1;
                    if (!b.weekOf) return -1;
                    return a.weekOf.localeCompare(b.weekOf);
                  })
                  .map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-blue-700 text-sm mb-1">
                          Meeting: {item.meetingDate ? (
                            isNaN(new Date(item.meetingDate).getTime()) ?
                              item.meetingDate :
                              formatDate(item.meetingDate)
                          ) : 'No date set'}
                        </div>
                        <div className="font-medium text-gray-900 text-sm mb-1">
                          {item.wardName}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {item.meetingType}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveBulletin(index)}
                        className="w-10 h-10 flex items-center justify-center text-red-600 hover:bg-red-100 rounded-lg transition-colors touch-manipulation flex-shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">
                        Choose when to activate this bulletin:
                      </label>
                      <input
                        type="date"
                        value={item.weekOf}
                        onChange={(e) => handleWeekChange(index, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs ${
                          !item.weekOf ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
                        }`}
                      />
                      {!item.weekOf && (
                        <div className="text-xs text-orange-600 font-medium">
                          ⚠️ Please select a date to enable scheduling
                        </div>
                      )}
                      {item.weekOf && (
                        <div className="text-xs text-blue-600 font-medium bg-blue-50 border border-blue-200 rounded p-2">
                          Will activate: {formatWeekDisplay(item.weekOf)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm font-medium">No bulletins scheduled</p>
                  <p className="text-xs text-gray-500">Select bulletins from the left</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 sm:p-4 lg:p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="text-xs sm:text-sm text-green-600 font-medium">
              {scheduleItems.filter(item => item.weekOf).length} bulletin{scheduleItems.filter(item => item.weekOf).length !== 1 ? 's' : ''} ready to schedule
            </div>
            <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors touch-manipulation text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={scheduleItems.filter(item => item.weekOf).length === 0}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-full transition-colors flex items-center justify-center touch-manipulation text-sm sm:text-base ${
                  scheduleItems.filter(item => item.weekOf).length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4 mr-2" />
                Schedule {scheduleItems.filter(item => item.weekOf).length} Bulletin{scheduleItems.filter(item => item.weekOf).length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulletin Selector Modal */}
      {showBulletinSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {scheduleItems.find(item => item.weekOf === selectedDate) ? 'Reschedule Bulletin' : 'Select Bulletin to Schedule'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {scheduleItems.find(item => item.weekOf === selectedDate) 
                      ? `Choose a different bulletin for ${formatDate(selectedDate)}` 
                      : `Choose which bulletin to schedule for ${formatDate(selectedDate)}`}
                  </p>
                  {scheduleItems.find(item => item.weekOf === selectedDate) && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                      <span className="font-medium text-blue-900">Currently scheduled:</span>
                      <span className="text-blue-700 ml-1">
                        {scheduleItems.find(item => item.weekOf === selectedDate)?.wardName} - {formatDate(scheduleItems.find(item => item.weekOf === selectedDate)?.meetingDate || '')}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowBulletinSelector(false);
                    setSelectedDate('');
                  }}
                  className="text-gray-400 hover:text-gray-600 ml-4"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-3">
                {availableBulletins.map((bulletin) => (
                  <button
                    key={bulletin.id}
                    onClick={() => handleBulletinSelect(bulletin)}
                    className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">
                          {bulletin.ward_name}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">Bulletin Date:</span>
                            <span className="ml-2 font-semibold text-gray-900">{formatDate(bulletin.date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">Type:</span>
                            <span className="ml-2">{bulletin.meeting_type}</span>
                          </div>
                          {(bulletin as any).theme && (
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2 text-gray-400">🎨</span>
                              <span className="font-medium">Theme:</span>
                              <span className="ml-2">{(bulletin as any).theme}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {scheduleItems.find(item => item.weekOf === selectedDate) ? 'Reschedule to' : 'Schedule for'}<br/>{formatDate(selectedDate)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Available Bulletins Modal */}
      {showNoBulletinsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  No Available Bulletins
                </h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  You don't have any bulletins available to schedule for <strong>{formatDate(selectedDate)}</strong>.
                </p>
                
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">Option 1: Create New Bulletin</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Create a new bulletin template that you can schedule for this date.
                    </p>
                    <button
                      onClick={() => {
                        setShowNoBulletinsModal(false);
                        onClose(); // Close the scheduler modal
                        // TODO: Navigate to create new bulletin
                        window.location.href = '/editor'; // Temporary solution
                      }}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create New Bulletin
                    </button>
                  </div>
                  
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Option 2: Reschedule Existing</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Move an already scheduled bulletin to this date.
                    </p>
                    <button
                      onClick={() => {
                        setShowNoBulletinsModal(false);
                        // Show existing scheduled bulletins for rescheduling
                      }}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Reschedule Existing
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowNoBulletinsModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
