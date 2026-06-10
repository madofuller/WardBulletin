const URL_PATTERN = /\bhttps?:\/\/[^\s<>"']+|\bwww\.[a-z0-9-]+(?:\.[a-z0-9-]+)+[^\s<>"']*/gi;
const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/;
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

/**
 * Converts bare URLs in already-sanitized HTML into clickable anchors and
 * normalizes every anchor to open safely in a new tab.
 *
 * Expects the output of sanitizeHtml(); do not pass untrusted raw HTML.
 */
export function linkifyHtml(html: string): string {
  if (!html || !html.trim()) {
    return html;
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Collect text nodes first so DOM mutation doesn't disturb the walk.
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    // Skip text already inside an anchor.
    if ((node.parentNode as Element | null)?.closest?.('a')) continue;
    textNodes.push(node as Text);
  }

  for (const textNode of textNodes) {
    const text = textNode.textContent ?? '';
    URL_PATTERN.lastIndex = 0;
    if (!URL_PATTERN.test(text)) continue;
    URL_PATTERN.lastIndex = 0;

    const fragment = doc.createDocumentFragment();
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = URL_PATTERN.exec(text))) {
      let url = match[0];
      // Trim trailing punctuation that's likely sentence punctuation.
      const trimmed = url.replace(TRAILING_PUNCTUATION, '');
      const trimmedCount = url.length - trimmed.length;
      url = trimmed;
      if (!url) continue;

      const start = match.index;
      const end = start + match[0].length - trimmedCount;

      if (start > lastIndex) {
        fragment.appendChild(doc.createTextNode(text.slice(lastIndex, start)));
      }

      const anchor = doc.createElement('a');
      anchor.setAttribute('href', /^https?:\/\//i.test(url) ? url : `https://${url}`);
      anchor.textContent = url;
      fragment.appendChild(anchor);

      lastIndex = end;
    }
    if (lastIndex < text.length) {
      fragment.appendChild(doc.createTextNode(text.slice(lastIndex)));
    }
    textNode.parentNode?.replaceChild(fragment, textNode);
  }

  // Normalize every anchor: safe protocol, new tab, no opener leakage.
  for (const anchor of Array.from(doc.body.querySelectorAll('a'))) {
    const href = anchor.getAttribute('href') ?? '';
    let protocol = '';
    try {
      protocol = new URL(href, 'https://example.com').protocol;
    } catch {
      protocol = '';
    }
    if (!ALLOWED_PROTOCOLS.has(protocol)) {
      anchor.replaceWith(doc.createTextNode(anchor.textContent ?? ''));
      continue;
    }
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
  }

  return doc.body.innerHTML;
}
