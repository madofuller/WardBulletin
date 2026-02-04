import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, MessageCircle, Copy, Check } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  bulletinData?: {
    wardName: string;
    date: string;
    meetingType: string;
    theme?: string;
    bishopricMessage?: string;
    announcements?: string[];
    specialEvents?: string[];
  } | null;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title = 'My Ward Bulletin',
  description = 'Check out our ward bulletin!',
  className = '',
  variant = 'primary',
  size = 'md',
  bulletinData = null
}) => {
  const { t } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  };

  const getDynamicContent = () => {
    if (!bulletinData) {
      return { title, description };
    }

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
    
    let dynamicTitle = `${wardName} Bulletin - ${date}`;
    let dynamicDescription = `${wardName} - ${date} ${meetingType}`;
    
    if (bulletinData.theme) {
      dynamicDescription += ` | Theme: ${bulletinData.theme}`;
    }
    
    if (bulletinData.bishopricMessage) {
      const shortMessage = bulletinData.bishopricMessage.length > 100 
        ? bulletinData.bishopricMessage.substring(0, 100) + '...'
        : bulletinData.bishopricMessage;
      dynamicDescription += ` | ${shortMessage}`;
    }
    
    if (bulletinData.announcements && bulletinData.announcements.length > 0) {
      dynamicDescription += ` | ${bulletinData.announcements.length} announcement${bulletinData.announcements.length > 1 ? 's' : ''}`;
    }
    
    if (bulletinData.specialEvents && bulletinData.specialEvents.length > 0) {
      dynamicDescription += ` | ${bulletinData.specialEvents.length} special event${bulletinData.specialEvents.length > 1 ? 's' : ''}`;
    }

    return { title: dynamicTitle, description: dynamicDescription };
  };

  const handleNativeShare = async () => {
    const { title: shareTitle, description: shareDescription } = getDynamicContent();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url
        });
      } catch (error) {
        // Share cancelled or failed
      }
    } else {
      setShowDropdown(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Failed to copy link
    }
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setShowDropdown(false);
  };

  const shareToTwitter = () => {
    const { description: shareDescription } = getDynamicContent();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareDescription)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setShowDropdown(false);
  };

  const shareToWhatsApp = () => {
    const { description: shareDescription } = getDynamicContent();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareDescription} ${url}`)}`;
    window.open(whatsappUrl, '_blank');
    setShowDropdown(false);
  };

  const shareToEmail = () => {
    const { title: shareTitle, description: shareDescription } = getDynamicContent();
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(`${shareDescription}\n\n${url}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    setShowDropdown(false);
  };

  const shareToSMS = () => {
    const { description: shareDescription } = getDynamicContent();
    const text = encodeURIComponent(`${shareDescription} ${url}`);
    const smsUrl = `sms:?body=${text}`;
    window.location.href = smsUrl;
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className={`inline-flex items-center space-x-2 rounded-lg transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        aria-label={t('common.share')}
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">{t('common.share')}</span>
      </button>

      {showDropdown && (
        <>
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="py-1">
              <button
                onClick={shareToFacebook}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center space-x-3"
              >
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
              
              <button
                onClick={shareToTwitter}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center space-x-3"
              >
                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>X</span>
              </button>
              
              <button
                onClick={shareToWhatsApp}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center space-x-3"
              >
                <MessageCircle className="w-4 h-4 text-green-500" />
                <span>WhatsApp</span>
              </button>
              
              <button
                onClick={shareToEmail}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center space-x-3"
              >
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>Email</span>
              </button>
              
              <button
                onClick={shareToSMS}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center space-x-3"
              >
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span>SMS</span>
              </button>
              
              <div className="border-t border-gray-200 my-1"></div>
              
              <button
                onClick={handleCopyLink}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center space-x-3"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
                <span>{copied ? t('success.copied') : t('qrCode.copyLink')}</span>
              </button>
            </div>
          </div>
          
          {/* Backdrop to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        </>
      )}
    </div>
  );
};

export default ShareButton; 