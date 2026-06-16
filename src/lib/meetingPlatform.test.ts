import { describe, it, expect } from 'vitest';
import { detectMeetingPlatform, normalizeMeetingUrl } from './meetingPlatform';

describe('normalizeMeetingUrl', () => {
  it('prepends https:// when the scheme is missing', () => {
    expect(normalizeMeetingUrl('zoom.us/j/123')).toBe('https://zoom.us/j/123');
  });

  it('leaves existing schemes alone', () => {
    expect(normalizeMeetingUrl('http://zoom.us/j/123')).toBe('http://zoom.us/j/123');
    expect(normalizeMeetingUrl('  https://meet.google.com/abc  ')).toBe('https://meet.google.com/abc');
  });
});

describe('detectMeetingPlatform', () => {
  it.each([
    ['https://zoom.us/j/123456789', 'Zoom'],
    ['https://us04web.zoom.us/j/123', 'Zoom'],
    ['zoom.us/j/987654', 'Zoom'],
    ['https://meet.google.com/abc-defg-hij', 'Google Meet'],
    ['https://teams.microsoft.com/l/meetup-join/xyz', 'Microsoft Teams'],
    ['https://teams.live.com/meet/123', 'Microsoft Teams'],
    ['https://ward.webex.com/meet/bishop', 'Webex'],
    ['https://www.gotomeeting.com/join/123', 'GoToMeeting'],
    ['https://meet.jit.si/WardCouncil', 'Jitsi'],
    ['https://whereby.com/ward-room', 'Whereby'],
    ['https://facetime.apple.com/join#v=1', 'FaceTime'],
    ['https://join.skype.com/abc', 'Skype'],
    ['https://discord.gg/abc123', 'Discord'],
  ])('%s -> %s', (link, platform) => {
    expect(detectMeetingPlatform(link)).toBe(platform);
  });

  it('returns null for unrecognized services', () => {
    expect(detectMeetingPlatform('https://example.com/meeting')).toBeNull();
    expect(detectMeetingPlatform('https://mycustomserver.org/room/1')).toBeNull();
  });

  it('does not match lookalike domains', () => {
    expect(detectMeetingPlatform('https://notzoom.us/j/1')).toBeNull();
    expect(detectMeetingPlatform('https://zoom.us.evil.com/j/1')).toBeNull();
  });

  it('returns null for garbage input', () => {
    expect(detectMeetingPlatform('not a url at all %%%')).toBeNull();
  });
});
