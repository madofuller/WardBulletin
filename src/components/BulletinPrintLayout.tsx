import React, { forwardRef, useEffect, useMemo, useRef } from 'react';
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
import {
  imposeSheets,
  planPrintLayout,
  printModeFromScale,
  printTypeScale,
  type AnnouncementChunk,
  type ProgramBlock,
} from '../lib/printPagination';

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

function buildProgramBlocks(
  data: any,
  t: (key: string, opts?: any) => string,
  unitTypeOverride?: UnitType
): ProgramBlock[] {
  const blocks: ProgramBlock[] = [];
  const pushRow = (id: string, label: string, value?: string, extra?: string, extra2?: string) => {
    blocks.push({ kind: 'row', id, label, value, extra, extra2 });
  };
  const pushBanner = (id: string, text: string, extra?: string) => {
    blocks.push({ kind: 'banner', id, text, extra });
  };

  pushRow('presiding', t('bulletin.presiding'), data.leadership?.presiding);
  pushRow('conducting', t('bulletin.conducting'), data.leadership?.conducting);
  pushRow(
    'chorister',
    data.leadership?.choristerLabel === 'Music Leader' ? t('form.musicLeader') : t('form.chorister'),
    data.leadership?.chorister
  );
  pushRow(
    'organist',
    data.leadership?.organistLabel === 'Pianist' ? t('form.pianist') : t('form.organist'),
    data.leadership?.organist
  );
  if (data.leadership?.interpreter) {
    pushRow('interpreter', t('form.interpreter'), data.leadership.interpreter);
  }
  if (data.leadership?.preludeMusic) {
    pushRow('prelude', t('bulletin.preludeMusic'), data.leadership.preludeMusic);
  }
  pushRow(
    'opening-hymn',
    t('bulletin.openingHymn'),
    data.musicProgram?.openingHymnNumber,
    data.musicProgram?.openingHymnTitle
  );
  pushRow('invocation', t('bulletin.invocation'), data.prayers?.opening);
  if (data.meetingType !== 'baptism') {
    pushBanner('unit-business', t('bulletin.unitBusiness', { unit: getTranslatedUnitLabel(t, unitTypeOverride) }));
  }

  (data.agenda || []).forEach((item: any, idx: number) => {
    if (item.type === 'speaker') {
      const label = item.customLabel
        || (item.speakerType === 'youth' ? t('bulletin.youthSpeaker')
          : item.speakerType === 'highCouncil' ? t('bulletin.highCouncilSpeaker')
            : t('bulletin.speaker'));
      pushRow(`speaker-${idx}`, label, item.name);
    } else if (item.type === 'musical') {
      pushRow(
        `musical-${idx}`,
        item.label === 'Intermediate Hymn' ? t('form.intermediateHymn') : t('bulletin.musicalNumber'),
        item.hymnNumber || item.songName,
        item.hymnTitle,
        item.performers
      );
    } else if (item.type === 'testimony') {
      pushBanner(`testimony-${idx}`, t('bulletin.bearingOfTestimonies'), item.note);
    } else if (item.type === 'baby_blessing') {
      pushBanner(`blessing-${idx}`, `${t('bulletin.babyBlessing')} ${item.childName || ''}`.trim(), item.parentNames ? `${t('form.childOf')} ${item.parentNames}` : undefined);
    } else if (item.type === 'baptism_ordinance') {
      pushBanner(`baptism-${idx}`, `${t('bulletin.baptismOf')} ${item.candidateName || ''}`.trim(), item.performedBy ? `${t('form.performedByLabel')} ${item.performedBy}` : undefined);
    } else if (item.type === 'confirmation') {
      pushBanner(`confirm-${idx}`, `${t('bulletin.confirmationOf')} ${item.candidateName || ''}`.trim(), item.performedBy ? `${t('form.performedByLabel')} ${item.performedBy}` : undefined);
    } else if (item.type === 'program') {
      pushBanner(`program-${idx}`, item.title, item.note);
    } else if (item.type === 'sacrament' && data.meetingType === 'sacrament') {
      pushRow(
        `sacrament-hymn-${idx}`,
        t('bulletin.sacramentHymn'),
        data.musicProgram?.sacramentHymnNumber,
        data.musicProgram?.sacramentHymnTitle
      );
      pushBanner(`sacrament-admin-${idx}`, t('bulletin.administrationOfSacrament'));
    }
  });

  pushRow(
    'closing-hymn',
    t('bulletin.closingHymn'),
    data.musicProgram?.closingHymnNumber,
    data.musicProgram?.closingHymnTitle
  );
  pushRow('benediction', t('bulletin.benediction'), data.prayers?.closing);
  return blocks;
}

const PANEL: React.CSSProperties = {
  width: '5.5in',
  height: '8.5in',
  overflow: 'hidden',
  flexShrink: 0,
  boxSizing: 'border-box',
  padding: '0.3in',
};

const BulletinPrintLayout = forwardRef<HTMLDivElement, { data: any, refs?: { page1?: React.RefObject<HTMLDivElement>, page2?: React.RefObject<HTMLDivElement> }, unitTypeOverride?: UnitType }>(({ data, refs, unitTypeOverride }, ref) => {
  const { profile } = useSession();
  const { t, i18n } = useTranslation();

  const fontScale = (() => {
    const uiScale = typeof data.printFontScale === 'number' && data.printFontScale >= 1 && data.printFontScale <= 1.5
      ? data.printFontScale
      : 1;
    if (uiScale >= 1.25) return 1.8;
    if (uiScale >= 1.15) return 1.4;
    return 1.0;
  })();

  const printableAnnouncements = (data.announcements || []).filter((a: any) => !a.hideOnPrint);
  const printMode = printModeFromScale(fontScale);
  const outputMode = data.printOutputMode === 'booklet' ? 'booklet' : 'single';
  const typeScale = printTypeScale(printMode);
  const bodyStyle: React.CSSProperties = { fontSize: `${typeScale.bodyPt}pt`, lineHeight: 1.2 };
  const headingStyle: React.CSSProperties = { fontSize: `${typeScale.headingPt}pt`, lineHeight: 1.15, fontWeight: 700 };
  const coverNameStyle: React.CSSProperties = { fontSize: `${typeScale.coverNamePt}pt`, lineHeight: 1.1 };
  const coverSubStyle: React.CSSProperties = { fontSize: `${typeScale.coverSubPt}pt`, lineHeight: 1.25 };
  const announceTitleStyle: React.CSSProperties = { fontSize: `${typeScale.announceTitlePt}pt`, lineHeight: 1.2, fontWeight: 600 };
  const announceBodyStyle: React.CSSProperties = { fontSize: `${typeScale.announceBodyPt}pt`, lineHeight: 1.2 };
  const programBodyStyle: React.CSSProperties = { ...bodyStyle };

  const hasValidLeadershipInfo = (entry: any) => entry && (entry.name?.trim() || entry.phone?.trim());
  const hasValidMissionaryInfo = (entry: any) => entry && (entry.name?.trim() || entry.phone?.trim() || entry.mission?.trim() || entry.email?.trim());
  const hasValidServiceMissionaryInfo = (entry: any) => entry && (entry.name?.trim() || entry.serviceName?.trim());

  const filteredWardLeadership = data.wardLeadership?.filter(hasValidLeadershipInfo) || [];
  const filteredMissionaries = data.missionaries?.filter(hasValidMissionaryInfo) || [];
  const allWardMissionaries = data.wardMissionaries?.filter(hasValidMissionaryInfo) || [];
  const filteredWardMissionaries = allWardMissionaries.filter((entry: any) => entry.serviceType !== 'military');
  const filteredMilitaryMembers = allWardMissionaries.filter((entry: any) => entry.serviceType === 'military');
  const filteredServiceMissionaries = data.serviceMissionaries?.filter(hasValidServiceMissionaryInfo) || [];
  const showQR = !!(profile?.profile_slug && data.showQRCodeOnPrint !== false);
  const qrSize = Math.max(77, Math.min(160, Math.round(96 * fontScale)));

  const programBlocks = useMemo(
    () => buildProgramBlocks(data, t, unitTypeOverride),
    [data, t, unitTypeOverride]
  );

  const plan = useMemo(
    () => planPrintLayout({
      mode: printMode,
      outputMode,
      announcements: printableAnnouncements,
      programBlocks,
      leadershipCount: filteredWardLeadership.length,
      missionaryCount: filteredMissionaries.length + filteredWardMissionaries.length + filteredMilitaryMembers.length + filteredServiceMissionaries.length,
      hasQR: showQR,
    }),
    [printMode, outputMode, printableAnnouncements, programBlocks, filteredWardLeadership.length, filteredMissionaries.length, filteredWardMissionaries.length, filteredMilitaryMembers.length, filteredServiceMissionaries.length, showQR]
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__PRINT_PLAN__ = {
        outputMode: plan.outputMode,
        printedAnnouncementIds: [
          ...plan.insideAnnouncements,
          ...plan.backAnnouncements,
          ...Object.values(plan.bookletAnnouncements).flat(),
        ].map((a) => a.id),
        omittedTitles: plan.omittedAnnouncements.map((a) => a.title),
        moreAnnouncementsLine: plan.moreAnnouncementsLine,
        programFits: plan.programFits,
        programBodyPt: plan.programBodyPt,
        readingPanels: plan.readingPanels,
        imposition: imposeSheets(plan.outputMode),
      };
    }
  }, [plan]);

  const tight = !!data.printTightMargins;
  const getAudienceLabel = (audience: string): string => getAudienceDisplayName(audience, unitTypeOverride);
  const selectedTheme = themes.find((theme) => theme.name === data.userTheme);
  programBodyStyle.fontSize = `${plan.programBodyPt}pt`;

  const renderAnnouncementList = (items: AnnouncementChunk[]) => {
    const unitAudience = getUnitLabel(unitTypeOverride);
    return (
      <ul style={{ display: 'flex', flexDirection: 'column', gap: tight ? '0.2rem' : '0.35rem' }}>
        {items.map((a, idx) => {
          const decodedContent = sanitizedAnnouncementHtml(a.content ?? '');
          const isStandalone = a.audience === 'standalone' || a.audience?.startsWith('standalone_');
          const audienceLabel = isStandalone
            ? (a.customAudienceLabel || '')
            : getAudienceLabel(a.audience || getUnitLowercase(unitTypeOverride));
          const prev = items[idx - 1];
          const prevLabel = prev
            ? (prev.audience === 'standalone' || prev.audience?.startsWith('standalone_')
              ? (prev.customAudienceLabel || '')
              : getAudienceLabel(prev.audience || getUnitLowercase(unitTypeOverride)))
            : '';
          const showHeader = !!audienceLabel && audienceLabel !== unitAudience && audienceLabel !== prevLabel;
          return (
            <li key={`${a.id || idx}`}>
              {showHeader && (
                <div className="print-heading font-bold print:!text-black border-b print:!border-black border-gray-300 pb-0.5 mb-1" style={headingStyle}>
                  {audienceLabel}
                </div>
              )}
              <div className="print-announce-title font-semibold print:!text-black leading-tight" style={announceTitleStyle}>
                {a.title}
              </div>
              {a.category && a.category !== 'general' && (
                <span className="print-body text-gray-600 print:!text-black inline-block mb-0.5" style={announceBodyStyle}>
                  {a.category}
                </span>
              )}
              <div
                className="print-body print:!text-black leading-tight [&_a]:underline [&_a]:break-all"
                style={{ ...announceBodyStyle, wordWrap: 'break-word', overflowWrap: 'break-word' } as React.CSSProperties}
                dangerouslySetInnerHTML={{
                  __html: decodedContent
                    .replace(/<ul>/g, '<ul style="list-style-type: disc; list-style-position: inside; margin-left: 0.5rem; padding-left: 0;">')
                    .replace(/<ol>/g, '<ol style="list-style-type: decimal; list-style-position: inside; margin-left: 0.5rem; padding-left: 0;">')
                    .replace(/<li>/g, '<li style="margin-left: 0; display: list-item;">')
                    .replace(/<p>/g, '<p style="margin: 0 0 0.1rem 0;">'),
                }}
              />
              {a.imageId && a.imageId !== 'none' && !a.images && !a.hideImageOnPrint && (
                <div className="mb-1">
                  {(() => {
                    const selectedImage = getImageByIdSync(a.imageId);
                    return selectedImage?.url ? (
                      <img src={selectedImage.url} alt={selectedImage.name} className="h-auto rounded" style={{ objectFit: 'contain', maxHeight: '100px', maxWidth: '150px' }} />
                    ) : null;
                  })()}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const announcementsPanel = (readingOrder: number, items: AnnouncementChunk[], showMore = false) => (
    <div
      className="print-panel print-region-announcements w-[5.5in] h-[8.5in] text-left print:!text-black flex flex-col"
      data-reading-order={readingOrder}
      data-panel-role="announcements"
      style={PANEL}
    >
      {items.length > 0 && (
        <h2 className="print-heading text-sm font-bold print:!text-black w-full text-center flex-shrink-0 mb-0.5" style={headingStyle}>
          {t('printPreview.announcementsAndEvents')}
        </h2>
      )}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {renderAnnouncementList(items)}
      </div>
      {showMore && (
        <p className="print-cover-sub font-semibold print:!text-black mt-2 flex-shrink-0" style={coverSubStyle}>
          {t('printPreview.moreAnnouncementsScanQr', 'More announcements: scan the QR code')}
        </p>
      )}
    </div>
  );

  const coverPanel = (
    <div
      className="print-panel print-region-cover w-[5.5in] h-[8.5in] flex flex-col justify-center items-center text-center print:!text-black"
      data-reading-order={1}
      data-panel-role="cover"
      style={{ ...PANEL, padding: '0.35in 0.3in' }}
    >
      {data.meetingType === 'baptism' ? (
        <>
          <p className="print-cover-sub mb-1 print:!text-black uppercase" style={coverSubStyle}>{t('bulletin.theBaptismOf')}</p>
          <h1 className="print-cover-name font-bold mb-2 print:!text-black" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto', maxWidth: '100%', ...coverNameStyle }}>
            {data.agenda?.find((i: any) => i.type === 'baptism_ordinance')?.candidateName || ''}
          </h1>
          <p className="print-cover-sub mb-4 print:!text-black" style={coverSubStyle}>{formatDate(data.date, i18n.language)}</p>
        </>
      ) : (
        <>
          <h1 className="print-cover-name font-bold mb-2 print:!text-black" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto', maxWidth: '100%', ...coverNameStyle }}>
            {data.wardName || t('form.wardName', { unit: getTranslatedUnitLabel(t, unitTypeOverride) })}
          </h1>
          <p className="print-cover-sub mb-1 print:!text-black" style={{ wordWrap: 'break-word', ...coverSubStyle }}>{formatDate(data.date, i18n.language)}</p>
          <p className="print-cover-sub mb-1 print:!text-black" style={coverSubStyle}>{t('bulletin.churchName')}</p>
          <p className="print-cover-sub mb-4 print:!text-black" style={coverSubStyle}>{t('bulletin.sacramentMeeting')}</p>
        </>
      )}
      {data.imageId && data.imageId !== 'none' && (
        <div className="mb-4">
          {(() => {
            const imageUrl = data.imageUrl || getImageByIdSync(data.imageId)?.url;
            return imageUrl ? (
              <img src={imageUrl} alt="" className="max-w-full max-h-80 object-contain print:!max-h-96" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : null;
          })()}
        </div>
      )}
      {data.theme && <p className="print-cover-sub font-semibold italic print:!text-black" style={coverSubStyle}>"{data.theme}"</p>}
    </div>
  );

  const programPanel = (
    <div
      className="print-panel print-region-program w-[5.5in] h-[8.5in] flex flex-col items-center text-center print:!text-black"
      data-reading-order={3}
      data-panel-role="program"
      style={{ ...PANEL, padding: '0.35in 0.3in' }}
    >
      {data.meetingType === 'baptism' ? (
        <>
          <p className="print-cover-sub mb-1 print:!text-black uppercase" style={coverSubStyle}>{t('bulletin.theBaptismOf')}</p>
          <h2 className="print-cover-name font-bold mb-2 print:!text-black" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto', maxWidth: '100%', ...coverNameStyle }}>
            {data.agenda?.find((i: any) => i.type === 'baptism_ordinance')?.candidateName || ''}
          </h2>
          <p className="print-cover-sub italic mb-6 print:!text-black" style={coverSubStyle}>{formatDate(data.date, i18n.language)}</p>
        </>
      ) : (
        <>
          <h2 className="print-heading font-bold mb-1 print:!text-black" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere', wordBreak: 'break-word', hyphens: 'auto', maxWidth: '100%', ...headingStyle }}>
            {data.wardName || t('form.wardName', { unit: getTranslatedUnitLabel(t, unitTypeOverride) })}
          </h2>
          <h3 className="print-heading font-bold mb-0.5 print:!text-black" style={headingStyle}>{t('bulletin.sacramentMeeting')}</h3>
          <p className="print-cover-sub italic mb-2 print:!text-black" style={{ wordWrap: 'break-word', ...coverSubStyle }}>{formatDate(data.date, i18n.language)}</p>
        </>
      )}
      {data.leadership?.meetingLink && data.leadership.meetingLink.trim() !== '' && (
        <p className="print-body print:!text-black mb-2" style={programBodyStyle}>
          {t('bulletin.joinMeetingPrint')} {data.leadership.meetingLink.trim()}
        </p>
      )}
      <table className="print-body w-full print:!text-black" style={{ borderCollapse: 'separate', borderSpacing: '0 0.06em', width: '100%', tableLayout: 'fixed', ...programBodyStyle }}>
        <tbody>
          {plan.programBlocks.map((block) =>
            block.kind === 'banner' ? (
              <tr key={block.id}>
                <td colSpan={3} className="print-body text-center font-bold print:!text-black" style={{ ...programBodyStyle, fontWeight: 700 }}>
                  {block.text}
                  {block.extra && (
                    <div className="print-body font-normal italic text-gray-700 mt-0.5 print:!text-black" style={programBodyStyle}>
                      {block.extra}
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              <ProgramTableRow key={block.id} label={block.label} value={block.value} extra={block.extra} extra2={block.extra2} sizeStyle={programBodyStyle} />
            )
          )}
        </tbody>
      </table>
    </div>
  );

  const backReading = outputMode === 'booklet' ? 8 : 4;
  const backPanel = data.meetingType === 'baptism' ? (
    <div className="print-panel w-[5.5in] h-[8.5in]" data-reading-order={backReading} data-panel-role="back" style={PANEL} />
  ) : (
    <div
      className="print-panel print-region-leadership w-[5.5in] h-[8.5in] flex flex-col justify-between text-left print:!text-black"
      data-reading-order={backReading}
      data-panel-role="back"
      style={PANEL}
    >
      <div className="flex-1 overflow-hidden">
        {filteredWardLeadership.length > 0 && (
          <div className="w-full mb-2">
            <h2 className="print-heading font-bold print:!text-black w-full text-center mb-1" style={headingStyle}>
              {t('terminology.wardLeadership', { unit: getTranslatedUnitLabel(t, unitTypeOverride) }).toUpperCase()}
            </h2>
            <table className="print-body w-full table-fixed" style={bodyStyle}>
              <tbody>
                {filteredWardLeadership.map((leader: any, idx: number) => (
                  <tr key={idx}>
                    <td className="print-body py-0.5 font-bold pr-2" style={{ width: '45%', overflowWrap: 'anywhere', wordBreak: 'break-word', ...bodyStyle }}>{leader.title}</td>
                    <td className="print-body py-0.5 pr-2" style={{ width: '30%', overflowWrap: 'anywhere', wordBreak: 'break-word', ...bodyStyle }}>{leader.name}</td>
                    <td className="print-body py-0.5 text-right" style={{ width: '25%', overflowWrap: 'anywhere', wordBreak: 'break-word', ...bodyStyle }}>{leader.phone || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filteredMissionaries.length > 0 && (
          <div className="w-full mb-2">
            <h3 className="print-heading font-bold print:!text-black mb-1" style={headingStyle}>{t('bulletin.missionaries').toUpperCase()}</h3>
            <table className="print-body w-full table-fixed" style={bodyStyle}>
              <tbody>
                {filteredMissionaries.map((missionary: any, idx: number) => (
                  <tr key={idx}>
                    <td className="print-body py-0 font-bold pr-1" style={{ width: '60%', ...bodyStyle }}>{missionary.name}</td>
                    <td className="print-body py-0 text-right" style={{ width: '40%', ...bodyStyle }}>{missionary.phone || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filteredWardMissionaries.length > 0 && (
          <div className="w-full mb-1">
            <h3 className="print-heading font-bold print:!text-black mb-1" style={headingStyle}>
              {t('terminology.wardMissionaries', { unit: getTranslatedUnitLabel(t, unitTypeOverride) }).toUpperCase()}
            </h3>
            {filteredWardMissionaries.map((missionary: any, idx: number) => (
              <div key={idx} className="print-body flex justify-between py-0" style={bodyStyle}>
                <span className="font-bold">{missionary.name}</span>
                <span>{missionary.mission || missionary.email || ''}</span>
              </div>
            ))}
          </div>
        )}
        {filteredMilitaryMembers.length > 0 && (
          <div className="w-full mb-1">
            <h3 className="print-heading font-bold print:!text-black mb-1" style={headingStyle}>{t('bulletin.servingInMilitary', 'Serving in the Military').toUpperCase()}</h3>
            {filteredMilitaryMembers.map((member: any, idx: number) => (
              <div key={idx} className="print-body flex justify-between py-0" style={bodyStyle}>
                <span className="font-bold">{member.name}</span>
                <span>{member.mission || member.email || ''}</span>
              </div>
            ))}
          </div>
        )}
        {filteredServiceMissionaries.length > 0 && (
          <div className="w-full mb-1">
            <h3 className="print-heading font-bold print:!text-black mb-1" style={headingStyle}>{t('bulletin.serviceMissionaries').toUpperCase()}</h3>
            {filteredServiceMissionaries.map((missionary: any, idx: number) => (
              <div key={idx} className="print-body flex justify-between py-0" style={bodyStyle}>
                <span className="font-bold">{missionary.name}</span>
                <span>{missionary.serviceName || ''}</span>
              </div>
            ))}
          </div>
        )}
        {plan.backAnnouncements.length > 0 && (
          <div className="mt-2">
            <h2 className="print-heading font-bold print:!text-black w-full text-center mb-1" style={headingStyle}>
              {t('printPreview.announcementsAndEvents')}
            </h2>
            {renderAnnouncementList(plan.backAnnouncements)}
          </div>
        )}
      </div>
      {(plan.moreAnnouncementsLine) && (
        <p className="print-cover-sub font-semibold print:!text-black mt-2 flex-shrink-0" style={coverSubStyle}>
          {t('printPreview.moreAnnouncementsScanQr', 'More announcements: scan the QR code')}
        </p>
      )}
      {showQR && (
        <div className="w-full flex flex-col items-center justify-center text-center mt-2 flex-shrink-0" style={{ paddingBottom: '12px' }}>
          <div className="mb-2">
            <PrintQRCode profileSlug={profile!.profile_slug!} size={qrSize} />
          </div>
          <p className="print-cover-sub print:!text-black font-medium" style={coverSubStyle}>
            {t('qrCode.scanQrCodeToAccess')}
          </p>
        </div>
      )}
    </div>
  );

  const emptyAnnounce = (readingOrder: number) => (
    <div className="print-panel print-region-announcements w-[5.5in] h-[8.5in]" data-reading-order={readingOrder} data-panel-role="announcements" style={PANEL} />
  );

  const moreOnInside = plan.moreAnnouncementsLine && plan.backAnnouncements.length === 0 && Object.values(plan.bookletAnnouncements).every((list) => !list.length);
  const panelByReading: Record<number, React.ReactNode> = {
    1: coverPanel,
    2: data.meetingType === 'baptism' ? emptyAnnounce(2) : announcementsPanel(2, plan.insideAnnouncements, moreOnInside),
    3: programPanel,
  };

  if (outputMode === 'booklet') {
    panelByReading[4] = announcementsPanel(4, plan.bookletAnnouncements[4] || []);
    panelByReading[5] = announcementsPanel(5, plan.bookletAnnouncements[5] || []);
    panelByReading[6] = announcementsPanel(6, plan.bookletAnnouncements[6] || []);
    panelByReading[7] = announcementsPanel(7, plan.bookletAnnouncements[7] || []);
    panelByReading[8] = backPanel;
  } else {
    panelByReading[4] = backPanel;
  }

  const sheets = imposeSheets(outputMode);

  return (
    <div
      ref={ref}
      className="print-layout font-sans"
      data-font-scale={fontScale.toString()}
      data-print-output={outputMode}
      style={{
        fontFamily: selectedTheme ? selectedTheme.fontFamily : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {plan.omittedAnnouncements.length > 0 && (
        <div className="print-overflow-warning mb-3 p-3 bg-amber-100 border border-amber-300 rounded-lg text-amber-900 text-sm print:!hidden" role="status">
          <p className="font-semibold mb-1">
            {t('printPreview.omittedAnnouncementsWarning', 'These announcements will not print at this size. They remain in the digital bulletin (QR code):')}
          </p>
          <ul className="list-disc pl-5">
            {plan.omittedAnnouncements.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
          {outputMode !== 'booklet' && (
            <p className="mt-2">
              {t('printPreview.bookletSuggestion', 'Switch to Booklet to print more announcements on two nested sheets.')}
            </p>
          )}
        </div>
      )}
      {sheets.map(([left, right], index) => (
        <div
          key={`sheet-${index}`}
          ref={index === 0 ? refs?.page1 : index === 1 ? refs?.page2 : undefined}
          className="print-page landscape w-[11in] h-[8.5in] flex print:!text-black"
          data-sheet={index + 1}
          style={{ width: '11in', height: '8.5in', overflow: 'hidden', pageBreakAfter: 'always', boxSizing: 'border-box' }}
        >
          {panelByReading[left]}
          {panelByReading[right]}
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

function ProgramTableRow({ label, value, extra, extra2, sizeStyle }: { label: string, value?: string, extra?: string, extra2?: string, sizeStyle?: React.CSSProperties }) {
  const wrap: React.CSSProperties = {
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    maxWidth: '100%',
    ...sizeStyle,
  };
  return (
    <>
      <tr>
        <td colSpan={3} className="print-body py-0 print:!text-base print:!text-black" style={wrap}>
          <div className="flex justify-between w-full min-w-0 gap-2">
            <span className="print-body text-left print:!text-base print:!text-black min-w-0" style={wrap}>{label}</span>
            <span className="print-body text-right text-[0.9rem] print:!text-base print:!text-black min-w-0" style={wrap}>{value}</span>
          </div>
        </td>
      </tr>
      {extra && (
        <tr>
          <td colSpan={3} className="print-body pt-0 text-center italic text-black text-sm print:!text-base print:!text-black" style={wrap}>{extra}</td>
        </tr>
      )}
      {extra2 && (
        <tr>
          <td colSpan={3} className="print-body pt-0 text-center italic text-black text-sm print:!text-base print:!text-black" style={wrap}>{extra2}</td>
        </tr>
      )}
    </>
  );
}
