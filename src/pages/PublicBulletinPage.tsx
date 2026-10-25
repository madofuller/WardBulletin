import React, { useEffect, useState } from 'react';
import PublicBulletinView from '../components/PublicBulletinView';
import DynamicMetaTags from '../components/DynamicMetaTags';
import DynamicManifest from '../components/DynamicManifest';
import { getPublicBulletinBySlug, type PublicBulletinData } from '../lib/public-fetch';
import { loadPublicLocale } from '../i18n/public';

function ensureSacramentItem(agenda: any[]): any[] {
  const hasSacramentItem = agenda.some(item => item.type === 'sacrament');
  if (!hasSacramentItem) {
    return [{ type: 'sacrament', id: crypto.randomUUID() }, ...agenda];
  }
  return agenda;
}

export default function PublicBulletinPage({ slug: slugProp }: { slug?: string }) {
  const slug = slugProp || window.location.pathname.replace(/^\/+|\/+$/g, '');
  const [publicBulletin, setPublicBulletin] = useState<PublicBulletinData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const clearStaleCache = () => {
      try {
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
        sessionStorage.clear();
      } catch {
        // Failed to clear stale cache
      }
    };

    clearStaleCache();
  }, [slug]);

  useEffect(() => {
    const existingTags = document.querySelectorAll('meta[http-equiv="Cache-Control"], meta[http-equiv="Pragma"], meta[http-equiv="Expires"]');
    existingTags.forEach(tag => tag.remove());

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

    return () => {
      const tagsToRemove = document.querySelectorAll('meta[http-equiv="Cache-Control"], meta[http-equiv="Pragma"], meta[http-equiv="Expires"]');
      tagsToRemove.forEach(tag => tag.remove());
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');

    if (!slug) {
      setPublicBulletin(null);
      setIsLoading(false);
      return;
    }

    getPublicBulletinBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        setPublicBulletin(data);
        setIsLoading(false);
        void loadPublicLocale(data?.profile_language || 'en');
      })
      .catch((err) => {
        if (cancelled) return;
        setPublicBulletin(null);
        setError(err instanceof Error ? err.message : 'Bulletin not found');
        setIsLoading(false);
        void loadPublicLocale('en');
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto space-y-4 pt-8">
          <div className="h-10 bg-white/70 rounded-md animate-pulse" />
          <div className="h-64 bg-white/70 rounded-xl animate-pulse" />
          <div className="h-24 bg-white/70 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const profileUnitType = publicBulletin?.profile_unit_type as 'ward' | 'branch' | undefined;

  const bulletinData = publicBulletin ? {
    wardName: publicBulletin.ward_name || '',
    date: publicBulletin.date || '',
    meetingType: publicBulletin.meeting_type || '',
    theme: publicBulletin.theme || '',
    imageId: publicBulletin.imageId || 'none',
    imageUrl: publicBulletin.imageUrl,
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
    imageOpacity: publicBulletin.imageOpacity ?? 40,
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
    wardMissionaries: publicBulletin.wardMissionaries || [],
    serviceMissionaries: publicBulletin.serviceMissionaries || []
  } : null;

  return (
    <>
      <DynamicMetaTags
        bulletinData={bulletinData}
        profileSlug={slug || null}
        isPublicPage={true}
      />
      <DynamicManifest
        slug={slug || null}
        wardName={bulletinData?.wardName || null}
      />
      <PublicBulletinView
        bulletinData={bulletinData}
        loading={isLoading}
        error={error || ''}
        onBackToEditor={() => { window.location.href = '/'; }}
        unitTypeOverride={profileUnitType}
      />
    </>
  );
}
