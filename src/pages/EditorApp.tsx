import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, QrCode, LogIn, Menu, X, MessageSquare } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase, isSupabaseConfigured, userService, bulletinService, robustService, retryOperation } from '../lib/supabase';
import BulletinForm from '../components/BulletinForm';
import BulletinPreview from '../components/BulletinPreview';
import QRCodeGenerator from '../components/QRCodeGenerator';
import AuthModal from '../components/AuthModal';
import UserMenu from '../components/UserMenu';
import SavedBulletinsModal from '../components/SavedBulletinsModal';
import TemplatesModal from '../components/TemplatesModal';
import ProfileModal from '../components/ProfileModal';
import PublicBulletinView from '../components/PublicBulletinView';
import SubmissionReviewModal from '../components/SubmissionReviewModal';
import ConfirmationModal from '../components/ConfirmationModal';
import CustomizationTest from '../components/CustomizationTest';
import { BulletinData } from '../types/bulletin';
import templateService, { Template } from '../lib/templateService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Logo from '../components/Logo';
import BulletinPrintLayout from '../components/BulletinPrintLayout';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { useSession } from '../lib/SessionContext';
import { handleError, NetworkError, DatabaseError, withErrorHandling, withRetry } from '../lib/errorHandler';


function decodeJwtExp(token: string) {
  try {
    const decoded = jwtDecode<JwtPayload & { exp?: number }>(token);
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch (e) {
    console.error('[DEBUG] Failed to decode JWT:', e);
    return null;
  }
}

function EditorApp() {
  const [currentView, setCurrentView] = useState<'editor' | 'public'>('editor');
  const [publicBulletinData, setPublicBulletinData] = useState<any>(null);
  const [publicError, setPublicError] = useState('');
  const { user, profile } = useSession();
  const [activeBulletinId, setActiveBulletinId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setActiveBulletinId(profile.active_bulletin_id || null);
    } else {
      setActiveBulletinId(null);
    }
  }, [profile]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSavedBulletins, setShowSavedBulletins] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSubmissionReview, setShowSubmissionReview] = useState(false);
  const [pendingSubmissionsCount, setPendingSubmissionsCount] = useState(0);
  const [currentBulletinId, setCurrentBulletinId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCustomizationTest, setShowCustomizationTest] = useState(false);
  
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
    'wardName' | 'presiding' | 'conducting' | 'chorister' | 'organist' | 'wardLeadership' | 'missionaries',
    string
  > = {
    wardName: 'default_wardName',
    presiding: 'default_presiding',
    conducting: 'default_conducting',
    chorister: 'default_chorister',
    organist: 'default_organist',
    wardLeadership: 'default_wardLeadership',
    missionaries: 'default_missionaries',
  };
  function getDefault<K extends keyof typeof DEFAULT_KEYS, T>(key: K, fallback: T): T {
    try {
      const val = localStorage.getItem(DEFAULT_KEYS[key]);
      if (val) {
        if (key === 'wardLeadership' || key === 'missionaries') {
          try { return JSON.parse(val) as T; } catch { return fallback; }
        }
        return val as T;
      }
      return fallback;
    } catch (e) {
      // Only clear localStorage if there's an actual error, not proactively
      console.error('localStorage error:', e);
      return fallback;
    }
  }

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

  function createBlankBulletin(): BulletinData {
    return {
      wardName: getDefault('wardName', ''),
      date: new Date().toISOString().split('T')[0],
      meetingType: 'sacrament',
      theme: '',
      bishopricMessage: '',
      announcements: [],
      meetings: [],
      specialEvents: [],
      agenda: [
        { type: 'sacrament', id: crypto.randomUUID() }
      ],
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
        organistLabel: 'Organist'
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
      customization: {
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        accentColor: '#10b981',
        fontFamily: 'serif',
        headerFontSize: 'large',
        bodyFontSize: 'medium',
        theme: 'classic',
        showBranding: true,
        headerStyle: 'centered',
        spacing: 'normal'
      }
    };
  }

  // Use a function to initialize bulletinData from localStorage defaults
  const [bulletinData, setBulletinData] = useState<BulletinData>(() => createBlankBulletin());

  const [showQRCode, setShowQRCode] = useState(false);
  const bulletinRef = useRef<HTMLDivElement>(null);
  const printPage1Ref = useRef<HTMLDivElement>(null);
  const printPage2Ref = useRef<HTMLDivElement>(null);

  // Add a helper for draft key
  const DRAFT_KEY = 'draft_bulletin';

  // Restore any saved draft on initial load
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as BulletinData;
        setBulletinData(parsed);
        setHasUnsavedChanges(true);
      } catch (e) {
        console.error('Failed to parse saved draft:', e);
      }
    }
  }, []);

  // If no draft exists, load any active template on initial load
  useEffect(() => {
    const hasDraft = !!localStorage.getItem(DRAFT_KEY);
    if (hasDraft) return;
    const activeId = templateService.getActiveTemplateId();
    if (activeId) {
      const tmpl = templateService.getTemplate(activeId);
      if (tmpl) {
        setBulletinData(tmpl.data);
        setHasUnsavedChanges(false);
        return;
      }
    }
    setBulletinData(createBlankBulletin());
    setHasUnsavedChanges(false);
  }, []);

  // When returning to the page (e.g. after switching apps) re-check the session
  // and restore any draft from localStorage. This effect listens for focus,
  // visibilitychange, and pageshow so the draft is restored without needing
  // a manual refresh on mobile browsers like Safari.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft) as BulletinData;
            setBulletinData(parsed);
            setHasUnsavedChanges(true);
          } catch (err) {
            console.error('Failed to restore draft:', err);
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    window.addEventListener('pageshow', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      window.removeEventListener('pageshow', handleVisibility);
    };
  }, []);

  const convertDbBulletinToData = (bulletin: any): BulletinData => ({
    wardName: bulletin.ward_name,
    date: bulletin.date,
    meetingType: bulletin.meeting_type,
    theme: bulletin.theme || '',
    bishopricMessage: bulletin.bishopric_message || '',
    announcements: bulletin.announcements || [],
    meetings: bulletin.meetings || [],
    specialEvents: bulletin.special_events || [],
    agenda: ensureSacramentItem(bulletin.agenda || []),
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
      organist: '',
      organistLabel: 'Organist'
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
    customization: bulletin.customization || {
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      accentColor: '#10b981',
      fontFamily: 'serif',
      headerFontSize: 'large',
      bodyFontSize: 'medium',
      theme: 'classic',
      showBranding: true,
      headerStyle: 'centered',
      spacing: 'normal'
    }
  });

  const handleBulletinDataChange = (newData: BulletinData) => {
    setBulletinData(newData);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(newData));
    setHasUnsavedChanges(true);
  };



  useEffect(() => {
    (async () => {
      if (!supabase) {
        console.error('[DEBUG] Supabase is null!');
        return;
      }
      const { data, error } = await supabase.auth.getSession();
      console.log('[DEBUG] On app load: Supabase session:', data?.session);
      console.log('[DEBUG] On app load: Supabase user:', data?.session?.user);
      if (error) {
        console.error('[DEBUG] On app load: Supabase session error:', error);
      }
      // Security: Removed debug logging of localStorage contents
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
      console.log('[DEBUG] JWT expiration check:', { exp: new Date(exp).toISOString(), msLeft });
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

  // Load active bulletin on startup (do not automatically load latest)
  useEffect(() => {
    const fetchInitialBulletin = async () => {
      if (!user || !isSupabaseConfigured()) return;
      if (currentBulletinId || hasUnsavedChanges) return;
      const bulletinId = activeBulletinId;
      try {
        if (bulletinId) {
          const bulletin = await bulletinService.getBulletinById(bulletinId);
          const data = convertDbBulletinToData(bulletin);
          setBulletinData(data);
          setCurrentBulletinId(bulletin.id);
          setHasUnsavedChanges(false);
        }
      } catch (err) {
        console.error('Failed to load initial bulletin:', err);
      }
    };
    fetchInitialBulletin();
  }, [user, activeBulletinId]);

  const handleBackToEditor = () => {
    setCurrentView('editor');
    setPublicBulletinData(null);
    setPublicError('');
    // Update URL to home
    window.history.pushState({}, '', '/');
  };

  const handleSaveBulletin = async () => {
    if (!isSupabaseConfigured()) {
      toast.error('Please connect to Supabase first to save bulletins.');
      return;
    }
    if (!user) {
      // Save draft before showing auth modal
      await robustService.saveDraftBeforeAuth(bulletinData);
      setShowAuthModal(true);
      return;
    }
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session) {
        console.error('Session refresh failed:', error);
        toast.error('Session expired. Please sign in again.');
        setShowAuthModal(true);
        return;
      }
    } catch (err) {
      console.error('Session refresh error:', err);
      toast.error('Session expired. Please sign in again.');
      setShowAuthModal(true);
      return;
    }
    setLoading(true);
    console.log('[DEBUG] Save attempt started');
    const SAVE_TIMEOUT_MS = 10000;
    let timeoutHandle: NodeJS.Timeout | null = null;
    let didTimeout = false;
    try {
      const savePromise = (async () => {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.log('[DEBUG] On save: Supabase session:', sessionData?.session);
        if (sessionError) {
          console.error('[DEBUG] On save: Supabase session error:', sessionError);
        }
        const savedBulletin = await retryOperation(() => bulletinService.saveBulletin(
          bulletinData,
          user.id,
          currentBulletinId || undefined
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
      setCurrentBulletinId(savedBulletin.id);
      setHasUnsavedChanges(false);
      toast.success(currentBulletinId ? 'Bulletin updated successfully!' : 'Bulletin saved successfully!', {
        toastId: 'bulletin-save-success'
      });
      console.log('[DEBUG] Save attempt finished successfully');
    } catch (error) {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      if (didTimeout) {
        console.error('[DEBUG] Save attempt timed out');
        toast.error('Saving took too long. Please check your connection or try again.');
      } else {
        console.error('[DEBUG] On save: error:', error);
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
        console.error('Local save also failed:', localError);
        toast.error('Error saving bulletin: ' + (error as Error).message);
      }
    } finally {
      setLoading(false);
      console.log('[DEBUG] Save attempt ended');
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
            agenda: ensureSacramentItem(bulletin.agenda || []),
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
            missionaries: bulletin.missionaries || []
          };

          setBulletinData(loadedData);
          setCurrentBulletinId(bulletin.id);
          setHasUnsavedChanges(false);
          setShowSavedBulletins(false);
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
      agenda: ensureSacramentItem(bulletin.agenda || []),
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
      missionaries: bulletin.missionaries || []
    };

    setBulletinData(loadedData);
    setCurrentBulletinId(bulletin.id);
    setHasUnsavedChanges(false);
    setShowSavedBulletins(false);
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

  // Check for pending submissions
  const checkPendingSubmissions = async () => {
    if (!supabase || !profile?.profile_slug) return;
    
    try {
      const { data, error } = await supabase
        .from('announcement_submissions')
        .select('id')
        .eq('profile_slug', profile.profile_slug)
        .eq('status', 'pending');
      
      if (!error && data) {
        setPendingSubmissionsCount(data.length);
      }
    } catch (error) {
      console.error('Error checking pending submissions:', error);
    }
  };

  // Check for pending submissions when user or profile changes
  useEffect(() => {
    if (user && profile?.profile_slug) {
      checkPendingSubmissions();
    } else {
      setPendingSubmissionsCount(0);
    }
  }, [user, profile?.profile_slug]);

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
      await userService.updateActiveBulletinId(user.id, bulletinId);
      setActiveBulletinId(bulletinId);
    } catch (error) {
      console.error('Error updating active bulletin:', error);
      toast.error('Error updating active bulletin: ' + (error as Error).message);
    }
  };

  const handleExportPDF = async () => {
    if (printPage1Ref.current && printPage2Ref.current) {
      try {
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
        console.error('Error generating PDF:', error);
        toast.error('There was an error generating the PDF. Please try again.');
      }
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
        console.error('Failed to clear local data:', error);
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
                <p className="text-sm text-gray-600">Ward Bulletin Creator</p>
              </div>
            </a>
            {/* Desktop/Menu/Sign In button remains outside the clickable logo area */}
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-3">
              <button
                onClick={handleNewBulletin}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Bulletin
              </button>
              
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </button>
              

              
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title="Share your QR code"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Share
              </button>
              
              {user && pendingSubmissionsCount > 0 && (
                <button
                  onClick={() => setShowSubmissionReview(true)}
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  title="Review announcement submissions"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Review Submissions ({pendingSubmissionsCount})
                </button>
              )}
              
              <button
                onClick={() => setShowCustomizationTest(true)}
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                title="Test customization functionality"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Test Customization
              </button>
              
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
                    pendingSubmissionsCount={pendingSubmissionsCount}
                  />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
                <button
                  onClick={() => {
                    handleNewBulletin();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Bulletin
                </button>
                
                <button
                  onClick={() => {
                    handleExportPDF();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </button>
                

                
                <button
                  onClick={() => {
                    setShowQRCode(!showQRCode);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
                        className="w-full flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
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
                      className="w-full flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      My Bulletins
                    </button>
                      <button
                        onClick={async () => {
                          await supabase?.auth.signOut();
                          setShowMobileMenu(false);
                        }}
                        className="w-full flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                    disabled={!isSupabaseConfigured()}
                    className="w-full flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {isSupabaseConfigured() ? 'Sign In' : 'Sign In (Setup Required)'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create Your Bulletin</h2>
              <BulletinForm data={bulletinData} onChange={handleBulletinDataChange} />
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                Bulletin Preview
                </h2>
                {currentBulletinId && (
                  <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2 mb-2">
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
              </div>
              <div ref={bulletinRef}>
                <BulletinPreview data={bulletinData} />
              </div>
              {user && currentBulletinId && activeBulletinId !== currentBulletinId && (
                <button
                  onClick={() => handleActiveBulletinSelect(currentBulletinId)}
                  className="mt-4 w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Set This Bulletin as QR Code Bulletin
                </button>
              )}
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                {user && (
                  <button
                    onClick={handleSaveBulletin}
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Saving...' : (currentBulletinId ? 'Update Bulletin' : 'Save Bulletin')}
                  </button>
                )}
                <button
                  onClick={() => {
                    const name = prompt('Template name?');
                    if (name) {
                      templateService.saveTemplate(name, bulletinData);
                      toast.success('Template saved');
                    }
                  }}
                  className="w-full sm:w-auto inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Save as Template
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
                {user && isSupabaseConfigured() ? (
                  <QRCodeGenerator
                    currentActiveBulletinId={activeBulletinId}
                    onActiveBulletinSelect={handleActiveBulletinSelect}
                    onProfileSlugUpdate={() => {
                      // Optionally refresh or show success message
                    }}
                    isOpen={showQRCode}
                  />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Sign in to create your permanent QR code</p>
                  <button onClick={() => setShowAuthModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Sign In</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={async () => {
            setShowAuthModal(false);
            const draft = await robustService.restoreDraftAfterAuth();
            if (draft) {
              setBulletinData(draft);
              await handleSaveBulletin();
            }
          }}
        />

        {/* Saved Bulletins Modal */}
        <SavedBulletinsModal
          isOpen={showSavedBulletins}
          onClose={() => setShowSavedBulletins(false)}
          onLoadBulletin={handleLoadSavedBulletin}
          onDeleteBulletin={handleDeleteSavedBulletin}
        />

        {/* Templates Modal */}
        <TemplatesModal
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          onSelect={handleTemplateSelect}
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

        {/* Submission Review Modal */}
        <SubmissionReviewModal
          isOpen={showSubmissionReview}
          onClose={() => setShowSubmissionReview(false)}
          profileSlug={profile?.profile_slug || ''}
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

        {/* Customization Test Modal */}
        {showCustomizationTest && (
          <CustomizationTest
            onClose={() => setShowCustomizationTest(false)}
          />
        )}

        {/* Hidden print layout for PDF export */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <BulletinPrintLayout
            data={{
              ...bulletinData,
              profileSlug: profile?.profile_slug || 'your-profile-slug'
            }}
            refs={{ page1: printPage1Ref, page2: printPage2Ref }}
          />
        </div>
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
