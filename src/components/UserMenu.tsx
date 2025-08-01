import React, { useState } from 'react';
import { User, LogOut, Save, FileText, Settings, MessageSquare } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

interface UserMenuProps {
  user: any;
  onSignOut: () => void;
  onSaveBulletin: () => void;
  onViewSavedBulletins: () => void;
  hasUnsavedChanges?: boolean;
  onOpenProfile?: () => void;
  onOpenWardSettings?: () => void;
  onOpenReviewSubmissions?: () => void;
  pendingSubmissionsCount?: number;
}

export default function UserMenu({ 
  user, 
  onSignOut, 
  onSaveBulletin, 
  onViewSavedBulletins,
  hasUnsavedChanges,
  onOpenProfile,
  onOpenWardSettings,
  onOpenReviewSubmissions,
  pendingSubmissionsCount
}: UserMenuProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    onSignOut();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <User className="w-4 h-4" />
        <span className="text-sm font-medium">{user.email}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
              <p className="text-xs text-gray-500">Signed in</p>
            </div>
            
            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  onSaveBulletin();
                  setIsOpen(false);
                }}
                disabled={!hasUnsavedChanges && !user}
                className={`w-full flex items-center space-x-2 px-3 py-2 text-left rounded-lg transition-colors ${
                  hasUnsavedChanges 
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                <span className="text-sm">
                  {hasUnsavedChanges ? t('save_changes') : t('no_changes')}
                  {hasUnsavedChanges && <span className="text-xs ml-1">(unsaved changes)</span>}
                </span>
              </button>
              
              <button
                onClick={() => {
                  onViewSavedBulletins();
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">{t('my_bulletins')}</span>
              </button>
              
              {onOpenReviewSubmissions && (
                <button
                  onClick={() => {
                    onOpenReviewSubmissions();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">
                    {t('review_submissions')}
                    {pendingSubmissionsCount && typeof pendingSubmissionsCount === 'number' && pendingSubmissionsCount > 0 ? (
                      <span className="ml-1 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                        {pendingSubmissionsCount}
                      </span>
                    ) : null}
                  </span>
                </button>
              )}
              
              {onOpenProfile && (
                <button
                  onClick={() => {
                    onOpenProfile();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">{t('profile_settings')}</span>
                </button>
              )}
              {onOpenWardSettings && (
                <button
                  onClick={() => {
                    onOpenWardSettings();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">{t('ward_settings')}</span>
                </button>
              )}
            </div>
            
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">{t('sign_out')}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}