import React, { useEffect } from 'react';
import { APP_NAME } from '../lib/config';

interface BulletinData {
  wardName: string;
  date: string;
  meetingType: string;
  theme: string;
  bishopricMessage: string;
  announcements: string[];
  meetings: string[];
  specialEvents: string[];
  agenda: string[];
  prayers: {
    opening: string;
    closing: string;
    invocation: string;
    benediction: string;
  };
  musicProgram: {
    openingHymn: string;
    openingHymnNumber: string;
    openingHymnTitle: string;
    sacramentHymn: string;
    sacramentHymnNumber: string;
    sacramentHymnTitle: string;
    closingHymn: string;
    closingHymnNumber: string;
    closingHymnTitle: string;
  };
  leadership: {
    presiding: string;
    conducting: string;
    chorister: string;
    organist: string;
  };
  wardLeadership: string[];
  missionaries: string[];
}

interface DynamicMetaTagsProps {
  bulletinData: BulletinData | null;
  profileSlug: string | null;
  isPublicPage?: boolean;
}

const DynamicMetaTags: React.FC<DynamicMetaTagsProps> = ({
  bulletinData,
  profileSlug,
  isPublicPage = false
}) => {
  useEffect(() => {
    if (!bulletinData || !isPublicPage) {
      // Reset to default meta tags
      updateMetaTags({
        title: `${APP_NAME} - Free Digital Ward Bulletin Creator`,
        description: 'Create, share, and print beautiful digital ward bulletins for your LDS ward. Modern, mobile-friendly, and free.',
        image: 'https://mywardbulletin.com/og-image.png',
        url: 'https://mywardbulletin.com/'
      });
      return;
    }

    // Create dynamic content based on bulletin data
    const wardName = bulletinData.wardName || 'Ward';
    
    // Fix date parsing - ensure we're using the exact date from the bulletin in local timezone
    let date;
    try {
      // Parse the date string and create a date in local timezone
      const [year, month, day] = bulletinData.date.split('-');
      const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      date = localDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      // Fallback to original date string if parsing fails
      date = bulletinData.date;
    }
    
    const meetingType = bulletinData.meetingType || 'Sacrament Meeting';
    const theme = bulletinData.theme;
    const bishopricMessage = bulletinData.bishopricMessage;
    
    // Create a rich description
    let description = `${wardName} - ${date} ${meetingType}`;
    
    if (theme) {
      description += ` | Theme: ${theme}`;
    }
    
    if (bishopricMessage) {
      const shortMessage = bishopricMessage.length > 100 
        ? bishopricMessage.substring(0, 100) + '...'
        : bishopricMessage;
      description += ` | ${shortMessage}`;
    }
    
    // Add announcements count if available
    if (bulletinData.announcements && bulletinData.announcements.length > 0) {
      description += ` | ${bulletinData.announcements.length} announcement${bulletinData.announcements.length > 1 ? 's' : ''}`;
    }
    
    // Add special events if available
    if (bulletinData.specialEvents && bulletinData.specialEvents.length > 0) {
      description += ` | ${bulletinData.specialEvents.length} special event${bulletinData.specialEvents.length > 1 ? 's' : ''}`;
    }

    const title = `${wardName} Bulletin - ${date}`;
    const url = `https://mywardbulletin.com/${profileSlug}`;
    
    // For now, use the default image, but you could generate a dynamic one
    const image = 'https://mywardbulletin.com/og-image.png';

    updateMetaTags({
      title,
      description,
      image,
      url
    });
  }, [bulletinData, profileSlug, isPublicPage]);

  const updateMetaTags = (meta: {
    title: string;
    description: string;
    image: string;
    url: string;
  }) => {
    // Update basic meta tags
    document.title = meta.title;
    
    // Update description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', meta.description);

    // Update Open Graph tags
    updateOGTag('og:title', meta.title);
    updateOGTag('og:description', meta.description);
    updateOGTag('og:url', meta.url);
    updateOGTag('og:image', meta.image);
    updateOGTag('og:type', 'website');

    // Update Twitter Card tags
    updateTwitterTag('twitter:title', meta.title);
    updateTwitterTag('twitter:description', meta.description);
    updateTwitterTag('twitter:image', meta.image);
    updateTwitterTag('twitter:card', 'summary_large_image');

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', meta.url);
  };

  const updateOGTag = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  const updateTwitterTag = (name: string, content: string) => {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  return null; // This component doesn't render anything
};

export default DynamicMetaTags; 