// Hostnames are matched against the registrable suffix, so subdomains like
// us04web.zoom.us or ward.webex.com resolve to their platform.
const PLATFORMS: Array<{ name: string; hosts: string[] }> = [
  { name: 'Zoom', hosts: ['zoom.us', 'zoom.com', 'zoomgov.com'] },
  { name: 'Google Meet', hosts: ['meet.google.com'] },
  { name: 'Microsoft Teams', hosts: ['teams.microsoft.com', 'teams.live.com'] },
  { name: 'Webex', hosts: ['webex.com'] },
  { name: 'GoToMeeting', hosts: ['gotomeeting.com', 'gotomeet.me'] },
  { name: 'Jitsi', hosts: ['jit.si'] },
  { name: 'Whereby', hosts: ['whereby.com'] },
  { name: 'FaceTime', hosts: ['facetime.apple.com'] },
  { name: 'Skype', hosts: ['skype.com'] },
  { name: 'Discord', hosts: ['discord.com', 'discord.gg'] },
];

export function normalizeMeetingUrl(link: string): string {
  const trimmed = link.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Brand name of the meeting service the link points at, or null if unrecognized. */
export function detectMeetingPlatform(link: string): string | null {
  let hostname: string;
  try {
    hostname = new URL(normalizeMeetingUrl(link)).hostname.toLowerCase();
  } catch {
    return null;
  }
  for (const { name, hosts } of PLATFORMS) {
    if (hosts.some((h) => hostname === h || hostname.endsWith(`.${h}`))) {
      return name;
    }
  }
  return null;
}
