'use strict';

/* ═══ TOKEN ═══ */
const LS_KEY = 'ih_tok';
function tokLoad() { try { return localStorage.getItem(LS_KEY) || null; } catch { return null; } }
function tokSave(t) { try { localStorage.setItem(LS_KEY, t); } catch {} }
function tokClear() { try { localStorage.removeItem(LS_KEY); } catch {} }

/* ═══ AUTH MODAL (overlay for guests) ═══ */
let _authTab = 'login';
function showAuthModal() { document.getElementById('auth-modal').classList.add('open'); }
function closeAuthModal() { document.getElementById('auth-modal').classList.remove('open'); }
function switchAmTab(t) {
  _authTab = t;
  document.querySelectorAll('#auth-modal .auth-tab').forEach(b => b.classList.toggle('active', b.dataset.t === t));
  document.getElementById('am-login-form').style.display  = t === 'login'    ? 'block' : 'none';
  document.getElementById('am-reg-form').style.display    = t === 'register' ? 'block' : 'none';
  document.getElementById('am-forgot-form').style.display = t === 'forgot'   ? 'block' : 'none';
  document.getElementById('am-err').classList.remove('on');
}
function requireAuth(cb) { if (window._me) { cb && cb(); return true; } showAuthModal(); return false; }

async function doAmLogin() {
  const u = (document.getElementById('am-uname').value || '').trim();
  const p = (document.getElementById('am-pass').value  || '').trim();
  const err = document.getElementById('am-err');
  err.classList.remove('on');
  if (!u || !p) { err.textContent = 'Login va parolni kiriting'; err.classList.add('on'); return; }
  const btn = document.getElementById('am-login-btn');
  btn.disabled = true; btn.textContent = '...';
  try {
    const d = await API.login(u, p);
    tokSave(d.token); Tok.set(d.token);
    closeAuthModal();
    await boot(d.user);
  } catch (e) {
    err.textContent = e.message; err.classList.add('on');
  } finally { btn.disabled = false; btn.textContent = 'Kirish'; }
}

async function doAmReg() {
  const name = (document.getElementById('am-reg-name').value || '').trim();
  const user = (document.getElementById('am-reg-user').value || '').trim();
  const email= (document.getElementById('am-reg-email').value|| '').trim();
  const pass = (document.getElementById('am-reg-pass').value || '').trim();
  const err  = document.getElementById('am-err');
  err.classList.remove('on');
  if (!name || !user || !email || !pass) { err.textContent = "Barcha maydonlarni to'ldiring"; err.classList.add('on'); return; }
  const btn = document.getElementById('am-reg-btn');
  btn.disabled = true; btn.textContent = '...';
  try {
    const d = await API.register(name, user, email, pass);
    tokSave(d.token); Tok.set(d.token);
    closeAuthModal();
    await boot(d.user);
  } catch (e) {
    err.textContent = e.message; err.classList.add('on');
  } finally { btn.disabled = false; btn.textContent = "Ro'yxatdan o'tish"; }
}

async function doAmForgot() {
  const uname = (document.getElementById('am-forgot-uname').value || '').trim();
  const err   = document.getElementById('am-err');
  err.classList.remove('on');
  if (!uname) { err.textContent = "Username kiriting"; err.classList.add('on'); return; }
  const btn = document.getElementById('am-forgot-btn');
  btn.disabled = true; btn.textContent = '...';
  try {
    await API.forgotPass(uname);
    err.style.cssText = 'background:rgba(46,158,91,.08);border-color:rgba(46,158,91,.2);color:var(--grn);margin-bottom:12px;display:block;padding:9px 13px;font-size:13px;border-radius:var(--r)';
    err.textContent = '✅ Parol tiklash havolasi emailga yuborildi!';
  } catch (e) {
    err.textContent = e.message; err.classList.add('on');
  } finally { btn.disabled = false; btn.textContent = 'Yuborish'; }
}

/* ═══ RESET PASSWORD (URL token) ═══ */
async function checkResetToken() {
  const params = new URLSearchParams(location.search);
  const token  = params.get('reset_token');
  if (!token) return;
  history.replaceState({}, '', location.pathname);

  const modal = document.getElementById('reset-modal');
  if (!modal) return;
  modal.classList.add('open');
  document.getElementById('reset-checking').style.display  = 'block';
  document.getElementById('reset-form').style.display      = 'none';
  document.getElementById('reset-invalid').style.display   = 'none';
  document.getElementById('reset-done').style.display      = 'none';

  try {
    const d = await API.verifyReset(token);
    document.getElementById('reset-checking').style.display = 'none';
    if (d.valid) {
      document.getElementById('reset-uname-label').textContent = d.username || '';
      document.getElementById('reset-form').style.display = 'block';
      document.getElementById('reset-new').focus();
      window._resetToken = token;
    } else {
      document.getElementById('reset-invalid').style.display = 'block';
    }
  } catch {
    document.getElementById('reset-checking').style.display  = 'none';
    document.getElementById('reset-invalid').style.display   = 'block';
  }
}

async function doReset() {
  const newP = (document.getElementById('reset-new').value    || '').trim();
  const conf = (document.getElementById('reset-confirm').value|| '').trim();
  const err  = document.getElementById('reset-err');
  err.classList.remove('on');
  if (!newP || !conf) { err.textContent = "Maydonlarni to'ldiring"; err.classList.add('on'); return; }
  if (newP.length < 6) { err.textContent = 'Kamida 6 belgi'; err.classList.add('on'); return; }
  if (newP !== conf)   { err.textContent = 'Parollar mos emas'; err.classList.add('on'); return; }
  const btn = document.getElementById('reset-btn');
  btn.disabled = true; btn.textContent = '...';
  try {
    const d = await API.resetPass(window._resetToken, newP);
    document.getElementById('reset-form').style.display = 'none';
    document.getElementById('reset-done').style.display = 'block';
    if (d.token) {
      tokSave(d.token); Tok.set(d.token);
      setTimeout(async () => { document.getElementById('reset-modal').classList.remove('open'); await boot(d.user); }, 1600);
    }
  } catch (e) {
    err.textContent = e.message; err.classList.add('on');
    btn.disabled = false; btn.textContent = 'Saqlash';
  }
}
function closeReset() { document.getElementById('reset-modal').classList.remove('open'); }
function openForgotFromReset() { closeReset(); showAuthModal(); switchAmTab('forgot'); }

/* ═══ TOPBAR SYNC ═══ */
function syncTopbar(u) {
  const av = document.getElementById('tb-av');
  if (av) {
    av.style.cssText = avStyle(u, 28) + 'border-radius:50%;';
    av.innerHTML = u.avatar
      ? `<img src="${esc(u.avatar)}" style="width:100%;height:100%;object-fit:cover" alt="">`
      : `<span style="font-size:10px;font-weight:800;color:#fff">${initials(u.name || u.username)}</span>`;
  }
  const nm = document.getElementById('tb-av-name');   if (nm) nm.textContent = u.name || u.username;
  const kr = document.getElementById('tb-av-karma');  if (kr) kr.textContent = fmtNum(u.karma || 0) + ' karma';
  const sb = document.getElementById('sb-av');
  if (sb) {
    sb.style.cssText = avStyle(u, 30) + 'border-radius:50%;';
    sb.innerHTML = u.avatar
      ? `<img src="${esc(u.avatar)}" style="width:100%;height:100%;object-fit:cover" alt="">`
      : `<span style="font-size:10px;font-weight:800;color:#fff">${initials(u.name || u.username)}</span>`;
  }
  const sn = document.getElementById('sb-uname');     if (sn) sn.textContent = 'u/' + (u.username || '');
  const sk = document.getElementById('sb-karma');     if (sk) sk.textContent = fmtNum(u.karma || 0) + ' karma';
  document.getElementById('admin-lsb')?.style.setProperty('display', u.is_admin ? 'flex' : 'none');
}

/* ═══ BOOT ═══ */
async function boot(initialUser) {
  document.getElementById('auth')?.remove();
  const app = document.getElementById('app');
  app.classList.add('vis');

  window._me = initialUser || await API.me();
  syncTopbar(window._me);

  WS.connect(Tok.get());
  initFeedWS(); initMsgWS(); initNotifWS();

  await Promise.all([
    loadFeed(true),
    loadNotifCount(),
    loadConvos(),
    loadMyComs(),
    loadTopComs(),
    initComPicker(),
  ]);
  initScrollFeed();

  // Nav buttons
  document.querySelectorAll('.lsb-btn[data-sec]').forEach(btn => {
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
    clone.addEventListener('click', () => {
      const s = clone.dataset.sec;
      goSec(s);
      if (s === 'notifs')    { loadNotifs(); markNotifs(); }
      if (s === 'msgs')      loadConvos();
      if (s === 'user')      openUser(window._me.id);
      if (s === 'settings')  loadSettings();
      if (s === 'saved')     loadSavedPosts();
      if (s === 'admin')     loadAdmin();
      if (s === 'popular')   loadTopComs();
    });
  });

  // Theme
  const savedTheme = localStorage.getItem('ih_theme') || 'light';
  if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  updateThemeBtn();
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('ih_theme', next);
  updateThemeBtn();
}
function updateThemeBtn() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const btn = document.getElementById('theme-btn');
  if (btn) btn.innerHTML = isDark ? IC.sun : IC.moon;
}

function doLogout() {
  tokClear(); Tok.clr(); WS.disconnect();
  window._me = null;
  location.reload();
}

/* ═══ SEARCH ═══ */
function onTopSearch(e) {
  const q = (e.target.value || '').trim();
  if (q.length > 1) onSearch(q);
}

/* ═══ INIT ═══ */
document.addEventListener('DOMContentLoaded', async () => {
  // Theme
  const savedTheme = localStorage.getItem('ih_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeBtn();

  // Check reset token in URL
  await checkResetToken();

  // Try auto-login
  const tok = tokLoad();
  if (tok) {
    Tok.set(tok);
    try {
      const user = await API.me();
      await boot(user);
    } catch {
      tokClear();
      // Show guest mode or auth screen
    }
  }
});

window.showAuthModal = showAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAmTab = switchAmTab;
window.requireAuth = requireAuth;
window.doAmLogin = doAmLogin;
window.doAmReg = doAmReg;
window.doAmForgot = doAmForgot;
window.doReset = doReset;
window.closeReset = closeReset;
window.openForgotFromReset = openForgotFromReset;
window.syncTopbar = syncTopbar;
window.boot = boot;
window.toggleTheme = toggleTheme;
window.doLogout = doLogout;
window.onTopSearch = onTopSearch;
