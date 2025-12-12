import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Loader2, Plus, Trash2, Edit3, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import { sanitizeHtml } from '../lib/sanitizeHtml';
import { decodeHtml } from '../lib/decodeHtml';

// Helper function to strip HTML tags and return plain text
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  // First decode HTML entities, then remove HTML tags
  const decoded = decodeHtml(html);
  const withoutTags = decoded.replace(/<[^>]*>/g, '');
  // Clean up extra whitespace
  return withoutTags.trim().replace(/\s+/g, ' ');
};

interface RecurringAnnouncement {
  id: string;
  profile_slug: string;
  title: string;
  content: string;
  audience: 'ward' | 'relief_society' | 'elders_quorum' | 'youth' | 'primary' | 'stake' | 'other' | 'standalone' | string;
  custom_audience_label?: string; // Free-text label for standalone announcements
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Image support
  images?: Array<{ imageId: string; hideImageOnPrint?: boolean }>;
}

interface RecurringAnnouncementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileSlug: string;
  onAnnouncementSelected: (announcement: { title: string; content: string; audience: string; custom_audience_label?: string; is_active: boolean; images?: Array<{ imageId: string; hideImageOnPrint?: boolean }> }) => void;
}

export default function RecurringAnnouncementsModal({ isOpen, onClose, profileSlug, onAnnouncementSelected }: RecurringAnnouncementsModalProps) {
  const [announcements, setAnnouncements] = useState<RecurringAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: 'ward' as string,
    custom_audience_label: '' as string
  });

  useEffect(() => {
    if (isOpen) {
      fetchRecurringAnnouncements();
    }
  }, [isOpen, profileSlug]);

  const fetchRecurringAnnouncements = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('recurring_announcements')
        .select('*')
        .eq('profile_slug', profileSlug)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      toast.error('Failed to load recurring announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    try {
      if (editingId) {
        // Update existing announcement
        const { error } = await supabase
          .from('recurring_announcements')
          .update({
            title: formData.title.trim(),
            content: formData.content.trim(),
            audience: formData.audience,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)
          .eq('profile_slug', profileSlug);

        if (error) throw error;
        toast.success('Recurring announcement updated successfully');
      } else {
        // Create new announcement
        const { error } = await supabase
          .from('recurring_announcements')
          .insert({
            profile_slug: profileSlug,
            title: formData.title.trim(),
            content: formData.content.trim(),
            audience: formData.audience
          })
          .select();

        if (error) throw error;
        toast.success('Recurring announcement created successfully');
      }

      // Reset form and refresh
      setFormData({ title: '', content: '', audience: 'ward', custom_audience_label: '' });
      setEditingId(null);
      await fetchRecurringAnnouncements();
    } catch (error) {
      toast.error('Failed to save recurring announcement');
    }
  };

  const handleEdit = (announcement: RecurringAnnouncement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      audience: announcement.audience,
      custom_audience_label: announcement.custom_audience_label || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring announcement?')) return;

    try {
      const { error } = await supabase
        .from('recurring_announcements')
        .update({ is_active: false })
        .eq('id', id)
        .eq('profile_slug', profileSlug);

      if (error) throw error;
      toast.success('Recurring announcement deleted successfully');
      await fetchRecurringAnnouncements();
    } catch (error) {
      toast.error('Failed to delete recurring announcement');
    }
  };

  const handleSelect = (announcement: RecurringAnnouncement) => {
    onAnnouncementSelected({
      title: announcement.title,
      content: announcement.content,
      audience: announcement.audience,
      custom_audience_label: announcement.custom_audience_label,
      is_active: announcement.is_active,
      images: announcement.images
    });
    toast.success(`"${announcement.title}" added to current bulletin`);
  };

  const handleCopy = (announcement: RecurringAnnouncement) => {
    toast.success(`"${announcement.title}" copied to current bulletin`);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', content: '', audience: 'ward', custom_audience_label: '' });
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? 'block' : 'hidden'}`}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity cursor-pointer" 
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recurring Announcements
                </h3>
                
                {/* Form Section */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Create New Recurring Announcement</h4>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Enter announcement title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                        placeholder="Enter announcement content"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Audience
                      </label>
                      <select
                        value={formData.audience}
                        onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="ward">Ward</option>
                        <option value="relief_society">Relief Society</option>
                        <option value="elders_quorum">Elders Quorum</option>
                        <option value="youth">Youth</option>
                        <option value="primary">Primary</option>
                        <option value="stake">Stake</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Saving...
                          </>
                        ) : (
                          'Save Recurring Announcement'
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm font-medium"
                      >
                        Reset
                      </button>
                    </div>
                  </form>
                </div>

                {/* Existing Announcements Section */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Existing Recurring Announcements</h4>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No recurring announcements found.</p>
                      <p className="text-sm mt-1">Create your first one above!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {announcements.map((announcement) => (
                        <div
                          key={announcement.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                                {announcement.title}
                              </h5>
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {stripHtmlTags(announcement.content)}
                              </p>
                              
                              {/* Display images if they exist */}
                              {(announcement.images && announcement.images.length > 0) && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {/* Multiple images */}
                                  {announcement.images && announcement.images.length > 0 && (
                                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                      📷 {announcement.images.length} image{announcement.images.length > 1 ? 's' : ''} attached
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                  {announcement.audience === 'standalone'
                                    ? (announcement.custom_audience_label || 'Standalone')
                                    : announcement.audience.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                                  {announcement.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleSelect(announcement)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Use
                              </button>
                              
                              <button
                                onClick={() => handleEdit(announcement)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                              >
                                <Edit3 className="h-3 w-3 mr-1" />
                                Edit
                              </button>
                              
                              <button
                                onClick={() => handleDelete(announcement.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 