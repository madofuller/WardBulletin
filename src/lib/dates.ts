// Bulletins are for Sunday meetings: a clerk building the program mid-week
// wants the upcoming Sunday, not today's date.
export function upcomingSundayISO(from: Date = new Date()): string {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const daysUntilSunday = (7 - date.getDay()) % 7; // Sunday itself counts as 0
  date.setDate(date.getDate() + daysUntilSunday);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
