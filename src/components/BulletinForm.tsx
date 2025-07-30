import React, { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Building } from 'lucide-react';
import { BulletinData, Announcement, Meeting, SpecialEvent, AgendaItem } from '../types/bulletin';
import { getSongTitle, isValidSongNumber, searchSongsByTitle, SongType } from '../lib/songService';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import BuildingInformationForm from './BuildingInformationForm';

interface BulletinFormProps {
  data: BulletinData;
  onChange: (data: BulletinData) => void;
  userId?: string;
  activeTab: 'program' | 'announcements' | 'wardinfo' | 'building';
  setActiveTab: (tab: 'program' | 'announcements' | 'wardinfo' | 'building') => void;
}

export default function BulletinForm({ data, onChange, userId, activeTab, setActiveTab }: BulletinFormProps) {
  const [hymnSearchResults, setHymnSearchResults] = useState<Array<{number: string, title: string, type: SongType}>>([]);
  const [activeHymnSearch, setActiveHymnSearch] = useState<string | null>(null);
  const [songTypes, setSongTypes] = useState<Record<string, SongType>>({
    openingHymn: 'hymn',
    sacramentHymn: 'hymn',
    closingHymn: 'hymn'
  });
  
  const updateField = (field: keyof BulletinData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addAnnouncement = () => {
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: '',
      content: '',
      category: 'general'
    };
    updateField('announcements', [...data.announcements, newAnnouncement]);
  };

  const updateAnnouncement = (id: string, field: keyof Announcement, value: any) => {
    const updated = data.announcements.map(ann => 
      ann.id === id ? { ...ann, [field]: value } : ann
    );
    updateField('announcements', updated);
  };

  const removeAnnouncement = (id: string) => {
    updateField('announcements', data.announcements.filter(ann => ann.id !== id));
  };

  const handleHymnNumberChange = (field: string, value: string) => {
    if (field.startsWith('agenda-')) {
      const id = field.replace('agenda-', '');
      const agendaSongType = songTypes[`agenda-${id}`] || 'hymn';
      updateAgendaItem(id, {
        hymnNumber: value,
        hymnTitle: isValidSongNumber(value, agendaSongType) ? getSongTitle(value, agendaSongType) : '',
        hymnType: agendaSongType
      });
      return;
    }

    const hymnData = { ...data.musicProgram };
    const fieldSongType = songTypes[field] || 'hymn';

    if (field === 'openingHymnNumber') {
      hymnData.openingHymnNumber = value;
      hymnData.openingHymnType = fieldSongType;
      if (isValidSongNumber(value, fieldSongType)) {
        hymnData.openingHymnTitle = getSongTitle(value, fieldSongType);
      }
    } else if (field === 'sacramentHymnNumber') {
      hymnData.sacramentHymnNumber = value;
      hymnData.sacramentHymnType = fieldSongType;
      if (isValidSongNumber(value, fieldSongType)) {
        hymnData.sacramentHymnTitle = getSongTitle(value, fieldSongType);
      }
    } else if (field === 'closingHymnNumber') {
      hymnData.closingHymnNumber = value;
      hymnData.closingHymnType = fieldSongType;
      if (isValidSongNumber(value, fieldSongType)) {
        hymnData.closingHymnTitle = getSongTitle(value, fieldSongType);
      }
    }
    
    updateField('musicProgram', hymnData);
  };

  const handleHymnTitleSearch = (field: string, searchTerm: string) => {
    if (searchTerm.length < 2) {
      setHymnSearchResults([]);
      setActiveHymnSearch(null);
      return;
    }
    
    const fieldSongType = songTypes[field] || 'hymn';
    const results = searchSongsByTitle(searchTerm, fieldSongType);
    setHymnSearchResults(results);
    setActiveHymnSearch(field);
  };

  const selectHymnFromSearch = (field: string, hymnNumber: string, hymnTitle: string, songType?: SongType) => {
    const fieldSongType = songType || songTypes[field] || 'hymn';
    
    if (field.startsWith('agenda-')) {
      const id = field.replace('agenda-', '');
      updateAgendaItem(id, { hymnNumber, hymnTitle, hymnType: fieldSongType });
      setHymnSearchResults([]);
      setActiveHymnSearch(null);
      return;
    }

    const hymnData = { ...data.musicProgram };

    if (field === 'openingHymnNumber') {
      hymnData.openingHymnNumber = hymnNumber;
      hymnData.openingHymnTitle = hymnTitle;
      hymnData.openingHymnType = fieldSongType;
    } else if (field === 'sacramentHymnNumber') {
      hymnData.sacramentHymnNumber = hymnNumber;
      hymnData.sacramentHymnTitle = hymnTitle;
      hymnData.sacramentHymnType = fieldSongType;
    } else if (field === 'closingHymnNumber') {
      hymnData.closingHymnNumber = hymnNumber;
      hymnData.closingHymnTitle = hymnTitle;
      hymnData.closingHymnType = fieldSongType;
    }
    
    updateField('musicProgram', hymnData);
    setHymnSearchResults([]);
    setActiveHymnSearch(null);
  };

  const closeHymnSearch = () => {
    setHymnSearchResults([]);
    setActiveHymnSearch(null);
  };

  const setSongType = (field: string, type: SongType) => {
    setSongTypes(prev => ({ ...prev, [field]: type }));
    
    // Also update the data structure to persist the song type
    if (field === 'openingHymnNumber') {
      updateField('musicProgram', { 
        ...data.musicProgram, 
        openingHymnType: type 
      });
    } else if (field === 'sacramentHymnNumber') {
      updateField('musicProgram', { 
        ...data.musicProgram, 
        sacramentHymnType: type 
      });
    } else if (field === 'closingHymnNumber') {
      updateField('musicProgram', { 
        ...data.musicProgram, 
        closingHymnType: type 
      });
    } else if (field.startsWith('agenda-')) {
      const id = field.replace('agenda-', '');
      const updatedAgenda = data.agenda.map(item => 
        item.id === id ? { ...item, hymnType: type } : item
      );
      updateField('agenda', updatedAgenda);
    }
  };

  const getSongTypeForField = (field: string): SongType => {
    return songTypes[field] || 'hymn';
  };

  const getPlaceholderForField = (field: string): string => {
    const type = getSongTypeForField(field);
    if (type === 'childrens') {
      const examples = ['2', '4', '20a', '20b', '241a', '241b', '284a', '284b', '267a', '267b', '275a', '275b'];
      return `e.g., ${examples[Math.floor(Math.random() * examples.length)]}`;
    }
    return 'e.g., 9';
  };

  const addMeeting = () => {
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      title: '',
      time: '',
      location: ''
    };
    updateField('meetings', [...data.meetings, newMeeting]);
  };

  const updateMeeting = (id: string, field: keyof Meeting, value: any) => {
    const updated = data.meetings.map(meeting => 
      meeting.id === id ? { ...meeting, [field]: value } : meeting
    );
    updateField('meetings', updated);
  };

  const removeMeeting = (id: string) => {
    updateField('meetings', data.meetings.filter(meeting => meeting.id !== id));
  };

  const addSpecialEvent = () => {
    const newEvent: SpecialEvent = {
      id: Date.now().toString(),
      title: '',
      date: '',
      time: '',
      location: '',
      description: ''
    };
    updateField('specialEvents', [...data.specialEvents, newEvent]);
  };

  const updateSpecialEvent = (id: string, field: keyof SpecialEvent, value: any) => {
    const updated = data.specialEvents.map(event => 
      event.id === id ? { ...event, [field]: value } : event
    );
    updateField('specialEvents', updated);
  };

  const removeSpecialEvent = (id: string) => {
    updateField('specialEvents', data.specialEvents.filter(event => event.id !== id));
  };

  // Add Section dropdown state and ref
  const [showAddSection, setShowAddSection] = useState(false);
  const addSectionRef = useRef<HTMLDivElement>(null);

  const handleAddSection = (type: 'speaker' | 'musical' | 'testimony') => {
    if (type === 'speaker') {
      updateField('agenda', [
        ...data.agenda,
        { id: Date.now().toString(), type: 'speaker', name: '', speakerType: 'adult' }
      ]);
    } else if (type === 'musical') {
      updateField('agenda', [
        ...data.agenda,
        { id: Date.now().toString(), type: 'musical', label: 'Musical Number', hymnNumber: '', hymnTitle: '', songName: '', performers: '' }
      ]);
    } else if (type === 'testimony') {
      updateField('agenda', [...data.agenda, { id: Date.now().toString(), type: 'testimony' }]);
    }
    setShowAddSection(false);
  };

  useEffect(() => {
    if (!showAddSection) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (addSectionRef.current && !addSectionRef.current.contains(event.target as Node)) {
        setShowAddSection(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddSection]);

  // Default value keys
  const DEFAULT_KEYS = {
    wardName: 'default_wardName',
    presiding: 'default_presiding',
    conducting: 'default_conducting',
    chorister: 'default_chorister',
    organist: 'default_organist',
    preludeMusic: 'default_preludeMusic',
    wardLeadership: 'default_wardLeadership',
    missionaries: 'default_missionaries',
    wardMissionaries: 'default_wardMissionaries',
    buildingInformation: 'default_buildingInformation',
  };

  // Load defaults from localStorage on mount
  useEffect(() => {
    const newData = { ...data };
    let changed = false;
    if (!data.wardName && localStorage.getItem(DEFAULT_KEYS.wardName)) {
      newData.wardName = localStorage.getItem(DEFAULT_KEYS.wardName) || '';
      changed = true;
    }
    if (!data.leadership.presiding && localStorage.getItem(DEFAULT_KEYS.presiding)) {
      newData.leadership = { ...newData.leadership, presiding: localStorage.getItem(DEFAULT_KEYS.presiding) || '' };
      changed = true;
    }
    if (!data.leadership.conducting && localStorage.getItem(DEFAULT_KEYS.conducting)) {
      newData.leadership = { ...newData.leadership, conducting: localStorage.getItem(DEFAULT_KEYS.conducting) || '' };
      changed = true;
    }
    if (!data.leadership.chorister && localStorage.getItem(DEFAULT_KEYS.chorister)) {
      newData.leadership = { ...newData.leadership, chorister: localStorage.getItem(DEFAULT_KEYS.chorister) || '' };
      changed = true;
    }
    if (!data.leadership.organist && localStorage.getItem(DEFAULT_KEYS.organist)) {
      newData.leadership = { ...newData.leadership, organist: localStorage.getItem(DEFAULT_KEYS.organist) || '' };
      changed = true;
    }
    if (!data.leadership.preludeMusic && localStorage.getItem(DEFAULT_KEYS.preludeMusic)) {
      newData.leadership = { ...newData.leadership, preludeMusic: localStorage.getItem(DEFAULT_KEYS.preludeMusic) || '' };
      changed = true;
    }
    // Ward Leadership
    if ((!data.wardLeadership || data.wardLeadership.length === 0) && localStorage.getItem(DEFAULT_KEYS.wardLeadership)) {
      try {
        newData.wardLeadership = JSON.parse(localStorage.getItem(DEFAULT_KEYS.wardLeadership) || '[]');
        changed = true;
      } catch {}
    }
    // Missionaries
    if ((!data.missionaries || data.missionaries.length === 0) && localStorage.getItem(DEFAULT_KEYS.missionaries)) {
      try {
        newData.missionaries = JSON.parse(localStorage.getItem(DEFAULT_KEYS.missionaries) || '[]');
        changed = true;
      } catch {}
    }
    if (changed) onChange(newData);
    // eslint-disable-next-line
  }, []);

  // Handle clicking outside hymn search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeHymnSearch && hymnSearchResults.length > 0) {
        const target = event.target as Element;
        if (!target.closest('.hymn-search-container')) {
          closeHymnSearch();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeHymnSearch, hymnSearchResults]);

  // Save default handlers (to localStorage)
  const saveDefault = (key: keyof typeof DEFAULT_KEYS, value: any) => {
    if (key === 'wardLeadership' || key === 'missionaries' || key === 'wardMissionaries' || key === 'buildingInformation') {
      localStorage.setItem(DEFAULT_KEYS[key], JSON.stringify(value));
    } else {
      localStorage.setItem(DEFAULT_KEYS[key], value);
    }
    toast.success('Default saved!');
  };

  // Move agenda item up or down
  const moveAgendaItem = (idx: number, direction: -1 | 1) => {
    const newAgenda = [...data.agenda];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= newAgenda.length) return;
    [newAgenda[idx], newAgenda[targetIdx]] = [newAgenda[targetIdx], newAgenda[idx]];
    updateField('agenda', newAgenda);
  };

  // Update agenda item and auto-populate hymn title if needed
  const updateAgendaItem = (id: string, changes: Partial<AgendaItem>) => {
    updateField('agenda', data.agenda.map(item => {
      if (item.id !== id) return item;
      if (item.type === 'musical' && 'hymnNumber' in changes) {
        const hymnNumber = changes.hymnNumber;
        const number = parseInt(hymnNumber || '');
        if (hymnNumber && isValidSongNumber(hymnNumber, getSongTypeForField(`agenda-${id}`))) {
          return { ...item, ...changes, hymnTitle: getSongTitle(hymnNumber, getSongTypeForField(`agenda-${id}`)) };
        } else {
          return { ...item, ...changes, hymnTitle: '' };
        }
      }
      return { ...item, ...changes };
    }));
  };

  // Add audience options at the top of the file
  const audienceOptions = [
    { value: 'ward', label: 'Ward' },
    { value: 'relief_society', label: 'Relief Society' },
    { value: 'elders_quorum', label: 'Elders Quorum' },
    { value: 'young_women', label: 'Young Women' },
    { value: 'young_men', label: 'Young Men' },
    { value: 'youth', label: 'Youth' },
    { value: 'primary', label: 'Primary' },
    { value: 'stake', label: 'Stake' },
    { value: 'other', label: 'Other' }
  ];

  // Add the moveAnnouncement function near the other move functions:
  const moveAnnouncement = (idx: number, direction: -1 | 1) => {
    const newAnnouncements = [...data.announcements];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= newAnnouncements.length) return;
    [newAnnouncements[idx], newAnnouncements[targetIdx]] = [newAnnouncements[targetIdx], newAnnouncements[idx]];
    updateField('announcements', newAnnouncements);
  };

  const consolidateAnnouncements = () => {
    // Group announcements by audience
    const grouped = data.announcements.reduce((groups, announcement) => {
      const audience = announcement.audience || 'ward';
      if (!groups[audience]) {
        groups[audience] = [];
      }
      groups[audience].push(announcement);
      return groups;
    }, {} as Record<string, Announcement[]>);

    // Create consolidated announcements
    const consolidated: Announcement[] = Object.entries(grouped).map(([audience, announcements]) => {
      if (announcements.length === 1) {
        return announcements[0];
      }

      // Merge multiple announcements for the same audience
      const titles = announcements.map(a => a.title).filter(t => t.trim());
      const contents = announcements.map(a => a.content).filter(c => c.trim());
      
      // Create content with original titles as headers
      const contentWithHeaders = announcements
        .filter(a => a.title.trim() || a.content.trim())
        .map(a => {
          const title = a.title.trim();
          const content = a.content.trim();
          if (title && content) {
            return `<h4 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #111827; margin-top: 16px;">${title}</h4>${content}`;
          } else if (title) {
            return `<h4 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #111827; margin-top: 16px;">${title}</h4>`;
          } else if (content) {
            return content;
          }
          return '';
        })
        .filter(item => item)
        .join('<br><br>');
      
      return {
        id: Date.now().toString() + Math.random(),
        title: '', // Remove main title when consolidating
        content: contentWithHeaders,
        category: 'general',
        audience: audience as any
      };
    });

    updateField('announcements', consolidated);
    toast.success(`Consolidated ${data.announcements.length} announcements into ${consolidated.length} groups`);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Tab Navigation */}
      <nav className="flex justify-center mb-4" aria-label="Main tabs">
        <ul className="flex flex-col gap-3 sm:flex-row sm:gap-3 w-full max-w-xs sm:max-w-none mx-auto justify-center items-center">
          {['program', 'announcements', 'wardinfo', 'building'].map(tab => (
            <li key={tab} role="presentation" className="w-full sm:w-auto">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`tab-panel-${tab}`}
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-full font-semibold focus:outline-none border-2 transition-all duration-200 text-sm whitespace-nowrap
                  ${activeTab === tab
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900'}
                `}
                onClick={() => setActiveTab(tab as any)}
              >
                {tab === 'program' ? 'Program' : tab === 'announcements' ? 'Announcements' : tab === 'wardinfo' ? 'Ward' : 'Building'}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* Tab Content */}
      {activeTab === 'program' && (
        <>
          {/* Basic Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center justify-between">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward Name</label>
                <div className="flex gap-2 md:flex-col md:gap-0">
                  <input
                    type="text"
                    value={data.wardName}
                    onChange={(e) => updateField('wardName', e.target.value)}
                    placeholder="e.g., Sunset Hills Ward"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => saveDefault('wardName', data.wardName)}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 border border-gray-300 md:mt-2"
                    title="Save as default"
                  >
                    Save as default
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={data.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme/Scripture</label>
                <input
                  type="text"
                  value={data.theme}
                  onChange={(e) => updateField('theme', e.target.value)}
                  placeholder="Weekly theme or scripture reference"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Leadership */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Leadership</h3>
            {/* First Row: 2 fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Presiding</label>
                <div className="flex gap-2 md:flex-col md:gap-0">
                  <input
                    type="text"
                    value={data.leadership.presiding}
                    onChange={(e) => updateField('leadership', { ...data.leadership, presiding: e.target.value })}
                    placeholder="e.g., Bishop Dave Stratham"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => saveDefault('presiding', data.leadership.presiding)}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 border border-gray-300 md:mt-2"
                    title="Save as default"
                  >
                    Save as default
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conducting</label>
                <div className="flex gap-2 md:flex-col md:gap-0">
                  <input
                    type="text"
                    value={data.leadership.conducting || ''}
                    onChange={(e) => updateField('leadership', { ...data.leadership, conducting: e.target.value })}
                    placeholder="e.g., 1st Counselor John Smith"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => saveDefault('conducting', data.leadership.conducting || '')}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 border border-gray-300 md:mt-2"
                    title="Save as default"
                  >
                    Save as default
                  </button>
                </div>
              </div>
            </div>
            
            {/* Second Row: 3 fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chorister</label>
                <div className="flex gap-2 md:flex-col md:gap-0">
                  <input
                    type="text"
                    value={data.leadership.chorister}
                    onChange={(e) => updateField('leadership', { ...data.leadership, chorister: e.target.value })}
                    placeholder="e.g., Debbie Hanes (Chorister)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => saveDefault('chorister', data.leadership.chorister)}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 border border-gray-300 md:mt-2"
                    title="Save as default"
                  >
                    Save as default
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organist</label>
                <div className="flex gap-2 md:flex-col md:gap-0">
                  <input
                    type="text"
                    value={data.leadership.organist}
                    onChange={(e) => updateField('leadership', { ...data.leadership, organist: e.target.value })}
                    placeholder="e.g., Tom Webster"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => saveDefault('organist', data.leadership.organist)}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 border border-gray-300 md:mt-2"
                    title="Save as default"
                  >
                    Save as default
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prelude Music</label>
                <div className="flex gap-2 md:flex-col md:gap-0">
                  <input
                    type="text"
                    value={data.leadership.preludeMusic || ''}
                    onChange={(e) => updateField('leadership', { ...data.leadership, preludeMusic: e.target.value })}
                    placeholder="e.g., Hymn 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => saveDefault('preludeMusic', data.leadership.preludeMusic || '')}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 border border-gray-300 md:mt-2"
                    title="Save as default"
                  >
                    Save as default
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Music Program */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Music Program</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hymn Number</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setSongType('openingHymnNumber', 'hymn')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      getSongTypeForField('openingHymnNumber') === 'hymn'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Hymns
                  </button>
                  <button
                    type="button"
                    onClick={() => setSongType('openingHymnNumber', 'childrens')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      getSongTypeForField('openingHymnNumber') === 'childrens'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Children's Songs
                  </button>
                </div>
                <input
                  type="text"
                  value={data.musicProgram.openingHymnNumber}
                  onChange={(e) => handleHymnNumberChange('openingHymnNumber', e.target.value)}
                  placeholder={getPlaceholderForField('openingHymnNumber')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    Boolean(data.musicProgram.openingHymnNumber) && isValidSongNumber(data.musicProgram.openingHymnNumber, getSongTypeForField('openingHymnNumber')) === false
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {Boolean(data.musicProgram.openingHymnNumber) && isValidSongNumber(data.musicProgram.openingHymnNumber, getSongTypeForField('openingHymnNumber')) === false && (
                  <p className="text-xs text-red-600 mt-1">Invalid {getSongTypeForField('openingHymnNumber') === 'hymn' ? 'hymn' : 'song'} number</p>
                )}
              </div>
              <div className="md:col-span-2 relative hymn-search-container">
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hymn Title</label>
                <input
                  type="text"
                  value={data.musicProgram.openingHymnTitle}
                  onChange={(e) => {
                    updateField('musicProgram', { ...data.musicProgram, openingHymnTitle: e.target.value });
                    handleHymnTitleSearch('openingHymnNumber', e.target.value);
                  }}
                  onFocus={() => {
                    if (data.musicProgram.openingHymnTitle && data.musicProgram.openingHymnTitle.length >= 2) {
                      handleHymnTitleSearch('openingHymnNumber', data.musicProgram.openingHymnTitle);
                    }
                  }}
                  placeholder="Search for hymn title or enter manually"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    data.musicProgram.openingHymnNumber && isValidSongNumber(data.musicProgram.openingHymnNumber, getSongTypeForField('openingHymnNumber'))
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  }`}
                />
                {activeHymnSearch === 'openingHymnNumber' && hymnSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {hymnSearchResults.map((hymn) => (
                      <button
                        key={`${hymn.type}-${hymn.number}`}
                        type="button"
                        onClick={() => selectHymnFromSearch('openingHymnNumber', hymn.number, hymn.title, hymn.type)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">#{hymn.number} - {hymn.title}</div>
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {hymn.type === 'hymn' ? 'H' : 'CS'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sacrament Hymn Number</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setSongType('sacramentHymnNumber', 'hymn')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      getSongTypeForField('sacramentHymnNumber') === 'hymn'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Hymns
                  </button>
                  <button
                    type="button"
                    onClick={() => setSongType('sacramentHymnNumber', 'childrens')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      getSongTypeForField('sacramentHymnNumber') === 'childrens'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Children's Songs
                  </button>
                </div>
                <input
                  type="text"
                  value={data.musicProgram.sacramentHymnNumber}
                  onChange={(e) => handleHymnNumberChange('sacramentHymnNumber', e.target.value)}
                  placeholder={getPlaceholderForField('sacramentHymnNumber')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    Boolean(data.musicProgram.sacramentHymnNumber) && isValidSongNumber(data.musicProgram.sacramentHymnNumber, getSongTypeForField('sacramentHymnNumber')) === false
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {Boolean(data.musicProgram.sacramentHymnNumber) && isValidSongNumber(data.musicProgram.sacramentHymnNumber, getSongTypeForField('sacramentHymnNumber')) === false && (
                  <p className="text-xs text-red-600 mt-1">Invalid {getSongTypeForField('sacramentHymnNumber') === 'hymn' ? 'hymn' : 'song'} number</p>
                )}
              </div>
              <div className="md:col-span-2 relative hymn-search-container">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sacrament Hymn Title</label>
                <input
                  type="text"
                  value={data.musicProgram.sacramentHymnTitle}
                  onChange={(e) => {
                    updateField('musicProgram', { ...data.musicProgram, sacramentHymnTitle: e.target.value });
                    handleHymnTitleSearch('sacramentHymnNumber', e.target.value);
                  }}
                  onFocus={() => {
                    if (data.musicProgram.sacramentHymnTitle && data.musicProgram.sacramentHymnTitle.length >= 2) {
                      handleHymnTitleSearch('sacramentHymnNumber', data.musicProgram.sacramentHymnTitle);
                    }
                  }}
                  placeholder="Search for hymn title or enter manually"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    data.musicProgram.sacramentHymnNumber && isValidSongNumber(data.musicProgram.sacramentHymnNumber, getSongTypeForField('sacramentHymnNumber'))
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  }`}
                />
                {activeHymnSearch === 'sacramentHymnNumber' && hymnSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {hymnSearchResults.map((hymn) => (
                      <button
                        key={`${hymn.type}-${hymn.number}`}
                        type="button"
                        onClick={() => selectHymnFromSearch('sacramentHymnNumber', hymn.number, hymn.title, hymn.type)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">#{hymn.number} - {hymn.title}</div>
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {hymn.type === 'hymn' ? 'H' : 'CS'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closing Hymn Number</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setSongType('closingHymnNumber', 'hymn')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      getSongTypeForField('closingHymnNumber') === 'hymn'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Hymns
                  </button>
                  <button
                    type="button"
                    onClick={() => setSongType('closingHymnNumber', 'childrens')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      getSongTypeForField('closingHymnNumber') === 'childrens'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Children's Songs
                  </button>
                </div>
                <input
                  type="text"
                  value={data.musicProgram.closingHymnNumber}
                  onChange={(e) => handleHymnNumberChange('closingHymnNumber', e.target.value)}
                  placeholder={getPlaceholderForField('closingHymnNumber')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    Boolean(data.musicProgram.closingHymnNumber) && isValidSongNumber(data.musicProgram.closingHymnNumber, getSongTypeForField('closingHymnNumber')) === false
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {Boolean(data.musicProgram.closingHymnNumber) && isValidSongNumber(data.musicProgram.closingHymnNumber, getSongTypeForField('closingHymnNumber')) === false && (
                  <p className="text-xs text-red-600 mt-1">Invalid {getSongTypeForField('closingHymnNumber') === 'hymn' ? 'hymn' : 'song'} number</p>
                )}
              </div>
              <div className="md:col-span-2 relative hymn-search-container">
                <label className="block text-sm font-medium text-gray-700 mb-1">Closing Hymn Title</label>
                <input
                  type="text"
                  value={data.musicProgram.closingHymnTitle}
                  onChange={(e) => {
                    updateField('musicProgram', { ...data.musicProgram, closingHymnTitle: e.target.value });
                    handleHymnTitleSearch('closingHymnNumber', e.target.value);
                  }}
                  onFocus={() => {
                    if (data.musicProgram.closingHymnTitle && data.musicProgram.closingHymnTitle.length >= 2) {
                      handleHymnTitleSearch('closingHymnNumber', data.musicProgram.closingHymnTitle);
                    }
                  }}
                  placeholder="Search for hymn title or enter manually"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    data.musicProgram.closingHymnNumber && isValidSongNumber(data.musicProgram.closingHymnNumber, getSongTypeForField('closingHymnNumber'))
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  }`}
                />
                {activeHymnSearch === 'closingHymnNumber' && hymnSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {hymnSearchResults.map((hymn) => (
                      <button
                        key={`${hymn.type}-${hymn.number}`}
                        type="button"
                        onClick={() => selectHymnFromSearch('closingHymnNumber', hymn.number, hymn.title, hymn.type)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">#{hymn.number} - {hymn.title}</div>
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {hymn.type === 'hymn' ? 'H' : 'CS'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Prayers */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Prayers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invocation</label>
                <input
                  type="text"
                  value={data.prayers.opening}
                  onChange={(e) => updateField('prayers', { ...data.prayers, opening: e.target.value })}
                  placeholder="Invocation name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Benediction</label>
                <input
                  type="text"
                  value={data.prayers.closing}
                  onChange={(e) => updateField('prayers', { ...data.prayers, closing: e.target.value })}
                  placeholder="Benediction name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Agenda (After Sacrament) */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Agenda (After Sacrament)</h3>
            <div className="space-y-3">
            {data.agenda.map((item, idx) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg flex flex-wrap gap-2 items-center">
                {item.type === 'testimony' ? (
                  <div className="w-full flex items-center justify-center">
                    <span className="block w-full text-center font-bold text-lg text-gray-700 py-2">Bearing of Testimonies</span>
                  </div>
                ) : item.type === 'speaker' ? (
                  <>
                    <input type="text" value={item.name} onChange={e => updateAgendaItem(item.id, { name: e.target.value })} placeholder="Speaker name" className="flex-1 min-w-[120px] max-w-xs px-3 py-2 border border-gray-300 rounded-lg" />
                    <select value={item.speakerType} onChange={e => updateAgendaItem(item.id, { speakerType: e.target.value as 'youth' | 'adult' })} className="px-2 py-1 border rounded-lg min-w-[120px]">
                      <option value="youth">Youth Speaker</option>
                      <option value="adult">Speaker</option>
                    </select>
                  </>
                ) : (
                  <div className="w-full space-y-3">
                    {/* Song Type Selection */}
                    <div className="flex gap-1 mb-2">
                      <button
                        type="button"
                        onClick={() => setSongType(`agenda-${item.id}`, 'hymn')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          getSongTypeForField(`agenda-${item.id}`) === 'hymn'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Hymns
                      </button>
                      <button
                        type="button"
                        onClick={() => setSongType(`agenda-${item.id}`, 'childrens')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          getSongTypeForField(`agenda-${item.id}`) === 'childrens'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Children's Songs
                      </button>
                    </div>

                    {/* Type Selection */}
                    <div className="mb-3">
                      <select
                        value={item.label || 'Musical Number'}
                        onChange={e => updateAgendaItem(item.id, { label: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Musical Number">Musical Number</option>
                        <option value="Intermediate Hymn">Intermediate Hymn</option>
                      </select>
                    </div>

                    {/* Hymn/Song Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getSongTypeForField(`agenda-${item.id}`) === 'hymn' ? 'Hymn' : 'Song'} Number
                        </label>
                        <input
                          type="text"
                          value={item.hymnNumber || ''}
                          onChange={e => handleHymnNumberChange(`agenda-${item.id}`, e.target.value)}
                          placeholder={getPlaceholderForField(`agenda-${item.id}`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getSongTypeForField(`agenda-${item.id}`) === 'hymn' ? 'Hymn' : 'Song'} Title
                        </label>
                        <input
                          type="text"
                          value={item.hymnTitle || ''}
                          onChange={e => {
                            updateAgendaItem(item.id, { hymnTitle: e.target.value });
                            handleHymnTitleSearch(`agenda-${item.id}`, e.target.value);
                          }}
                          onFocus={() => {
                            if (item.hymnTitle && item.hymnTitle.length >= 2) {
                              handleHymnTitleSearch(`agenda-${item.id}`, item.hymnTitle);
                            }
                          }}
                          placeholder={`Search ${getSongTypeForField(`agenda-${item.id}`) === 'hymn' ? 'hymn' : 'song'} title...`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          readOnly={!!item.hymnNumber}
                        />
                        {activeHymnSearch === `agenda-${item.id}` && hymnSearchResults.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {hymnSearchResults.map(hymn => (
                              <button
                                key={`${hymn.type}-${hymn.number}`}
                                type="button"
                                onClick={() => selectHymnFromSearch(`agenda-${item.id}`, hymn.number, hymn.title, hymn.type)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">#{hymn.number} - {hymn.title}</div>
                                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                    {hymn.type === 'hymn' ? 'H' : 'CS'}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Song Name (if not hymn)</label>
                        <input
                          type="text"
                          value={item.songName || ''}
                          onChange={e => updateAgendaItem(item.id, { songName: e.target.value })}
                          placeholder="e.g., Special musical number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Performers (optional)</label>
                        <input
                          type="text"
                          value={item.performers || ''}
                          onChange={e => updateAgendaItem(item.id, { performers: e.target.value })}
                          placeholder="e.g., Primary children"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex flex-row items-center space-x-1">
                  <button onClick={() => moveAgendaItem(idx, -1)} disabled={idx === 0} className="px-2 py-1 text-gray-600 hover:text-black disabled:opacity-30">↑</button>
                  <button onClick={() => moveAgendaItem(idx, 1)} disabled={idx === data.agenda.length - 1} className="px-2 py-1 text-gray-600 hover:text-black disabled:opacity-30">↓</button>
                  <button onClick={() => updateField('agenda', data.agenda.filter(ag => ag.id !== item.id))} className="ml-2 p-2 text-red-600 hover:bg-red-100 rounded-lg">Remove</button>
                </div>
              </div>
            ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => handleAddSection('speaker')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex-1"
              >
                Add Speaker
              </button>
              <button
                type="button"
                onClick={() => handleAddSection('musical')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex-1"
              >
                Add Musical Number
              </button>
              <button
                type="button"
                onClick={() => handleAddSection('testimony')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex-1"
              >
                Add Testimonies
              </button>
            </div>
          </section>
        </>
      )}
      {activeTab === 'announcements' && (
        <>
          {/* Announcements Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-medium text-gray-900">Announcements</h3>
              {data.announcements.length > 1 && (
                <button
                  onClick={consolidateAnnouncements}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  title="Group multiple announcements by their target audience (Ward, Relief Society, etc.) into single consolidated entries. Original titles will be preserved as headers within the content."
                >
                  Consolidate
                </button>
              )}
            </div>
            
            {/* Submissions Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">💡 New: Ward Member Submissions</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Ward members can now submit announcements directly! Share your submissions link with the ward to let them add announcements that you can review and approve.
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-blue-700">
                    <span>📋 Get your submissions link from the QR Code modal</span>
                    <span>•</span>
                    <span>✅ Review submissions in the toolbar</span>
                  </div>
                </div>
              </div>
            </div>
            {data.announcements.map((announcement, idx) => (
              <div key={announcement.id} className="bg-gray-50 p-4 rounded-lg space-y-3 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={announcement.title}
                      onChange={(e) => updateAnnouncement(announcement.id, 'title', e.target.value)}
                      placeholder="Announcement title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                      value={announcement.audience || 'ward'}
                      onChange={e => updateAnnouncement(announcement.id, 'audience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {audienceOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <ReactQuill
                    value={announcement.content}
                    onChange={value => updateAnnouncement(announcement.id, 'content', value)}
                    placeholder="Announcement content..."
                    className="quill-no-border"
                    theme="snow"
                    modules={{
                      toolbar: [
                        [{ 'size': ['small', false, 'large', 'huge'] }],
                        ['bold', 'italic', 'underline', { 'color': [] }, 'link'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['clean']
                      ]
                    }}
                  />
                </div>
                <div className="flex flex-col items-end space-y-2 sm:space-y-0 sm:ml-4 sm:flex-row sm:items-center sm:space-x-2">
                  <div className="flex flex-row items-center space-x-1">
                    <button onClick={() => moveAnnouncement(idx, -1)} disabled={idx === 0} className="px-2 py-1 text-gray-600 hover:text-black disabled:opacity-30">↑</button>
                    <button onClick={() => moveAnnouncement(idx, 1)} disabled={idx === data.announcements.length - 1} className="px-2 py-1 text-gray-600 hover:text-black disabled:opacity-30">↓</button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAnnouncement(announcement.id)}
                    className="ml-3 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addAnnouncement}
              className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm mt-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Announcement
            </button>
          </section>
        </>
      )}
      {activeTab === 'wardinfo' && (
        <section className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center justify-between">Ward Leadership
            <div className="flex flex-col items-end ml-2">
              <button
                type="button"
                onClick={() => saveDefault('wardLeadership', data.wardLeadership)}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 border border-gray-300"
                title="Save as default"
              >
                Save as default
              </button>
              <span className="text-xs text-gray-500 mt-1">Saves title, name, and phone for each row as your template.</span>
            </div>
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm rounded-lg overflow-hidden bg-white shadow-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-1 border-b">Title</th>
                  <th className="px-2 py-1 border-b">Name</th>
                  <th className="px-2 py-1 border-b">Phone</th>
                  <th className="px-2 py-1 border-b"></th>
                </tr>
              </thead>
              <tbody>
                {data.wardLeadership.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition">
                    <td className="border-b px-2 py-1">
                      <input
                        type="text"
                        value={entry.title}
                        onChange={e => {
                          const updated = [...data.wardLeadership];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          updateField('wardLeadership', updated);
                        }}
                        className="w-full px-1 py-1 border rounded bg-gray-50 focus:bg-white"
                      />
                    </td>
                    <td className="border-b px-2 py-1">
                      <input
                        type="text"
                        value={entry.name}
                        onChange={e => {
                          const updated = [...data.wardLeadership];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          updateField('wardLeadership', updated);
                        }}
                        className="w-full px-1 py-1 border rounded bg-gray-50 focus:bg-white"
                      />
                    </td>
                    <td className="border-b px-2 py-1">
                      <input
                        type="text"
                        value={entry.phone || ''}
                        onChange={e => {
                          const updated = [...data.wardLeadership];
                          updated[idx] = { ...updated[idx], phone: e.target.value };
                          updateField('wardLeadership', updated);
                        }}
                        className="w-full px-1 py-1 border rounded bg-gray-50 focus:bg-white"
                      />
                    </td>
                    <td className="border-b px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = data.wardLeadership.filter((_, i) => i !== idx);
                          updateField('wardLeadership', updated);
                        }}
                        className="text-red-600 hover:underline"
                        title="Remove"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={() => updateField('wardLeadership', [...data.wardLeadership, { title: '', name: '', phone: '' }])}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg"
            >
              Add Leadership Position
            </button>
          </div>

          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mt-8 flex items-center justify-between">Missionaries
            <div className="flex flex-col items-end ml-2">
              <button
                type="button"
                onClick={() => saveDefault('missionaries', data.missionaries)}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 border border-gray-300"
                title="Save as default"
              >
                Save as default
              </button>
              <span className="text-xs text-gray-500 mt-1">Saves names and phone for each missionary as your template.</span>
            </div>
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm rounded-lg overflow-hidden bg-white shadow-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-1 border-b">Names (e.g., "Elder Snow & Score")</th>
                  <th className="px-2 py-1 border-b">Phone</th>
                  <th className="px-2 py-1 border-b"></th>
                </tr>
              </thead>
              <tbody>
                {data.missionaries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition">
                    <td className="border-b px-2 py-1">
                      <input
                        type="text"
                        value={entry.names}
                        onChange={e => {
                          const updated = [...data.missionaries];
                          updated[idx] = { ...updated[idx], names: e.target.value };
                          updateField('missionaries', updated);
                        }}
                        className="w-full px-1 py-1 border rounded bg-gray-50 focus:bg-white"
                        placeholder="Elder Snow & Score"
                      />
                    </td>
                    <td className="border-b px-2 py-1">
                      <input
                        type="text"
                        value={entry.phone}
                        onChange={e => {
                          const updated = [...data.missionaries];
                          updated[idx] = { ...updated[idx], phone: e.target.value };
                          updateField('missionaries', updated);
                        }}
                        className="w-full px-1 py-1 border rounded bg-gray-50 focus:bg-white"
                        placeholder="(555) 123-4567"
                      />
                    </td>
                    <td className="border-b px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = data.missionaries.filter((_, i) => i !== idx);
                          updateField('missionaries', updated);
                        }}
                        className="text-red-600 hover:underline"
                        title="Remove"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={() => updateField('missionaries', [...data.missionaries, { names: '', phone: '' }])}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg"
            >
              Add Missionary
            </button>
          </div>

          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mt-8 flex items-center justify-between">Ward Missionaries
            <div className="flex flex-col items-end ml-2">
              <button
                type="button"
                onClick={() => saveDefault('wardMissionaries', data.wardMissionaries)}
                className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 border border-gray-300"
                title="Save as default"
              >
                Save as default
              </button>
              <span className="text-xs text-gray-500 mt-1">Saves name, mission, and address for each ward missionary as your template.</span>
            </div>
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm rounded-lg overflow-hidden bg-white shadow-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-1 border-b">Name</th>
                  <th className="px-2 py-1 border-b">Mission</th>
                  <th className="px-2 py-1 border-b">Mission Address</th>
                  <th className="px-2 py-1 border-b">Email</th>
                  <th className="px-2 py-1 border-b"></th>
                </tr>
              </thead>
              <tbody>
                {data.wardMissionaries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition">
                    <td className="border-b px-2 py-1">
                      <input
                        type="text"
                        value={entry.name}
                        onChange={e => {
                          const updated = [...data.wardMissionaries];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          updateField('wardMissionaries', updated);
                        }}
                        className="w-full px-1 py-1 border rounded bg-gray-50 focus:bg-white"
                      />
                    </td>
                    <td className="border-b px-2 py-1">
                      <input
                        type="text"
                        value={entry.mission || ''}
                        onChange={e => {
                          const updated = [...data.wardMissionaries];
                          updated[idx] = { ...updated[idx], mission: e.target.value };
                          updateField('wardMissionaries', updated);
                        }}
                        className="w-full px-1 py-1 border rounded bg-gray-50 focus:bg-white"
                      />
                    </td>
                    <td className="border-b px-2 py-1">
                      <input
                        type="text"
                        value={entry.missionAddress || ''}
                        onChange={e => {
                          const updated = [...data.wardMissionaries];
                          updated[idx] = { ...updated[idx], missionAddress: e.target.value };
                          updateField('wardMissionaries', updated);
                        }}
                        className="w-full px-1 py-1 border rounded bg-gray-50 focus:bg-white"
                      />
                    </td>
                    <td className="border-b px-2 py-1">
                      <input
                        type="email"
                        value={entry.email || ''}
                        onChange={e => {
                          const updated = [...data.wardMissionaries];
                          updated[idx] = { ...updated[idx], email: e.target.value };
                          updateField('wardMissionaries', updated);
                        }}
                        className="w-full px-1 py-1 border rounded bg-gray-50 focus:bg-white"
                      />
                    </td>
                    <td className="border-b px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = data.wardMissionaries.filter((_, i) => i !== idx);
                          updateField('wardMissionaries', updated);
                        }}
                        className="text-red-600 hover:underline"
                        title="Remove"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={() => updateField('wardMissionaries', [...data.wardMissionaries, { name: '', mission: '', missionAddress: '', email: '' }])}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg"
            >
              Add Ward Missionary
            </button>
          </div>

        </section>
      )}
      {activeTab === 'building' && (
        <BuildingInformationForm 
          data={data.buildingInformation} 
          onChange={(buildingInfo) => updateField('buildingInformation', buildingInfo)}
          userId={userId}
          onSaveDefault={(buildingInfo) => saveDefault('buildingInformation', buildingInfo)}
        />
      )}
    </div>
  );
}