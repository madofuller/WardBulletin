import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, QrCode, User, LogIn, Menu, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase, isSupabaseConfigured, userService, bulletinService, robustService, retryOperation, localStorageService } from './lib/supabase';
import BulletinForm from './components/BulletinForm';
import BulletinPreview from './components/BulletinPreview';
import QRCodeGenerator from './components/QRCodeGenerator';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import SavedBulletinsModal from './components/SavedBulletinsModal';
import ProfileModal from './components/ProfileModal';
import PublicBulletinView from './components/PublicBulletinView';
import { BulletinData } from './types/bulletin';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useQuery } from '@tanstack/react-query';
import Logo from './components/Logo';
import BulletinPrintLayout from './components/BulletinPrintLayout';
import { jwtDecode, JwtPayload } from 'jwt-decode';


function decodeJwtExp(token: string) {
  try {
    const decoded = jwtDecode<JwtPayload & { exp?: number }>(token);
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch (e) {
    console.error('[DEBUG] Failed to decode JWT:', e);
    return null;
  }
}

function App() {
  const [currentView, setCurrentView] = useState<'editor' | 'public'>('editor');
  const [publicBulletinData, setPublicBulletinData] = useState<any>(null);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [activeBulletinId, setActiveBulletinId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSavedBulletins, setShowSavedBulletins] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentBulletinId, setCurrentBulletinId] = useState<string | null>(null);
  const [savedBulletins, setSavedBulletins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);


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

  // Use a function to initialize bulletinData from localStorage defaults
  const [bulletinData, setBulletinData] = useState<BulletinData>(() => ({
    wardName: getDefault('wardName', ''),
    date: new Date().toISOString().split('T')[0],
    meetingType: 'sacrament',
    theme: '',
    bishopricMessage: '',
    announcements: [],
    meetings: [],
    specialEvents: [],
    agenda: [],
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
      organist: getDefault('organist', '')
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
    missionaries: getDefault('missionaries', [])
  }));

  const [showQRCode, setShowQRCode] = useState(false);
  const bulletinRef = useRef<HTMLDivElement>(null);
  const printPage1Ref = useRef<HTMLDivElement>(null);
  const printPage2Ref = useRef<HTMLDivElement>(null);

  // Add a helper for draft key
  const DRAFT_KEY = 'draft_bulletin';

  const convertDbBulletinToData = (bulletin: any): BulletinData => ({
    wardName: bulletin.ward_name,
    date: bulletin.date,
    meetingType: bulletin.meeting_type,
    theme: bulletin.theme || '',
    bishopricMessage: bulletin.bishopric_message || '',
    announcements: bulletin.announcements || [],
    meetings: bulletin.meetings || [],
    specialEvents: bulletin.special_events || [],
    agenda: bulletin.agenda || [],
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
      { title: "Young Women's President", name: '', phone: '' },
      { title: 'Primary President', name: '', phone: '' },
      { title: 'Sunday School President', name: '', phone: '' },
      { title: 'Ward Mission Leader', name: '', phone: '' },
      { title: 'Building Representative', name: '', phone: '' },
      { title: 'Temple & Family History', name: '', phone: '' }
    ],
    missionaries: bulletin.missionaries || []
  });

  const handleBulletinDataChange = (newData: BulletinData) => {
    setBulletinData(newData);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(newData));
    setHasUnsavedChanges(true);
  };

  // Check for profile slug in URL
  const path = window.location.pathname;
  const profileSlugMatch = path.match(/^\/u\/([^\/]+)$/);
  const profileSlug = profileSlugMatch ? profileSlugMatch[1] : null;

  // Use React Query for public bulletin loading
  const {
    data: publicBulletin,
    isLoading: publicBulletinLoading,
    error: publicErrorObj
  } = useQuery({
    queryKey: ['public-bulletin', profileSlug],
    queryFn: () => profileSlug ? bulletinService.getLatestBulletinByProfileSlug(profileSlug) : Promise.resolve(null),
    enabled: !!profileSlug
  });

  // If on a public slug, show loading, public view, or error only
  if (profileSlug) {
    if (publicBulletinLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bulletin...</p>
          </div>
        </div>
      );
    }
    return (
      <PublicBulletinView
        bulletinData={publicBulletin ? {
          wardName: publicBulletin.ward_name || '',
          date: publicBulletin.date || '',
          meetingType: publicBulletin.meeting_type || '',
          theme: publicBulletin.theme || '',
          bishopricMessage: publicBulletin.bishopric_message || '',
          announcements: publicBulletin.announcements || [],
          meetings: publicBulletin.meetings || [],
          specialEvents: publicBulletin.special_events || [],
          agenda: publicBulletin.agenda || [],
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
        } : null}
        loading={publicBulletinLoading}
        error={publicErrorObj ? (publicErrorObj.message || 'Bulletin not found') : ''}
        onBackToEditor={() => {
          window.location.href = '/';
        }}
      />
    );
  }

  // Check for existing session on mount
  useEffect(() => {
    const initializeApp = async () => {
      if (isSupabaseConfigured() && supabase) {
        try {
          // Test connection first
          const isConnected = await robustService.testAndRecoverConnection();
          if (!isConnected) {
            console.warn('Supabase connection failed, using local storage only');
            return;
          }
          // Validate session
          const session = await robustService.validateSession();
          setUser(session?.user ?? null);
          if (session?.user) {
            try {
              const profile = await retryOperation(() => userService.getUserProfile(session.user.id));
              if (profile && profile.length > 0) {
                setActiveBulletinId(profile[0].active_bulletin_id || null);
              }
              // Restore any pending draft
              const restoredDraft = await robustService.restoreDraftAfterAuth();
              if (restoredDraft) {
                setBulletinData(restoredDraft);
                setHasUnsavedChanges(true);
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          } else {
            setActiveBulletinId(null);
          }
        } catch (error) {
          console.error('App initialization error:', error);
        }
      }
    };
    initializeApp();
  }, []);

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
      // Log all localStorage keys and values
      console.log('[DEBUG] On app load: localStorage dump:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          console.log(`  [localStorage] ${key}:`, localStorage.getItem(key));
        }
      }
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

  // Enhanced auth state change handler
  React.useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        try {
          const profile = await retryOperation(() => userService.getUserProfile(session.user.id));
          if (profile && profile.length > 0) {
            setActiveBulletinId(profile[0].active_bulletin_id || null);
          }
          // Restore draft after sign in
          const restoredDraft = await robustService.restoreDraftAfterAuth();
          if (restoredDraft) {
            setBulletinData(restoredDraft);
            setHasUnsavedChanges(true);
          }
        } catch (error) {
          console.error('Error after sign in:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setActiveBulletinId(null);
      }
    });
    return () => subscription.unsubscribe();
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

  // Load active or latest bulletin on startup
  useEffect(() => {
    const fetchInitialBulletin = async () => {
      if (!user || !isSupabaseConfigured()) return;
      if (currentBulletinId || hasUnsavedChanges) return;
      let bulletinId = activeBulletinId;
      try {
        if (!bulletinId) {
          const bulletins = await bulletinService.getUserBulletins(user.id);
          if (bulletins && bulletins.length > 0) {
            bulletinId = bulletins[0].id;
          }
        }
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
      if (!confirm('You have unsaved changes. Loading this bulletin will discard them. Continue?')) {
        return;
      }
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
      agenda: bulletin.agenda || [],
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

  const handleDeleteSavedBulletin = (bulletinId: string) => {
    // If we're currently editing the deleted bulletin, clear the current ID
    if (currentBulletinId === bulletinId) {
      setCurrentBulletinId(null);
      setHasUnsavedChanges(true); // Mark as unsaved since the saved version is gone
    }
  };

  const handleNewBulletin = () => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Creating a new bulletin will discard them. Continue?')) {
        return;
      }
    }

    // Load defaults from localStorage if present
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

    setBulletinData({
      wardName: getDefault('wardName', ''),
      date: new Date().toISOString().split('T')[0],
      meetingType: 'sacrament',
      theme: '',
      bishopricMessage: '',
      announcements: [],
      meetings: [],
      specialEvents: [],
      agenda: [],
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
        organist: getDefault('organist', '')
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
      missionaries: getDefault('missionaries', [])
    });
    setCurrentBulletinId(null);
    setHasUnsavedChanges(false);
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
        // Render page 1
        const canvas1 = await html2canvas(printPage1Ref.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: printPage1Ref.current.scrollWidth,
          height: printPage1Ref.current.scrollHeight
        });
        // Render page 2
        const canvas2 = await html2canvas(printPage2Ref.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: printPage2Ref.current.scrollWidth,
          height: printPage2Ref.current.scrollHeight
        });
        const imgData1 = canvas1.toDataURL('image/png');
        const imgData2 = canvas2.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        // Page 1
        const ratio1 = Math.min(pdfWidth / canvas1.width, pdfHeight / canvas1.height);
        const imgX1 = (pdfWidth - canvas1.width * ratio1) / 2;
        const imgY1 = 10;
        pdf.addImage(imgData1, 'PNG', imgX1, imgY1, canvas1.width * ratio1, canvas1.height * ratio1);
        // Page 2
        pdf.addPage('a4', 'landscape');
        const ratio2 = Math.min(pdfWidth / canvas2.width, pdfHeight / canvas2.height);
        const imgX2 = (pdfWidth - canvas2.width * ratio2) / 2;
        const imgY2 = 10;
        pdf.addImage(imgData2, 'PNG', imgX2, imgY2, canvas2.width * ratio2, canvas2.height * ratio2);
        const filename = `${bulletinData.wardName || 'Ward'}-Bulletin-${bulletinData.date || 'today'}.pdf`;
        pdf.save(filename);
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
        loading={publicBulletinLoading}
        error={publicError}
        onBackToEditor={handleBackToEditor}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar={true} />
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size={40} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ZionBoard</h1>
                <p className="text-sm text-gray-600">Ward Bulletin Creator</p>
              </div>
            </div>
            
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
              
              {user && (
                <button
                  onClick={handleSaveBulletin}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                onClick={() => setShowQRCode(!showQRCode)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title="Manage your permanent QR code"
              >
                <QrCode className="w-4 h-4 mr-2" />
                My QR Code
              </button>
              
              {user ? (
                <UserMenu 
                  user={user}
                  onSignOut={() => setUser(null)}
                  onSaveBulletin={handleSaveBulletin}
                  onViewSavedBulletins={handleViewSavedBulletins}
                  hasUnsavedChanges={hasUnsavedChanges}
                  onOpenProfile={() => setShowProfile(true)}
                />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  disabled={!isSupabaseConfigured()}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  title={!isSupabaseConfigured() ? 'Connect to Supabase first' : 'Sign In'}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {isSupabaseConfigured() ? 'Sign In' : 'Sign In (Setup Required)'}
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
                
                {user && (
                  <button
                    onClick={() => {
                      handleSaveBulletin();
                      setShowMobileMenu(false);
                    }}
                    disabled={loading}
                    className="w-full flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    setShowQRCode(!showQRCode);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  My QR Code
                </button>
                
                {user ? (
                  <div className="space-y-2">
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
                      onClick={() => {
                        setUser(null);
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
                <button
                  onClick={handleExportPDF}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm ml-2"
                  title="Export as PDF"
                >
                  <Download className="w-4 h-4 mr-1" /> Export PDF
                </button>
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
                <h3 className="text-xl font-semibold text-gray-900">My Permanent QR Code</h3>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              {user && isSupabaseConfigured() ? (
                <QRCodeGenerator 
                  user={user}
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
          user={user}
          onLoadBulletin={handleLoadSavedBulletin}
          onDeleteBulletin={handleDeleteSavedBulletin}
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



        {/* Hidden print layout for PDF export */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <BulletinPrintLayout
            data={bulletinData}
            refs={{ page1: printPage1Ref, page2: printPage2Ref }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              ZionBoard.com - Free Ward Bulletin Creator
            </p>
            <p className="text-sm text-gray-500 mt-2">
              All data is processed locally in your browser for privacy and security
            </p>
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

export default App;