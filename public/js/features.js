'use strict';

/* ═══ COMMUNITIES ═══ */
async function openCommunity(slug) {
  window._curCom = slug;
  goSec('community');
  const hd = document.getElementById('com-hd-area');
  const fd = document.getElementById('com-feed-cnt');
  if (hd) hd.innerHTML = spinner();
  if (fd) fd.innerHTML = spinner();
  try {
    const [com, posts] = await Promise.all([API.getCom(slug), API.comPosts(slug, 'hot', 0)]);
    const letter = (com.name || com.slug || '?')[0].toUpperCase();
    const color  = com.color || '#C8922A';
    if (hd) hd.innerHTML = `
      <div class="com-page-hd">
        <div class="com-banner" style="background:linear-gradient(135deg,${esc(color)}44,${esc(color)}22)"></div>
        <div class="com-hd-row">
          <div class="com-hd-icon" style="background:${esc(color)}22;border:2px solid ${esc(color)}44;color:${esc(color)}">${letter}</div>
          <div style="flex:1">
            <div class="com-hd-name">${esc(com.name)}</div>
            <div class="com-hd-sub">${esc(com.slug)} &middot; ${fmtNum(com.members)} a'zo</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;margin-left:auto">
            ${com.is_owner ? `<button class="btn btn-ghost" style="padding:7px 13px;font-size:12px" onclick="editCom('${esc(com.slug)}')">${IC.settings} Sozlash</button>` : ''}
            <button class="btn ${com.is_member ? 'btn-outline' : 'btn-gold'}" id="jb-${esc(com.id)}" onclick="toggleJoin('${esc(com.slug)}','${esc(com.id)}',this)">
              ${com.is_member ? `${IC.check} A'zo` : `${IC.plus} Qo'shilish`}
            </button>
          </div>
        </div>
        ${com.description ? `<div style="padding:0 18px 14px;font-size:13px;color:var(--tx3)">${esc(com.description)}</div>` : ''}
      </div>`;
    if (fd) {
      fd.innerHTML = '';
      window._comOff = 0;
      document.querySelectorAll('#com-sort-bar .sort-btn').forEach(b => b.classList.toggle('active', b.dataset.sort === 'hot'));
      posts.forEach((p, i) => {
        const d = document.createElement('div'); d.innerHTML = buildPost(p);
        const c = d.firstElementChild; c.style.animationDelay = (i * .04) + 's'; fd.appendChild(c);
      });
      if (!posts.length) fd.innerHTML = emptyEl('save', "Hali postlar yo'q", "Bu jamoada birinchi post siz bo'ling!");
    }
    buildComRsb(com);
  } catch (e) { if (hd) hd.innerHTML = emptyEl('close', 'Topilmadi', e.message); }
}
async function toggleJoin(slug, comId, btn) {
  try {
    const d = await API.joinCom(slug);
    if (btn) { btn.className = `btn ${d.joined ? 'btn-outline' : 'btn-gold'}`; btn.innerHTML = d.joined ? `${IC.check} A'zo` : `${IC.plus} Qo'shilish`; }
    toast(d.joined ? "Jamoaga qo'shildingiz" : 'Jamoadan chiqdingiz');
    loadMyComs();
  } catch (e) { toast(e.message); }
}
async function loadMyComs() {
  if (!window._me) return;
  try {
    const coms = await API.mineComs();
    const el = document.getElementById('my-coms'); if (!el) return;
    el.innerHTML = '';
    coms.slice(0, 10).forEach(c => {
      const b = document.createElement('button');
      b.className = 'com-lsb'; b.onclick = () => openCommunity(c.slug);
      b.innerHTML = `<span class="com-lsb-dot" style="background:${esc(c.color||'#C8922A')}"></span>${esc(c.name || c.slug)}`;
      el.appendChild(b);
    });
  } catch {}
}
async function loadTopComs() {
  try {
    const coms = await API.topComs();
    const el = document.getElementById('popular-cnt'); if (!el) return;
    el.innerHTML = '';
    if (!coms.length) { el.innerHTML = emptyEl('people', "Hali jamoalar yo'q"); return; }
    coms.forEach((c, i) => {
      const color = c.color || '#C8922A';
      const letter = (c.name || c.slug || '?')[0].toUpperCase();
      const d = document.createElement('div');
      d.className = 'com-pop-card'; d.style.animationDelay = (i * .04) + 's';
      d.innerHTML = `
        <div class="com-pop-inner" onclick="openCommunity('${esc(c.slug)}')">
          <div class="com-pop-rank">${i + 1}</div>
          <div class="com-pop-icon" style="background:${color}18;border:2px solid ${color}40;color:${color}">${letter}</div>
          <div class="com-pop-info">
            <div class="com-pop-name">${esc(c.name || c.slug)}</div>
            <div class="com-pop-sub">${esc(c.slug)} &middot; ${fmtNum(c.members)} a'zo</div>
            ${c.description ? `<div class="com-pop-desc">${esc(c.description)}</div>` : ''}
          </div>
          <button class="com-pop-join${c.is_member ? ' joined' : ''}"
            onclick="event.stopPropagation();toggleJoin('${esc(c.slug)}','${esc(c.id)}',this)">
            ${c.is_member ? "A'zo" : "Qo'shilish"}
          </button>
        </div>`;
      el.appendChild(d);
    });
  } catch (e) { console.error(e); }
}
function buildComRsb(com) {
  const el = document.getElementById('rsb-inner'); if (!el) return;
  el.querySelector('.rsb-com-card')?.remove();
  const div = document.createElement('div');
  div.className = 'rsb-card rsb-com-card';
  div.innerHTML = `
    <div class="rsb-banner" style="background:linear-gradient(135deg,${esc(com.color||'#C8922A')}44,${esc(com.color||'#C8922A')}11)"></div>
    <div class="rsb-body">
      <div class="rsb-title">${esc(com.name)}</div>
      <div class="rsb-desc">${esc(com.description || '')}</div>
      <div class="rsb-stat"><span>A'zolar</span><strong>${fmtNum(com.members)}</strong></div>
      <div class="rsb-stat"><span>Asos solgan</span><strong>u/${esc(com.oname || '')}</strong></div>
      <button class="btn btn-gold" style="width:100%;margin-top:12px;padding:9px" onclick="openSubmit('${esc(com.slug)}')">${IC.edit} Post qo'shish</button>
    </div>`;
  el.prepend(div);
}
function openCreateCom() { document.getElementById('cc-overlay').classList.add('open'); }
function closeCreateCom() { document.getElementById('cc-overlay').classList.remove('open'); }
async function doCreateCom() {
  const slug = (document.getElementById('nc-slug').value || '').trim().toLowerCase();
  const name = (document.getElementById('nc-name').value || '').trim();
  const desc = (document.getElementById('nc-desc').value || '').trim();
  const color = document.querySelector('[name="nc-color"]:checked')?.value || '#C8922A';
  if (!slug || !name) { toast('Slug va nom kerak'); return; }
  try { const com = await API.createCom({ slug, name, description: desc, color }); closeCreateCom(); toast('Jamoa yaratildi'); loadMyComs(); openCommunity(com.slug); }
  catch (e) { toast(e.message); }
}

/* ═══ SUBMIT POST ═══ */
let _subTab = 'text', _allComs = [];
function openSubmit(comSlug) {
  document.getElementById('sub-overlay').classList.add('open');
  if (comSlug) { const inp = document.getElementById('sub-com-inp'); if (inp) inp.value = comSlug; }
}
function closeSubmit() { document.getElementById('sub-overlay').classList.remove('open'); }
function switchSubTab(t) {
  _subTab = t;
  document.querySelectorAll('.sub-tab').forEach(b => b.classList.toggle('active', b.dataset.t === t));
  document.querySelectorAll('.sub-form').forEach(f => f.classList.toggle('active', f.dataset.f === t));
}
async function doSubmitPost() {
  const title = (document.getElementById('sub-title').value || '').trim();
  const community = (document.getElementById('sub-com-inp').value || '').trim();
  if (!title) { toast('Sarlavha kerak'); return; }
  if (!community) { toast('Jamoa tanlang'); return; }
  const btn = document.getElementById('sub-btn'); btn.disabled = true;
  btn.innerHTML = '<div class="spin" style="width:14px;height:14px;margin:0;border-width:2px"></div>';
  try {
    let post;
    if (_subTab === 'image') {
      const fi = document.getElementById('sub-img-file');
      const fd = new FormData();
      fd.append('title', title); fd.append('community', community); fd.append('type', 'image');
      if (fi?.files?.[0]) fd.append('image', fi.files[0]);
      post = await API.createPost(fd, true);
    } else if (_subTab === 'link') {
      post = await API.createPost({ title, community, type: 'link', link: (document.getElementById('sub-link').value || '').trim() });
    } else {
      post = await API.createPost({ title, community, type: 'text', body: (document.getElementById('sub-body').value || '').trim() });
    }
    closeSubmit(); toast('Post nashr qilindi'); openPost(post.id);
  } catch (e) { toast(e.message); }
  finally { btn.disabled = false; btn.innerHTML = `${IC.send} Nashr qilish`; }
}
async function initComPicker() {
  try { _allComs = await API.communities(); } catch {}
  const inp = document.getElementById('sub-com-inp');
  const dd  = document.getElementById('sub-com-dd');
  if (!inp || !dd) return;
  inp.addEventListener('input', () => {
    const q = inp.value.toLowerCase();
    const matches = _allComs.filter(c => c.slug.includes(q) || c.name.toLowerCase().includes(q)).slice(0, 8);
    dd.innerHTML = '';
    matches.forEach(c => {
      const d = document.createElement('div'); d.className = 'com-dd-item';
      d.innerHTML = `<span class="com-dd-dot" style="background:${esc(c.color||'#C8922A')}"></span><strong>${esc(c.name||c.slug)}</strong>`;
      d.onclick = () => { inp.value = c.slug; dd.classList.remove('open'); };
      dd.appendChild(d);
    });
    dd.classList.toggle('open', matches.length > 0 && inp.value.length > 0);
  });
  document.addEventListener('click', e => { if (!inp.contains(e.target) && !dd.contains(e.target)) dd.classList.remove('open'); });
}

/* ═══ SEARCH ═══ */
const doSearch = debounce(async q => {
  if (!q.trim()) return;
  goSec('search');
  const el = document.getElementById('search-res'); el.innerHTML = spinner();
  try {
    const d = await API.search(q.trim());
    el.innerHTML = '';
    if (!d.posts.length && !d.communities.length && !d.users.length) { el.innerHTML = emptyEl('search', 'Topilmadi', `"${q}" bo'yicha natija yo'q`); return; }
    if (d.communities.length) {
      const sh = document.createElement('div'); sh.className = 'sr-hd'; sh.textContent = 'Jamoalar'; el.appendChild(sh);
      d.communities.forEach(c => {
        const color = c.color || '#C8922A'; const letter = (c.name || c.slug || '?')[0].toUpperCase();
        const dv = document.createElement('div'); dv.className = 'sr-com'; dv.onclick = () => openCommunity(c.slug);
        dv.innerHTML = `<div class="sr-com-icon" style="background:${color}18;border:2px solid ${color}40;color:${color}">${letter}</div>
          <div style="flex:1"><div class="sr-com-name">${esc(c.name||c.slug)}</div><div class="sr-com-sub">${esc(c.slug)} &middot; ${fmtNum(c.members)} a'zo</div></div>
          <button class="com-pop-join${c.is_member?' joined':''}" onclick="event.stopPropagation();toggleJoin('${esc(c.slug)}','${esc(c.id)}',this)">${c.is_member?"A'zo":"Qo'shilish"}</button>`;
        el.appendChild(dv);
      });
    }
    if (d.users.length) {
      const sh = document.createElement('div'); sh.className = 'sr-hd'; sh.textContent = 'Foydalanuvchilar'; el.appendChild(sh);
      d.users.forEach(u => {
        const dv = document.createElement('div'); dv.className = 'sr-user'; dv.onclick = () => openUser(u.username);
        dv.innerHTML = `<div class="av" style="${avStyle(u,40)};border-radius:50%">${avHtml(u,40,15)}</div>
          <div style="flex:1"><div class="sr-user-name">${esc(u.name||u.username)}</div><div class="sr-user-sub">u/${esc(u.username)} &middot; <span style="color:var(--gold)">${fmtNum(u.karma||0)} karma</span></div></div>`;
        el.appendChild(dv);
      });
    }
    if (d.posts.length) {
      const sh = document.createElement('div'); sh.className = 'sr-hd'; sh.textContent = 'Postlar'; el.appendChild(sh);
      d.posts.forEach(p => { const dv = document.createElement('div'); dv.innerHTML = buildPost(p); el.appendChild(dv.firstElementChild); });
    }
  } catch (e) { el.innerHTML = emptyEl('close', 'Xatolik', e.message); }
}, 320);
function onSearch(q) { if (q) doSearch(q); }

/* ═══ NOTIFICATIONS ═══ */
let _nUnread = 0;
async function loadNotifs() {
  const el = document.getElementById('notifs-list'); if (!el) return;
  el.innerHTML = spinner();
  try {
    const notifs = await API.notifications();
    el.innerHTML = '';
    if (!notifs.length) { el.innerHTML = emptyEl('bell', "Hali bildirishnomalar yo'q"); return; }
    const ICONS = { comment: '💬', vote: '⬆️', follow: '👤', reply: '↩️' };
    notifs.forEach(n => {
      const d = document.createElement('div');
      d.className = `notif${n.is_read ? '' : ' unread'}`;
      d.innerHTML = `<div class="notif-ico" style="background:${n.is_read?'var(--bg2)':'var(--gold-soft)'}">${ICONS[n.type]||'🔔'}</div>
        <div style="flex:1"><div class="notif-txt">${esc(n.msg)}</div><div class="notif-ago">${n.ago||''}</div></div>
        ${!n.is_read ? '<div class="notif-udot"></div>' : ''}`;
      el.appendChild(d);
    });
  } catch (e) { el.innerHTML = emptyEl('close', 'Xatolik', e.message); }
}
async function loadNotifCount() { try { const d = await API.notifCount(); _nUnread = d.count; updNotifDot(); } catch {} }
async function markNotifs() {
  try { await API.markRead(); _nUnread = 0; updNotifDot(); document.querySelectorAll('.notif.unread').forEach(e => { e.classList.remove('unread'); e.querySelector('.notif-udot')?.remove(); }); } catch {}
}
function updNotifDot() {
  const dot = document.getElementById('notif-dot'); const badge = document.getElementById('notif-badge');
  if (_nUnread > 0) { dot?.classList.add('on'); if (badge) { badge.textContent = _nUnread; badge.style.display = 'inline-flex'; } }
  else { dot?.classList.remove('on'); if (badge) badge.style.display = 'none'; }
}
function initNotifWS() {
  WS.on('notif', d => { _nUnread++; updNotifDot(); toast(d.msg || 'Yangi bildirishnoma'); if (curSec() === 'notifs') loadNotifs(); });
}

/* ═══════════════════════════════════
   MESSAGES — TO'LIQ TUZATILGAN
═══════════════════════════════════ */
let _chatWith = null;
let _rendered = new Set();

async function loadConvos() {
  try {
    const convos = await API.messages();
    const el = document.getElementById('conv-list');
    if (!el) return;
    el.innerHTML = '';
    if (!convos.length) {
      el.innerHTML = `<div style="padding:28px 16px;text-align:center;color:var(--tx4)">
        <div style="font-size:36px;margin-bottom:10px;opacity:.5">💬</div>
        <div style="font-size:13px;font-weight:600;color:var(--tx3);margin-bottom:6px">Xabarlar yo'q</div>
        <div style="font-size:12px;line-height:1.7">Biror foydalanuvchi<br>profiliga kiring va<br>"Xabar" tugmasini bosing</div>
      </div>`;
      return;
    }
    convos.forEach((cv, i) => {
      const o = cv.other;
      const d = document.createElement('div');
      d.className = 'conv' + (_chatWith?.id === o.id ? ' active' : '');
      d.dataset.uid = o.id;
      d.style.animationDelay = (i * .05) + 's';
      d.onclick = () => openChat(o);
      d.innerHTML = `
        <div class="av" style="${avStyle(o, 40)};border-radius:50%;flex-shrink:0">${avHtml(o, 40, 15)}</div>
        <div class="conv-info">
          <div class="conv-name">${esc(o.name || o.username)}</div>
          <div class="conv-prev">${cv.last ? esc(cv.last.body.slice(0, 42)) : "Suhbatni boshlang..."}</div>
        </div>
        ${cv.unread > 0 ? '<div class="conv-dot"></div>' : ''}`;
      el.appendChild(d);
    });
  } catch (e) { console.error('loadConvos:', e); }
}

async function openChat(user) {
  _chatWith = user;
  _rendered.clear();

  // Show chat panel with animation
  const emptyEl_ = document.getElementById('chat-empty');
  const panel    = document.getElementById('chat-panel');
  if (emptyEl_) emptyEl_.style.display = 'none';
  if (panel) {
    panel.style.opacity = '0';
    panel.classList.add('vis');
    requestAnimationFrame(() => { panel.style.transition = 'opacity .22s'; panel.style.opacity = '1'; });
  }

  // Header — plain HTML, NO IC icons that could stretch
  const hd = document.getElementById('chat-hd-inner');
  if (hd) hd.innerHTML = `
    <div class="av" style="${avStyle(user, 40)};border-radius:50%;flex-shrink:0;cursor:pointer"
         onclick="openUser('${esc(user.username)}')">${avHtml(user, 40, 15)}</div>
    <div style="flex:1;min-width:0;cursor:pointer" onclick="openUser('${esc(user.username)}')">
      <div style="font-size:14px;font-weight:700;font-family:'Syne',sans-serif;color:var(--tx1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
        ${esc(user.name || user.username)}
      </div>
      <div style="font-size:11px;color:var(--tx4);margin-top:2px;display:flex;align-items:center;gap:4px">
        <span style="width:6px;height:6px;border-radius:50%;background:${user.online ? 'var(--grn)' : 'var(--tx4)'}"></span>
        ${user.online ? 'Onlayn' : 'Oflayn'} &middot; u/${esc(user.username)}
      </div>
    </div>`;

  // Mark active conversation
  document.querySelectorAll('.conv').forEach(r => r.classList.toggle('active', r.dataset.uid === user.id));

  // Load message history
  try {
    const msgs = await API.thread(user.id);
    const b = document.getElementById('chat-msgs');
    b.innerHTML = '';
    _rendered.clear();
    if (!msgs.length) {
      b.innerHTML = `<div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--tx4);font-size:13px;text-align:center">
        <div>Suhbatni boshlang!<br>Birinchi xabarni yuboring 👋</div>
      </div>`;
    } else {
      msgs.forEach(m => addBubble(m, m.from_id === window._me?.id));
    }
    b.scrollTop = b.scrollHeight;
  } catch (e) { console.error('openChat thread:', e); }

  // Focus input
  setTimeout(() => document.getElementById('chat-inp')?.focus(), 200);
}

function addBubble(msg, isMe) {
  if (_rendered.has(msg.id)) return;
  _rendered.add(msg.id);
  const b = document.getElementById('chat-msgs');
  if (!b) return;
  // Remove empty state
  b.querySelector('div[style*="flex:1"]')?.remove();
  const d = document.createElement('div');
  d.className = 'bubble ' + (isMe ? 'me' : 'them');
  d.id = 'bbl-' + msg.id;
  d.innerHTML = esc(msg.body) + `<div class="b-time">${msg.ago || 'Hozir'}</div>`;
  b.appendChild(d);
  b.scrollTo({ top: b.scrollHeight, behavior: 'smooth' });
}

async function sendMsg() {
  if (!_chatWith) { toast("Avval suhbatdosh tanlang"); return; }
  const inp = document.getElementById('chat-inp');
  if (!inp) return;
  const body = (inp.value || '').trim();
  if (!body) return;
  inp.value = '';
  inp.focus();
  // Button animation
  const btn = document.querySelector('.chat-send');
  if (btn) { btn.style.transform = 'scale(.88)'; setTimeout(() => btn.style.transform = '', 150); }
  try {
    await API.sendMsg(_chatWith.id, body);
  } catch (e) {
    inp.value = body; // restore on error
    toast(e.message || 'Xabar yuborilmadi');
  }
}

// startChat — bosilganda animatsiya bilan msgs bo'limiga o'tib, chat ochiladi
async function startChat(username) {
  if (!window._me) { showAuthModal(); return; }

  // Animate section transition
  const feedArea = document.getElementById('feed-area');
  if (feedArea) {
    feedArea.style.transition = 'opacity .2s';
    feedArea.style.opacity = '0';
  }

  goSec('msgs');

  if (feedArea) setTimeout(() => { feedArea.style.opacity = '1'; }, 50);

  try {
    const u = await API.getUser(username);
    // Load conversations first, then open this chat
    await loadConvos();
    // Small delay for DOM
    await new Promise(r => setTimeout(r, 80));
    openChat(u);
  } catch (e) {
    console.error('startChat error:', e);
    toast(e.message || 'Xabar ochishda xatolik');
  }
}

function initMsgWS() {
  WS.on('new_msg', d => {
    const inThisChat = curSec() === 'msgs' && _chatWith?.id === d.msg.from_id;
    if (!inThisChat) toast('💬 ' + (d.from.name || d.from.username) + ': ' + d.msg.body.slice(0, 36));
    if (inThisChat) addBubble(d.msg, false);
    loadConvos();
  });
  WS.on('msg_sent', d => {
    if (_chatWith?.id === d.msg.to_id) addBubble(d.msg, true);
    loadConvos();
  });
}

/* ═══ USER PROFILE ═══ */
async function openUser(param) {
  goSec('user');
  const el = document.getElementById('user-cnt'); el.innerHTML = spinner();
  try {
    const u = await API.getUser(param);
    const isMe = u.is_me || u.id === window._me?.id;
    const bannerStyle = u.banner ? `url(${esc(u.banner)}) center/cover` : `linear-gradient(135deg,${esc(u.color||'#C8922A')}55,${esc(u.color||'#C8922A')}22)`;
    el.innerHTML = `
      <div class="prof-card">
        <div class="prof-banner" style="background:${bannerStyle};position:relative">
          ${isMe ? `<label style="position:absolute;bottom:8px;right:12px;background:rgba(0,0,0,.5);border-radius:var(--r);padding:5px 10px;cursor:pointer;color:#fff;font-size:12px;font-weight:600;display:flex;align-items:center;gap:5px">
            ${IC.cam} Banner<input type="file" accept="image/*" style="display:none" onchange="uploadBanner(this)">
          </label>` : ''}
        </div>
        <div class="prof-hd">
          <div class="prof-av-wrap" style="background:${esc(u.color||'#C8922A')}" ${isMe ? 'onclick="document.getElementById(\'av-inp\').click()"' : ''}>
            ${u.avatar ? `<img src="${esc(u.avatar)}" alt="">` : `<span style="color:#fff">${initials(u.name||u.username)}</span>`}
          </div>
          <div class="prof-info">
            <div class="prof-name">${esc(u.name)}</div>
            <div class="prof-uname">u/${esc(u.username)} ${u.online ? '<span style="color:var(--grn);font-size:11px">● Onlayn</span>' : ''}</div>
            <div class="prof-bio">${esc(u.bio || "Bio yo'q...")}</div>
            <div class="prof-stats">
              <div><div class="ps-n">${fmtNum(u.karma||0)}</div><div class="ps-l">Karma</div></div>
              <div><div class="ps-n">${fmtNum(u.followers||0)}</div><div class="ps-l">Kuzatuvchilar</div></div>
              <div><div class="ps-n">${fmtNum(u.following||0)}</div><div class="ps-l">Kuzatilayotganlar</div></div>
              <div><div class="ps-n">${u.posts?.length||0}</div><div class="ps-l">Post</div></div>
            </div>
            <div class="prof-acts">
              ${isMe
                ? `<button class="btn btn-gold" onclick="goSec('settings');loadSettings()">${IC.settings} Sozlamalar</button>
                   <input type="file" accept="image/*" id="av-inp" style="display:none" onchange="uploadAvatar(this)">`
                : `<button class="btn ${u.is_following?'btn-outline':'btn-gold'}" id="flw-btn-${u.id}" onclick="followUser('${u.id}',this)">
                    ${u.is_following ? `${IC.check} Kuzatilmoqda` : `${IC.follow} Kuzatish`}
                   </button>
                   <button class="btn btn-ghost" onclick="startChat('${esc(u.username)}')">${IC.msg} Xabar</button>`
              }
              ${window._me?.is_admin && !isMe ? `<button class="btn btn-danger" onclick="adminBanUser('${u.id}',${u.is_banned})">${u.is_banned?'Blokdan chiqarish':'Bloklash'}</button>` : ''}
            </div>
          </div>
        </div>
      </div>
      <div class="sr-hd">Postlari</div>
      <div id="user-posts-cnt"></div>`;
    const pc = document.getElementById('user-posts-cnt');
    if (!u.posts?.length) pc.innerHTML = emptyEl('save', "Hali post yo'q");
    else u.posts.forEach((p, i) => { const d = document.createElement('div'); d.innerHTML = buildPost(p); const c = d.firstElementChild; c.style.animationDelay = (i*.04)+'s'; pc.appendChild(c); });
  } catch (e) { el.innerHTML = emptyEl('close', 'Topilmadi', e.message); }
}

async function followUser(id, btn) {
  try {
    const d = await API.followUser(id);
    if (btn) { btn.className = `btn ${d.following?'btn-outline':'btn-gold'}`; btn.innerHTML = d.following ? `${IC.check} Kuzatilmoqda` : `${IC.follow} Kuzatish`; }
    toast(d.following ? 'Kuzatmoqdasiz' : 'Kuzatishni to\'xtatdingiz');
  } catch (e) { toast(e.message); }
}
async function uploadAvatar(inp) {
  const file = inp.files?.[0]; if (!file) return;
  try { const fd = new FormData(); fd.append('image', file); const d = await API.uploadAv(fd); window._me.avatar = d.avatar; syncTopbar(window._me); toast('Rasm yangilandi'); } catch (e) { toast(e.message); }
}
async function uploadBanner(inp) {
  const file = inp.files?.[0]; if (!file) return;
  try { const fd = new FormData(); fd.append('image', file); const d = await API.uploadBanner(fd); toast('Banner yangilandi'); openUser(window._me.id); } catch (e) { toast(e.message); }
}

/* ═══ SETTINGS ═══ */
async function loadSettings() {
  const el = document.getElementById('settings-cnt'); if (!el) return;
  el.innerHTML = spinner();
  try {
    const u = window._me;
    el.innerHTML = `
      <div class="set-card">
        <div class="set-title"><span class="set-title-ico">📷</span> Profil rasmi</div>
        <div class="av-upload">
          <div class="av-big" id="av-big-prev" style="background:${esc(u.color||'#C8922A')}" onclick="document.getElementById('av-inp2').click()">
            ${u.avatar ? `<img src="${esc(u.avatar)}" alt="">` : `<span style="color:#fff">${initials(u.name||u.username)}</span>`}
          </div>
          <div class="av-upload-info">
            <p>Profil rasmingiz</p>
            <small>JPG, PNG, WEBP — 5MB gacha</small>
            <label class="av-file-btn">${IC.upload} Yuklash<input type="file" accept="image/*" id="av-inp2" style="display:none" onchange="uploadAvatar(this)"></label>
          </div>
        </div>
      </div>
      <div class="set-card">
        <div class="set-title"><span class="set-title-ico">👤</span> Ma'lumotlar</div>
        <div class="form-row"><div class="form-lbl">Ism</div><input class="inp" id="st-name" value="${esc(u.name||'')}"></div>
        <div class="form-row"><div class="form-lbl">Email</div><input class="inp" value="${esc(u.email||'')}" disabled></div>
        <div class="form-row" style="margin-bottom:0"><div class="form-lbl">Bio</div><textarea class="inp" id="st-bio" rows="3">${esc(u.bio||'')}</textarea></div>
        <button class="btn btn-gold" style="width:100%;padding:11px;margin-top:14px" onclick="saveProfile()">${IC.check} Saqlash</button>
      </div>
      <div class="set-card">
        <div class="set-title"><span class="set-title-ico">🔑</span> Parolni o'zgartirish</div>
        <div class="form-row"><div class="form-lbl">Eski parol</div><input class="inp" id="cp-old" type="password" placeholder="Joriy parol"></div>
        <div class="form-row"><div class="form-lbl">Yangi parol</div><input class="inp" id="cp-new" type="password" placeholder="Kamida 6 belgi"></div>
        <div class="form-row" style="margin-bottom:0"><div class="form-lbl">Tasdiqlash</div><input class="inp" id="cp-conf" type="password" placeholder="Takrorlang"></div>
        <button class="btn btn-ghost" style="width:100%;padding:10px;margin-top:14px" onclick="doChpass()">${IC.key} O'zgartirish</button>
      </div>
      ${u.is_admin ? `<div class="set-card" style="border-color:rgba(74,127,212,.3)">
        <div class="set-title" style="color:var(--blu)"><span class="set-title-ico">🛡</span> Admin panel</div>
        <button class="btn btn-ghost" style="width:100%;padding:10px;margin-bottom:8px" onclick="goSec('admin');loadAdmin()">Admin panelni ochish</button>
      </div>` : ''}
      <div class="set-card" style="border-color:rgba(217,64,64,.2)">
        <div class="set-title" style="color:var(--red)"><span class="set-title-ico">🚪</span> Chiqish</div>
        <p style="font-size:13px;color:var(--tx4);margin-bottom:14px">Hisobingizdan chiqib ketasiz.</p>
        <button onclick="doLogout()" class="btn btn-danger" style="width:100%;padding:10px">Chiqish</button>
      </div>`;
  } catch (e) { el.innerHTML = emptyEl('close', 'Xatolik', e.message); }
}
async function saveProfile() {
  const name = (document.getElementById('st-name').value||'').trim();
  const bio  = (document.getElementById('st-bio').value||'').trim();
  if (!name) { toast("Ism bo'sh bo'lmasin"); return; }
  try { const u = await API.updateMe(name, bio); window._me = { ...window._me, ...u }; syncTopbar(window._me); toast('Profil saqlandi'); } catch (e) { toast(e.message); }
}
async function doChpass() {
  const oldP = (document.getElementById('cp-old').value||'').trim();
  const newP = (document.getElementById('cp-new').value||'').trim();
  const conf = (document.getElementById('cp-conf').value||'').trim();
  if (!oldP||!newP||!conf) { toast("Barcha maydonlarni to'ldiring"); return; }
  if (newP.length < 6) { toast('Yangi parol kamida 6 belgi'); return; }
  if (newP !== conf) { toast('Yangi parollar mos emas'); return; }
  try { await API.changePass(oldP, newP); toast('Parol o\'zgartirildi'); document.getElementById('cp-old').value=''; document.getElementById('cp-new').value=''; document.getElementById('cp-conf').value=''; } catch (e) { toast(e.message); }
}

/* ═══ ADMIN ═══ */
let _pendingBanId = null;
async function loadAdmin() {
  const el = document.getElementById('admin-cnt'); if (!el) return;
  el.innerHTML = spinner();
  try {
    const [stats, users, reports] = await Promise.all([API.adminStats(), API.adminUsers(), API.adminReports()]);
    el.innerHTML = `
      <div class="set-card">
        <div class="set-title"><span class="set-title-ico">📊</span> Statistika</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
          ${[['Foydalanuvchilar',stats.users],['Postlar',stats.posts],['Izohlar',stats.comments],['Jamoalar',stats.communities],['Shikoyatlar',stats.reports]].map(([l,v])=>
          `<div style="text-align:center;padding:12px;background:var(--bg2);border-radius:var(--r)"><div style="font-size:22px;font-weight:800;color:var(--gold);font-family:'Syne',sans-serif">${fmtNum(v)}</div><div style="font-size:12px;color:var(--tx4)">${l}</div></div>`).join('')}
        </div>
      </div>
      <div class="set-card">
        <div class="set-title"><span class="set-title-ico">👥</span> Foydalanuvchilar</div>
        ${users.map(u=>`<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">
          <div class="av" style="${avStyle(u,36)};border-radius:50%">${avHtml(u,36,13)}</div>
          <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700;font-family:'Syne',sans-serif">${esc(u.name)}</div><div style="font-size:11px;color:var(--tx4)">u/${esc(u.username)} ${u.is_admin?'· <span style="color:var(--blu)">Admin</span>':''} ${u.is_banned?'· <span style="color:var(--red)">Bloklangan</span>':''}</div></div>
          <div style="display:flex;gap:6px">
            ${u.is_banned?`<button class="btn btn-ghost" style="padding:4px 10px;font-size:11px" onclick="adminAction('${u.id}','unban')">Ochish</button>`:`<button class="btn btn-danger" style="padding:4px 10px;font-size:11px" onclick="adminBanUser('${u.id}',false)">Bloklash</button>`}
            ${u.is_admin?`<button class="btn btn-ghost" style="padding:4px 10px;font-size:11px" onclick="adminAction('${u.id}','remove_admin')">Admin olish</button>`:`<button class="btn btn-ghost" style="padding:4px 10px;font-size:11px" onclick="adminAction('${u.id}','make_admin')">Admin qilish</button>`}
          </div>
        </div>`).join('')}
      </div>
      <div class="set-card">
        <div class="set-title"><span class="set-title-ico">🚩</span> Shikoyatlar (${reports.length})</div>
        ${reports.length ? reports.map(r=>`<div style="padding:10px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600">${esc(r.reason)}</div><div style="font-size:12px;color:var(--tx4)">${r.rname} tomonidan &middot; ${r.ago}</div><div style="margin-top:7px;display:flex;gap:6px"><button class="btn btn-ghost" style="padding:4px 10px;font-size:11px" onclick="adminResolve('${r.id}','resolved')">Hal qilindi</button><button class="btn btn-danger" style="padding:4px 10px;font-size:11px" onclick="adminResolve('${r.id}','dismissed')">Rad etish</button></div></div>`).join('') : '<div style="color:var(--tx4);font-size:13px">Shikoyatlar yo\'q</div>'}
      </div>`;
  } catch (e) { el.innerHTML = emptyEl('close', 'Xatolik', e.message); }
}
async function adminBanUser(id, isBanned) {
  if (isBanned) { try { await API.adminAction({ target_id:id, action:'unban' }); toast('Bloklash olib tashlandi'); loadAdmin(); } catch(e){toast(e.message);} return; }
  _pendingBanId = id;
  document.getElementById('ban-reason-inp').value = '';
  document.getElementById('ban-modal').classList.add('open');
  setTimeout(() => document.getElementById('ban-reason-inp')?.focus(), 100);
}
async function confirmBan() {
  const reason = (document.getElementById('ban-reason-inp').value||'').trim();
  if (!reason) { toast('Sabab kiriting'); return; }
  document.getElementById('ban-modal').classList.remove('open');
  try { await API.adminAction({ target_id:_pendingBanId, action:'ban', reason }); _pendingBanId=null; toast('Foydalanuvchi bloklandi'); loadAdmin(); } catch(e){toast(e.message);}
}
function closeBanModal() { document.getElementById('ban-modal').classList.remove('open'); _pendingBanId=null; }
async function adminAction(id, action) {
  try { await API.adminAction({ target_id:id, action }); toast('Yangilandi'); loadAdmin(); } catch(e){toast(e.message);}
}
async function adminResolve(id, status) {
  try { await API.adminResolve(id, status); toast('Hal qilindi'); loadAdmin(); } catch(e){toast(e.message);}
}

/* ═══ SAVED ═══ */
async function loadSavedPosts() {
  const el = document.getElementById('saved-cnt'); if (!el) return;
  el.innerHTML = spinner();
  try {
    const posts = await API.savedPosts(); el.innerHTML = '';
    if (!posts.length) { el.innerHTML = emptyEl('save', "Hali saqlangan postlar yo'q"); return; }
    posts.forEach((p,i) => { const d=document.createElement('div'); d.innerHTML=buildPost(p); const c=d.firstElementChild; c.style.animationDelay=(i*.04)+'s'; el.appendChild(c); });
  } catch(e) { el.innerHTML = emptyEl('close','Xatolik',e.message); }
}

/* export */
window.openCommunity=openCommunity; window.toggleJoin=toggleJoin; window.loadMyComs=loadMyComs; window.loadTopComs=loadTopComs;
window.openCreateCom=openCreateCom; window.closeCreateCom=closeCreateCom; window.doCreateCom=doCreateCom;
window.openSubmit=openSubmit; window.closeSubmit=closeSubmit; window.switchSubTab=switchSubTab; window.doSubmitPost=doSubmitPost; window.initComPicker=initComPicker;
window.onSearch=onSearch;
window.loadNotifs=loadNotifs; window.loadNotifCount=loadNotifCount; window.markNotifs=markNotifs; window.updNotifDot=updNotifDot; window.initNotifWS=initNotifWS;
window.loadConvos=loadConvos; window.openChat=openChat; window.addBubble=addBubble; window.sendMsg=sendMsg; window.startChat=startChat; window.initMsgWS=initMsgWS;
window.openUser=openUser; window.followUser=followUser; window.uploadAvatar=uploadAvatar; window.uploadBanner=uploadBanner;
window.loadSettings=loadSettings; window.saveProfile=saveProfile; window.doChpass=doChpass;
window.loadAdmin=loadAdmin; window.adminBanUser=adminBanUser; window.confirmBan=confirmBan; window.closeBanModal=closeBanModal; window.adminAction=adminAction; window.adminResolve=adminResolve;
window.loadSavedPosts=loadSavedPosts;
