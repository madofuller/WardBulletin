import React from 'react';
import { Play, Archive, CheckCircle } from 'lucide-react';
import { BulletinData } from '../types/bulletin';

interface BulletinActionsProps {
  user: any;
  bulletinData: BulletinData;
  onMakeActive: () => void;
  onSaveAsTemplate: () => void;
  loading?: boolean;
  currentStatus?: string;
}

export default function BulletinActions({
  user,
  bulletinData,
  onMakeActive,
  onSaveAsTemplate,
  loading = false,
  currentStatus
}: BulletinActionsProps) {

  if (!user) {
    return null; // Don't show actions if not logged in
  }

  const isActive = currentStatus === 'active';

  return (
    <div className="flex items-center space-x-3">
      {/* Make Active Now Button */}
      <button
        onClick={onMakeActive}
        disabled={loading || isActive}
        className={`inline-flex items-center px-4 py-2 rounded-full font-medium transition-colors ${
          isActive
            ? 'bg-green-100 text-green-800 cursor-default'
            : 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
        title={isActive ? 'This bulletin is currently active on your QR code' : 'Make this bulletin live on your QR code'}
      >
        {isActive ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            QR Active
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Make QR Active
          </>
        )}
      </button>


      {/* Save as Template Button */}
      <button
        onClick={onSaveAsTemplate}
        disabled={loading}
        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        title="Save this bulletin structure as a template for future use"
      >
        <Archive className="w-4 h-4 mr-2" />
        Save as Template
      </button>
    </div>
  );
}