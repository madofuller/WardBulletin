import { useState, useEffect } from 'react';
import { X, FileText, Calendar, Trash2, Eye, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { bulletinService } from '../lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useSession } from '../lib/SessionContext';
import { SkeletonList, SkeletonCard } from './SkeletonLoader';
import ConfirmationModal from './ConfirmationModal';
import BulletinStatusBadge from './BulletinStatusBadge';
import WeeklySchedulerModal from './WeeklySchedulerModal';
import { BulletinStatus } from '../types/bulletin';

const LAST_USER_ID = 'last_user_id';

interface SavedBulletinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadBulletin: (bulletin: any) => void;
  onDeleteBulletin: (bulletinId: string) => void;
  profileSlug?: string;
  onActiveBulletinChange?: (bulletinId: string) => void;
  currentActiveBulletinId?: string;
}

export default function SavedBulletinsModal({
  isOpen,
  onClose,
  onLoadBulletin,
  onDeleteBulletin,
  profileSlug,
  onActiveBulletinChange,
  currentActiveBulletinId
}: SavedBulletinsModalProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    bulletinId: string | null;
  }>({
    isOpen: false,
    bulletinId: null
  });
  const [weeklySchedulerModal, setWeeklySchedulerModal] = useState({
    isOpen: false
  });
  const queryClient = useQueryClient();
  const { user } = useSession();

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(LAST_USER_ID, user.id);
    }
  }, [user]);

  const cachedUserId = user?.id || localStorage.getItem(LAST_USER_ID) || '';
  
  // Use local state to persist bulletins even when query cache is cleared
  const [localBulletins, setLocalBulletins] = useState<any[]>([]);
  
  const { data: bulletins = [], isLoading: loading, error } = useQuery({
    queryKey: profileSlug ? ['shared-profile-bulletins', profileSlug] : ['user-bulletins', cachedUserId],
    queryFn: async () => {
      if (profileSlug) {
        // If we're on a shared profile, get bulletins for that profile
        return bulletinService.getBulletinsByProfileSlug(profileSlug);
      } else {
        // If no profile slug, get bulletins for the current user
        return bulletinService.getUserBulletins(cachedUserId);
      }
    },
    // Always enable query - don't disable when modal closes to keep data in cache
    enabled: !!(cachedUserId || profileSlug),
    staleTime: 0, // Always fetch fresh data to ensure active status is current
    refetchOnMount: true,
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent clearing
    // Keep previous data visible while refetching to prevent disappearing bulletins
    placeholderData: (previousData) => previousData,
    // Keep data in cache longer to prevent disappearing during refetches
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update local state whenever bulletins change, but never clear it
  useEffect(() => {
    if (bulletins && bulletins.length > 0) {
      setLocalBulletins(bulletins);
    }
  }, [bulletins]);

  // Always prefer local bulletins if available - this prevents disappearing during refetches
  // Only use query data if local state is empty (initial load)
  const displayBulletins = localBulletins.length > 0 ? localBulletins : bulletins;


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

    // Call parent callback immediately for faster UI response
    onDeleteBulletin(bulletinId);

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


  const handleBulkSchedule = async (schedules: Array<{bulletinId: string; scheduledDate: string}>) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // Check if any of the bulletins being scheduled are currently active
      const schedulingCurrentActive = schedules.some(s => s.bulletinId === currentActiveBulletinId);

      const results = await bulletinService.bulkScheduleBulletins(schedules, user.id);

      // Count successes and failures
      const successes = results.filter(r => r.success).length;
      const failures = results.filter(r => !r.success).length;

      if (failures > 0) {
        // Show specific error messages for failed bulletins
        const failedBulletins = results.filter(r => !r.success);
        const errorMessages = failedBulletins.map(r => (r as any).error).filter(Boolean);
        const uniqueErrors = [...new Set(errorMessages)];
        
        if (uniqueErrors.length > 0) {
          // Show the first unique error message
          toast.error(uniqueErrors[0]);
        } else {
          toast.warning(`${successes} bulletins scheduled successfully, ${failures} failed`);
        }
      } else {
        toast.success(`${successes} bulletins scheduled successfully`);
      }

      // If we scheduled the currently active bulletin, it's no longer active
      if (schedulingCurrentActive) {
        toast.info('Note: Your currently active bulletin has been scheduled. Select a new active bulletin for your QR code.');
      }

      // Invalidate the correct query key based on whether we're on a shared profile
      const queryKey = profileSlug ? ['shared-profile-bulletins', profileSlug] : ['user-bulletins', user.id];
      queryClient.invalidateQueries({ queryKey });
      
      // Also invalidate the other query key to ensure both users see updates
      if (profileSlug) {
        queryClient.invalidateQueries({ queryKey: ['user-bulletins', user.id] });
      } else {
        // If no profile slug, invalidate shared profile queries too
        queryClient.invalidateQueries({ queryKey: ['shared-profile-bulletins'] });
      }
      
      // Refetch immediately to update the UI
      queryClient.refetchQueries({ queryKey });
    } catch (error: any) {
      toast.error('Failed to schedule bulletins: ' + error.message);
    }
  };

  const handleStatusChange = async (bulletinId: string, newStatus: BulletinStatus) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // Optimistically update the UI immediately - update BOTH query cache and local state
      const queryKey = profileSlug ? ['shared-profile-bulletins', profileSlug] : ['user-bulletins', user.id];
      
      // Get current data to work with (use displayBulletins which has the current state)
      const currentData = displayBulletins.length > 0 ? displayBulletins : bulletins;
      
      // Update local state FIRST to ensure it persists
      setLocalBulletins(prev => {
        const dataToUse = prev.length > 0 ? prev : currentData;
        const updated = dataToUse.map((b: any) => {
          if (b.id === bulletinId) {
            return { ...b, status: newStatus };
          }
          // If making this bulletin active, archive others
          if (newStatus === 'active' && b.status === 'active' && b.id !== bulletinId) {
            return { ...b, status: 'archived' };
          }
          return b;
        });
        return updated.length > 0 ? updated : prev; // Never clear local state
      });

      // Also update query cache optimistically
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((b: any) => {
          if (b.id === bulletinId) {
            return { ...b, status: newStatus };
          }
          // If making this bulletin active, archive others
          if (newStatus === 'active' && b.status === 'active' && b.id !== bulletinId) {
            return { ...b, status: 'archived' };
          }
          return b;
        });
      });

      // Update on server
      await bulletinService.updateBulletinStatus(bulletinId, user.id, newStatus);

      // After server update succeeds, update cache with fresh data WITHOUT refetching
      // This prevents the temporary empty state during refetch
      const freshData = profileSlug 
        ? await bulletinService.getBulletinsByProfileSlug(profileSlug)
        : await bulletinService.getUserBulletins(user.id);
      
      // Update both query cache and local state with fresh data
      queryClient.setQueryData(queryKey, freshData);
      setLocalBulletins(freshData);

      const statusLabels = {
        draft: 'Saved',
        scheduled: 'Scheduled',
        active: 'QR Active',
        archived: 'Archived'
      };

      toast.success(`Bulletin set to ${statusLabels[newStatus]}`);
      
      // Don't notify parent component - let background refetch handle synchronization
      // This prevents parent from invalidating queries and clearing our data
    } catch (error: any) {
      // Revert optimistic update on error by refetching
      const queryKey = profileSlug ? ['shared-profile-bulletins', profileSlug] : ['user-bulletins', user.id];
      queryClient.refetchQueries({ queryKey });
      toast.error('Failed to update bulletin status: ' + error.message);
    }
  };

  const formatDate = (dateString: string) => {
    // Parse as local date (not UTC)
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Only close if clicking on the backdrop (not the modal content)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">My Saved Bulletins</h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage your bulletins and set which one appears when people scan your QR code
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setWeeklySchedulerModal({ isOpen: true })}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Monthly Schedule
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {loading && (
            <div className="space-y-4">
              <SkeletonList items={5} />
            </div>
          )}

          {error && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-600">{error.message}</p>
            </div>
          )}

          {!loading && !error && displayBulletins.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No saved bulletins</h4>
              <p className="text-gray-600">Create and save your first bulletin to see it here.</p>
            </div>
          )}

          {!loading && !error && displayBulletins.length > 0 && (
            <div className="space-y-4">
              {/* Info Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">How Bulletin Status Works</h4>
                <div className="text-xs text-blue-800 space-y-1">
                  <p><strong>Active:</strong> This bulletin appears when people scan your QR code</p>
                  <p><strong>Scheduled:</strong> Will automatically become active at the scheduled date/time</p>
                  <p><strong>Draft:</strong> Work in progress - not visible to QR code scans</p>
                  <p><strong>Archived:</strong> Previously used - stored for reference</p>
                </div>
              </div>
              

              {displayBulletins.map((bulletin) => (
                <div
                  key={bulletin.id}
                  className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2 flex-wrap">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                          {bulletin.ward_name || 'Unnamed Ward'}
                        </h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {bulletin.meeting_type}
                        </span>
                        <BulletinStatusBadge
                          status={bulletin.status || 'draft'}
                          scheduledDate={bulletin.scheduled_date}
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>
                            {bulletin.status === 'scheduled' && bulletin.scheduled_date 
                              ? `Scheduled: ${formatDate(bulletin.scheduled_date.split('T')[0])}` 
                              : `Meeting: ${formatDate(bulletin.date)}`
                            }
                          </span>
                        </div>
                        {/* Show scheduled date for draft bulletins if they have one (even if status is still draft) */}
                        {(bulletin.status === 'draft' || !bulletin.status) && bulletin.scheduled_date && (
                          <div className="flex items-center text-blue-600">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>Scheduled: {formatDate(bulletin.scheduled_date.split('T')[0])}</span>
                          </div>
                        )}
                        <div>
                          <span>Updated: {formatDateTime(bulletin.updated_at)}</span>
                        </div>
                      </div>

                      {bulletin.theme && (
                        <p className="text-sm text-gray-700 italic mb-2">
                          Theme: {bulletin.theme}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                        <span>{bulletin.agenda?.filter((a: any) => a.type === 'speaker').length || 0} speakers</span>
                        <span>{bulletin.announcements?.length || 0} announcements</span>
                        <span>{bulletin.meetings?.length || 0} meetings</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 sm:ml-4">

                      <button
                        onClick={() => handleStatusChange(bulletin.id, 'active')}
                        className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 rounded-full transition-colors text-xs sm:text-sm ${
                          bulletin.status === 'active' 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                        title={bulletin.status === 'active' 
                          ? 'This bulletin is currently active for QR codes' 
                          : 'Make this bulletin show when people scan your QR code (only one can be active at a time)'
                        }
                      >
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">
                          {bulletin.status === 'active' ? 'QR Active' : 'Make QR Active'}
                        </span>
                      </button>

                      <button
                        onClick={() => onLoadBulletin(bulletin)}
                        className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Load</span>
                      </button>

                      <button
                        onClick={() => handleDelete(bulletin.id)}
                        disabled={deletingId === bulletin.id}
                        className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === bulletin.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                        ) : (
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        )}
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Sticky Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 sticky bottom-0 z-10">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {displayBulletins.length} bulletin{displayBulletins.length !== 1 ? 's' : ''} saved
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

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

      
      <WeeklySchedulerModal
        isOpen={weeklySchedulerModal.isOpen}
        onClose={() => {
          setWeeklySchedulerModal({ isOpen: false });
          // Refetch bulletins when modal closes to ensure fresh data
          const queryKey = profileSlug ? ['shared-profile-bulletins', profileSlug] : ['user-bulletins', cachedUserId];
          queryClient.invalidateQueries({ queryKey });
          // Also invalidate the other query key to ensure both users see updates
          if (profileSlug) {
            queryClient.invalidateQueries({ queryKey: ['user-bulletins', cachedUserId] });
          } else {
            queryClient.invalidateQueries({ queryKey: ['shared-profile-bulletins'] });
          }
        }}
        onSchedule={handleBulkSchedule}
        bulletins={displayBulletins || []}
        userId={user?.id}
      />
    </div>
  );
}