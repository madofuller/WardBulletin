import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PublicBulletinView from '../components/PublicBulletinView';
import DynamicMetaTags from '../components/DynamicMetaTags';
import { bulletinService } from '../lib/supabase';
import { SkeletonBulletin } from '../components/SkeletonLoader';

// Helper function to ensure sacrament item exists at the top of agenda
function ensureSacramentItem(agenda: any[]): any[] {
  // Check if sacrament item already exists
  const hasSacramentItem = agenda.some(item => item.type === 'sacrament');
  
  if (!hasSacramentItem) {
    // Add sacrament item at the top
    return [{ type: 'sacrament', id: crypto.randomUUID() }, ...agenda];
  }
  
  return agenda;
}

export default function PublicBulletinPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const {
    data: publicBulletin,
    isLoading,
    error
  } = useQuery({
    queryKey: ['public-bulletin', slug],
    queryFn: () => slug ? bulletinService.getLatestBulletinByProfileSlug(slug) : Promise.resolve(null),
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <SkeletonBulletin />
        </div>
      </div>
    );
  }

  const bulletinData = publicBulletin ? {
    wardName: publicBulletin.ward_name || '',
    date: publicBulletin.date || '',
    meetingType: publicBulletin.meeting_type || '',
    theme: publicBulletin.theme || '',
    imageId: publicBulletin.imageId || 'none',
    imagePosition: (() => {
      const pos = publicBulletin.imagePosition;
      if (!pos) return { x: 50, y: 50 };
      if (typeof pos === 'string') {
        try {
          return JSON.parse(pos);
        } catch {
          return { x: 50, y: 50 };
        }
      }
      return pos;
    })(),
    bishopricMessage: publicBulletin.bishopric_message || '',
    announcements: publicBulletin.announcements || [],
    meetings: publicBulletin.meetings || [],
    specialEvents: publicBulletin.special_events || [],
    agenda: ensureSacramentItem(publicBulletin.agenda || []),
    prayers: publicBulletin.prayers || { opening: '', closing: '', invocation: '', benediction: '' },
    musicProgram: publicBulletin.music_program || {
      openingHymn: '',
      openingHymnNumber: '',
      openingHymnTitle: '',
      sacramentHymn: '',
      sacramentHymnNumber: '',
      sacramentHymnTitle: '',
      closingHymn: '',
      closingHymnNumber: '',
      closingHymnTitle: ''
    },
    leadership: publicBulletin.leadership || { presiding: '', conducting: '', chorister: '', organist: '' },
    wardLeadership: publicBulletin.wardLeadership || (publicBulletin.leadership && publicBulletin.leadership.wardLeadership) || [],
    missionaries: publicBulletin.missionaries || (publicBulletin.leadership && publicBulletin.leadership.missionaries) || []
  } : null;

  return (
    <>
      <DynamicMetaTags
        bulletinData={bulletinData}
        profileSlug={slug || null}
        isPublicPage={true}
      />
      <PublicBulletinView
        bulletinData={bulletinData}
        loading={isLoading}
        error={error ? (error as Error).message || 'Bulletin not found' : ''}
        onBackToEditor={() => navigate('/')}
      />
    </>
  );
}
