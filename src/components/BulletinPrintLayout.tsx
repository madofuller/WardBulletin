import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
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

const BulletinPrintLayout = forwardRef<HTMLDivElement, { data: any, refs?: { page1?: React.RefObject<HTMLDivElement>, page2?: React.RefObject<HTMLDivElement> }, unitTypeOverride?: UnitType }>(({ data, refs, unitTypeOverride }, ref) => {
  const { user, profile } = useSession();
  const { t, i18n } = useTranslation();
  const backCoverRef = useRef<HTMLDivElement>(null);
  const announcementsRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState<{ backCover: boolean; announcements: boolean }>({ backCover: false, announcements: false });

  // Print font scale: Map UI scale to actual print multipliers for senior readability
  // Goals: Normal ~11pt body, Large ~14pt body, Extra Large ~16-18pt body
  const fontScale = (() => {
    const uiScale = typeof data.printFontScale === 'number' && data.printFontScale >= 1 && data.printFontScale <= 1.5
      ? data.printFontScale
      : 1;
    
    // Map UI scale (1.0/1.15/1.25) to real print scale for seniors:
    // - Normal (1.0): 1.0× = 11-12pt body text
    // - Large (1.15): 1.4× = 14-16pt body text  
    // - Extra Large (1.25): 1.8× = 16-20pt body text
    if (uiScale >= 1.25) return 1.8;  // Extra Large
    if (uiScale >= 1.15) return 1.4;  // Large
    return 1.0;                        // Normal
  })();

  // In Large/Extra Large modes (fontScale >= 1.4), disable auto-shrinking entirely.
  // Text must remain at full scale for senior readability. Overflow flows to a
  // continuation page instead of shrinking.
  const isLargeOrExtraLarge = fontScale >= 1.4;
  const MIN_FONT_SIZE_PT = 12; // Absolute minimum in points
  const MIN_FIT_SCALE = isLargeOrExtraLarge ? 1.0 : 0.65;
  const [announceFitScale, setAnnounceFitScale] = useState(1);
  const [autoColumns, setAutoColumns] = useState(0); // 0 = use default, otherwise a forced column count

  // Announcements marked web-only never reach paper; everything below
  // (column auto-fit, grouping, the section header) works off this list.
  const printableAnnouncements = (data.announcements || []).filter((a: any) => !a.hideOnPrint);
  const announcementCount = printableAnnouncements.length;
  
  // Chunk announcements for Large/Extra Large so each 5.5in panel stays inside
  // the bifold. Character capacity is conservative (narrow column + larger type).
  // Computed in useMemo — no state, no render loop.
  const announcementPages = useMemo(() => {
    if (!isLargeOrExtraLarge || printableAnnouncements.length === 0) {
      return [printableAnnouncements];
    }
    // 4.9in usable width × ~7.5in usable height. Pack enough items that
    // continuation pages stay mostly full; Extra Large still uses larger px type.
    const charsPerPanel = fontScale >= 1.8 ? 1600 : 2000;
    const pages: any[][] = [];
    let current: any[] = [];
    let used = 0;
    for (const ann of printableAnnouncements) {
      const chars = (ann.title || '').length + (ann.content || '').length + 24;
      if (current.length > 0 && used + chars > charsPerPanel) {
        pages.push(current);
        current = [ann];
        used = chars;
      } else {
        current.push(ann);
        used += chars;
      }
    }
    if (current.length) pages.push(current);
    return pages;
  }, [isLargeOrExtraLarge, fontScale, announcementCount, printableAnnouncements]);
  const announcementTotalChars = printableAnnouncements.reduce((s: number, a: any) => s + (a.content?.length || 0) + (a.title?.length || 0), 0);
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

  // In Large/Extra Large modes, use single column for better readability.
  // In Normal mode, use conservative column count that escalates only on overflow.
  const defaultCols = isLargeOrExtraLarge 
    ? 1 
    : (announcementCount <= 2 || isLightContent ? 1 : (announcementCount >= 6 || isHeavyContent) ? 3 : 2);
  const announceColumnCount = Math.max(autoColumns, defaultCols);

  useEffect(() => {
    setAnnounceFitScale(1);
    setAutoColumns(0);
  }, [announcementsContentKey, data.printFontScale, data.printTightMargins]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!announcementsRef.current) return;
      const el = announcementsRef.current;
      const overflowV = el.scrollHeight - el.clientHeight;
      const overflowH = el.scrollWidth - el.clientWidth;
      if (overflowV <= 2 && overflowH <= 2) return;

      // In Large/Extra Large modes, do NOT auto-shrink or add columns.
      // Let content overflow; it will flow to a continuation page.
      if (isLargeOrExtraLarge) return;

      // Step 1: add columns one at a time before shrinking fonts
      if (announceColumnCount < 4) {
        setAutoColumns(announceColumnCount + 1);
        return;
      }
      // Step 2: shrink fonts as last resort (only in Normal mode)
      if (announceFitScale > MIN_FIT_SCALE) {
        const next = Math.max(MIN_FIT_SCALE, announceFitScale - 0.03);
        setAnnounceFitScale(next);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [announceFitScale, autoColumns, announceColumnCount, announcementsContentKey, data.printFontScale, data.printTightMargins, isLargeOrExtraLarge]);

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
  }, [data.announcements?.length, data.wardLeadership?.length, data.missionaries?.length, data.wardMissionaries?.length, data.serviceMissionaries?.length, data.printFontScale, data.printTightMargins, data.showQRCodeOnPrint, announceFitScale]);

  const scalePx = (px: number) => `${Math.round(px * fontScale)}px`;

  // Tighter margins to fit more announcements on the page
  const tight = !!data.printTightMargins;
  const pad = {
    // Ensure >= 0.25in (24px) margins for printer safety zones
    // pl/pr-6 = 24px = 0.25in minimum for safe printing
    leftPanel: tight ? 'pl-6 pr-8 pt-6 pb-0' : isLightContent ? 'pl-6 pr-6 pt-6 pb-0' : 'pl-6 pr-12 pt-6 pb-0',
    rightPanel: tight ? 'pl-8 pr-6 py-6' : 'pl-12 pr-6 py-6',
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
  const filteredMissionaries = data.missionaries?.filter(hasValidMissionaryInfo) || [];
  const allWardMissionaries = data.wardMissionaries?.filter(hasValidMissionaryInfo) || [];
  const filteredWardMissionaries = allWardMissionaries.filter((entry: any) => entry.serviceType !== 'military');
  const filteredMilitaryMembers = allWardMissionaries.filter((entry: any) => entry.serviceType === 'military');
  const filteredServiceMissionaries = data.serviceMissionaries?.filter(hasValidServiceMissionaryInfo) || [];

  // Check if there's any meaningful ward info to display
  const hasWardInfo = filteredWardLeadership.length > 0 || filteredMissionaries.length > 0 || filteredWardMissionaries.length > 0 || filteredMilitaryMembers.length > 0 || filteredServiceMissionaries.length > 0;

  const selectedTheme = themes.find(t => t.name === data.userTheme);

  const hasOverflow = overflow.backCover || overflow.announcements;

  return (
    <div
      ref={ref}
      className="print-layout font-sans"
      data-font-scale={fontScale.toString()}
      style={{
        fontFamily: selectedTheme ? selectedTheme.fontFamily : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
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
        style={{ width: '11in', height: '8.5in', overflow: 'hidden', pageBreakAfter: 'always', boxSizing: 'border-box' }}
      >
                 {/* Back Cover (left) - Unit Information */}
          {data.meetingType === 'baptism' ? (
            <div className="print-panel w-[5.5in] h-[8.5in]" style={{ width: '5.5in', height: '8.5in', overflow: 'hidden', flexShrink: 0, boxSizing: 'border-box' }} />
          ) : (
          <div className={`print-panel w-[5.5in] h-[8.5in] flex flex-col justify-between text-left print:!text-sm print:!text-black ${pad.leftPanel}`} style={{ width: '5.5in', height: '8.5in', overflow: 'hidden', flexShrink: 0, boxSizing: 'border-box', padding: '0.3in' }}>
           {/* Scrollable content area - reserves space for QR code if enabled
                QR space calculation accounts for font scaling in Extra Large mode */}
           <div ref={backCoverRef} className="flex-1 overflow-y-hidden" style={{ 
             maxHeight: (profile?.profile_slug && data.showQRCodeOnPrint !== false) 
               ? `calc(100% - ${Math.max(240, Math.round(200 * fontScale))}px)` 
               : '100%' 
           }}>
              {/* Unit Leadership Table */}
              {filteredWardLeadership.length > 0 && (
                <div className={`w-full ${pad.sectionMb}`}>
                  <h2 className={`text-lg font-bold print:!text-lg print:!text-black w-full text-center ${tight ? 'mb-1' : 'mb-2'}`}>{t('terminology.wardLeadership', { unit: getTranslatedUnitLabel(t, unitTypeOverride) }).toUpperCase()}</h2>
                   <table className="w-full text-xs print:!text-xs print:!text-black table-fixed">
                     <tbody>
                       {filteredWardLeadership.slice(0, data.showQRCodeOnPrint !== false ? filteredWardLeadership.length : 20).map((leader: any, idx: number) => (
                         <tr key={idx}>
                           <td className="py-1 font-bold text-xs pr-2" style={{ width: '45%', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{leader.title}</td>
                           <td className="py-1 text-xs font-normal pr-2" style={{ width: '30%', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{leader.name}</td>
                           <td className="py-1 text-right text-xs font-normal" style={{ width: '25%', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                             {leader.phone || ''}
                           </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                  {filteredWardLeadership.length > 20 && data.showQRCodeOnPrint === false && (
                    <p className="text-xs text-gray-600 print:!text-black mt-2 text-center">+ {filteredWardLeadership.length - 20} more leaders</p>
                  )}
                </div>
              )}

              {/* Missionaries Table */}
              {filteredMissionaries.length > 0 && (
                <div className={`w-full ${pad.sectionMb}`}>
                  <h3 className={`text-sm font-semibold print:!text-sm print:!text-black ${tight ? 'mb-0.5' : 'mb-1'}`}>{t('bulletin.missionaries').toUpperCase()}</h3>
                  <table className="w-full text-xs print:!text-xs print:!text-black table-fixed">
                    <tbody>
                      {filteredMissionaries.slice(0, data.showQRCodeOnPrint !== false ? filteredMissionaries.length : 12).map((missionary: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-0 font-bold text-xs pr-1" style={{ width: '60%' }}>{missionary.name}</td>
                          <td className="py-0 text-right text-xs font-normal" style={{ width: '40%' }}>
                            {missionary.phone || ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredMissionaries.length > 12 && data.showQRCodeOnPrint === false && (
                    <p className="text-xs text-gray-600 print:!text-black mt-1 text-center">+ {filteredMissionaries.length - 12} {t('bulletin.moreMissionaries')}</p>
                  )}
                </div>
              )}

              {/* Missionaries from our ward */}
              {filteredWardMissionaries.length > 0 && (
                <div className={`w-full ${tight ? 'mb-0.5' : 'mb-1'}`}>
                  <h3 className={`text-xs font-semibold print:!text-xs print:!text-black ${tight ? 'mb-0.5' : 'mb-1'}`}>{t('terminology.wardMissionaries', { unit: getTranslatedUnitLabel(t, unitTypeOverride) }).toUpperCase()}</h3>
                  {(() => {
                    const missionaryCount = filteredWardMissionaries.slice(0, data.showQRCodeOnPrint !== false ? filteredWardMissionaries.length : 15).length;
                    // Dynamic font sizing: fewer missionaries = larger font, more missionaries = smaller font
                    let fontSize = scalePx(9);
                    if (missionaryCount <= 3) {
                      fontSize = scalePx(11);
                    } else if (missionaryCount <= 6) {
                      fontSize = scalePx(10);
                    } else if (missionaryCount <= 10) {
                      fontSize = scalePx(9);
                    } else {
                      fontSize = scalePx(8);
                    }
                    
                    return (
                      <div className="space-y-1" style={{ fontSize }}>
                        {filteredWardMissionaries.slice(0, data.showQRCodeOnPrint !== false ? filteredWardMissionaries.length : 15).map((missionary: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center py-0">
                        <div className="font-bold" style={{ width: '25%' }}>
                          {missionary.name}
                        </div>
                        <div className="text-center flex-1 px-2 font-normal">
                          {missionary.mission && (
                            <span className="text-gray-600 print:!text-black">{missionary.mission}</span>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0 font-normal" style={{ minWidth: '120px' }}>
                          {missionary.email ? (
                            <span className="text-gray-700 print:!text-black">{missionary.email}</span>
                          ) : (
                            <span className="text-gray-400 print:!text-black">{t('bulletin.noEmail')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                      </div>
                    );
                  })()}
                  {filteredWardMissionaries.length > 15 && data.showQRCodeOnPrint === false && (
                    <p className="text-xs text-gray-600 print:!text-black mt-1 text-center">+ {filteredWardMissionaries.length - 15} {t('bulletin.moreWardMissionaries')}</p>
                  )}
                </div>
              )}

              {/* Serving in the Military */}
              {filteredMilitaryMembers.length > 0 && (
                <div className={`w-full ${tight ? 'mb-0.5' : 'mb-1'}`}>
                  <h3 className={`text-xs font-semibold print:!text-xs print:!text-black ${tight ? 'mb-0.5' : 'mb-1'}`}>{t('bulletin.servingInMilitary', 'Serving in the Military').toUpperCase()}</h3>
                  {(() => {
                    const militaryCount = filteredMilitaryMembers.length;
                    // Dynamic font sizing: fewer entries = larger font, more entries = smaller font
                    let fontSize = scalePx(9);
                    if (militaryCount <= 3) {
                      fontSize = scalePx(11);
                    } else if (militaryCount <= 6) {
                      fontSize = scalePx(10);
                    } else if (militaryCount <= 10) {
                      fontSize = scalePx(9);
                    } else {
                      fontSize = scalePx(8);
                    }

                    return (
                      <div className="space-y-1" style={{ fontSize }}>
                        {filteredMilitaryMembers.map((member: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center py-0">
                            <div className="font-bold" style={{ width: '40%' }}>
                              {member.name}
                            </div>
                            <div className="text-right flex-1 font-normal">
                              {member.mission && (
                                <span className="text-gray-600 print:!text-black">{member.mission}</span>
                              )}
                              {member.mission && member.email && <span className="text-gray-400 print:!text-black"> · </span>}
                              {member.email && (
                                <span className="text-gray-700 print:!text-black">{member.email}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Service Missionaries */}
              {filteredServiceMissionaries.length > 0 && (
                <div className={`w-full ${tight ? 'mb-0.5' : 'mb-1'}`}>
                  <h3 className={`text-xs font-semibold print:!text-xs print:!text-black ${tight ? 'mb-0.5' : 'mb-1'}`}>{t('bulletin.serviceMissionaries').toUpperCase()}</h3>
                  {(() => {
                    const serviceMissionaryCount = filteredServiceMissionaries.length;
                    // Dynamic font sizing: fewer missionaries = larger font, more missionaries = smaller font
                    let fontSize = scalePx(9);
                    if (serviceMissionaryCount <= 3) {
                      fontSize = scalePx(11);
                    } else if (serviceMissionaryCount <= 6) {
                      fontSize = scalePx(10);
                    } else if (serviceMissionaryCount <= 10) {
                      fontSize = scalePx(9);
                    } else {
                      fontSize = scalePx(8);
                    }

                    return (
                      <div className="space-y-1" style={{ fontSize }}>
                        {filteredServiceMissionaries.map((missionary: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center py-0">
                            <div className="font-bold" style={{ width: '40%' }}>
                              {missionary.name}
                            </div>
                            <div className="text-right flex-1 font-normal">
                              {missionary.serviceName ? (
                                <span className="text-gray-600 print:!text-black">{missionary.serviceName}</span>
                              ) : (
                                <span className="text-gray-400 print:!text-black">{t('bulletin.noServiceListed')}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
           </div>

           {/* QR Code - Fixed at bottom with reserved space, only if enabled */}
           {profile?.profile_slug && data.showQRCodeOnPrint !== false && (
             <div className="w-full flex flex-col items-center justify-center text-center mt-4 flex-shrink-0" style={{ paddingBottom: '24px' }}>
               <div className="mb-3">
                 <PrintQRCode profileSlug={profile.profile_slug} size={Math.max(96, Math.min(144, Math.round(96 * fontScale)))} />
               </div>
               <p className="text-sm print:!text-base print:!text-black font-medium">
                 {t('qrCode.scanQrCodeToAccess')}
               </p>
             </div>
           )}

         </div>
         )}

        {/* Front Cover (right) — rendered exactly once */}
        <div className={`print-panel w-[5.5in] h-[8.5in] flex flex-col justify-center items-center text-center print:!text-xl print:!text-black ${pad.rightPanel}`} style={{ width: '5.5in', height: '8.5in', overflow: 'hidden', flexShrink: 0, boxSizing: 'border-box', padding: '0.35in 0.3in' }}>
          {data.meetingType === 'baptism' ? (
            <>
              <p className="text-lg mb-1 print:!text-2xl print:!text-black uppercase">{t('bulletin.theBaptismOf')}</p>
              <h1 className="text-3xl font-bold mb-2 print:!text-4xl print:!text-black" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto', maxWidth: '100%' }}>{data.agenda?.find((i: any) => i.type === 'baptism_ordinance')?.candidateName || ''}</h1>
              <p className="text-lg mb-4 print:!text-2xl print:!text-black">{formatDate(data.date, i18n.language)}</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2 print:!text-4xl print:!text-black" style={{ 
                wordWrap: 'break-word', 
                overflowWrap: 'break-word', 
                hyphens: 'auto', 
                maxWidth: '100%',
                lineHeight: '1.2'
              }}>{data.wardName || t('form.wardName', { unit: getTranslatedUnitLabel(t, unitTypeOverride) })}</h1>
              <p className="text-lg mb-1 print:!text-2xl print:!text-black" style={{ wordWrap: 'break-word' }}>{formatDate(data.date, i18n.language)}</p>
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
        </div>
      </div>

      {/* Page 2: Inside (landscape) */}
      <div ref={refs?.page2} className="print-page landscape w-[11in] h-[8.5in] flex print:!text-xl print:!text-black" style={{ width: '11in', height: '8.5in', overflow: 'hidden', pageBreakAfter: 'always', boxSizing: 'border-box' }}>
        {/* Announcements (left) - blank for baptism */}
        {data.meetingType === 'baptism' ? (
          <div className="print-panel w-[5.5in] h-[8.5in]" style={{ width: '5.5in', height: '8.5in', overflow: 'hidden', flexShrink: 0, boxSizing: 'border-box' }} />
        ) : (
        <div className={`print-panel w-[5.5in] h-[8.5in] text-left print:!text-black ${pad.leftPanel}`} style={{ width: '5.5in', height: '8.5in', overflow: 'hidden', flexShrink: 0, boxSizing: 'border-box', padding: '0.3in', display: 'flex', flexDirection: 'column' }}>
              {/* No header over an empty panel: a minimal program without
                  announcements shouldn't print an "Announcements & Events"
                  title with nothing under it. */}
              {announcementCount > 0 && (
                <h2 className="text-sm font-bold print:!text-base print:!text-black w-full text-center flex-shrink-0 mb-0.5">{t('printPreview.announcementsAndEvents')}</h2>
              )}
              <div ref={announcementsRef} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              {(() => {
                // In Large/Extra Large with overflow, only show announcements that fit
                const displayAnnouncements = announcementPages[0] || printableAnnouncements;
                const grouped = displayAnnouncements.reduce((groups: Record<string, any[]>, announcement: any) => {
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

                const densityScale = isHeavyContent ? 0.8 : isLightContent ? 1.4 : 1;
                const baseHeader = Math.round((tight ? 14 : 16) * densityScale);
                const baseTitle = Math.round((tight ? 13 : 15) * densityScale);
                const baseContent = Math.round((tight ? 12 : 14) * densityScale);
                const headerFontSize = scalePx(Math.round(baseHeader * announceFitScale));
                const titleFontSize = scalePx(Math.round(baseTitle * announceFitScale));
                const contentFontSize = scalePx(Math.round(baseContent * announceFitScale));

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
                                    className="font-bold print:!text-black border-b print:!border-black border-gray-300 pb-0.5 mb-1"
                                    style={{ fontSize: headerFontSize }}
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
                                    className="text-gray-600 print:!text-black bg-gray-100 print:!bg-transparent px-1 py-0.5 rounded inline-block mb-0.5"
                                    style={{ fontSize: scalePx(tight ? 10 : 11) }}
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
                                      <span style={{ fontSize: scalePx(8) }} className="text-gray-500 print:!text-black self-end">
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
              {profile?.profile_slug && data.showQRCodeOnPrint !== false && (
                <div className="flex-shrink-0 flex items-center justify-center gap-2 pt-0.5">
                  <PrintQRCode profileSlug={`${profile.profile_slug}#announcements`} size={56} />
                  <span className="print:!text-black italic" style={{ fontSize: scalePx(9) }}>
                    {t('printPreview.scanForFullAnnouncements')}
                  </span>
                </div>
              )}
        </div>
        )}

        {/* Program (right) */}
        <div className={`print-panel w-[5.5in] h-[8.5in] ${data.meetingType === 'baptism' ? 'justify-start' : 'justify-start'} flex flex-col items-center text-center print:!text-xl print:!text-black ${pad.rightPanel}`} style={{ width: '5.5in', height: '8.5in', overflow: 'hidden', flexShrink: 0, boxSizing: 'border-box', padding: '0.35in 0.3in' }}>
          {data.meetingType === 'baptism' ? (
            <>
              <p className="text-lg mb-1 print:!text-xl print:!text-black uppercase">{t('bulletin.theBaptismOf')}</p>
              <h2 className="text-3xl font-bold mb-2 print:!text-4xl print:!text-black" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto', maxWidth: '100%', lineHeight: '1.2' }}>{data.agenda?.find((i: any) => i.type === 'baptism_ordinance')?.candidateName || ''}</h2>
              <p className="italic text-lg mb-6 print:!text-2xl print:!text-black">{formatDate(data.date, i18n.language)}</p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-1 print:!text-xl print:!text-black" style={{ 
                wordWrap: 'break-word', 
                overflowWrap: 'anywhere', 
                wordBreak: 'break-word',
                hyphens: 'auto', 
                maxWidth: '100%',
                lineHeight: '1.15'
              }}>{data.wardName || t('form.wardName', { unit: getTranslatedUnitLabel(t, unitTypeOverride) })}</h2>
              <h3 className="text-2xl font-bold mb-0.5 print:!text-lg print:!text-black">{t('bulletin.sacramentMeeting')}</h3>
              <p className="italic text-lg mb-2 print:!text-sm print:!text-black" style={{ wordWrap: 'break-word' }}>{formatDate(data.date, i18n.language)}</p>
            </>
          )}

          {data.leadership?.meetingLink && data.leadership.meetingLink.trim() !== '' && (
            <p className="text-xs text-gray-600 print:!text-black mb-2 print:!text-sm">
              {t('bulletin.joinMeetingPrint')} {data.leadership.meetingLink.trim()}
            </p>
          )}

          <table className="w-full text-[1rem] print:!text-base print:!text-black" style={{ borderCollapse: 'separate', borderSpacing: '0 0.08em', width: '100%', tableLayout: 'fixed' }}>
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

      {/* Continuation pages: leftover announcements only, one 5.5in panel per page */}
      {announcementPages.slice(1).map((pageAnnouncements, pageIdx) => (
        <div
          key={`continuation-${pageIdx}`}
          className="print-page landscape w-[11in] h-[8.5in] flex print:!text-xl print:!text-black"
          style={{ width: '11in', height: '8.5in', overflow: 'hidden', pageBreakBefore: 'always', pageBreakAfter: 'always', boxSizing: 'border-box' }}
        >
          <div
            className={`print-panel w-[5.5in] h-[8.5in] text-left print:!text-black ${pad.leftPanel}`}
            style={{ width: '5.5in', height: '8.5in', overflow: 'hidden', flexShrink: 0, boxSizing: 'border-box', padding: '0.3in', display: 'flex', flexDirection: 'column' }}
          >
            <h2 className="text-sm font-bold print:!text-base print:!text-black w-full text-center mb-2">{t('printPreview.announcementsAndEvents')} ({t('printPreview.continued', 'Continued')})</h2>
            <div style={{ flex: 1, overflow: 'hidden' }}>
            {(() => {
              const densityScale = isHeavyContent ? 0.8 : isLightContent ? 1.4 : 1;
              const baseTitle = Math.round((tight ? 13 : 15) * densityScale);
              const baseContent = Math.round((tight ? 12 : 14) * densityScale);
              const titleFontSize = scalePx(Math.round(baseTitle));
              const contentFontSize = scalePx(Math.round(baseContent));

              return (
                <div className="space-y-3">
                  {pageAnnouncements.map((a: any, idx: number) => {
                    const decodedContent = sanitizedAnnouncementHtml(a.content ?? '');
                    return (
                      <div key={idx}>
                        <div
                          className="font-semibold print:!text-black leading-tight mb-1"
                          style={{ fontSize: titleFontSize }}
                        >
                          {a.title}
                        </div>
                        <div
                          className="print:!text-black leading-tight"
                          style={{
                            fontSize: contentFontSize,
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                          } as React.CSSProperties}
                          dangerouslySetInnerHTML={{
                            __html: decodedContent
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            </div>
          </div>
          <div className="print-panel w-[5.5in] h-[8.5in]" style={{ width: '5.5in', height: '8.5in', overflow: 'hidden', flexShrink: 0, boxSizing: 'border-box' }} />
        </div>
      ))}

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
  const wrap: React.CSSProperties = {
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    maxWidth: '100%',
  };
  return (
    <>
      <tr>
        <td colSpan={3} className="py-0 print:!text-base print:!text-black" style={wrap}>
          <div className="flex justify-between w-full min-w-0 gap-2">
            <span className="text-left print:!text-base print:!text-black min-w-0" style={wrap}>{label}</span>
            <span className="text-right text-[0.9rem] print:!text-base print:!text-black min-w-0" style={wrap}>{value}</span>
          </div>
        </td>
      </tr>
      {extra && (
        <tr>
          <td colSpan={3} className="pt-0 text-center italic text-black text-sm print:!text-base print:!text-black" style={wrap}>{extra}</td>
        </tr>
      )}
      {extra2 && (
        <tr>
          <td colSpan={3} className="pt-0 text-center italic text-black text-sm print:!text-base print:!text-black" style={wrap}>{extra2}</td>
        </tr>
      )}
    </>
  );
}
