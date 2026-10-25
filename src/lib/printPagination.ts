/** Pack print announcements and program rows so a 5.5×8.5in panel never clips. */

export type PrintMode = 'normal' | 'large' | 'xl';

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

export function printTypeScale(mode: PrintMode): PrintTypeScale {
  if (mode === 'xl') {
    return { bodyPt: 14, headingPt: 18, coverNamePt: 36, coverSubPt: 13, announceTitlePt: 16, announceBodyPt: 14 };
  }
  if (mode === 'large') {
    return { bodyPt: 10.5, headingPt: 14, coverNamePt: 30, coverSubPt: 12, announceTitlePt: 12, announceBodyPt: 10.5 };
  }
  return { bodyPt: 0, headingPt: 0, coverNamePt: 0, coverSubPt: 0, announceTitlePt: 0, announceBodyPt: 0 };
}

interface Metrics {
  charIn: number;
  lineIn: number;
  titleLineIn: number;
  gapIn: number;
  colIn: number;
  firstAnnIn: number;
  nextAnnIn: number;
  firstProgIn: number;
  nextProgIn: number;
}

const METRICS: Record<PrintMode, Metrics> = {
  xl: {
    charIn: 0.15,
    lineIn: 0.29,
    titleLineIn: 0.34,
    gapIn: 0.2,
    colIn: 4.75,
    firstAnnIn: 5.55,
    nextAnnIn: 6.55,
    firstProgIn: 5.85,
    nextProgIn: 6.7,
  },
  large: {
    charIn: 0.12,
    lineIn: 0.23,
    titleLineIn: 0.27,
    gapIn: 0.15,
    colIn: 4.75,
    firstAnnIn: 5.85,
    nextAnnIn: 6.7,
    firstProgIn: 6.15,
    nextProgIn: 6.85,
  },
  normal: {
    charIn: 0.088,
    lineIn: 0.16,
    titleLineIn: 0.19,
    gapIn: 0.1,
    colIn: 4.75,
    firstAnnIn: 6.2,
    nextAnnIn: 6.9,
    firstProgIn: 6.5,
    nextProgIn: 7.0,
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
}

export function paginateAnnouncements(items: any[], mode: PrintMode, columns = 1): AnnouncementChunk[][] {
  const m = METRICS[mode];
  const cpl = charsPerLine(m);
  const colFactor = Math.max(1, columns) * (columns > 1 ? 0.82 : 1);
  const pages: AnnouncementChunk[][] = [];
  let current: AnnouncementChunk[] = [];
  let used = 0;
  let pageIndex = 0;

  const usable = () => (pageIndex === 0 ? m.firstAnnIn : m.nextAnnIn) * colFactor;

  const pushPage = () => {
    if (current.length) pages.push(current);
    current = [];
    used = 0;
    pageIndex += 1;
  };

  const titleHeight = (title: string) => Math.max(1, lineCount(title, cpl)) * m.titleLineIn;

  const bodyHeight = (text: string) => Math.max(text ? 1 : 0, lineCount(text, cpl)) * m.lineIn;

  const takeWords = (text: string, maxIn: number): { fit: string; rest: string } => {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return { fit: '', rest: '' };
    let lo = 1;
    let hi = words.length;
    let best = 0;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const slice = words.slice(0, mid).join(' ');
      if (bodyHeight(slice) <= maxIn) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    if (best === 0) {
      return { fit: words[0], rest: words.slice(1).join(' ') };
    }
    return { fit: words.slice(0, best).join(' '), rest: words.slice(best).join(' ') };
  };

  for (const raw of items) {
    let remaining = stripHtml(raw.content || '');
    let continued = false;
    let guard = 0;
    while (true) {
      guard += 1;
      if (guard > 40) break;
      const title = raw.title || '';
      const tH = titleHeight(title);
      const fullH = tH + bodyHeight(remaining) + m.gapIn;
      const room = usable() - used;
      if (current.length > 0 && fullH > room) {
        const minKeep = tH + m.lineIn + m.gapIn;
        if (room >= minKeep && remaining) {
          const { fit, rest } = takeWords(remaining, room - tH - m.gapIn);
          if (fit) {
            current.push({
              id: raw.id,
              title,
              content: fit,
              continued,
              category: raw.category,
              audience: raw.audience,
            });
            used = usable();
            remaining = rest;
            continued = true;
            pushPage();
            if (!remaining) break;
            continue;
          }
        }
        pushPage();
        continue;
      }
      if (current.length === 0 && fullH > usable() && remaining) {
        const { fit, rest } = takeWords(remaining, usable() - tH - m.gapIn);
        current.push({
          id: raw.id,
          title,
          content: fit || remaining,
          continued,
          category: raw.category,
          audience: raw.audience,
        });
        remaining = fit ? rest : '';
        continued = true;
        pushPage();
        if (!remaining) break;
        continue;
      }
      current.push({
        id: raw.id,
        title,
        content: remaining,
        continued,
        category: raw.category,
        audience: raw.audience,
        imageId: continued ? undefined : raw.imageId,
        images: continued ? undefined : raw.images,
        hideImageOnPrint: raw.hideImageOnPrint,
      });
      used += fullH;
      break;
    }
  }
  if (current.length) pages.push(current);
  return pages.length ? pages : [[]];
}

export type ProgramBlock =
  | { kind: 'row'; id: string; label: string; value?: string; extra?: string; extra2?: string }
  | { kind: 'banner'; id: string; text: string; extra?: string };

export function paginateProgram(blocks: ProgramBlock[], mode: PrintMode): ProgramBlock[][] {
  const m = METRICS[mode];
  const cpl = charsPerLine(m);
  const pages: ProgramBlock[][] = [];
  let current: ProgramBlock[] = [];
  let used = 0;
  let pageIndex = 0;
  const usable = () => (pageIndex === 0 ? m.firstProgIn : m.nextProgIn);

  const heightOf = (block: ProgramBlock) => {
    if (block.kind === 'banner') {
      return (lineCount(block.text, cpl) + (block.extra ? lineCount(block.extra, cpl) : 0)) * m.titleLineIn + 0.08;
    }
    const value = [block.value, block.extra, block.extra2].filter(Boolean).join(' ');
    const labelLines = lineCount(`${block.label} ${block.value || ''}`, Math.floor(cpl * 0.95));
    const extraLines = lineCount(block.extra || '', cpl) + lineCount(block.extra2 || '', cpl);
    return (Math.max(1, labelLines) + extraLines) * m.lineIn + 0.06 + (value.length > 40 ? 0.06 : 0);
  };

  for (const block of blocks) {
    const h = heightOf(block);
    if (current.length > 0 && used + h > usable()) {
      pages.push(current);
      current = [block];
      used = h;
      pageIndex += 1;
    } else {
      current.push(block);
      used += h;
    }
  }
  if (current.length) pages.push(current);
  return pages.length ? pages : [[]];
}
