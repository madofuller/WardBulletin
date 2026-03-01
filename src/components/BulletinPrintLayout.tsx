import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sanitizeHtml } from "../lib/sanitizeHtml";
import { decodeHtml } from '../lib/decodeHtml';
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

  // Detect when content is cut off (overflow hidden) so we can warn in preview
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
        announcements = el.scrollHeight > el.clientHeight;
      }
      setOverflow(prev => (prev.backCover === backCover && prev.announcements === announcements) ? prev : { backCover, announcements });
    };
    const t1 = setTimeout(check, 150);
    const t2 = setTimeout(check, 500);
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
  }, [data.announcements?.length, data.wardLeadership?.length, data.missionaries?.length, data.wardMissionaries?.length, data.serviceMissionaries?.length, data.printFontScale, data.printTightMargins, data.showQRCodeOnPrint]);

  // Print font scale: 1 = normal, 1.15 = large, 1.25 = extra large (scales text without shifting layout)
  const fontScale = typeof data.printFontScale === 'number' && data.printFontScale >= 1 && data.printFontScale <= 1.5
    ? data.printFontScale
    : 1;
  const scalePx = (px: number) => `${Math.round(px * fontScale)}px`;

  // Tighter margins to fit more announcements on the page
  const tight = !!data.printTightMargins;
  const pad = {
    page: tight ? 'pl-8 pr-4 py-4' : 'pl-16 pr-8 py-8',
    pageLeft: tight ? 'px-4 py-4 pr-8' : 'px-8 py-6 pr-16',
    announcementsGap: tight ? 'gap-2' : 'gap-4',
    announcementsList: tight ? 'space-y-1' : 'space-y-1.5',
    sectionMb: tight ? 'mb-1' : 'mb-2'
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
  const filteredWardMissionaries = data.wardMissionaries?.filter(hasValidMissionaryInfo) || [];
  const filteredServiceMissionaries = data.serviceMissionaries?.filter(hasValidServiceMissionaryInfo) || [];

  // Check if there's any meaningful ward info to display
  const hasWardInfo = filteredWardLeadership.length > 0 || filteredMissionaries.length > 0 || filteredWardMissionaries.length > 0 || filteredServiceMissionaries.length > 0;

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
        style={{ pageBreakAfter: 'always' }}
      >
                 {/* Back Cover (left) - Unit Information */}
          <div className={`w-1/2 flex flex-col justify-between text-left print:!text-sm print:!text-black ${pad.pageLeft}`}>
           {/* Scrollable content area - reserves space for QR code if enabled */}
           <div ref={backCoverRef} className="flex-1 overflow-y-hidden" style={{ maxHeight: (profile?.profile_slug && data.showQRCodeOnPrint !== false) ? 'calc(100% - 200px)' : '100%' }}>
              {/* Unit Leadership Table */}
              {filteredWardLeadership.length > 0 && (
                <div className={`w-full ${pad.sectionMb}`}>
                  <h2 className={`text-lg font-bold print:!text-lg print:!text-black w-full text-center ${tight ? 'mb-1' : 'mb-2'}`}>{t('terminology.wardLeadership', { unit: getTranslatedUnitLabel(t, unitTypeOverride) }).toUpperCase()}</h2>
                   <table className="w-full text-xs print:!text-xs print:!text-black table-fixed">
                     <tbody>
                       {filteredWardLeadership.slice(0, data.showQRCodeOnPrint !== false ? filteredWardLeadership.length : 20).map((leader: any, idx: number) => (
                         <tr key={idx}>
                           <td className="py-1 font-bold text-xs pr-2 whitespace-nowrap" style={{ width: '45%' }}>{leader.title}</td>
                           <td className="py-1 text-xs font-normal pr-2 whitespace-nowrap" style={{ width: '30%' }}>{leader.name}</td>
                           <td className="py-1 text-right text-xs font-normal whitespace-nowrap" style={{ width: '25%' }}>
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
                    <p className="text-xs text-gray-600 mt-1 text-center">+ {filteredMissionaries.length - 12} {t('bulletin.moreMissionaries')}</p>
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
                            <span className="text-gray-600">{missionary.mission}</span>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0 font-normal" style={{ minWidth: '120px' }}>
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
           </div>

           {/* QR Code - Fixed at bottom with reserved space, only if enabled */}
           {profile?.profile_slug && data.showQRCodeOnPrint !== false && (
             <div className="w-full flex flex-col items-center justify-center text-center mt-4 flex-shrink-0">
               <div className="mb-3">
                 <PrintQRCode profileSlug={profile.profile_slug} />
               </div>
               <p className="text-sm print:!text-base print:!text-black font-medium">
                 {t('qrCode.scanQrCodeToAccess')}
               </p>
             </div>
           )}

         </div>

        {/* Front Cover (right) */}
        <div className={`w-1/2 flex flex-col justify-center items-center text-center print:!text-xl print:!text-black ${pad.page}`}>
          <h1 className="text-3xl font-bold mb-2 print:!text-4xl print:!text-black">{data.wardName || t('form.wardName', { unit: getTranslatedUnitLabel(t, unitTypeOverride) })}</h1>
          <p className="text-lg mb-1 print:!text-2xl print:!text-black">{formatDate(data.date, i18n.language)}</p>
          <p className="text-base mb-1 print:!text-xl print:!text-black">{t('bulletin.churchName')}</p>
          <p className="text-base mb-4 print:!text-xl print:!text-black">{t('bulletin.sacramentMeeting')}</p>

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
      <div ref={refs?.page2} className="print-page landscape w-[11in] h-[8.5in] flex print:!text-xl print:!text-black">
        {/* Announcements (left) */}
        <div className={`w-1/2 flex flex-col text-left print:!text-xl print:!text-black ${pad.page}`}>
          <div ref={announcementsRef} className="flex-1 overflow-y-hidden flex flex-col min-h-0">
            {/* Announcements Section - Optimized for Print */}
            <div className={`w-full flex-1 flex flex-col ${pad.sectionMb} min-h-full`}>
              <h2 className={`text-lg font-bold print:!text-xl print:!text-black w-full text-center flex-shrink-0 ${tight ? 'mb-1' : 'mb-2'}`}>{t('printPreview.announcementsAndEvents')}</h2>
              <div className="flex-1 flex flex-col min-h-0">
              {(() => {
                // Group announcements by audience (like BulletinPreview does)
                const grouped = (data.announcements || []).reduce((groups: Record<string, any[]>, announcement: any) => {
                  const isStandalone = announcement.audience?.startsWith('standalone_');
                  const audienceLabel = isStandalone
                    ? (announcement.customAudienceLabel || '')
                    : getAudienceLabel(announcement.audience || getUnitLowercase(unitTypeOverride));

                  if (!groups[audienceLabel]) {
                    groups[audienceLabel] = [];
                  }
                  groups[audienceLabel].push(announcement);
                  return groups;
                }, {});

                // Flatten all announcements into a single array for two-column layout
                const allItems: { audienceLabel: string; announcement: any; isHeader: boolean }[] = [];
                Object.entries(grouped).forEach(([audienceLabel, announcements]) => {
                  if (audienceLabel) {
                    allItems.push({ audienceLabel, announcement: null, isHeader: true });
                  }
                  (announcements as any[]).forEach(a => {
                    allItems.push({ audienceLabel, announcement: a, isHeader: false });
                  });
                });

                // Calculate dynamic font size based on announcement count AND content volume
                // This ensures that when there's little content, text isn't too small
                const totalAnnouncements = (data.announcements || []).length;
                
                // Calculate total content length (character count) - strip HTML for accurate count
                const totalContentLength = (data.announcements || []).reduce((sum, a) => {
                  const content = a.content || '';
                  const title = a.title || '';
                  // Strip HTML tags and decode entities for accurate character count
                  const textContent = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
                  const textTitle = title.replace(/<[^>]*>/g, '').trim();
                  return sum + textContent.length + textTitle.length;
                }, 0);
                
                // Estimate average content per announcement
                const avgContentPerAnnouncement = totalAnnouncements > 0 ? totalContentLength / totalAnnouncements : 0;
                
                // Estimate vertical space needed based on character count
                // Assumptions:
                // - Single column width: ~5.5in = ~65-70 chars per line (at 12px font)
                // - Two column width: ~2.5in per column = ~30-35 chars per line per column (at 10px font)
                // - Line height: ~1.5x font size
                // - Available height: ~7in usable (8.5in page - margins) ≈ 500-550px
                
                const charsPerLineSingle = 70; // Approximate chars per line in single column
                const charsPerLineDoublePerCol = 32; // Approximate chars per line per column in two-column
                const lineHeightMultiplier = 1.5;
                
                // Estimate lines needed (content + titles + spacing)
                // Add ~2 lines per announcement for title and spacing
                const contentLinesSingle = Math.ceil(totalContentLength / charsPerLineSingle);
                const contentLinesDouble = Math.ceil(totalContentLength / (charsPerLineDoublePerCol * 2));
                const spacingLines = totalAnnouncements * 2; // Title + spacing per announcement
                
                const totalLinesSingle = contentLinesSingle + spacingLines;
                const totalLinesDouble = contentLinesDouble + (spacingLines * 0.7); // Less spacing in columns
                
                // Estimate height in pixels
                // Use average font sizes: 12px for single column, 10px for double column
                const estimatedHeightSingle = totalLinesSingle * 12 * lineHeightMultiplier;
                const estimatedHeightDouble = totalLinesDouble * 10 * lineHeightMultiplier;
                
                // Available vertical space: ~500-550px usable height
                const minHeightForSingle = 200; // Minimum to avoid looking too sparse
                const maxHeightForSingle = 500; // Max before needing two columns
                
                // Determine column count based on estimated height
                let columnCount = 2; // Default to 2 columns
                let useSingleColumn = false;
                
                if (totalAnnouncements <= 1) {
                  // Always single column for 1 announcement
                  useSingleColumn = true;
                  columnCount = 1;
                } else if (estimatedHeightSingle <= maxHeightForSingle && estimatedHeightSingle >= minHeightForSingle) {
                  // Content fits well in single column (200-500px) - use it to fill space
                  useSingleColumn = true;
                  columnCount = 1;
                } else if (estimatedHeightSingle < minHeightForSingle && totalAnnouncements <= 3) {
                  // Very sparse content (1-3 announcements, < 200px) - use single column with larger fonts
                  useSingleColumn = true;
                  columnCount = 1;
                } else if (estimatedHeightDouble > 550 || totalAnnouncements > 12) {
                  // Very dense content - use 3 columns if needed
                  columnCount = 3;
                }
                
                // Determine content density for font sizing
                const isLowContent = totalAnnouncements <= 3 || (totalAnnouncements <= 6 && avgContentPerAnnouncement < 200);
                const isMediumContent = totalAnnouncements <= 8 && avgContentPerAnnouncement >= 200;
                const isHighContent = totalAnnouncements > 8 || (totalAnnouncements > 6 && avgContentPerAnnouncement >= 300);
                
                const columnClass = useSingleColumn ? 'columns-1' : `columns-${columnCount} ${pad.announcementsGap}`;
                
                // Scale fonts based on content density - more content = smaller font, less content = larger font
                let contentFontSize, titleFontSize, headerFontSize;
                
                // Calculate spacing to fill vertical space when content is sparse
                // Base spacing on estimated height - if content is sparse, add more spacing
                let announcementSpacing = pad.announcementsList; // Default spacing
                let sectionSpacing = pad.sectionMb; // Default section spacing
                
                // Determine if content is sparse based on estimated height
                const isSparse = estimatedHeightSingle < minHeightForSingle;
                const fitsWellSingle = estimatedHeightSingle >= minHeightForSingle && estimatedHeightSingle <= maxHeightForSingle;
                
                if (totalAnnouncements <= 1 || (useSingleColumn && isSparse)) {
                  // Single announcement or sparse content in single column - use much larger fonts and spacing
                  contentFontSize = scalePx(14);
                  titleFontSize = scalePx(16);
                  headerFontSize = scalePx(18);
                  announcementSpacing = 'space-y-4'; // More spacing between items
                  sectionSpacing = 'mb-4'; // More spacing between sections
                } else if (totalAnnouncements === 2 && useSingleColumn) {
                  // Two announcements in single column - still use larger fonts and spacing
                  contentFontSize = scalePx(13);
                  titleFontSize = scalePx(15);
                  headerFontSize = scalePx(17);
                  announcementSpacing = 'space-y-3';
                  sectionSpacing = 'mb-3';
                } else if (useSingleColumn && fitsWellSingle) {
                  // Content fits well in single column - use moderate larger fonts
                  contentFontSize = scalePx(12);
                  titleFontSize = scalePx(14);
                  headerFontSize = scalePx(15);
                  announcementSpacing = 'space-y-3';
                  sectionSpacing = 'mb-3';
                } else if (isLowContent) {
                  // Very little content - use larger fonts so it doesn't look too small
                  contentFontSize = scalePx(12);
                  titleFontSize = scalePx(13);
                  headerFontSize = scalePx(14);
                } else if (isMediumContent) {
                  // Medium content - balanced sizing
                  contentFontSize = scalePx(10);
                  titleFontSize = scalePx(11);
                  headerFontSize = scalePx(12);
                } else if (isHighContent) {
                  // Lots of content - smaller fonts to fit everything
                  contentFontSize = scalePx(9);
                  titleFontSize = scalePx(10);
                  headerFontSize = scalePx(11);
                } else {
                  // Default for very high content
                  contentFontSize = scalePx(8);
                  titleFontSize = scalePx(9);
                  headerFontSize = scalePx(10);
                }

                return (
                  <div className={`${columnClass} flex-1`} style={{ columnFill: 'balance', minHeight: '100%' }}>
                    {Object.entries(grouped).map(([audienceLabel, announcements], groupIdx) => (
                      <div key={audienceLabel} className={`break-inside-avoid-column ${groupIdx < Object.keys(grouped).length - 1 ? sectionSpacing : ''} ${totalAnnouncements <= 2 ? 'flex-1 flex flex-col justify-start' : ''}`}>
                        {/* Group header - only show once per group if there's a label */}
                        {audienceLabel && (
                          <div
                            className={`font-bold print:!text-black border-b border-gray-300 pb-0.5 ${totalAnnouncements <= 1 ? 'mb-3' : totalAnnouncements === 2 ? 'mb-2' : 'mb-1'}`}
                            style={{ fontSize: headerFontSize }}
                          >
                            {audienceLabel}
                          </div>
                        )}
                        <ul className={announcementSpacing}>
                          {(announcements as any[]).map((a: any, idx: number) => {
                            const decodedContent = sanitizeHtml(decodeHtml(a.content));
                            return (
                              <li key={idx} className="break-inside-avoid-column">
                                <div
                                  className="font-semibold print:!text-black leading-tight"
                                  style={{ fontSize: titleFontSize }}
                                >
                                  {a.title}
                                </div>
                                {a.category && a.category !== 'general' && (
                                  <span
                                    className="text-gray-600 bg-gray-100 px-1 py-0.5 rounded inline-block mb-0.5"
                                    style={{ fontSize: scalePx(8) }}
                                  >
                                    {a.category}
                                  </span>
                                )}
                                <div
                                  className={`print:!text-black leading-tight ${totalAnnouncements <= 1 ? 'mb-3' : totalAnnouncements === 2 ? 'mb-2' : 'mb-1'}`}
                                  style={{
                                    fontSize: contentFontSize,
                                    '--tw-prose-bullets': 'disc',
                                    '--tw-prose-list-style': 'disc',
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word',
                                    whiteSpace: 'pre-wrap'
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
                                      '<p style="margin: 0 0 0.25rem 0;">'
                                    )
                                  }}
                                />

                                {/* Announcement Images - Smaller for print */}
                                {/* Legacy single image support */}
                                {a.imageId && a.imageId !== 'none' && !a.images && !a.hideImageOnPrint && (
                                  <div className="mb-1">
                                    {(() => {
                                      const selectedImage = getImageByIdSync(a.imageId);
                                      return selectedImage?.url ? (
                                        <img
                                          src={selectedImage.url}
                                          alt={selectedImage.name}
                                          className="h-auto rounded shadow-sm"
                                          style={{
                                            objectFit: 'contain',
                                            maxHeight: '80px',
                                            maxWidth: '120px',
                                            borderRadius: '0.25rem'
                                          }}
                                        />
                                      ) : null;
                                    })()}
                                  </div>
                                )}

                                {/* Multiple images support - Compact for print */}
                                {a.images && a.images.length > 0 && (
                                  <div className="mb-1 flex flex-wrap gap-1">
                                    {a.images.slice(0, 2).map((img: any, index: number) => {
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
                                          className="h-auto rounded shadow-sm"
                                          style={{
                                            objectFit: 'contain',
                                            maxHeight: '60px',
                                            maxWidth: '90px',
                                            borderRadius: '0.25rem'
                                          }}
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      ) : null;
                                    })}
                                    {a.images.filter((img: any) => !img.hideImageOnPrint).length > 2 && (
                                      <span style={{ fontSize: scalePx(8) }} className="text-gray-500 self-end">
                                        +{a.images.filter((img: any) => !img.hideImageOnPrint).length - 2} more
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
            </div>
          </div>
        </div>

        {/* Program (right) */}
        <div className={`w-1/2 flex flex-col justify-center items-center text-center print:!text-xl print:!text-black ${pad.page}`}>
          <h2 className="text-3xl font-bold mb-2 print:!text-4xl print:!text-black">{data.wardName || t('form.wardName', { unit: getTranslatedUnitLabel(t, unitTypeOverride) })}</h2>
          <h3 className="text-2xl font-bold mb-1 print:!text-3xl print:!text-black">{t('bulletin.sacramentMeeting')}</h3>
          <p className="italic text-lg mb-6 print:!text-2xl print:!text-black">{formatDate(data.date, i18n.language)}</p>

          <table className="w-full text-[1rem] print:!text-base print:!text-black" style={{ borderCollapse: 'separate', borderSpacing: '0 0.4em' }}>
            <tbody>
              <ProgramTableRow label={t('bulletin.presiding')} value={data.leadership?.presiding} />
              <ProgramTableRow label={t('bulletin.conducting')} value={data.leadership?.conducting} />
              <ProgramTableRow label={data.leadership?.choristerLabel === 'Music Leader' ? t('form.musicLeader') : t('form.chorister')} value={data.leadership?.chorister} />
              <ProgramTableRow label={data.leadership?.organistLabel === 'Pianist' ? t('form.pianist') : t('form.organist')} value={data.leadership?.organist} />
              {data.leadership?.preludeMusic && (
                <ProgramTableRow label={t('bulletin.preludeMusic')} value={data.leadership?.preludeMusic} />
              )}
              <ProgramTableRow
                label={t('bulletin.openingHymn')}
                value={data.musicProgram?.openingHymnNumber}
                extra={data.musicProgram?.openingHymnTitle}
              />
              <ProgramTableRow label={t('bulletin.invocation')} value={data.prayers?.opening} />
              <tr>
                <td colSpan={3} className="text-center font-medium text-lg print:!text-xl print:!text-black">
                  {t('bulletin.unitBusiness', { unit: getTranslatedUnitLabel(t, unitTypeOverride) })}
                </td>
              </tr>
              {data.agenda?.map((item: any, idx: number) => (
                item.type === 'speaker' ? (
                  <ProgramTableRow key={idx} label={item.speakerType === 'youth' ? t('bulletin.youthSpeaker') : t('bulletin.speaker')} value={item.name} />
                ) : item.type === 'musical' ? (
                  <ProgramTableRow key={idx} label={item.label === 'Intermediate Hymn' ? t('form.intermediateHymn') : t('bulletin.musicalNumber')} value={item.hymnNumber || item.songName} extra={item.hymnTitle} />
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
                        {t('bulletin.babyBlessing')}
                        {item.childName && (
                          <div className="text-sm font-normal text-gray-800 mt-1 print:!text-base print:!text-black">
                            {item.childName}
                          </div>
                        )}
                        {item.blesserName && (
                          <div className="text-sm font-normal italic text-gray-700 mt-1 print:!text-base print:!text-black">
                            {t('bulletin.blessedBy')}: {item.blesserName}
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
  );
});

// PrintQRCode component for generating QR codes specifically for printing
function PrintQRCode({ profileSlug }: { profileSlug: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const qrUrl = `https://${SHORT_DOMAIN}/${profileSlug}`;
      
      try {
        await QRCode.toCanvas(canvas, qrUrl, {
          width: 128, // Reduced from 192
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H' // Highest error correction for print
        });
      } catch (error) {
        // Fallback to text display
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 128, 128);
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 128, 128);
          ctx.strokeStyle = 'black';
          ctx.strokeRect(0, 0, 128, 128);
          ctx.fillStyle = 'black';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('QR Code', 64, 60);
          ctx.fillText('Error', 64, 75);
        }
      }
    };

    generateQRCode();
  }, [profileSlug]);

  return (
    <canvas
      ref={canvasRef}
      width={128}
      height={128}
      className="w-32 h-32 bg-white mx-auto"
    />
  );
}

export default BulletinPrintLayout;

function ProgramTableRow({ label, value, extra }: { label: string, value?: string, extra?: string }) {
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
    </>
  );
}
