import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, QrCode, LogIn, Menu, X, MessageSquare, Repeat, Paintbrush, Printer, Clock, Archive } from 'lucide-react';
import UnitTypeSelector from '../components/TerminologyToggle';
import { getCurrentUnitType } from '../lib/config';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase, userService, bulletinService, robustService, retryOperation } from '../lib/supabase';
import { recurringAnnouncementsService } from '../lib/recurringAnnouncementsService';
import BulletinForm from '../components/BulletinForm';
import BulletinPreview from '../components/BulletinPreview';
import QRCodeGenerator from '../components/QRCodeGenerator';
import AuthModal from '../components/AuthModal';
import UserMenu from '../components/UserMenu';
import SavedBulletinsModal from '../components/SavedBulletinsModal';
import TemplatesModal from '../components/TemplatesModal';
import ThemeModal from '../components/ThemeModal';
import PrintPreviewModal from '../components/PrintPreviewModal';
import ProfileModal from '../components/ProfileModal';
import PublicBulletinView from '../components/PublicBulletinView';
import SubmissionReviewModal from '../components/SubmissionReviewModal';
import ConfirmationModal from '../components/ConfirmationModal';
import BulletinScheduler from '../components/BulletinScheduler';
import ProfileSharingModal from '../components/ProfileSharingModal';
import ChangelogModal from '../components/ChangelogModal';
import BulletinActions from '../components/BulletinActions';
import { BulletinData } from '../types/bulletin';
import templateService, { Template } from '../lib/templateService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Logo from '../components/Logo';
import BulletinPrintLayout from '../components/BulletinPrintLayout';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { useSession } from '../lib/SessionContext';
import { themes } from '../data/themes';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useProfileAccess } from '../hooks/useProfilePermissions';
import { getAllImages, ImageData } from '../data/images';


function decodeJwtExp(token: string) {
  try {
    const decoded = jwtDecode<JwtPayload & { exp?: number }>(token);
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch (e) {
    return null;
  }
}

function EditorApp() {
  const [currentView, setCurrentView] = useState<'editor' | 'public'>('editor');
  const [publicBulletinData, setPublicBulletinData] = useState<any>(null);
  const [publicError, setPublicError] = useState('');
  const { user, profile, refreshProfile } = useSession();
  const queryClient = useQueryClient();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeBulletinId, setActiveBulletinId] = useState<string | null>(null);
  const { sharedProfiles, loading: sharedProfilesLoading } = useProfileAccess();
  const [allImages, setAllImages] = useState<ImageData[]>([]);

  // Load images when user changes
  useEffect(() => {
    loadAllImages();
  }, [user]);

  const loadAllImages = async () => {
    // Always load images - LDS_IMAGES are available to everyone
    // Custom images are only loaded if user is logged in
    const images = await getAllImages(user?.id);
    setAllImages(images);
  };

  // Get the current profile slug (from URL or user's profile)
  // If user has shared profiles and no slug is specified, default to first shared profile
  const currentProfileSlug = slug || profile?.profile_slug;

  // Get active bulletin ID for the current profile
  // Query by status='active' and profile_slug instead of relying on active_bulletin_id
  // This is more reliable for shared profiles where multiple users might activate bulletins
  const getActiveBulletinForCurrentProfile = async (profileSlug: string) => {
    try {
      const { data: activeBulletins, error: queryError } = await supabase
        .from('bulletins')
        .select('id, status')
        .eq('profile_slug', profileSlug)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (queryError) {
        return null;
      }

      return activeBulletins?.id || null;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const updateActiveBulletinId = async () => {
      if (currentProfileSlug) {
        // If we're on a shared profile, get its active bulletin
        if (currentProfileSlug !== profile?.profile_slug) {
          const activeId = await getActiveBulletinForCurrentProfile(currentProfileSlug);
          setActiveBulletinId(activeId);
        } else {
          // If we're on our own profile, use the profile's active bulletin
          // But also verify by querying for active bulletins to ensure consistency
          const activeId = await getActiveBulletinForCurrentProfile(currentProfileSlug);
          // Prefer the queried active bulletin over profile.active_bulletin_id for consistency
          setActiveBulletinId(activeId || profile?.active_bulletin_id || null);
        }
      } else if (profile?.active_bulletin_id !== undefined) {
        // No profile_slug but user has a profile - use their active_bulletin_id
        // Only update if it's different to prevent unnecessary re-renders
        if (activeBulletinId !== profile.active_bulletin_id) {
          setActiveBulletinId(profile.active_bulletin_id || null);
        }
      }
      // If no profile yet, do nothing (keep current state)
    };

    updateActiveBulletinId();
  }, [currentProfileSlug, profile?.active_bulletin_id, profile?.profile_slug]);

  // Redirect to shared profile if user has shared profiles but no slug specified
  useEffect(() => {
    if (!slug && !sharedProfilesLoading && sharedProfiles.length > 0 && user) {
      // User has shared profiles but no slug - redirect to first shared profile
      const firstSharedProfile = sharedProfiles[0];
      navigate(`/profile/${firstSharedProfile.profile_slug}`, { replace: true });
    }
  }, [slug, sharedProfiles, sharedProfilesLoading, user, navigate]);

  // Show changelog modal for new version - appears up to 3 times unless dismissed
  useEffect(() => {
    if (user) {
      const CHANGELOG_VERSION = '2025.01'; // Update this when you want to show changelog again
      const VIEW_COUNT_KEY = `changelog_views_${CHANGELOG_VERSION}`;
      const DISMISSED_KEY = `changelog_dismissed_${CHANGELOG_VERSION}`;

      const viewCount = parseInt(localStorage.getItem(VIEW_COUNT_KEY) || '0');
      const isDismissed = localStorage.getItem(DISMISSED_KEY) === 'true';

      // Show if not dismissed and viewed less than 3 times
      if (!isDismissed && viewCount < 3) {
        setShowChangelog(true);
        // Increment view count
        localStorage.setItem(VIEW_COUNT_KEY, String(viewCount + 1));
      }
    }
  }, [user]);

  const handleCloseChangelog = (dontShowAgain = false) => {
    const CHANGELOG_VERSION = '2025.01';
    const DISMISSED_KEY = `changelog_dismissed_${CHANGELOG_VERSION}`;

    if (dontShowAgain) {
      localStorage.setItem(DISMISSED_KEY, 'true');
    }

    setShowChangelog(false);
  };

  // Handle invitation state from InvitePage
  useEffect(() => {
    if (location.state?.showAuth) {
      setAuthModalMode(location.state.mode);
      setAuthModalPrefillEmail(location.state.prefillEmail);
      setShowAuthModal(true);
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | undefined>(undefined);
  const [authModalPrefillEmail, setAuthModalPrefillEmail] = useState<string | undefined>(undefined);
  const [showSavedBulletins, setShowSavedBulletins] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showPrintPreviewModal, setShowPrintPreviewModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSubmissionReview, setShowSubmissionReview] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showProfileSharing, setShowProfileSharing] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [pendingSubmissionsCount, setPendingSubmissionsCount] = useState(0);
  const [currentBulletinId, setCurrentBulletinId] = useState<string | null>(null);
  const [showCreateProfileSlug, setShowCreateProfileSlug] = useState(false);
  const [newProfileSlug, setNewProfileSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(() => {
    // Don't mark as having unsaved changes on initial load
    // The useEffect will handle loading saved bulletins and clearing drafts
    return false;
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'warning'
  });


  // Move DEFAULT_KEYS and getDefault above useState
  const DEFAULT_KEYS: Record<
    'wardName' | 'presiding' | 'conducting' | 'chorister' | 'organist' | 'wardLeadership' | 'missionaries' | 'wardMissionaries',
    string
  > = {
    wardName: 'default_wardName',
    presiding: 'default_presiding',
    conducting: 'default_conducting',
    chorister: 'default_chorister',
    organist: 'default_organist',
    wardLeadership: 'default_wardLeadership',
    missionaries: 'default_missionaries',
    wardMissionaries: 'default_wardMissionaries',
  };
  function getDefault<K extends keyof typeof DEFAULT_KEYS, T>(key: K, fallback: T): T {
    try {
      const val = localStorage.getItem(DEFAULT_KEYS[key]);
      if (val) {
        if (key === 'wardLeadership' || key === 'missionaries' || key === 'wardMissionaries') {
          try { return JSON.parse(val) as T; } catch { return fallback; }
        }
        return val as T;
      }
      return fallback;
    } catch (e) {
      return fallback;
    }
  }

  // Helper function to ensure sacrament item exists at the top of agenda (only for sacrament meetings)
  function ensureSacramentItem(agenda: any[], meetingType: string = 'sacrament'): any[] {
    // Only add sacrament item for sacrament meetings
    if (meetingType !== 'sacrament') {
      return agenda;
    }
    
    // Check if sacrament item already exists
    const hasSacramentItem = agenda.some(item => item.type === 'sacrament');
    
    if (!hasSacramentItem) {
      // Add sacrament item at the top
      return [{ type: 'sacrament', id: crypto.randomUUID() }, ...agenda];
    }
    
    return agenda;
  }

  async function populateWithRecurringAnnouncements(bulletin: BulletinData): Promise<BulletinData> {
    try {
      if (!currentProfileSlug) return bulletin;
      
      const recurringAnnouncements = await recurringAnnouncementsService.getAnnouncementsForNewBulletin(currentProfileSlug);
      
      if (recurringAnnouncements.length > 0) {
        const newAnnouncements = recurringAnnouncements.map(announcement => ({
          id: Date.now().toString() + Math.random(),
          title: announcement.title,
          content: announcement.content,
          category: announcement.category || 'general',
          audience: announcement.audience,
          // Preserve image data from recurring announcement
          images: announcement.images
        }));
        
        return {
          ...bulletin,
          announcements: [...bulletin.announcements, ...newAnnouncements]
        };
      }
      
      return bulletin;
    } catch (error) {
      return bulletin;
    }
  }

  // Helper function to get appropriate meeting type based on unit type
  const getMeetingTypeForUnit = (unitType: string): string => {
    // Both ward and branch use sacrament meetings
    return 'sacrament';
  };

  function createBlankBulletin(): BulletinData {
    const currentUnitType = getCurrentUnitType();
    return {
      wardName: getDefault('wardName', ''),
      date: (() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      })(),
      meetingType: getMeetingTypeForUnit(currentUnitType),
      theme: '',
      userTheme: '',
      bishopricMessage: '',
      announcements: [],
      meetings: [],
      specialEvents: [],
      agenda: getMeetingTypeForUnit(currentUnitType) === 'sacrament' ? [
        { type: 'sacrament', id: crypto.randomUUID() }
      ] : [],
      prayers: {
        opening: '',
        closing: '',
        invocation: '',
        benediction: ''
      },
      musicProgram: {
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
      leadership: {
        presiding: getDefault('presiding', ''),
        conducting: getDefault('conducting', ''),
        chorister: getDefault('chorister', ''),
        organist: getDefault('organist', ''),
        organistLabel: 'Organist',
        choristerLabel: 'Chorister'
      },
      wardLeadership: getDefault('wardLeadership', [
        { title: 'Bishop', name: '', phone: '' },
        { title: '1st Counselor', name: '', phone: '' },
        { title: '2nd Counselor', name: '', phone: '' },
        { title: 'Executive Secretary', name: '', phone: '' },
        { title: 'Ward Clerk', name: '', phone: '' },
        { title: 'Elders Quorum President', name: '', phone: '' },
        { title: 'Relief Society President', name: '', phone: '' },
        { title: "Young Women's President", name: '', phone: '' },
        { title: 'Primary President', name: '', phone: '' },
        { title: 'Sunday School President', name: '', phone: '' },
        { title: 'Ward Mission Leader', name: '', phone: '' },
        { title: 'Building Representative', name: '', phone: '' },
        { title: 'Temple & Family History', name: '', phone: '' }
      ]),
      missionaries: getDefault('missionaries', []),
      wardMissionaries: getDefault('wardMissionaries', []),
      serviceMissionaries: [],
      imageId: 'none',
      imagePosition: { x: 50, y: 50 }
    };
  }

  // Use a function to initialize bulletinData from localStorage defaults
  const [bulletinData, setBulletinData] = useState<BulletinData>(() => {
    // Check for draft first during initial state creation
    const DRAFT_KEY = 'draft_bulletin';
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as BulletinData;
        // Ensure all required fields exist for backward compatibility
        const defaultBulletin = createBlankBulletin();
        return {
          ...defaultBulletin,
          ...parsed,
          imageId: parsed.imageId || 'none',
          imagePosition: parsed.imagePosition || { x: 50, y: 50 },
          wardMissionaries: parsed.wardMissionaries || [],
          missionaries: parsed.missionaries || [],
          wardLeadership: parsed.wardLeadership || defaultBulletin.wardLeadership
        };
      } catch (e) {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
    return createBlankBulletin();
  });

  const [showQRCode, setShowQRCode] = useState(false);
  const bulletinRef = useRef<HTMLDivElement>(null);
  const printPage1Ref = useRef<HTMLDivElement>(null);
  const printPage2Ref = useRef<HTMLDivElement>(null);

  // Add a helper for draft key
  const DRAFT_KEY = 'draft_bulletin';

  // Handle template loading only if no draft was loaded during initialization
  useEffect(() => {
    const initializeApp = () => {
      // Skip if we already loaded a draft during state initialization
      const hasDraft = !!localStorage.getItem(DRAFT_KEY);
      if (hasDraft) {
        return;
      }

      // Load template if no draft exists
      const activeId = templateService.getActiveTemplateId();
      if (activeId) {
        const tmpl = templateService.getTemplate(activeId);
        if (tmpl) {
          setBulletinData(tmpl.data);
          setHasUnsavedChanges(false);
          return;
        }
      }

      // If no template and no draft, state initialization already set blank bulletin
    };

    initializeApp();
  }, []);

  // When returning to the page (e.g. after switching apps) re-check the session
  // and restore any draft from localStorage. This effect listens for focus,
  // visibilitychange, and pageshow so the draft is restored without needing
  // a manual refresh on mobile browsers like Safari.
  // Temporarily disabled visibility handler to test minimize issue
  // useEffect(() => {
  //   const handleVisibility = async () => {
  //     if (document.visibilityState === 'visible') {
  //       // Check visibility state change
  //       
  //       // First try to restore from draft
  //       const savedDraft = localStorage.getItem(DRAFT_KEY);
  //       if (savedDraft) {
  //         try {
  //           const parsed = JSON.parse(savedDraft) as BulletinData;
  //           // Restoring from draft
  //           setBulletinData(parsed);
  //           setHasUnsavedChanges(true);
  //           return; // Draft restored, we're done
  //         } catch (err) {
  //           console.error('Failed to restore draft:', err);
  //         }
  //       }
  //       
  //       // If we have unsaved changes, don't overwrite - user is actively working
  //       if (hasUnsavedChanges) {
  //         // Has unsaved changes, keeping current state
  //         return; // Keep current state
  //       }
  //       
  //       // If we have a current bulletin loaded, try to restore it
  //       if (user && currentBulletinId) {
  //         try {
  //           // Restoring current bulletin
  //           const bulletin = await bulletinService.getBulletinById(currentBulletinId);
  //           const data = convertDbBulletinToData(bulletin);
  //           setBulletinData(data);
  //           setHasUnsavedChanges(false);
  //           return; // Current bulletin restored
  //         } catch (err) {
  //           console.error('Failed to restore current bulletin on visibility change:', err);
  //         }
  //       }
  //       
  //       // No current bulletin, try to restore active bulletin if user is signed in
  //       if (user && activeBulletinId) {
  //         try {
  //           // Restoring active bulletin
  //           const bulletin = await bulletinService.getBulletinById(activeBulletinId);
  //           const data = convertDbBulletinToData(bulletin);
  //           setBulletinData(data);
  //           setCurrentBulletinId(bulletin.id);
  //           setHasUnsavedChanges(false);
  //           return; // Active bulletin restored
  //         } catch (err) {
  //           console.error('Failed to restore active bulletin on visibility change:', err);
  //         }
  //       }
  //       
  //       // Fallback: restore template or blank bulletin only if nothing else worked
  //       const activeTemplateId = templateService.getActiveTemplateId();
  //       if (activeTemplateId) {
  //         const tmpl = templateService.getTemplate(activeTemplateId);
  //         if (tmpl) {
  //           // Restoring template
  //           setBulletinData(tmpl.data);
  //           setHasUnsavedChanges(false);
  //           return;
  //         }
  //       }
  //       
  //       // Final fallback: blank bulletin
  //       // Falling back to blank bulletin
  //       setBulletinData(createBlankBulletin());
  //       setHasUnsavedChanges(false);
  //     }
  //   };
  //   document.addEventListener('visibilitychange', handleVisibility);
  //   window.addEventListener('focus', handleVisibility);
  //   window.addEventListener('pageshow', handleVisibility);
  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibility);
  //     window.removeEventListener('focus', handleVisibility);
  //     window.removeEventListener('pageshow', handleVisibility);
  //   };
  // }, [user, activeBulletinId, hasUnsavedChanges, currentBulletinId]);

  const convertDbBulletinToData = (bulletin: any): BulletinData => ({
    wardName: bulletin.ward_name || '',
    date: bulletin.date || '',
    // Include status and scheduling fields
    status: bulletin.status || 'draft',
    scheduledDate: bulletin.scheduled_date || null,
    autoActivate: bulletin.auto_activate || false,
    meetingType: bulletin.meeting_type || 'sacrament',
    theme: bulletin.theme || '',
    userTheme: bulletin.userTheme || '',
    bishopricMessage: bulletin.bishopric_message || '',
    announcements: bulletin.announcements || [],
    meetings: bulletin.meetings || [],
    specialEvents: bulletin.special_events || [],
    agenda: ensureSacramentItem(bulletin.agenda || [], bulletin.meeting_type),
    prayers: bulletin.prayers || {
      opening: '',
      closing: '',
      invocation: '',
      benediction: ''
    },
    musicProgram: bulletin.music_program || {
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
    leadership: {
      presiding: bulletin.leadership?.presiding || '',
      chorister: bulletin.leadership?.chorister || '',
      organist: bulletin.leadership?.organist || '',
      conducting: bulletin.leadership?.conducting || '',
      preludeMusic: bulletin.leadership?.preludeMusic || '',
      organistLabel: bulletin.leadership?.organistLabel || 'Organist',
      choristerLabel: bulletin.leadership?.choristerLabel || 'Chorister'
    },
    wardLeadership: bulletin.wardLeadership || [
      { title: 'Bishop', name: '', phone: '' },
      { title: '1st Counselor', name: '', phone: '' },
      { title: '2nd Counselor', name: '', phone: '' },
      { title: 'Executive Secretary', name: '', phone: '' },
      { title: 'Ward Clerk', name: '', phone: '' },
      { title: 'Elders Quorum President', name: '', phone: '' },
      { title: 'Relief Society President', name: '', phone: '' },
      { title: "Young Women's President", name: '', phone: '' },
      { title: 'Primary President', name: '', phone: '' },
      { title: 'Sunday School President', name: '', phone: '' },
      { title: 'Ward Mission Leader', name: '', phone: '' },
      { title: 'Building Representative', name: '', phone: '' },
      { title: 'Temple & Family History', name: '', phone: '' }
    ],
    missionaries: bulletin.missionaries || [],
    wardMissionaries: bulletin.wardMissionaries || [],
    serviceMissionaries: bulletin.serviceMissionaries || [],
    imageId: bulletin.imageId || 'none',
    imageUrl: bulletin.imageUrl, // Include the direct URL for custom images
    imagePosition: bulletin.imagePosition || { x: 50, y: 50 },
    imageOpacity: bulletin.imageOpacity ?? 40
  });

  const handleBulletinDataChange = (newData: BulletinData) => {
    setBulletinData(newData);
    
    // Try to save to localStorage with error handling and quota management
    try {
      const dataToSave = JSON.stringify(newData);
      
      // Check if data is too large (localStorage typically has 5-10MB limit)
      if (dataToSave.length > 3 * 1024 * 1024) { // 3MB threshold for safety
        // Try to clear old bulletin data to make space
        try {
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('mywardbulletin_') && key !== DRAFT_KEY) {
              localStorage.removeItem(key);
            }
          });

          // Try again after clearing
          if (dataToSave.length < 4 * 1024 * 1024) {
            localStorage.setItem(DRAFT_KEY, dataToSave);
            setHasUnsavedChanges(true);
            return;
          }
        } catch (clearError) {
          // Failed to clear old data
        }

        setHasUnsavedChanges(true);
        return;
      }

      localStorage.setItem(DRAFT_KEY, dataToSave);
      setHasUnsavedChanges(true);
    } catch (error) {
      // If it's a quota exceeded error, try to clear old data
      if (error instanceof DOMException && error.code === DOMException.QUOTA_EXCEEDED_ERR) {
        try {
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('mywardbulletin_') && key !== DRAFT_KEY) {
              localStorage.removeItem(key);
            }
          });

          // Try one more time
          localStorage.setItem(DRAFT_KEY, JSON.stringify(newData));
          setHasUnsavedChanges(true);
          return;
        } catch (retryError) {
          // Failed to save even after clearing
        }
      }

      // Still mark as having changes, but don't save to localStorage
      setHasUnsavedChanges(true);
    }
  };



  useEffect(() => {
    (async () => {
      if (!supabase) return;
      await supabase.auth.getSession();
    })();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let intervalId: NodeJS.Timeout;
    async function checkJwtExpiration() {
      const { data } = await supabase.auth.getSession();
      const accessToken = data?.session?.access_token;
      if (!accessToken) return;
      const exp = decodeJwtExp(accessToken);
      if (!exp) return;
      const now = Date.now();
      const msLeft = exp - now;
      if (msLeft < 2 * 60 * 1000) { // less than 2 minutes left
        toast.warning('Session expired or about to expire. Please sign in again.');
        await supabase.auth.signOut();
        window.location.reload();
      }
    }
    checkJwtExpiration();
    intervalId = setInterval(checkJwtExpiration, 30000);
    return () => clearInterval(intervalId);
  }, []);


  // On app load, if user is signed in and a draft exists, offer to save it
  React.useEffect(() => {
    if (user) {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        // Optionally prompt the user to save the draft
        // For now, auto-save as above
      }
    }
  }, [user]);

  // Fetch status for current bulletin if missing, or update if activeBulletinId changes
  useEffect(() => {
    const fetchBulletinStatus = async () => {
      if (!user || !currentBulletinId) {
        return;
      }

      // If we have an activeBulletinId and it matches currentBulletinId, set status to active immediately
      if (activeBulletinId === currentBulletinId) {
        if (bulletinData.status !== 'active') {
          setBulletinData(prev => ({ ...prev, status: 'active' }));
        }
        return;
      }

      // If we already have a status and it's not active, and this isn't the active bulletin, don't fetch
      if (bulletinData.status && bulletinData.status !== 'active') {
        return;
      }

      try {
        // Fetch just the status field for the current bulletin
        const { data, error } = await supabase
          .from('bulletins')
          .select('id, status')
          .eq('id', currentBulletinId)
          .single();

        if (!error && data && data.status) {
          // Update bulletinData with the status
          setBulletinData(prev => ({ ...prev, status: data.status }));
        }
      } catch (error) {
        // Failed to fetch bulletin status
      }
    };

    fetchBulletinStatus();
  }, [user, currentBulletinId, activeBulletinId, bulletinData.status]);

  // Load active bulletin on startup or when active bulletin changes
  useEffect(() => {
    const fetchInitialBulletin = async () => {
      if (!user) return;

      // CRITICAL: On refresh, prioritize loading saved bulletins over drafts
      // Only skip if user is actively editing (hasUnsavedChanges is true AND we're not on initial load)
      // On initial load (refresh), we want to load the saved bulletin and clear any stale draft
      const isInitialLoad = !currentBulletinId && !bulletinData.wardName;
      if (hasUnsavedChanges && !isInitialLoad) {
        return;
      }

      // IMPORTANT: Check if the active bulletin has changed
      // This handles scheduled bulletins activating, or manual activation on another device
      if (currentBulletinId && activeBulletinId && currentBulletinId === activeBulletinId && !isInitialLoad) {
        return;
      }

      try {
        if (currentProfileSlug) {
          // If we're on a shared profile, get its active bulletin
          if (currentProfileSlug !== profile?.profile_slug) {
            const bulletin = await bulletinService.getLatestBulletinByProfileSlug(currentProfileSlug);
            if (bulletin) {
              const data = convertDbBulletinToData(bulletin);
              setBulletinData(data);
              setCurrentBulletinId(bulletin.id);
              setHasUnsavedChanges(false);
              localStorage.removeItem(DRAFT_KEY);
            }
          } else if (activeBulletinId) {
            // If we're on our own profile, load the active bulletin
            // This will switch to the new active bulletin even if we were viewing a different one
            const bulletin = await bulletinService.getBulletinById(activeBulletinId);
            if (bulletin) {
              const data = convertDbBulletinToData(bulletin);
              setBulletinData(data);
              setCurrentBulletinId(bulletin.id);
              setHasUnsavedChanges(false);
              localStorage.removeItem(DRAFT_KEY);
            }
          } else if (isInitialLoad) {
            // On initial load with no active bulletin, check for draft
            // But only if we don't have a currentBulletinId
            const hasDraft = !!localStorage.getItem(DRAFT_KEY);
            if (hasDraft) {
              try {
                const draftData = JSON.parse(localStorage.getItem(DRAFT_KEY)!);
                setBulletinData(draftData);
                setHasUnsavedChanges(true);
              } catch (err) {
                localStorage.removeItem(DRAFT_KEY);
              }
            }
          }
        }
      } catch (err) {
        // If loading fails, clear the active bulletin ID to prevent infinite retries
        if (activeBulletinId) {
          await handleActiveBulletinSelect(null);
        }
      }
    };
    fetchInitialBulletin();
  }, [user, activeBulletinId, currentProfileSlug]);

  const handleCreateProfileSlug = async () => {
    if (!newProfileSlug.trim() || !user) return;
    
    try {
      await userService.updateProfileSlug(user.id, newProfileSlug.trim());
      toast.success('Profile slug created successfully!');
      setShowCreateProfileSlug(false);
      setNewProfileSlug('');
      // Refresh the page to load the new profile
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile slug');
    }
  };

  const handleBackToEditor = () => {
    setCurrentView('editor');
    setPublicBulletinData(null);
    setPublicError('');
    // Update URL to home
    window.history.pushState({}, '', '/');
  };

  const handleSaveBulletin = async () => {
    if (!user) {
      // Save draft before showing auth modal
      await robustService.saveDraftBeforeAuth(bulletinData);
      setShowAuthModal(true);
      return;
    }

    // Check if there are actually changes to save
    if (!hasUnsavedChanges) {
      toast.info('No changes to save', {
        toastId: 'no-changes-to-save'
      });
      return;
    }

    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session) {
        toast.error('Session expired. Please sign in again.');
        setShowAuthModal(true);
        return;
      }
    } catch (err) {
      toast.error('Session expired. Please sign in again.');
      setShowAuthModal(true);
      return;
    }
    setLoading(true);
    const SAVE_TIMEOUT_MS = 10000;
    let timeoutHandle: NodeJS.Timeout | null = null;
    let didTimeout = false;
    try {
      const savePromise = (async () => {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
        }
        const savedBulletin = await retryOperation(() => bulletinService.saveBulletin(
          bulletinData,
          user.id,
          currentBulletinId || undefined,
          currentProfileSlug || undefined
        ));
        return savedBulletin;
      })();
      const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
          didTimeout = true;
          reject(new Error('Save operation timed out after 10 seconds.'));
        }, SAVE_TIMEOUT_MS);
      });
      const savedBulletin = await Promise.race([savePromise, timeoutPromise]);
      if (timeoutHandle) clearTimeout(timeoutHandle);
      if (didTimeout) return; // Already handled by catch

      // Check if this bulletin was/is active before saving
      const wasActive = currentBulletinId && currentBulletinId === activeBulletinId;

      setCurrentBulletinId(savedBulletin.id);
      setHasUnsavedChanges(false);

      // If the bulletin was active before saving, re-activate it with the new ID
      if (wasActive && savedBulletin.id !== activeBulletinId) {
        await handleActiveBulletinSelect(savedBulletin.id);
      }

      // Invalidate query cache to refresh saved bulletins modal
      queryClient.invalidateQueries({ queryKey: ['user-bulletins', user.id, currentProfileSlug] });

      toast.success(currentBulletinId ? 'Bulletin updated successfully!' : 'Bulletin saved successfully!', {
        toastId: 'bulletin-save-success'
      });
    } catch (error) {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      if (didTimeout) {
        toast.error('Saving took too long. Please check your connection or try again.');
      } else {
        toast.error('Error saving bulletin: ' + (error as Error).message);
      }
      // Try to save to localStorage as fallback
      try {
        bulletinService.saveToLocalStorage({
          id: currentBulletinId || `local_${Date.now()}`,
          ...bulletinData,
          created_by: user.id,
          created_at: new Date().toISOString()
        });
        toast.warning('Bulletin saved locally due to connection issues. It will sync when connection is restored.');
      } catch (localError) {
        toast.error('Error saving bulletin: ' + (error as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMakeActive = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setLoading(true);

      // Auto-save the bulletin if it hasn't been saved yet
      if (!currentBulletinId) {
        const savedBulletin = await retryOperation(() => bulletinService.saveBulletin(
          bulletinData,
          user.id,
          undefined
        ));
        setCurrentBulletinId(savedBulletin.id);
        setHasUnsavedChanges(false);

        // Make the newly saved bulletin active
        await handleActiveBulletinSelect(savedBulletin.id);
      } else {
        // Make existing bulletin active
        await handleActiveBulletinSelect(currentBulletinId);
      }

      toast.success('Bulletin is now active on your QR code!');
    } catch (error) {
      toast.error('Error making bulletin active: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };


  const handleSaveAsTemplate = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setLoading(true);
      const templateName = `${bulletinData.wardName} Template - ${new Date().toLocaleDateString()}`;
      await templateService.saveTemplate(templateName, bulletinData);
      toast.success('Bulletin saved as template!');
    } catch (error) {
      toast.error('Error saving template: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSavedBulletins = () => {
    setShowSavedBulletins(true);
  };

  const handleLoadSavedBulletin = (bulletin: any) => {
    // Check for unsaved changes
    if (hasUnsavedChanges) {
      setConfirmationModal({
        isOpen: true,
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Loading this bulletin will discard them. Continue?',
        onConfirm: () => {
          // Convert database format back to app format
          const loadedData: BulletinData = {
            wardName: bulletin.ward_name,
            date: bulletin.date,
            meetingType: bulletin.meeting_type,
            theme: bulletin.theme || '',
            bishopricMessage: bulletin.bishopric_message || '',
            announcements: bulletin.announcements || [],
            meetings: bulletin.meetings || [],
            specialEvents: bulletin.special_events || [],
            agenda: ensureSacramentItem(bulletin.agenda || [], bulletin.meeting_type),
            prayers: bulletin.prayers || {
              opening: '',
              closing: '',
              invocation: '',
              benediction: ''
            },
            musicProgram: bulletin.music_program || {
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
            leadership: bulletin.leadership || {
              presiding: '',
              chorister: '',
              organist: ''
            },
            wardLeadership: bulletin.wardLeadership || [
              { title: 'Bishop', name: '', phone: '' },
              { title: '1st Counselor', name: '', phone: '' },
              { title: '2nd Counselor', name: '', phone: '' },
              { title: 'Executive Secretary', name: '', phone: '' },
              { title: 'Ward Clerk', name: '', phone: '' },
              { title: 'Elders Quorum President', name: '', phone: '' },
              { title: 'Relief Society President', name: '', phone: '' },
              { title: 'Young Women\'s President', name: '', phone: '' },
              { title: 'Primary President', name: '', phone: '' },
              { title: 'Sunday School President', name: '', phone: '' },
              { title: 'Ward Mission Leader', name: '', phone: '' },
              { title: 'Building Representative', name: '', phone: '' },
              { title: 'Temple & Family History', name: '', phone: '' }
            ],
            missionaries: bulletin.missionaries || [],
            wardMissionaries: bulletin.wardMissionaries || [],
            imageId: bulletin.imageId || 'none',
            imagePosition: bulletin.imagePosition || { x: 50, y: 50 }
          };

          setBulletinData(loadedData);
          setCurrentBulletinId(bulletin.id);
          setHasUnsavedChanges(false);
          setShowSavedBulletins(false);
          setShowQRCode(false);
        },
        variant: 'warning'
      });
      return;
    }

    // Convert database format back to app format
    const loadedData: BulletinData = {
      wardName: bulletin.ward_name,
      date: bulletin.date,
      meetingType: bulletin.meeting_type,
      theme: bulletin.theme || '',
      bishopricMessage: bulletin.bishopric_message || '',
      announcements: bulletin.announcements || [],
      meetings: bulletin.meetings || [],
      specialEvents: bulletin.special_events || [],
      agenda: ensureSacramentItem(bulletin.agenda || [], bulletin.meeting_type),
      prayers: bulletin.prayers || {
        opening: '',
        closing: '',
        invocation: '',
        benediction: ''
      },
      musicProgram: bulletin.music_program || {
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
      leadership: bulletin.leadership || {
        presiding: '',
        chorister: '',
        organist: ''
      },
      // Include status and scheduling fields
      status: bulletin.status || 'draft',
      scheduledDate: bulletin.scheduled_date,
      autoActivate: bulletin.auto_activate,
      wardLeadership: bulletin.wardLeadership || [
        { title: 'Bishop', name: '', phone: '' },
        { title: '1st Counselor', name: '', phone: '' },
        { title: '2nd Counselor', name: '', phone: '' },
        { title: 'Executive Secretary', name: '', phone: '' },
        { title: 'Ward Clerk', name: '', phone: '' },
        { title: 'Elders Quorum President', name: '', phone: '' },
        { title: 'Relief Society President', name: '', phone: '' },
        { title: 'Young Women\'s President', name: '', phone: '' },
        { title: 'Primary President', name: '', phone: '' },
        { title: 'Sunday School President', name: '', phone: '' },
        { title: 'Ward Mission Leader', name: '', phone: '' },
        { title: 'Building Representative', name: '', phone: '' },
        { title: 'Temple & Family History', name: '', phone: '' }
      ],
      missionaries: bulletin.missionaries || [],
      wardMissionaries: bulletin.wardMissionaries || [],
      imageId: bulletin.imageId || 'none',
      imagePosition: bulletin.imagePosition || { x: 50, y: 50 }
    };

    setBulletinData(loadedData);
    setCurrentBulletinId(bulletin.id);
    setHasUnsavedChanges(false);
    setShowSavedBulletins(false);
    setShowQRCode(false);
  };

  const handleTemplateSelect = (template: Template | null) => {
    if (template) {
      templateService.setActiveTemplateId(template.id);
      setBulletinData(template.data);
    } else {
      templateService.setActiveTemplateId(null);
      setBulletinData(createBlankBulletin());
    }
    setCurrentBulletinId(null);
    setHasUnsavedChanges(false);
    setShowTemplates(false);
  };

  const handleDeleteSavedBulletin = (bulletinId: string) => {
    // If we're currently editing the deleted bulletin, clear the current ID
    if (currentBulletinId === bulletinId) {
      setCurrentBulletinId(null);
      setHasUnsavedChanges(true); // Mark as unsaved since the saved version is gone
    }
  };

  const handleScheduleBulletin = async (scheduledDate: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Validate that the scheduled date/time is not in the past
    const scheduledDateTime = new Date(scheduledDate);
    const now = new Date();
    
    if (scheduledDateTime < now) {
      toast.error('Cannot schedule a bulletin for a date/time in the past. Please select a future date and time.');
      return;
    }

    try {
      setLoading(true);
      let bulletinId = currentBulletinId;

      // Auto-save the bulletin if it hasn't been saved yet
      if (!bulletinId) {
        const savedBulletin = await retryOperation(() => bulletinService.saveBulletin(
          bulletinData,
          user.id,
          undefined
        ));
        setCurrentBulletinId(savedBulletin.id);
        setHasUnsavedChanges(false);
        bulletinId = savedBulletin.id;
      }

      await bulletinService.updateBulletinSchedule(bulletinId, user.id, {
        scheduledDate,
        status: 'scheduled',
        autoActivate: true
      });

      toast.success(`Bulletin scheduled for ${new Date(scheduledDate).toLocaleDateString()}`);
      setShowScheduler(false);
    } catch (error: any) {
      toast.error('Error scheduling bulletin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Check for pending submissions
  const checkPendingSubmissions = async () => {
    if (!supabase || !currentProfileSlug) return;
    
    try {
      const { data, error } = await supabase
        .from('announcement_submissions')
        .select('id')
        .eq('profile_slug', currentProfileSlug)
        .eq('status', 'pending');
      
      if (!error && data) {
        setPendingSubmissionsCount(data.length);
      }
    } catch (error) {
      // Error checking pending submissions
    }
  };

  // Check for pending submissions when user or profile changes
  useEffect(() => {
    if (user && currentProfileSlug) {
      checkPendingSubmissions();
    } else {
      setPendingSubmissionsCount(0);
    }
  }, [user, currentProfileSlug]);

  const handleNewBulletin = () => {
    if (hasUnsavedChanges) {
      setConfirmationModal({
        isOpen: true,
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Creating a new bulletin will discard them. Continue?',
        onConfirm: () => {
          setShowTemplates(true);
        },
        variant: 'warning'
      });
      return;
    }
    setShowTemplates(true);
  };

  const handleActiveBulletinSelect = async (bulletinId: string | null) => {
    if (!user) return;

    try {
      if (bulletinId) {
        // Make the bulletin active by updating its status
        await bulletinService.updateBulletinStatus(bulletinId, user.id, 'active');
        setActiveBulletinId(bulletinId);

        // Update local bulletinData status if this is the current bulletin
        if (currentBulletinId === bulletinId) {
          setBulletinData(prev => ({ ...prev, status: 'active' }));
        }

        // Refetch queries instead of invalidating to preserve data during refetch
        queryClient.refetchQueries({ 
          queryKey: ['user-bulletins', user.id],
          type: 'active'
        });
        if (currentProfileSlug && currentProfileSlug !== profile?.profile_slug) {
          queryClient.refetchQueries({ 
            queryKey: ['shared-profile-bulletins', currentProfileSlug],
            type: 'active'
          });
        }
        // Also refetch profile-related queries
        queryClient.refetchQueries({ 
          queryKey: ['user-profile', user.id],
          type: 'active'
        });
        
        // Force refresh the activeBulletinId state to ensure UI consistency
        setTimeout(async () => {
          if (currentProfileSlug !== profile?.profile_slug) {
            const activeId = await getActiveBulletinForCurrentProfile(currentProfileSlug);
            setActiveBulletinId(activeId);
          } else {
            // Refresh profile data to get updated active_bulletin_id
            const updatedProfile = await userService.getUserProfile(user.id);
            if (updatedProfile && updatedProfile.length > 0) {
              setActiveBulletinId(updatedProfile[0].active_bulletin_id || null);
            }
          }
        }, 100); // Small delay to ensure database update is complete
      } else {
        // Clear the active bulletin
        await userService.updateActiveBulletinId(user.id, null);
        
        // Update local bulletinData status if this was the active bulletin
        if (currentBulletinId === activeBulletinId) {
          setBulletinData(prev => ({ ...prev, status: 'draft' }));
        }
        setActiveBulletinId(null);

        // Invalidate ALL relevant queries to ensure real-time sync across all components
        queryClient.invalidateQueries({ queryKey: ['user-bulletins', user.id] });
        if (currentProfileSlug && currentProfileSlug !== profile?.profile_slug) {
          queryClient.invalidateQueries({ queryKey: ['shared-profile-bulletins', currentProfileSlug] });
        }
        // Also invalidate any profile-related queries
        queryClient.invalidateQueries({ queryKey: ['user-profile', user.id] });
      }
    } catch (error) {
      toast.error('Error updating active bulletin: ' + (error as Error).message);
    }
  };

  const handleProfileChange = (newProfileSlug: string) => {
    // Navigate to the selected profile
    if (newProfileSlug) {
      navigate(`/profile/${newProfileSlug}`);
    }
  };

  const handleExportPDF = async () => {
    if (printPage1Ref.current && printPage2Ref.current) {
      try {
        // Convert cross-origin image to base64 to bypass CORS restrictions
        const convertImageToBase64 = async (img: HTMLImageElement): Promise<void> => {
          // Skip if already a data URL or same origin
          if (img.src.startsWith('data:') || img.src.startsWith(window.location.origin)) {
            return;
          }

          try {
            // Fetch the image through our origin to get around CORS
            const response = await fetch(img.src);
            const blob = await response.blob();

            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                  img.src = reader.result; // Replace src with base64 data URL
                }
                resolve();
              };
              reader.onerror = () => resolve(); // Continue even on error
              reader.readAsDataURL(blob);
            });
          } catch (error) {
            // Continue without converting - html2canvas will try with useCORS
          }
        };

        // Preload and convert images to ensure they're available for PDF generation
        const preloadImages = async () => {
          const imagePromises: Promise<void>[] = [];

          // Get all images in the print layout
          const images = printPage1Ref.current?.querySelectorAll('img') || [];
          images.forEach((img) => {
            // Convert cross-origin images to base64
            if (img.src && img.src.includes('supabase.co')) {
              imagePromises.push(convertImageToBase64(img));
            } else if (img.src && !img.complete) {
              const promise = new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve(); // Continue even if image fails to load
              });
              imagePromises.push(promise);
            }
          });

          const images2 = printPage2Ref.current?.querySelectorAll('img') || [];
          images2.forEach((img) => {
            // Convert cross-origin images to base64
            if (img.src && img.src.includes('supabase.co')) {
              imagePromises.push(convertImageToBase64(img));
            } else if (img.src && !img.complete) {
              const promise = new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve(); // Continue even if image fails to load
              });
              imagePromises.push(promise);
            }
          });

          // Wait for all images to load/convert (with timeout)
          await Promise.race([
            Promise.all(imagePromises),
            new Promise(resolve => setTimeout(resolve, 5000)) // 5 second timeout for conversions
          ]);
        };

        // Wait for images to load and convert
        await preloadImages();

        // Small delay to ensure layout is fully rendered
        await new Promise(resolve => setTimeout(resolve, 500));

        // Optimized scale for better file size while maintaining quality
        const scale = 1.5;
        const marginX = 0; // extra horizontal margin handled by centering
        const marginY = 10; // mm top/bottom padding

        // Render page 1
        const canvas1 = await html2canvas(printPage1Ref.current, {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: printPage1Ref.current.scrollWidth,
          height: printPage1Ref.current.scrollHeight,
          logging: false, // Disable logging for better performance
          removeContainer: true // Clean up after rendering
        });

        // Render page 2
        const canvas2 = await html2canvas(printPage2Ref.current, {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: printPage2Ref.current.scrollWidth,
          height: printPage2Ref.current.scrollHeight,
          logging: false, // Disable logging for better performance
          removeContainer: true // Clean up after rendering
        });

        // Convert to JPEG with compression for smaller file size
        const imgData1 = canvas1.toDataURL('image/jpeg', 0.85);
        const imgData2 = canvas2.toDataURL('image/jpeg', 0.85);

        const pdf = new jsPDF({ 
          orientation: 'landscape', 
          unit: 'mm', 
          format: 'a4',
          compress: true // Enable PDF compression
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Page 1
        const ratio1 = Math.min(
          1,
          (pdfWidth - marginX * 2) / canvas1.width,
          (pdfHeight - marginY * 2) / canvas1.height
        );
        const imgX1 = (pdfWidth - canvas1.width * ratio1) / 2;
        const imgY1 = marginY;
        pdf.addImage(
          imgData1,
          'JPEG',
          imgX1,
          imgY1,
          canvas1.width * ratio1,
          canvas1.height * ratio1
        );

        // Page 2
        pdf.addPage('a4', 'landscape');
        const ratio2 = Math.min(
          1,
          (pdfWidth - marginX * 2) / canvas2.width,
          (pdfHeight - marginY * 2) / canvas2.height
        );
        const imgX2 = (pdfWidth - canvas2.width * ratio2) / 2;
        const imgY2 = marginY;
        pdf.addImage(
          imgData2,
          'JPEG',
          imgX2,
          imgY2,
          canvas2.width * ratio2,
          canvas2.height * ratio2
        );

        pdf.autoPrint();
        pdf.save('Ward-Bulletin.pdf');
      } catch (error) {
        toast.error('There was an error generating the PDF. Please try again.');
      }
    } else {
      toast.error('PDF export failed: Missing page references. Please try again.');
    }
  };

  // Add a Clear Local Data button for troubleshooting
  const handleClearLocalData = () => {
    if (confirm('This will clear all local data and drafts. Continue?')) {
      try {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
      } catch (error) {
        toast.error('Failed to clear local data. Please try refreshing the page.');
      }
    }
  };

  // If we're in public view mode, show the public bulletin
  if (currentView === 'public') {
    return (
      <PublicBulletinView
        bulletinData={publicBulletinData}
        loading={false}
        error={publicError}
        onBackToEditor={handleBackToEditor}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-shadow no-underline" style={{ textDecoration: 'none' }}>
              <Logo size={40} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">MyWardBulletin</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm text-gray-600">Ward Bulletin Creator</p>
                  {currentProfileSlug && (
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium" title={`Currently viewing profile: ${currentProfileSlug}`}>
                      Profile: {currentProfileSlug}
                    </span>
                  )}
                </div>
              </div>
            </a>
            {/* Desktop/Menu/Sign In button remains outside the clickable logo area */}
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-3">
              <UnitTypeSelector />
              <button
                onClick={handleNewBulletin}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Bulletin
              </button>
              
              
              
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </button>


              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                title="Share your QR code"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Share
              </button>
              
              {user && pendingSubmissionsCount > 0 && (
                <button
                  onClick={() => setShowSubmissionReview(true)}
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors"
                  title="Review announcement submissions"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Review Submissions ({pendingSubmissionsCount})
                </button>
              )}
              
              
                {user ? (
                  <UserMenu
                    user={user}
                    onSignOut={async () => {
                      await supabase?.auth.signOut();
                    }}
                    onSaveBulletin={handleSaveBulletin}
                    onViewSavedBulletins={handleViewSavedBulletins}
                    hasUnsavedChanges={hasUnsavedChanges}
                    onOpenProfile={() => setShowProfile(true)}
                    onOpenReviewSubmissions={() => setShowSubmissionReview(true)}
                    onOpenProfileSharing={() => setShowProfileSharing(true)}
                    pendingSubmissionsCount={pendingSubmissionsCount}
                  />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                  title="Sign In"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </button>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-center">
                  <UnitTypeSelector />
                </div>
                <button
                  onClick={() => {
                    handleNewBulletin();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Bulletin
                </button>
                

                
                <button
                  onClick={() => {
                    handleExportPDF();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </button>
                

                
                <button
                  onClick={() => {
                    setShowQRCode(!showQRCode);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Share
                </button>
                
                {user ? (
                  <div className="space-y-2">
                    {pendingSubmissionsCount > 0 && (
                      <button
                        onClick={() => {
                          setShowSubmissionReview(true);
                          setShowMobileMenu(false);
                        }}
                        className="w-full flex items-center px-4 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Review Submissions ({pendingSubmissionsCount})
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleViewSavedBulletins();
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      My Bulletins
                    </button>
                      <button
                        onClick={async () => {
                          await supabase?.auth.signOut();
                          setShowMobileMenu(false);
                        }}
                        className="w-full flex items-center px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Create Your Bulletin</h2>
              <BulletinForm
                data={bulletinData}
                onChange={handleBulletinDataChange}
                profileSlug={currentProfileSlug || undefined}
                userId={user?.id}
                allImages={allImages}
                onImagesRefresh={loadAllImages}
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Bulletin Preview
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowPrintPreviewModal(true)}
                    className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors text-sm sm:text-base"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Print Preview</span>
                    <span className="sm:hidden">Print</span>
                  </button>
                  <button
                    onClick={() => setShowThemeModal(true)}
                    className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors text-sm sm:text-base"
                  >
                    <Paintbrush className="w-4 h-4 mr-2" />
                    {bulletinData.userTheme ? (
                      <>
                        <span className="hidden sm:inline">Theme: </span>
                        <span className="sm:hidden">Theme: </span>
                        <span style={{ fontFamily: themes.find(t => t.name === bulletinData.userTheme)?.fontFamily }}>
                          {bulletinData.userTheme.length > 8 ? bulletinData.userTheme.substring(0, 8) + '...' : bulletinData.userTheme}
                        </span>
                      </>
                    ) : (
                      'Theme'
                    )}
                  </button>
                </div>
              </div>
              {currentBulletinId && (
                <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2 mb-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    Saved Bulletin
                  </span>
                  {hasUnsavedChanges && (
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                      Unsaved Changes
                    </span>
                  )}
                </div>
              )}
              <div ref={bulletinRef}>
                <BulletinPreview
                  data={bulletinData}
                  allImages={allImages}
                  onImagePositionChange={(position) => {
                    // Only update if the position actually changed and is different from current
                    const currentPosition = bulletinData.imagePosition || { x: 50, y: 50 };
                    if (position.x !== currentPosition.x || position.y !== currentPosition.y) {
                      handleBulletinDataChange({
                        ...bulletinData,
                        imagePosition: position
                      });
                    }
                  }}
                  onImageOpacityChange={(opacity) => {
                    handleBulletinDataChange({
                      ...bulletinData,
                      imageOpacity: opacity
                    });
                  }}
                />
              </div>

              {/* New streamlined bulletin actions */}
              {user && (
                <div className="mt-6 flex justify-center">
                  <BulletinActions
                    user={user}
                    bulletinData={bulletinData}
                    onMakeActive={handleMakeActive}
                    onSaveAsTemplate={handleSaveAsTemplate}
                    loading={loading}
                    currentStatus={
                      (currentBulletinId && currentBulletinId === activeBulletinId) 
                        ? 'active' 
                        : (bulletinData.status || 'draft')
                    }
                  />
                </div>
              )}

              {/* Save Bulletin button */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleSaveBulletin}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  title="Save this bulletin to your collection"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Saving...' : (currentBulletinId ? 'Update Bulletin' : 'Save Bulletin')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQRCode && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowQRCode(false);
              }
            }}
          >
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Share</h3>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
                {user ? (
                  <QRCodeGenerator
                    currentActiveBulletinId={activeBulletinId}
                    onActiveBulletinSelect={handleActiveBulletinSelect}
                    currentProfileSlug={currentProfileSlug}
                    onProfileChange={handleProfileChange}
                    onCreateProfileSlug={() => setShowCreateProfileSlug(true)}
                    onProfileSlugUpdate={() => {
                      // Refresh the profile data in SessionContext when profile slug is updated
                      if (refreshProfile) {
                        refreshProfile();
                      }
                    }}
                    onProfileUpdate={() => {
                      // Refresh the profile data when profile is updated
                      if (refreshProfile) {
                        refreshProfile();
                      }
                    }}
                    onLoadBulletin={handleLoadSavedBulletin}
                    onDeleteBulletin={handleDeleteSavedBulletin}
                    isOpen={showQRCode}
                  />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Sign in to create your permanent QR code</p>
                  <button onClick={() => setShowAuthModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">Sign In</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            setAuthModalMode(undefined);
            setAuthModalPrefillEmail(undefined);
          }}
          onAuthSuccess={async () => {
            setShowAuthModal(false);
            setAuthModalMode(undefined);
            setAuthModalPrefillEmail(undefined);
            const draft = await robustService.restoreDraftAfterAuth();
            if (draft) {
              setBulletinData(draft);
              await handleSaveBulletin();
            }
          }}
          mode={authModalMode}
          prefillEmail={authModalPrefillEmail}
        />

        {/* Saved Bulletins Modal */}
        <SavedBulletinsModal
          isOpen={showSavedBulletins}
          onClose={() => setShowSavedBulletins(false)}
          onLoadBulletin={handleLoadSavedBulletin}
          onDeleteBulletin={handleDeleteSavedBulletin}
          profileSlug={currentProfileSlug || profile?.profile_slug || undefined}
          onActiveBulletinChange={handleActiveBulletinSelect}
          currentActiveBulletinId={activeBulletinId || undefined}
        />

        {/* Templates Modal */}
        <TemplatesModal
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          onSelect={handleTemplateSelect}
        />

        <ThemeModal
          isOpen={showThemeModal}
          onClose={() => setShowThemeModal(false)}
          onSelectTheme={(theme) => {
            handleBulletinDataChange({ ...bulletinData, userTheme: theme.name });
            setShowThemeModal(false);
          }}
          currentUserTheme={bulletinData.userTheme}
        />

        {/* Profile Modal */}
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          user={user}
          onProfileUpdate={() => {
            // Optionally refresh user data or show success message
          }}
        />

        {/* Scheduler Modal */}
        <BulletinScheduler
          isOpen={showScheduler}
          onClose={() => setShowScheduler(false)}
          onSchedule={handleScheduleBulletin}
        />

        {/* Profile Sharing Modal */}
        <ProfileSharingModal
          isOpen={showProfileSharing}
          onClose={() => setShowProfileSharing(false)}
          profileSlug={currentProfileSlug || ''}
        />

        {/* Changelog Modal */}
        <ChangelogModal
          isOpen={showChangelog}
          onClose={handleCloseChangelog}
        />

        {/* Submission Review Modal */}
        <SubmissionReviewModal
          isOpen={showSubmissionReview}
          onClose={() => setShowSubmissionReview(false)}
          profileSlug={currentProfileSlug || ''}
          onSubmissionApproved={(submission) => {
            // Convert submission to announcement format
            const newAnnouncement = {
              id: Date.now().toString(),
              title: submission.title,
              content: submission.content,
              category: submission.category,
              audience: submission.audience,
              date: submission.date
            };

            // Check if announcement already exists to prevent duplication
            setBulletinData(prev => {
              const existingAnnouncement = prev.announcements.find(
                ann => ann.title === submission.title && ann.content === submission.content
              );
              
              if (existingAnnouncement) {
                toast.info(`"${submission.title}" already exists in the bulletin`);
                return prev;
              }

              // Add to current bulletin
              return {
                ...prev,
                announcements: [...prev.announcements, newAnnouncement]
              };
            });

            // Show success toast
            if (submission.title.trim()) {
              toast.success(`"${submission.title}" has been approved and added to the ${submission.audience.replace('_', ' ')} section!`);
            } else {
              // This is a consolidated announcement
              toast.success(`${submission.audience.replace('_', ' ')} announcements have been consolidated and added to the bulletin!`);
            }
          }}
          onSubmissionRejected={(submission) => {
            // Show rejection toast
            toast.success(`"${submission.title}" has been rejected`);
          }}
          onSubmissionsChanged={checkPendingSubmissions}
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          variant={confirmationModal.variant}
        />

        <PrintPreviewModal
          isOpen={showPrintPreviewModal}
          onClose={() => setShowPrintPreviewModal(false)}
          bulletinData={bulletinData}
          onUpdateData={handleBulletinDataChange}
        />

        {/* Hidden print layout for PDF export */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <BulletinPrintLayout
            data={{
              ...bulletinData,
              profileSlug: currentProfileSlug || 'your-profile-slug'
            }}
            refs={{ page1: printPage1Ref, page2: printPage2Ref }}
          />
        </div>
        {/* Create Profile Slug Modal */}
        {showCreateProfileSlug && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Create Profile Slug</h3>
              <p className="text-sm text-gray-600 mb-4">
                A profile slug is a unique identifier for your profile (e.g., "sunset-hills-ward").
                This will be used in URLs and for sharing your profile with others.
              </p>
              <input
                type="text"
                value={newProfileSlug}
                onChange={(e) => setNewProfileSlug(e.target.value)}
                placeholder="Enter profile slug (e.g., sunset-hills-ward)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCreateProfileSlug(false);
                    setNewProfileSlug('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProfileSlug}
                  disabled={!newProfileSlug.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              MyWardBulletin.com - Free Ward Bulletin Creator
            </p>

            <nav className="mt-4 space-x-4">
              <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="/how-to-use" className="text-gray-600 hover:text-gray-900">How To Use</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </footer>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default EditorApp;
