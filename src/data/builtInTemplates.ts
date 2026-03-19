import type { BulletinData } from '../types/bulletin';

export interface BuiltInTemplate {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  data: Partial<BulletinData>;
}

export const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  {
    id: 'builtin-sacrament',
    nameKey: 'templates.sacramentMeeting',
    descriptionKey: 'templates.sacramentMeetingDesc',
    icon: '🍞',
    data: {
      meetingType: 'sacrament',
      agenda: [
        { type: 'sacrament', id: 'sac-1' },
        { type: 'speaker', id: 'sp-1', name: '', speakerType: 'youth' },
        { type: 'speaker', id: 'sp-2', name: '', speakerType: 'adult' },
        { type: 'speaker', id: 'sp-3', name: '', speakerType: 'adult' },
      ],
    },
  },
  {
    id: 'builtin-fast-testimony',
    nameKey: 'templates.fastTestimony',
    descriptionKey: 'templates.fastTestimonyDesc',
    icon: '🙏',
    data: {
      meetingType: 'sacrament',
      agenda: [
        { type: 'sacrament', id: 'sac-1' },
        { type: 'testimony', id: 'test-1', note: '' },
      ],
    },
  },
  {
    id: 'builtin-baptism',
    nameKey: 'templates.baptismProgram',
    descriptionKey: 'templates.baptismProgramDesc',
    icon: '💧',
    data: {
      meetingType: 'sacrament',
      agenda: [
        { type: 'speaker', id: 'sp-1', name: '', speakerType: 'adult' },
        { type: 'musical', id: 'mus-1', label: 'Musical Number', songName: '' },
        { type: 'speaker', id: 'sp-2', name: '', speakerType: 'adult' },
      ],
    },
  },
  {
    id: 'builtin-ward-conference',
    nameKey: 'templates.wardConference',
    descriptionKey: 'templates.wardConferenceDesc',
    icon: '🏛️',
    data: {
      meetingType: 'sacrament',
      agenda: [
        { type: 'sacrament', id: 'sac-1' },
        { type: 'speaker', id: 'sp-1', name: '', speakerType: 'adult' },
        { type: 'speaker', id: 'sp-2', name: '', speakerType: 'adult' },
        { type: 'musical', id: 'mus-1', label: 'Musical Number', songName: '' },
        { type: 'speaker', id: 'sp-3', name: '', speakerType: 'adult' },
      ],
    },
  },
  {
    id: 'builtin-special-program',
    nameKey: 'templates.specialProgram',
    descriptionKey: 'templates.specialProgramDesc',
    icon: '🎶',
    data: {
      meetingType: 'sacrament',
      agenda: [
        { type: 'sacrament', id: 'sac-1' },
        { type: 'speaker', id: 'sp-1', name: '', speakerType: 'adult' },
        { type: 'musical', id: 'mus-1', label: 'Musical Number', songName: '' },
        { type: 'speaker', id: 'sp-2', name: '', speakerType: 'adult' },
        { type: 'musical', id: 'mus-2', label: 'Musical Number', songName: '' },
        { type: 'speaker', id: 'sp-3', name: '', speakerType: 'adult' },
      ],
    },
  },
  {
    id: 'builtin-5th-sunday',
    nameKey: 'templates.fifthSunday',
    descriptionKey: 'templates.fifthSundayDesc',
    icon: '📅',
    data: {
      meetingType: 'sacrament',
      agenda: [
        { type: 'sacrament', id: 'sac-1' },
        { type: 'speaker', id: 'sp-1', name: '', speakerType: 'adult' },
        { type: 'speaker', id: 'sp-2', name: '', speakerType: 'adult' },
      ],
    },
  },
];
