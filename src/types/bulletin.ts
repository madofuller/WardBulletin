import { SongType } from '../lib/songService';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'baptism' | 'birthday' | 'calling' | 'activity' | 'service' | 'other';
  date?: string;
  audience?: 'ward' | 'relief_society' | 'elders_quorum' | 'youth' | 'primary' | 'stake' | 'other';
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
  organist: string;
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
  | { type: 'testimony'; id: string };

export interface WardLeadershipEntry {
  title: string;
  name: string;
  phone?: string;
}

export interface MissionaryEntry {
  names: string; // Combined names like "Elder Snow & Score"
  phone: string;
}

export interface WardMissionaryEntry {
  name: string;
  mission: string; // Name of the mission
  missionAddress: string; // Address of the mission
  email?: string; // Email address for ward missionaries
}

export interface BuildingInformation {
  buildingName: string;
  address: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export interface BulletinData {
  wardName: string;
  date: string;
  meetingType: string;
  theme: string;
  bishopricMessage: string;
  announcements: Announcement[];
  meetings: Meeting[];
  specialEvents: SpecialEvent[];
  agenda: AgendaItem[];
  prayers: Prayers;
  musicProgram: MusicProgram;
  leadership: Leadership;
  wardLeadership: WardLeadershipEntry[];
  missionaries: MissionaryEntry[];
  wardMissionaries: WardMissionaryEntry[];
  buildingInformation: BuildingInformation;
}