import { LDS_HYMNS, getHymnTitle, getHymnUrl, isValidHymnNumber, searchHymnByTitle } from '../data/hymns';
import { CHILDRENS_SONGBOOK, getChildrensSongTitle, getChildrensSongUrl, isValidChildrensSongNumber, searchChildrensSongByTitle } from '../data/childrensSongbook';
import {
  SPANISH_CHILDRENS_SONGBOOK,
  getSpanishChildrensSongTitle,
  getSpanishChildrensSongUrl,
  isValidSpanishChildrensSongNumber,
  searchSpanishChildrensSongByTitle
} from '../data/childrensSongbook-es';
import {
  PORTUGUESE_HYMNS,
  getPortugueseHymnTitle,
  getPortugueseHymnUrl,
  isValidPortugueseHymnNumber,
  searchPortugueseHymnByTitle,
  getChurchLanguageCode
} from '../data/hymns-pt';
import {
  GERMAN_HYMNS,
  getGermanHymnTitle,
  getGermanHymnUrl,
  isValidGermanHymnNumber,
  searchGermanHymnByTitle
} from '../data/hymns-de';
import {
  SPANISH_HYMNS,
  getSpanishHymnTitle,
  getSpanishHymnUrl,
  isValidSpanishHymnNumber,
  searchSpanishHymnByTitle
} from '../data/hymns-es';
import {
  CHINESE_HYMNS,
  getChineseHymnTitle,
  getChineseHymnUrl,
  isValidChineseHymnNumber,
  searchChineseHymnByTitle
} from '../data/hymns-zh';
import {
  KOREAN_HYMNS,
  getKoreanHymnTitle,
  getKoreanHymnUrl,
  isValidKoreanHymnNumber,
  searchKoreanHymnByTitle
} from '../data/hymns-ko';
import {
  JAPANESE_HYMNS,
  getJapaneseHymnTitle,
  getJapaneseHymnUrl,
  isValidJapaneseHymnNumber,
  searchJapaneseHymnByTitle
} from '../data/hymns-ja';
import {
  FRENCH_HYMNS,
  getFrenchHymnTitle,
  getFrenchHymnUrl,
  isValidFrenchHymnNumber,
  searchFrenchHymnByTitle
} from '../data/hymns-fr';
import {
  KOREAN_CHILDRENS_SONGBOOK,
  getKoreanChildrensSongTitle,
  getKoreanChildrensSongUrl,
  isValidKoreanChildrensSongNumber,
  searchKoreanChildrensSongByTitle
} from '../data/childrensSongbook-ko';
import {
  ITALIAN_HYMNS,
  getItalianHymnTitle,
  getItalianHymnUrl,
  isValidItalianHymnNumber,
  searchItalianHymnByTitle
} from '../data/hymns-it';
import {
  ITALIAN_CHILDRENS_SONGBOOK,
  getItalianChildrensSongTitle,
  getItalianChildrensSongUrl,
  isValidItalianChildrensSongNumber,
  searchItalianChildrensSongByTitle
} from '../data/childrensSongbook-it';
import {
  FRENCH_CHILDRENS_SONGBOOK,
  getFrenchChildrensSongTitle,
  getFrenchChildrensSongUrl,
  isValidFrenchChildrensSongNumber,
  searchFrenchChildrensSongByTitle
} from '../data/childrensSongbook-fr';
import {
  GERMAN_CHILDRENS_SONGBOOK,
  getGermanChildrensSongTitle,
  getGermanChildrensSongUrl,
  isValidGermanChildrensSongNumber,
  searchGermanChildrensSongByTitle
} from '../data/childrensSongbook-de';
import {
  PORTUGUESE_CHILDRENS_SONGBOOK,
  getPortugueseChildrensSongTitle,
  getPortugueseChildrensSongUrl,
  isValidPortugueseChildrensSongNumber,
  searchPortugueseChildrensSongByTitle
} from '../data/childrensSongbook-pt';
import {
  CHINESE_CHILDRENS_SONGBOOK,
  getChineseChildrensSongTitle,
  getChineseChildrensSongUrl,
  isValidChineseChildrensSongNumber,
  searchChineseChildrensSongByTitle
} from '../data/childrensSongbook-zh';
import {
  JAPANESE_CHILDRENS_SONGBOOK,
  getJapaneseChildrensSongTitle,
  getJapaneseChildrensSongUrl,
  isValidJapaneseChildrensSongNumber,
  searchJapaneseChildrensSongByTitle
} from '../data/childrensSongbook-ja';

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

// Languages that have their own hymn database with different numbering
const LANGUAGES_WITH_CUSTOM_HYMNAL = ['pt', 'de', 'es', 'zh', 'ko', 'ja', 'fr', 'it'];

// Check if a language uses a custom hymnal (different numbering system)
export const hasCustomHymnal = (lang: string): boolean => {
  return LANGUAGES_WITH_CUSTOM_HYMNAL.includes(lang);
};

// Combined search function that searches both hymn types
// Language parameter uses language-specific hymn database when available
export const searchSongsByTitle = (searchTerm: string, songType?: SongType, lang: string = 'en'): SongSearchResult[] => {
  if (!searchTerm.trim()) return [];

  const results: SongSearchResult[] = [];

  // Search hymns if no specific type or if hymns requested
  if (!songType || songType === 'hymn') {
    // Use language-specific hymn database if available
    if (lang === 'pt') {
      const hymnResults = searchPortugueseHymnByTitle(searchTerm);
      results.push(...hymnResults.map(result => ({
        number: result.number.toString(),
        title: result.title,
        type: 'hymn' as SongType
      })));
    } else if (lang === 'de') {
      const hymnResults = searchGermanHymnByTitle(searchTerm);
      results.push(...hymnResults.map(result => ({
        number: result.number.toString(),
        title: result.title,
        type: 'hymn' as SongType
      })));
    } else if (lang === 'es') {
      const hymnResults = searchSpanishHymnByTitle(searchTerm);
      results.push(...hymnResults.map(result => ({
        number: result.number.toString(),
        title: result.title,
        type: 'hymn' as SongType
      })));
    } else if (lang === 'zh') {
      const hymnResults = searchChineseHymnByTitle(searchTerm);
      results.push(...hymnResults.map(result => ({
        number: result.number.toString(),
        title: result.title,
        type: 'hymn' as SongType
      })));
    } else if (lang === 'ko') {
      const hymnResults = searchKoreanHymnByTitle(searchTerm);
      results.push(...hymnResults.map(result => ({
        number: result.number.toString(),
        title: result.title,
        type: 'hymn' as SongType
      })));
    } else if (lang === 'ja') {
      const hymnResults = searchJapaneseHymnByTitle(searchTerm);
      results.push(...hymnResults.map(result => ({
        number: result.number.toString(),
        title: result.title,
        type: 'hymn' as SongType
      })));
    } else if (lang === 'fr') {
      const hymnResults = searchFrenchHymnByTitle(searchTerm);
      results.push(...hymnResults.map(result => ({
        number: result.number.toString(),
        title: result.title,
        type: 'hymn' as SongType
      })));
    } else if (lang === 'it') {
      const hymnResults = searchItalianHymnByTitle(searchTerm);
      results.push(...hymnResults.map(result => ({
        number: result.number.toString(),
        title: result.title,
        type: 'hymn' as SongType
      })));
    } else {
      const hymnResults = searchHymnByTitle(searchTerm);
      results.push(...hymnResults.map(result => ({
        number: result.number.toString(),
        title: result.title,
        type: 'hymn' as SongType
      })));
    }
  }

  // Search children's songs if no specific type or if children's songs requested
  if (!songType || songType === 'childrens') {
    if (lang === 'es') {
      const childrensResults = searchSpanishChildrensSongByTitle(searchTerm);
      results.push(...childrensResults.map(result => ({
        number: result.number,
        title: result.title,
        type: 'childrens' as SongType
      })));
    } else if (lang === 'ko') {
      const childrensResults = searchKoreanChildrensSongByTitle(searchTerm);
      results.push(...childrensResults.map(result => ({
        number: result.number,
        title: result.title,
        type: 'childrens' as SongType
      })));
    } else if (lang === 'fr') {
      const childrensResults = searchFrenchChildrensSongByTitle(searchTerm);
      results.push(...childrensResults.map(result => ({
        number: result.number,
        title: result.title,
        type: 'childrens' as SongType
      })));
    } else if (lang === 'de') {
      const childrensResults = searchGermanChildrensSongByTitle(searchTerm);
      results.push(...childrensResults.map(result => ({
        number: result.number,
        title: result.title,
        type: 'childrens' as SongType
      })));
    } else if (lang === 'pt') {
      const childrensResults = searchPortugueseChildrensSongByTitle(searchTerm);
      results.push(...childrensResults.map(result => ({
        number: result.number,
        title: result.title,
        type: 'childrens' as SongType
      })));
    } else if (lang === 'zh') {
      const childrensResults = searchChineseChildrensSongByTitle(searchTerm);
      results.push(...childrensResults.map(result => ({
        number: result.number,
        title: result.title,
        type: 'childrens' as SongType
      })));
    } else if (lang === 'ja') {
      const childrensResults = searchJapaneseChildrensSongByTitle(searchTerm);
      results.push(...childrensResults.map(result => ({
        number: result.number,
        title: result.title,
        type: 'childrens' as SongType
      })));
    } else if (lang === 'it') {
      const childrensResults = searchItalianChildrensSongByTitle(searchTerm);
      results.push(...childrensResults.map(result => ({
        number: result.number,
        title: result.title,
        type: 'childrens' as SongType
      })));
    } else {
      const childrensResults = searchChildrensSongByTitle(searchTerm);
      results.push(...childrensResults.map(result => ({
        number: result.number,
        title: result.title,
        type: 'childrens' as SongType
      })));
    }
  }

  // Sort by relevance (exact matches first, then by type, then by number)
  return results.sort((a, b) => {
    const term = searchTerm.toLowerCase().trim();
    const aExact = a.title.toLowerCase().startsWith(term);
    const bExact = b.title.toLowerCase().startsWith(term);

    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    // If both are exact or both are not exact, sort by type (hymns first), then by number
    if (a.type !== b.type) {
      return a.type === 'hymn' ? -1 : 1;
    }

    // For hymns, sort by numeric value
    if (a.type === 'hymn') {
      return parseInt(a.number) - parseInt(b.number);
    }

    // For children's songs, sort by numeric part first, then by letter suffix
    const aNum = parseInt(a.number.replace(/[a-z]/g, ''));
    const bNum = parseInt(b.number.replace(/[a-z]/g, ''));
    if (aNum !== bNum) return aNum - bNum;

    // If same number, sort by letter (a comes before b)
    return a.number.localeCompare(b.number);
  }).slice(0, 10); // Limit to 10 results
};

// Get song title by number and type
// Language parameter uses language-specific hymn database when available
export const getSongTitle = (number: string, type: SongType, lang: string = 'en'): string => {
  if (type === 'hymn') {
    // Use language-specific hymn database if available
    if (lang === 'pt') {
      return getPortugueseHymnTitle(parseInt(number));
    }
    if (lang === 'de') {
      return getGermanHymnTitle(parseInt(number));
    }
    if (lang === 'es') {
      return getSpanishHymnTitle(parseInt(number));
    }
    if (lang === 'zh') {
      return getChineseHymnTitle(parseInt(number));
    }
    if (lang === 'ko') {
      return getKoreanHymnTitle(parseInt(number));
    }
    if (lang === 'ja') {
      return getJapaneseHymnTitle(parseInt(number));
    }
    if (lang === 'fr') {
      return getFrenchHymnTitle(parseInt(number));
    }
    if (lang === 'it') {
      return getItalianHymnTitle(parseInt(number));
    }
    return getHymnTitle(parseInt(number));
  } else {
    // Use language-specific children's songs database if available
    if (lang === 'es') {
      return getSpanishChildrensSongTitle(number);
    }
    if (lang === 'ko') {
      return getKoreanChildrensSongTitle(number);
    }
    if (lang === 'fr') {
      return getFrenchChildrensSongTitle(number);
    }
    if (lang === 'de') {
      return getGermanChildrensSongTitle(number);
    }
    if (lang === 'pt') {
      return getPortugueseChildrensSongTitle(number);
    }
    if (lang === 'zh') {
      return getChineseChildrensSongTitle(number);
    }
    if (lang === 'ja') {
      return getJapaneseChildrensSongTitle(number);
    }
    if (lang === 'it') {
      return getItalianChildrensSongTitle(number);
    }
    return getChildrensSongTitle(number);
  }
};

// Get song URL by number and type
// Language parameter uses language-specific hymn URL generation when available
export const getSongUrl = (number: string, type: SongType, lang: string = 'en'): string => {
  if (type === 'hymn') {
    // Use language-specific hymn URL generation if available
    if (lang === 'pt') {
      return getPortugueseHymnUrl(parseInt(number));
    }
    if (lang === 'de') {
      return getGermanHymnUrl(parseInt(number));
    }
    if (lang === 'es') {
      return getSpanishHymnUrl(parseInt(number));
    }
    if (lang === 'zh') {
      return getChineseHymnUrl(parseInt(number));
    }
    if (lang === 'ko') {
      return getKoreanHymnUrl(parseInt(number));
    }
    if (lang === 'ja') {
      return getJapaneseHymnUrl(parseInt(number));
    }
    if (lang === 'fr') {
      return getFrenchHymnUrl(parseInt(number));
    }
    if (lang === 'it') {
      return getItalianHymnUrl(parseInt(number));
    }
    // For other languages, use the standard English hymn URL but with appropriate lang parameter
    const baseUrl = getHymnUrl(parseInt(number));
    if (lang !== 'en' && baseUrl) {
      // Replace lang=eng with appropriate language code
      const churchLangCode = getChurchLanguageCode(lang);
      return baseUrl.replace('lang=eng', `lang=${churchLangCode}`);
    }
    return baseUrl;
  } else {
    // Use language-specific children's song URL if available
    if (lang === 'ko') {
      return getKoreanChildrensSongUrl(number);
    }
    if (lang === 'de') {
      return getGermanChildrensSongUrl(number);
    }
    if (lang === 'pt') {
      return getPortugueseChildrensSongUrl(number);
    }
    if (lang === 'es') {
      return getSpanishChildrensSongUrl(number);
    }
    if (lang === 'fr') {
      return getFrenchChildrensSongUrl(number);
    }
    if (lang === 'zh') {
      return getChineseChildrensSongUrl(number);
    }
    if (lang === 'ja') {
      return getJapaneseChildrensSongUrl(number);
    }
    if (lang === 'it') {
      return getItalianChildrensSongUrl(number);
    }
    // Children's songs - add language parameter if not English
    const baseUrl = getChildrensSongUrl(number);
    if (lang !== 'en' && baseUrl) {
      const churchLangCode = getChurchLanguageCode(lang);
      return baseUrl.replace('lang=eng', `lang=${churchLangCode}`);
    }
    return baseUrl;
  }
};

// Validate song number by type
// Language parameter validates against language-specific hymn database when available
export const isValidSongNumber = (number: string, type: SongType, lang: string = 'en'): boolean => {
  if (type === 'hymn') {
    // Use language-specific hymn validation if available
    if (lang === 'pt') {
      return isValidPortugueseHymnNumber(parseInt(number));
    }
    if (lang === 'de') {
      return isValidGermanHymnNumber(parseInt(number));
    }
    if (lang === 'es') {
      return isValidSpanishHymnNumber(parseInt(number));
    }
    if (lang === 'zh') {
      return isValidChineseHymnNumber(parseInt(number));
    }
    if (lang === 'ko') {
      return isValidKoreanHymnNumber(parseInt(number));
    }
    if (lang === 'ja') {
      return isValidJapaneseHymnNumber(parseInt(number));
    }
    if (lang === 'fr') {
      return isValidFrenchHymnNumber(parseInt(number));
    }
    if (lang === 'it') {
      return isValidItalianHymnNumber(parseInt(number));
    }
    return isValidHymnNumber(parseInt(number));
  } else {
    // Use language-specific children's songs validation if available
    if (lang === 'es') {
      return isValidSpanishChildrensSongNumber(number);
    }
    if (lang === 'ko') {
      return isValidKoreanChildrensSongNumber(number);
    }
    if (lang === 'fr') {
      return isValidFrenchChildrensSongNumber(number);
    }
    if (lang === 'de') {
      return isValidGermanChildrensSongNumber(number);
    }
    if (lang === 'pt') {
      return isValidPortugueseChildrensSongNumber(number);
    }
    if (lang === 'zh') {
      return isValidChineseChildrensSongNumber(number);
    }
    if (lang === 'ja') {
      return isValidJapaneseChildrensSongNumber(number);
    }
    if (lang === 'it') {
      return isValidItalianChildrensSongNumber(number);
    }
    return isValidChildrensSongNumber(number);
  }
};

// Get song info by number and type
export const getSongInfo = (number: string, type: SongType, lang: string = 'en'): SongResult | null => {
  const title = getSongTitle(number, type, lang);
  if (!title) return null;

  return {
    number,
    title,
    type,
    url: getSongUrl(number, type, lang)
  };
};

// Check if a number exists in both hymn types (for conflict detection)
export const getConflictingSongs = (number: string, lang: string = 'en'): SongResult[] => {
  const results: SongResult[] = [];

  if (lang === 'pt') {
    if (isValidPortugueseHymnNumber(parseInt(number))) {
      results.push({
        number,
        title: getPortugueseHymnTitle(parseInt(number)),
        type: 'hymn',
        url: getPortugueseHymnUrl(parseInt(number))
      });
    }
  } else if (lang === 'de') {
    if (isValidGermanHymnNumber(parseInt(number))) {
      results.push({
        number,
        title: getGermanHymnTitle(parseInt(number)),
        type: 'hymn',
        url: getGermanHymnUrl(parseInt(number))
      });
    }
  } else if (lang === 'es') {
    if (isValidSpanishHymnNumber(parseInt(number))) {
      results.push({
        number,
        title: getSpanishHymnTitle(parseInt(number)),
        type: 'hymn',
        url: getSpanishHymnUrl(parseInt(number))
      });
    }
  } else if (lang === 'zh') {
    if (isValidChineseHymnNumber(parseInt(number))) {
      results.push({
        number,
        title: getChineseHymnTitle(parseInt(number)),
        type: 'hymn',
        url: getChineseHymnUrl(parseInt(number))
      });
    }
  } else if (lang === 'ko') {
    if (isValidKoreanHymnNumber(parseInt(number))) {
      results.push({
        number,
        title: getKoreanHymnTitle(parseInt(number)),
        type: 'hymn',
        url: getKoreanHymnUrl(parseInt(number))
      });
    }
  } else if (lang === 'ja') {
    if (isValidJapaneseHymnNumber(parseInt(number))) {
      results.push({
        number,
        title: getJapaneseHymnTitle(parseInt(number)),
        type: 'hymn',
        url: getJapaneseHymnUrl(parseInt(number))
      });
    }
  } else if (lang === 'fr') {
    if (isValidFrenchHymnNumber(parseInt(number))) {
      results.push({
        number,
        title: getFrenchHymnTitle(parseInt(number)),
        type: 'hymn',
        url: getFrenchHymnUrl(parseInt(number))
      });
    }
  } else if (lang === 'it') {
    if (isValidItalianHymnNumber(parseInt(number))) {
      results.push({
        number,
        title: getItalianHymnTitle(parseInt(number)),
        type: 'hymn',
        url: getItalianHymnUrl(parseInt(number))
      });
    }
  } else {
    if (isValidHymnNumber(parseInt(number))) {
      results.push({
        number,
        title: getHymnTitle(parseInt(number)),
        type: 'hymn',
        url: getHymnUrl(parseInt(number))
      });
    }
  }

  // Check children's songs with language-specific validation
  if (lang === 'es') {
    if (isValidSpanishChildrensSongNumber(number)) {
      results.push({
        number,
        title: getSpanishChildrensSongTitle(number),
        type: 'childrens',
        url: getSpanishChildrensSongUrl(number)
      });
    }
  } else if (lang === 'ko') {
    if (isValidKoreanChildrensSongNumber(number)) {
      results.push({
        number,
        title: getKoreanChildrensSongTitle(number),
        type: 'childrens',
        url: getKoreanChildrensSongUrl(number)
      });
    }
  } else if (lang === 'fr') {
    if (isValidFrenchChildrensSongNumber(number)) {
      results.push({
        number,
        title: getFrenchChildrensSongTitle(number),
        type: 'childrens',
        url: getFrenchChildrensSongUrl(number)
      });
    }
  } else if (lang === 'de') {
    if (isValidGermanChildrensSongNumber(number)) {
      results.push({
        number,
        title: getGermanChildrensSongTitle(number),
        type: 'childrens',
        url: getGermanChildrensSongUrl(number)
      });
    }
  } else if (lang === 'zh') {
    if (isValidChineseChildrensSongNumber(number)) {
      results.push({
        number,
        title: getChineseChildrensSongTitle(number),
        type: 'childrens',
        url: getChineseChildrensSongUrl(number)
      });
    }
  } else if (lang === 'ja') {
    if (isValidJapaneseChildrensSongNumber(number)) {
      results.push({
        number,
        title: getJapaneseChildrensSongTitle(number),
        type: 'childrens',
        url: getJapaneseChildrensSongUrl(number)
      });
    }
  } else if (lang === 'pt') {
    if (isValidPortugueseChildrensSongNumber(number)) {
      results.push({
        number,
        title: getPortugueseChildrensSongTitle(number),
        type: 'childrens',
        url: getPortugueseChildrensSongUrl(number)
      });
    }
  } else if (lang === 'it') {
    if (isValidItalianChildrensSongNumber(number)) {
      results.push({
        number,
        title: getItalianChildrensSongTitle(number),
        type: 'childrens',
        url: getItalianChildrensSongUrl(number)
      });
    }
  } else if (isValidChildrensSongNumber(number)) {
    results.push({
      number,
      title: getChildrensSongTitle(number),
      type: 'childrens',
      url: getChildrensSongUrl(number)
    });
  }

  return results;
};

// Get all available song numbers for a specific type
export const getAvailableSongNumbers = (type: SongType, lang: string = 'en'): string[] => {
  if (type === 'hymn') {
    if (lang === 'pt') {
      return Object.keys(PORTUGUESE_HYMNS).sort((a, b) => parseInt(a) - parseInt(b));
    }
    if (lang === 'de') {
      return Object.keys(GERMAN_HYMNS).sort((a, b) => parseInt(a) - parseInt(b));
    }
    if (lang === 'es') {
      return Object.keys(SPANISH_HYMNS).sort((a, b) => parseInt(a) - parseInt(b));
    }
    if (lang === 'zh') {
      return Object.keys(CHINESE_HYMNS).sort((a, b) => parseInt(a) - parseInt(b));
    }
    if (lang === 'ko') {
      return Object.keys(KOREAN_HYMNS).sort((a, b) => parseInt(a) - parseInt(b));
    }
    if (lang === 'ja') {
      return Object.keys(JAPANESE_HYMNS).sort((a, b) => parseInt(a) - parseInt(b));
    }
    if (lang === 'fr') {
      return Object.keys(FRENCH_HYMNS).sort((a, b) => parseInt(a) - parseInt(b));
    }
    if (lang === 'it') {
      return Object.keys(ITALIAN_HYMNS).sort((a, b) => parseInt(a) - parseInt(b));
    }
    return Object.keys(LDS_HYMNS).sort((a, b) => parseInt(a) - parseInt(b));
  } else {
    // Use language-specific children's songbook if available
    if (lang === 'es') {
      return Object.keys(SPANISH_CHILDRENS_SONGBOOK).sort((a, b) => {
        const aNum = parseInt(a.replace(/[a-z]/g, ''));
        const bNum = parseInt(b.replace(/[a-z]/g, ''));
        if (aNum !== bNum) return aNum - bNum;
        return a.localeCompare(b);
      });
    }
    if (lang === 'ko') {
      return Object.keys(KOREAN_CHILDRENS_SONGBOOK).sort((a, b) => {
        const aNum = parseInt(a.replace(/[a-z]/g, ''));
        const bNum = parseInt(b.replace(/[a-z]/g, ''));
        if (aNum !== bNum) return aNum - bNum;
        return a.localeCompare(b);
      });
    }
    if (lang === 'de') {
      return Object.keys(GERMAN_CHILDRENS_SONGBOOK).sort((a, b) => {
        const aNum = parseInt(a.replace(/[a-z]/g, ''));
        const bNum = parseInt(b.replace(/[a-z]/g, ''));
        if (aNum !== bNum) return aNum - bNum;
        return a.localeCompare(b);
      });
    }
    if (lang === 'fr') {
      return Object.keys(FRENCH_CHILDRENS_SONGBOOK).sort((a, b) => {
        const aNum = parseInt(a.replace(/[a-z]/g, ''));
        const bNum = parseInt(b.replace(/[a-z]/g, ''));
        if (aNum !== bNum) return aNum - bNum;
        return a.localeCompare(b);
      });
    }
    if (lang === 'pt') {
      return Object.keys(PORTUGUESE_CHILDRENS_SONGBOOK).sort((a, b) => {
        const aNum = parseInt(a.replace(/[a-z]/g, ''));
        const bNum = parseInt(b.replace(/[a-z]/g, ''));
        if (aNum !== bNum) return aNum - bNum;
        return a.localeCompare(b);
      });
    }
    if (lang === 'zh') {
      return Object.keys(CHINESE_CHILDRENS_SONGBOOK).sort((a, b) => {
        const aNum = parseInt(a.replace(/[a-z]/g, ''));
        const bNum = parseInt(b.replace(/[a-z]/g, ''));
        if (aNum !== bNum) return aNum - bNum;
        return a.localeCompare(b);
      });
    }
    if (lang === 'ja') {
      return Object.keys(JAPANESE_CHILDRENS_SONGBOOK).sort((a, b) => {
        const aNum = parseInt(a.replace(/[a-z]/g, ''));
        const bNum = parseInt(b.replace(/[a-z]/g, ''));
        if (aNum !== bNum) return aNum - bNum;
        return a.localeCompare(b);
      });
    }
    return Object.keys(CHILDRENS_SONGBOOK).sort((a, b) => {
      const aNum = parseInt(a.replace(/[a-z]/g, ''));
      const bNum = parseInt(b.replace(/[a-z]/g, ''));
      if (aNum !== bNum) return aNum - bNum;
      return a.localeCompare(b);
    });
  }
};

// Get song type display name
export const getSongTypeDisplayName = (type: SongType): string => {
  return type === 'hymn' ? 'Hymn' : 'Children\'s Song';
};

// Get song type short name for UI
export const getSongTypeShortName = (type: SongType): string => {
  return type === 'hymn' ? 'H' : 'CS';
};

// Get the maximum valid hymn number for a language
export const getMaxHymnNumber = (lang: string = 'en'): number => {
  if (lang === 'pt') {
    return 204; // Portuguese hymnal has 204 hymns
  }
  if (lang === 'de') {
    return Object.keys(GERMAN_HYMNS).length;
  }
  if (lang === 'es') {
    return Object.keys(SPANISH_HYMNS).length;
  }
  if (lang === 'zh') {
    return 200; // Chinese hymnal has 200 hymns
  }
  if (lang === 'ko') {
    return 201; // Korean hymnal has 201 hymns
  }
  if (lang === 'ja') {
    return 200; // Japanese hymnal has 200 hymns
  }
  if (lang === 'fr') {
    return 204; // French hymnal has 204 hymns
  }
  if (lang === 'it') {
    return 202; // Italian hymnal has 202 hymns
  }
  return 341; // English hymnal has 341 regular hymns (plus new hymns 1001+)
};
