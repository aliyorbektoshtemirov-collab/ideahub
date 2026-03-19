'use strict';

/* ═══ SVG ICONS (all have width/height=16) ═══ */
const IC = {
  home:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  fire:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>`,
  new:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  save:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>`,
  bell:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  msg:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  user:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  settings:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  plus:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  search:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  up:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
  dn:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  cmt:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  share:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  trash:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  link:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  img:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  txt:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>`,
  send:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  check:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  follow:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
  flag:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
  shield:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  logout:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  upload:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
  back:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  close:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  people:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  edit:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  cam:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  sun:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  key:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/></svg>`,
  logo:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
};
window.IC = IC;

/* ═══ API ═══ */
let _tok = null;
const Tok = { set: t => _tok = t, clr: () => _tok = null, get: () => _tok };

async function api(method, path, body = null, isForm = false) {
  const opts = { method, headers: {} };
  if (_tok) opts.headers['Authorization'] = `Bearer ${_tok}`;
  if (body && !isForm) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  else if (isForm && body) { opts.body = body; }
  const r = await fetch(location.origin + path, opts);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
  return d;
}

const API = {
  login:       (u, p)   => api('POST', '/api/auth/login', { username: u, password: p }),
  register:    (n,u,e,p)=> api('POST', '/api/auth/register', { name:n, username:u, email:e, password:p }),
  forgotPass:  (username)=> api('POST', '/api/auth/forgot', { username }),
  verifyReset: (token)  => api('POST', '/api/auth/reset/verify', { token }),
  resetPass:   (token, new_pass) => api('POST', '/api/auth/reset', { token, new_pass }),
  me:          ()       => api('GET',  '/api/me'),
  updateMe:    (n, b)   => api('POST', '/api/me', { name:n, bio:b }),
  changePass:  (old_pass, new_pass) => api('POST', '/api/me/password', { old_pass, new_pass }),
  uploadAv:    fd       => api('POST', '/api/me/avatar', fd, true),
  uploadBanner:fd       => api('POST', '/api/me/banner', fd, true),
  getUser:     id       => api('GET',  `/api/users/${id}`),
  searchUsers: q        => api('GET',  `/api/users/search?q=${encodeURIComponent(q)}`),
  followUser:  id       => api('POST', `/api/users/${id}/follow`),
  communities: ()       => api('GET',  '/api/communities'),
  topComs:     ()       => api('GET',  '/api/communities/top'),
  mineComs:    ()       => api('GET',  '/api/communities/mine'),
  createCom:   d        => api('POST', '/api/communities', d),
  getCom:      slug     => api('GET',  `/api/communities/${slug}`),
  updateCom:   (slug,d) => api('PUT',  `/api/communities/${slug}`, d),
  joinCom:     slug     => api('POST', `/api/communities/${slug}/join`),
  comPosts:    (slug,sort,off) => api('GET', `/api/communities/${slug}/posts?sort=${sort}&offset=${off}`),
  posts:       (sort,off)      => api('GET', `/api/posts?sort=${sort}&offset=${off}`),
  savedPosts:  ()       => api('GET',  '/api/posts/saved'),
  getPost:     id       => api('GET',  `/api/posts/${id}`),
  createPost:  (fd,isF) => api('POST', '/api/posts', fd, isF),
  deletePost:  id       => api('DELETE',`/api/posts/${id}`),
  updatePost:  (id,d)   => api('PUT',  `/api/posts/${id}`, d),
  votePost:    (id,v)   => api('POST', `/api/posts/${id}/vote`, { vote:v }),
  savePost:    id       => api('POST', `/api/posts/${id}/save`),
  search:      q        => api('GET',  `/api/search?q=${encodeURIComponent(q)}`),
  addComment:  (pid,body,parent_id) => api('POST', `/api/posts/${pid}/comments`, { body, parent_id }),
  voteComment: (id,v)   => api('POST', `/api/comments/${id}/vote`, { vote:v }),
  deleteComment: id     => api('DELETE',`/api/comments/${id}`),
  messages:    ()       => api('GET',  '/api/messages'),
  thread:      uid      => api('GET',  `/api/messages/${uid}`),
  sendMsg:     (uid,body)=> api('POST', `/api/messages/${uid}`, { body }),
  notifications:()      => api('GET',  '/api/notifications'),
  notifCount:  ()       => api('GET',  '/api/notifications/count'),
  markRead:    ()       => api('POST', '/api/notifications/read'),
  report:      d        => api('POST', '/api/reports', d),
  adminStats:  ()       => api('GET',  '/api/admin/stats'),
  adminUsers:  ()       => api('GET',  '/api/admin/users'),
  adminAction: d        => api('POST', '/api/admin/action', d),
  adminReports:()       => api('GET',  '/api/admin/reports'),
  adminResolve:(id,status)=> api('POST',`/api/admin/reports/${id}`, { status }),
};
window.API = API; window.Tok = Tok;

/* ═══ WEBSOCKET ═══ */
class _WS {
  constructor() { this.ws = null; this.h = {}; this._rt = null; this.tok = null; }
  connect(token) {
    this.tok = token; clearTimeout(this._rt);
    try { if (this.ws) this.ws.close(); } catch {}
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.ws = new WebSocket(`${proto}//${location.host}/?token=${encodeURIComponent(token)}`);
    this.ws.onopen = () => this._e('_open');
    this.ws.onmessage = e => { try { const m = JSON.parse(e.data); this._e(m.type, m.data); } catch {} };
    this.ws.onclose = () => { this._e('_close'); this._rt = setTimeout(() => this.connect(this.tok), 3500); };
    this.ws.onerror = () => {};
  }
  on(t, fn) { (this.h[t] = this.h[t] || []).push(fn); }
  _e(t, d) { (this.h[t] || []).forEach(fn => { try { fn(d); } catch {} }); }
  disconnect() { clearTimeout(this._rt); try { if (this.ws) this.ws.close(); } catch {} }
}
window.WS = new _WS();

/* ═══ UTILS ═══ */
function esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function initials(n) { return (n || '?').trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2); }
function avHtml(u, sz = 32, fs = 12) {
  if (u.avatar) return `<img src="${esc(u.avatar)}" alt="" style="width:100%;height:100%;object-fit:cover">`;
  return `<span style="font-size:${fs}px;font-weight:700;color:#fff;font-family:'Syne',sans-serif">${initials(u.name || u.username)}</span>`;
}
function avStyle(u, sz = 32) { return `width:${sz}px;height:${sz}px;background:${u.color || '#C8922A'};`; }
function fmtNum(n) { if (n == null) return '0'; return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n); }
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

let _tt;
function toast(msg, dur = 3200) {
  const el = document.getElementById('toast'); if (!el) return;
  el.textContent = msg; el.classList.add('show');
  clearTimeout(_tt); _tt = setTimeout(() => el.classList.remove('show'), dur);
}

let _curSec = 'home';
function goSec(id) {
  _curSec = id;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-' + id)?.classList.add('active');
  document.querySelectorAll('.lsb-btn[data-sec]').forEach(b => b.classList.toggle('active', b.dataset.sec === id));
}
function curSec() { return _curSec; }
function spinner() { return '<div class="spin"></div>'; }
function emptyEl(icon, title, desc = '') {
  return `<div class="empty">
    <div class="empty-icon">${IC[icon] || IC.save}</div>
    <div class="empty-title">${esc(title)}</div>
    ${desc ? `<div class="empty-desc">${esc(desc)}</div>` : ''}
  </div>`;
}

window.esc = esc; window.initials = initials; window.avHtml = avHtml; window.avStyle = avStyle;
window.fmtNum = fmtNum; window.debounce = debounce; window.toast = toast;
window.goSec = goSec; window.curSec = curSec; window.spinner = spinner; window.emptyEl = emptyEl;
