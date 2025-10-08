import { SongType } from '../lib/songService';

export interface AnnouncementImage {
  imageId: string;
  hideImageOnPrint?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'baptism' | 'birthday' | 'calling' | 'activity' | 'service' | 'other';
  date?: string;
  audience?: 'ward' | 'relief_society' | 'elders_quorum' | 'youth' | 'primary' | 'stake' | 'branch' | 'district' | 'other';
  imageId?: string; // Optional image for flyers/announcements (legacy support)
  hideImageOnPrint?: boolean; // Hide image when printing (legacy support)
  images?: AnnouncementImage[]; // Multiple images support
}

export interface Meeting {
  id: string;
  title: string;
  time: string;
  location: string;
  description?: string;
}

export interface SpecialEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  contact?: string;
}

export interface Prayers {
  opening: string;
  closing: string;
  invocation: string;
  benediction: string;
}

export interface MusicProgram {
  openingHymn: string;
  openingHymnNumber: string;
  openingHymnTitle: string;
  openingHymnType?: SongType;
  sacramentHymn: string;
  sacramentHymnNumber: string;
  sacramentHymnTitle: string;
  sacramentHymnType?: SongType;
  closingHymn: string;
  closingHymnNumber: string;
  closingHymnTitle: string;
  closingHymnType?: SongType;
}

export interface Leadership {
  presiding: string;
  conducting?: string;
  chorister: string;
  choristerLabel?: 'Chorister' | 'Music Leader';
  organist: string;
  organistLabel?: 'Organist' | 'Pianist';
  preludeMusic?: string;
}

export interface Speaker {
  id: string;
  name: string;
  type: 'youth' | 'adult';
}

export type AgendaItem =
  | { type: 'speaker'; id: string; name: string; speakerType: 'youth' | 'adult' }
  | { type: 'musical'; id: string; label?: string; hymnNumber?: string; hymnTitle?: string; hymnType?: SongType; songName?: string; performers?: string }
  | { type: 'testimony'; id: string; note?: string }
  | { type: 'sacrament'; id: string };

export interface UnitLeadershipEntry {
  title: string;
  name: string;
  phone?: string;
}

// Legacy type alias for backward compatibility
export type WardLeadershipEntry = UnitLeadershipEntry;

export interface MissionaryEntry {
  name: string;
  phone?: string;
}

export interface UnitMissionaryEntry {
  name: string;
  mission?: string;
  missionAddress?: string;
  email?: string;
}

// Legacy type alias for backward compatibility
export type WardMissionaryEntry = UnitMissionaryEntry;

export type BulletinStatus = 'draft' | 'scheduled' | 'active' | 'archived';

export interface BulletinData {
  wardName: string; // Will display as appropriate unit name based on terminology
  date: string;
  meetingType: string;
  theme: string;
  userTheme: string;
  bishopricMessage: string; // Will display as appropriate leadership message based on terminology
  announcements: Announcement[];
  meetings: Meeting[];
  specialEvents: SpecialEvent[];
  agenda: AgendaItem[];
  prayers: Prayers;
  musicProgram: MusicProgram;
  leadership: Leadership;
  wardLeadership: UnitLeadershipEntry[]; // Using new interface
  missionaries: MissionaryEntry[];
  wardMissionaries: UnitMissionaryEntry[]; // Using new interface
  imageId?: string; // ID of selected image from LDS_IMAGES or custom images
  imagePosition?: { x: number; y: number }; // Image positioning coordinates
  showQRCodeOnPrint?: boolean; // Whether to show QR code on printed bulletin
  showImagesOnPrint?: boolean; // Whether to show images on printed bulletin
  // Scheduling fields
  id?: string;
  status?: BulletinStatus;
  scheduledDate?: string; // ISO string
  autoActivate?: boolean;
}