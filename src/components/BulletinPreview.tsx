import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BulletinData } from "../types/bulletin";

import { sanitizeHtml } from '../lib/sanitizeHtml';
import { getSongUrl, getSongTitle } from '../lib/songService';

interface BulletinPreviewProps {
  data: BulletinData;
  hideTabs?: boolean;
}

// Add audience label map and order at the top of the file
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
const audienceOrder = [
  'ward',
  'relief_society',
  'elders_quorum',
  'young_women',
  'young_men',
  'youth',
  'primary',
  'stake',
  'other',
];

export default function BulletinPreview({ data, hideTabs = false }: BulletinPreviewProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'program' | 'announcements' | 'wardinfo'>('program');

  const formatDate = (dateString: string) => {
    // Fix timezone issue by creating date in local timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const DottedLine = ({ children, rightAlign }: { children: React.ReactNode; rightAlign?: string }) => (
    <div className="flex items-center justify-between py-1">
      <span className="flex-1 flex items-center">
        {children}
        <span className="flex-1 mx-2 border-b border-dotted border-gray-400"></span>
      </span>
      {rightAlign && <span className="text-right font-medium">{rightAlign}</span>}
    </div>
  );

  return (
    <div className="bulletin bg-white shadow-lg rounded-lg overflow-hidden max-w-2xl mx-auto font-sans">
      {/* Tab Navigation (hidden in print and if hideTabs) */}
      {!hideTabs && (
        <nav className="flex justify-center print:hidden mb-4 mt-4" aria-label="Main tabs">
          <ul className="flex flex-col gap-3 sm:flex-row sm:gap-3 w-full max-w-xs sm:max-w-none mx-auto justify-center items-center">
            {['program', 'announcements'].map(tab => (
              <li key={tab} role="presentation" className="w-full sm:w-auto">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls={`tab-panel-${tab}`}
                  className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full font-semibold focus:outline-none border-2 transition-all duration-200 text-base
                    ${activeTab === tab
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900'}
                  `}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                >
                  {tab === 'program' ? t('program') : t('announcements')}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {/* Main Content */}
      {activeTab === 'program' && (
        <div className="p-6 space-y-4 text-sm leading-relaxed">
          {/* Header */}
          <div className="bg-gray-100 border-b-2 border-gray-300 text-center relative overflow-hidden">
            <div className="relative z-10 p-6">
              {/* Ward Name */}
              {data.wardName && (
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  {data.wardName}
                </h1>
              )}
              
              {/* Meeting Type */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('sacrament_meeting')}
              </h2>
              
              {/* Date */}
              <p className="text-lg text-gray-700 italic">
                {data.date ? formatDate(data.date) : 'Date'}
              </p>
            </div>
          </div>

          {/* Leadership */}
          <div className="space-y-1">
            <DottedLine rightAlign={data.leadership.presiding}>
              <span>Presiding</span>
            </DottedLine>
            {data.leadership.conducting && (
              <DottedLine rightAlign={data.leadership.conducting}>
                <span>Conducting</span>
              </DottedLine>
            )}
            <DottedLine rightAlign={data.leadership.chorister}>
              <span>Chorister</span>
            </DottedLine>
            <DottedLine rightAlign={data.leadership.organist}>
              <span>{data.leadership.organistLabel || 'Organist'}</span>
            </DottedLine>
            {data.leadership.preludeMusic && (
              <DottedLine rightAlign={data.leadership.preludeMusic}>
                <span>Prelude Music</span>
              </DottedLine>
            )}
          </div>

          {/* Theme */}
          {data.theme && (
            <div className="text-center py-2">
              <p className="italic text-gray-700">{data.theme}</p>
            </div>
          )}

          {/* Opening Hymn */}
          {(data.musicProgram.openingHymnNumber || data.musicProgram.openingHymnTitle) && (
            <div className="space-y-1">
              <DottedLine rightAlign={data.musicProgram.openingHymnNumber}>
                <span>{t('opening_hymn')}</span>
              </DottedLine>
              {(data.musicProgram.openingHymnNumber || data.musicProgram.openingHymnTitle) && (
                <div className="text-center py-1">
                  <p className="italic">
                    <a
                      href={getSongUrl(data.musicProgram.openingHymnNumber, data.musicProgram.openingHymnType || 'hymn')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 underline hover:text-blue-900"
                    >
                      {data.musicProgram.openingHymnTitle || getSongTitle(data.musicProgram.openingHymnNumber, data.musicProgram.openingHymnType || 'hymn')}
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Opening Prayer */}
          {data.prayers.opening && (
            <DottedLine rightAlign={data.prayers.opening}>
              <span>{t('invocation')}</span>
            </DottedLine>
          )}

          {/* Sacrament hymn will be inserted with the sacrament agenda item */}



          {data.agenda.map((item) => (
            item.type === 'speaker' ? (
              <DottedLine key={item.id} rightAlign={item.name}>
                <span>{item.speakerType === 'youth' ? 'Youth Speaker' : 'Speaker'}</span>
              </DottedLine>
            ) : item.type === 'musical' ? (
              <div key={item.id} className="space-y-1">
                <DottedLine rightAlign={item.hymnNumber || item.songName}>
                  <span>{item.label || 'Musical Number'}</span>
                </DottedLine>
                {(item.hymnNumber || item.hymnTitle) && (
                  <div className="text-center py-1">
                    <p className="italic">
                      {item.hymnNumber ? (
                        <a href={getSongUrl(item.hymnNumber, item.hymnType || 'hymn')} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900">
                          {item.hymnTitle || getSongTitle(item.hymnNumber, item.hymnType || 'hymn')}
                        </a>
                      ) : item.songName}
                    </p>
                  </div>
                )}
                {item.performers && (
                  <div className="text-center py-1">
                    <p className="text-sm">{item.performers}</p>
                  </div>
                )}
              </div>
            ) : item.type === 'testimony' ? (
              <div key={item.id} className="text-center py-3">
                <h2 className="text-lg font-bold text-gray-900 font-sans">Bearing of Testimonies</h2>
                {item.note && <p className="italic text-sm mt-1">{item.note}</p>}
              </div>
            ) : item.type === 'sacrament' ? (
              <React.Fragment key={item.id}>
                {(data.musicProgram.sacramentHymnNumber || data.musicProgram.sacramentHymnTitle) && (
                  <div className="space-y-1">
                    <DottedLine rightAlign={data.musicProgram.sacramentHymnNumber}>
                      <span>{t('sacrament_hymn')}</span>
                    </DottedLine>
                    <div className="text-center py-1">
                      <p className="italic">
                        <a
                          href={getSongUrl(data.musicProgram.sacramentHymnNumber, data.musicProgram.sacramentHymnType || 'hymn')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline hover:text-blue-900"
                        >
                          {data.musicProgram.sacramentHymnTitle || getSongTitle(data.musicProgram.sacramentHymnNumber, data.musicProgram.sacramentHymnType || 'hymn')}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
                <div className="text-center py-3">
                  <h2 className="text-lg font-bold text-gray-900 font-sans">{t('administration_sacrament')}</h2>
                </div>
              </React.Fragment>
            ) : null
         ))}

          {/* Closing Hymn */}
          {(data.musicProgram.closingHymnNumber || data.musicProgram.closingHymnTitle) && (
            <div className="space-y-1">
              <DottedLine rightAlign={data.musicProgram.closingHymnNumber}>
                <span>{t('closing_hymn')}</span>
              </DottedLine>
              {(data.musicProgram.closingHymnNumber || data.musicProgram.closingHymnTitle) && (
                <div className="text-center py-1">
                  <p className="italic">
                    <a
                      href={getSongUrl(data.musicProgram.closingHymnNumber, data.musicProgram.closingHymnType || 'hymn')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 underline hover:text-blue-900"
                    >
                      {data.musicProgram.closingHymnTitle || getSongTitle(data.musicProgram.closingHymnNumber, data.musicProgram.closingHymnType || 'hymn')}
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Closing Prayer */}
          {data.prayers.closing && (
            <DottedLine rightAlign={data.prayers.closing}>
              <span>{t('benediction')}</span>
            </DottedLine>
          )}
        </div>
      )}
      {activeTab === 'announcements' && (
        <div className="p-6 space-y-4 text-sm leading-relaxed">
          {/* Announcements */}
          {data.announcements.length > 0 ? (
            <div className="space-y-4">
              {data.announcements.map((announcement) => (
                <div key={announcement.id} className="text-sm mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{audienceLabels[(announcement.audience || 'ward') as keyof typeof audienceLabels]}</h3>
                  <div className="flex items-center mb-1">
                    <h4 className="text-base font-semibold mr-2 text-gray-900">{announcement.title}</h4>
                  </div>
                  <div className="announcement-content text-gray-900" dangerouslySetInnerHTML={{ __html: sanitizeHtml(announcement.content) }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400">No announcements</div>
          )}
          
          {/* Submissions Notice */}
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-900 mb-1">📢 Have an announcement?</h4>
                <p className="text-sm text-green-800 mb-2">
                  Submit your announcement to be included in the next bulletin!
                </p>
                <a
                  href={`/submit/${window.location.pathname.split('/').pop()}`}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  📝 Submit Announcement
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* {activeTab === 'wardinfo' && (
        <div className="p-6 space-y-4 text-sm leading-relaxed">
          <h3 className="text-base font-bold mb-3 text-center">Ward Leadership</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 border">Title</th>
                  <th className="px-3 py-2 border">Name</th>
                  <th className="px-3 py-2 border">Phone</th>
                </tr>
              </thead>
              <tbody>
                {data.wardLeadership.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="border px-3 py-2">{entry.title}</td>
                    <td className="border px-3 py-2">{entry.name}</td>
                    <td className="border px-3 py-2">{entry.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="text-base font-bold mb-3 text-center mt-8">Missionaries</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 border">Name</th>
                  <th className="px-3 py-2 border">Phone</th>
                  <th className="px-3 py-2 border">Email</th>
                </tr>
              </thead>
              <tbody>
                {data.missionaries.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="border px-3 py-2">{entry.name}</td>
                    <td className="border px-3 py-2">{entry.phone}</td>
                    <td className="border px-3 py-2">{entry.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )} */}
      {/* Print: Always show both sections, hide tabs */}
      <div className="hidden print:block p-6 space-y-4 text-sm leading-relaxed">
        {/* Header */}
        <div className="bg-gray-100 border-b-2 border-gray-300 text-center relative overflow-hidden">
          <div className="relative z-10 p-6">
            {/* Ward Name */}
            {data.wardName && (
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                {data.wardName}
              </h1>
            )}
            
            {/* Meeting Type */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('sacrament_meeting')}
            </h2>
            
            {/* Date */}
            <p className="text-lg text-gray-700 italic">
              {data.date ? formatDate(data.date) : 'Date'}
            </p>
          </div>
        </div>

        {/* Leadership */}
        <div className="space-y-1">
          <DottedLine rightAlign={data.leadership.presiding}>
            <span>{t('presiding')}</span>
          </DottedLine>
          {data.leadership.conducting && (
            <DottedLine rightAlign={data.leadership.conducting}>
              <span>{t('conducting')}</span>
            </DottedLine>
          )}
          <DottedLine rightAlign={data.leadership.chorister}>
            <span>{t('chorister')}</span>
          </DottedLine>
          <DottedLine rightAlign={data.leadership.organist}>
            <span>{data.leadership.organistLabel || t('organist')}</span>
          </DottedLine>
          {data.leadership.preludeMusic && (
            <DottedLine rightAlign={data.leadership.preludeMusic}>
              <span>{t('prelude_music')}</span>
            </DottedLine>
          )}
        </div>

        {/* Theme */}
        {data.theme && (
          <div className="text-center py-2">
            <p className="italic text-gray-700">{data.theme}</p>
          </div>
        )}

        {/* Opening Hymn */}
        {(data.musicProgram.openingHymnNumber || data.musicProgram.openingHymnTitle) && (
          <div className="space-y-1">
            <DottedLine rightAlign={data.musicProgram.openingHymnNumber}>
              <span>{t('opening_hymn')}</span>
            </DottedLine>
            {(data.musicProgram.openingHymnNumber || data.musicProgram.openingHymnTitle) && (
              <div className="text-center py-1">
                <p className="italic">
                  <a
                    href={getSongUrl(data.musicProgram.openingHymnNumber, data.musicProgram.openingHymnType || 'hymn')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    {data.musicProgram.openingHymnTitle || getSongTitle(data.musicProgram.openingHymnNumber, data.musicProgram.openingHymnType || 'hymn')}
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Opening Prayer */}
        {data.prayers.opening && (
          <DottedLine rightAlign={data.prayers.opening}>
            <span>Invocation</span>
          </DottedLine>
        )}

        {/* Sacrament Hymn */}
        {(data.musicProgram.sacramentHymnNumber || data.musicProgram.sacramentHymnTitle) && (
          <div className="space-y-1">
            <DottedLine rightAlign={data.musicProgram.sacramentHymnNumber}>
              <span>{t('sacrament_hymn')}</span>
            </DottedLine>
            {(data.musicProgram.sacramentHymnNumber || data.musicProgram.sacramentHymnTitle) && (
              <div className="text-center py-1">
                <p className="italic">
                  <a
                    href={getSongUrl(data.musicProgram.sacramentHymnNumber, data.musicProgram.sacramentHymnType || 'hymn')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    {data.musicProgram.sacramentHymnTitle || getSongTitle(data.musicProgram.sacramentHymnNumber, data.musicProgram.sacramentHymnType || 'hymn')}
                  </a>
                </p>
              </div>
            )}
          </div>
        )}



        {data.agenda.map((item) => (
          item.type === 'speaker' ? (
            <DottedLine key={item.id} rightAlign={item.name}>
              <span>{item.speakerType === 'youth' ? 'Youth Speaker' : 'Speaker'}</span>
            </DottedLine>
          ) : item.type === 'musical' ? (
            <div key={item.id} className="space-y-1">
              <DottedLine rightAlign={item.hymnNumber || item.songName}>
                <span>{item.label || 'Musical Number'}</span>
              </DottedLine>
              {(item.hymnNumber || item.hymnTitle) && (
                <div className="text-center py-1">
                  <p className="italic">
                    {item.hymnNumber ? (
                      <a href={getSongUrl(item.hymnNumber, item.hymnType || 'hymn')} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900">
                        {item.hymnTitle || getSongTitle(item.hymnNumber, item.hymnType || 'hymn')}
                      </a>
                    ) : item.songName}
                  </p>
                </div>
              )}
              {item.performers && (
                <div className="text-center py-1">
                  <p className="text-sm">{item.performers}</p>
                </div>
              )}
            </div>
          ) : item.type === 'testimony' ? (
            <div key={item.id} className="text-center py-3">
              <h2 className="text-lg font-bold text-gray-900 font-sans">Bearing of Testimonies</h2>
              {item.note && <p className="italic text-sm mt-1">{item.note}</p>}
            </div>
          ) : item.type === 'sacrament' ? (
            <React.Fragment key={item.id}>
              {(data.musicProgram.sacramentHymnNumber || data.musicProgram.sacramentHymnTitle) && (
                <div className="space-y-1">
                  <DottedLine rightAlign={data.musicProgram.sacramentHymnNumber}>
                    <span>Sacrament Hymn</span>
                  </DottedLine>
                  <div className="text-center py-1">
                    <p className="italic">
                      <a
                        href={getSongUrl(data.musicProgram.sacramentHymnNumber, data.musicProgram.sacramentHymnType || 'hymn')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 underline hover:text-blue-900"
                      >
                        {data.musicProgram.sacramentHymnTitle || getSongTitle(data.musicProgram.sacramentHymnNumber, data.musicProgram.sacramentHymnType || 'hymn')}
                      </a>
                    </p>
                  </div>
                </div>
              )}
              <div className="text-center py-3">
                <h2 className="text-lg font-bold text-gray-900 font-sans">{t('administration_sacrament')}</h2>
              </div>
            </React.Fragment>
          ) : null
        ))}

        {/* Closing Hymn */}
        {(data.musicProgram.closingHymnNumber || data.musicProgram.closingHymnTitle) && (
          <div className="space-y-1">
            <DottedLine rightAlign={data.musicProgram.closingHymnNumber}>
              <span>{t('closing_hymn')}</span>
            </DottedLine>
            {(data.musicProgram.closingHymnNumber || data.musicProgram.closingHymnTitle) && (
              <div className="text-center py-1">
                <p className="italic">
                  <a
                    href={getSongUrl(data.musicProgram.closingHymnNumber, data.musicProgram.closingHymnType || 'hymn')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    {data.musicProgram.closingHymnTitle || getSongTitle(data.musicProgram.closingHymnNumber, data.musicProgram.closingHymnType || 'hymn')}
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Closing Prayer */}
        {data.prayers.closing && (
          <DottedLine rightAlign={data.prayers.closing}>
            <span>{t('benediction')}</span>
          </DottedLine>
        )}

        {/* Announcements */}
        {data.announcements.length > 0 ? (
          <div className="space-y-4">
            {data.announcements.map((announcement) => (
              <div key={announcement.id} className="text-sm">
                <div className="mb-1">
                                      <span className="font-bold text-gray-900 text-sm mr-2">{audienceLabels[(announcement.audience || 'ward') as keyof typeof audienceLabels]}</span>
                </div>
                <div className="flex items-center mb-1">
                  <h4 className="font-semibold mr-2 text-gray-900">{announcement.title}</h4>
                  {/* Removed category badge */}
                </div>
                <div className="text-gray-900" dangerouslySetInnerHTML={{ __html: sanitizeHtml(announcement.content) }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">No announcements</div>
        )}

        {/* Meetings */}
        {data.meetings.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-300">
            <h3 className="text-base font-bold mb-3 text-center">Meetings This Week</h3>
            <div className="space-y-3">
              {data.meetings.map((meeting) => (
                <div key={meeting.id} className="text-sm bg-gray-50 p-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <h4 className="font-semibold">{meeting.title}</h4>
                    <p className="text-gray-700">{meeting.description}</p>
                  </div>
                  <div className="flex flex-col sm:items-end mt-2 sm:mt-0">
                    <span className="text-gray-600">{meeting.location}</span>
                    <span className="text-gray-600">{meeting.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Events */}
        {data.specialEvents.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-300">
            <h3 className="text-base font-bold mb-3 text-center">Special Events</h3>
            <div className="space-y-3">
              {data.specialEvents.map((event) => (
                <div key={event.id} className="text-sm bg-gray-50 p-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-gray-700">{event.description}</p>
                  </div>
                  <div className="flex flex-col sm:items-end mt-2 sm:mt-0">
                    <span className="text-gray-600">{new Date(event.date).toLocaleDateString()} - {event.time}</span>
                    <span className="text-gray-600">{event.location}</span>
                    {event.contact && <span className="text-gray-600">Contact: {event.contact}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-100 text-center border-t border-gray-300 p-3">
        <p className="text-sm text-gray-500">
          {data.wardName}
        </p>
      </div>
    </div>
  );
}