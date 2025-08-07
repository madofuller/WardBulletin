import React, { forwardRef } from 'react';
import { sanitizeHtml } from "../lib/sanitizeHtml";
import { decodeHtml } from '../lib/decodeHtml';
import { LDS_IMAGES, getImageById } from '../data/images';

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
                 {/* Back Cover (left) - Ward Information */}
         <div className="w-1/2 pr-16 py-8 flex flex-col justify-start items-start text-left border-r border-gray-300 print:!text-xl print:!text-black overflow-y-auto">
           <h2 className="text-2xl font-bold mb-4 print:!text-3xl print:!text-black w-full text-center">WARD LEADERSHIP</h2>
           
                       {/* Ward Leadership Table */}
            {data.wardLeadership && data.wardLeadership.length > 0 && (
              <div className="w-full mb-6">
                <table className="w-full text-xs print:!text-sm print:!text-black">
                  <tbody>
                    {data.wardLeadership.map((leader: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-1 font-semibold w-1/3">{leader.title}</td>
                        <td className="py-1 w-1/3">{leader.name}</td>
                        <td className="py-1 w-1/3 text-right">
                          {leader.phone && <span className="mr-1">📞</span>}
                          {leader.phone || ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Missionaries Table */}
            {data.missionaries && data.missionaries.length > 0 && (
              <div className="w-full mb-6">
                <h3 className="text-lg font-semibold mb-3 print:!text-xl print:!text-black">MISSIONARIES</h3>
                <table className="w-full text-xs print:!text-sm print:!text-black">
                  <tbody>
                    {data.missionaries.map((missionary: any, idx: number) => (
                      <tr key={idx}>
                                                 <td className="py-1 font-semibold w-1/2">{missionary.name}</td>
                         <td className="py-1 w-1/2 text-right">
                          {missionary.phone && <span className="mr-1">📞</span>}
                          {missionary.phone || ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Missionaries from our ward */}
            {data.wardMissionaries && data.wardMissionaries.length > 0 && (
              <div className="w-full mb-6">
                <h3 className="text-lg font-semibold mb-3 print:!text-xl print:!text-black">MISSIONARIES FROM OUR WARD</h3>
                <table className="w-full text-xs print:!text-xs print:!text-black">
                  <tbody>
                    {data.wardMissionaries.map((missionary: any, idx: number) => (
                      <tr key={idx} className={data.wardMissionaries.length > 4 ? "py-1" : "border-b border-gray-200 py-1"}>
                        <td className="py-1 font-semibold w-1/3">{missionary.name}</td>
                        <td className="py-1 w-1/3 text-xs">
                          {missionary.mission && <span>📍 {missionary.mission}</span>}
                        </td>
                        <td className="py-1 w-1/3 text-xs">
                          {missionary.email && <span>✉️ {missionary.email}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

           {/* Fallback message when no ward info is available */}
           {(!data.wardLeadership || data.wardLeadership.length === 0) && 
            (!data.missionaries || data.missionaries.length === 0) && 
            (!data.wardMissionaries || data.wardMissionaries.length === 0) && (
             <div className="w-full text-center text-gray-500 print:!text-black">
               <p className="text-sm print:!text-base print:!text-black italic">
                 Add ward information in the "Ward Info" tab to display leadership and missionary details here.
               </p>
             </div>
           )}

           {/* Footer */}
           <div className="w-full mt-auto pt-4 border-t border-gray-300 text-center">
             <p className="text-xs print:!text-sm print:!text-black text-gray-500">
               <span className="font-semibold print:!text-black">Build your own at <span className="font-semibold print:!text-black">MyWardBulletin.com</span></span>
             </p>
           </div>
         </div>

        {/* Front Cover (right) */}
        <div className="w-1/2 pl-12 pr-2 py-8 flex flex-col justify-center items-center text-center print:!text-xl print:!text-black">
          <h1 className="text-3xl font-bold mb-2 print:!text-4xl print:!text-black">{data.wardName || 'Ward Name'}</h1>
          <p className="text-lg mb-1 print:!text-2xl print:!text-black">{formatDate(data.date)}</p>
          <p className="text-base mb-1 print:!text-xl print:!text-black">The Church of Jesus Christ of Latter-day Saints</p>
          <p className="text-base mb-4 print:!text-xl print:!text-black">{data.meetingType === 'sacrament' ? 'Sacrament Meeting' : data.meetingType}</p>

          {/* Image Display - moved below text, above theme */}
          {data.imageId && data.imageId !== 'none' && (
            <div className="mb-4">
              {(() => {
                const selectedImage = getImageById(data.imageId);
                console.log('Selected image:', selectedImage); // Debug log
                return selectedImage.url ? (
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.name}
                    className="max-w-full max-h-80 object-contain print:!max-h-96"
                    onLoad={() => console.log('Image loaded successfully:', selectedImage.name)} // Debug log
                    onError={(e) => console.error('Image failed to load:', selectedImage.url, e)} // Debug log
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
        <div className="w-1/2 pl-8 pr-18 py-8 border-r border-gray-300 print:!text-xl print:!text-black">
          <h2 className="text-xl font-bold mb-4 print:!text-3xl print:!text-black">Announcements & Events</h2>
          <ul className="space-y-4">
            {data.announcements?.map((a: any, idx: number) => {
              const decodedContent = sanitizeHtml(decodeHtml(a.content));

              return (
                <li key={idx}>
                  {/* Audience and Category labels */}
                  <div className="font-bold print:!text-lg print:!text-black mb-1">
                    {audienceLabels[(a.audience as keyof typeof audienceLabels) || 'ward']}
                    {a.category && a.category.toLowerCase() !== 'general' && (
                      <span className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded ml-2">{a.category}</span>
                    )}
                  </div>
                  <div className="font-semibold print:!text-2xl print:!text-black">{a.title}</div>
                  <div className="text-sm print:!text-lg print:!text-black" dangerouslySetInnerHTML={{ __html: decodedContent }} />
                </li>
              );
            })}
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
              <ProgramTableRow label={data.leadership?.organistLabel || 'Organist'} value={data.leadership?.organist} />
              <ProgramTableRow label="Prelude Music" value={data.leadership?.preludeMusic} />
              <ProgramTableRow
                label="Opening Hymn"
                value={data.musicProgram?.openingHymnNumber}
                extra={data.musicProgram?.openingHymnTitle}
              />
              <ProgramTableRow label="Invocation" value={data.prayers?.opening} />
              {data.agenda?.map((item: any, idx: number) => (
                item.type === 'speaker' ? (
                  <ProgramTableRow key={idx} label={item.speakerType === 'youth' ? 'Youth Speaker' : 'Speaker'} value={item.name} />
                ) : item.type === 'musical' ? (
                  <ProgramTableRow key={idx} label={item.label || 'Musical Number'} value={item.hymnNumber || item.songName} extra={item.hymnTitle} />
                ) : item.type === 'sacrament' ? (
                  <React.Fragment key={idx}>
                    <ProgramTableRow
                      label="Sacrament Hymn"
                      value={data.musicProgram?.sacramentHymnNumber}
                      extra={data.musicProgram?.sacramentHymnTitle}
                    />
                    <tr>
                      <td colSpan={3} className="text-center font-bold text-lg py-2 print:!text-2xl print:!text-black">Administration of the Sacrament</td>
                    </tr>
                  </React.Fragment>
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
