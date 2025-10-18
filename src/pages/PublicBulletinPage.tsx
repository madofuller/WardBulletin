import React, { useEffect } from 'react';
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

  // CRITICAL: Clear any stale localStorage data that might be cached
  // This runs once when the component mounts to handle users with old cached data
  useEffect(() => {
    const clearStaleCache = () => {
      try {
        // Clear React Query cache from localStorage (if using persistQueryClient)
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('REACT_QUERY') ||
            key.includes('public-bulletin') ||
            key.includes('react-query')
          )) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Also clear sessionStorage which Safari might use
        sessionStorage.clear();
      } catch (error) {
        console.warn('Failed to clear stale cache:', error);
      }
    };

    clearStaleCache();
  }, [slug]); // Re-run when slug changes

  // CRITICAL: Add cache-control meta tags to prevent Safari from caching this page
  useEffect(() => {
    // Remove existing cache-control meta tags
    const existingTags = document.querySelectorAll('meta[http-equiv="Cache-Control"], meta[http-equiv="Pragma"], meta[http-equiv="Expires"]');
    existingTags.forEach(tag => tag.remove());

    // Add aggressive cache-busting meta tags for Safari
    const metaTags = [
      { httpEquiv: 'Cache-Control', content: 'no-cache, no-store, must-revalidate, max-age=0' },
      { httpEquiv: 'Pragma', content: 'no-cache' },
      { httpEquiv: 'Expires', content: '0' }
    ];

    metaTags.forEach(({ httpEquiv, content }) => {
      const meta = document.createElement('meta');
      meta.httpEquiv = httpEquiv;
      meta.content = content;
      document.head.appendChild(meta);
    });

    // Cleanup function to remove tags when component unmounts
    return () => {
      const tagsToRemove = document.querySelectorAll('meta[http-equiv="Cache-Control"], meta[http-equiv="Pragma"], meta[http-equiv="Expires"]');
      tagsToRemove.forEach(tag => tag.remove());
    };
  }, []);

  // Get cache-busting parameter from URL (if present)
  const searchParams = new URLSearchParams(window.location.search);
  const cacheBuster = searchParams.get('t');

  const {
    data: publicBulletin,
    isLoading,
    error
  } = useQuery({
    queryKey: ['public-bulletin', slug, cacheBuster],
    queryFn: () => slug ? bulletinService.getLatestBulletinByProfileSlug(slug) : Promise.resolve(null),
    enabled: !!slug,
    // Prevent stale data from being shown
    staleTime: 0,
    gcTime: 0, // Previously cacheTime in older versions of React Query
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true // Refetch when connection is restored
  });

  // CRITICAL: Detect if we got stale cached data and force a hard reload
  // This handles Safari's aggressive HTTP caching that ignores cache-control headers
  useEffect(() => {
    if (publicBulletin && !isLoading) {
      // Check if bulletin data looks suspiciously empty (stale cache indicator)
      const hasDate = publicBulletin.date && publicBulletin.date.trim() !== '';
      const hasContent = (
        (publicBulletin.ward_name && publicBulletin.ward_name.trim() !== '') ||
        (publicBulletin.announcements && publicBulletin.announcements.length > 0) ||
        (publicBulletin.agenda && publicBulletin.agenda.length > 0) ||
        (publicBulletin.bishopric_message && publicBulletin.bishopric_message.trim() !== '')
      );

      // If we have a date but no content, this is likely stale cached data
      if (hasDate && !hasContent) {
        console.warn('Detected stale cached bulletin data - forcing reload');

        // Store a flag to prevent infinite reload loop
        const reloadKey = `reload-${slug}-${publicBulletin.date}`;
        const hasReloaded = sessionStorage.getItem(reloadKey);

        if (!hasReloaded) {
          sessionStorage.setItem(reloadKey, 'true');

          // Force a hard reload to bypass all caches
          // Add a timestamp to make Safari think it's a completely new URL
          const newUrl = `${window.location.pathname}?t=${Date.now()}&refresh=1`;
          window.location.href = newUrl;
        }
      }
    }
  }, [publicBulletin, isLoading, slug]);

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
    missionaries: publicBulletin.missionaries || (publicBulletin.leadership && publicBulletin.leadership.missionaries) || [],
    wardMissionaries: publicBulletin.wardMissionaries || []
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
