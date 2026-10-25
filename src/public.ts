// Lightweight public bulletin page - no React, no heavy dependencies
// This loads only what's needed to display a read-only bulletin

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface BulletinData {
  ward_name: string;
  date: string;
  meeting_type: string;
  theme?: string;
  bishopric_message?: string;
  announcements?: Array<{ text: string }>;
  agenda?: Array<{ type: string; name?: string; topic?: string }>;
  prayers?: { opening?: string; closing?: string };
  music_program?: {
    openingHymnNumber?: string;
    openingHymnTitle?: string;
    sacramentHymnNumber?: string;
    sacramentHymnTitle?: string;
    closingHymnNumber?: string;
    closingHymnTitle?: string;
  };
  leadership?: {
    presiding?: string;
    conducting?: string;
    chorister?: string;
    organist?: string;
  };
}

function getProfileSlug(): string {
  const path = window.location.pathname;
  const match = path.match(/^\/([A-Za-z0-9_-]+)\/?$/);
  return match ? match[1] : '';
}

async function fetchBulletin(slug: string): Promise<BulletinData | null> {
  try {
    // Fetch user profile
    const userRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?profile_slug=eq.${slug}&select=id,active_bulletin_id`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    
    if (!userRes.ok) throw new Error('Failed to fetch user');
    const users = await userRes.json();
    if (!users || users.length === 0) return null;
    
    const user = users[0];
    if (!user.active_bulletin_id) return null;
    
    // Fetch bulletin
    const bulletinRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bulletins?id=eq.${user.active_bulletin_id}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    
    if (!bulletinRes.ok) throw new Error('Failed to fetch bulletin');
    const bulletins = await bulletinRes.json();
    if (!bulletins || bulletins.length === 0) return null;
    
    const bulletin = bulletins[0];
    
    // Fetch tokens
    const tokenKeys = [
      `bulletin-${bulletin.slug}-ward_name`,
      `bulletin-${bulletin.slug}-theme`,
      `bulletin-${bulletin.slug}-bishopric`,
      `bulletin-${bulletin.slug}-announcements`,
      `bulletin-${bulletin.slug}-agenda`,
      `bulletin-${bulletin.slug}-prayers`,
      `bulletin-${bulletin.slug}-music`,
      `bulletin-${bulletin.slug}-leadership`,
    ];
    
    const tokenRes = await fetch(
      `${SUPABASE_URL}/rest/v1/tokens?key=in.(${tokenKeys.map(k => `"${k}"`).join(',')})&select=key,value`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    
    if (!tokenRes.ok) throw new Error('Failed to fetch tokens');
    const tokens = await tokenRes.json();
    
    // Build token map
    const tokenMap = new Map<string, string>();
    tokens.forEach((t: { key: string; value: string }) => {
      tokenMap.set(t.key, t.value);
    });
    
    const getToken = (suffix: string) => {
      return tokenMap.get(`bulletin-${bulletin.slug}-${suffix}`) || '';
    };
    
    const parseJson = (str: string, fallback: any) => {
      if (!str) return fallback;
      try {
        return JSON.parse(str);
      } catch {
        return fallback;
      }
    };
    
    return {
      ward_name: getToken('ward_name') || '',
      date: bulletin.meeting_date || '',
      meeting_type: bulletin.meeting_type || 'Sacrament Meeting',
      theme: getToken('theme'),
      bishopric_message: getToken('bishopric'),
      announcements: parseJson(getToken('announcements'), []),
      agenda: parseJson(getToken('agenda'), []),
      prayers: parseJson(getToken('prayers'), {}),
      music_program: parseJson(getToken('music'), {}),
      leadership: parseJson(getToken('leadership'), {}),
    };
  } catch (error) {
    console.error('Error fetching bulletin:', error);
    throw error;
  }
}

function renderBulletin(data: BulletinData) {
  const app = document.getElementById('app')!;
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };
  
  let html = `
    <div class="bulletin">
      <div class="header">
        <h1 class="ward-name">${escapeHtml(data.ward_name)}</h1>
        <p class="date">${escapeHtml(data.meeting_type)} • ${formatDate(data.date)}</p>
        ${data.theme ? `<p style="margin-top: 0.5rem; color: #4b5563; font-style: italic;">${escapeHtml(data.theme)}</p>` : ''}
      </div>
  `;
  
  // Bishopric Message
  if (data.bishopric_message) {
    html += `
      <div class="section">
        <h2 class="section-title">Message</h2>
        <div style="color: #4b5563;">${sanitizeHtml(data.bishopric_message)}</div>
      </div>
    `;
  }
  
  // Announcements
  if (data.announcements && data.announcements.length > 0) {
    html += `
      <div class="section">
        <h2 class="section-title">Announcements</h2>
    `;
    data.announcements.forEach((ann) => {
      html += `<div class="item">• ${sanitizeHtml(ann.text)}</div>`;
    });
    html += `</div>`;
  }
  
  // Agenda/Program
  if (data.agenda && data.agenda.length > 0) {
    html += `
      <div class="section">
        <h2 class="section-title">Program</h2>
    `;
    data.agenda.forEach((item) => {
      if (item.type === 'sacrament') {
        html += `<div class="agenda-item"><strong>Sacrament</strong></div>`;
      } else if (item.type === 'speaker' && item.name) {
        html += `<div class="agenda-item">
          <div>
            <strong>Speaker:</strong> ${escapeHtml(item.name)}
            ${item.topic ? `<br><span style="color: #6b7280; font-size: 0.875rem;">${escapeHtml(item.topic)}</span>` : ''}
          </div>
        </div>`;
      } else if (item.type === 'musical-number' && item.name) {
        html += `<div class="agenda-item"><strong>Musical Number:</strong> ${escapeHtml(item.name)}</div>`;
      }
    });
    html += `</div>`;
  }
  
  // Music
  if (data.music_program) {
    const music = data.music_program;
    html += `<div class="section"><h2 class="section-title">Music</h2>`;
    if (music.openingHymnNumber || music.openingHymnTitle) {
      html += `<div class="item"><span class="item-label">Opening Hymn:</span> ${escapeHtml(music.openingHymnNumber || '')} ${escapeHtml(music.openingHymnTitle || '')}</div>`;
    }
    if (music.sacramentHymnNumber || music.sacramentHymnTitle) {
      html += `<div class="item"><span class="item-label">Sacrament Hymn:</span> ${escapeHtml(music.sacramentHymnNumber || '')} ${escapeHtml(music.sacramentHymnTitle || '')}</div>`;
    }
    if (music.closingHymnNumber || music.closingHymnTitle) {
      html += `<div class="item"><span class="item-label">Closing Hymn:</span> ${escapeHtml(music.closingHymnNumber || '')} ${escapeHtml(music.closingHymnTitle || '')}</div>`;
    }
    html += `</div>`;
  }
  
  // Prayers
  if (data.prayers && (data.prayers.opening || data.prayers.closing)) {
    html += `<div class="section"><h2 class="section-title">Prayers</h2>`;
    if (data.prayers.opening) {
      html += `<div class="item"><span class="item-label">Opening:</span> ${escapeHtml(data.prayers.opening)}</div>`;
    }
    if (data.prayers.closing) {
      html += `<div class="item"><span class="item-label">Closing:</span> ${escapeHtml(data.prayers.closing)}</div>`;
    }
    html += `</div>`;
  }
  
  // Leadership
  if (data.leadership) {
    const lead = data.leadership;
    const hasLeadership = lead.presiding || lead.conducting || lead.chorister || lead.organist;
    if (hasLeadership) {
      html += `<div class="section"><h2 class="section-title">Leadership</h2>`;
      if (lead.presiding) html += `<div class="item"><span class="item-label">Presiding:</span> ${escapeHtml(lead.presiding)}</div>`;
      if (lead.conducting) html += `<div class="item"><span class="item-label">Conducting:</span> ${escapeHtml(lead.conducting)}</div>`;
      if (lead.chorister) html += `<div class="item"><span class="item-label">Chorister:</span> ${escapeHtml(lead.chorister)}</div>`;
      if (lead.organist) html += `<div class="item"><span class="item-label">Organist:</span> ${escapeHtml(lead.organist)}</div>`;
      html += `</div>`;
    }
  }
  
  html += `
      <div class="footer">
        <p>Built with <a href="https://wardbulletin.com">WardBulletin</a></p>
        <p style="margin-top: 0.5rem;"><a href="/">Create your own bulletin</a></p>
      </div>
    </div>
  `;
  
  app.innerHTML = html;
}

function renderError(message: string) {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="bulletin">
      <div class="error">
        <h2 style="margin-bottom: 0.5rem;">Bulletin Not Available</h2>
        <p>${escapeHtml(message)}</p>
        <p style="margin-top: 0.5rem; font-size: 0.875rem;">This could be due to:</p>
        <ul style="margin-left: 1.5rem; font-size: 0.875rem;">
          <li>The bulletin hasn't been published yet</li>
          <li>The link is incorrect</li>
          <li>Slow or unstable internet connection</li>
        </ul>
        <button class="retry-btn" onclick="window.location.reload()">Retry</button>
      </div>
      <div class="footer" style="margin-top: 2rem;">
        <p><a href="/">Create your own bulletin at WardBulletin.com</a></p>
      </div>
    </div>
  `;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function sanitizeHtml(html: string): string {
  // Very basic sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

// Main entry point
async function main() {
  const slug = getProfileSlug();
  
  if (!slug) {
    renderError('Invalid bulletin URL');
    return;
  }
  
  try {
    const bulletin = await fetchBulletin(slug);
    if (!bulletin) {
      renderError('No bulletin found for this ward');
      return;
    }
    renderBulletin(bulletin);
  } catch (error) {
    renderError('Failed to load bulletin. Please try again.');
  }
}

main();
