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

function ProgramItem({ label, value }: { label: string; value?: string }) {
  return (
    <li className="flex justify-between border-b border-dotted border-gray-400 pb-1">
      <span className="font-semibold">{label}</span>
      {value && <span className="italic text-right">{value}</span>}
    </li>
  );
}