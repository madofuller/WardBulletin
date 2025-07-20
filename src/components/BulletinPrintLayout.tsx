import React, { forwardRef } from 'react';

// Accept refs for each page for PDF export
function BulletinPrintLayout({ data, refs }: { data: any, refs?: { page1?: React.RefObject<HTMLDivElement>, page2?: React.RefObject<HTMLDivElement> } }) {
  return (
    <div className="print-layout">
      {/* Page 1: Outside (landscape) */}
      <div ref={refs?.page1} className="print-page landscape flex w-full h-[8.5in] min-h-[8.5in]" style={{ pageBreakAfter: 'always' }}>
        {/* Back Cover (left) */}
        <div className="w-1/2 p-8 flex flex-col justify-between border-r border-gray-300">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">Ward Leadership</h2>
            {/* Placeholder for edit button */}
            <button className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300" style={{display:'none'}}>Edit</button>
          </div>
          <ul className="text-sm mb-6">
            {data.wardLeadership?.map((entry: any, idx: number) => (
              <li key={idx}>{entry.title}: {entry.name} {entry.phone && (<span className="text-xs text-gray-500 ml-2">{entry.phone}</span>)}</li>
            ))}
          </ul>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">Missionaries</h2>
            {/* Placeholder for edit button */}
            <button className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300" style={{display:'none'}}>Edit</button>
          </div>
          <ul className="text-sm">
            {data.missionaries?.map((m: any, idx: number) => (
              <li key={idx}>{m.name} {m.phone && (<span className="text-xs text-gray-500 ml-2">{m.phone}</span>)} {m.email && (<span className="text-xs text-gray-500 ml-2">{m.email}</span>)}</li>
            ))}
          </ul>
          <div className="text-xs text-gray-500 mt-8">For questions, contact the Bishopric or Executive Secretary.</div>
        </div>
        {/* Front Cover (right) */}
        <div className="w-1/2 p-8 flex flex-col items-center justify-center text-center">
          <div className="flex justify-between items-center w-full mb-2">
            <div></div>
            {/* Placeholder for edit button */}
            <button className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300" style={{display:'none'}}>Edit</button>
          </div>
          <h1 className="text-3xl font-bold mb-2">{data.wardName || 'Ward Name'}</h1>
          <div className="text-lg mb-2">{data.date}</div>
          <div className="text-base mb-2">The Church of Jesus Christ of Latter-day Saints</div>
          <div className="text-base mb-4">{data.meetingType === 'sacrament' ? 'Sacrament Meeting' : data.meetingType}</div>
          <div className="mb-4">
            <img src="/logo.svg" alt="Ward" className="mx-auto h-32 w-auto object-contain" />
          </div>
          {data.theme && <div className="italic text-gray-700 mt-2">"{data.theme}"</div>}
        </div>
      </div>
      {/* Page 2: Inside (landscape) */}
      <div ref={refs?.page2} className="print-page landscape flex w-full h-[8.5in] min-h-[8.5in]">
        {/* Announcements (left) */}
        <div className="w-1/2 p-8 border-r border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Announcements & Events</h2>
            {/* Placeholder for edit button */}
            <button className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300" style={{display:'none'}}>Edit</button>
          </div>
          <ul className="space-y-4">
            {data.announcements?.map((a: any, idx: number) => (
              <li key={idx}>
                <div className="font-semibold">{a.title}</div>
                <div className="text-sm" dangerouslySetInnerHTML={{ __html: a.content }} />
              </li>
            ))}
          </ul>
        </div>
        {/* Program (right) */}
        <div className="w-1/2 flex justify-center items-start p-8">
          <div className="w-full">
            <div className="text-center text-3xl font-bold mb-1">{data.wardName || 'Ward Name'}</div>
            <div className="text-center text-2xl font-bold mb-1">{data.meetingType === 'sacrament' ? 'Sacrament Meeting' : 'Program'}</div>
            <div className="text-center italic text-lg mb-6">{data.date}</div>
            <table className="w-full text-[1.05rem] font-serif" style={{ borderCollapse: 'separate', borderSpacing: '0 0.5em' }}>
            <tbody>
                <ProgramTableRow label="Presiding" value={data.leadership?.presiding} />
                <ProgramTableRow label="Conducting" value={data.leadership?.conducting} />
                <ProgramTableRow label="Chorister" value={data.leadership?.chorister} />
                <ProgramTableRow label="Organist" value={data.leadership?.organist} />
                {/* Opening Hymn */}
                <ProgramTableRow
                  label="Opening Hymn"
                  value={
                    data.musicProgram?.openingHymnNumber
                      ? `${data.musicProgram.openingHymnNumber} ${data.musicProgram.openingHymnTitle ? '' : ''}`
                      : ''
                  }
                  extra={data.musicProgram?.openingHymnTitle}
                />
                <ProgramTableRow label="Invocation" value={data.prayers?.opening} />
                {/* Sacrament Hymn */}
                <ProgramTableRow
                  label="Sacrament Hymn"
                  value={
                    data.musicProgram?.sacramentHymnNumber
                      ? `${data.musicProgram.sacramentHymnNumber} ${data.musicProgram.sacramentHymnTitle ? '' : ''}`
                      : ''
                  }
                  extra={data.musicProgram?.sacramentHymnTitle}
                />
                {/* Section Header */}
                <tr>
                  <td colSpan={3} className="text-center font-bold text-lg py-2">Administration of the Sacrament</td>
                </tr>
                {/* Agenda Items */}
                {data.agenda?.map((item: any, idx: number) => (
                  item.type === 'speaker' ? (
                    <ProgramTableRow key={idx} label={item.speakerType === 'youth' ? 'Youth Speaker' : 'Speaker'} value={item.name} />
                  ) : item.type === 'musical' ? (
                    <ProgramTableRow
                      key={idx}
                      label={item.label || 'Musical Number'}
                      value={item.hymnNumber || item.songName}
                      extra={item.hymnTitle}
                    />
                  ) : null
                ))}
                <ProgramTableRow
                  label="Closing Hymn"
                  value={
                    data.musicProgram?.closingHymnNumber
                      ? `${data.musicProgram.closingHymnNumber} ${data.musicProgram.closingHymnTitle ? '' : ''}`
                      : ''
                  }
                  extra={data.musicProgram?.closingHymnTitle}
                />
                <ProgramTableRow label="Benediction" value={data.prayers?.closing} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulletinPrintLayout;

// Helper for program table rows with dotted line and optional italic extra
function ProgramTableRow({ label, value, extra }: { label: string, value?: string, extra?: string }) {
  return (
    <>
      <tr>
        <td colSpan={3} className="py-0">
          <div className="flex items-center w-full">
            <span className="w-40 text-left mr-2 whitespace-nowrap">{label}</span>
            <span className="flex-grow border-b border-dotted border-gray-400 mx-2" style={{ height: 0 }}></span>
            <span className="w-40 text-right ml-2 whitespace-nowrap text-[0.97rem]">{value}</span>
          </div>
        </td>
      </tr>
      {extra && (
        <tr>
          <td colSpan={3} className="pt-0 text-center italic text-black text-base">{extra}</td>
        </tr>
      )}
    </>
  );
} 