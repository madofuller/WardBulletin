import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Download, Printer, Plus, Trash2, Upload } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { getSongTitle, isValidSongNumber, searchSongsByTitle, preloadSongData, SongType } from '../lib/songService';
import { BulletinData, AgendaItem } from '../types/bulletin';
import BulletinPrintLayout from '../components/BulletinPrintLayout';
import Logo from '../components/Logo';
import { LDS_IMAGES } from '../data/images';

const loadPdfDeps = () => Promise.all([
  import('jspdf'),
  import('html2canvas'),
]);

function generateId() {
  return crypto.randomUUID();
}

function createBlankBaptismData(): BulletinData {
  return {
    wardName: '',
    date: (() => {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    })(),
    meetingType: 'baptism',
    theme: '',
    userTheme: '',
    bishopricMessage: '',
    announcements: [],
    meetings: [],
    specialEvents: [],
    agenda: [
      { type: 'speaker', id: generateId(), name: '', speakerType: 'adult', customLabel: 'Opening Remarks' },
      { type: 'speaker', id: generateId(), name: '', speakerType: 'adult', customLabel: 'Talk on Baptism' },
      { type: 'baptism_ordinance', id: generateId(), candidateName: '', performedBy: '' },
      { type: 'speaker', id: generateId(), name: '', speakerType: 'adult', customLabel: 'Talk on the Holy Ghost' },
      { type: 'musical', id: generateId(), label: 'Musical Number', songName: '' },
      { type: 'confirmation', id: generateId(), candidateName: '', performedBy: '' },
      { type: 'speaker', id: generateId(), name: '', speakerType: 'adult', customLabel: 'Welcome to Primary' },
      { type: 'speaker', id: generateId(), name: '', speakerType: 'adult', customLabel: 'Closing Remarks' },
    ],
    prayers: { opening: '', closing: '', invocation: '', benediction: '' },
    musicProgram: {
      openingHymn: '', openingHymnNumber: '', openingHymnTitle: '',
      sacramentHymn: '', sacramentHymnNumber: '', sacramentHymnTitle: '',
      closingHymn: '', closingHymnNumber: '', closingHymnTitle: '',
    },
    leadership: {
      presiding: '', conducting: '', chorister: '', organist: '',
      organistLabel: 'Pianist', choristerLabel: 'Chorister',
    },
    wardLeadership: [],
    missionaries: [],
    wardMissionaries: [],
    serviceMissionaries: [],
    imageId: 'none',
    imagePosition: { x: 50, y: 50 },
  };
}

function formatDate(dateString: string, locale: string = 'en'): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BaptismEditor() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const currentLang = i18n.language;
  const storageKey = `baptism-program:${slug || 'default'}`;

  const [data, setData] = useState<BulletinData>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return createBlankBaptismData();
  });
  const printPage1Ref = useRef<HTMLDivElement>(null);
  const printPage2Ref = useRef<HTMLDivElement>(null);

  // Hymn search state
  const [hymnSearchResults, setHymnSearchResults] = useState<Array<{ number: string; title: string; type: SongType }>>([]);
  const [activeHymnSearch, setActiveHymnSearch] = useState<string | null>(null);
  const [songTypes, setSongTypes] = useState<Record<string, SongType>>({
    openingHymn: 'hymn', closingHymn: 'hymn',
  });

  React.useEffect(() => { preloadSongData(currentLang); }, [currentLang]);

  // Persist data to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch { /* storage may be full or unavailable */ }
  }, [data, storageKey]);

  // Reload when slug changes (navigate between wards)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setData(JSON.parse(saved));
      else setData(createBlankBaptismData());
    } catch { setData(createBlankBaptismData()); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('form.pleaseSelectImageFile', 'Please select an image file.'));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error(t('form.imageMustBeUnder3Mb', 'Image must be under 3MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setData(prev => ({
        ...prev,
        imageId: `custom-${Date.now()}`,
        imageUrl: base64,
      }));
      toast.success(t('form.imageUploadedSuccessfully', 'Image uploaded successfully!'));
    };
    reader.onerror = () => toast.error(t('errors.failedToReadFile', 'Failed to read file.'));
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearData = () => {
    if (window.confirm(t('bulletin.clearBaptismProgramConfirm', 'Clear this baptism program and start fresh?'))) {
      localStorage.removeItem(storageKey);
      setData(createBlankBaptismData());
      toast.success(t('success.programCleared', 'Program cleared'));
    }
  };

  const updateField = useCallback((field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateLeadership = useCallback((field: string, value: string) => {
    setData(prev => ({ ...prev, leadership: { ...prev.leadership, [field]: value } }));
  }, []);

  const updateMusic = useCallback((field: string, value: string) => {
    setData(prev => ({ ...prev, musicProgram: { ...prev.musicProgram, [field]: value } }));
  }, []);

  const updatePrayer = useCallback((field: string, value: string) => {
    setData(prev => ({ ...prev, prayers: { ...prev.prayers, [field]: value } }));
  }, []);

  const updateAgendaItem = useCallback((id: string, updates: Record<string, any>) => {
    setData(prev => ({
      ...prev,
      agenda: prev.agenda.map(item => item.id === id ? { ...item, ...updates } : item),
    }));
  }, []);

  const removeAgendaItem = useCallback((id: string) => {
    setData(prev => ({ ...prev, agenda: prev.agenda.filter(item => item.id !== id) }));
  }, []);

  const moveAgendaItem = useCallback((index: number, direction: -1 | 1) => {
    setData(prev => {
      const newAgenda = [...prev.agenda];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= newAgenda.length) return prev;
      [newAgenda[index], newAgenda[newIndex]] = [newAgenda[newIndex], newAgenda[index]];
      return { ...prev, agenda: newAgenda };
    });
  }, []);

  const addAgendaItem = useCallback((type: AgendaItem['type']) => {
    setData(prev => {
      let newItem: AgendaItem;
      switch (type) {
        case 'speaker':
          newItem = { type: 'speaker', id: generateId(), name: '', speakerType: 'adult', customLabel: '' };
          break;
        case 'musical':
          newItem = { type: 'musical', id: generateId(), label: 'Musical Number', songName: '' };
          break;
        case 'baptism_ordinance':
          newItem = { type: 'baptism_ordinance', id: generateId(), candidateName: '', performedBy: '' };
          break;
        case 'confirmation':
          newItem = { type: 'confirmation', id: generateId(), candidateName: '', performedBy: '' };
          break;
        default:
          return prev;
      }
      return { ...prev, agenda: [...prev.agenda, newItem] };
    });
  }, []);

  // Hymn helpers
  const getSongTypeForField = (field: string) => songTypes[field] || 'hymn';
  const setSongType = (field: string, type: SongType) => setSongTypes(prev => ({ ...prev, [field]: type }));

  const handleHymnNumberChange = (field: string, value: string) => {
    const songType = getSongTypeForField(field);
    if (field === 'openingHymn') {
      updateMusic('openingHymnNumber', value);
      const title = getSongTitle(value, songType, currentLang);
      if (title) updateMusic('openingHymnTitle', title);
    } else if (field === 'closingHymn') {
      updateMusic('closingHymnNumber', value);
      const title = getSongTitle(value, songType, currentLang);
      if (title) updateMusic('closingHymnTitle', title);
    }
  };

  const handleHymnTitleSearch = (field: string, query: string) => {
    if (query.length < 2) { setHymnSearchResults([]); setActiveHymnSearch(null); return; }
    const results = searchSongsByTitle(query, getSongTypeForField(field), currentLang);
    setHymnSearchResults(results.slice(0, 10));
    setActiveHymnSearch(field);
  };

  const selectHymnFromSearch = (field: string, number: string, title: string, type: SongType) => {
    if (field === 'openingHymn') {
      updateMusic('openingHymnNumber', number);
      updateMusic('openingHymnTitle', title);
      updateMusic('openingHymnType', type);
    } else if (field === 'closingHymn') {
      updateMusic('closingHymnNumber', number);
      updateMusic('closingHymnTitle', title);
      updateMusic('closingHymnType', type);
    }
    setSongType(field, type);
    setHymnSearchResults([]);
    setActiveHymnSearch(null);
  };

  // PDF export
  const handleExportPDF = async () => {
    if (!printPage1Ref.current || !printPage2Ref.current) {
      toast.error(t('errors.pdfExportFailed', 'PDF export failed. Please try again.'));
      return;
    }
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const scale = 1.5;
      const marginY = 10;
      const [{ default: jsPDF }, { default: html2canvas }] = await loadPdfDeps();

      const canvas1 = await html2canvas(printPage1Ref.current, {
        scale, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false, removeContainer: true,
        width: printPage1Ref.current.scrollWidth, height: printPage1Ref.current.scrollHeight,
      });
      const canvas2 = await html2canvas(printPage2Ref.current, {
        scale, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false, removeContainer: true,
        width: printPage2Ref.current.scrollWidth, height: printPage2Ref.current.scrollHeight,
      });

      const imgData1 = canvas1.toDataURL('image/jpeg', 0.85);
      const imgData2 = canvas2.toDataURL('image/jpeg', 0.85);

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter', compress: true });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const ratio1 = Math.min(1, (pdfWidth) / canvas1.width, (pdfHeight - marginY * 2) / canvas1.height);
      pdf.addImage(imgData1, 'JPEG', (pdfWidth - canvas1.width * ratio1) / 2, marginY, canvas1.width * ratio1, canvas1.height * ratio1);

      pdf.addPage('letter', 'landscape');
      const ratio2 = Math.min(1, (pdfWidth) / canvas2.width, (pdfHeight - marginY * 2) / canvas2.height);
      pdf.addImage(imgData2, 'JPEG', (pdfWidth - canvas2.width * ratio2) / 2, marginY, canvas2.width * ratio2, canvas2.height * ratio2);

      const candidateName = data.agenda.find(i => i.type === 'baptism_ordinance')?.candidateName || 'Baptism';
      pdf.setDocumentProperties({ title: `${candidateName} - Baptism Program` });
      pdf.autoPrint();
      pdf.save(`Baptism-Program-${candidateName.replace(/\s+/g, '-')}.pdf`);
    } catch {
      toast.error(t('errors.pdfGenerationFailed', 'There was an error generating the PDF. Please try again.'));
    }
  };

  const candidateName = data.agenda.find(i => i.type === 'baptism_ordinance')?.candidateName || '';

  return (
    <>
      <Helmet>
        <title>{candidateName ? `Baptism of ${candidateName}` : 'Baptism Program'} | WardBulletin</title>
      </Helmet>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(slug ? `/profile/${slug}` : '/')} className="text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Logo />
            <span className="text-lg font-semibold text-gray-700">
              / Baptism Program{slug ? ` / ${slug}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearData}
              className="inline-flex items-center px-3 py-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium"
              title="Clear saved data"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Form */}
          <div className="space-y-6">
            {/* Date & Leadership */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('bulletin.programDetails', 'Program Details')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.date')}</label>
                  <input type="date" value={data.date} onChange={e => updateField('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                </div>
                {/* Image Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.bulletinImage')}</label>
                  {data.imageId && data.imageId !== 'none' ? (
                    <div className="flex items-center gap-3 p-2 border border-gray-300 rounded-lg bg-white mb-2">
                      <img src={data.imageUrl || LDS_IMAGES.find(i => i.id === data.imageId)?.url} alt="" className="w-10 h-10 object-cover rounded" />
                      <span className="flex-1 text-sm">
                        {data.imageId.startsWith('custom-') ? 'Uploaded image' : LDS_IMAGES.find(i => i.id === data.imageId)?.name}
                      </span>
                      <button type="button" onClick={() => setData(prev => ({ ...prev, imageId: 'none', imageUrl: undefined }))} className="text-red-500 hover:text-red-700 text-sm">{t('common.remove')}</button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-2">{t('form.noImageSelected')}</p>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <label className="flex-1 cursor-pointer inline-flex items-center justify-center px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  <details className="group">
                    <summary className="cursor-pointer p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-sm text-gray-700 font-medium">
                      Or choose a built-in image
                      <span className="float-right text-gray-400 group-open:rotate-180 transition-transform">&#9660;</span>
                    </summary>
                    <div className="mt-2 grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                      {LDS_IMAGES.filter(img => img.id !== 'none').map(image => (
                        <div key={image.id} onClick={() => setData(prev => ({ ...prev, imageId: image.id, imageUrl: undefined }))}
                          className={`cursor-pointer rounded-lg border-2 transition-all hover:scale-105 ${data.imageId === image.id ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 hover:border-gray-300'}`}
                          title={image.name}>
                          <img src={image.url} alt={image.name} className="w-full h-12 object-cover rounded-t" />
                          <p className="text-xs text-gray-700 truncate p-1">{image.name}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('bulletin.presiding')} & {t('bulletin.conducting')}</label>
                    <input type="text" value={data.leadership.presiding} onChange={e => updateLeadership('presiding', e.target.value)}
                      placeholder={t('form.presidingPlaceholder', 'e.g., Bishop Dave Smith')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.pianist')}</label>
                    <input type="text" value={data.leadership.organist} onChange={e => updateLeadership('organist', e.target.value)}
                      placeholder={t('form.pianistNamePlaceholder', 'Pianist name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.chorister')}</label>
                    <input type="text" value={data.leadership.chorister} onChange={e => updateLeadership('chorister', e.target.value)}
                      placeholder={t('form.choristerNamePlaceholder', 'Chorister name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                  </div>
                </div>
              </div>
            </div>

            {/* Hymns & Prayers */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Songs & Prayers</h2>
              <div className="space-y-4">
                {/* Opening Song */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('bulletin.openingHymn')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={data.musicProgram.openingHymnNumber} onChange={e => handleHymnNumberChange('openingHymn', e.target.value)}
                      placeholder="#" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                    <div className="col-span-2 relative">
                      <input type="text" value={data.musicProgram.openingHymnTitle}
                        onChange={e => { updateMusic('openingHymnTitle', e.target.value); handleHymnTitleSearch('openingHymn', e.target.value); }}
                        onFocus={() => { if (data.musicProgram.openingHymnTitle?.length >= 2) handleHymnTitleSearch('openingHymn', data.musicProgram.openingHymnTitle); }}
                        placeholder={t('form.searchHymnTitle', 'Search hymn title...')} readOnly={!!data.musicProgram.openingHymnNumber}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                      {activeHymnSearch === 'openingHymn' && hymnSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {hymnSearchResults.map(h => (
                            <button key={`${h.type}-${h.number}`} type="button" onClick={() => selectHymnFromSearch('openingHymn', h.number, h.title, h.type)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b last:border-b-0 text-sm">
                              #{h.number} - {h.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Opening Prayer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('bulletin.invocation')}</label>
                  <input type="text" value={data.prayers.opening} onChange={e => updatePrayer('opening', e.target.value)}
                    placeholder={t('form.openingPrayerPlaceholder', 'Opening prayer')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                </div>
                {/* Closing Song */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('bulletin.closingHymn')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={data.musicProgram.closingHymnNumber} onChange={e => handleHymnNumberChange('closingHymn', e.target.value)}
                      placeholder="#" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                    <div className="col-span-2 relative">
                      <input type="text" value={data.musicProgram.closingHymnTitle}
                        onChange={e => { updateMusic('closingHymnTitle', e.target.value); handleHymnTitleSearch('closingHymn', e.target.value); }}
                        onFocus={() => { if (data.musicProgram.closingHymnTitle?.length >= 2) handleHymnTitleSearch('closingHymn', data.musicProgram.closingHymnTitle); }}
                        placeholder={t('form.searchHymnTitle', 'Search hymn title...')} readOnly={!!data.musicProgram.closingHymnNumber}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                      {activeHymnSearch === 'closingHymn' && hymnSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {hymnSearchResults.map(h => (
                            <button key={`${h.type}-${h.number}`} type="button" onClick={() => selectHymnFromSearch('closingHymn', h.number, h.title, h.type)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b last:border-b-0 text-sm">
                              #{h.number} - {h.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Closing Prayer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('bulletin.benediction')}</label>
                  <input type="text" value={data.prayers.closing} onChange={e => updatePrayer('closing', e.target.value)}
                    placeholder={t('form.closingPrayerPlaceholder', 'Closing prayer')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                </div>
              </div>
            </div>

            {/* Agenda */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('bulletin.programAgenda', 'Program Agenda')}</h2>
              <div className="space-y-3">
                {data.agenda.map((item, idx) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    {item.type === 'speaker' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="text" value={item.customLabel || ''} onChange={e => updateAgendaItem(item.id, { customLabel: e.target.value })}
                            placeholder={t('form.roleLabelPlaceholder')}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                          <span className="text-gray-400 text-sm">&mdash;</span>
                          <input type="text" value={item.name || ''} onChange={e => updateAgendaItem(item.id, { name: e.target.value })}
                            placeholder={t('form.speakerName')}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                        </div>
                      </div>
                    )}
                    {item.type === 'musical' && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-green-700">{t('bulletin.musicalNumber')}</div>
                        <div className="grid grid-cols-3 gap-2">
                          <input type="text" value={item.hymnNumber || ''} onChange={e => {
                            updateAgendaItem(item.id, { hymnNumber: e.target.value });
                            const title = getSongTitle(e.target.value, 'hymn', currentLang);
                            if (title) updateAgendaItem(item.id, { hymnNumber: e.target.value, hymnTitle: title });
                          }}
                            placeholder={t('form.hymnNumber', 'Hymn #')} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                          <input type="text" value={item.hymnTitle || item.songName || ''} onChange={e => updateAgendaItem(item.id, { songName: e.target.value, hymnTitle: '' })}
                            placeholder={t('form.songName', 'Song Name')} className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            readOnly={!!item.hymnNumber} />
                        </div>
                        <input type="text" value={item.performers || ''} onChange={e => updateAgendaItem(item.id, { performers: e.target.value })}
                          placeholder={t('form.performerPlaceholder')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                      </div>
                    )}
                    {item.type === 'baptism_ordinance' && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-cyan-700 uppercase">{t('bulletin.baptismOf')}...</div>
                        <input type="text" value={item.candidateName || ''} onChange={e => updateAgendaItem(item.id, { candidateName: e.target.value })}
                          placeholder={t('form.candidateNamePlaceholder')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                        <input type="text" value={item.performedBy || ''} onChange={e => updateAgendaItem(item.id, { performedBy: e.target.value })}
                          placeholder={t('form.performedByPlaceholder')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                      </div>
                    )}
                    {item.type === 'confirmation' && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-teal-700 uppercase">{t('bulletin.confirmationOf')}...</div>
                        <input type="text" value={item.candidateName || ''} onChange={e => updateAgendaItem(item.id, { candidateName: e.target.value })}
                          placeholder={t('form.candidateNamePlaceholder')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                        <input type="text" value={item.performedBy || ''} onChange={e => updateAgendaItem(item.id, { performedBy: e.target.value })}
                          placeholder={t('form.performedByPlaceholder')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
                      </div>
                    )}
                    {/* Move / Remove controls */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                      <button onClick={() => moveAgendaItem(idx, -1)} disabled={idx === 0}
                        className="px-2 py-1 text-gray-500 hover:text-black disabled:opacity-30 text-sm">Up</button>
                      <button onClick={() => moveAgendaItem(idx, 1)} disabled={idx === data.agenda.length - 1}
                        className="px-2 py-1 text-gray-500 hover:text-black disabled:opacity-30 text-sm">Down</button>
                      <button onClick={() => removeAgendaItem(item.id)}
                        className="ml-auto px-2 py-1 text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Add buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button type="button" onClick={() => addAgendaItem('speaker')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4 inline mr-1" />{t('form.addSpeaker')}
                </button>
                <button type="button" onClick={() => addAgendaItem('musical')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                  <Plus className="w-4 h-4 inline mr-1" />{t('form.addMusicalNumber')}
                </button>
                <button type="button" onClick={() => addAgendaItem('baptism_ordinance')}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors">
                  <Plus className="w-4 h-4 inline mr-1" />{t('form.addBaptism')}
                </button>
                <button type="button" onClick={() => addAgendaItem('confirmation')}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                  <Plus className="w-4 h-4 inline mr-1" />{t('form.addConfirmation')}
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('common.preview')}</h2>
              <div className="border rounded-lg p-6 bg-gray-50">
                {/* Image */}
                {data.imageId && data.imageId !== 'none' && (
                  <div className="flex justify-center mb-4">
                    <img src={data.imageUrl || LDS_IMAGES.find(i => i.id === data.imageId)?.url} alt=""
                      className="max-h-40 object-contain rounded-lg" />
                  </div>
                )}
                {/* Title */}
                <div className="text-center mb-6">
                  <p className="text-sm uppercase tracking-wider text-gray-500">{t('bulletin.theBaptismOf')}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{candidateName || '...'}</h3>
                  <p className="text-gray-600 italic mt-1">{formatDate(data.date, currentLang)}</p>
                </div>

                {/* Leadership */}
                <div className="space-y-1 text-sm mb-4">
                  {data.leadership.presiding && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('bulletin.presiding')} & {t('bulletin.conducting')}</span>
                      <span className="font-medium">{data.leadership.presiding}</span>
                    </div>
                  )}
                  {data.leadership.organist && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('form.pianist')}</span>
                      <span className="font-medium">{data.leadership.organist}</span>
                    </div>
                  )}
                  {data.leadership.chorister && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('form.chorister')}</span>
                      <span className="font-medium">{data.leadership.chorister}</span>
                    </div>
                  )}
                </div>

                <hr className="my-4" />

                {/* Opening Song */}
                {(data.musicProgram.openingHymnNumber || data.musicProgram.openingHymnTitle) && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{t('bulletin.openingHymn')}</span>
                    <span className="font-medium">{data.musicProgram.openingHymnTitle || `#${data.musicProgram.openingHymnNumber}`}</span>
                  </div>
                )}
                {/* Opening Prayer */}
                {data.prayers.opening && (
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-600">{t('bulletin.invocation')}</span>
                    <span className="font-medium">{data.prayers.opening}</span>
                  </div>
                )}

                {/* Agenda */}
                <div className="space-y-2">
                  {data.agenda.map((item, idx) => (
                    <div key={item.id}>
                      {item.type === 'speaker' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.customLabel || t('bulletin.speaker')}</span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      )}
                      {item.type === 'musical' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('bulletin.musicalNumber')}</span>
                          <span className="font-medium">{item.hymnTitle || item.songName || item.performers}</span>
                        </div>
                      )}
                      {item.type === 'baptism_ordinance' && (
                        <div className="text-center py-2">
                          <p className="font-bold text-sm uppercase">{t('bulletin.baptismOf')} {item.candidateName}</p>
                          {item.performedBy && <p className="text-xs italic text-gray-600">{t('form.performedByLabel')} {item.performedBy}</p>}
                        </div>
                      )}
                      {item.type === 'confirmation' && (
                        <div className="text-center py-2">
                          <p className="font-bold text-sm uppercase">{t('bulletin.confirmationOf')} {item.candidateName}</p>
                          {item.performedBy && <p className="text-xs italic text-gray-600">{t('form.performedByLabel')} {item.performedBy}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Closing Song */}
                {(data.musicProgram.closingHymnNumber || data.musicProgram.closingHymnTitle) && (
                  <div className="flex justify-between text-sm mt-3">
                    <span className="text-gray-600">{t('bulletin.closingHymn')}</span>
                    <span className="font-medium">{data.musicProgram.closingHymnTitle || `#${data.musicProgram.closingHymnNumber}`}</span>
                  </div>
                )}
                {/* Closing Prayer */}
                {data.prayers.closing && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">{t('bulletin.benediction')}</span>
                    <span className="font-medium">{data.prayers.closing}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden print layout - reuse existing BulletinPrintLayout */}
      {createPortal(
        <div className="print-source-portal" style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <BulletinPrintLayout
            data={data}
            refs={{ page1: printPage1Ref, page2: printPage2Ref }}
          />
        </div>,
        document.body
      )}
    </>
  );
}
