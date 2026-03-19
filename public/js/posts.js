'use strict';
let _feedSort = 'hot', _feedOff = 0, _feedBusy = false;
let _comSort = 'hot', _comOff = 0;
let _curCom = null;

/* ═══ BUILD POST ═══ */
function buildPost(p, isDetail = false) {
  const sc = p.score || 0;
  const uV = p.my_vote === 1, dV = p.my_vote === -1;
  const scCls = uV ? ' up' : dV ? ' dn' : '';
  const isMine = p.user_id === window._me?.id;
  return `
<div class="post-card${isDetail ? ' detail' : ''}" id="pc-${p.id}" ${!isDetail ? `onclick="openPost('${p.id}')"` : ''}>
  <div class="vote-col">
    <button class="v-btn up${uV ? ' voted' : ''}" onclick="event.stopPropagation();votePost('${p.id}',1)">${IC.up}</button>
    <span class="v-score${scCls}">${fmtNum(sc)}</span>
    <button class="v-btn dn${dV ? ' voted' : ''}" onclick="event.stopPropagation();votePost('${p.id}',-1)">${IC.dn}</button>
  </div>
  <div class="post-body">
    <div class="post-meta">
      <span class="post-com-link" onclick="event.stopPropagation();openCommunity('${esc(p.cslug)}')">
        <span class="com-circle" style="background:${esc(p.ccolor || '#C8922A')}"></span>
        <strong>${esc(p.cslug)}</strong>
      </span>
      <span class="post-by">
        u/<a onclick="event.stopPropagation();event.preventDefault();openUser('${esc(p.username)}')">${esc(p.username)}</a>
        &middot; ${p.ago || ''}
      </span>
      ${p.flair ? `<span class="post-flair" style="color:${esc(p.ccolor||'#C8922A')};border-color:${esc(p.ccolor||'#C8922A')}44">${esc(p.flair)}</span>` : ''}
    </div>
    <div class="post-title">${esc(p.title)}</div>
    ${p.link ? `<div class="post-link-tag">${IC.link} <a href="${esc(p.link)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${esc(p.link.length > 60 ? p.link.slice(0,60)+'...' : p.link)}</a></div>` : ''}
    ${p.image ? `<div class="post-img" onclick="event.stopPropagation()"><img src="${esc(p.image)}" alt="" loading="lazy"></div>` : ''}
    ${p.body && !isDetail ? `<div class="post-preview">${esc(p.body)}</div>` : ''}
    ${p.body && isDetail ? `<div style="font-size:14.5px;color:var(--tx2);line-height:1.75;margin-bottom:12px;white-space:pre-wrap;word-break:break-word">${esc(p.body)}</div>` : ''}
    <div class="post-acts" onclick="event.stopPropagation()">
      <button class="pa" onclick="openPost('${p.id}')">${IC.cmt} ${fmtNum(p.comment_count || 0)} Izoh</button>
      <button class="pa${p.saved ? ' saved' : ''}" id="sv-${p.id}" onclick="savePost('${p.id}',this)">${IC.save} ${p.saved ? 'Saqlangan' : 'Saqlash'}</button>
      <button class="pa" onclick="copyLink('${p.id}')">${IC.share} Ulashish</button>
      ${isMine ? `<button class="pa pa-del" onclick="confirmDelPost('${p.id}')">${IC.trash}</button>` : ''}
    </div>
  </div>
</div>`;
}

/* ═══ FEED ═══ */
async function loadFeed(reset = true) {
  if (_feedBusy && !reset) return;
  _feedBusy = true;
  const cnt = document.getElementById('feed-cnt'); if (!cnt) { _feedBusy = false; return; }
  if (reset) { _feedOff = 0; cnt.innerHTML = spinner(); }
  try {
    const posts = await API.posts(_feedSort, _feedOff);
    if (reset) cnt.innerHTML = '';
    if (!posts.length && reset) { cnt.innerHTML = emptyEl('save', "Hali postlar yo'q", "Birinchi post siz bo'ling!"); _feedBusy = false; return; }
    if (!posts.length) { _feedBusy = false; return; }
    posts.forEach((p, i) => {
      const d = document.createElement('div'); d.innerHTML = buildPost(p);
      const c = d.firstElementChild;
      if (reset) c.style.animationDelay = (i * .04) + 's';
      cnt.appendChild(c);
    });
    _feedOff += posts.length;
  } catch (e) { if (reset) cnt.innerHTML = emptyEl('close', 'Xatolik', e.message); }
  _feedBusy = false;
}

function setFeedSort(sort) {
  _feedSort = sort;
  document.querySelectorAll('#sec-home .sort-btn').forEach(b => b.classList.toggle('active', b.dataset.sort === sort));
  loadFeed(true);
}

async function loadComFeed(slug, sort = 'hot', reset = true) {
  if (reset) { _comOff = 0; _comSort = sort; }
  const cnt = document.getElementById('com-feed-cnt'); if (!cnt) return;
  if (reset) cnt.innerHTML = spinner();
  try {
    const posts = await API.comPosts(slug, _comSort, _comOff);
    if (reset) cnt.innerHTML = '';
    if (!posts.length && reset) { cnt.innerHTML = emptyEl('save', "Hali postlar yo'q", "Bu jamoada birinchi bo'ling!"); return; }
    posts.forEach((p, i) => {
      const d = document.createElement('div'); d.innerHTML = buildPost(p);
      const c = d.firstElementChild; if (reset) c.style.animationDelay = (i * .04) + 's';
      cnt.appendChild(c);
    });
    _comOff += posts.length;
  } catch (e) { if (reset) cnt.innerHTML = emptyEl('close', 'Xatolik', e.message); }
}

/* ═══ POST DETAIL ═══ */
async function openPost(id) {
  goSec('post');
  const cnt = document.getElementById('post-detail'); cnt.innerHTML = spinner();
  try {
    const post = await API.getPost(id);
    cnt.innerHTML = '';
    const pd = document.createElement('div'); pd.innerHTML = buildPost(post, true); cnt.appendChild(pd.firstElementChild);
    const cb = document.createElement('div');
    cb.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;margin-bottom:10px;box-shadow:var(--shadow)';
    cb.innerHTML = `<div style="font-size:13px;font-weight:700;margin-bottom:10px;color:var(--tx2)">Izoh qoldiring</div>
      <textarea class="reply-ta" id="root-ta" placeholder="Fikringizni yozing..." style="margin-bottom:10px"></textarea>
      <div style="display:flex;justify-content:flex-end">
        <button class="btn btn-gold" onclick="submitRootCmt('${id}')">${IC.send} Yuborish</button>
      </div>`;
    cnt.appendChild(cb);
    const cc = document.createElement('div'); cc.id = 'cmts-cnt'; cnt.appendChild(cc);
    renderComments(post.comments || [], cc, id);
  } catch (e) { cnt.innerHTML = emptyEl('close', 'Post topilmadi', e.message); }
}

/* ═══ COMMENTS ═══ */
function buildCmtNode(c, postId, depth = 0) {
  const div = document.createElement('div');
  div.className = `cmt${depth === 0 ? ' d0' : ''}`;
  div.id = `cmt-${c.id}`;
  div.style.animationDelay = (depth * .04) + 's';
  const isMe = c.user_id === window._me?.id;
  const uV = c.my_vote === 1, dV = c.my_vote === -1;
  div.innerHTML = `
    <div class="cmt-hd">
      <div class="av" style="${avStyle({ color: c.color }, 24)};border-radius:50%">${avHtml({ ...c, name: c.username }, 24, 9)}</div>
      <span class="cmt-author" onclick="openUser('${esc(c.username)}')">${esc(c.username)}</span>
      <span class="cmt-score">${fmtNum(c.score || 0)}</span>
      <span class="cmt-ago">${c.ago || ''}</span>
    </div>
    <div class="cmt-body${c.is_deleted ? ' deleted' : ''}">${c.is_deleted ? "[o'chirildi]" : esc(c.body)}</div>
    <div class="cmt-acts">
      <button class="ca up${uV ? ' voted' : ''}" onclick="voteCmt('${c.id}',1,this)">${IC.up} ${fmtNum(c.score || 0)}</button>
      <button class="ca dn${dV ? ' voted' : ''}" onclick="voteCmt('${c.id}',-1,this)">${IC.dn}</button>
      <button class="ca" onclick="toggleReplyForm('${c.id}')">${IC.cmt} Javob</button>
      ${isMe && !c.is_deleted ? `<button class="ca ca-del" onclick="delCmt('${c.id}')">${IC.trash}</button>` : ''}
    </div>
    <div class="reply-form" id="rf-${c.id}">
      <textarea class="reply-ta" id="ri-${c.id}" placeholder="Javob yozing..."></textarea>
      <div class="reply-acts">
        <button class="btn btn-ghost" style="padding:6px 14px;font-size:12px" onclick="toggleReplyForm('${c.id}')">Bekor</button>
        <button class="btn btn-gold" style="padding:6px 14px;font-size:12px" onclick="submitReply('${postId}','${c.id}')">${IC.send} Javob</button>
      </div>
    </div>
    <div class="cmt-children" id="cc-${c.id}"></div>`;
  return div;
}
function renderComments(comments, container, postId, depth = 0) {
  if (!comments.length && depth === 0) { container.innerHTML = emptyEl('cmt', "Hali izoh yo'q", "Birinchi izoh siz bo'ling!"); return; }
  const byParent = {};
  comments.forEach(c => { const k = c.parent_id || 'root'; (byParent[k] = byParent[k] || []).push(c); });
  function renderTree(parentId, el, d) {
    (byParent[parentId || 'root'] || []).forEach(c => {
      const node = buildCmtNode(c, postId, d);
      el.appendChild(node);
      renderTree(c.id, node.querySelector(`#cc-${c.id}`), d + 1);
    });
  }
  renderTree(null, container, 0);
}
async function submitRootCmt(postId) {
  const ta = document.getElementById('root-ta');
  const body = (ta.value || '').trim(); if (!body) return;
  try {
    const cmt = await API.addComment(postId, body, null);
    ta.value = '';
    const cnt = document.getElementById('cmts-cnt');
    cnt.querySelector('.empty')?.remove();
    const node = buildCmtNode({ ...cmt, parent_id: null }, postId, 0);
    cnt.prepend(node);
    toast('Izoh qo\'shildi');
  } catch (e) { toast(e.message); }
}
function toggleReplyForm(cid) { document.getElementById('rf-' + cid)?.classList.toggle('open'); }
async function submitReply(postId, parentId) {
  const ta = document.getElementById('ri-' + parentId);
  const body = (ta.value || '').trim(); if (!body) return;
  try {
    const cmt = await API.addComment(postId, body, parentId);
    ta.value = ''; toggleReplyForm(parentId);
    const children = document.getElementById('cc-' + parentId);
    if (children) { const node = buildCmtNode({ ...cmt, parent_id: parentId }, postId, 1); children.prepend(node); }
    toast('Javob qo\'shildi');
  } catch (e) { toast(e.message); }
}

/* ═══ VOTING ═══ */
async function votePost(id, vote) {
  try {
    const d = await API.votePost(id, vote);
    const card = document.getElementById('pc-' + id); if (!card) return;
    const sc = card.querySelector('.v-score');
    if (sc) { sc.textContent = fmtNum(d.score); sc.className = 'v-score' + (d.my_vote === 1 ? ' up' : d.my_vote === -1 ? ' dn' : ''); }
    card.querySelector('.v-btn.up').classList.toggle('voted', d.my_vote === 1);
    card.querySelector('.v-btn.dn').classList.toggle('voted', d.my_vote === -1);
  } catch (e) { toast(e.message); }
}
async function voteCmt(id, vote, btn) {
  try {
    const d = await API.voteComment(id, vote);
    const row = document.getElementById('cmt-' + id); if (!row) return;
    row.querySelector('.ca.up').classList.toggle('voted', d.my_vote === 1);
    row.querySelector('.ca.dn').classList.toggle('voted', d.my_vote === -1);
    row.querySelector('.ca.up').innerHTML = `${IC.up} ${fmtNum(d.score)}`;
  } catch (e) { toast(e.message); }
}
async function savePost(id, btn) {
  try {
    const d = await API.savePost(id);
    if (btn) { btn.className = 'pa' + (d.saved ? ' saved' : ''); btn.innerHTML = `${IC.save} ${d.saved ? 'Saqlangan' : 'Saqlash'}`; }
    toast(d.saved ? 'Saqlandi' : 'Bekor qilindi');
  } catch (e) { toast(e.message); }
}
function copyLink(id) { navigator.clipboard?.writeText(`${location.origin}/?post=${id}`).then(() => toast('Havola nusxalandi')); }

/* ═══ DELETE ═══ */
let _delId = null;
function confirmDelPost(id) { _delId = id; document.getElementById('del-overlay').classList.add('open'); }
function closeDelPost() { _delId = null; document.getElementById('del-overlay').classList.remove('open'); }
async function doDelPost() {
  if (!_delId) return;
  try { await API.deletePost(_delId); closeDelPost(); toast("Post o'chirildi"); }
  catch (e) { toast(e.message); }
}
async function delCmt(id) {
  if (!confirm("Izohni o'chirish?")) return;
  try {
    await API.deleteComment(id);
    const b = document.getElementById('cmt-' + id)?.querySelector('.cmt-body');
    if (b) { b.className = 'cmt-body deleted'; b.textContent = "[o'chirildi]"; }
    toast("Izoh o'chirildi");
  } catch (e) { toast(e.message); }
}

/* ═══ WS ═══ */
function initFeedWS() {
  WS.on('new_post', d => {
    if (curSec() === 'home') {
      const cnt = document.getElementById('feed-cnt'); if (!cnt) return;
      cnt.querySelector('.empty')?.remove();
      const dv = document.createElement('div'); dv.innerHTML = buildPost(d); cnt.prepend(dv.firstElementChild); _feedOff++;
    }
  });
  WS.on('del_post', d => { document.getElementById('pc-' + d.id)?.remove(); });
  WS.on('vote_post', d => {
    const c = document.getElementById('pc-' + d.postId); if (!c) return;
    const sc = c.querySelector('.v-score'); if (sc) sc.textContent = fmtNum(d.score);
  });
  WS.on('new_comment', d => {
    document.querySelectorAll(`#pc-${d.postId} .pa`).forEach(b => {
      if (b.textContent.includes('Izoh')) { const n = parseInt(b.textContent.replace(/\D/g,''))||0; b.innerHTML = `${IC.cmt} ${fmtNum(n+1)} Izoh`; }
    });
    if (curSec() === 'post') {
      const cnt = document.getElementById('cmts-cnt');
      if (cnt && !d.comment.parent_id) { cnt.querySelector('.empty')?.remove(); cnt.prepend(buildCmtNode(d.comment, d.postId, 0)); }
    }
  });
  WS.on('del_comment', d => {
    const b = document.getElementById('cmt-' + d.commentId)?.querySelector('.cmt-body');
    if (b) { b.className = 'cmt-body deleted'; b.textContent = "[o'chirildi]"; }
  });
}

function initScrollFeed() {
  const fa = document.getElementById('feed-area'); if (!fa) return;
  fa.addEventListener('scroll', () => {
    if (fa.scrollTop + fa.clientHeight >= fa.scrollHeight - 300) {
      if (curSec() === 'home') loadFeed(false);
      if (curSec() === 'community' && _curCom) loadComFeed(_curCom, _comSort, false);
    }
  }, { passive: true });
}

window.buildPost=buildPost; window.loadFeed=loadFeed; window.setFeedSort=setFeedSort;
window.loadComFeed=loadComFeed; window.openPost=openPost;
window.renderComments=renderComments; window.buildCmtNode=buildCmtNode;
window.submitRootCmt=submitRootCmt; window.toggleReplyForm=toggleReplyForm; window.submitReply=submitReply;
window.votePost=votePost; window.voteCmt=voteCmt; window.savePost=savePost; window.copyLink=copyLink;
window.confirmDelPost=confirmDelPost; window.closeDelPost=closeDelPost; window.doDelPost=doDelPost; window.delCmt=delCmt;
window.initFeedWS=initFeedWS; window.initScrollFeed=initScrollFeed;
window._curCom = null;
