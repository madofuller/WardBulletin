import { LDS_HYMNS, getHymnTitle, getHymnUrl, isValidHymnNumber, searchHymnByTitle } from '../data/hymns';
import { CHILDRENS_SONGBOOK, getChildrensSongTitle, getChildrensSongUrl, isValidChildrensSongNumber, searchChildrensSongByTitle } from '../data/childrensSongbook';

const CHURCH_LANG_CODES: Record<string, string> = {
  en: 'eng', pt: 'por', es: 'spa', fr: 'fra',
  de: 'deu', it: 'ita', ja: 'jpn', ko: 'kor', zh: 'zho',
};
const getChurchLanguageCode = (lang: string): string => CHURCH_LANG_CODES[lang] || 'eng';

export type SongType = 'hymn' | 'childrens';

export interface SongResult {
  number: string;
  title: string;
  type: SongType;
  url: string;
}

export interface SongSearchResult {
  number: string;
  title: string;
  type: SongType;
}

interface HymnModule {
  hymns: Record<number, any>;
  getTitle: (n: number) => string;
  getUrl: (n: number) => string;
  isValid: (n: number) => boolean;
  search: (term: string) => { number: number | string; title: string }[];
  maxNumber?: number;
}

interface ChildrensModule {
  songs: Record<string, any>;
  getTitle: (n: string) => string;
  getUrl: (n: string) => string;
  isValid: (n: string) => boolean;
  search: (term: string) => { number: string; title: string }[];
}

const hymnCache = new Map<string, HymnModule>();
const childrensCache = new Map<string, ChildrensModule>();

// English is always available synchronously
hymnCache.set('en', {
  hymns: LDS_HYMNS,
  getTitle: getHymnTitle,
  getUrl: getHymnUrl,
  isValid: isValidHymnNumber,
  search: searchHymnByTitle,
});
childrensCache.set('en', {
  songs: CHILDRENS_SONGBOOK,
  getTitle: getChildrensSongTitle,
  getUrl: getChildrensSongUrl,
  isValid: isValidChildrensSongNumber,
  search: searchChildrensSongByTitle,
});

const hymnLoaders: Record<string, () => Promise<HymnModule>> = {
  es: () => import('../data/hymns-es').then(m => ({
    hymns: m.SPANISH_HYMNS, getTitle: m.getSpanishHymnTitle, getUrl: m.getSpanishHymnUrl,
    isValid: m.isValidSpanishHymnNumber, search: m.searchSpanishHymnByTitle,
  })),
  pt: () => import('../data/hymns-pt').then(m => ({
    hymns: m.PORTUGUESE_HYMNS, getTitle: m.getPortugueseHymnTitle, getUrl: m.getPortugueseHymnUrl,
    isValid: m.isValidPortugueseHymnNumber, search: m.searchPortugueseHymnByTitle, maxNumber: 204,
  })),
  de: () => import('../data/hymns-de').then(m => ({
    hymns: m.GERMAN_HYMNS, getTitle: m.getGermanHymnTitle, getUrl: m.getGermanHymnUrl,
    isValid: m.isValidGermanHymnNumber, search: m.searchGermanHymnByTitle,
  })),
  zh: () => import('../data/hymns-zh').then(m => ({
    hymns: m.CHINESE_HYMNS, getTitle: m.getChineseHymnTitle, getUrl: m.getChineseHymnUrl,
    isValid: m.isValidChineseHymnNumber, search: m.searchChineseHymnByTitle, maxNumber: 200,
  })),
  ko: () => import('../data/hymns-ko').then(m => ({
    hymns: m.KOREAN_HYMNS, getTitle: m.getKoreanHymnTitle, getUrl: m.getKoreanHymnUrl,
    isValid: m.isValidKoreanHymnNumber, search: m.searchKoreanHymnByTitle, maxNumber: 201,
  })),
  ja: () => import('../data/hymns-ja').then(m => ({
    hymns: m.JAPANESE_HYMNS, getTitle: m.getJapaneseHymnTitle, getUrl: m.getJapaneseHymnUrl,
    isValid: m.isValidJapaneseHymnNumber, search: m.searchJapaneseHymnByTitle, maxNumber: 200,
  })),
  fr: () => import('../data/hymns-fr').then(m => ({
    hymns: m.FRENCH_HYMNS, getTitle: m.getFrenchHymnTitle, getUrl: m.getFrenchHymnUrl,
    isValid: m.isValidFrenchHymnNumber, search: m.searchFrenchHymnByTitle, maxNumber: 204,
  })),
  it: () => import('../data/hymns-it').then(m => ({
    hymns: m.ITALIAN_HYMNS, getTitle: m.getItalianHymnTitle, getUrl: m.getItalianHymnUrl,
    isValid: m.isValidItalianHymnNumber, search: m.searchItalianHymnByTitle, maxNumber: 202,
  })),
};

const childrensLoaders: Record<string, () => Promise<ChildrensModule>> = {
  es: () => import('../data/childrensSongbook-es').then(m => ({
    songs: m.SPANISH_CHILDRENS_SONGBOOK, getTitle: m.getSpanishChildrensSongTitle,
    getUrl: m.getSpanishChildrensSongUrl, isValid: m.isValidSpanishChildrensSongNumber,
    search: m.searchSpanishChildrensSongByTitle,
  })),
  ko: () => import('../data/childrensSongbook-ko').then(m => ({
    songs: m.KOREAN_CHILDRENS_SONGBOOK, getTitle: m.getKoreanChildrensSongTitle,
    getUrl: m.getKoreanChildrensSongUrl, isValid: m.isValidKoreanChildrensSongNumber,
    search: m.searchKoreanChildrensSongByTitle,
  })),
  fr: () => import('../data/childrensSongbook-fr').then(m => ({
    songs: m.FRENCH_CHILDRENS_SONGBOOK, getTitle: m.getFrenchChildrensSongTitle,
    getUrl: m.getFrenchChildrensSongUrl, isValid: m.isValidFrenchChildrensSongNumber,
    search: m.searchFrenchChildrensSongByTitle,
  })),
  de: () => import('../data/childrensSongbook-de').then(m => ({
    songs: m.GERMAN_CHILDRENS_SONGBOOK, getTitle: m.getGermanChildrensSongTitle,
    getUrl: m.getGermanChildrensSongUrl, isValid: m.isValidGermanChildrensSongNumber,
    search: m.searchGermanChildrensSongByTitle,
  })),
  pt: () => import('../data/childrensSongbook-pt').then(m => ({
    songs: m.PORTUGUESE_CHILDRENS_SONGBOOK, getTitle: m.getPortugueseChildrensSongTitle,
    getUrl: m.getPortugueseChildrensSongUrl, isValid: m.isValidPortugueseChildrensSongNumber,
    search: m.searchPortugueseChildrensSongByTitle,
  })),
  zh: () => import('../data/childrensSongbook-zh').then(m => ({
    songs: m.CHINESE_CHILDRENS_SONGBOOK, getTitle: m.getChineseChildrensSongTitle,
    getUrl: m.getChineseChildrensSongUrl, isValid: m.isValidChineseChildrensSongNumber,
    search: m.searchChineseChildrensSongByTitle,
  })),
  ja: () => import('../data/childrensSongbook-ja').then(m => ({
    songs: m.JAPANESE_CHILDRENS_SONGBOOK, getTitle: m.getJapaneseChildrensSongTitle,
    getUrl: m.getJapaneseChildrensSongUrl, isValid: m.isValidJapaneseChildrensSongNumber,
    search: m.searchJapaneseChildrensSongByTitle,
  })),
  it: () => import('../data/childrensSongbook-it').then(m => ({
    songs: m.ITALIAN_CHILDRENS_SONGBOOK, getTitle: m.getItalianChildrensSongTitle,
    getUrl: m.getItalianChildrensSongUrl, isValid: m.isValidItalianChildrensSongNumber,
    search: m.searchItalianChildrensSongByTitle,
  })),
};

/**
 * Preload hymn and children's song data for a language.
 * Call this when the user changes language to ensure synchronous lookups work.
 */
export const preloadSongData = async (lang: string): Promise<void> => {
  if (lang === 'en') return;
  const promises: Promise<void>[] = [];
  if (hymnLoaders[lang] && !hymnCache.has(lang)) {
    promises.push(hymnLoaders[lang]().then(mod => { hymnCache.set(lang, mod); }));
  }
  if (childrensLoaders[lang] && !childrensCache.has(lang)) {
    promises.push(childrensLoaders[lang]().then(mod => { childrensCache.set(lang, mod); }));
  }
  await Promise.all(promises);
};

function getHymnModule(lang: string): HymnModule {
  return hymnCache.get(lang) || hymnCache.get('en')!;
}

function getChildrensModule(lang: string): ChildrensModule {
  return childrensCache.get(lang) || childrensCache.get('en')!;
}

const LANGUAGES_WITH_CUSTOM_HYMNAL = ['pt', 'de', 'es', 'zh', 'ko', 'ja', 'fr', 'it'];

export const hasCustomHymnal = (lang: string): boolean => {
  return LANGUAGES_WITH_CUSTOM_HYMNAL.includes(lang);
};

const sortResults = (results: SongSearchResult[], searchTerm: string): SongSearchResult[] => {
  const term = searchTerm.toLowerCase().trim();
  return results.sort((a, b) => {
    const aExact = a.title.toLowerCase().startsWith(term);
    const bExact = b.title.toLowerCase().startsWith(term);
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    if (a.type !== b.type) return a.type === 'hymn' ? -1 : 1;
    if (a.type === 'hymn') return parseInt(a.number) - parseInt(b.number);
    const aNum = parseInt(a.number.replace(/[a-z]/g, ''));
    const bNum = parseInt(b.number.replace(/[a-z]/g, ''));
    if (aNum !== bNum) return aNum - bNum;
    return a.number.localeCompare(b.number);
  }).slice(0, 10);
};

export const searchSongsByTitle = (searchTerm: string, songType?: SongType, lang: string = 'en'): SongSearchResult[] => {
  if (!searchTerm.trim()) return [];
  const results: SongSearchResult[] = [];

  if (!songType || songType === 'hymn') {
    const mod = getHymnModule(lang);
    const hymnResults = mod.search(searchTerm);
    results.push(...hymnResults.map(r => ({
      number: r.number.toString(), title: r.title, type: 'hymn' as SongType,
    })));
  }

  if (!songType || songType === 'childrens') {
    const mod = getChildrensModule(lang);
    const childResults = mod.search(searchTerm);
    results.push(...childResults.map(r => ({
      number: r.number.toString(), title: r.title, type: 'childrens' as SongType,
    })));
  }

  return sortResults(results, searchTerm);
};

export const getSongTitle = (number: string, type: SongType, lang: string = 'en'): string => {
  if (type === 'hymn') {
    return getHymnModule(lang).getTitle(parseInt(number));
  }
  return getChildrensModule(lang).getTitle(number);
};

export const getSongUrl = (number: string, type: SongType, lang: string = 'en'): string => {
  if (type === 'hymn') {
    if (hymnCache.has(lang)) {
      return getHymnModule(lang).getUrl(parseInt(number));
    }
    const baseUrl = getHymnUrl(parseInt(number));
    if (lang !== 'en' && baseUrl) {
      const churchLangCode = getChurchLanguageCode(lang);
      return baseUrl.replace('lang=eng', `lang=${churchLangCode}`);
    }
    return baseUrl;
  }

  if (childrensCache.has(lang)) {
    return getChildrensModule(lang).getUrl(number);
  }
  const baseUrl = getChildrensSongUrl(number);
  if (lang !== 'en' && baseUrl) {
    const churchLangCode = getChurchLanguageCode(lang);
    return baseUrl.replace('lang=eng', `lang=${churchLangCode}`);
  }
  return baseUrl;
};

export const isValidSongNumber = (number: string, type: SongType, lang: string = 'en'): boolean => {
  if (type === 'hymn') {
    return getHymnModule(lang).isValid(parseInt(number));
  }
  return getChildrensModule(lang).isValid(number);
};

export const getSongInfo = (number: string, type: SongType, lang: string = 'en'): SongResult | null => {
  const title = getSongTitle(number, type, lang);
  if (!title) return null;
  return { number, title, type, url: getSongUrl(number, type, lang) };
};

export const getConflictingSongs = (number: string, lang: string = 'en'): SongResult[] => {
  const results: SongResult[] = [];
  const hymnMod = getHymnModule(lang);
  if (hymnMod.isValid(parseInt(number))) {
    results.push({
      number, title: hymnMod.getTitle(parseInt(number)),
      type: 'hymn', url: hymnMod.getUrl(parseInt(number)),
    });
  }
  const childMod = getChildrensModule(lang);
  if (childMod.isValid(number)) {
    results.push({
      number, title: childMod.getTitle(number),
      type: 'childrens', url: childMod.getUrl(number),
    });
  }
  return results;
};

export const getAvailableSongNumbers = (type: SongType, lang: string = 'en'): string[] => {
  if (type === 'hymn') {
    return Object.keys(getHymnModule(lang).hymns).sort((a, b) => parseInt(a) - parseInt(b));
  }
  const songs = getChildrensModule(lang).songs;
  return Object.keys(songs).sort((a, b) => {
    const aNum = parseInt(a.replace(/[a-z]/g, ''));
    const bNum = parseInt(b.replace(/[a-z]/g, ''));
    if (aNum !== bNum) return aNum - bNum;
    return a.localeCompare(b);
  });
};

export const getSongTypeDisplayName = (type: SongType): string => {
  return type === 'hymn' ? 'Hymn' : 'Children\'s Song';
};

export const getSongTypeShortName = (type: SongType): string => {
  return type === 'hymn' ? 'H' : 'CS';
};

const MAX_HYMN_NUMBERS: Record<string, number> = {
  en: 341, pt: 204, de: 200, zh: 200, ko: 201, ja: 200, fr: 204, it: 202, es: 209,
};

export const getMaxHymnNumber = (lang: string = 'en'): number => {
  if (MAX_HYMN_NUMBERS[lang]) return MAX_HYMN_NUMBERS[lang];
  const mod = hymnCache.get(lang);
  if (mod) return Object.keys(mod.hymns).length;
  return 341;
};
