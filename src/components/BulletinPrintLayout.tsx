import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sanitizeHtml } from "../lib/sanitizeHtml";
import { linkifyHtml } from "../lib/linkifyHtml";
import { decodeHtml } from '../lib/decodeHtml';
import { sanitizedAnnouncementHtml } from '../lib/sanitizeCache';
import { LDS_IMAGES, getImageByIdSync } from '../data/images';
import { useSession } from '../lib/SessionContext';
import { themes } from '../data/themes';


import QRCode from 'qrcode';
import { SHORT_DOMAIN } from '../lib/config';
import {
  getUnitLabel,
  getUnitLowercase,
  getHigherUnitLabel,
  getUnitLeadershipLabel,
  getUnitMissionariesLabel,
  getAudienceDisplayName,
  getLeadershipMessageLabel,
  getTranslatedUnitLabel,
  UnitType
} from '../lib/terminology';

// Function to format date from ISO format to natural format with locale support
function formatDate(dateString: string, locale: string = 'en'): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-').map(Number);

    // Map i18n language codes to proper locale codes
    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'zh': 'zh-TW',
      'pt': 'pt-BR',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'ja': 'ja-JP',
      'ko': 'ko-KR'
    };
    const resolvedLocale = localeMap[locale] || locale;

    if (year && month && day) {
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString(resolvedLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    // Fallback
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString(resolvedLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return dateString;
  } catch {
    return dateString;
  }
}

// Function to shorten mission names for better display
function shortenMissionName(missionName: string): string {
  if (!missionName) return missionName;
  
  let shortened = missionName;
  
  // Special handling for very long mission names
  if (shortened.includes('Joseph Smith Memorial Building')) {
    return 'JSM Building';
  }
  if (shortened.includes('Missionary Training Center')) {
    return shortened.replace(/Missionary Training Center/gi, 'MTC');
  }
  if (shortened.includes('Temple Square')) {
    return shortened.replace(/Temple Square/gi, 'Temple Sq');
  }
  
  // Remove "Mission" at the end
  shortened = shortened.replace(/\s+Mission$/i, '');
  
  // Remove common words to save space
  shortened = shortened.replace(/\bMemorial\b/gi, 'Mem.');
  shortened = shortened.replace(/\bBuilding\b/gi, 'Bldg');
  shortened = shortened.replace(/\bCenter\b/gi, 'Ctr');
  shortened = shortened.replace(/\bUniversity\b/gi, 'Univ');
  shortened = shortened.replace(/\bInstitute\b/gi, 'Inst');
  
  // Country abbreviations
  const countryAbbreviations: Record<string, string> = {
    'Australia': 'AUS',
    'United States': 'USA',
    'United Kingdom': 'UK',
    'Canada': 'CAN',
    'France': 'FRA',
    'Germany': 'GER',
    'Italy': 'ITA',
    'Spain': 'SPA',
    'Sweden': 'SWE',
    'Norway': 'NOR',
    'Denmark': 'DEN',
    'Finland': 'FIN',
    'Netherlands': 'NED',
    'Belgium': 'BEL',
    'Switzerland': 'SUI',
    'Austria': 'AUT',
    'Portugal': 'POR',
    'Greece': 'GRE',
    'Turkey': 'TUR',
    'Russia': 'RUS',
    'Ukraine': 'UKR',
    'Poland': 'POL',
    'Czech Republic': 'CZE',
    'Hungary': 'HUN',
    'Romania': 'ROM',
    'Bulgaria': 'BUL',
    'Croatia': 'CRO',
    'Serbia': 'SER',
    'Slovenia': 'SLO',
    'Slovakia': 'SVK',
    'Estonia': 'EST',
    'Latvia': 'LAT',
    'Lithuania': 'LIT',
    'Belarus': 'BEL',
    'Moldova': 'MOL',
    'Georgia': 'GEO',
    'Armenia': 'ARM',
    'Azerbaijan': 'AZE',
    'Kazakhstan': 'KAZ',
    'Uzbekistan': 'UZB',
    'Kyrgyzstan': 'KGZ',
    'Tajikistan': 'TJK',
    'Turkmenistan': 'TKM',
    'Mongolia': 'MON',
    'Japan': 'JPN',
    'South Korea': 'S. Korea',
    'North Korea': 'N. Korea',
    'China': 'CHN',
    'Taiwan': 'TWN',
    'Hong Kong': 'HK',
    'Macau': 'MAC',
    'Philippines': 'PHI',
    'Thailand': 'THA',
    'Vietnam': 'VIE',
    'Cambodia': 'CAM',
    'Laos': 'LAO',
    'Myanmar': 'MYA',
    'Malaysia': 'MAL',
    'Singapore': 'SIN',
    'Indonesia': 'IND',
    'Bangladesh': 'BAN',
    'Sri Lanka': 'SRI',
    'Nepal': 'NEP',
    'Pakistan': 'PAK',
    'Afghanistan': 'AFG',
    'Iran': 'IRN',
    'Iraq': 'IRQ',
    'Syria': 'SYR',
    'Lebanon': 'LEB',
    'Jordan': 'JOR',
    'Israel': 'ISR',
    'Palestine': 'PAL',
    'Saudi Arabia': 'SAU',
    'United Arab Emirates': 'UAE',
    'Qatar': 'QAT',
    'Kuwait': 'KUW',
    'Bahrain': 'BAH',
    'Oman': 'OMA',
    'Yemen': 'YEM',
    'Egypt': 'EGY',
    'Libya': 'LIB',
    'Tunisia': 'TUN',
    'Algeria': 'ALG',
    'Morocco': 'MAR',
    'Sudan': 'SUD',
    'Ethiopia': 'ETH',
    'Eritrea': 'ERI',
    'Somalia': 'SOM',
    'Djibouti': 'DJI',
    'Uganda': 'UGA',
    'Tanzania': 'TAN',
    'Rwanda': 'RWA',
    'Burundi': 'BUR',
    'Malawi': 'MAL',
    'Zambia': 'ZAM',
    'Zimbabwe': 'ZIM',
    'Botswana': 'BOT',
    'Namibia': 'NAM',
    'Lesotho': 'LES',
    'Eswatini': 'SWA',
    'Madagascar': 'MAD',
    'Mauritius': 'MAU',
    'Seychelles': 'SEY',
    'Comoros': 'COM',
    'Cape Verde': 'CPV',
    'São Tomé and Príncipe': 'STP',
    'Equatorial Guinea': 'GNQ',
    'Gabon': 'GAB',
    'Congo': 'CON',
    'Central African Republic': 'CAR',
    'Chad': 'CHA',
    'Cameroon': 'CMR',
    'Niger': 'NER',
    'Mali': 'MAL',
    'Burkina Faso': 'BFA',
    'Senegal': 'SEN',
    'Gambia': 'GAM',
    'Guinea-Bissau': 'GNB',
    'Guinea': 'GUI',
    'Sierra Leone': 'SLE',
    'Liberia': 'LBR',
    'Ivory Coast': 'CIV',
    'Togo': 'TOG',
    'Benin': 'BEN',
    'Ghana': 'GHA',
    'Nigeria': 'NIG',
    'Mauritania': 'MRT',
    'Western Sahara': 'ESH',
    'South Africa': 'S. Africa',
    'New Zealand': 'NZ',
    'Brazil': 'BRA',
    'Argentina': 'ARG',
    'Chile': 'CHI',
    'Peru': 'PER',
    'Colombia': 'COL',
    'Venezuela': 'VEN',
    'Ecuador': 'ECU',
    'Bolivia': 'BOL',
    'Paraguay': 'PAR',
    'Uruguay': 'URU',
    'Guyana': 'GUY',
    'Suriname': 'SUR',
    'French Guiana': 'FGU'
  };
  
  // US State abbreviations
  const stateAbbreviations: Record<string, string> = {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY',
    'District of Columbia': 'DC'
  };
  
  // Apply country abbreviations
  for (const [country, abbrev] of Object.entries(countryAbbreviations)) {
    shortened = shortened.replace(new RegExp(`\\b${country}\\b`, 'gi'), abbrev);
  }
  
  // Apply US state abbreviations
  for (const [state, abbrev] of Object.entries(stateAbbreviations)) {
    shortened = shortened.replace(new RegExp(`\\b${state}\\b`, 'gi'), abbrev);
  }
  
  return shortened;
}

// Printers can't print the outer ~0.25in of a sheet, so content is kept inside this
// margin or the edges (QR codes, benediction, ward name) get cut off on paper.
const PRINT_SAFE_MARGIN = '0.35in 0.3in';

const BulletinPrintLayout = forwardRef<HTMLDivElement, { data: any, refs?: { page1?: React.RefObject<HTMLDivElement>, page2?: React.RefObject<HTMLDivElement> }, unitTypeOverride?: UnitType }>(({ data, refs, unitTypeOverride }, ref) => {
  const { user, profile } = useSession();
  const { t, i18n } = useTranslation();
  const backCoverRef = useRef<HTMLDivElement>(null);
  const announcementsRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState<{ backCover: boolean; announcements: boolean }>({ backCover: false, announcements: false });

  // Print font scale: 1 = normal, 1.25 = extra large. Bulletins saved with the retired
  // "Large" (1.15) print as extra large.
  const fontScale = typeof data.printFontScale === 'number' && data.printFontScale > 1 && data.printFontScale <= 1.5
    ? 1.25
    : 1;

  // One body text size for the whole bulletin. The chosen print size sets the target
  // (16px x scale); each area reports the largest body size it can hold without cutting
  // content off, and every area renders at the smallest of those, so all pages always
  // match. Only a page that genuinely can't hold its content at the target pulls the
  // others down with it.
  const BASE_BODY_PX = 16;
  const targetBodyPx = BASE_BODY_PX * fontScale;
  // Floor: a setting never shrinks more than 10% below its size, so Normal and Extra
  // Large always look different. Content that still doesn't fit is cut off with a warning.
  const MIN_BODY_PX = targetBodyPx * 0.9;
  const [annCap, setAnnCap] = useState(targetBodyPx);
  const [programCap, setProgramCap] = useState(targetBodyPx);
  const [backCap, setBackCap] = useState(targetBodyPx);
  const bodyPx = Math.round(Math.max(MIN_BODY_PX, Math.min(targetBodyPx, annCap, programCap, backCap)) * 10) / 10;
  // Auto-fit announcements: first add columns, then shrink the shared body size as a last resort
  const [autoColumns, setAutoColumns] = useState(0); // 0 = use default, otherwise a forced column count

  // Announcements marked web-only never reach paper; everything below
  // (column auto-fit, grouping, the section header) works off this list.
  const allPrintableAnnouncements = (data.announcements || []).filter((a: any) => !a.hideOnPrint);
  // Last resort once the text is at its smallest size: leave trailing announcements off
  // (with a "+N more" note) instead of cutting one off mid-sentence.
  const [annHidden, setAnnHidden] = useState(0);
  const printableAnnouncements = annHidden > 0 ? allPrintableAnnouncements.slice(0, allPrintableAnnouncements.length - annHidden) : allPrintableAnnouncements;
  const announcementCount = allPrintableAnnouncements.length;
  const announcementTotalChars = allPrintableAnnouncements.reduce((s: number, a: any) => s + (a.content?.length || 0) + (a.title?.length || 0), 0);
  const announcementsContentKeyRaw = announcementCount + ':' + announcementTotalChars;
  // Debounce the content key so the auto-fit measure/shrink loop (forced
  // reflows of two full off-screen print pages) runs once per typing pause
  // instead of on every keystroke.
  const [announcementsContentKey, setAnnouncementsContentKey] = useState(announcementsContentKeyRaw);
  useEffect(() => {
    if (announcementsContentKeyRaw === announcementsContentKey) return;
    const timer = setTimeout(() => setAnnouncementsContentKey(announcementsContentKeyRaw), 500);
    return () => clearTimeout(timer);
  }, [announcementsContentKeyRaw, announcementsContentKey]);
  const isHeavyContent = announcementTotalChars > 2000;
  const isLightContent = announcementTotalChars < 800;

  // Conservative starting guess; the auto-fit effect below adds columns one at
  // a time only when content actually overflows, so short lists keep fewer,
  // wider columns instead of always spreading across four.
  const defaultCols = announcementCount <= 2 || isLightContent ? 1 : (announcementCount >= 6 || isHeavyContent) ? 3 : 2;
  const announceColumnCount = Math.max(autoColumns, defaultCols);

  useEffect(() => {
    setAnnCap(targetBodyPx);
    setAutoColumns(0);
    setAnnHidden(0);
  }, [announcementsContentKey, data.printFontScale, data.printTightMargins, targetBodyPx]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!announcementsRef.current) return;
      const el = announcementsRef.current;
      const overflowV = el.scrollHeight - el.clientHeight;
      const overflowH = el.scrollWidth - el.clientWidth;
      if (overflowV <= 2 && overflowH <= 2) return;

      // Step 1: add columns one at a time before shrinking fonts
      if (announceColumnCount < 4) {
        setAutoColumns(announceColumnCount + 1);
        return;
      }
      // Step 2: shrink the shared body size as a last resort
      if (annCap > MIN_BODY_PX) {
        setAnnCap(Math.max(MIN_BODY_PX, Math.min(annCap, bodyPx) - targetBodyPx * 0.03));
        return;
      }
      // Step 3: at the smallest allowed size, leave the last announcement off
      if (annHidden < announcementCount - 1) setAnnHidden(annHidden + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, [annCap, annHidden, bodyPx, autoColumns, announceColumnCount, announcementsContentKey, data.printFontScale, data.printTightMargins]);

  // Detect when content is still cut off after auto-fit (for the warning banner)
  useEffect(() => {
    const check = () => {
      let backCover = false;
      let announcements = false;
      if (backCoverRef.current) {
        const el = backCoverRef.current;
        backCover = el.scrollHeight > el.clientHeight;
      }
      if (announcementsRef.current) {
        const el = announcementsRef.current;
        announcements = el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2;
      }
      setOverflow(prev => (prev.backCover === backCover && prev.announcements === announcements) ? prev : { backCover, announcements });
    };
    const t1 = setTimeout(check, 300);
    const t2 = setTimeout(check, 800);
    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => setTimeout(check, 80))
      : null;
    const raf = requestAnimationFrame(() => {
      if (backCoverRef.current) ro?.observe(backCoverRef.current);
      if (announcementsRef.current) ro?.observe(announcementsRef.current);
    });
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [data.announcements?.length, data.wardLeadership?.length, data.missionaries?.length, data.wardMissionaries?.length, data.serviceMissionaries?.length, data.printFontScale, data.printTightMargins, data.showQRCodeOnPrint, bodyPx]);

  // The program (right panel of page 2) uses fixed rem sizes (16px body), so the shared
  // body size is applied as a transform: laid out 1/fontScale wide, then scaled to
  // bodyPx/16. Transforms don't change layout height, so measuring here can't feed back.
  const programPanelRef = useRef<HTMLDivElement>(null);
  const programContentRef = useRef<HTMLDivElement>(null);
  const [programNaturalHeight, setProgramNaturalHeight] = useState(0);
  const programScale = bodyPx / BASE_BODY_PX;
  useEffect(() => {
    const measure = () => {
      const panel = programPanelRef.current;
      const content = programContentRef.current;
      if (!panel || !content) return;
      const style = getComputedStyle(panel);
      const available = panel.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      const natural = content.offsetHeight;
      if (!available || !natural) return;
      setProgramNaturalHeight(natural);
      // Largest body size at which the whole program fits the page height
      const cap = Math.min(targetBodyPx, BASE_BODY_PX * available / natural);
      setProgramCap(prev => Math.abs(prev - cap) < 0.05 ? prev : cap);
    };
    measure();
    // Fonts/images can settle after the first paint without resizing the content box
    const timers = [300, 1000].map(ms => setTimeout(measure, ms));
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (programContentRef.current) ro?.observe(programContentRef.current);
    return () => { timers.forEach(clearTimeout); ro?.disconnect(); };
  });

  // Same idea for the back cover (unit info) lists on page 1, except the content is laid
  // out 1/scale wide (then scaled down) so shrinking also frees horizontal room and columns
  // don't collide. Rows never wrap, so the laid-out height doesn't depend on width. The
  // horizontal limit is remembered (it only ever tightens) so the fit can't oscillate.
  const backContentRef = useRef<HTMLDivElement>(null);
  const backMaxHorizontal = useRef(Infinity);
  const [backNaturalHeight, setBackNaturalHeight] = useState(0);
  const backScale = Math.min(1, bodyPx / targetBodyPx);
  const backKey = JSON.stringify([data.wardLeadership, data.missionaries, data.wardMissionaries, data.serviceMissionaries, data.printFontScale, data.printTightMargins, data.showQRCodeOnPrint, data.meetingType, !!profile?.profile_slug]);
  // Like the announcements adding columns before shrinking: when the lists don't fit at the
  // chosen size, first move the QR code to the (mostly empty) front cover to free its height,
  // and only then shrink the text. Not done when the cover already holds a picture.
  const [qrOnCover, setQrOnCover] = useState(false);
  const showQR = !!profile?.profile_slug && data.showQRCodeOnPrint !== false;
  const coverHasImage = !!data.imageId && data.imageId !== 'none';
  // Also first stack the wide missionary rows (name + mission on one line, email below)
  // when they're too wide for the page at the chosen size.
  const [stackRows, setStackRows] = useState(false);
  const [backHidden, setBackHidden] = useState(0);
  useEffect(() => { backMaxHorizontal.current = Infinity; setBackCap(targetBodyPx); setQrOnCover(false); setStackRows(false); setBackHidden(0); }, [backKey, targetBodyPx]);
  useEffect(() => {
    const measure = () => {
      const box = backCoverRef.current;
      const content = backContentRef.current;
      if (!box || !content) return;
      // Small safety margin so rounding/trailing margins never clip the last row
      const available = box.clientHeight - 8;
      const natural = content.offsetHeight;
      if (!available || !natural) return;
      setBackNaturalHeight(natural);
      if (content.scrollWidth > content.clientWidth + 1) {
        if (!stackRows) {
          setStackRows(true); // re-measured with the stacked rows on the next pass
          return;
        }
        backMaxHorizontal.current = Math.min(backMaxHorizontal.current, bodyPx * content.clientWidth / content.scrollWidth);
      }
      const cap = Math.min(targetBodyPx, targetBodyPx * available / natural, backMaxHorizontal.current);
      if (cap < targetBodyPx - 0.05 && showQR && !qrOnCover && !coverHasImage) {
        setQrOnCover(true); // re-measured with the extra height on the next pass
        return;
      }
      // Still doesn't fit at the smallest allowed size: leave the last entry off
      if (cap < MIN_BODY_PX - 0.05 && backHidden < fullMissionaries.length + fullWardMissionaries.length + fullMilitaryMembers.length + fullServiceMissionaries.length) {
        setBackHidden(backHidden + 1);
        return;
      }
      setBackCap(prev => Math.abs(prev - cap) < 0.05 ? prev : cap);
    };
    measure();
    const timers = [300, 1000].map(ms => setTimeout(measure, ms));
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (backContentRef.current) ro?.observe(backContentRef.current);
    if (backCoverRef.current) ro?.observe(backCoverRef.current);
    return () => { timers.forEach(clearTimeout); ro?.disconnect(); };
  });

  // Front cover: scaled by the print size setting, backing off if it wouldn't fit the page
  const coverPanelRef = useRef<HTMLDivElement>(null);
  const coverContentRef = useRef<HTMLDivElement>(null);
  const [coverNaturalHeight, setCoverNaturalHeight] = useState(0);
  const [coverCap, setCoverCap] = useState(fontScale);
  const coverScale = Math.min(fontScale, coverCap);
  useEffect(() => {
    const measure = () => {
      const panel = coverPanelRef.current;
      const content = coverContentRef.current;
      if (!panel || !content) return;
      const style = getComputedStyle(panel);
      const available = panel.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      const natural = content.offsetHeight;
      if (!available || !natural) return;
      setCoverNaturalHeight(natural);
      const cap = Math.max(1, Math.min(fontScale, available / natural));
      setCoverCap(prev => Math.abs(prev - cap) < 0.01 ? prev : cap);
    };
    measure();
    const timers = [300, 1000].map(ms => setTimeout(measure, ms));
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (coverContentRef.current) ro?.observe(coverContentRef.current);
    return () => { timers.forEach(clearTimeout); ro?.disconnect(); };
  });

  const scalePx = (px: number) => `${Math.round(px * fontScale)}px`;
  // Back-cover lists are laid out at the target body size and scaled down to bodyPx.
  const backCoverPx = `${Math.round(targetBodyPx)}px`;

  // Tighter margins to fit more announcements on the page
  const tight = !!data.printTightMargins;
  const pad = {
    leftPanel: tight ? 'pl-2 pr-8 pt-2 pb-0' : isLightContent ? 'pl-4 pr-6 pt-3 pb-0' : 'pl-3 pr-12 pt-3 pb-0',
    // Centered on the half-page: the page's safe margin only narrows the outer edge, so the
    // fold-side padding adds it back (0.3in = PRINT_SAFE_MARGIN's horizontal inset).
    rightPanel: tight ? 'pl-[calc(0.3in+0.5rem)] pr-2 py-4' : 'pl-[calc(0.3in+1rem)] pr-4 py-6',
    announcementsGap: tight ? 'gap-2' : 'gap-4',
    announcementsList: tight ? 'space-y-0.5' : 'space-y-1',
    sectionMb: tight ? 'mb-0.5' : 'mb-1'
  };

  // Dynamic audience labels based on terminology
  const getAudienceLabel = (audience: string): string => {
    return getAudienceDisplayName(audience, unitTypeOverride);
  };

  // Helper function to check if ward info entry has meaningful data
  // For leadership, we only care about name/phone, not title (since titles are pre-populated)
  const hasValidLeadershipInfo = (entry: any) => {
    return entry && (entry.name?.trim() || entry.phone?.trim());
  };
  
  // For missionaries, we care about name, phone, mission, or email
  const hasValidMissionaryInfo = (entry: any) => {
    return entry && (entry.name?.trim() || entry.phone?.trim() || entry.mission?.trim() || entry.email?.trim());
  };

  // For service missionaries, we care about name or serviceName
  const hasValidServiceMissionaryInfo = (entry: any) => {
    return entry && (entry.name?.trim() || entry.serviceName?.trim());
  };

  // Filter out empty ward info entries
  const filteredWardLeadership = data.wardLeadership?.filter(hasValidLeadershipInfo) || [];
  const fullMissionaries = data.missionaries?.filter(hasValidMissionaryInfo) || [];
  const allWardMissionaries = data.wardMissionaries?.filter(hasValidMissionaryInfo) || [];
  const fullWardMissionaries = allWardMissionaries.filter((entry: any) => entry.serviceType !== 'military');
  const fullMilitaryMembers = allWardMissionaries.filter((entry: any) => entry.serviceType === 'military');
  const fullServiceMissionaries = data.serviceMissionaries?.filter(hasValidServiceMissionaryInfo) || [];

  // Check if there's any meaningful ward info to display
  const hasWardInfo = filteredWardLeadership.length > 0 || fullMissionaries.length > 0 || fullWardMissionaries.length > 0 || fullMilitaryMembers.length > 0 || fullServiceMissionaries.length > 0;

  // Entries left off when the lists can't fit at the smallest allowed size: the end of the
  // last section goes first, the leadership list is never trimmed.
  let backHiddenLeft = backHidden;
  const trimBack = (list: any[]) => {
    const n = Math.min(backHiddenLeft, list.length);
    backHiddenLeft -= n;
    return n > 0 ? list.slice(0, list.length - n) : list;
  };
  const filteredServiceMissionaries = trimBack(fullServiceMissionaries);
  const filteredMilitaryMembers = trimBack(fullMilitaryMembers);
  const filteredWardMissionaries = trimBack(fullWardMissionaries);
  const filteredMissionaries = trimBack(fullMissionaries);

  const selectedTheme = themes.find(t => t.name === data.userTheme);

  const hasOverflow = overflow.backCover || overflow.announcements;

  return (
    <div
      ref={ref}
      className="print-layout font-sans"
      style={{
        fontFamily: selectedTheme ? selectedTheme.fontFamily : 'sans-serif',
        fontSize: `${fontScale * 100}%`
      }}
    >
      {(annHidden > 0 || backHidden > 0) && (
        <div className="print-overflow-warning mb-3 p-3 bg-amber-100 border border-amber-300 rounded-lg text-amber-900 text-sm print:!hidden" role="status">
          {t('printPreview.entriesLeftOff', {
            defaultValue: 'Not everything fits at this text size, so {{parts}} left off the printed page (it stays in the digital bulletin). Choose a smaller size to print everything.',
            parts: [
              backHidden > 0 ? t('printPreview.leftOffBackCover', { defaultValue: '{{count}} back-cover entries', count: backHidden }) : '',
              annHidden > 0 ? t('printPreview.leftOffAnnouncements', { defaultValue: '{{count}} announcements', count: annHidden }) : '',
            ].filter(Boolean).join(' and ') + ' were',
          })}
        </div>
      )}
      {hasOverflow && (
        <div className="print-overflow-warning mb-3 p-3 bg-amber-100 border border-amber-300 rounded-lg text-amber-900 text-sm print:!hidden" role="status">
          {overflow.backCover && overflow.announcements
            ? t('printPreview.contentCutOffBoth')
            : overflow.backCover
              ? t('printPreview.contentCutOffBackCover')
              : t('printPreview.contentCutOffAnnouncements')}
        </div>
      )}
      {/* Page 1: Outside (landscape) */}
      <div
        ref={refs?.page1}
        className="print-page landscape w-[11in] h-[8.5in] flex"
        style={{ pageBreakAfter: 'always', padding: PRINT_SAFE_MARGIN }}
      >
                 {/* Back Cover (left) - Unit Information */}
          {data.meetingType === 'baptism' ? (
            <div className="w-1/2" />
          ) : (
          <div className={`w-1/2 flex flex-col justify-between text-left print:!text-sm print:!text-black ${pad.leftPanel}`}>
           {/* Scrollable content area - reserves space for QR code if enabled */}
           {/* min-h-0 lets this area shrink so the QR block below always stays on the page,
               however large the print font scale makes the leadership lists. */}
           <div ref={backCoverRef} className="flex-1 min-h-0 overflow-hidden">
            {/* Scale-to-fit wrapper: shrink the lists to the space above the QR block
                instead of cutting them off mid-line. */}
            <div style={backScale < 1 ? { height: backNaturalHeight * backScale } : undefined}>
            <div
              ref={backContentRef}
              style={backScale < 1 ? { width: `${100 / backScale}%`, transform: `scale(${backScale})`, transformOrigin: 'top left' } : undefined}
            >
              {/* Unit Leadership Table */}
              {filteredWardLeadership.length > 0 && (
                <div className={`w-full ${pad.sectionMb}`}>
                  <h2 style={{ fontSize: backCoverPx }} className={`font-bold print:!text-black w-full text-center ${tight ? 'mb-1' : 'mb-2'}`}>{t('terminology.wardLeadership', { unit: getTranslatedUnitLabel(t, unitTypeOverride) }).toUpperCase()}</h2>
                   <table className="w-full leading-tight" style={{ fontSize: backCoverPx }}>
                     <tbody>
                       {filteredWardLeadership.slice(0, data.showQRCodeOnPrint !== false ? filteredWardLeadership.length : 20).map((leader: any, idx: number) => (
                         <tr key={idx}>
                           <td className="py-0.5 font-bold pr-2 whitespace-nowrap" style={{ width: '45%' }}>{leader.title}</td>
                           <td className="py-0.5 font-bold pr-2 whitespace-nowrap" style={{ width: '30%' }}>{leader.name}</td>
                           <td className="py-0.5 text-right font-bold whitespace-nowrap" style={{ width: '34%' }}>
                             {leader.phone || ''}
                           </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                  {filteredWardLeadership.length > 20 && data.showQRCodeOnPrint === false && (
                    <p className="text-xs text-gray-600 mt-2 text-center">+ {filteredWardLeadership.length - 20} more leaders</p>
                  )}
                </div>
              )}

              {/* Missionaries Table */}
              {filteredMissionaries.length > 0 && (
                <div className={`w-full ${tight ? 'mb-1.5' : 'mb-3'}`}>
                  <h3 style={{ fontSize: backCoverPx }} className={`font-bold print:!text-black border-b-2 border-black pb-1 ${tight ? 'mb-0.5' : 'mb-1'}`}>{t('bulletin.missionaries').toUpperCase()}</h3>
                  <table className="w-full leading-tight" style={{ fontSize: backCoverPx }}>
                    <tbody>
                      {filteredMissionaries.slice(0, data.showQRCodeOnPrint !== false ? filteredMissionaries.length : 12).map((missionary: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-0 font-bold pr-1" style={{ width: '60%' }}>{missionary.name}</td>
                          <td className="py-0 text-right font-bold" style={{ width: '40%' }}>
                            {missionary.phone || ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredMissionaries.length > 12 && data.showQRCodeOnPrint === false && (
                    <p className="text-xs text-gray-600 mt-1 text-center">+ {filteredMissionaries.length - 12} {t('bulletin.moreMissionaries')}</p>
                  )}
                </div>
              )}

              {/* Missionaries from our ward */}
              {filteredWardMissionaries.length > 0 && (
                <div className={`w-full ${tight ? 'mb-1.5' : 'mb-3'}`}>
                  <h3 style={{ fontSize: backCoverPx }} className={`font-bold print:!text-black border-b-2 border-black pb-1 ${tight ? 'mb-0.5' : 'mb-1'}`}>{t('terminology.wardMissionaries', { unit: getTranslatedUnitLabel(t, unitTypeOverride) }).toUpperCase()}</h3>
                  {(() => {
                    const missionaryCount = filteredWardMissionaries.slice(0, data.showQRCodeOnPrint !== false ? filteredWardMissionaries.length : 15).length;
                    // Dynamic font sizing: fewer missionaries = larger font, more missionaries = smaller font
                    const fontSize = backCoverPx;
                    
                    return (
                      <div className="space-y-0.5 leading-tight whitespace-nowrap" style={{ fontSize }}>
                        {filteredWardMissionaries.slice(0, data.showQRCodeOnPrint !== false ? filteredWardMissionaries.length : 15).map((missionary: any, idx: number) => (
                      <div key={idx} className={stackRows ? 'py-0.5' : 'flex justify-between items-center py-0'}>
                        <div className={stackRows ? 'flex justify-between' : 'contents'}>
                          <div className="font-bold flex-shrink-0 pr-3">
                            {missionary.name}
                          </div>
                          <div className={stackRows ? 'text-right font-bold' : 'text-center flex-1 px-2 font-bold'}>
                            {missionary.mission && (
                              <span className="text-gray-600">{missionary.mission}</span>
                            )}
                          </div>
                        </div>
                        <div className={stackRows ? 'font-bold' : 'text-right flex-shrink-0 font-bold'}>
                          {missionary.email ? (
                            <span className="text-gray-700">{missionary.email}</span>
                          ) : (
                            <span className="text-gray-400">{t('bulletin.noEmail')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                      </div>
                    );
                  })()}
                  {filteredWardMissionaries.length > 15 && data.showQRCodeOnPrint === false && (
                    <p className="text-xs text-gray-600 mt-1 text-center">+ {filteredWardMissionaries.length - 15} {t('bulletin.moreWardMissionaries')}</p>
                  )}
                </div>
              )}

              {/* Serving in the Military */}
              {filteredMilitaryMembers.length > 0 && (
                <div className={`w-full ${tight ? 'mb-1.5' : 'mb-3'}`}>
                  <h3 style={{ fontSize: backCoverPx }} className={`font-bold print:!text-black border-b-2 border-black pb-1 ${tight ? 'mb-0.5' : 'mb-1'}`}>{t('bulletin.servingInMilitary', 'Serving in the Military').toUpperCase()}</h3>
                  {(() => {
                    const militaryCount = filteredMilitaryMembers.length;
                    // Dynamic font sizing: fewer entries = larger font, more entries = smaller font
                    const fontSize = backCoverPx;

                    return (
                      <div className="space-y-0.5 leading-tight whitespace-nowrap" style={{ fontSize }}>
                        {filteredMilitaryMembers.map((member: any, idx: number) => (
                          <div key={idx} className={stackRows ? 'py-0.5' : 'flex justify-between items-center py-0'}>
                            <div className={stackRows ? 'flex justify-between' : 'contents'}>
                              <div className="font-bold flex-shrink-0 pr-3">
                                {member.name}
                              </div>
                              <div className={stackRows ? 'text-right font-bold' : 'text-right flex-1 font-bold'}>
                                {member.mission && (
                                  <span className="text-gray-600">{member.mission}</span>
                                )}
                                {!stackRows && member.mission && member.email && <span className="text-gray-400"> · </span>}
                                {!stackRows && member.email && (
                                  <span className="text-gray-700">{member.email}</span>
                                )}
                              </div>
                            </div>
                            {stackRows && member.email && (
                              <div className="font-bold"><span className="text-gray-700">{member.email}</span></div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Service Missionaries */}
              {filteredServiceMissionaries.length > 0 && (
                <div className={`w-full ${tight ? 'mb-1.5' : 'mb-3'}`}>
                  <h3 style={{ fontSize: backCoverPx }} className={`font-bold print:!text-black border-b-2 border-black pb-1 ${tight ? 'mb-0.5' : 'mb-1'}`}>{t('bulletin.serviceMissionaries').toUpperCase()}</h3>
                  {(() => {
                    const serviceMissionaryCount = filteredServiceMissionaries.length;
                    // Dynamic font sizing: fewer missionaries = larger font, more missionaries = smaller font
                    const fontSize = backCoverPx;

                    return (
                      <div className="space-y-0.5 leading-tight whitespace-nowrap" style={{ fontSize }}>
                        {filteredServiceMissionaries.map((missionary: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center py-0">
                            <div className="font-bold flex-shrink-0 pr-3">
                              {missionary.name}
                            </div>
                            <div className="text-right flex-1 font-bold">
                              {missionary.serviceName ? (
                                <span className="text-gray-600">{missionary.serviceName}</span>
                              ) : (
                                <span className="text-gray-400">{t('bulletin.noServiceListed')}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {backHidden > 0 && (
                <p className="font-bold italic" style={{ fontSize: backCoverPx }}>
                  +{backHidden} {showQR ? t('printPreview.moreOnDigitalBulletin', 'more: see the digital bulletin') : t('printPreview.moreAnnouncements', 'more')}
                </p>
              )}
            </div>
            </div>
           </div>

           {/* QR Code - Fixed at bottom with reserved space, only if enabled */}
           {showQR && !qrOnCover && (
             <div className="w-full flex flex-col items-center justify-center text-center mt-2 pb-8 flex-shrink-0">
               <div className="mb-2">
                 <PrintQRCode profileSlug={profile.profile_slug} />
               </div>
               <p className="text-sm print:!text-base print:!text-black font-medium">
                 {t('qrCode.scanQrCodeToAccess')}
               </p>
             </div>
           )}

         </div>
         )}

        {/* Front Cover (right) */}
        <div ref={coverPanelRef} className={`w-1/2 flex flex-col justify-center items-center text-center print:!text-xl print:!text-black ${pad.rightPanel}`}>
          {/* Scaled with the print size setting like the rest of the bulletin, but never
              past the page: the scale backs off if the cover (e.g. with a picture) is tall. */}
          <div className="w-full flex-shrink-0 flex justify-center items-start" style={coverScale !== 1 && coverNaturalHeight ? { height: coverNaturalHeight * coverScale } : undefined}>
          <div ref={coverContentRef} className="flex flex-col items-center text-center flex-shrink-0" style={{ width: `${100 / coverScale}%`, ...(coverScale !== 1 ? { transform: `scale(${coverScale})`, transformOrigin: 'top center' } : {}) }}>
          {data.meetingType === 'baptism' ? (
            <>
              <p className="text-lg mb-1 print:!text-2xl print:!text-black uppercase">{t('bulletin.theBaptismOf')}</p>
              <h1 className="text-3xl font-bold mb-2 print:!text-4xl print:!text-black">{data.agenda?.find((i: any) => i.type === 'baptism_ordinance')?.candidateName || ''}</h1>
              <p className="text-lg mb-4 print:!text-2xl print:!text-black">{formatDate(data.date, i18n.language)}</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2 print:!text-4xl print:!text-black">{data.wardName || t('form.wardName', { unit: getTranslatedUnitLabel(t, unitTypeOverride) })}</h1>
              <p className="text-lg mb-1 print:!text-2xl print:!text-black">{formatDate(data.date, i18n.language)}</p>
              <p className="text-base mb-1 print:!text-xl print:!text-black">{t('bulletin.churchName')}</p>
              <p className="text-base mb-4 print:!text-xl print:!text-black">{t('bulletin.sacramentMeeting')}</p>
            </>
          )}

          {/* Image Display - moved below text, above theme */}
          {data.imageId && data.imageId !== 'none' && (
            <div className="mb-4">
              {(() => {
                // Use imageUrl directly if available (for custom uploaded images)
                // Otherwise fall back to getImageByIdSync for preset images
                const imageUrl = data.imageUrl || getImageByIdSync(data.imageId)?.url;
                return imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    className="max-w-full max-h-80 object-contain print:!max-h-96"
                    onError={(e) => {
                      // Hide broken images
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null;
              })()}
            </div>
          )}

          {data.theme && <p className="font-semibold italic text-sm text-gray-600 print:!text-lg print:!text-black">"{data.theme}"</p>}

          {/* QR code relocated here when the unit lists needed its space */}
          {showQR && qrOnCover && profile?.profile_slug && (
            <div className="flex flex-col items-center text-center mt-8">
              <div className="mb-2">
                <PrintQRCode profileSlug={profile.profile_slug} />
              </div>
              <p className="text-sm print:!text-base print:!text-black font-medium">
                {t('qrCode.scanQrCodeToAccess')}
              </p>
            </div>
          )}
          </div>
          </div>
        </div>
      </div>

      {/* Page 2: Inside (landscape) */}
      <div ref={refs?.page2} className="print-page landscape w-[11in] h-[8.5in] flex print:!text-xl print:!text-black" style={{ padding: PRINT_SAFE_MARGIN }}>
        {/* Announcements (left) - blank for baptism */}
        {data.meetingType === 'baptism' ? (
          <div className="w-1/2" />
        ) : (
        <div className={`w-1/2 text-left print:!text-black ${pad.leftPanel}`} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* No header over an empty panel: a minimal program without
                  announcements shouldn't print an "Announcements & Events"
                  title with nothing under it. */}
              {announcementCount > 0 && (
                <h2 className="text-sm font-bold print:!text-base print:!text-black w-full text-center flex-shrink-0 mb-0.5">{t('printPreview.announcementsAndEvents')}</h2>
              )}
              <div ref={announcementsRef} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              {(() => {
                const grouped = printableAnnouncements.reduce((groups: Record<string, any[]>, announcement: any) => {
                  // Recurring standalone items may carry the literal
                  // 'standalone' audience (no _id suffix) — match both forms
                  const isStandalone = announcement.audience === 'standalone' || announcement.audience?.startsWith('standalone_');
                  const audienceLabel = isStandalone
                    ? (announcement.customAudienceLabel || '')
                    : getAudienceLabel(announcement.audience || getUnitLowercase(unitTypeOverride));
                  if (!groups[audienceLabel]) groups[audienceLabel] = [];
                  groups[audienceLabel].push(announcement);
                  return groups;
                }, {});

                const columnCount = announceColumnCount;
                const gap = tight ? '0.35rem' : '0.5rem';

                // Same body size as the program and back cover; headings differ by weight only
                const headerFontSize = `${bodyPx}px`;
                const titleFontSize = `${bodyPx}px`;
                const contentFontSize = `${bodyPx}px`;

                return (
                  <div style={{ columnCount, columnGap: gap, columnFill: 'balance', height: '100%' }}>
                    {Object.entries(grouped).map(([audienceLabel, announcements], groupIdx) => (
                      <div key={audienceLabel} style={{ marginBottom: groupIdx < Object.keys(grouped).length - 1 ? (isLightContent ? '1rem' : tight ? '0.125rem' : '0.25rem') : 0 }}>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: isLightContent ? '0.75rem' : tight ? '0.125rem' : '0.25rem' }}>
                          {(announcements as any[]).map((a: any, idx: number) => {
                            const decodedContent = sanitizedAnnouncementHtml(a.content ?? '');
                            const showHeader = idx === 0 && audienceLabel;
                            return (
                              <li key={idx} style={{ marginBottom: isLightContent ? '0.5rem' : '0.125rem' }}>
                                {showHeader && (
                                  <div
                                    className="font-bold print:!text-black border-b border-gray-300 leading-snug pb-1 mb-1"
                                    style={{ fontSize: headerFontSize, breakAfter: 'avoid' }}
                                  >
                                    {audienceLabel}
                                  </div>
                                )}
                                <div
                                  className="font-semibold print:!text-black leading-tight"
                                  style={{ fontSize: titleFontSize }}
                                >
                                  {a.title}
                                </div>
                                {a.category && a.category !== 'general' && (
                                  <span
                                    className="text-gray-600 bg-gray-100 px-1 py-0.5 rounded inline-block mb-0.5"
                                    style={{ fontSize: `${Math.round(bodyPx * 0.75)}px` }}
                                  >
                                    {a.category}
                                  </span>
                                )}
                                <div
                                  className="print:!text-black leading-tight [&_a]:underline [&_a]:break-all"
                                  style={{
                                    fontSize: contentFontSize,
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word',
                                  } as React.CSSProperties}
                                  dangerouslySetInnerHTML={{
                                    __html: decodedContent.replace(
                                      /<ul>/g,
                                      '<ul style="list-style-type: disc; list-style-position: inside; margin-left: 0.5rem; padding-left: 0;">'
                                    ).replace(
                                      /<ol>/g,
                                      '<ol style="list-style-type: decimal; list-style-position: inside; margin-left: 0.5rem; padding-left: 0;">'
                                    ).replace(
                                      /<li>/g,
                                      '<li style="margin-left: 0; display: list-item;">'
                                    ).replace(
                                      /<p>/g,
                                      '<p style="margin: 0 0 0.1rem 0;">'
                                    )
                                  }}
                                />

                                {a.imageId && a.imageId !== 'none' && !a.images && !a.hideImageOnPrint && (
                                  <div className="mb-1">
                                    {(() => {
                                      const selectedImage = getImageByIdSync(a.imageId);
                                      return selectedImage?.url ? (
                                        <img
                                          src={selectedImage.url}
                                          alt={selectedImage.name}
                                          className="h-auto rounded"
                                          style={{ objectFit: 'contain', maxHeight: '100px', maxWidth: '150px' }}
                                        />
                                      ) : null;
                                    })()}
                                  </div>
                                )}

                                {a.images && a.images.length > 0 && (
                                  <div className="mb-1 flex flex-wrap gap-1">
                                    {a.images.slice(0, 3).map((img: any, index: number) => {
                                      if (img.hideImageOnPrint) return null;
                                      let imageUrl = img.imageUrl;
                                      if (!imageUrl && img.imageId) {
                                        const imageData = getImageByIdSync(img.imageId);
                                        imageUrl = imageData?.url;
                                      }
                                      return imageUrl ? (
                                        <img
                                          key={index}
                                          src={imageUrl}
                                          alt="Announcement"
                                          className="h-auto rounded"
                                          style={{ objectFit: 'contain', maxHeight: '80px', maxWidth: '120px' }}
                                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                      ) : null;
                                    })}
                                    {a.images.filter((img: any) => !img.hideImageOnPrint).length > 3 && (
                                      <span style={{ fontSize: `${Math.round(bodyPx * 0.55)}px` }} className="text-gray-500 self-end">
                                        +{a.images.filter((img: any) => !img.hideImageOnPrint).length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                );
              })()}
              </div>
              {/* QR code for full announcements */}
              {(showQR || annHidden > 0) && (
                <div className="flex-shrink-0 flex items-center justify-center gap-2 pt-0.5 pb-3">
                  {showQR && profile?.profile_slug && <PrintQRCode profileSlug={`${profile.profile_slug}#announcements`} size={56} />}
                  <span className="print:!text-black italic" style={{ fontSize: `${Math.round(bodyPx * 0.6)}px` }}>
                    {annHidden > 0 && `+${annHidden} ${t('printPreview.moreAnnouncements', 'more')}${showQR ? ' · ' : ''}`}
                    {showQR && t('printPreview.scanForFullAnnouncements')}
                  </span>
                </div>
              )}
        </div>
        )}

        {/* Program (right) */}
        <div ref={programPanelRef} className={`w-1/2 ${data.meetingType === 'baptism' ? 'justify-start pt-8' : 'justify-center'} flex flex-col items-center text-center print:!text-xl print:!text-black ${pad.rightPanel}`}>
          {/* Scale-to-fit wrapper: a long program (e.g. several musical numbers) is
              shrunk to the panel instead of being centered past the page edge,
              which used to clip the unit name off the top. */}
          <div className="w-full flex-shrink-0 flex justify-center items-start" style={programScale !== 1 && programNaturalHeight ? { height: programNaturalHeight * programScale } : undefined}>
          <div
            ref={programContentRef}
            className="flex flex-col items-center flex-shrink-0"
            style={{ width: `${100 / fontScale}%`, ...(programScale !== 1 ? { transform: `scale(${programScale})`, transformOrigin: 'top center' } : {}) }}
          >
          {data.meetingType === 'baptism' ? (
            <>
              <p className="text-lg mb-1 print:!text-xl print:!text-black uppercase">{t('bulletin.theBaptismOf')}</p>
              <h2 className="text-3xl font-bold mb-2 print:!text-4xl print:!text-black">{data.agenda?.find((i: any) => i.type === 'baptism_ordinance')?.candidateName || ''}</h2>
              <p className="italic text-lg mb-6 print:!text-2xl print:!text-black">{formatDate(data.date, i18n.language)}</p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-2 print:!text-4xl print:!text-black">{data.wardName || t('form.wardName', { unit: getTranslatedUnitLabel(t, unitTypeOverride) })}</h2>
              <h3 className="text-2xl font-bold mb-1 print:!text-3xl print:!text-black">{t('bulletin.sacramentMeeting')}</h3>
              <p className="italic text-lg mb-6 print:!text-2xl print:!text-black">{formatDate(data.date, i18n.language)}</p>
            </>
          )}

          {data.leadership?.meetingLink && data.leadership.meetingLink.trim() !== '' && (
            <p className="text-xs text-gray-600 mb-2 print:!text-sm">
              {t('bulletin.joinMeetingPrint')} {data.leadership.meetingLink.trim()}
            </p>
          )}

          <table className="w-full text-[1rem] print:!text-base print:!text-black" style={{ borderCollapse: 'separate', borderSpacing: `0 ${fontScale > 1 ? 0.1 : 0.4}em` }}>
            <tbody>
              <ProgramTableRow label={t('bulletin.presiding')} value={data.leadership?.presiding} />
              <ProgramTableRow label={t('bulletin.conducting')} value={data.leadership?.conducting} />
              <ProgramTableRow label={data.leadership?.choristerLabel === 'Music Leader' ? t('form.musicLeader') : t('form.chorister')} value={data.leadership?.chorister} />
              <ProgramTableRow label={data.leadership?.organistLabel === 'Pianist' ? t('form.pianist') : t('form.organist')} value={data.leadership?.organist} />
              {data.leadership?.interpreter && (
                <ProgramTableRow label={t('form.interpreter')} value={data.leadership?.interpreter} />
              )}
              {data.leadership?.preludeMusic && (
                <ProgramTableRow label={t('bulletin.preludeMusic')} value={data.leadership?.preludeMusic} />
              )}
              <ProgramTableRow
                label={t('bulletin.openingHymn')}
                value={data.musicProgram?.openingHymnNumber}
                extra={data.musicProgram?.openingHymnTitle}
              />
              <ProgramTableRow label={t('bulletin.invocation')} value={data.prayers?.opening} />
              {data.meetingType !== 'baptism' && (
                <tr>
                  <td colSpan={3} className="text-center font-medium text-lg print:!text-xl print:!text-black">
                    {t('bulletin.unitBusiness', { unit: getTranslatedUnitLabel(t, unitTypeOverride) })}
                  </td>
                </tr>
              )}
              {data.agenda?.map((item: any, idx: number) => (
                item.type === 'speaker' ? (
                  <ProgramTableRow key={idx} label={item.customLabel || (item.speakerType === 'youth' ? t('bulletin.youthSpeaker') : item.speakerType === 'highCouncil' ? t('bulletin.highCouncilSpeaker') : t('bulletin.speaker'))} value={item.name} />
                ) : item.type === 'musical' ? (
                  <ProgramTableRow key={idx} label={item.label === 'Intermediate Hymn' ? t('form.intermediateHymn') : t('bulletin.musicalNumber')} value={item.hymnNumber || item.songName} extra={item.hymnTitle} extra2={item.performers} />
                ) : item.type === 'testimony' ? (
                  <React.Fragment key={idx}>
                    <tr>
                      <td colSpan={3} className="text-center font-bold text-lg py-2 print:!text-2xl print:!text-black">
                        {t('bulletin.bearingOfTestimonies')}
                        {item.note && (
                          <div className="text-sm font-normal italic text-gray-700 mt-1 print:!text-base print:!text-black">
                            {item.note}
                          </div>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                ) : item.type === 'baby_blessing' ? (
                  <React.Fragment key={idx}>
                    <tr>
                      <td colSpan={3} className="text-center font-bold text-lg py-2 print:!text-2xl print:!text-black">
                        {t('bulletin.babyBlessing')} {item.childName || ''}
                        {item.parentNames && (
                          <div className="text-sm font-normal italic text-gray-700 mt-1 print:!text-base print:!text-black">
                            {t('form.childOf')} {item.parentNames}
                          </div>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                ) : item.type === 'baptism_ordinance' ? (
                  <React.Fragment key={idx}>
                    <tr>
                      <td colSpan={3} className="text-center font-bold text-lg py-2 print:!text-2xl print:!text-black uppercase">
                        {t('bulletin.baptismOf')} {item.candidateName || ''}
                        {item.performedBy && (
                          <div className="text-sm font-normal italic text-gray-700 mt-1 print:!text-base print:!text-black normal-case">
                            {t('form.performedByLabel')} {item.performedBy}
                          </div>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                ) : item.type === 'confirmation' ? (
                  <React.Fragment key={idx}>
                    <tr>
                      <td colSpan={3} className="text-center font-bold text-lg py-2 print:!text-2xl print:!text-black uppercase">
                        {t('bulletin.confirmationOf')} {item.candidateName || ''}
                        {item.performedBy && (
                          <div className="text-sm font-normal italic text-gray-700 mt-1 print:!text-base print:!text-black normal-case">
                            {t('form.performedByLabel')} {item.performedBy}
                          </div>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                ) : item.type === 'program' ? (
                  <React.Fragment key={idx}>
                    <tr>
                      <td colSpan={3} className="text-center font-bold text-lg py-2 print:!text-2xl print:!text-black">
                        {item.title}
                        {item.note && (
                          <div className="text-sm font-normal italic text-gray-700 mt-1 print:!text-base print:!text-black">
                            {item.note}
                          </div>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                ) : item.type === 'sacrament' && data.meetingType === 'sacrament' ? (
                  <React.Fragment key={idx}>
                    <ProgramTableRow
                      label={t('bulletin.sacramentHymn')}
                      value={data.musicProgram?.sacramentHymnNumber}
                      extra={data.musicProgram?.sacramentHymnTitle}
                    />
                    <tr>
                      <td colSpan={3} className="text-center font-bold text-lg py-2 print:!text-2xl print:!text-black">{t('bulletin.administrationOfSacrament')}</td>
                    </tr>
                  </React.Fragment>
                ) : null
              ))}
              <ProgramTableRow
                label={t('bulletin.closingHymn')}
                value={data.musicProgram?.closingHymnNumber}
                extra={data.musicProgram?.closingHymnTitle}
              />
              <ProgramTableRow label={t('bulletin.benediction')} value={data.prayers?.closing} />
            </tbody>
          </table>
          </div>
          </div>
        </div>
      </div>

    </div>
  );
});

// PrintQRCode component for generating QR codes specifically for printing
function PrintQRCode({ profileSlug, size = 128 }: { profileSlug: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const qrUrl = `https://${SHORT_DOMAIN}/${profileSlug}`;

      try {
        await QRCode.toCanvas(canvas, qrUrl, {
          width: size,
          margin: size <= 80 ? 1 : 2,
          color: { dark: '#000000', light: '#FFFFFF' },
          errorCorrectionLevel: size <= 80 ? 'M' : 'H'
        });
      } catch (error) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, size, size);
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, size, size);
          ctx.strokeStyle = 'black';
          ctx.strokeRect(0, 0, size, size);
          ctx.fillStyle = 'black';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('QR Code', size / 2, size / 2 - 5);
          ctx.fillText('Error', size / 2, size / 2 + 10);
        }
      }
    };

    generateQRCode();
  }, [profileSlug, size]);

  const px = `${size}px`;
  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="bg-white mx-auto"
      style={{ width: px, height: px }}
    />
  );
}

export default React.memo(BulletinPrintLayout);

function ProgramTableRow({ label, value, extra, extra2 }: { label: string, value?: string, extra?: string, extra2?: string }) {
  return (
    <>
      <tr>
        <td colSpan={3} className="py-[2px] print:!text-base print:!text-black">
          <div className="flex justify-between w-full">
            <span className="text-left mr-2 whitespace-nowrap print:!text-base print:!text-black">{label}</span>
            <span className="text-right ml-2 whitespace-nowrap text-[0.9rem] print:!text-base print:!text-black">{value}</span>
          </div>
        </td>
      </tr>
      {extra && (
        <tr>
          <td colSpan={3} className="pt-0 text-center italic text-black text-sm print:!text-base print:!text-black">{extra}</td>
        </tr>
      )}
      {extra2 && (
        <tr>
          <td colSpan={3} className="pt-0 text-center italic text-black text-sm print:!text-base print:!text-black">{extra2}</td>
        </tr>
      )}
    </>
  );
}
