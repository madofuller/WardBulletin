<<<<<<< HEAD
import React, { forwardRef, useEffect } from 'react';
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

  // Add audienceLabels mapping at the top
  const audienceLabels = {
    ward: 'Ward',
    relief_society: 'Relief Society',
    elders_quorum: 'Elders Quorum',
    young_women: 'Young Women',
    young_men: 'Young Men',
    youth: 'Youth',
    primary: 'Primary',
    stake: 'Stake',
    other: 'Other',
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
          <p className="text-lg font-semibold mb-4 print:!text-2xl print:!text-black">Digital Version</p>
          <canvas
            id="print-qr-code"
            width={160}
            height={160}
            className="mb-4"
          />
          <p className="text-xs font-semibold text-gray-600 break-all print:!text-lg print:!text-black">{qrUrl}</p>
          <p className="mt-2 font-semibold text-xs text-gray-500 print:!text-lg print:!text-black">
            <span className="font-semibold print:!text-black">Build your own at <span className="font-semibold print:!text-black">MyWardBulletin.com</span></span>
          </p>
        </div>

        {/* Front Cover (right) */}
        <div className="w-1/2 pl-12 pr-2 py-8 flex flex-col justify-center items-center text-center print:!text-xl print:!text-black">
          <h1 className="text-3xl font-bold mb-2 print:!text-4xl print:!text-black">{data.wardName || 'Ward Name'}</h1>
          <p className="text-lg mb-1 print:!text-2xl print:!text-black">{formatDate(data.date)}</p>
          <p className="text-base mb-1 print:!text-xl print:!text-black">The Church of Jesus Christ of Latter-day Saints</p>
          <p className="text-base mb-4 print:!text-xl print:!text-black">{data.meetingType === 'sacrament' ? 'Sacrament Meeting' : data.meetingType}</p>

          {data.theme && <p className="font-semibold italic text-sm text-gray-600 print:!text-lg print:!text-black">"{data.theme}"</p>}
        </div>
      </div>

      {/* Page 2: Inside (landscape) */}
      <div ref={refs?.page2} className="print-page landscape w-[11in] h-[8.5in] flex print:!text-xl print:!text-black">
        {/* Announcements (left) */}
        <div className="w-1/2 pl-8 pr-18 py-8 border-r border-gray-300 print:!text-xl print:!text-black">
          <h2 className="text-xl font-bold mb-4 print:!text-3xl print:!text-black">Announcements & Events</h2>
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
            {data.meetingType === 'sacrament' ? 'Sacrament Meeting' : 'Program'}
          </h3>
          <p className="italic text-lg mb-6 font-serif print:!text-2xl print:!text-black">{formatDate(data.date)}</p>

          <table className="w-full text-[1.05rem] font-serif print:!text-lg print:!text-black" style={{ borderCollapse: 'separate', borderSpacing: '0 0.4em' }}>
            <tbody>
              <ProgramTableRow label="Presiding" value={data.leadership?.presiding} />
              <ProgramTableRow label="Conducting" value={data.leadership?.conducting} />
              <ProgramTableRow label="Chorister" value={data.leadership?.chorister} />
              <ProgramTableRow label="Organist" value={data.leadership?.organist} />
              <ProgramTableRow
                label="Opening Hymn"
                value={data.musicProgram?.openingHymnNumber}
                extra={data.musicProgram?.openingHymnTitle}
              />
              <ProgramTableRow label="Invocation" value={data.prayers?.opening} />
              <ProgramTableRow
                label="Sacrament Hymn"
                value={data.musicProgram?.sacramentHymnNumber}
                extra={data.musicProgram?.sacramentHymnTitle}
              />
              <tr>
                <td colSpan={3} className="text-center font-bold text-lg py-2 print:!text-2xl print:!text-black">Administration of the Sacrament</td>
              </tr>
              {data.agenda?.map((item: any, idx: number) => (
                item.type === 'speaker' ? (
                  <ProgramTableRow key={idx} label={item.speakerType === 'youth' ? 'Youth Speaker' : 'Speaker'} value={item.name} />
                ) : item.type === 'musical' ? (
                  <ProgramTableRow key={idx} label={item.label || 'Musical Number'} value={item.hymnNumber || item.songName} extra={item.hymnTitle} />
                ) : null
              ))}
              <ProgramTableRow
                label="Closing Hymn"
                value={data.musicProgram?.closingHymnNumber}
                extra={data.musicProgram?.closingHymnTitle}
              />
              <ProgramTableRow label="Benediction" value={data.prayers?.closing} />
            </tbody>
          </table>
=======
import React from 'react';
import QRCode from 'qrcode.react';

const BulletinPrintLayout = React.forwardRef<HTMLDivElement, { data: any }>(
  ({ data }, printRef) => (
    <div
      ref={printRef}
      className="w-[8.5in] h-[11in] flex font-serif text-[0.95rem]"
      style={{ pageBreakAfter: 'always' }}
    >
      {/* Cover Panel */}
      <div className="w-1/2 px-6 py-10 flex flex-col justify-between">
        <div>
          <QRCode value={data.qrLink} size={100} />
          <div className="mt-2 uppercase text-xs tracking-wide text-gray-600">Digital Version</div>
          <div className="text-blue-700 underline break-all">{data.qrLink}</div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-xl font-bold">{data.wardName}</div>
          <div className="font-semibold">{data.meetingType}</div>
          <div>{data.date}</div>
        </div>
      </div>
      {/* Program Panel */}
      <div className="w-1/2 px-6 py-10">
        <div className="text-center mb-6 space-y-1">
          <div className="text-xl font-bold">{data.wardName}</div>
          <div className="text-lg font-semibold">
            {data.meetingType} – {data.date}
          </div>
>>>>>>> origin/codex/analyze-pdf-export-configuration
        </div>
        <ul className="space-y-1">
          <ProgramItem label="Conducting" value={data.leadership.conducting} />
          <ProgramItem label="Presiding" value={data.leadership.presiding} />
          <ProgramItem label="Music Leader" value={data.leadership.chorister} />
          <ProgramItem label="Organist" value={data.leadership.organist} />
          <ProgramItem label="Welcome and Announcements" />
          <ProgramItem
            label="Opening Hymn"
            value={`#${data.musicProgram.openingHymnNumber} "${data.musicProgram.openingHymnTitle}"`}
          />
          <ProgramItem label="Invocation" value={data.prayers.opening} />
          {data.wardBusiness && <ProgramItem label="Ward Business" />}
          {data.stakeBusiness && <ProgramItem label="Stake Business" />}
          <ProgramItem
            label="Sacrament Hymn"
            value={`#${data.musicProgram.sacramentHymnNumber} "${data.musicProgram.sacramentHymnTitle}"`}
          />
          <ProgramItem label="Administration of the Sacrament" />
          {data.agenda.map((item: any, idx: number) => (
            item.type === 'speaker' ? (
              <ProgramItem
                key={idx}
                label={item.speakerType === 'youth' ? 'Youth Speaker' : 'Speaker'}
                value={item.name}
              />
            ) : item.type === 'musical' ? (
              <ProgramItem
                key={idx}
                label={item.label || 'Musical Number'}
                value={
                  item.hymnNumber
                    ? `#${item.hymnNumber} "${item.hymnTitle}"`
                    : item.songName
                }
              />
            ) : null
          ))}
          <ProgramItem
            label="Closing Hymn"
            value={`#${data.musicProgram.closingHymnNumber} "${data.musicProgram.closingHymnTitle}"`}
          />
          <ProgramItem label="Benediction" value={data.prayers.closing} />
        </ul>
      </div>
    </div>
  )
);

export default BulletinPrintLayout;

<<<<<<< HEAD
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
=======
function ProgramItem({ label, value }: { label: string; value?: string }) {
  return (
    <li className="flex justify-between border-b border-dotted border-gray-400 pb-1">
      <span className="font-semibold">{label}</span>
      {value && <span className="italic text-right">{value}</span>}
    </li>
  );
}
>>>>>>> origin/codex/analyze-pdf-export-configuration
