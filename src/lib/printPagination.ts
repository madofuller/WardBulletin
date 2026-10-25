/** Pack a bifold (or optional saddle booklet) so a 5.5×8.5in panel never clips. */

export type PrintMode = 'normal' | 'large' | 'xl';
export type PrintOutputMode = 'single' | 'booklet';
export type PanelRole = 'cover' | 'program' | 'announcements' | 'back';

export function printModeFromScale(fontScale: number): PrintMode {
  if (fontScale >= 1.8) return 'xl';
  if (fontScale >= 1.4) return 'large';
  return 'normal';
}

export interface PrintTypeScale {
  bodyPt: number;
  headingPt: number;
  coverNamePt: number;
  coverSubPt: number;
  announceTitlePt: number;
  announceBodyPt: number;
}

/** Body sizes must strictly increase Normal < Large < Extra Large in every region. */
export function printTypeScale(mode: PrintMode): PrintTypeScale {
  if (mode === 'xl') {
    return { bodyPt: 14, headingPt: 18, coverNamePt: 36, coverSubPt: 14, announceTitlePt: 16, announceBodyPt: 14 };
  }
  if (mode === 'large') {
    return { bodyPt: 11, headingPt: 15, coverNamePt: 28, coverSubPt: 12, announceTitlePt: 13, announceBodyPt: 11 };
  }
  return { bodyPt: 8, headingPt: 12, coverNamePt: 22, coverSubPt: 10, announceTitlePt: 9.5, announceBodyPt: 8 };
}

export function printMinBodyPt(mode: PrintMode): number {
  if (mode === 'xl') return 14;
  if (mode === 'large') return 10.5;
  return 8;
}

interface Metrics {
  charIn: number;
  lineIn: number;
  titleLineIn: number;
  gapIn: number;
  colIn: number;
  panelIn: number;
  headerAnnIn: number;
  headerProgIn: number;
  qrBlockIn: number;
  moreLineIn: number;
}

const METRICS: Record<PrintMode, Metrics> = {
  xl: {
    charIn: 0.1,
    lineIn: 0.233,
    titleLineIn: 0.267,
    gapIn: 0.14,
    colIn: 4.9,
    panelIn: 7.9,
    headerAnnIn: 0.4,
    headerProgIn: 0.95,
    qrBlockIn: 1.55,
    moreLineIn: 0.38,
  },
  large: {
    charIn: 0.082,
    lineIn: 0.19,
    titleLineIn: 0.22,
    gapIn: 0.12,
    colIn: 4.9,
    panelIn: 7.9,
    headerAnnIn: 0.36,
    headerProgIn: 0.85,
    qrBlockIn: 1.45,
    moreLineIn: 0.32,
  },
  normal: {
    charIn: 0.062,
    lineIn: 0.145,
    titleLineIn: 0.17,
    gapIn: 0.1,
    colIn: 4.9,
    panelIn: 7.9,
    headerAnnIn: 0.32,
    headerProgIn: 0.75,
    qrBlockIn: 1.35,
    moreLineIn: 0.28,
  },
};

export function stripHtml(html: string): string {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function charsPerLine(m: Metrics): number {
  return Math.max(16, Math.floor(m.colIn / m.charIn));
}

function lineCount(text: string, cpl: number): number {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  let lines = 1;
  let used = 0;
  for (const word of words) {
    const w = word.length;
    const pieces = Math.max(1, Math.ceil(w / cpl));
    if (used === 0) {
      used = Math.min(w, cpl);
      lines += pieces - 1;
      continue;
    }
    if (used + 1 + w <= cpl) {
      used += 1 + w;
    } else {
      lines += pieces;
      used = Math.min(w, cpl);
    }
  }
  return lines;
}

export interface AnnouncementChunk {
  id: string;
  title: string;
  content: string;
  continued: boolean;
  category?: string;
  audience?: string;
  imageId?: string;
  images?: any[];
  hideImageOnPrint?: boolean;
  customAudienceLabel?: string;
}

function toChunk(raw: any): AnnouncementChunk {
  return {
    id: String(raw.id ?? raw.title ?? ''),
    title: raw.title || '',
    content: raw.content || '',
    continued: false,
    category: raw.category,
    audience: raw.audience,
    imageId: raw.imageId,
    images: raw.images,
    hideImageOnPrint: raw.hideImageOnPrint,
    customAudienceLabel: raw.customAudienceLabel,
  };
}

function unitAudience(audience?: string): boolean {
  const a = String(audience || 'ward').toLowerCase();
  return a === 'ward' || a === 'branch' || a === 'unit';
}

function announcementHeight(raw: any, m: Metrics, includeAudienceHeader: boolean): number {
  const cpl = charsPerLine(m);
  const title = String(raw.title || '');
  const body = stripHtml(raw.content || '');
  const titleH = Math.max(1, lineCount(title, cpl)) * m.titleLineIn;
  const bodyH = Math.max(body ? 1 : 0, lineCount(body, cpl)) * m.lineIn;
  const headerH = includeAudienceHeader ? m.titleLineIn + 0.12 : 0;
  const categoryH = raw.category && raw.category !== 'general' ? m.lineIn * 0.75 : 0;
  const imageH = raw.imageId && raw.imageId !== 'none' && !raw.hideImageOnPrint ? 1.15 : 0;
  const extraImages = Array.isArray(raw.images) ? Math.min(3, raw.images.filter((img: any) => !img.hideImageOnPrint).length) * 0.9 : 0;
  return (titleH + bodyH + headerH + categoryH + imageH + extraImages + m.gapIn) * 1.2;
}

export type ProgramBlock =
  | { kind: 'row'; id: string; label: string; value?: string; extra?: string; extra2?: string }
  | { kind: 'banner'; id: string; text: string; extra?: string };

function programHeight(blocks: ProgramBlock[], m: Metrics): number {
  const cpl = charsPerLine(m);
  let h = m.headerProgIn;
  for (const block of blocks) {
    if (block.kind === 'banner') {
      h += Math.max(1, lineCount(block.text, cpl)) * m.lineIn + 0.06;
      if (block.extra) h += lineCount(block.extra, cpl) * m.lineIn;
      continue;
    }
    const labelLines = lineCount(`${block.label} ${block.value || ''}`, Math.floor(cpl * 0.95));
    const extraLines = lineCount(block.extra || '', cpl) + lineCount(block.extra2 || '', cpl);
    h += (Math.max(1, labelLines) + extraLines) * m.lineIn + 0.05;
  }
  return h;
}

function leadershipHeight(leadershipCount: number, missionaryCount: number, m: Metrics): number {
  if (leadershipCount + missionaryCount <= 0) return 0;
  const heading = m.titleLineIn + 0.08;
  const rows = leadershipCount * (m.lineIn + 0.04) + missionaryCount * (m.lineIn + 0.03);
  return heading + rows + (missionaryCount > 0 ? heading : 0) + 0.12;
}

export interface PrintPlan {
  outputMode: PrintOutputMode;
  programBlocks: ProgramBlock[];
  programBodyPt: number;
  programFits: boolean;
  insideAnnouncements: AnnouncementChunk[];
  backAnnouncements: AnnouncementChunk[];
  bookletAnnouncements: Record<number, AnnouncementChunk[]>;
  omittedAnnouncements: { id: string; title: string }[];
  moreAnnouncementsLine: boolean;
  readingPanels: Record<number, PanelRole>;
}

/**
 * Default bifold reading order (1 sheet, 2 PDF pages, 4 panels):
 *   1 cover, 2 inside-left announcements, 3 inside-right program, 4 back flap.
 * Booklet (2 nested sheets, 4 PDF pages, 8 panels) adds announcement panels 4–7
 * and moves the back flap to 8. Program stays on panel 3 (first inside spread).
 */
export function readingPanelRoles(outputMode: PrintOutputMode): Record<number, PanelRole> {
  if (outputMode === 'booklet') {
    return {
      1: 'cover',
      2: 'announcements',
      3: 'program',
      4: 'announcements',
      5: 'announcements',
      6: 'announcements',
      7: 'announcements',
      8: 'back',
    };
  }
  return { 1: 'cover', 2: 'announcements', 3: 'program', 4: 'back' };
}

/** PDF page → [left reading panel, right reading panel]. */
export function imposeSheets(outputMode: PrintOutputMode): Array<[number, number]> {
  if (outputMode === 'booklet') {
    return [
      [8, 1],
      [2, 7],
      [6, 3],
      [4, 5],
    ];
  }
  return [
    [4, 1],
    [2, 3],
  ];
}

export function facingPairs(outputMode: PrintOutputMode): Array<[number, number]> {
  if (outputMode === 'booklet') return [[2, 3], [4, 5], [6, 7]];
  return [[2, 3]];
}

function fillSlots(items: any[], slotHeights: number[], m: Metrics): { slots: any[][]; omitted: any[] } {
  const slots: any[][] = slotHeights.map(() => []);
  const used = slotHeights.map(() => 0);
  const lastAudience = slotHeights.map(() => '');
  const omitted: any[] = [];
  let slot = 0;

  for (const item of items) {
    const audience = String(item.audience || 'ward');
    let placed = false;
    for (let i = slot; i < slotHeights.length; i++) {
      const showHeader = !unitAudience(audience) && audience !== lastAudience[i];
      const h = announcementHeight(item, m, showHeader);
      if (used[i] + h <= slotHeights[i] + 0.01) {
        slots[i].push(item);
        used[i] += h;
        lastAudience[i] = audience;
        slot = i;
        placed = true;
        break;
      }
    }
    if (!placed) omitted.push(item);
  }
  return { slots, omitted };
}

export function planPrintLayout(input: {
  mode: PrintMode;
  outputMode?: PrintOutputMode;
  announcements: any[];
  programBlocks: ProgramBlock[];
  leadershipCount?: number;
  missionaryCount?: number;
  hasQR?: boolean;
}): PrintPlan {
  const outputMode: PrintOutputMode = input.outputMode === 'booklet' ? 'booklet' : 'single';
  const m = METRICS[input.mode];
  const scale = printTypeScale(input.mode);
  const minPt = printMinBodyPt(input.mode);
  const items = (input.announcements || []).filter((a: any) => a && !a.hideOnPrint);
  const leadH = leadershipHeight(input.leadershipCount || 0, input.missionaryCount || 0, m);
  const qrH = input.hasQR === false ? 0 : m.qrBlockIn;

  const progH = programHeight(input.programBlocks || [], m);
  const progUsable = m.panelIn;
  let programBodyPt = scale.bodyPt;
  let programFits = progH <= progUsable + 0.02;
  if (!programFits && scale.bodyPt > minPt) {
    const ratio = progUsable / Math.max(progH, 0.01);
    programBodyPt = Math.max(minPt, Math.round(scale.bodyPt * ratio * 2) / 2);
    programFits = true;
  }

  const insideUsable = m.panelIn - m.headerAnnIn - 0.2;
  const backUsable = Math.max(0.5, m.panelIn - leadH - qrH - m.moreLineIn - m.headerAnnIn - 0.25);
  const extraUsable = m.panelIn - m.headerAnnIn - 0.2;

  const slotHeights = outputMode === 'booklet'
    ? [insideUsable, extraUsable, extraUsable, extraUsable, extraUsable, backUsable]
    : [insideUsable, backUsable];

  const { slots, omitted } = fillSlots(items, slotHeights, m);
  const more = omitted.length > 0;

  const insideAnnouncements = (slots[0] || []).map(toChunk);
  let backAnnouncements: AnnouncementChunk[] = [];
  const bookletAnnouncements: Record<number, AnnouncementChunk[]> = {};

  if (outputMode === 'booklet') {
    bookletAnnouncements[4] = (slots[1] || []).map(toChunk);
    bookletAnnouncements[5] = (slots[2] || []).map(toChunk);
    bookletAnnouncements[6] = (slots[3] || []).map(toChunk);
    bookletAnnouncements[7] = (slots[4] || []).map(toChunk);
    backAnnouncements = (slots[5] || []).map(toChunk);
  } else {
    backAnnouncements = (slots[1] || []).map(toChunk);
  }

  return {
    outputMode,
    programBlocks: input.programBlocks || [],
    programBodyPt,
    programFits,
    insideAnnouncements,
    backAnnouncements,
    bookletAnnouncements,
    omittedAnnouncements: omitted.map((a) => ({ id: String(a.id ?? a.title ?? ''), title: a.title || 'Untitled' })),
    moreAnnouncementsLine: more,
    readingPanels: readingPanelRoles(outputMode),
  };
}

/** @deprecated Use planPrintLayout. Kept so older call sites compile during the switch. */
export function paginateAnnouncements(items: any[], mode: PrintMode, _columns = 1): AnnouncementChunk[][] {
  const plan = planPrintLayout({
    mode,
    outputMode: 'single',
    announcements: items,
    programBlocks: [],
    hasQR: true,
  });
  const pages = [plan.insideAnnouncements];
  if (plan.backAnnouncements.length) pages.push(plan.backAnnouncements);
  return pages.length ? pages : [[]];
}

/** @deprecated Program is never split; use planPrintLayout. */
export function paginateProgram(blocks: ProgramBlock[], _mode: PrintMode): ProgramBlock[][] {
  return [blocks];
}
