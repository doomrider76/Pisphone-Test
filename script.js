/* =========================================================
   پیسفون v1.15
   ========================================================= */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const escRegex = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const icon = (name, size = 20) => `<svg width="${size}" height="${size}"><use href="#i-${name}"/></svg>`;
const KEY = 'pisfon_v3';

/* ===================== VIEWPORT ===================== */
function setViewport() {
  const h = window.innerHeight;
  const w = window.innerWidth;
  const root = document.documentElement;
  root.style.setProperty('--vh', (h * 0.01) + 'px');
  root.style.setProperty('--vw', (w * 0.01) + 'px');
}
setViewport();
window.addEventListener('resize', setViewport);
window.addEventListener('orientationchange', () => setTimeout(setViewport, 200));

if (window.visualViewport) {
  const vv = window.visualViewport;
  const applyVV = () => {
    document.documentElement.style.setProperty('--kb',
      (window.innerHeight - vv.height - vv.offsetTop) + 'px');
  };
  vv.addEventListener('resize', applyVV);
  vv.addEventListener('scroll', applyVV);
  applyVV();
}

/* ===================== FULLSCREEN ===================== */
let _fsOnce = false;
function requestFullscreen() {
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen
           || el.mozRequestFullScreen || el.msRequestFullscreen;
  if (!req) return;
  if (document.fullscreenElement || document.webkitFullscreenElement) return;
  try {
    const p = req.call(el, { navigationUI: 'hide' });
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}
function lockOrientation() {
  try {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('portrait').catch(() => {});
    } else if (screen.lockOrientation) {
      screen.lockOrientation('portrait');
    }
  } catch (e) {}
}
function tryFullscreenOnce() {
  if (_fsOnce) return;
  _fsOnce = true;
  requestFullscreen();
  lockOrientation();
}
['touchstart', 'click', 'keydown'].forEach(ev => {
  document.addEventListener(ev, tryFullscreenOnce, { once: true, passive: true });
});
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    _fsOnce = false;
    ['touchstart', 'click', 'keydown'].forEach(ev => {
      document.addEventListener(ev, tryFullscreenOnce, { once: true, passive: true });
    });
  }
});
document.addEventListener('gesturestart', e => e.preventDefault(), { passive: false });
document.addEventListener('touchmove', e => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });
document.addEventListener('contextmenu', e => {
  if (!e.target.closest('#msg-input') && !e.target.closest('.btext') &&
      !e.target.closest('.modal-box input')) {
    e.preventDefault();
  }
});

/* ===================== VERSION ===================== */
const APP_VERSION = '1.15';
const VERSION_KEY = 'pisfon_version';
const CHANGELOG = [
  'نوار پایین شبیه تلگرام (شناور و گرد)',
  'تب‌های فیلتر افقی بالای لیست',
  'فیلتر: همه / خصوصی / گروه / کانال / AI / ذخیره‌شده',
  'دکمه شناور جستجو سمت راست',
  'همه باگ‌های قبلی فیکس',
  'پیام صوتی و عکس واقعی',
  'نوتیفیکیشن مرورگر',
  'تم روشن و تاریک'
];

const renderedMsgIds = new Set();
const MAX_RENDERED = 5000;
function pruneRenderedIds() {
  if (renderedMsgIds.size <= MAX_RENDERED) return;
  const valid = new Set();
  state.chats.forEach(c => c.messages.forEach(m => valid.add(m.id)));
  [...renderedMsgIds].forEach(id => { if (!valid.has(id)) renderedMsgIds.delete(id); });
}

const AV_GRADS = [
  ['#ff6b6b','#c92a2a'], ['#51cf66','#2b8a3e'], ['#ffd43b','#e67700'],
  ['#4dabf7','#1864ab'], ['#b197fc','#5f3dc4'], ['#ff8cc8','#c2255c'],
  ['#63e6be','#087f5b'], ['#ffa94d','#d9480f'], ['#845ef7','#5f3dc4'],
  ['#20c997','#0ca678'], ['#f783ac','#a61e4d'], ['#74c0fc','#1971c2']
];
const AV_EMOJIS = [
  '😎','🥰','😇','🤓','🧐','🥳','😺','🦊','🐼','🐨','🦁','🐯','🦄','🐧','🐢','🐳',
  '🌸','🌺','🌈','⚡','💎','🔥','⭐','🎯','🚀','🎨','🎵','📷','🍕','☕','🍀','🌟'
];

const GROUP_MEMBER_POOL = [
  { name: 'علی', avatar: { type: 'emoji', value: '🧑' } },
  { name: 'سارا', avatar: { type: 'emoji', value: '👩' } },
  { name: 'رضا', avatar: { type: 'emoji', value: '👨' } },
  { name: 'مینا', avatar: { type: 'emoji', value: '👧' } },
  { name: 'حسین', avatar: { type: 'emoji', value: '🧔' } },
  { name: 'نگار', avatar: { type: 'emoji', value: '👩‍🎨' } },
  { name: 'امیر', avatar: { type: 'emoji', value: '👨‍💻' } },
  { name: 'مریم', avatar: { type: 'emoji', value: '👩‍🦰' } },
  { name: 'کاوه', avatar: { type: 'emoji', value: '👦' } },
  { name: 'نیلوفر', avatar: { type: 'emoji', value: '👩‍🦱' } }
];

/* ===================== AI ===================== */
const AI_SYSTEM_PROMPT =
  'تو دستیار هوشمند پیسفون هستی. جواب‌ها رو کوتاه (حداکثر ۲ خط)، دوستانه، مفید و به فارسی خودمونی بده. ' +
  'اگر سوال فنی بود دقیق جواب بده. از ایموجی به‌اندازه استفاده کن.';
const AI_API_URL = 'https://text.pollinations.ai/';

async function fetchAIReply(userMessage, history = [], systemPrompt = null) {
  if (!navigator.onLine) return null;
  try {
    let fullPrompt = userMessage;
    if (history.length > 0) {
      const ctx = history.slice(-6).map(m =>
        (m.out ? 'کاربر: ' : (m.sender || 'دستیار') + ': ') + m.text
      ).join('\n');
      fullPrompt = `تاریخچه گفتگو:\n${ctx}\n\nپیام جدید کاربر: ${userMessage}`;
    }
    const sys = systemPrompt || AI_SYSTEM_PROMPT;
    const url = AI_API_URL + encodeURIComponent(fullPrompt)
              + '?model=openai&system=' + encodeURIComponent(sys);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    let text = await res.text();
    text = (text || '').trim();
    text = text.replace(/^(دستیار:|Assistant:)\s*/i, '').trim();
    return text || null;
  } catch { return null; }
}

/* ===================== STATE ===================== */
function defaultState() {
  const now = Date.now();
  return {
    me: { name: 'من', phone: '+98 ', avatar: { type: 'gradient', value: 3 }, verified: true },
    theme: 'dark',
    settings: { autoReply: true, autoIncoming: false, enterToSend: true, sounds: false, aiMode: true, notifications: true },
    chats: [
      {
        id: 'ai_assistant',
        name: 'دستیار پیسفون',
        type: 'ai',
        avatar: { type: 'gradient', value: 4 },
        verified: true,
        username: 'pisfon_ai',
        isPublic: true,
        online: true,
        unread: 0, pinned: true, muted: false,
        draft: '',
        createdAt: now - 3600000,
        messages: [
          { id: rid(), out: false, ts: now - 60000, type: 'text',
            text: 'سلام 👋 من دستیار هوشمند پیسفون هستم.\nهر سوالی داری بپرس.' },
          { id: rid(), out: false, ts: now - 55000, type: 'text',
            text: 'مثلاً:\n• چطور کانال بسازم؟\n• یه شوخی بگو\n• هوای تهران چطوره؟' }
        ]
      },
      {
        id: 'family_group',
        name: 'گروه خانواده',
        type: 'group',
        avatar: { type: 'gradient', value: 5 },
        verified: false,
        username: '',
        isPublic: false,
        members: 4,
        membersList: [
          { name: 'مامان', avatar: { type: 'emoji', value: '👩' } },
          { name: 'بابا', avatar: { type: 'emoji', value: '👨' } },
          { name: 'سارا', avatar: { type: 'emoji', value: '👧' } },
          { name: 'رضا', avatar: { type: 'emoji', value: '👦' } }
        ],
        unread: 0, pinned: false, muted: false, draft: '',
        createdAt: now - 86400000,
        messages: [
          { id: rid(), out: false, ts: now - 7200000, type: 'text', sender: 'مامان', text: 'سلام بچه‌ها 👋 امروز کجا بریم؟' },
          { id: rid(), out: false, ts: now - 7100000, type: 'text', sender: 'بابا', text: 'من پایه‌ام، هرجا بگید میام 🚗' },
          { id: rid(), out: false, ts: now - 6900000, type: 'text', sender: 'سارا', text: 'پارک نزدیک خونه خوبه 🌳' },
          { id: rid(), out: false, ts: now - 600000, type: 'text', sender: 'رضا', text: 'منم موافقم! ساعت ۵ بریم؟' }
        ]
      },
      {
        id: 'saved_msgs',
        name: 'پیام‌های ذخیره‌شده',
        type: 'saved',
        avatar: { type: 'gradient', value: 6 },
        verified: false,
        username: '',
        isPublic: false,
        unread: 0, pinned: false, muted: false, draft: '',
        createdAt: now - 86400000 * 3,
        messages: [
          { id: rid(), out: true, ts: now - 86400000 * 2, type: 'text',
            text: '📌 یادداشت‌های من:\n\n• لیست خرید\n• تماس با پشتیبانی\n• ایده‌های پروژه جدید' }
        ]
      }
    ],
    contacts: []
  };
}

let state;
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.chats)) return null;
    s.settings = Object.assign(
      { autoReply: true, autoIncoming: false, enterToSend: true, sounds: false, aiMode: true, notifications: true },
      s.settings);
    if (!Array.isArray(s.contacts)) s.contacts = [];
    if (!s.me.avatar) s.me.avatar = { type: 'gradient', value: 3 };
    if (typeof s.me.verified !== 'boolean') s.me.verified = true;
    if (!s.me.phone) s.me.phone = '+98 ';
    if (s.theme !== 'light' && s.theme !== 'dark') s.theme = 'dark';

    if (!s.chats.find(c => c.id === 'ai_assistant')) {
      const aiChat = defaultState().chats[0];
      s.chats.unshift(aiChat);
    }

    s.chats.forEach((c, i) => {
      if (!c.avatar) c.avatar = { type: 'gradient', value: i % AV_GRADS.length };
      if (typeof c.verified !== 'boolean') c.verified = false;
      if (typeof c.username !== 'string') c.username = '';
      if (typeof c.isPublic !== 'boolean') c.isPublic = c.type === 'channel';
      if (typeof c.draft !== 'string') c.draft = '';
      if ((c.type === 'group' || c.type === 'channel') && typeof c.members !== 'number') {
        c.members = c.type === 'group' ? 1 : 0;
      }
      if (c.type === 'group' && Array.isArray(c.membersList) && c.membersList.length > (c.members || 0)) {
        c.members = c.membersList.length;
      }
      if (c.type === 'group' && !c.membersList) {
        c.membersList = (c.memberNames || []).map(n => {
          const pool = GROUP_MEMBER_POOL.find(p => p.name === n);
          if (pool) return { ...pool };
          return { name: n, avatar: { type: 'gradient', value: 0 } };
        });
      }
    });
    s.contacts.forEach((c, i) => {
      if (!c.avatar) c.avatar = { type: 'gradient', value: i % AV_GRADS.length };
      if (typeof c.verified !== 'boolean') c.verified = false;
    });
    return s;
  } catch { return null; }
}
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, 150);
}
state = load() || defaultState();

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme || 'dark');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = state.theme === 'light' ? '#f2f2f7' : '#0d0d14';
}
applyTheme();

/* ===================== NOTIFICATIONS ===================== */
async function requestNotifPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    try { await Notification.requestPermission(); } catch {}
  }
}
function notifyIncoming(chat, text) {
  if (!state.settings.notifications) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (chat.muted) return;
  if (document.visibilityState === 'visible' && activeChatId === chat.id) return;
  try {
    const n = new Notification(chat.name, { body: text, tag: chat.id, silent: !state.settings.sounds });
    n.onclick = () => { window.focus(); if (chat.id) openChat(chat.id); n.close(); };
  } catch {}
}

/* ===================== HELPERS ===================== */
function nameColorPair(name) {
  const n = String(name || 'x');
  let h = 0;
  for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  const hue2 = (hue + 32) % 360;
  return [`hsl(${hue}, 68%, 55%)`, `hsl(${hue2}, 62%, 42%)`];
}
function initials(name) {
  const t = (name || '').trim();
  if (!t) return '?';
  const parts = t.split(/\s+/);
  if (parts.length === 1) return parts[0][0];
  return parts[0][0] + parts[1][0];
}
function safeUrlCss(u) {
  return String(u).replace(/['"()\\\n\r]/g, c => '\\' + c.charCodeAt(0).toString(16) + ' ');
}
function avatarHTML(entity, size = 54) {
  const av = entity.avatar || { type: 'gradient', value: 0 };
  const dim = (size === 38 || size === 40) ? ' sm' : (size >= 86 ? ' big' : '');
  const klass = `avatar${dim}`;
  if (av.type === 'image') {
    return `<div class="${klass}" style="background-image:url(&quot;${esc(safeUrlCss(av.value))}&quot;);background-size:cover;background-position:center"></div>`;
  }
  if (av.type === 'gradient') {
    const g = AV_GRADS[(av.value || 0) % AV_GRADS.length];
    return `<div class="${klass}" style="background:linear-gradient(135deg,${g[0]},${g[1]})">${esc(initials(entity.name))}</div>`;
  }
  if (av.type === 'emoji') {
    const [c1, c2] = nameColorPair(entity.name);
    return `<div class="${klass}" style="background:linear-gradient(135deg,${c1},${c2})">${av.value}</div>`;
  }
  const [c1, c2] = nameColorPair(entity.name);
  return `<div class="${klass}" style="background:linear-gradient(135deg,${c1},${c2})">${esc(initials(entity.name))}</div>`;
}
function avatarBgStyle(entity) {
  const av = entity.avatar || { type: 'gradient', value: 0 };
  if (av.type === 'image') {
    return `background-image:url(&quot;${esc(safeUrlCss(av.value))}&quot;);background-size:cover;background-position:center`;
  }
  if (av.type === 'gradient') {
    const g = AV_GRADS[(av.value || 0) % AV_GRADS.length];
    return `background:linear-gradient(135deg,${g[0]},${g[1]})`;
  }
  const [c1, c2] = nameColorPair(entity.name);
  return `background:linear-gradient(135deg,${c1},${c2})`;
}
function avatarContent(entity) {
  const av = entity.avatar || { type: 'gradient', value: 0 };
  if (av.type === 'emoji') return av.value;
  if (av.type === 'image') return '';
  return esc(initials(entity.name));
}
function vfHTML(size = 17) {
  return `<svg class="vf" width="${size}" height="${size}" viewBox="0 0 24 24"><use href="#i-verified"/></svg>`;
}
function nameWithVf(name, verified, vfSize = 17) {
  return `${esc(name)}${verified ? vfHTML(vfSize) : ''}`;
}

const fmtTime = ts => new Date(ts).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
const dayKey = ts => new Date(ts).toDateString();
function fmtDay(ts) {
  const d = new Date(ts), t = new Date();
  const same = (a, b) => a.toDateString() === b.toDateString();
  if (same(d, t)) return 'امروز';
  const y = new Date(t); y.setDate(y.getDate() - 1);
  if (same(d, y)) return 'دیروز';
  return d.toLocaleDateString('fa-IR', { day: 'numeric', month: 'long' });
}
function fmtListTime(ts) {
  const d = new Date(ts), t = new Date();
  if (d.toDateString() === t.toDateString()) return fmtTime(ts);
  const y = new Date(t); y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'دیروز';
  return d.toLocaleDateString('fa-IR', { day: 'numeric', month: 'numeric' });
}
const fmtDur = s => {
  const total = Math.max(0, Math.floor(s));
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};
function fmtBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1024 / 1024).toFixed(1) + ' MB';
}

let toastTimer;
function toast(t) {
  const el = $('#toast');
  el.textContent = t;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

const getChat = id => state.chats.find(c => c.id === id);
const lastMsg = c => c.messages[c.messages.length - 1];
const lastTs  = c => (lastMsg(c) ? lastMsg(c).ts : c.createdAt || 0);
function chatStatus(c) {
  if (c.typing) return c.type === 'ai' ? 'در حال تایپ…' : 'در حال نوشتن…';
  if (c.type === 'saved') return 'یادداشت‌های شخصی';
  if (c.type === 'ai') return navigator.onLine ? 'آنلاین — هوش مصنوعی' : 'آفلاین — پاسخ آماده';
  if (c.type === 'group') return (c.members || 1).toLocaleString('fa-IR') + ' عضو';
  if (c.type === 'channel') return (c.members || 0).toLocaleString('fa-IR') + ' عضو';
  return c.online ? 'آنلاین' : (c.lastSeen || 'آخرین بازدید به تازگی');
}
function previewText(c) {
  const m = lastMsg(c);
  if (!m) return 'بدون پیام';
  let t;
  if (m.type === 'voice') t = '🎤 پیام صوتی';
  else if (m.type === 'photo') t = '🖼 عکس';
  else if (m.type === 'file') t = '📎 فایل';
  else if (m.type === 'location') t = '📍 موقعیت مکانی';
  else t = m.text;
  if (c.type === 'group' && !m.out && m.sender) t = m.sender + ': ' + t;
  else if (m.out) t = 'شما: ' + t;
  return t;
}

/* ===================== CHAT FILTER ===================== */
let chatFilter = 'all';

/* ===================== RENDER: LIST ===================== */
let searchDebounceTimer = null;
function renderChatList() {
  const q = ($('#search-input').value || '').trim();
  const qLower = q.toLowerCase();
  let list = state.chats.filter(c => !q || c.name.toLowerCase().includes(qLower));

  if (chatFilter !== 'all') {
    list = list.filter(c => {
      if (chatFilter === 'private') return c.type === 'private';
      if (chatFilter === 'group')   return c.type === 'group';
      if (chatFilter === 'channel') return c.type === 'channel';
      if (chatFilter === 'ai')      return c.type === 'ai';
      if (chatFilter === 'saved')   return c.type === 'saved';
      return true;
    });
  }

  list = list.slice().sort((a, b) => (b.pinned - a.pinned) || (lastTs(b) - lastTs(a)));

  const box = $('#chat-list');
  const clearBtn = $('#search-clear');
  if (clearBtn) clearBtn.classList.toggle('show', q.length > 0);

  let msgResultsHtml = '';
  if (q.length >= 2) {
    const results = [];
    state.chats.forEach(c => {
      c.messages.forEach(m => {
        if (m.type === 'text' && m.text && m.text.toLowerCase().includes(qLower)) {
          results.push({ chat: c, msg: m });
        }
      });
    });
    results.sort((a, b) => b.msg.ts - a.msg.ts);
    const top = results.slice(0, 30);
    if (top.length) {
      msgResultsHtml = `<div class="search-section-title">پیام‌ها (${results.length.toLocaleString('fa-IR')})</div>` +
        top.map(r => {
          const t = r.msg.text;
          const idx = t.toLowerCase().indexOf(qLower);
          const before = esc(t.slice(Math.max(0, idx - 30), idx));
          const match = esc(t.slice(idx, idx + q.length));
          const after = esc(t.slice(idx + q.length, idx + q.length + 60));
          const sender = r.msg.out ? 'شما' : (r.msg.sender || r.chat.name);
          return `<div class="msg-search-result" data-result-chat="${r.chat.id}" data-result-msg="${r.msg.id}">
            ${avatarHTML(r.chat, 38)}
            <div class="msr-body">
              <div class="msr-name">${esc(r.chat.name)} — <span style="color:var(--text-3);font-weight:500">${esc(sender)}</span></div>
              <div class="msr-text">…${before}<mark>${match}</mark>${after}…</div>
            </div>
          </div>`;
        }).join('');
    }
  }

  let chatListHtml;
  if (!list.length && !msgResultsHtml) {
    chatListHtml = state.chats.length
      ? `<div class="empty">${icon('search', 48)}<div class="ttl">چیزی پیدا نشد</div></div>`
      : `<div class="empty">
          ${icon('chat-outline', 56)}
          <div class="ttl">هنوز گفتگویی نداری</div>
          برای شروع روی + بالای صفحه بزن
        </div>`;
  } else {
    chatListHtml = list.map(c => {
      const m = lastMsg(c);
      const badge = c.unread > 0
        ? `<span class="badge ${c.muted ? 'muted' : ''}">${c.unread.toLocaleString('fa-IR')}</span>` : '';
      const pin = c.pinned ? `<span class="pin">${icon('pin', 14)}</span>` : '';
      const ticks = m && m.out
        ? `<span class="ticks">${icon(m.status === 'read' ? 'double-check' : 'check', 15)}</span>` : '';
      return `<div class="chat-item" data-id="${c.id}">
        ${avatarHTML(c)}
        <div class="ci-body">
          <div class="ci-top">
            <span class="ci-name">${nameWithVf(c.name, c.verified, 17)}</span>
            <span class="ci-time">${m ? ticks : ''}${m ? fmtListTime(lastTs(c)) : ''}</span>
          </div>
          <div class="ci-bot">
            <span class="ci-prev">${esc(previewText(c))}</span>
            ${pin}${badge}
          </div>
        </div>
      </div>`;
    }).join('');
  }

  box.innerHTML = msgResultsHtml + chatListHtml;
}

/* ===================== RENDER: CONTACTS ===================== */
function renderContacts() {
  const box = $('#contacts-list');
  if (!state.contacts.length) {
    box.innerHTML = `<div class="empty">
      ${icon('users', 56)}
      <div class="ttl">مخاطبین خالی است</div>
      از دکمه + در بالای صفحه یک چت جدید بساز
    </div>`;
    return;
  }
  box.innerHTML = state.contacts.map(c => `
    <div class="chat-item" data-contact="${c.id}">
      ${avatarHTML(c)}
      <div class="ci-body">
        <div class="ci-top">
          <span class="ci-name">${nameWithVf(c.name, c.verified, 17)}</span>
        </div>
        <div class="ci-bot"><span class="ci-prev">برای شروع گفتگو لمس کن</span></div>
      </div>
    </div>`).join('');
}

/* ===================== RENDER: SETTINGS ===================== */
function renderSettings() {
  const s = state.settings;
  const me = state.me;
  const themeIcon = state.theme === 'light' ? 'sun' : 'moon';
  const themeLabel = state.theme === 'light' ? 'روشن' : 'تاریک';
  $('#settings-body').innerHTML = `
    <div class="profile-card">
      <button class="pc-edit-btn" id="btn-edit-profile">${icon('edit', 14)} ویرایش</button>
      <div class="avatar big" id="my-avatar-btn" style="${avatarBgStyle(me)}">${avatarContent(me)}</div>
      <div style="text-align:center">
        <div class="pn">${nameWithVf(me.name, me.verified, 20)}</div>
        <div class="pp" dir="ltr" style="text-align:center">${me.phone ? esc(me.phone) : 'شماره ثبت نشده'}</div>
      </div>
    </div>
    <div class="section-title">حساب کاربری</div>
    <div class="group">
      <div class="row" data-act="edit-name">
        <span class="r-icon">${icon('edit', 20)}</span>
        <span class="r-text">نام</span>
        <span class="r-val">${esc(me.name)}</span>
        <span class="chev">${icon('chevron', 18)}</span>
      </div>
      <div class="row" data-act="edit-phone">
        <span class="r-icon">${icon('phone', 20)}</span>
        <span class="r-text">شماره تلفن</span>
        <span class="r-val" dir="ltr">${me.phone ? esc(me.phone) : '—'}</span>
        <span class="chev">${icon('chevron', 18)}</span>
      </div>
      <div class="row">
        <span class="r-icon" style="background:linear-gradient(180deg,#3aa0ff,#0a84ff)">${icon('verified', 20)}</span>
        <span class="r-text">تیک آبی</span>
        <label class="switch"><input type="checkbox" data-me="verified" ${me.verified ? 'checked' : ''}>
        <span class="sl"></span></label>
      </div>
    </div>
    <div class="section-title">ظاهر</div>
    <div class="group">
      <div class="row" data-act="toggle-theme">
        <span class="r-icon">${icon(themeIcon, 20)}</span>
        <span class="r-text">تم ${themeLabel}</span>
        <span class="chev">${icon('chevron', 18)}</span>
      </div>
    </div>
    <div class="section-title">هوش مصنوعی</div>
    <div class="group">
      <div class="row">
        <span class="r-icon purple">${icon('sparkle', 20)}</span>
        <span class="r-text">پاسخ هوشمند</span>
        <label class="switch purple"><input type="checkbox" data-set="aiMode" ${s.aiMode ? 'checked' : ''}>
        <span class="sl"></span></label>
      </div>
    </div>
    <div class="section-title">رفتار</div>
    <div class="group">
      <div class="row">
        <span class="r-icon">${icon('chat-outline', 20)}</span>
        <span class="r-text">پاسخ خودکار مخاطبین</span>
        <label class="switch"><input type="checkbox" data-set="autoReply" ${s.autoReply ? 'checked' : ''}>
        <span class="sl"></span></label>
      </div>
      <div class="row">
        <span class="r-icon">${icon('bell', 20)}</span>
        <span class="r-text">نوتیفیکیشن مرورگر</span>
        <label class="switch"><input type="checkbox" data-set="notifications" ${s.notifications ? 'checked' : ''}>
        <span class="sl"></span></label>
      </div>
      <div class="row">
        <span class="r-icon">${icon('bell', 20)}</span>
        <span class="r-text">صدا</span>
        <label class="switch"><input type="checkbox" data-set="sounds" ${s.sounds ? 'checked' : ''}>
        <span class="sl"></span></label>
      </div>
    </div>
    <div class="section-title">داده‌ها</div>
    <div class="group">
      <div class="row" data-act="export">
        <span class="r-icon">${icon('save', 20)}</span>
        <span class="r-text">پشتیبان‌گیری</span>
        <span class="chev">${icon('chevron', 18)}</span>
      </div>
      <div class="row" data-act="import">
        <span class="r-icon">${icon('upload', 20)}</span>
        <span class="r-text">بازیابی از فایل</span>
        <span class="chev">${icon('chevron', 18)}</span>
      </div>
    </div>
    <div class="group">
      <div class="row" data-act="reset">
        <span class="r-icon" style="background:linear-gradient(180deg,#ff6b6b,#e53935)">${icon('trash', 20)}</span>
        <span class="r-text" style="color:var(--red)">پاک کردن همه داده‌ها</span>
      </div>
    </div>
    <div class="empty" style="padding:20px 40px 40px;font-size:12px;opacity:.55">
      پیسفون نسخه ${APP_VERSION} — حجم: ${(JSON.stringify(state).length / 1024).toFixed(1)}KB
    </div>
  `;
}

/* ===================== RENDER: MESSAGES ===================== */
let activeChatId = null;
let replyToMsg = null;
let msgSearchQuery = '';
let msgSearchHits = [];
let msgSearchIndex = -1;

function highlightMatch(text, q) {
  if (!q) return esc(text);
  try {
    const re = new RegExp('(' + escRegex(q) + ')', 'ig');
    return esc(text).replace(re, '<span class="msg-highlight">$1</span>');
  } catch { return esc(text); }
}

function msgHTML(chat, m, prevMsg, nextMsg) {
  const isNew = !renderedMsgIds.has(m.id);
  renderedMsgIds.add(m.id);
  const animClass = isNew ? '' : ' no-anim';
  const aiClass = (chat.type === 'ai' && !m.out) ? ' ai' : '';
  const isHit = msgSearchHits.includes(m.id);
  const cls = `msg ${m.out ? 'out' : 'in'}${animClass}${aiClass}${isHit ? ' search-hit' : ''}`;

  let inner = '';

  if (m.replyTo) {
    const r = chat.messages.find(x => x.id === m.replyTo);
    if (r) {
      const nm = r.out ? 'شما' : (r.sender || chat.name);
      const tx = r.type === 'text' ? r.text : (r.type === 'voice' ? 'پیام صوتی' : 'پیوست');
      inner += `<div class="reply-quote"><b>${esc(nm)}</b><p>${esc(tx)}</p></div>`;
    }
  }

  if (chat.type === 'channel') {
    const chAv = avatarContent(chat);
    const chBg = avatarBgStyle(chat);
    inner += `<div class="ch-head">
      <div class="ch-av" style="${chBg}">${chAv}</div>
      <div class="ch-name">${esc(chat.name)}</div>
    </div>`;
  }

  if (chat.type === 'ai' && !m.out) {
    inner += `<div class="ai-label">${icon('sparkle', 12)} دستیار هوشمند</div>`;
  }

  if (m.type === 'photo') {
    if (m.dataUrl) {
      inner += `<div class="media" style="background:#000"><img src="${esc(m.dataUrl)}" alt="">` +
               (m.text ? `<div class="cap">${esc(m.text)}</div>` : '') + `</div>`;
    } else {
      const bg = m.bg || 'linear-gradient(135deg,#667eea,#764ba2)';
      inner += `<div class="media" style="background:${bg}">${icon('camera', 56)}` +
               (m.text ? `<div class="cap">${esc(m.text)}</div>` : '') + `</div>`;
    }
  } else if (m.type === 'location') {
    const bg = 'linear-gradient(135deg,#43cea2,#185a9d)';
    inner += `<div class="media" style="background:${bg}">${icon('location', 56)}` +
             (m.text ? `<div class="cap">${esc(m.text)}</div>` : '') + `</div>`;
  } else if (m.type === 'file') {
    inner += `<div class="filemsg">
        <div class="ficon">${icon('file', 22)}</div>
        <div class="fmeta"><span class="fname">${esc(m.text)}</span>
        <span class="fsize">${esc(m.size || '2.4 MB')}</span></div></div>`;
  } else if (m.type === 'voice') {
    const bars = Array.from({ length: 22 }, (_, i) =>
      `<i style="height:${7 + ((i * 13 + (m.dur || 3) * 7) % 16)}px"></i>`).join('');
    inner += `<div class="voice">
        <button class="vplay" data-play="${m.id}">${icon('play', 16)}</button>
        <div class="vwave">${bars}</div>
        <span class="vdur">${fmtDur(m.dur || 0)}</span></div>`;
  } else {
    inner += `<div class="btext">${highlightMatch(m.text, msgSearchQuery)}</div>`;
  }

  let ticks = '';
  if (m.out) {
    if (m.status === 'read') ticks = `<span class="ticks read">${icon('double-check', 15)}</span>`;
    else if (m.status === 'delivered') ticks = `<span class="ticks">${icon('double-check', 15)}</span>`;
    else ticks = `<span class="ticks">${icon('check', 15)}</span>`;
  }

  const msgInner = `${inner}<div class="meta"><span>${fmtTime(m.ts)}${m.edited ? ' ✎' : ''}</span>${ticks}</div>`;

  if (chat.type === 'group' && !m.out) {
    const senderName = m.sender || 'عضو';
    const sameSenderBefore = prevMsg && !prevMsg.out && prevMsg.sender === senderName;
    const sameSenderAfter = nextMsg && !nextMsg.out && nextMsg.sender === senderName;
    const member = (chat.membersList || []).find(x => x.name === senderName);
    const memberAv = member?.avatar || { type: 'gradient', value: 0 };
    const [c1, c2] = nameColorPair(senderName);
    const memberBg = `background:linear-gradient(135deg,${c1},${c2})`;
    const memberContent = memberAv.type === 'emoji' ? memberAv.value : initials(senderName);
    const showName = !sameSenderBefore;

    return `<div class="msg-group-row">
      <div class="msg-group-av${sameSenderAfter ? ' empty' : ''}" style="${memberBg}">${sameSenderAfter ? '' : memberContent}</div>
      <div class="msg-group-wrap">
        ${showName ? `<div class="msg-group-sender" style="color:${c1}">${esc(senderName)}</div>` : ''}
        <div class="${cls}" data-id="${m.id}">${msgInner}</div>
      </div>
    </div>`;
  }

  return `<div class="${cls}" data-id="${m.id}">${msgInner}</div>`;
}

function renderMessages(scroll = true) {
  const chat = getChat(activeChatId);
  const box = $('#messages');
  if (!chat) { box.innerHTML = ''; return; }

  box.setAttribute('data-chat-type', chat.type || 'private');

  if (!chat.messages.length) {
    const emptyHTML = chat.type === 'ai'
      ? `<div class="empty" style="margin:auto;padding:40px">
          ${icon('sparkle', 52)}
          <div class="ttl">دستیار هوشمند پیسفون</div>
          هر سوالی داری بپرس 👋
        </div>`
      : `<div class="empty" style="margin:auto;padding:40px">
          ${icon('chat-outline', 52)}
          <div class="ttl">شروع گفتگو</div>
          اولین پیامت رو بنویس
        </div>`;
    box.innerHTML = emptyHTML;
    return;
  }

  const all = chat.messages;
  const cap = 300;
  const startIdx = Math.max(0, all.length - cap);

  let html = '';
  if (startIdx > 0) {
    html += `<div class="day-sep"><span>${(startIdx).toLocaleString('fa-IR')} پیام قدیمی‌تر مخفی شده…</span></div>`;
  }

  let lastDay = '';
  for (let i = startIdx; i < all.length; i++) {
    const m = all[i];
    const d = dayKey(m.ts);
    if (d !== lastDay) {
      html += `<div class="day-sep"><span>${fmtDay(m.ts)}</span></div>`;
      lastDay = d;
    }
    const rawPrev = all[i - 1] || null;
    const rawNext = all[i + 1] || null;
    const prevAdj = (rawPrev && dayKey(rawPrev.ts) === dayKey(m.ts)) ? rawPrev : null;
    const nextAdj = (rawNext && dayKey(rawNext.ts) === dayKey(m.ts)) ? rawNext : null;
    html += msgHTML(chat, m, prevAdj, nextAdj);
  }

  if (chat.typing) {
    const typingClass = chat.type === 'ai' ? ' in typing ai-thinking' : ' in typing';
    if (chat.type === 'group' && chat.typingSender) {
      const member = (chat.membersList || []).find(x => x.name === chat.typingSender);
      const [c1, c2] = nameColorPair(chat.typingSender);
      const memberBg = `background:linear-gradient(135deg,${c1},${c2})`;
      const memberContent = member?.avatar?.type === 'emoji' ? member.avatar.value : initials(chat.typingSender);
      html += `<div class="msg-group-row">
        <div class="msg-group-av" style="${memberBg}">${memberContent}</div>
        <div class="msg-group-wrap">
          <div class="msg-group-sender" style="color:${c1}">${esc(chat.typingSender)}</div>
          <div class="msg${typingClass}"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
        </div>
      </div>`;
    } else {
      html += `<div class="msg${typingClass}"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
    }
  }

  box.innerHTML = html;
  if (scroll) requestAnimationFrame(() => { box.scrollTop = box.scrollHeight; });
}

function renderChatHeader() {
  const c = getChat(activeChatId);
  if (!c) return;
  const av = $('#chat-avatar');
  av.textContent = avatarContent(c);
  av.style.background = avatarBgStyle(c);
  if ((c.avatar || {}).type === 'image') {
    av.style.backgroundImage = `url("${safeUrlCss(c.avatar.value)}")`;
    av.style.backgroundSize = 'cover';
    av.style.backgroundPosition = 'center';
  }
  const nameEl = $('#chat-name');
  nameEl.innerHTML = nameWithVf(c.name, c.verified, 16);
  const statusEl = $('#chat-status');
  statusEl.textContent = chatStatus(c);
  statusEl.style.color = c.typing ? 'var(--green)' : '';
  if (c.type === 'group' || c.type === 'channel') {
    statusEl.classList.add('editable');
  } else {
    statusEl.classList.remove('editable');
  }
}

/* ===================== OPEN / CLOSE ===================== */
function openChat(id) {
  const c = getChat(id);
  if (!c) return;
  activeChatId = id;
  c.unread = 0;
  c.typing = false;
  c.typingSender = null;
  replyToMsg = null;
  hideReplyBar();
  closeMsgSearch();
  renderChatHeader();
  renderMessages();
  renderChatList();
  $('#screen-chat').classList.add('open');
  const input = $('#msg-input');
  input.value = c.draft || '';
  autoGrow();
  updateSendBtn();
  save();
}
function closeChat() {
  const c = getChat(activeChatId);
  if (c) c.draft = $('#msg-input').value || '';
  $('#screen-chat').classList.remove('open');
  activeChatId = null;
  replyToMsg = null;
  hideReplyBar();
  closeMsgSearch();
  renderChatList();
  save();
}

/* ===================== INFO ===================== */
let infoChatId = null;
function openInfo(id) {
  const c = getChat(id);
  if (!c) return;
  infoChatId = id;
  renderInfo();
  $('#screen-info').classList.add('open');
}
function closeInfo() {
  $('#screen-info').classList.remove('open');
  infoChatId = null;
}

function renderInfo() {
  const c = getChat(infoChatId);
  if (!c) return;
  const isGroupOrChannel = c.type === 'group' || c.type === 'channel';
  const username = c.username || '';
  const isPublic = !!c.isPublic;

  $('#info-title').textContent = c.type === 'channel' ? 'اطلاعات کانال'
    : c.type === 'group' ? 'اطلاعات گروه'
    : c.type === 'ai' ? 'دستیار هوشمند'
    : c.type === 'saved' ? 'پیام‌های ذخیره‌شده'
    : 'اطلاعات مخاطب';

  let badges = '';
  if (isGroupOrChannel) {
    badges += `<div class="info-badge ${isPublic ? 'public' : 'private'}" data-info-act="toggle-public">
      ${isPublic ? icon('globe', 14) + ' عمومی' : icon('lock', 14) + ' خصوصی'}
    </div>`;
  }
  if (c.verified) {
    badges += `<div class="info-badge verified">${icon('verified', 14)} تأیید شده</div>`;
  }

  let stats = '';
  if (isGroupOrChannel) {
    stats = `<div class="info-stat editable" data-info-act="edit-members">
      ${icon('users', 16)} <b>${(c.members || 0).toLocaleString('fa-IR')}</b> عضو
    </div>`;
  }
  if (c.type === 'private') {
    stats = `<div class="info-stat">${icon(c.online ? 'chat-outline' : 'phone', 16)} ${c.online ? 'آنلاین' : 'آخرین بازدید به تازگی'}</div>`;
  }
  if (c.type === 'ai') {
    stats = `<div class="info-stat">${icon(navigator.onLine ? 'sparkle' : 'chat-outline', 16)} ${navigator.onLine ? 'آنلاین — پاسخ هوشمند' : 'آفلاین — پاسخ آماده'}</div>`;
  }

  let membersList = '';
  if (c.type === 'group' && c.membersList && c.membersList.length) {
    membersList = `
      <div class="section-title">اعضای گروه (${c.membersList.length.toLocaleString('fa-IR')})</div>
      <div class="group">
        ${c.membersList.map((m) => {
          const av = m.avatar || { type: 'gradient', value: 0 };
          const [c1, c2] = nameColorPair(m.name);
          const bg = `background:linear-gradient(135deg,${c1},${c2})`;
          const content = av.type === 'emoji' ? av.value : initials(m.name);
          return `<div class="row" style="cursor:default">
            <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0;box-shadow:inset 0 1px 0 rgba(255,255,255,.25);${bg}">${content}</div>
            <span class="r-text" style="font-weight:600;color:${c1}">${esc(m.name)}</span>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  const usernameBlock = (isGroupOrChannel || c.type === 'private' || c.type === 'ai')
    ? (username
        ? `<div class="info-username" data-info-act="edit-username">@${esc(username)}</div>`
        : `<div class="info-username empty" data-info-act="edit-username">+ افزودن آیدی</div>`)
    : '';

  const settingsGroup = (isGroupOrChannel || c.type === 'private') ? `
    <div class="section-title">تنظیمات</div>
    <div class="group">
      <div class="row" data-info-act="edit-name">
        <span class="r-icon">${icon('edit', 20)}</span>
        <span class="r-text">نام</span>
        <span class="r-val">${esc(c.name)}</span>
        <span class="chev">${icon('chevron', 18)}</span>
      </div>
      <div class="row" data-info-act="edit-username">
        <span class="r-icon">${icon('user', 20)}</span>
        <span class="r-text">آیدی (یوزرنیم)</span>
        <span class="r-val">${username ? '@' + esc(username) : '—'}</span>
        <span class="chev">${icon('chevron', 18)}</span>
      </div>
      ${isGroupOrChannel ? `
        <div class="row" data-info-act="toggle-public">
          <span class="r-icon">${icon(isPublic ? 'globe' : 'lock', 20)}</span>
          <span class="r-text">نوع گروه/کانال</span>
          <span class="r-val">${isPublic ? 'عمومی' : 'خصوصی'}</span>
          <span class="chev">${icon('chevron', 18)}</span>
        </div>
        <div class="row" data-info-act="edit-members">
          <span class="r-icon">${icon('users', 20)}</span>
          <span class="r-text">تعداد اعضا</span>
          <span class="r-val">${(c.members || 0).toLocaleString('fa-IR')}</span>
          <span class="chev">${icon('chevron', 18)}</span>
        </div>
      ` : ''}
      <div class="row">
        <span class="r-icon" style="background:linear-gradient(180deg,#3aa0ff,#0a84ff)">${icon('verified', 20)}</span>
        <span class="r-text">تیک آبی</span>
        <label class="switch"><input type="checkbox" id="info-verified-sw" ${c.verified ? 'checked' : ''}>
        <span class="sl"></span></label>
      </div>
    </div>
  ` : '';

  $('#info-body').innerHTML = `
    <div class="info-hero">
      <div class="avatar big" id="info-avatar-btn" style="${avatarBgStyle(c)}">${avatarContent(c)}</div>
      <div class="info-name">${esc(c.name)}${c.verified ? vfHTML(22) : ''}</div>
      ${usernameBlock}
      ${badges ? `<div class="info-badges">${badges}</div>` : ''}
      ${stats}
    </div>
    ${settingsGroup}
    ${membersList}
    <div class="section-title">عملیات</div>
    <div class="group">
      <div class="row" data-info-act="toggle-mute">
        <span class="r-icon">${icon(c.muted ? 'bell' : 'bell-off', 20)}</span>
        <span class="r-text">${c.muted ? 'فعال کردن اعلان' : 'بی‌صدا کردن'}</span>
      </div>
      <div class="row" data-info-act="clear">
        <span class="r-icon">${icon('trash', 20)}</span>
        <span class="r-text">پاک کردن تاریخچه</span>
      </div>
      <div class="row" data-info-act="delete">
        <span class="r-icon" style="background:linear-gradient(180deg,#ff6b6b,#e53935)">${icon('trash', 20)}</span>
        <span class="r-text" style="color:var(--red)">حذف چت</span>
      </div>
    </div>
    <div class="empty" style="padding:20px 40px 40px;font-size:12px;opacity:.55">
      شناسه: ${esc(c.id)}<br>
      ساخته شده در ${new Date(c.createdAt || Date.now()).toLocaleDateString('fa-IR')}
    </div>
  `;

  const verifiedSw = $('#info-verified-sw');
  if (verifiedSw) {
    verifiedSw.addEventListener('change', () => {
      c.verified = verifiedSw.checked;
      renderInfo(); renderChatList(); renderChatHeader(); save();
      toast(c.verified ? 'تیک آبی فعال شد' : 'تیک آبی غیرفعال شد');
    });
  }
  $$('#info-body [data-info-act]').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.tagName === 'INPUT' || e.target.closest('label.switch')) return;
      handleInfoAction(el.dataset.infoAct, c);
    });
  });
  const avBtn = $('#info-avatar-btn');
  if (avBtn) {
    avBtn.addEventListener('click', () => {
      avatarTargetType = 'chat';
      avatarTarget = c.id;
      renderAvatarPicker('gradient');
      avatarOverlay.classList.add('show');
    });
  }
}

function handleInfoAction(act, c) {
  if (act === 'edit-name') {
    showPrompt('نام جدید', c.name, v => {
      if (!v.trim()) return;
      c.name = v.trim();
      renderInfo(); renderChatList(); renderChatHeader(); save();
      toast('نام تغییر کرد');
    });
    return;
  }
  if (act === 'edit-username') {
    showPrompt('آیدی (بدون @)', c.username || '', v => {
      let u = v.trim().replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
      if (!u || u.length < 3 || u.length > 32) { toast('حداقل ۳ کاراکتر'); return; }
      const dup = state.chats.find(x => x.id !== c.id && x.username === u);
      if (dup) { toast('این آیدی قبلاً گرفته شده'); return; }
      c.username = u;
      renderInfo(); save();
      toast('آیدی ذخیره شد: @' + u);
    });
    return;
  }
  if (act === 'toggle-public') {
    c.isPublic = !c.isPublic;
    renderInfo(); save();
    toast(c.isPublic ? 'عمومی شد' : 'خصوصی شد');
    return;
  }
  if (act === 'edit-members') {
    showPrompt('تعداد اعضا', String(c.members || 0), v => {
      const n = parseInt(v, 10);
      if (isNaN(n) || n < 0) { toast('عدد معتبر وارد کن'); return; }
      c.members = Math.min(n, 9999999);
      if (c.type === 'group' && Array.isArray(c.membersList)) {
        while (c.membersList.length < Math.min(c.members, 50)) {
          const used = new Set(c.membersList.map(x => x.name));
          const avail = GROUP_MEMBER_POOL.filter(p => !used.has(p.name));
          if (!avail.length) break;
          c.membersList.push({ ...avail[Math.floor(Math.random() * avail.length)] });
        }
      }
      renderInfo(); renderChatHeader(); renderChatList(); save();
      toast('تعداد اعضا تغییر کرد');
    });
    return;
  }
  if (act === 'toggle-mute') {
    c.muted = !c.muted;
    renderInfo(); save();
    toast(c.muted ? 'بی‌صدا شد' : 'اعلان فعال شد');
    return;
  }
  if (act === 'clear') {
    showConfirm('پاک کردن تاریخچه', 'همه پیام‌های این چت حذف شوند؟', () => {
      c.messages = [];
      renderMessages(); renderInfo(); renderChatList(); save();
      toast('تاریخچه پاک شد');
    });
    return;
  }
  if (act === 'delete') {
    showConfirm('حذف چت', 'کل این چت حذف شود؟', () => {
      state.chats = state.chats.filter(x => x.id !== c.id);
      state.contacts = state.contacts.filter(x => x.id !== c.id);
      closeInfo(); closeChat(); renderChatList(); renderContacts(); save();
      toast('چت حذف شد');
    });
    return;
  }
}

/* ===================== SEND ===================== */
function sendMessage(extra = {}, textOverride) {
  const chat = getChat(activeChatId);
  if (!chat) return;
  const input = $('#msg-input');
  const text = textOverride !== undefined ? textOverride : input.value.trim();
  if (!text && !extra.type) return;

  const m = Object.assign({
    id: rid(), text, out: true, ts: Date.now(),
    status: 'sent', type: 'text', replyTo: replyToMsg
  }, extra);

  chat.messages.push(m);
  if (textOverride === undefined) {
    input.value = '';
    chat.draft = '';
    autoGrow(); updateSendBtn();
  }
  replyToMsg = null; hideReplyBar();
  renderMessages();
  renderChatList();

  setTimeout(() => { m.status = 'delivered'; if (activeChatId === chat.id) renderMessages(false); save(); }, 600);
  setTimeout(() => { m.status = 'read'; if (activeChatId === chat.id) renderMessages(false); save(); }, 1700);

  if (chat.type === 'ai') {
    if (state.settings.aiMode && navigator.onLine) scheduleAIReply(chat, m.text);
    else scheduleReply(chat);
    return;
  }
  if (state.settings.autoReply && chat.type !== 'saved' && chat.type !== 'channel') {
    if (state.settings.aiMode && navigator.onLine) scheduleAIReply(chat, m.text);
    else scheduleReply(chat);
  }
}

/* ===================== AI REPLY ===================== */
async function scheduleAIReply(chat, userMsg) {
  const c = getChat(chat.id);
  if (!c) return;
  await new Promise(r => setTimeout(r, 500 + Math.random() * 600));

  if (chat.type === 'group') {
    const members = c.membersList || [];
    if (!members.length) return;
    const numRepliers = Math.random() > 0.5 ? 2 : 1;
    const shuffled = members.slice().sort(() => Math.random() - 0.5);
    const repliers = shuffled.slice(0, Math.min(numRepliers, members.length));

    for (let i = 0; i < repliers.length; i++) {
      const member = repliers[i];
      if (i > 0) await new Promise(r => setTimeout(r, 1400 + Math.random() * 1800));
      c.typing = true;
      c.typingSender = member.name;
      if (activeChatId === c.id) { renderChatHeader(); renderMessages(); }
      save();
      const history = c.messages.filter(x => x.type === 'text').slice(-6).map(x => ({ out: x.out, text: x.text, sender: x.sender }));
      const memberPrompt = `تو الان نقش «${member.name}» رو داری، یکی از اعضای گروه چت دوستانه «${c.name}» هستی. جواب‌ها رو کوتاه (حداکثر ۲ خط)، فارسی خودمونی و دوستانه بده. از ایموجی به‌اندازه استفاده کن.`;
      let replyText = await fetchAIReply(userMsg, history, memberPrompt);
      if (!replyText) replyText = ['😄','👌','موافقم','دمت گرم','باشه حتماً','چه جالب!','منم همینطور','عالیه!','😂','🚀'][Math.floor(Math.random() * 10)];
      c.typing = false;
      c.typingSender = null;
      c.messages.push({ id: rid(), text: replyText, out: false, ts: Date.now(), type: 'text', replyTo: null, sender: member.name });
      if (activeChatId !== c.id) c.unread = (c.unread || 0) + 1;
      if (activeChatId === c.id) { renderChatHeader(); renderMessages(); }
      renderChatList(); save();
      if (state.settings.sounds) beep();
      notifyIncoming(c, member.name + ': ' + replyText);
    }
    return;
  }

  c.typing = true;
  if (activeChatId === c.id) { renderChatHeader(); renderMessages(); }
  save();
  const history = c.messages.filter(x => x.type === 'text').slice(-8, -1);
  let replyText = await fetchAIReply(userMsg, history);
  if (!replyText) {
    replyText = REPLIES[Math.floor(Math.random() * REPLIES.length)];
    if (chat.type === 'ai') replyText = '⚠️ اتصال به هوش مصنوعی ممکن نشد.\n' + replyText;
  }
  c.typing = false;
  c.messages.push({ id: rid(), text: replyText, out: false, ts: Date.now(), type: 'text', replyTo: null, sender: null });
  if (activeChatId !== c.id) c.unread = (c.unread || 0) + 1;
  if (activeChatId === c.id) { renderChatHeader(); renderMessages(); }
  renderChatList(); save();
  if (state.settings.sounds) beep();
  notifyIncoming(c, replyText);
}

const REPLIES = ['باشه 👍','چه جالب!','الان چک می‌کنم','مرسی 🙏','کاملاً موافقم','بعداً حرف می‌زنیم','عالیه!','دقیقاً','ممنون از پیامت','می‌شه بیشتر توضیح بدی؟','حتماً چشم','من هم همین فکر رو می‌کردم','خبر خوبیه!','🤔','😄'];

function scheduleReply(chat) {
  setTimeout(() => {
    const c = getChat(chat.id);
    if (!c) return;
    c.typing = true;
    if (activeChatId === c.id) { renderChatHeader(); renderMessages(); }
    save();
    setTimeout(() => {
      c.typing = false;
      const isGroup = c.type === 'group';
      let sender = null;
      if (isGroup && c.membersList?.length) {
        const member = c.membersList[Math.floor(Math.random() * c.membersList.length)];
        sender = member.name;
        c.typingSender = null;
      }
      const replyText = REPLIES[Math.floor(Math.random() * REPLIES.length)];
      c.messages.push({ id: rid(), text: replyText, out: false, ts: Date.now(), type: 'text', replyTo: null, sender });
      if (activeChatId !== c.id) c.unread = (c.unread || 0) + 1;
      if (activeChatId === c.id) { renderChatHeader(); renderMessages(); }
      renderChatList(); save();
      if (state.settings.sounds) beep();
      notifyIncoming(c, replyText);
    }, 900 + Math.random() * 1400);
  }, 800 + Math.random() * 1400);
}

/* ===================== BEEP ===================== */
let audioCtx = null;
function beep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = 880; o.type = 'sine';
    g.gain.setValueAtTime(0.001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    o.start(); o.stop(audioCtx.currentTime + 0.26);
  } catch {}
}

/* ===================== COMPOSER ===================== */
const inputEl = $('#msg-input');
const sendBtn = $('#btn-send');
function autoGrow() {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
}
function updateSendBtn() {
  const has = inputEl.value.trim().length > 0;
  sendBtn.innerHTML = has ? icon('send', 22) : icon('mic', 22);
}
inputEl.addEventListener('input', () => {
  autoGrow(); updateSendBtn();
  const c = getChat(activeChatId);
  if (c) { c.draft = inputEl.value; save(); }
});
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey && state.settings.enterToSend && window.innerWidth > 820) {
    e.preventDefault(); sendMessage();
  }
});

let sendBtnPointerDown = false;
let sendBtnClickFired = false;
sendBtn.addEventListener('click', e => {
  if (sendBtnClickFired) { sendBtnClickFired = false; return; }
  if (inputEl.value.trim()) sendMessage();
});
sendBtn.addEventListener('pointerdown', e => {
  if (inputEl.value.trim()) return;
  sendBtnPointerDown = true;
  e.preventDefault();
  startRec();
});
document.addEventListener('pointerup', () => {
  if (!sendBtnPointerDown) return;
  sendBtnPointerDown = false;
  sendBtnClickFired = true;
  setTimeout(() => { sendBtnClickFired = false; }, 200);
  if (recActive) stopRec(false);
});
document.addEventListener('pointercancel', () => {
  if (!sendBtnPointerDown) return;
  sendBtnPointerDown = false;
  if (recActive) stopRec(true);
});

/* ===================== VOICE ===================== */
let recInterval = null, recStart = 0, recActive = false;
let mediaRecorder = null, chunks = [], stream = null;

async function startRec() {
  recActive = true;
  recStart = Date.now();
  chunks = [];
  $('#composer').style.display = 'none';
  $('#rec-bar').classList.add('show');
  $('#rec-time').textContent = '0:00';

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus'
              : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm'
              : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4'
              : '';
    mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    mediaRecorder.ondataavailable = ev => { if (ev.data.size > 0) chunks.push(ev.data); };
    mediaRecorder.start();
  } catch (err) {
    toast('دسترسی به میکروفون داده نشد');
    recActive = false;
    $('#composer').style.display = 'flex';
    $('#rec-bar').classList.remove('show');
    return;
  }

  recInterval = setInterval(() => {
    const s = (Date.now() - recStart) / 1000;
    $('#rec-time').textContent = fmtDur(s);
    if (s > 60) stopRec(false);
  }, 100);
}

function stopRec(cancel) {
  if (!recActive) return;
  recActive = false;
  clearInterval(recInterval);
  $('#rec-bar').classList.remove('show');
  $('#composer').style.display = 'flex';

  const dur = (Date.now() - recStart) / 1000;
  const cleanup = () => {
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    mediaRecorder = null;
  };

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      cleanup();
      if (cancel || dur < 0.8) { toast('ضبط لغو شد'); return; }
      const reader = new FileReader();
      reader.onload = () => {
        sendMessage({
          type: 'voice',
          dur: Math.round(dur * 10) / 10,
          dataUrl: reader.result,
          size: fmtBytes(blob.size)
        }, '');
        toast('پیام صوتی ارسال شد');
      };
      reader.readAsDataURL(blob);
    };
    try { mediaRecorder.stop(); } catch { cleanup(); }
  } else {
    cleanup();
    if (!cancel && dur >= 0.8) toast('ضبط صدا ممکن نشد');
  }
}
$('#rec-cancel').addEventListener('click', () => stopRec(true));

/* ===================== REPLY BAR ===================== */
function showReplyBar(m) {
  replyToMsg = m.id;
  const chat = getChat(activeChatId);
  $('#rb-name').textContent = m.out ? 'شما' : (m.sender || chat.name);
  $('#rb-text').textContent = m.type === 'text' ? m.text : 'پیوست';
  $('#reply-bar').classList.add('show');
  inputEl.focus();
}
function hideReplyBar() {
  replyToMsg = null;
  $('#reply-bar').classList.remove('show');
}
$('#rb-close').addEventListener('click', hideReplyBar);

/* ===================== VOICE PLAYBACK ===================== */
let currentAudio = null;
let currentAudioBtn = null;

$('#messages').addEventListener('click', e => {
  const btn = e.target.closest('.vplay');
  if (!btn) return;
  const msgEl = btn.closest('.msg');
  const id = msgEl.dataset.id;
  const chat = getChat(activeChatId);
  const m = chat.messages.find(x => x.id === id);
  if (!m) return;

  if (currentAudio && currentAudioBtn === btn) {
    if (currentAudio.paused) {
      currentAudio.play().catch(() => {});
      btn.innerHTML = icon('pause', 16);
      btn.classList.add('playing');
    } else {
      currentAudio.pause();
      btn.innerHTML = icon('play', 16);
      btn.classList.remove('playing');
    }
    return;
  }

  if (currentAudio) {
    try { currentAudio.pause(); } catch {}
    if (currentAudioBtn) {
      currentAudioBtn.innerHTML = icon('play', 16);
      currentAudioBtn.classList.remove('playing');
      const prevMsgEl = currentAudioBtn.closest('.msg');
      if (prevMsgEl) prevMsgEl.querySelectorAll('.vwave i').forEach(b => b.style.animation = '');
    }
  }

  if (m.dataUrl) {
    currentAudio = new Audio(m.dataUrl);
    currentAudioBtn = btn;
    btn.innerHTML = icon('pause', 16);
    btn.classList.add('playing');
    const bars = msgEl.querySelectorAll('.vwave i');
    bars.forEach((b, i) => b.style.animation = `vpulse .45s ${i * 0.04}s infinite alternate`);

    const stopAnim = () => {
      btn.innerHTML = icon('play', 16);
      btn.classList.remove('playing');
      bars.forEach(b => b.style.animation = '');
      currentAudio = null;
      currentAudioBtn = null;
    };
    currentAudio.onended = stopAnim;
    currentAudio.onerror = stopAnim;
    currentAudio.play().catch(stopAnim);
    return;
  }

  btn.dataset.playing = '1';
  btn.innerHTML = icon('pause', 16);
  btn.classList.add('playing');
  const bars = msgEl.querySelectorAll('.vwave i');
  bars.forEach((b, i) => b.style.animation = `vpulse .45s ${i * 0.04}s infinite alternate`);
  setTimeout(() => {
    btn.dataset.playing = '0';
    btn.innerHTML = icon('play', 16);
    btn.classList.remove('playing');
    bars.forEach(b => b.style.animation = '');
  }, (m.dur || 3) * 1000);
});

/* ===================== LONG PRESS MESSAGE ===================== */
let pressTimer = null, pressStart = null, pressedMsgEl = null;
$('#messages').addEventListener('pointerdown', e => {
  const el = e.target.closest('.msg');
  if (!el || el.classList.contains('typing')) return;
  pressStart = { x: e.clientX, y: e.clientY };
  pressedMsgEl = el;
  pressTimer = setTimeout(() => {
    if (pressedMsgEl) {
      if (navigator.vibrate) navigator.vibrate(15);
      showMsgMenu(pressedMsgEl);
    }
    pressTimer = null;
    pressStart = null;
  }, 450);
});
$('#messages').addEventListener('pointermove', e => {
  if (!pressStart) return;
  if (Math.abs(e.clientX - pressStart.x) > 8 || Math.abs(e.clientY - pressStart.y) > 8) {
    clearTimeout(pressTimer); pressTimer = null; pressStart = null;
  }
});
['pointerup', 'pointercancel'].forEach(ev =>
  $('#messages').addEventListener(ev, () => {
    clearTimeout(pressTimer); pressTimer = null; pressStart = null;
  }));

function showMsgMenu(el) {
  const chat = getChat(activeChatId);
  const m = chat.messages.find(x => x.id === el.dataset.id);
  if (!m) return;
  el.classList.add('selected');
  setTimeout(() => el.classList.remove('selected'), 400);
  let items = `<div class="sheet-item" data-mact="reply">${icon('reply')}پاسخ</div>`;
  if (m.type === 'text') items += `<div class="sheet-item" data-mact="copy">${icon('copy')}کپی</div>`;
  if (m.out && m.type === 'text') items += `<div class="sheet-item" data-mact="edit">${icon('edit')}ویرایش</div>`;
  items += `<div class="sheet-item" data-mact="forward">${icon('forward')}هدایت</div>`;
  items += `<div class="sheet-item danger" data-mact="delete">${icon('trash')}حذف</div>`;
  openSheet(`<div class="sheet-title">پیام</div>${items}`);
  $$('#sheet-content [data-mact]').forEach(btn => btn.addEventListener('click', () => {
    const act = btn.dataset.mact;
    closeSheet();
    setTimeout(() => handleMsgAction(act, chat, m), 120);
  }));
}

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      resolve();
    } catch (e) { reject(e); }
  });
}

function handleMsgAction(act, chat, m) {
  if (act === 'reply') { showReplyBar(m); return; }
  if (act === 'copy') {
    const t = m.text || '';
    copyToClipboard(t).then(() => toast('کپی شد'), () => toast('کپی نشد'));
    return;
  }
  if (act === 'edit') {
    showPrompt('ویرایش پیام', m.text, val => {
      if (!val.trim()) return;
      m.text = val.trim(); m.edited = true;
      renderMessages(false); save(); toast('ویرایش شد');
    });
    return;
  }
  if (act === 'forward') {
    if (!state.chats.length) { toast('چتی برای هدایت نیست'); return; }
    openSheet(`<div class="sheet-title">هدایت به…</div>` +
      state.chats.map(c => `<div class="sheet-item" data-fwd="${c.id}">
        ${avatarHTML(c, 38)}${esc(c.name)}</div>`).join(''));
    $$('#sheet-content [data-fwd]').forEach(b => b.addEventListener('click', () => {
      const target = getChat(b.dataset.fwd);
      target.messages.push({
        id: rid(), text: m.text, out: true, ts: Date.now(),
        status: 'sent', type: m.type, replyTo: null,
        dur: m.dur, bg: m.bg, size: m.size, dataUrl: m.dataUrl,
        forwarded: true, originalSender: m.sender || null
      });
      closeSheet(); renderChatList(); save();
      toast('هدایت شد به ' + target.name);
    }));
    return;
  }
  if (act === 'delete') {
    showConfirm('حذف پیام', 'این پیام برای همیشه حذف شود؟', () => {
      chat.messages = chat.messages.filter(x => x.id !== m.id);
      renderMessages(false); renderChatList(); save(); toast('حذف شد');
    });
  }
}

/* ===================== LONG PRESS CHAT LIST ===================== */
let chatPressTimer = null, chatPressStart = null, pressedChatItem = null;
let chatLongPressFired = false;

$('#chat-list').addEventListener('pointerdown', e => {
  const item = e.target.closest('.chat-item');
  if (!item) return;
  chatPressStart = { x: e.clientX, y: e.clientY };
  pressedChatItem = item;
  chatLongPressFired = false;
  chatPressTimer = setTimeout(() => {
    if (pressedChatItem) {
      chatLongPressFired = true;
      if (navigator.vibrate) navigator.vibrate(20);
      showChatListMenu(pressedChatItem.dataset.id);
    }
    chatPressTimer = null;
    chatPressStart = null;
  }, 450);
});
$('#chat-list').addEventListener('pointermove', e => {
  if (!chatPressStart) return;
  if (Math.abs(e.clientX - chatPressStart.x) > 8 || Math.abs(e.clientY - chatPressStart.y) > 8) {
    clearTimeout(chatPressTimer); chatPressTimer = null; chatPressStart = null;
  }
});
['pointerup', 'pointercancel'].forEach(ev =>
  $('#chat-list').addEventListener(ev, () => {
    clearTimeout(chatPressTimer); chatPressTimer = null; chatPressStart = null;
  }));

function showChatListMenu(id) {
  const c = getChat(id);
  if (!c) return;

  let items = '';
  items += `<div class="sheet-item" data-clact="open">${icon('chat-outline')}باز کردن</div>`;
  if (c.type !== 'ai' && c.type !== 'saved') {
    items += `<div class="sheet-item" data-clact="verified">${icon('verified')}${c.verified ? 'برداشتن تیک آبی' : 'دادن تیک آبی'}</div>`;
  }
  items += `<div class="sheet-item" data-clact="pin">${icon('pin')}${c.pinned ? 'برداشتن سنجاق' : 'سنجاق کردن'}</div>`;
  items += `<div class="sheet-item" data-clact="mute">${icon(c.muted ? 'bell' : 'bell-off')}${c.muted ? 'فعال کردن اعلان' : 'بی‌صدا کردن'}</div>`;
  items += `<div class="sheet-item" data-clact="info">${icon('user')}اطلاعات</div>`;
  items += `<div class="sheet-item" data-clact="read">${icon('check')}خوانده‌شده علامت بزن</div>`;
  items += `<div class="sheet-item danger" data-clact="delete">${icon('trash')}حذف</div>`;

  openSheet(`<div class="sheet-title">${esc(c.name)}</div>${items}`);

  $$('#sheet-content [data-clact]').forEach(b => b.addEventListener('click', () => {
    const act = b.dataset.clact;
    closeSheet();
    setTimeout(() => handleChatListAction(act, c), 120);
  }));
}

function handleChatListAction(act, c) {
  if (act === 'open') { openChat(c.id); return; }
  if (act === 'verified') {
    c.verified = !c.verified;
    toast(c.verified ? 'تیک آبی داده شد' : 'تیک آبی برداشته شد');
    renderChatList(); save();
    return;
  }
  if (act === 'pin') {
    c.pinned = !c.pinned;
    toast(c.pinned ? 'سنجاق شد' : 'برداشته شد');
    renderChatList(); save();
    return;
  }
  if (act === 'mute') {
    c.muted = !c.muted;
    toast(c.muted ? 'بی‌صدا شد' : 'اعلان فعال شد');
    renderChatList(); save();
    return;
  }
  if (act === 'info') { openInfo(c.id); return; }
  if (act === 'read') {
    c.unread = 0;
    renderChatList(); save();
    toast('خوانده‌شده علامت خورد');
    return;
  }
  if (act === 'delete') {
    showConfirm('حذف گفتگو', 'کل این گفتگو حذف شود؟', () => {
      state.chats = state.chats.filter(x => x.id !== c.id);
      state.contacts = state.contacts.filter(x => x.id !== c.id);
      renderChatList(); renderContacts(); save();
      toast('حذف شد');
    });
    return;
  }
}

/* ===================== OVERLAYS ===================== */
const sheetOverlay = $('#sheet-overlay');
const emojiOverlay = $('#emoji-overlay');
const avatarOverlay = $('#avatar-overlay');
const modalOverlay = $('#modal');

function openSheet(html) {
  $('#sheet-content').innerHTML = html;
  sheetOverlay.classList.add('show');
}
function closeSheet() { sheetOverlay.classList.remove('show'); }
sheetOverlay.addEventListener('click', e => { if (e.target === sheetOverlay) closeSheet(); });

/* ===================== AVATAR PICKER ===================== */
let avatarTarget = null;
let avatarTargetType = null;

function renderAvatarPicker(tab = 'gradient') {
  const entity = getAvatarEntity();
  if (!entity) return;
  const current = entity.avatar || { type: 'gradient', value: 0 };
  let body = '';
  if (tab === 'gradient') {
    const curVal = (typeof current.value === 'number') ? current.value : 0;
    body = `<div class="av-grid">` +
      AV_GRADS.map((g, i) => {
        const sel = current.type === 'gradient' && curVal === i ? ' sel' : '';
        return `<button class="av-color${sel}" data-grad="${i}" style="background:linear-gradient(135deg,${g[0]},${g[1]})"></button>`;
      }).join('') + `</div>`;
  } else if (tab === 'emoji') {
    body = `<div class="av-grid" style="grid-template-columns:repeat(6,1fr)">` +
      AV_EMOJIS.map(e => {
        const sel = current.type === 'emoji' && current.value === e ? ' sel' : '';
        return `<button class="${sel}" data-emo="${e}" style="font-size:24px">${e}</button>`;
      }).join('') + `</div>`;
  } else if (tab === 'image') {
    body = `<div class="av-upload" id="av-upload-btn">${icon('camera', 22)} انتخاب عکس از گالری</div>
    <div style="text-align:center;font-size:12px;color:var(--text-3);padding:14px 20px 4px;line-height:1.6">تصویر به صورت خودکار کوچک می‌شود<br>و فقط روی همین دستگاه ذخیره می‌شود</div>`;
  }
  $('#avatar-panel').innerHTML = `
    <div class="av-tabs">
      <button data-avtab="gradient" class="${tab === 'gradient' ? 'active' : ''}">${icon('palette', 20)}رنگ</button>
      <button data-avtab="emoji" class="${tab === 'emoji' ? 'active' : ''}">${icon('smile', 20)}ایموجی</button>
      <button data-avtab="image" class="${tab === 'image' ? 'active' : ''}">${icon('image', 20)}تصویر</button>
    </div>
    <div class="av-preview"><div class="avatar" style="${avatarBgStyle(entity)}">${avatarContent(entity)}</div></div>
    <div class="av-section">${body}</div>
  `;
  $$('#avatar-panel [data-avtab]').forEach(b => b.addEventListener('click', () => renderAvatarPicker(b.dataset.avtab)));
  $$('#avatar-panel [data-grad]').forEach(b => b.addEventListener('click', () => {
    const idx = parseInt(b.dataset.grad, 10);
    entity.avatar = { type: 'gradient', value: idx };
    applyAvatarChange();
    renderAvatarPicker('gradient');
  }));
  $$('#avatar-panel [data-emo]').forEach(b => b.addEventListener('click', () => {
    entity.avatar = { type: 'emoji', value: b.dataset.emo };
    applyAvatarChange();
    renderAvatarPicker('emoji');
  }));
  const upBtn = $('#av-upload-btn');
  if (upBtn) upBtn.addEventListener('click', pickImage);
}
function getAvatarEntity() {
  if (avatarTargetType === 'me') return state.me;
  if (avatarTargetType === 'chat') return getChat(avatarTarget);
  if (avatarTargetType === 'contact') return state.contacts.find(c => c.id === avatarTarget);
  return null;
}
function pickImage() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    resizeImage(f, 320, dataUrl => {
      const entity = getAvatarEntity();
      if (!entity) return;
      entity.avatar = { type: 'image', value: dataUrl };
      applyAvatarChange();
    });
  };
  inp.click();
}
function resizeImage(file, maxSize, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      const ratio = Math.min(maxSize / w, maxSize / h, 1);
      w = Math.round(w * ratio); h = Math.round(h * ratio);
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      cb(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}
function applyAvatarChange() {
  save();
  if (avatarTargetType === 'me') { renderSettings(); renderChatList(); }
  else if (avatarTargetType === 'chat') {
    renderChatList();
    if (activeChatId === avatarTarget) renderChatHeader();
    if (infoChatId === avatarTarget) renderInfo();
  } else if (avatarTargetType === 'contact') renderContacts();
  toast('ذخیره شد');
}
function openAvatarPicker(targetType, targetId) {
  avatarTargetType = targetType;
  avatarTarget = targetId;
  renderAvatarPicker('gradient');
  avatarOverlay.classList.add('show');
}
function closeAvatarPicker() { avatarOverlay.classList.remove('show'); }
avatarOverlay.addEventListener('click', e => { if (e.target === avatarOverlay) closeAvatarPicker(); });

/* ===================== EMOJI ===================== */
const EMOJI_CATEGORIES = {
  smileys: { name: 'شکلک‌ها', icon: '😀', emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','☺️','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥺','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥱','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'] },
  gestures: { name: 'اشاره‌ها', icon: '👍', emojis: ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦵','🦿','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄','💋'] },
  hearts: { name: 'قلب', icon: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','💌','💋','😍','🥰','😘','💑','💏','💐','🌹','🌷','🌺','🌸','🎁','✨','💫','⭐','🌟','🌙','☀️','🌈'] },
  animals: { name: 'حیوانات', icon: '🐶', emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🕷️','🐢','🐍','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🐘','🦛','🦏','🐪','🐫','🦒','🐕','🐈','🐓','🦃','🦚','🦜','🦢','🕊️','🐇','🦝','🦔'] },
  food: { name: 'غذا', icon: '🍔', emojis: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🌽','🥕','🥔','🥐','🍞','🥖','🥨','🧀','🥚','🍳','🥞','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🥪','🥙','🌮','🌯','🥗','🥘','🍝','🍜','🍲','🍛','🍣','🍱','🍤','🍙','🍚','🍘','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🍯','🥛','🍼','☕','🍵','🍺','🍻','🥂','🍷','🍸','🍹','🍾'] },
  travel: { name: 'سفر', icon: '✈️', emojis: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🚚','🚛','🚜','🚲','🛵','🏍️','🚨','🚔','🚘','🚖','🚡','🚠','🚃','🚄','🚅','🚂','🚆','🚇','🚊','🚉','✈️','🛫','🛬','💺','🛰️','🚀','🛸','🚁','⛵','🚤','🛳️','⛴️','🚢','⚓','⛽','🚧','🚦','🗺️','🗿','🗽','🗼','🏰','🏯','🎡','🎢','🎠','⛲','🏖️','🏝️','🌋','⛰️','🏔️','🏕️','⛺','🏠','🏡','🏢','🏬','🏥','🏦','🏨','🏪','🏫','💒','⛪','🕌','🌅','🌄','🌇','🌆','🌃','🌉'] },
  activities: { name: 'ورزش', icon: '⚽', emojis: ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸','🏒','🏑','🏏','⛳','🏹','🎣','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🎿','⛷️','🏂','🏋️','🤼','🤸','⛹️','🤺','🤾','🏌️','🏇','🧘','🏄','🏊','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🎫','🎪','🤹','🎭','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🎻','🎲','🎯','🎳','🎮','🎰','🧩'] },
  objects: { name: 'اشیا', icon: '💡', emojis: ['⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','💽','💾','💿','📀','📷','📸','📹','🎥','📞','☎️','📟','📠','📺','📻','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯️','💸','💵','💴','💶','💷','💰','💳','💎','⚖️','🔧','🔨','🛠️','🔩','⚙️','🧱','⛓️','🧲','🔫','💣','🧨','🔪','🗡️','⚔️','🛡️','🏺','🔮','📿','🧿','💈','🔭','🔬','🩹','🩺','💊','💉','🧬','🦠','🧪','🧹','🧺','🧻','🚽','🚰','🚿','🛁','🧼','🪥','🪒','🧽','🧴','🔑','🗝️','🚪','🪑','🛋️','🛏️','🧸','🖼️','🛍️','🛒','🎁','🎈','🎀','🎊','🎉','🏮','✉️','📩','📨','📧','💌','📥','📤','📦','📜','📃','📄','📑','🧾','📊','📈','📉','📆','📅','🗑️','📋','📁','📂','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🔗','📎','📐','📏','📌','📍','✂️','🖊️','🖋️','✒️','🖌️','🖍️','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓'] },
  symbols: { name: 'نمادها', icon: '💯', emojis: ['☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🚹','🚺','🚼','🚻','🚮','🎦','📶','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢','#️⃣','*️⃣','▶️','⏸️','⏯️','⏹️','⏺️','⏭️','⏮️','⏩','⏪','⏫','⏬','🔼','🔽','➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↪️','↩️','⤴️','⤵️','🔀','🔁','🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖️','♾️','💲','💱','™️','©️','®️','〰️','➰','➿','🔚','🔙','🔛','🔝','🔜','✔️','☑️','🔘','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔺','🔻','🔸','🔹','🔶','🔷','🔳','🔲','▪️','▫️','◾','◽','◼️','◻️','🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','🟫','🔈','🔇','🔉','🔊','🔔','🔕','📣','📢','💬','💭','🗯️','♠️','♣️','♦️','🃏','🎴','🀄','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛'] },
  flags: { name: 'پرچم‌ها', icon: '🏁', emojis: ['🏁','🚩','🎌','🏴','🏳️','🏳️‍🌈','🏴‍☠️','🇮🇷','🇺🇸','🇬🇧','🇫🇷','🇩🇪','🇮🇹','🇪🇸','🇷🇺','🇨🇳','🇯🇵','🇰🇷','🇮🇳','🇹🇷','🇸🇦','🇦🇪','🇮🇶','🇵🇰','🇦🇫','🇪🇬','🇧🇷','🇨🇦','🇦🇺','🇲🇽','🇳🇱','🇧🇪','🇸🇪','🇳🇴','🇩🇰','🇫🇮','🇵🇱','🇺🇦','🇬🇷','🇵🇹','🇨🇭','🇦🇹','🇮🇪','🇳🇿','🇿🇦','🇦🇷','🇨🇱','🇨🇴','🇵🇪','🇻🇪','🇺🇾','🇵🇾','🇧🇴','🇪🇨'] }
};

let emojiActiveCat = 'smileys';
function openEmoji() {
  if (!$('#emoji-panel').innerHTML) renderEmojiPanel();
  emojiOverlay.classList.add('show');
}
function renderEmojiPanel() {
  const cats = Object.keys(EMOJI_CATEGORIES);
  const panel = $('#emoji-panel');
  panel.innerHTML = `
    <div class="emoji-cats" id="emoji-cats">
      ${cats.map(k => `
        <button data-cat="${k}" class="${k === emojiActiveCat ? 'active' : ''}">
          ${EMOJI_CATEGORIES[k].icon}
        </button>`).join('')}
    </div>
    <div class="emoji-scroll" id="emoji-scroll">
      <div class="cat-title" id="emoji-cat-title">${EMOJI_CATEGORIES[emojiActiveCat].name}</div>
      <div class="emoji-grid" id="emoji-grid">
        ${EMOJI_CATEGORIES[emojiActiveCat].emojis.map(e => `<button data-emoji="${e}">${e}</button>`).join('')}
      </div>
    </div>
  `;
  $$('#emoji-cats [data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      emojiActiveCat = btn.dataset.cat;
      $$('#emoji-cats [data-cat]').forEach(b =>
        b.classList.toggle('active', b.dataset.cat === emojiActiveCat));
      const scroll = $('#emoji-scroll');
      scroll.innerHTML = `
        <div class="cat-title">${EMOJI_CATEGORIES[emojiActiveCat].name}</div>
        <div class="emoji-grid">
          ${EMOJI_CATEGORIES[emojiActiveCat].emojis.map(e => `<button data-emoji="${e}">${e}</button>`).join('')}
        </div>
      `;
      scroll.scrollTop = 0;
      bindEmojiClicks(scroll);
    });
  });
  bindEmojiClicks($('#emoji-scroll'));
}
function bindEmojiClicks(scope) {
  $$('[data-emoji]', scope).forEach(b => {
    b.addEventListener('click', () => {
      inputEl.value += b.dataset.emoji;
      autoGrow(); updateSendBtn();
      const c = getChat(activeChatId);
      if (c) { c.draft = inputEl.value; save(); }
    });
  });
}
$('#btn-emoji').addEventListener('click', openEmoji);
emojiOverlay.addEventListener('click', e => { if (e.target === emojiOverlay) emojiOverlay.classList.remove('show'); });

/* ===================== ATTACH ===================== */
$('#btn-attach').addEventListener('click', () => {
  openSheet(`
    <div class="sheet-title">پیوست</div>
    <div class="sheet-item" data-att="photo">${icon('camera')}عکس</div>
    <div class="sheet-item" data-att="file">${icon('file')}فایل</div>
    <div class="sheet-item" data-att="location">${icon('location')}موقعیت مکانی</div>
  `);
  $$('#sheet-content [data-att]').forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.att;
    closeSheet();
    setTimeout(() => {
      if (t === 'photo') pickPhotoForMessage();
      if (t === 'file') sendMessage({ type: 'file', text: 'document.pdf', size: '1.8 MB' }, '');
      if (t === 'location') {
        if (!navigator.geolocation) {
          sendMessage({ type: 'location', text: 'موقعیت من' }, '');
          return;
        }
        navigator.geolocation.getCurrentPosition(
          pos => {
            const { latitude, longitude } = pos.coords;
            sendMessage({
              type: 'location',
              text: `موقعیت من\n${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            }, '');
          },
          () => sendMessage({ type: 'location', text: 'موقعیت من' }, ''),
          { timeout: 5000 }
        );
      }
    }, 150);
  }));
});

function pickPhotoForMessage() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    resizeImage(f, 1080, dataUrl => {
      sendMessage({
        type: 'photo',
        text: '',
        dataUrl,
        size: fmtBytes(f.size)
      }, '');
    });
  };
  inp.click();
}

/* ===================== CHAT MENU ===================== */
$('#btn-chat-menu').addEventListener('click', () => {
  const c = getChat(activeChatId);
  if (!c) return;
  const memberItem = (c.type === 'group' || c.type === 'channel')
    ? `<div class="sheet-item" data-cact="members">${icon('users')}تعداد اعضا (${(c.members || 0).toLocaleString('fa-IR')})</div>`
    : '';
  openSheet(`
    <div class="sheet-title">${esc(c.name)}</div>
    <div class="sheet-item" data-cact="info">${icon('user')}اطلاعات چت</div>
    <div class="sheet-item" data-cact="avatar">${icon('image')}تنظیم پروفایل</div>
    <div class="sheet-item" data-cact="verified">${icon('verified')}${c.verified ? 'برداشتن تیک آبی' : 'دادن تیک آبی'}</div>
    <div class="sheet-item" data-cact="rename">${icon('edit')}تغییر نام</div>
    ${memberItem}
    <div class="sheet-item" data-cact="pin">${icon('pin')}${c.pinned ? 'برداشتن سنجاق' : 'سنجاق کردن'}</div>
    <div class="sheet-item" data-cact="mute">${icon(c.muted ? 'bell' : 'bell-off')}${c.muted ? 'فعال کردن اعلان' : 'بی‌صدا کردن'}</div>
    <div class="sheet-item" data-cact="clear">${icon('trash')}پاک کردن تاریخچه</div>
    <div class="sheet-item danger" data-cact="delete">${icon('trash')}حذف گفتگو</div>
  `);
  $$('#sheet-content [data-cact]').forEach(b => b.addEventListener('click', () => {
    const act = b.dataset.cact;
    closeSheet();
    setTimeout(() => {
      if (act === 'info') { openInfo(c.id); return; }
      if (act === 'avatar') { openAvatarPicker('chat', c.id); return; }
      if (act === 'verified') {
        c.verified = !c.verified;
        toast(c.verified ? 'تیک آبی داده شد' : 'تیک آبی برداشته شد');
        renderChatList(); renderChatHeader(); save();
        return;
      }
      if (act === 'rename') {
        showPrompt('نام جدید', c.name, v => {
          if (!v.trim()) return;
          c.name = v.trim(); renderChatHeader(); renderChatList(); save();
          toast('نام تغییر کرد');
        });
        return;
      }
      if (act === 'members') {
        showPrompt('تعداد اعضا', String(c.members || 0), v => {
          const n = parseInt(v, 10);
          if (isNaN(n) || n < 0) { toast('عدد معتبر وارد کن'); return; }
          c.members = Math.min(n, 9999999);
          renderChatHeader(); renderChatList(); save();
          toast('تعداد اعضا تغییر کرد');
        });
        return;
      }
      if (act === 'pin') { c.pinned = !c.pinned; toast(c.pinned ? 'سنجاق شد' : 'برداشته شد'); }
      if (act === 'mute') { c.muted = !c.muted; toast(c.muted ? 'بی‌صدا شد' : 'فعال شد'); }
      if (act === 'clear') { c.messages = []; toast('پاک شد'); }
      if (act === 'delete') {
        showConfirm('حذف گفتگو', 'کل این گفتگو حذف شود؟', () => {
          state.chats = state.chats.filter(x => x.id !== c.id);
          state.contacts = state.contacts.filter(x => x.id !== c.id);
          closeChat(); renderChatList(); renderContacts(); save(); toast('حذف شد');
        });
        return;
      }
      renderChatList(); renderMessages(); save();
    }, 120);
  }));
});

$('#chat-name').addEventListener('click', () => {
  if (!activeChatId) return;
  openInfo(activeChatId);
});
$('#chat-avatar').addEventListener('click', () => {
  if (!activeChatId) return;
  openInfo(activeChatId);
});

/* ===================== MESSAGE SEARCH ===================== */
function openMsgSearch() {
  $('#msg-search-bar').classList.add('show');
  $('#msg-search-input').value = '';
  $('#msg-search-count').textContent = '';
  setTimeout(() => $('#msg-search-input').focus(), 100);
}
function closeMsgSearch() {
  $('#msg-search-bar').classList.remove('show');
  msgSearchQuery = '';
  msgSearchHits = [];
  msgSearchIndex = -1;
  renderMessages(false);
}
$('#btn-search-msg').addEventListener('click', openMsgSearch);
$('#msg-search-close').addEventListener('click', closeMsgSearch);

let msgSearchTimer = null;
$('#msg-search-input').addEventListener('input', e => {
  clearTimeout(msgSearchTimer);
  msgSearchTimer = setTimeout(() => {
    msgSearchQuery = e.target.value.trim();
    const chat = getChat(activeChatId);
    if (!chat) return;
    if (msgSearchQuery.length < 2) {
      msgSearchHits = [];
      msgSearchIndex = -1;
      $('#msg-search-count').textContent = '';
      renderMessages(false);
      return;
    }
    const q = msgSearchQuery.toLowerCase();
    msgSearchHits = chat.messages
      .filter(m => m.type === 'text' && m.text && m.text.toLowerCase().includes(q))
      .map(m => m.id);
    msgSearchIndex = msgSearchHits.length ? 0 : -1;
    $('#msg-search-count').textContent = msgSearchHits.length
      ? `${(msgSearchIndex + 1).toLocaleString('fa-IR')}/${msgSearchHits.length.toLocaleString('fa-IR')}`
      : 'یافت نشد';
    renderMessages(false);
    scrollToHit();
  }, 250);
});

function scrollToHit() {
  if (msgSearchIndex < 0) return;
  const id = msgSearchHits[msgSearchIndex];
  const el = document.querySelector(`.msg[data-id="${id}"]`);
  if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
$('#msg-search-next').addEventListener('click', () => {
  if (!msgSearchHits.length) return;
  msgSearchIndex = (msgSearchIndex + 1) % msgSearchHits.length;
  $('#msg-search-count').textContent = `${(msgSearchIndex + 1).toLocaleString('fa-IR')}/${msgSearchHits.length.toLocaleString('fa-IR')}`;
  scrollToHit();
});
$('#msg-search-prev').addEventListener('click', () => {
  if (!msgSearchHits.length) return;
  msgSearchIndex = (msgSearchIndex - 1 + msgSearchHits.length) % msgSearchHits.length;
  $('#msg-search-count').textContent = `${(msgSearchIndex + 1).toLocaleString('fa-IR')}/${msgSearchHits.length.toLocaleString('fa-IR')}`;
  scrollToHit();
});

/* ===================== BOTTOM NAV (Telegram style) ===================== */
function switchTab(tab) {
  $$('.tab-body').forEach(t => t.classList.add('hidden'));
  const target = $('#tab-' + tab);
  if (target) target.classList.remove('hidden');

  // Update active state in bottom nav
  $$('.bottom-nav .bnav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });

  // Search FAB visible only on chats tab
  const fabSearch = $('#fab-search');
  if (fabSearch) fabSearch.style.display = (tab === 'chats') ? 'flex' : 'none';

  // Filter tabs only on chats
  const ftabs = $('#filter-tabs');
  if (ftabs) ftabs.style.display = (tab === 'chats') ? 'flex' : 'none';

  // Title
  const titleEl = $('#list-title');
  if (tab === 'chats') {
    if (!titleEl.querySelector('.logo-text')) {
      titleEl.innerHTML = `<span class="logo-wrap"><span class="logo-text">پیسفون</span></span>`;
    }
  } else if (tab === 'contacts') {
    titleEl.textContent = 'مخاطبین';
  } else if (tab === 'settings') {
    titleEl.textContent = 'تنظیمات';
  }

  // New-chat button only on chats tab
  const newChatBtn = $('#btn-new-chat');
  if (newChatBtn) newChatBtn.style.display = (tab === 'chats') ? 'flex' : 'none';

  if (tab === 'contacts') renderContacts();
  if (tab === 'settings') renderSettings();
  if (tab === 'chats') renderChatList();
}

$$('.bottom-nav .bnav-item').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

/* Filter tabs click */
$$('#filter-tabs .ftab').forEach(btn => {
  btn.addEventListener('click', () => {
    chatFilter = btn.dataset.filter;
    $$('#filter-tabs .ftab').forEach(b =>
      b.classList.toggle('active', b.dataset.filter === chatFilter));
    renderChatList();
  });
});

/* Search FAB click */
$('#fab-search').addEventListener('click', () => {
  const sb = $('#searchbar');
  const open = sb.style.display === 'none';
  sb.style.display = open ? 'block' : 'none';
  if (open) $('#search-input').focus();
  else { $('#search-input').value = ''; renderChatList(); }
});

/* Header menu button (top-left) */
$('#btn-menu-list').addEventListener('click', () => toast('به‌زودی…'));

/* Header + new chat button (top-right) */
$('#btn-new-chat').addEventListener('click', () => {
  openSheet(`
    <div class="sheet-title">گفتگوی جدید</div>
    <div class="sheet-item" data-nt="private">${icon('user')}گفتگوی شخصی</div>
    <div class="sheet-item" data-nt="group">${icon('users')}گروه</div>
    <div class="sheet-item" data-nt="channel">${icon('megaphone')}کانال</div>
    <div class="sheet-item" data-nt="saved">${icon('bookmark')}پیام‌های ذخیره‌شده</div>
  `);
  $$('#sheet-content [data-nt]').forEach(b => b.addEventListener('click', () => {
    const type = b.dataset.nt;
    closeSheet();
    setTimeout(() => promptChatName(type), 150);
  }));
});

/* Search input debounce */
$('#search-input').addEventListener('input', () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(renderChatList, 120);
});
$('#search-clear').addEventListener('click', () => {
  $('#search-input').value = '';
  renderChatList();
  $('#search-input').focus();
});

/* Chat list click (with long-press aware) */
$('#chat-list').addEventListener('click', e => {
  if (chatLongPressFired) { chatLongPressFired = false; return; }

  const msgResult = e.target.closest('.msg-search-result');
  if (msgResult) {
    const chatId = msgResult.dataset.resultChat;
    const msgId = msgResult.dataset.resultMsg;
    $('#search-input').value = '';
    $('#searchbar').style.display = 'none';
    renderChatList();
    openChat(chatId);
    setTimeout(() => {
      const el = document.querySelector(`.msg[data-id="${msgId}"]`);
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        el.classList.add('selected');
        setTimeout(() => el.classList.remove('selected'), 900);
      }
    }, 250);
    return;
  }

  const item = e.target.closest('.chat-item');
  if (item && item.dataset.id) openChat(item.dataset.id);
});

$('#contacts-list').addEventListener('click', e => {
  const item = e.target.closest('[data-contact]');
  if (!item) return;
  const c = state.contacts.find(x => x.id === item.dataset.contact);
  if (!c) return;
  let chat = state.chats.find(x => x.id === c.id);
  if (!chat) {
    chat = {
      id: c.id, name: c.name, type: 'private',
      avatar: c.avatar, verified: c.verified,
      username: '', online: Math.random() > .5,
      unread: 0, pinned: false, muted: false,
      draft: '', messages: [], createdAt: Date.now()
    };
    state.chats.push(chat); save();
  }
  openChat(chat.id);
});

$('#btn-back').addEventListener('click', closeChat);
$('#btn-info-back').addEventListener('click', () => { closeInfo(); renderChatList(); });
$('#btn-info-edit').addEventListener('click', () => {
  const c = getChat(infoChatId);
  if (!c) return;
  avatarTargetType = 'chat';
  avatarTarget = c.id;
  renderAvatarPicker('gradient');
  avatarOverlay.classList.add('show');
});

/* ===================== NEW CHAT PROMPTS ===================== */
function promptChatName(type) {
  const titles = { private: 'نام مخاطب', group: 'نام گروه', channel: 'نام کانال', saved: null };
  if (type === 'saved') {
    createChat({ name: 'پیام‌های ذخیره‌شده', type: 'saved' });
    return;
  }
  showPrompt(titles[type], '', val => {
    const name = val.trim();
    if (!name) { toast('نام نمی‌تونه خالی باشه'); return; }
    const data = {
      name, type,
      avatar: { type: 'gradient', value: Math.floor(Math.random() * AV_GRADS.length) },
      verified: false,
      username: '',
      isPublic: type === 'channel'
    };
    if (type === 'private') { data.online = true; }
    if (type === 'group' || type === 'channel') {
      const defaultCount = type === 'group' ? '4' : '100';
      setTimeout(() => {
        showPrompt('تعداد اعضا', defaultCount, num => {
          const n = parseInt(num, 10);
          const count = (isNaN(n) || n < 0) ? 0 : Math.min(n, 9999999);
          data.members = count;
          if (type === 'group') {
            const shuffled = GROUP_MEMBER_POOL.slice().sort(() => Math.random() - 0.5);
            data.membersList = shuffled.slice(0, Math.min(count, shuffled.length)).map(m => ({ ...m }));
          }
          setTimeout(() => askPublicOrPrivate(data, type), 200);
        });
      }, 220);
      return;
    }
    finishCreateChat(data, type);
  });
}

function askPublicOrPrivate(data, type) {
  openSheet(`
    <div class="sheet-title">${type === 'channel' ? 'کانال' : 'گروه'} شما چه نوعی باشد؟</div>
    <div class="sheet-item" data-pp="public">
      ${icon('globe')}
      <div style="flex:1">
        <div style="font-weight:600">عمومی</div>
        <div style="font-size:12px;color:var(--text-3);margin-top:2px">هر کسی می‌تواند پیدا کند</div>
      </div>
    </div>
    <div class="sheet-item" data-pp="private">
      ${icon('lock')}
      <div style="flex:1">
        <div style="font-weight:600">خصوصی</div>
        <div style="font-size:12px;color:var(--text-3);margin-top:2px">فقط با دعوت‌نامه</div>
      </div>
    </div>
  `);
  $$('#sheet-content [data-pp]').forEach(b => b.addEventListener('click', () => {
    data.isPublic = b.dataset.pp === 'public';
    closeSheet();
    if (data.isPublic) {
      setTimeout(() => {
        showPrompt('آیدی عمومی (بدون @)', '', v => {
          let u = v.trim().replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
          if (u && u.length >= 3 && u.length <= 32) {
            const dup = state.chats.find(x => x.username === u);
            if (!dup) data.username = u;
          }
          finishCreateChat(data, type);
        });
      }, 220);
    } else {
      finishCreateChat(data, type);
    }
  }));
}

function finishCreateChat(data, type) {
  createChat(data);
  if (type === 'private') {
    const id = state.chats[state.chats.length - 1].id;
    state.contacts.push({ id, name: data.name, avatar: data.avatar, verified: false });
    save(); renderContacts();
  }
}

function createChat(data) {
  const chat = Object.assign({
    id: rid(), unread: 0, pinned: false, muted: false,
    draft: '', messages: [], createdAt: Date.now()
  }, data);
  state.chats.push(chat);
  save(); renderChatList();
  toast('«' + chat.name + '» ساخته شد');
  setTimeout(() => openChat(chat.id), 200);
}

/* ===================== SETTINGS ACTIONS ===================== */
$('#settings-body').addEventListener('click', e => {
  const row = e.target.closest('[data-act]');
  if (row) {
    const act = row.dataset.act;
    if (act === 'edit-name') showPrompt('نام شما', state.me.name, v => {
      if (!v.trim()) return;
      state.me.name = v.trim(); renderSettings(); renderChatList(); save(); toast('ذخیره شد');
    });
    if (act === 'edit-phone') {
      const currentPhone = state.me.phone || '+98 ';
      showPrompt('شماره تلفن', currentPhone, v => {
        let num = v.trim();
        if (!num || num === '+98') { state.me.phone = ''; }
        else {
          if (!num.startsWith('+98')) {
            num = num.replace(/^\+?9?8?\s*/, '').replace(/\D/g, '');
            num = '+98 ' + num;
          }
          num = num.replace(/^(\+98)\s*(\d{3})\s*(\d{3})\s*(\d{4}).*$/, '$1 $2 $3 $4');
          state.me.phone = num;
        }
        renderSettings(); save(); toast('ذخیره شد');
      }, { ltr: true, placeholder: '+98 912 345 6789' });
    }
    if (act === 'toggle-theme') {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme();
      renderSettings(); save();
      toast(state.theme === 'light' ? 'تم روشن فعال شد' : 'تم تاریک فعال شد');
    }
    if (act === 'export') {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'pisfon-backup.json';
      a.click(); URL.revokeObjectURL(a.href);
      toast('دانلود شد');
    }
    if (act === 'import') {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.json,application/json';
      inp.onchange = () => {
        const f = inp.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = () => {
          try {
            const data = JSON.parse(r.result);
            if (!data || !Array.isArray(data.chats)) throw 0;
            closeChat(); closeInfo();
            state = data;
            if (!state.settings) state.settings = defaultState().settings;
            if (!state.me) state.me = defaultState().me;
            if (!Array.isArray(state.contacts)) state.contacts = [];
            if (!state.theme) state.theme = 'dark';
            applyTheme();
            renderChatList(); renderContacts(); renderSettings(); save();
            toast('بازیابی شد');
          } catch { toast('فایل نامعتبر'); }
        };
        r.readAsText(f);
      };
      inp.click();
    }
    if (act === 'reset') {
      showConfirm('پاک کردن همه داده‌ها', 'تمام گفتگوها و تنظیمات حذف شوند؟', () => {
        localStorage.removeItem(KEY);
        state = defaultState();
        applyTheme();
        renderChatList(); renderSettings(); renderContacts();
        toast('پاک شد');
      });
    }
  }
  if (e.target.closest('#my-avatar-btn') || e.target.closest('#btn-edit-profile')) {
    openAvatarPicker('me', null);
    return;
  }
  const sw = e.target.closest('input[data-set]');
  if (sw) {
    const key = sw.dataset.set;
    state.settings[key] = sw.checked;
    save();
    if (key === 'aiMode') {
      toast(sw.checked ? 'پاسخ هوشمند فعال شد ✨' : 'پاسخ هوشمند غیرفعال شد');
      if (activeChatId) renderChatHeader();
    }
    if (key === 'notifications' && sw.checked) {
      requestNotifPermission().then(() => {
        if (Notification.permission === 'granted') toast('نوتیفیکیشن فعال شد');
        else if (Notification.permission === 'denied') {
          toast('مرورگر اجازه نداد');
          state.settings.notifications = false;
          renderSettings(); save();
        }
      });
    }
  }
  const meSw = e.target.closest('input[data-me]');
  if (meSw) {
    state.me[meSw.dataset.me] = meSw.checked;
    renderSettings(); renderChatList();
    save();
    toast(state.me.verified ? 'تیک آبی فعال شد' : 'تیک آبی غیرفعال شد');
  }
});

/* ===================== MODAL ===================== */
function showPrompt(title, value, onOk, opts = {}) {
  const box = $('#modal-box');
  const ltr = opts.ltr ? 'dir="ltr" class="ltr"' : '';
  const ph = opts.placeholder || 'بنویس…';
  box.innerHTML = `<h3>${esc(title)}</h3>
    <input id="modal-input" value="${esc(value)}" placeholder="${esc(ph)}" ${ltr}>
    <div class="modal-actions">
      <button id="modal-cancel">لغو</button>
      <button id="modal-ok" class="ok">ذخیره</button>
    </div>`;
  modalOverlay.classList.add('show');
  const inp = $('#modal-input');
  setTimeout(() => { inp.focus(); inp.select(); }, 60);
  $('#modal-cancel').onclick = () => modalOverlay.classList.remove('show');
  $('#modal-ok').onclick = () => {
    const v = inp.value; modalOverlay.classList.remove('show'); onOk(v);
  };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') $('#modal-ok').click(); });
}
function showConfirm(title, text, onOk) {
  const box = $('#modal-box');
  box.innerHTML = `<h3>${esc(title)}</h3><p>${esc(text)}</p>
    <div class="modal-actions">
      <button id="modal-cancel">لغو</button>
      <button id="modal-ok" class="ok" style="color:var(--red)">حذف</button>
    </div>`;
  modalOverlay.classList.add('show');
  $('#modal-cancel').onclick = () => modalOverlay.classList.remove('show');
  $('#modal-ok').onclick = () => { modalOverlay.classList.remove('show'); onOk(); };
}
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) modalOverlay.classList.remove('show');
});

/* ===================== ESC ===================== */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (sheetOverlay.classList.contains('show')) closeSheet();
    else if (emojiOverlay.classList.contains('show')) emojiOverlay.classList.remove('show');
    else if (avatarOverlay.classList.contains('show')) closeAvatarPicker();
    else if (modalOverlay.classList.contains('show')) modalOverlay.classList.remove('show');
    else if ($('#screen-info').classList.contains('open')) closeInfo();
    else if ($('#screen-chat').classList.contains('open')) closeChat();
  }
});

/* ===================== UPDATE ===================== */
function showUpdateNotification() {
  const overlay = $('#update-overlay');
  if (!overlay) return;
  const cl = $('#update-changelog');
  cl.innerHTML = CHANGELOG.map((item, i) => `
    <div class="cl-item">
      <span class="cl-num">${i + 1}</span>
      <span class="cl-text">${esc(item)}</span>
    </div>
  `).join('');
  $('#update-version').textContent = APP_VERSION;
  setTimeout(() => overlay.classList.add('show'), 800);
  $('#update-ok').addEventListener('click', () => {
    overlay.classList.remove('show');
    try { localStorage.setItem(VERSION_KEY, APP_VERSION); } catch {}
    setTimeout(() => { overlay.style.display = 'none'; }, 400);
  });
}
function checkVersionAndNotify() {
  let savedVersion = null;
  try { savedVersion = localStorage.getItem(VERSION_KEY); } catch {}
  if (savedVersion !== APP_VERSION) {
    showUpdateNotification();
  } else {
    const overlay = $('#update-overlay');
    if (overlay) overlay.remove();
  }
}

/* ===================== SCROLL BOTTOM ===================== */
const messagesBox = $('#messages');
const scrollBottomBtn = $('#btn-scroll-bottom');
const scrollUnread = $('#scroll-unread');
let unreadWhileScrolled = 0;

function updateScrollBottomBtn() {
  const atBottom = messagesBox.scrollHeight - messagesBox.scrollTop - messagesBox.clientHeight < 80;
  if (atBottom) {
    scrollBottomBtn.style.display = 'none';
    unreadWhileScrolled = 0;
    scrollUnread.style.display = 'none';
    scrollUnread.textContent = '0';
  } else {
    scrollBottomBtn.style.display = 'flex';
  }
}
messagesBox.addEventListener('scroll', updateScrollBottomBtn);
scrollBottomBtn.addEventListener('click', () => {
  messagesBox.scrollTo({ top: messagesBox.scrollHeight, behavior: 'smooth' });
  unreadWhileScrolled = 0;
  scrollUnread.style.display = 'none';
});

/* ===================== INIT ===================== */
state.chats.forEach(c => c.messages.forEach(m => renderedMsgIds.add(m.id)));

renderChatList();
renderContacts();
renderSettings();
switchTab('chats');

checkVersionAndNotify();
requestNotifPermission();

setInterval(pruneRenderedIds, 60000);

window.addEventListener('online', () => {
  if (activeChatId) renderChatHeader();
  renderChatList();
});
window.addEventListener('offline', () => {
  if (activeChatId) renderChatHeader();
  renderChatList();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
