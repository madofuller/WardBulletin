// Tokens are unique per (key, created_by), NOT per key. When a bulletin has
// been saved by both its creator and a shared-profile editor, the same key can
// exist under two different created_by values. A plain .single() lookup fails
// with "multiple rows" - which used to be swallowed and returned as null,
// making the whole bulletin load blank even though the content was intact.
//
// Resolve duplicates deterministically: prefer the bulletin creator's row
// (the row the save path writes), falling back to any other visible row for
// legacy bulletins whose tokens were saved under a shared editor's id.
export function pickTokenRow<T extends { created_by?: string | null }>(
  rows: T[] | null | undefined,
  preferredOwnerId?: string | null
): T | null {
  if (!rows || rows.length === 0) return null;
  if (preferredOwnerId) {
    const preferred = rows.find(row => row.created_by === preferredOwnerId);
    if (preferred) return preferred;
  }
  return rows[0];
}
