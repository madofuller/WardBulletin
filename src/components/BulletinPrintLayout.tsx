import React, { forwardRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import QRCode from 'qrcode';
import { sanitizeHtml } from "../lib/sanitizeHtml";
import { SHORT_DOMAIN, FULL_DOMAIN } from "../lib/config";

// Function to format date from ISO format to natural format
function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (year && month && day) {
      const date = new Date(year, month - 1, day);
      // Use user's browser locale and timezone
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    // Fallback
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, {
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

function BulletinPrintLayout({ data, refs }: { data: any, refs?: { page1?: React.RefObject<HTMLDivElement>, page2?: React.RefObject<HTMLDivElement> } }) {
  const { t } = useLanguage();
  const profileSlug = data?.profileSlug || 'your-profile-slug';
  const useShortDomain = true;
  const qrUrl = `https://${useShortDomain ? SHORT_DOMAIN : FULL_DOMAIN}/${profileSlug}`;

  useEffect(() => {
    const canvas = document.getElementById('print-qr-code') as HTMLCanvasElement;
    if (!canvas) return;

    QRCode.toCanvas(
      canvas,
      qrUrl,
      {
        width: 200, // Increased size for better mobile scanning
        margin: 2, // Increased margin for better contrast
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H' // Highest error correction for better mobile scanning
      },
      (err) => {
        if (err) console.error('QR Code render error:', err);
      }
    );
  }, [qrUrl]);

  const audienceLabels = {
    ward: t('audience_ward'),
    relief_society: t('audience_relief_society'),
    elders_quorum: t('audience_elders_quorum'),
    young_women: t('audience_young_women'),
    young_men: t('audience_young_men'),
    youth: t('audience_youth'),
    primary: t('audience_primary'),
    stake: t('audience_stake'),
    other: t('audience_other'),
  };

  return (
    <div className="print-layout font-sans">
      {/* Page 1: Outside (landscape) */}
      <div
        ref={refs?.page1}
        className="print-page landscape w-[11in] h-[8.5in] flex"
        style={{ pageBreakAfter: 'always' }}
      >
        {/* Back Cover (left) */}
        <div className="w-1/2 pr-16 py-8 flex flex-col justify-center items-center text-center border-r border-gray-300 print:!text-xl print:!text-black">
          <p className="text-lg font-semibold mb-4 print:!text-2xl print:!text-black">{t('digital_version')}</p>
          <canvas
            id="print-qr-code"
            width={160}
            height={160}
            className="mb-4"
          />
          <p className="text-xs font-semibold text-gray-600 break-all print:!text-lg print:!text-black">{qrUrl}</p>
          <p className="mt-2 font-semibold text-xs text-gray-500 print:!text-lg print:!text-black">
            <span className="font-semibold print:!text-black">{t('build_your_own')} <span className="font-semibold print:!text-black">MyWardBulletin.com</span></span>
          </p>
        </div>

        {/* Front Cover (right) */}
        <div className="w-1/2 pl-12 pr-2 py-8 flex flex-col justify-center items-center text-center print:!text-xl print:!text-black">
          <h1 className="text-3xl font-bold mb-2 print:!text-4xl print:!text-black">{data.wardName || t('audience_ward')}</h1>
          <p className="text-lg mb-1 print:!text-2xl print:!text-black">{formatDate(data.date)}</p>
          <p className="text-base mb-1 print:!text-xl print:!text-black">The Church of Jesus Christ of Latter-day Saints</p>
          <p className="text-base mb-4 print:!text-xl print:!text-black">{data.meetingType === 'sacrament' ? t('sacrament_meeting') : data.meetingType}</p>

          {data.theme && <p className="font-semibold italic text-sm text-gray-600 print:!text-lg print:!text-black">"{data.theme}"</p>}
        </div>
      </div>

      {/* Page 2: Inside (landscape) */}
      <div ref={refs?.page2} className="print-page landscape w-[11in] h-[8.5in] flex print:!text-xl print:!text-black">
        {/* Announcements (left) */}
        <div className="w-1/2 pl-8 pr-18 py-8 border-r border-gray-300 print:!text-xl print:!text-black">
          <h2 className="text-xl font-bold mb-4 print:!text-3xl print:!text-black">{t('announcements_events')}</h2>
          <ul className="space-y-4">
            {data.announcements?.map((a: any, idx: number) => (
              <li key={idx}>
                {/* Audience label */}
                <div className="font-bold print:!text-lg print:!text-black mb-1">
                  {audienceLabels[(a.audience as keyof typeof audienceLabels) || 'ward']}
                </div>
                <div className="font-semibold print:!text-2xl print:!text-black">{a.title}</div>
                <div className="text-sm print:!text-lg print:!text-black" dangerouslySetInnerHTML={{ __html: sanitizeHtml(a.content) }} />
              </li>
            ))}
          </ul>
        </div>

        {/* Program (right) */}
        <div className="w-1/2 pl-20 pr-8 py-8 text-center print:!text-xl print:!text-black">
          <h2 className="text-3xl font-bold mb-1 font-serif print:!text-4xl print:!text-black">{data.wardName || 'Ward Name'}</h2>
          <h3 className="text-2xl font-bold mb-1 font-serif print:!text-3xl print:!text-black">
            {data.meetingType === 'sacrament' ? t('sacrament_meeting') : t('program')}
          </h3>
          <p className="italic text-lg mb-6 font-serif print:!text-2xl print:!text-black">{formatDate(data.date)}</p>

          <table className="w-full text-[1.05rem] font-serif print:!text-lg print:!text-black" style={{ borderCollapse: 'separate', borderSpacing: '0 0.4em' }}>
            <tbody>
              <ProgramTableRow label={t('presiding')} value={data.leadership?.presiding} />
              <ProgramTableRow label={t('conducting')} value={data.leadership?.conducting} />
              <ProgramTableRow label={t('chorister')} value={data.leadership?.chorister} />
              <ProgramTableRow label={data.leadership?.organistLabel || t('organist')} value={data.leadership?.organist} />
              <ProgramTableRow label={t('prelude_music')} value={data.leadership?.preludeMusic} />
              <ProgramTableRow
                label={t('opening_hymn')}
                value={data.musicProgram?.openingHymnNumber}
                extra={data.musicProgram?.openingHymnTitle}
              />
              <ProgramTableRow label={t('invocation')} value={data.prayers?.opening} />
              {data.agenda?.map((item: any, idx: number) => (
                item.type === 'speaker' ? (
                  <ProgramTableRow key={idx} label={item.speakerType === 'youth' ? t('youth_speaker') : t('speaker')} value={item.name} />
                ) : item.type === 'musical' ? (
                  <ProgramTableRow key={idx} label={item.label || t('musical_number')} value={item.hymnNumber || item.songName} extra={item.hymnTitle} />
                ) : item.type === 'sacrament' ? (
                  <React.Fragment key={idx}>
                    <ProgramTableRow
                      label={t('sacrament_hymn')}
                      value={data.musicProgram?.sacramentHymnNumber}
                      extra={data.musicProgram?.sacramentHymnTitle}
                    />
                    <tr>
                      <td colSpan={3} className="text-center font-bold text-lg py-2 print:!text-2xl print:!text-black">{t('administration_sacrament')}</td>
                    </tr>
                  </React.Fragment>
                ) : null
              ))}
              <ProgramTableRow
                label={t('closing_hymn')}
                value={data.musicProgram?.closingHymnNumber}
                extra={data.musicProgram?.closingHymnTitle}
              />
              <ProgramTableRow label={t('benediction')} value={data.prayers?.closing} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BulletinPrintLayout;

function ProgramTableRow({ label, value, extra }: { label: string, value?: string, extra?: string }) {
  return (
    <>
      <tr>
        <td colSpan={3} className="py-[2px] print:!text-lg print:!text-black">
          <div className="flex justify-between w-full">
            <span className="text-left mr-2 whitespace-nowrap print:!text-lg print:!text-black">{label}</span>
            <span className="text-right ml-2 whitespace-nowrap text-[0.95rem] print:!text-lg print:!text-black">{value}</span>
          </div>
        </td>
      </tr>
      {extra && (
        <tr>
          <td colSpan={3} className="pt-0 text-center italic text-black text-base print:!text-lg print:!text-black">{extra}</td>
        </tr>
      )}
    </>
  );
}
