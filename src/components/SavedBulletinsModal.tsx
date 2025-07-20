import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, Trash2, Eye, AlertCircle } from 'lucide-react';
import { bulletinService } from '../lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

interface SavedBulletinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLoadBulletin: (bulletin: any) => void;
  onDeleteBulletin: (bulletinId: string) => void;
}

export default function SavedBulletinsModal({ 
  isOpen, 
  onClose, 
  user, 
  onLoadBulletin,
  onDeleteBulletin 
}: SavedBulletinsModalProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: bulletins = [], isLoading: loading, error } = useQuery({
    queryKey: ['user-bulletins', user?.id],
    queryFn: () => bulletinService.getUserBulletins(user.id),
    enabled: isOpen && !!user
  });

  const handleDelete = async (bulletinId: string) => {
    if (!confirm('Are you sure you want to delete this bulletin? This action cannot be undone.')) {
      return;
    }

    setDeletingId(bulletinId);
    try {
      await bulletinService.deleteBulletin(bulletinId, user.id);
      // Invalidate the user-bulletins query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['user-bulletins', user.id] });
      onDeleteBulletin(bulletinId);
    } catch (error: any) {
      toast.error('Failed to delete bulletin: ' + error.message);
    } finally {
      setDeletingId(null);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h3 className="text-2xl font-bold text-gray-900">My Saved Bulletins</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading bulletins...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-600">{error.message}</p>
            </div>
          )}

          {!loading && !error && bulletins.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No saved bulletins</h4>
              <p className="text-gray-600">Create and save your first bulletin to see it here.</p>
            </div>
          )}

          {!loading && !error && bulletins.length > 0 && (
            <div className="space-y-4">
              {bulletins.map((bulletin) => (
                <div
                  key={bulletin.id}
                  className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                          {bulletin.ward_name || 'Unnamed Ward'}
                        </h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {bulletin.meeting_type}
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Meeting: {formatDate(bulletin.date)}</span>
                        </div>
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
                        onClick={() => onLoadBulletin(bulletin)}
                        className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Load</span>
                      </button>
                      
                      <button
                        onClick={() => handleDelete(bulletin.id)}
                        disabled={deletingId === bulletin.id}
                        className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
              {bulletins.length} bulletin{bulletins.length !== 1 ? 's' : ''} saved
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}