import React, { useState, useEffect } from 'react';
import { Check, Calendar, FileText, AlertCircle, Plus, Clock, Eye, Trash2, CheckCircle } from 'lucide-react';
import { bulletinService } from '../lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SkeletonList, SkeletonCard } from './SkeletonLoader';
import BulletinStatusBadge from './BulletinStatusBadge';
import WeeklySchedulerModal from './WeeklySchedulerModal';
import ConfirmationModal from './ConfirmationModal';
import { toast } from 'react-toastify';
import { BulletinStatus } from '../types/bulletin';

// Key for caching the last authenticated user ID
const LAST_USER_ID = 'last_user_id';

interface BulletinSelectorProps {
  user: any;
  currentActiveBulletinId?: string;
  onBulletinSelect: (bulletinId: string) => void;
  onFixInconsistency?: () => void;
  showScheduling?: boolean;
  bulletins?: any[];
  onClose?: () => void;
  onLoadBulletin?: (bulletin: any) => void;
  onDeleteBulletin?: (bulletinId: string) => void;
  profileSlug?: string;
}

export default function BulletinSelector({
  user,
  currentActiveBulletinId,
  onBulletinSelect,
  onFixInconsistency,
  showScheduling = true,
  bulletins = [],
  onClose,
  onLoadBulletin,
  onDeleteBulletin,
  profileSlug
}: BulletinSelectorProps) {
  // Cache the last seen user ID so we can fetch local bulletins even if the
  // session temporarily becomes unavailable
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(LAST_USER_ID, user.id);
    }
  }, [user]);

  const cachedUserId = user?.id || localStorage.getItem(LAST_USER_ID) || '';
  const queryClient = useQueryClient();

  const { data: fetchedBulletins = [], isLoading: loading, error } = useQuery({
    queryKey: ['user-bulletins', cachedUserId],
    queryFn: () => bulletinService.getUserBulletins(cachedUserId),
    enabled: !!cachedUserId && bulletins.length === 0,
    staleTime: 0, // Always fetch fresh data to ensure active status is current
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Use passed bulletins or fetched bulletins
  const allBulletins = bulletins.length > 0 ? bulletins : fetchedBulletins;


  const [weeklySchedulerModal, setWeeklySchedulerModal] = useState({
    isOpen: false
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    bulletinId: string | null;
  }>({
    isOpen: false,
    bulletinId: null
  });

  const formatDate = (dateString: string) => {
    // Fix timezone issue by creating date in local timezone
    if (!dateString) return 'No date';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };



  if (loading) {
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Select Active Bulletin for QR Code</h4>
        <p className="text-sm text-gray-600">
          Choose which bulletin people will see when they scan your QR code
        </p>
        <SkeletonList items={3} className="max-h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">{error instanceof Error ? error.message : String(error)}</p>
      </div>
    );
  }

  if (allBulletins.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No saved bulletins found</p>
        <p className="text-sm text-gray-500">Create and save a bulletin first</p>
      </div>
    );
  }

  // Separate bulletins by status for better organization
  // Show the currently active bulletin - prefer currentActiveBulletinId, but also show any bulletin with status='active'
  const activeBulletins = allBulletins.filter(b =>
    b.status === 'active' || b.id === currentActiveBulletinId
  );
  const scheduledBulletins = allBulletins
    .filter(b => b.status === 'scheduled')
    .sort((a, b) => {
      // Sort by scheduled_date, with items without dates at the end
      if (!a.scheduled_date && !b.scheduled_date) return 0;
      if (!a.scheduled_date) return 1;
      if (!b.scheduled_date) return -1;
      return a.scheduled_date.localeCompare(b.scheduled_date);
    });
  const draftBulletins = allBulletins.filter(b =>
    (!b.status || b.status === 'draft') &&
    b.id !== currentActiveBulletinId &&
    b.status !== 'active' &&
    b.status !== 'scheduled'
  );
  const archivedBulletins = allBulletins.filter(b =>
    b.status === 'archived' &&
    b.id !== currentActiveBulletinId
  );
  
  // Handle data inconsistency: if currentActiveBulletinId doesn't match any bulletin's status
  const inconsistentActiveBulletin = currentActiveBulletinId && 
    !allBulletins.some(b => b.id === currentActiveBulletinId && b.status === 'active');

  const handleBulkSchedule = async (schedules: any[]) => {
    try {
      // Check if any of the bulletins being scheduled are currently active
      const schedulingCurrentActive = schedules.some(s => s.bulletinId === currentActiveBulletinId);

      for (const schedule of schedules) {
        await bulletinService.updateBulletinSchedule(schedule.bulletinId, cachedUserId, {
          scheduledDate: schedule.scheduledDate,
          status: 'scheduled',
          autoActivate: true
        });
      }

      toast.success(`${schedules.length} bulletin(s) scheduled successfully!`);

      // If we scheduled the currently active bulletin, it's no longer active
      if (schedulingCurrentActive) {
        toast.info('Note: Your currently active bulletin has been scheduled. Select a new active bulletin for your QR code.');
      }

      queryClient.invalidateQueries({ queryKey: ['user-bulletins', cachedUserId] });
    } catch (error) {
      console.error('Error scheduling bulletins:', error);
      toast.error('Failed to schedule bulletins: ' + (error as Error).message);
    }
  };

  const handleDelete = async (bulletinId: string) => {
    setConfirmationModal({
      isOpen: true,
      bulletinId
    });
  };

  const confirmDelete = async () => {
    if (!confirmationModal.bulletinId || !user) {
      toast.error('User not authenticated');
      return;
    }

    const bulletinId = confirmationModal.bulletinId;
    setDeletingId(bulletinId);

    // Optimistic update - remove from UI immediately
    queryClient.setQueryData(['user-bulletins', user.id], (oldData: any) => {
      if (!oldData) return oldData;
      return oldData.filter((bulletin: any) => bulletin.id !== bulletinId);
    });

    // Call parent callback if provided
    if (onDeleteBulletin) {
      onDeleteBulletin(bulletinId);
    }

    // Close modal immediately
    setConfirmationModal({ isOpen: false, bulletinId: null });
    setDeletingId(null);

    try {
      // Delete on server in background
      await bulletinService.deleteBulletin(bulletinId, user.id);
      toast.success('Bulletin deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete bulletin: ' + error.message);
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['user-bulletins', user.id] });
    }
  };

  const handleStatusChange = async (bulletinId: string, newStatus: BulletinStatus) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    try {
      await bulletinService.updateBulletinStatus(bulletinId, user.id, newStatus);

      queryClient.invalidateQueries({ queryKey: ['user-bulletins', user.id] });

      const statusLabels = {
        draft: 'Saved',
        scheduled: 'Scheduled',
        active: 'QR Active',
        archived: 'Archived'
      };

      toast.success(`Bulletin set to ${statusLabels[newStatus]}`);

      // Notify parent component if bulletin became active
      if (newStatus === 'active') {
        onBulletinSelect(bulletinId);
      }
    } catch (error: any) {
      toast.error('Failed to update bulletin status: ' + error.message);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderBulletinCard = (bulletin: any, showStatus = true) => (
    <div
      key={bulletin.id}
      className={`p-3 border rounded-lg transition-all ${
        currentActiveBulletinId === bulletin.id
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1 flex-wrap">
            <h5 className="font-medium text-gray-900">
              {bulletin.ward_name || 'Unnamed Ward'}
            </h5>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
              {bulletin.meeting_type}
            </span>
            {showStatus && (
              <BulletinStatusBadge
                status={bulletin.status || 'draft'}
                scheduledDate={bulletin.scheduled_date}
              />
            )}
          </div>

          <div className="flex flex-col text-xs text-gray-600 space-y-0.5">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>
                {bulletin.status === 'scheduled' && bulletin.scheduled_date
                  ? `Scheduled: ${formatDate(bulletin.scheduled_date.split('T')[0])}`
                  : `Meeting: ${formatDate(bulletin.date || bulletin.meeting_date)}`
                }
              </span>
            </div>
            {bulletin.updated_at && (
              <div className="text-xs text-gray-500">
                Updated: {formatDateTime(bulletin.updated_at)}
              </div>
            )}
          </div>

          {bulletin.theme && (
            <p className="text-xs text-gray-500 italic mt-1">
              {bulletin.theme}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span>{bulletin.agenda?.filter((a: any) => a.type === 'speaker').length || 0} speakers</span>
            <span>{bulletin.announcements?.length || 0} announcements</span>
            <span>{bulletin.meetings?.length || 0} meetings</span>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-1.5">
          <button
            onClick={() => handleStatusChange(bulletin.id, 'active')}
            className={`inline-flex items-center px-2 py-1 rounded-full transition-colors text-xs ${
              bulletin.status === 'active'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
            title={bulletin.status === 'active'
              ? 'This bulletin is currently active for QR codes'
              : 'Make this bulletin show when people scan your QR code'
            }
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            <span>{bulletin.status === 'active' ? 'QR Active' : 'Make Active'}</span>
          </button>

          {onLoadBulletin && (
            <button
              onClick={() => onLoadBulletin(bulletin)}
              className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-xs"
              title="Load this bulletin in the editor"
            >
              <Eye className="w-3 h-3 mr-1" />
              <span>Load</span>
            </button>
          )}

          {onDeleteBulletin && (
            <button
              onClick={() => handleDelete(bulletin.id)}
              disabled={deletingId === bulletin.id}
              className="inline-flex items-center px-2 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete this bulletin"
            >
              {deletingId === bulletin.id ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              ) : (
                <>
                  <Trash2 className="w-3 h-3 mr-1" />
                  <span>Delete</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">Select Active Bulletin for QR Code</h4>
          <p className="text-sm text-gray-600">
            Choose which bulletin people will see when they scan your QR code
          </p>
        </div>
        {showScheduling && (
          <button
            onClick={() => {
              if (onClose) onClose();
              setWeeklySchedulerModal({ isOpen: true });
            }}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Monthly Schedule
          </button>
        )}
      </div>
      
      <div className="space-y-4 max-h-80 overflow-y-auto">


        {/* Currently Active */}
        {activeBulletins.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Check className="w-4 h-4 mr-1 text-green-600" />
              Currently Active
            </h5>
            <div className="space-y-2">
              {activeBulletins.map(bulletin => renderBulletinCard(bulletin))}
            </div>
          </div>
        )}

        {/* No Active Bulletin Warning */}
        {activeBulletins.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-yellow-800">No Active Bulletin</p>
                <p className="text-xs text-yellow-700">Select a bulletin below to make it active for your QR code.</p>
              </div>
            </div>
          </div>
        )}

        {/* Scheduled to Activate */}
        {scheduledBulletins.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-1 text-blue-600" />
              Scheduled to Activate
            </h5>
            <div className="space-y-2">
              {scheduledBulletins.map(bulletin => renderBulletinCard(bulletin))}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mt-2">
              <p className="text-xs text-blue-800">
                💡 <strong>Scheduled bulletins</strong> will automatically become active at their scheduled time, replacing the current active bulletin.
              </p>
            </div>
          </div>
        )}

        {/* Draft Bulletins */}
        {draftBulletins.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-1 text-gray-600" />
              Draft Bulletins
            </h5>
            <div className="space-y-2">
              {draftBulletins.map(bulletin => renderBulletinCard(bulletin))}
            </div>
          </div>
        )}

        {/* Archived Bulletins */}
        {archivedBulletins.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1 text-gray-500" />
              Archived Bulletins
            </h5>
            <div className="space-y-2">
              {archivedBulletins.map(bulletin => renderBulletinCard(bulletin))}
            </div>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <p>💡 <strong>Tip:</strong> The selected bulletin will be shown when people scan your QR code. You can change this anytime without updating the QR code itself.</p>
      </div>


      {/* Weekly Scheduler Modal */}
      <WeeklySchedulerModal
        isOpen={weeklySchedulerModal.isOpen}
        onClose={() => setWeeklySchedulerModal({ isOpen: false })}
        onSchedule={handleBulkSchedule}
        bulletins={allBulletins}
        userId={cachedUserId}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, bulletinId: null })}
        onConfirm={confirmDelete}
        title="Delete Bulletin"
        message="Are you sure you want to delete this bulletin? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}