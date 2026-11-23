// Bulletins are for Sunday meetings: a clerk building the program mid-week
// wants the upcoming Sunday, not today's date.
export function upcomingSundayISO(from: Date = new Date()): string {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const daysUntilSunday = (7 - date.getDay()) % 7; // Sunday itself counts as 0
  date.setDate(date.getDate() + daysUntilSunday);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Date for a bulletin copied from an earlier one (a saved template). Copying
// last week's program should land on the following Sunday, not on the same
// upcoming Sunday as the original when the copy is made in the same week.
// An old template still starts at the upcoming Sunday, never in the past.
export function nextBulletinDateISO(sourceDate: string | undefined | null, now: Date = new Date()): string {
  const upcoming = upcomingSundayISO(now);
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(sourceDate || '');
  if (!match) return upcoming;
  const source = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(source.getTime())) return upcoming;
  source.setDate(source.getDate() + 1); // strictly after the source date
  const afterSource = upcomingSundayISO(source);
  return afterSource > upcoming ? afterSource : upcoming;
}
