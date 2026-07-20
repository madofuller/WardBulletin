import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { recurringAnnouncementsService } from '../lib/recurringAnnouncementsService';
import { CheckCircle, AlertCircle, Loader2, Plus, Trash2, Edit3, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { decodeHtml } from '../lib/decodeHtml';
import HtmlEditor from './HtmlEditor';

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
  const { t } = useTranslation();
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
    // Validate profileSlug - RLS policies will enforce security at database level
    if (!profileSlug || profileSlug.trim() === '') {
      console.error('Invalid profileSlug provided to RecurringAnnouncementsModal');
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Same query + ordering (sort_order, then created_at) as the bulletin
      // itself, so this list previews the order they'll appear in.
      const data = await recurringAnnouncementsService.getRecurringAnnouncements(profileSlug);
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching recurring announcements:', error);
      toast.error(t('errors.failedToLoadRecurringAnnouncements'));
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate profileSlug - RLS policies will enforce security at database level
    if (!profileSlug || profileSlug.trim() === '') {
      toast.error(t('errors.invalidProfile'));
      return;
    }

    // Content is Quill HTML now — an "empty" editor still holds <p><br></p>,
    // so validate on the visible text, not the raw markup.
    if (!formData.title.trim() || !stripHtmlTags(formData.content)) {
      toast.error(t('validation.fillTitleAndContent'));
      return;
    }

    // The custom label only applies to standalone announcements.
    const customLabel = formData.audience === 'standalone'
      ? formData.custom_audience_label.trim() || null
      : null;

    try {
      if (editingId) {
        // Update existing announcement
        const { error } = await supabase
          .from('recurring_announcements')
          .update({
            title: formData.title.trim(),
            content: formData.content.trim(),
            audience: formData.audience,
            custom_audience_label: customLabel,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)
          .eq('profile_slug', profileSlug);

        if (error) throw error;
        toast.success(t('success.recurringAnnouncementUpdated'));
      } else {
        // Create new announcement via the service so it gets the next
        // sort_order and lands at the END of the list, not the top
        const created = await recurringAnnouncementsService.createRecurringAnnouncement({
          profile_slug: profileSlug,
          title: formData.title.trim(),
          content: formData.content.trim(),
          audience: formData.audience,
          custom_audience_label: customLabel || undefined,
          is_active: true
        });

        if (!created) throw new Error('Failed to create recurring announcement');
        toast.success(t('success.recurringAnnouncementCreated'));
      }

      // Reset form and refresh
      setFormData({ title: '', content: '', audience: 'ward', custom_audience_label: '' });
      setEditingId(null);
      await fetchRecurringAnnouncements();
    } catch (error) {
      toast.error(t('errors.failedToSaveRecurringAnnouncement'));
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
    if (!confirm(t('modals.confirmDeleteRecurringAnnouncement'))) return;

    // Validate profileSlug - RLS policies will enforce security at database level
    if (!profileSlug || profileSlug.trim() === '') {
      toast.error(t('errors.invalidProfile'));
      return;
    }

    try {
      const { error } = await supabase
        .from('recurring_announcements')
        .update({ is_active: false })
        .eq('id', id)
        .eq('profile_slug', profileSlug);

      if (error) throw error;
      toast.success(t('success.recurringAnnouncementDeleted'));
      await fetchRecurringAnnouncements();
    } catch (error) {
      toast.error(t('errors.failedToDeleteRecurringAnnouncement'));
    }
  };

  // Swap an announcement with its neighbor and persist the whole list's
  // order. Optimistic: the list updates immediately, and reloads on failure.
  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= announcements.length) return;

    const reordered = [...announcements];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setAnnouncements(reordered);

    const saved = await recurringAnnouncementsService.updateSortOrder(
      profileSlug,
      reordered.map(a => a.id)
    );
    if (!saved) {
      toast.error(t('errors.failedToSaveOrder', 'Could not save the new order'));
      await fetchRecurringAnnouncements();
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
    toast.success(t('success.announcementAddedToBulletin', { title: announcement.title }));
  };

  const handleCopy = async (announcement: RecurringAnnouncement) => {
    // Actually copy — this used to show the success toast without writing
    // anything to the clipboard.
    try {
      await navigator.clipboard.writeText(`${announcement.title}\n\n${stripHtmlTags(announcement.content)}`);
      toast.success(t('success.copiedToClipboard', 'Copied to clipboard'));
    } catch {
      toast.error(t('errors.copyFailed', 'Could not copy to clipboard'));
    }
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
                  {t('recurring.recurringAnnouncements')}
                </h3>

                {/* Form Section */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">{t('recurring.createNewRecurringAnnouncement')}</h4>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('recurring.title')}
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={t('recurring.enterAnnouncementTitle')}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('recurring.content')}
                      </label>
                      {/* Rich-text editor, same as the bulletin form: the
                          content IS Quill HTML, and a plain textarea forced
                          clerks to hand-edit raw <p>/<strong> markup. */}
                      <HtmlEditor
                        value={formData.content}
                        onChange={(value) => setFormData(prev => ({ ...prev, content: value || '' }))}
                        placeholder={t('recurring.enterAnnouncementContent')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('recurring.audience')}
                      </label>
                      <select
                        value={formData.audience}
                        onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="ward">{t('audiences.ward')}</option>
                        <option value="relief_society">{t('audiences.reliefSociety')}</option>
                        <option value="elders_quorum">{t('audiences.eldersQuorum')}</option>
                        <option value="youth">{t('audiences.youth')}</option>
                        <option value="primary">{t('audiences.primary')}</option>
                        <option value="stake">{t('audiences.stake')}</option>
                        <option value="standalone">{t('audiences.standalone', 'Standalone (custom label)')}</option>
                        <option value="other">{t('audiences.other')}</option>
                        {/* Editing an item whose stored audience isn't listed
                            (e.g. branch-mode values) must not blank the select */}
                        {!['ward', 'relief_society', 'elders_quorum', 'youth', 'primary', 'stake', 'standalone', 'other'].includes(formData.audience) && (
                          <option value={formData.audience}>{formData.audience}</option>
                        )}
                      </select>
                    </div>

                    {formData.audience === 'standalone' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('recurring.customLabel', 'Section label')}
                        </label>
                        <input
                          type="text"
                          value={formData.custom_audience_label}
                          onChange={(e) => setFormData(prev => ({ ...prev, custom_audience_label: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder={t('recurring.customLabelPlaceholder', 'e.g. Temple News')}
                        />
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            {t('common.saving')}
                          </>
                        ) : (
                          t('recurring.saveRecurringAnnouncement')
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm font-medium"
                      >
                        {t('common.reset')}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Existing Announcements Section */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-1">{t('recurring.existingRecurringAnnouncements')}</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    {t('recurring.orderHint', 'New bulletins list these in this order — use the arrows to reorder.')}
                  </p>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>{t('recurring.noRecurringAnnouncementsFound')}</p>
                      <p className="text-sm mt-1">{t('recurring.createFirstOne')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {announcements.map((announcement, index) => (
                        <div
                          key={announcement.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex sm:flex-col gap-1 flex-shrink-0 self-start">
                              <button
                                type="button"
                                onClick={() => handleMove(index, -1)}
                                disabled={index === 0}
                                className="p-1 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label={t('recurring.moveUp', 'Move up')}
                                title={t('recurring.moveUp', 'Move up')}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMove(index, 1)}
                                disabled={index === announcements.length - 1}
                                className="p-1 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label={t('recurring.moveDown', 'Move down')}
                                title={t('recurring.moveDown', 'Move down')}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                            </div>
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
                                  {announcement.is_active ? t('recurring.active') : t('recurring.inactive')}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleSelect(announcement)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                {t('common.use')}
                              </button>

                              <button
                                onClick={() => handleEdit(announcement)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                              >
                                <Edit3 className="h-3 w-3 mr-1" />
                                {t('common.edit')}
                              </button>

                              <button
                                onClick={() => handleDelete(announcement.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                {t('common.delete')}
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
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 