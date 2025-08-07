import React, { useState, useRef, useEffect } from 'react';
import { BulletinData } from "../types/bulletin";
import { sanitizeHtml } from '../lib/sanitizeHtml';
import { decodeHtml } from '../lib/decodeHtml';
import { getSongUrl, getSongTitle } from '../lib/songService';
import { LDS_IMAGES, getImageById } from '../data/images';

interface BulletinPreviewProps {
  data: BulletinData;
  hideTabs?: boolean;
  hideImageControls?: boolean;
  onImagePositionChange?: (pos: { x: number; y: number }) => void;
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

// Helper function to check if any ward info is populated
const hasWardInfo = (data: BulletinData): boolean => {
  if (!data) return false;
  
  // Check if any ward leadership entries have data
  const hasWardLeadership = data.wardLeadership && Array.isArray(data.wardLeadership) && data.wardLeadership.length > 0 && 
    data.wardLeadership.some(entry => entry && (entry.title || entry.name || entry.phone));
  
  // Check if any missionaries have data
  const hasMissionaries = data.missionaries && Array.isArray(data.missionaries) && data.missionaries.length > 0 && 
    data.missionaries.some(entry => entry && (entry.name || entry.phone));
  
  // Check if any ward missionaries have data
  const hasWardMissionaries = data.wardMissionaries && Array.isArray(data.wardMissionaries) && data.wardMissionaries.length > 0 && 
    data.wardMissionaries.some(entry => entry && (entry.name || entry.mission || entry.missionAddress || entry.email));
  
  return hasWardLeadership || hasMissionaries || hasWardMissionaries;
};

// Helper function to generate QR code for the current URL
const generateQRCode = (): string => {
  const currentUrl = window.location.href;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;
};

// Preset image positions for better UX
const imagePositions = {
  top: { x: 50, y: 25 },
  center: { x: 50, y: 50 },
  bottom: { x: 50, y: 75 }
};

export default function BulletinPreview({ data, hideTabs = false, hideImageControls = false, onImagePositionChange }: BulletinPreviewProps) {
  const [activeTab, setActiveTab] = useState<'program' | 'announcements' | 'wardinfo'>('program');
  const [imagePosition, setImagePosition] = useState(data.imagePosition || imagePositions.center);
  const [showImageControls, setShowImageControls] = useState(false);

  const handleImagePositionChange = (pos: { x: number; y: number }) => {
    setImagePosition(pos);
    onImagePositionChange?.(pos);
  };

  useEffect(() => {
    setImagePosition(data.imagePosition || imagePositions.center);
  }, [data.imagePosition]);

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
            {['program', 'announcements', 'wardinfo'].map(tab => (
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
                  {tab === 'program' ? 'Program' : tab === 'announcements' ? 'Announcements' : 'Ward Info'}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Main Content */}
      <div className="bg-white">
        {/* Program Tab */}
        {activeTab === 'program' && (
          <div className="p-6 space-y-4 text-sm leading-relaxed">
            {/* Header */}
            <div className="bg-gray-100 border-b-2 border-gray-300 text-center relative overflow-hidden min-h-56">
              {/* Image Background */}
              {data.imageId && data.imageId !== 'none' && (
                <div className="absolute inset-0 z-0">
                  {(() => {
                    const selectedImage = getImageById(data.imageId);
                    return selectedImage.url ? (
                      <img
                        src={selectedImage.url}
                        alt={selectedImage.name}
                        className="w-full h-full object-cover opacity-15 transition-all duration-300"
                        style={{
                          objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                        }}
                      />
                    ) : null;
                  })()}
                </div>
              )}
              
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-100/30 z-5"></div>
              
              <div className="relative z-10 p-12">
                {/* Ward Name */}
                {data.wardName && (
                  <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-wide">
                    {data.wardName}
                  </h1>
                )}
                
                {/* Meeting Type */}
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                  Sacrament Meeting
                </h2>
                
                {/* Date */}
                <p className="text-lg text-gray-600 italic font-medium">
                  {data.date ? formatDate(data.date) : 'Date'}
                </p>
                
                {/* Image Controls - only show when image is selected and not on public view */}
                {data.imageId && data.imageId !== 'none' && !hideImageControls && (
                  <div className="absolute top-2 right-2 z-20">
                    <button
                      onClick={() => setShowImageControls(!showImageControls)}
                      className="bg-white/90 hover:bg-white text-gray-700 px-2 py-1 rounded text-xs font-medium shadow-sm transition-all border"
                    >
                      {showImageControls ? '✕' : '⚙️'}
                    </button>
                    
                    {showImageControls && (
                      <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border p-3 min-w-32">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Position</label>
                            <div className="flex flex-col space-y-1">
                              {Object.entries(imagePositions).map(([key, pos]) => (
                                <button
                                  key={key}
                                  onClick={() => handleImagePositionChange(pos)}
                                  className={`px-3 py-2 text-xs rounded ${
                                    imagePosition.x === pos.x && imagePosition.y === pos.y
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                  }`}
                                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                                >
                                  {key === 'center' ? '● Center' : 
                                   key === 'top' ? '↑ Top' : 
                                   key === 'bottom' ? '↓ Bottom' : key.charAt(0).toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                  <span>Opening Hymn</span>
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
                  <span>Sacrament Hymn</span>
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

            {/* Agenda */}
            {data.agenda && data.agenda.length > 0 && (
              <div className="space-y-1">
                <div className="text-center py-2">
                  <h3 className="font-bold text-gray-900">Program</h3>
                </div>
                {data.agenda.map((item, index) => (
                  <div key={index} className="space-y-1">
                    {item.type === 'speaker' && (
                      <DottedLine rightAlign={item.name}>
                        <span>{item.speakerType === 'youth' ? 'Youth Speaker' : 'Speaker'}</span>
                      </DottedLine>
                    )}
                    {item.type === 'musical' && (
                      <DottedLine rightAlign={item.performers}>
                        <span>{item.label || 'Musical Number'}</span>
                      </DottedLine>
                    )}
                    {item.type === 'testimony' && (
                      <DottedLine rightAlign={item.note}>
                        <span>Testimony Meeting</span>
                      </DottedLine>
                    )}
                    {item.type === 'sacrament' && (
                      <DottedLine rightAlign="">
                        <span>Administration of the Sacrament</span>
                      </DottedLine>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Closing Hymn */}
            {(data.musicProgram.closingHymnNumber || data.musicProgram.closingHymnTitle) && (
              <div className="space-y-1">
                <DottedLine rightAlign={data.musicProgram.closingHymnNumber}>
                  <span>Closing Hymn</span>
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
                <span>Benediction</span>
              </DottedLine>
            )}

            {/* Bishopric Message */}
            {data.bishopricMessage && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-2">Bishopric Message</h3>
                <p className="text-blue-800 italic">{data.bishopricMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
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
                  Announcements
                </h2>
                
                {/* Date */}
                <p className="text-lg text-gray-700 italic">
                  {data.date ? formatDate(data.date) : 'Date'}
                </p>
              </div>
            </div>

            {/* Announcements */}
            {data.announcements && data.announcements.length > 0 ? (
              <div className="space-y-4">
                {data.announcements.map((announcement, index) => {
                  const decodedContent = sanitizeHtml(decodeHtml(announcement.content));
                  return (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="mb-1">
                        <span className="font-bold text-gray-900 text-sm mr-2">
                          {audienceLabels[(announcement.audience || 'ward') as keyof typeof audienceLabels]}
                        </span>
                        {announcement.category && announcement.category.toLowerCase() !== 'general' && (
                          <span className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded">
                            {announcement.category}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">{announcement.title}</h3>
                      <div className="text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: decodedContent }} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No announcements for this week.</p>
              </div>
            )}

            {/* Meetings */}
            {data.meetings && data.meetings.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-gray-900 mb-3">Meetings & Activities</h3>
                <div className="space-y-3">
                  {data.meetings.map((meeting, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                      <p className="text-gray-700">{meeting.time} • {meeting.location}</p>
                      {meeting.description && (
                        <p className="text-gray-600 text-sm mt-1">{meeting.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Events */}
            {data.specialEvents && data.specialEvents.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-gray-900 mb-3">Special Events</h3>
                <div className="space-y-3">
                  {data.specialEvents.map((event, index) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <p className="text-gray-700">{event.date} • {event.time} • {event.location}</p>
                      <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                      {event.contact && (
                        <p className="text-gray-600 text-sm mt-1">Contact: {event.contact}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submission Link */}
            {!hideTabs && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
                <p className="text-green-800 mb-2">Have an announcement to share?</p>
                <a
                  href={`/submit/${window.location.pathname.split('/').pop()}`}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  📝 Submit Announcement
                </a>
              </div>
            )}
          </div>
        )}

        {/* Ward Info Tab */}
        {activeTab === 'wardinfo' && (
          <div className="p-6 space-y-4 text-sm leading-relaxed">
            {hasWardInfo(data) ? (
              <>
                <h3 className="text-base font-bold mb-3 text-center">Ward Leadership</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 border">Title</th>
                        <th className="px-3 py-2 border text-center">Name</th>
                        <th className="px-3 py-2 border">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.wardLeadership || []).map((entry, idx) => (
                        <tr key={idx}>
                          <td className="border px-3 py-2">{entry.title}</td>
                          <td className="border px-3 py-2 text-center">{entry.name}</td>
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
                        <th className="px-3 py-2 border text-center">Name</th>
                        <th className="px-3 py-2 border">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.missionaries || []).map((entry, idx) => (
                        <tr key={idx}>
                          <td className="border px-3 py-2 text-center">{entry.name}</td>
                          <td className="border px-3 py-2">{entry.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <h3 className="text-base font-bold mb-3 text-center mt-8">Missionaries from our ward</h3>
                {(data.wardMissionaries || []).length > 2 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(data.wardMissionaries || []).map((entry, idx) => (
                      <div key={idx} className="border border-gray-300 rounded-lg p-3">
                        <div className="font-semibold text-sm mb-2">{entry.name}</div>
                        {entry.mission && (
                          <div className="text-xs text-gray-600 mb-1">
                            📍 {entry.mission}
                          </div>
                        )}
                        {entry.missionAddress && (
                          <div className="text-xs text-gray-600 mb-1">
                            📮 {entry.missionAddress}
                          </div>
                        )}
                        {entry.email && (
                          <div className="text-xs text-gray-600">
                            ✉️ {entry.email}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 border">Name</th>
                          <th className="px-3 py-2 border">Mission</th>
                          <th className="px-3 py-2 border">Mission Address</th>
                          <th className="px-3 py-2 border">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data.wardMissionaries || []).map((entry, idx) => (
                          <tr key={idx}>
                            <td className="border px-3 py-2">{entry.name}</td>
                            <td className="border px-3 py-2">{entry.mission}</td>
                            <td className="border px-3 py-2">{entry.missionAddress}</td>
                            <td className="border px-3 py-2">{entry.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4">
                  <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code</h3>
                <p className="text-gray-600 mb-4">Scan this QR code to access the digital bulletin</p>
                <div className="flex justify-center">
                  <img 
                    src={generateQRCode()} 
                    alt="QR Code for this bulletin" 
                    className="border-2 border-gray-200 rounded-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  No ward information available. Add ward leadership and missionary details in the editor to display them here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Print: Always show both sections, hide tabs */}
      <div className="hidden print:block p-6 space-y-4 text-sm leading-relaxed">
        {/* Header */}
        <div className="bg-gray-100 border-b-2 border-gray-300 text-center relative overflow-hidden min-h-56">
          {/* Image Background */}
          {data.imageId && data.imageId !== 'none' && (
            <div className="absolute inset-0 z-0">
              {(() => {
                const selectedImage = getImageById(data.imageId);
                return selectedImage.url ? (
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.name}
                    className="w-full h-full object-cover opacity-15 transition-all duration-300"
                    style={{
                      objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                    }}
                  />
                ) : null;
              })()}
            </div>
          )}
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-100/30 z-5"></div>
          
          <div className="relative z-10 p-12">
            {/* Ward Name */}
            {data.wardName && (
              <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-wide">
                {data.wardName}
              </h1>
            )}
            
            {/* Meeting Type */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Sacrament Meeting
            </h2>
            
            {/* Date */}
            <p className="text-lg text-gray-600 italic font-medium">
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
              <span>Opening Hymn</span>
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
              <span>Sacrament Hymn</span>
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

        {/* Agenda */}
        {data.agenda && data.agenda.length > 0 && (
          <div className="space-y-1">
            {data.agenda.map((item, index) => (
              <div key={index} className="space-y-1">
                {item.type === 'speaker' && (
                  <DottedLine rightAlign={item.name}>
                    <span>{item.speakerType === 'youth' ? 'Youth Speaker' : 'Speaker'}</span>
                  </DottedLine>
                )}
                {item.type === 'musical' && (
                  <DottedLine rightAlign={item.performers}>
                    <span>{item.label || 'Musical Number'}</span>
                  </DottedLine>
                )}
                {item.type === 'testimony' && (
                  <DottedLine rightAlign={item.note}>
                    <span>Testimony Meeting</span>
                  </DottedLine>
                )}
                {item.type === 'sacrament' && (
                  <DottedLine rightAlign="">
                    <span>Administration of the Sacrament</span>
                  </DottedLine>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Closing Hymn */}
        {(data.musicProgram.closingHymnNumber || data.musicProgram.closingHymnTitle) && (
          <div className="space-y-1">
            <DottedLine rightAlign={data.musicProgram.closingHymnNumber}>
              <span>Closing Hymn</span>
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
            <span>Benediction</span>
          </DottedLine>
        )}

        {/* Announcements */}
        {data.announcements && data.announcements.length > 0 ? (
          <div className="space-y-4">
            {data.announcements.map((announcement, index) => {
              const decodedContent = sanitizeHtml(decodeHtml(announcement.content));
              return (
                <div key={index} className="text-sm">
                  <div className="mb-1">
                    <span className="font-bold text-gray-900 text-sm mr-2">
                      {audienceLabels[(announcement.audience || 'ward') as keyof typeof audienceLabels]}
                    </span>
                    {announcement.category && announcement.category.toLowerCase() !== 'general' && (
                      <span className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded">
                        {announcement.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center mb-1">
                    <h4 className="font-semibold mr-2 text-gray-900">{announcement.title}</h4>
                  </div>
                  <div className="text-gray-900" dangerouslySetInnerHTML={{ __html: decodedContent }} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400">No announcements</div>
        )}

        {/* Meetings */}
        {data.meetings && data.meetings.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-300">
            <h3 className="text-base font-bold mb-3 text-center">Meetings This Week</h3>
            <div className="space-y-3">
              {data.meetings.map((meeting, index) => (
                <div key={index} className="text-sm bg-gray-50 p-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center">
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
        {data.specialEvents && data.specialEvents.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-300">
            <h3 className="text-base font-bold mb-3 text-center">Special Events</h3>
            <div className="space-y-3">
              {data.specialEvents.map((event, index) => (
                <div key={index} className="text-sm bg-gray-50 p-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center">
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