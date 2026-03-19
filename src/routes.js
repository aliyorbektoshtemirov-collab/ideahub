'use strict';
const fs   = require('fs');
const path = require('path');
const url  = require('url');
const { db, Q } = require('./db');
const { uid, hashPass, makeToken, getAuth, timeAgo, readBody, parseMultipart, json, randColor } = require('./helpers');
const ws = require('./ws');

const UPLOAD = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD)) fs.mkdirSync(UPLOAD, { recursive: true });

function fmt(r) { return { ...r, ago: timeAgo(r.created_at) }; }
function fmtPost(p, uid2) {
  const v = uid2 ? (Q.pvGet.get(uid2, p.id) || { vote: 0 }) : { vote: 0 };
  const s = uid2 ? !!Q.svCheck.get(uid2, p.id) : false;
  return { ...fmt(p), my_vote: v.vote, saved: s };
}
function fmtCom(c, uid2) {
  return { ...c, is_member: uid2 ? !!Q.memCheck.get(uid2, c.id) : false, is_owner: c.owner_id === uid2 };
}
function fmtCmt(c, uid2) {
  const v = uid2 ? (Q.cvGet.get(uid2, c.id) || { vote: 0 }) : { vote: 0 };
  return { ...fmt(c), my_vote: v.vote };
}

async function route(req, res) {
  const parsed = url.parse(req.url, true);
  const p = parsed.pathname.replace(/\/$/, '') || '/';
  const q = parsed.query;
  const m = req.method;

  /* ── AUTH ── */
  if (p === '/api/auth/register' && m === 'POST') {
    const b = await readBody(req);
    const { username, name, email, password } = b;
    if (!username || !name || !email || !password) return json(res, { error: "Barcha maydonlarni to'ldiring" }, 400);
    if (password.length < 6) return json(res, { error: 'Parol kamida 6 belgi' }, 400);
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return json(res, { error: 'Username: 3-20 belgi, faqat harf/raqam/_' }, 400);
    if (Q.uExists.get(username, email)) return json(res, { error: 'Bu username yoki email band' }, 409);
    const id = uid();
    Q.uInsert.run(id, username.toLowerCase(), name, email.toLowerCase(), hashPass(password), randColor());
    return json(res, { token: makeToken(id), user: Q.uById.get(id) }, 201);
  }
  if (p === '/api/auth/login' && m === 'POST') {
    const b = await readBody(req);
    const { username, password } = b;
    if (!username || !password) return json(res, { error: 'Login va parolni kiriting' }, 400);
    const user = Q.uByLogin.get(username, username);
    if (!user || user.pass !== hashPass(password)) return json(res, { error: "Noto'g'ri login yoki parol" }, 401);
    if (user.is_banned) return json(res, { error: `Hisob bloklangan: ${user.ban_reason || ''}` }, 403);
    return json(res, { token: makeToken(user.id), user: Q.uById.get(user.id) });
  }
  if (p === '/api/auth/forgot' && m === 'POST') {
    const b = await readBody(req);
    const uname = (b.username || '').trim().toLowerCase();
    if (!uname) return json(res, { error: 'Username kiriting' }, 400);
    Q.rtClean.run();
    const user = Q.uByUsername.get(uname);
    if (user) {
      const token = require('crypto').randomBytes(32).toString('hex');
      Q.rtInsert.run(token, user.id, Math.floor(Date.now() / 1000) + 3600);
      const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
      const resetUrl = `${appUrl}/?reset_token=${token}`;
      // In dev mode: log to console
      console.log('\n=== PAROL TIKLASH ===');
      console.log(`Foydalanuvchi: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Havola: ${resetUrl}`);
      console.log('====================\n');
      // If Resend configured, send email
      if (process.env.RESEND_API_KEY) {
        try {
          const https = require('https');
          const body = JSON.stringify({
            from: process.env.EMAIL_FROM || 'IdeaHub <noreply@ideahub.uz>',
            to: [user.email],
            subject: 'IdeaHub — Parolni tiklash',
            html: `<p>Salom ${user.username}!</p><p>Parolni tiklash uchun: <a href="${resetUrl}">${resetUrl}</a></p><p>Havola 1 soat amal qiladi.</p>`,
          });
          const r = https.request({ hostname: 'api.resend.com', path: '/emails', method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } });
          r.write(body); r.end();
        } catch (e) { console.error('Email error:', e.message); }
      }
    }
    return json(res, { ok: true }); // always ok — don't reveal existence
  }
  if (p === '/api/auth/reset/verify' && m === 'POST') {
    const b = await readBody(req);
    const rt = Q.rtGet.get(b.token || '');
    if (!rt) return json(res, { valid: false });
    const user = Q.uById.get(rt.user_id);
    return json(res, { valid: true, username: user?.username || '' });
  }
  if (p === '/api/auth/reset' && m === 'POST') {
    const b = await readBody(req);
    if (!b.token || !b.new_pass) return json(res, { error: 'Token va yangi parol kerak' }, 400);
    if (b.new_pass.length < 6) return json(res, { error: 'Parol kamida 6 belgi' }, 400);
    const rt = Q.rtGet.get(b.token);
    if (!rt) return json(res, { error: "Havola eskirgan yoki noto'g'ri" }, 400);
    Q.uUpdPass.run(hashPass(b.new_pass), rt.user_id);
    Q.rtUse.run(b.token);
    const user = Q.uById.get(rt.user_id);
    return json(res, { ok: true, token: makeToken(rt.user_id), user });
  }

  /* ── ME ── */
  if (p === '/api/me' && m === 'GET') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    return json(res, Q.uById.get(u2));
  }
  if (p === '/api/me' && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const b = await readBody(req);
    if (!b.name?.trim()) return json(res, { error: "Ism bo'sh bo'lmasin" }, 400);
    Q.uUpdProf.run(b.name.trim(), (b.bio || '').trim(), u2);
    return json(res, Q.uById.get(u2));
  }
  if (p === '/api/me/password' && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const b = await readBody(req);
    if (!b.old_pass || !b.new_pass) return json(res, { error: 'Eski va yangi parolni kiriting' }, 400);
    if (b.new_pass.length < 6) return json(res, { error: 'Parol kamida 6 belgi' }, 400);
    const user = Q.uByIdFull.get(u2);
    if (!user || user.pass !== hashPass(b.old_pass)) return json(res, { error: "Eski parol noto'g'ri" }, 400);
    Q.uUpdPass.run(hashPass(b.new_pass), u2);
    return json(res, { ok: true });
  }
  if (p === '/api/me/avatar' && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const { file } = await parseMultipart(req);
    if (!file) return json(res, { error: 'Rasm topilmadi' }, 400);
    const fn = `av_${u2}${file.ext}`; fs.writeFileSync(path.join(UPLOAD, fn), file.data);
    Q.uUpdAv.run(`/uploads/${fn}`, u2);
    return json(res, { avatar: `/uploads/${fn}` });
  }
  if (p === '/api/me/banner' && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const { file } = await parseMultipart(req);
    if (!file) return json(res, { error: 'Rasm topilmadi' }, 400);
    const fn = `bn_${u2}${file.ext}`; fs.writeFileSync(path.join(UPLOAD, fn), file.data);
    Q.uUpdBanner.run(`/uploads/${fn}`, u2);
    return json(res, { banner: `/uploads/${fn}` });
  }

  /* ── USERS ── */
  if (p === '/api/users/search' && m === 'GET') {
    const t = (q.q || '').toLowerCase().trim();
    if (!t) return json(res, []);
    return json(res, Q.uSearch.all(`%${t}%`, `%${t}%`).map(u => ({ ...u, online: ws.isOnline(u.id) })));
  }
  if (p.match(/^\/api\/users\/[^/]+$/) && m === 'GET') {
    const u2 = getAuth(req);
    const param = p.split('/')[3];
    const user = Q.uBySlug.get(param, param);
    if (!user) return json(res, { error: 'Topilmadi' }, 404);
    const posts = Q.pByUser.all(user.id).map(r => fmtPost(r, u2));
    const followers = Q.fwFollowers.get(user.id).c;
    const following = Q.fwFollowing.get(user.id).c;
    const is_following = u2 ? !!Q.fwCheck.get(u2, user.id) : false;
    const is_me = user.id === u2;
    return json(res, { ...user, posts, followers, following, is_following, is_me, online: ws.isOnline(user.id) });
  }
  if (p.match(/^\/api\/users\/[^/]+\/follow$/) && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const target = Q.uBySlug.get(p.split('/')[3], p.split('/')[3]);
    if (!target || target.id === u2) return json(res, { error: 'Topilmadi' }, 404);
    if (Q.fwCheck.get(u2, target.id)) {
      Q.fwDelete.run(u2, target.id);
      return json(res, { following: false });
    }
    Q.fwInsert.run(u2, target.id);
    const from = Q.uById.get(u2);
    const nid = uid();
    Q.nInsert.run(nid, target.id, u2, 'follow', null, null, `${from.name} sizni kuzata boshladi`);
    ws.sendTo(target.id, { type: 'notif', data: { msg: `${from.name} sizni kuzata boshladi`, is_read: 0, ago: 'Hozir' } });
    return json(res, { following: true });
  }

  /* ── COMMUNITIES ── */
  if (p === '/api/communities' && m === 'GET') {
    const u2 = getAuth(req);
    return json(res, Q.comAll.all().map(c => fmtCom(c, u2)));
  }
  if (p === '/api/communities/top' && m === 'GET') {
    const u2 = getAuth(req);
    return json(res, Q.comTop.all().map(c => fmtCom(c, u2)));
  }
  if (p === '/api/communities/mine' && m === 'GET') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    return json(res, Q.comMine.all(u2).map(c => fmtCom(c, u2)));
  }
  if (p === '/api/communities' && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const b = await readBody(req);
    const slug = (b.slug || '').trim().toLowerCase();
    const name = (b.name || '').trim();
    if (!slug || !name) return json(res, { error: 'Slug va nom kerak' }, 400);
    if (!/^[a-z0-9_]{2,25}$/.test(slug)) return json(res, { error: "Slug: 2-25 belgi, kichik harf/raqam/_" }, 400);
    if (Q.comBySlug.get(slug)) return json(res, { error: 'Bu nom band' }, 409);
    const id = uid();
    Q.comInsert.run(id, slug, name, b.description || '', b.color || randColor(), u2);
    Q.memJoin.run(u2, id);
    Q.comIncMem.run(id);
    return json(res, fmtCom(Q.comById.get(id), u2), 201);
  }
  if (p.match(/^\/api\/communities\/[^/]+$/) && m === 'GET') {
    const u2 = getAuth(req);
    const com = Q.comBySlug.get(p.split('/')[3]);
    if (!com) return json(res, { error: 'Topilmadi' }, 404);
    return json(res, fmtCom(com, u2));
  }
  if (p.match(/^\/api\/communities\/[^/]+$/) && m === 'PUT') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const com = Q.comBySlug.get(p.split('/')[3]);
    if (!com || com.owner_id !== u2) return json(res, { error: "Ruxsat yo'q" }, 403);
    const b = await readBody(req);
    Q.comUpdate.run(b.name || com.name, b.description ?? com.description, b.rules ?? com.rules, b.color || com.color, com.id);
    return json(res, fmtCom(Q.comById.get(com.id), u2));
  }
  if (p.match(/^\/api\/communities\/[^/]+\/join$/) && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const com = Q.comBySlug.get(p.split('/')[3]);
    if (!com) return json(res, { error: 'Topilmadi' }, 404);
    if (Q.memCheck.get(u2, com.id)) { Q.memLeave.run(u2, com.id); Q.comDecMem.run(com.id); return json(res, { joined: false }); }
    Q.memJoin.run(u2, com.id); Q.comIncMem.run(com.id);
    return json(res, { joined: true });
  }

  /* ── POSTS ── */
  if (p === '/api/posts' && m === 'GET') {
    const u2 = getAuth(req);
    const off = parseInt(q.offset || '0') || 0;
    return json(res, (q.sort === 'new' ? Q.pNew : Q.pHot).all(off).map(r => fmtPost(r, u2)));
  }
  if (p.match(/^\/api\/communities\/[^/]+\/posts$/) && m === 'GET') {
    const u2 = getAuth(req);
    const slug = p.split('/')[3];
    const off = parseInt(q.offset || '0') || 0;
    return json(res, (q.sort === 'new' ? Q.pComNew : Q.pCom).all(slug, off).map(r => fmtPost(r, u2)));
  }
  if (p === '/api/posts/saved' && m === 'GET') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    return json(res, Q.pSaved.all(u2).map(r => fmtPost(r, u2)));
  }
  if (p.match(/^\/api\/posts\/[^/]+$/) && m === 'GET') {
    const u2 = getAuth(req);
    const post = Q.pOne.get(p.split('/')[3]);
    if (!post) return json(res, { error: 'Topilmadi' }, 404);
    const comments = Q.cmByPost.all(post.id).map(c => fmtCmt(c, u2));
    return json(res, { ...fmtPost(post, u2), comments });
  }
  if (p === '/api/posts' && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const ct = req.headers['content-type'] || '';
    let title = '', body = '', comSlug = '', type = 'text', link = null, image = null, flair = null;
    if (ct.includes('multipart')) {
      const { fields, file } = await parseMultipart(req);
      title = (fields.title || '').trim(); body = (fields.body || '').trim();
      comSlug = (fields.community || '').trim(); type = fields.type || 'text';
      link = fields.link || null; flair = fields.flair || null;
      if (file) { const fn = uid() + file.ext; fs.writeFileSync(path.join(UPLOAD, fn), file.data); image = `/uploads/${fn}`; type = 'image'; }
    } else {
      const b = await readBody(req);
      title = (b.title || '').trim(); body = (b.body || '').trim();
      comSlug = (b.community || '').trim(); type = b.type || 'text';
      link = b.link || null; flair = b.flair || null;
    }
    if (!title) return json(res, { error: 'Sarlavha kerak' }, 400);
    if (!comSlug) return json(res, { error: 'Jamoa tanlang' }, 400);
    const com = Q.comBySlug.get(comSlug);
    if (!com) return json(res, { error: 'Jamoa topilmadi' }, 404);
    const pid = uid();
    Q.pInsert.run(pid, u2, com.id, title, body, link, image, type, flair);
    Q.pScore.run(1, 1, 0, pid);
    Q.pvUpsert.run(u2, pid, 1);
    Q.uKarma.run(1, u2);
    const post = fmtPost(Q.pOne.get(pid), u2);
    ws.sendAll({ type: 'new_post', data: post });
    return json(res, post, 201);
  }
  if (p.match(/^\/api\/posts\/[^/]+$/) && m === 'DELETE') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const pid = p.split('/')[3];
    const own = Q.pOwner.get(pid); if (!own) return json(res, { error: 'Topilmadi' }, 404);
    const user = Q.uById.get(u2);
    if (own.user_id !== u2 && !user?.is_admin) return json(res, { error: "Ruxsat yo'q" }, 403);
    Q.pDelete.run(pid);
    ws.sendAll({ type: 'del_post', data: { id: pid } });
    return json(res, { ok: true });
  }
  if (p.match(/^\/api\/posts\/[^/]+$/) && m === 'PUT') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const pid = p.split('/')[3];
    const b = await readBody(req);
    if (!b.title?.trim()) return json(res, { error: 'Sarlavha kerak' }, 400);
    Q.pUpdate.run(b.title.trim(), (b.body || '').trim(), pid, u2);
    return json(res, fmtPost(Q.pOne.get(pid), u2));
  }
  if (p.match(/^\/api\/posts\/[^/]+\/vote$/) && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const pid = p.split('/')[3];
    const own = Q.pOwner.get(pid); if (!own) return json(res, { error: 'Topilmadi' }, 404);
    const b = await readBody(req);
    const vote = parseInt(b.vote);
    if (![1, -1].includes(vote)) return json(res, { error: 'Vote 1 yoki -1' }, 400);
    const ex = Q.pvGet.get(u2, pid);
    let myVote = vote;
    if (ex && ex.vote === vote) { Q.pvDelete.run(u2, pid); myVote = 0; }
    else Q.pvUpsert.run(u2, pid, vote);
    const c = Q.pvCount.get(pid);
    const score = c.up - c.dn;
    Q.pScore.run(score, c.up, c.dn, pid);
    if (myVote === 1 && own.user_id !== u2) Q.uKarma.run(1, own.user_id);
    if (myVote === -1 && own.user_id !== u2) Q.uKarma.run(-1, own.user_id);
    ws.sendAll({ type: 'vote_post', data: { postId: pid, score, upvotes: c.up, downvotes: c.dn, vote: myVote } });
    return json(res, { score, upvotes: c.up, downvotes: c.dn, my_vote: myVote });
  }
  if (p.match(/^\/api\/posts\/[^/]+\/save$/) && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const pid = p.split('/')[3];
    if (Q.svCheck.get(u2, pid)) { Q.svDelete.run(u2, pid); return json(res, { saved: false }); }
    Q.svInsert.run(u2, pid); return json(res, { saved: true });
  }

  /* ── SEARCH ── */
  if (p === '/api/search' && m === 'GET') {
    const u2 = getAuth(req);
    const t = `%${(q.q || '').toLowerCase().trim()}%`;
    if (t === '%%') return json(res, { posts: [], communities: [], users: [] });
    return json(res, {
      posts:       Q.pSearch.all(t, t).map(r => fmtPost(r, u2)),
      communities: Q.comSearch.all(t, t).map(c => fmtCom(c, u2)),
      users:       Q.uSearch.all(t, t),
    });
  }

  /* ── COMMENTS ── */
  if (p.match(/^\/api\/posts\/[^/]+\/comments$/) && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const pid = p.split('/')[3];
    const b = await readBody(req);
    const body = (b.body || '').trim();
    if (!body) return json(res, { error: "Izoh bo'sh bo'lmasin" }, 400);
    const own = Q.pOwner.get(pid); if (!own) return json(res, { error: 'Topilmadi' }, 404);
    const parId = b.parent_id || null;
    let depth = 0;
    if (parId) { const par = Q.cmDepth.get(parId); if (par) depth = Math.min(par.depth + 1, 6); }
    const cid = uid();
    Q.cmInsert.run(cid, pid, u2, parId, body, depth);
    Q.cmScore.run(1, cid);
    Q.pIncCmt.run(pid);
    Q.uKarma.run(1, u2);
    const comment = fmtCmt(Q.cmOne.get(cid), u2);
    ws.sendAll({ type: 'new_comment', data: { postId: pid, comment } });
    if (own.user_id !== u2) {
      const from = Q.uById.get(u2);
      Q.nInsert.run(uid(), own.user_id, u2, 'comment', pid, cid, `${from.name} izoh qoldirdi`);
      ws.sendTo(own.user_id, { type: 'notif', data: { msg: `${from.name} izoh qoldirdi`, is_read: 0, ago: 'Hozir' } });
    }
    return json(res, comment, 201);
  }
  if (p.match(/^\/api\/comments\/[^/]+\/vote$/) && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const cid = p.split('/')[3];
    const own = Q.cmOwner.get(cid); if (!own) return json(res, { error: 'Topilmadi' }, 404);
    const b = await readBody(req);
    const vote = parseInt(b.vote);
    if (![1, -1].includes(vote)) return json(res, { error: 'Vote 1 yoki -1' }, 400);
    const ex = Q.cvGet.get(u2, cid);
    let myVote = vote;
    if (ex && ex.vote === vote) { Q.cvDelete.run(u2, cid); myVote = 0; }
    else Q.cvUpsert.run(u2, cid, vote);
    const c = Q.cvCount.get(cid);
    Q.cmScore.run(c.up - c.dn, cid);
    if (myVote === 1 && own.user_id !== u2) Q.uKarma.run(1, own.user_id);
    return json(res, { score: c.up - c.dn, my_vote: myVote });
  }
  if (p.match(/^\/api\/comments\/[^/]+$/) && m === 'DELETE') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const cid = p.split('/')[3];
    const own = Q.cmOwner.get(cid); if (!own) return json(res, { error: 'Topilmadi' }, 404);
    const user = Q.uById.get(u2);
    if (own.user_id !== u2 && !user?.is_admin) return json(res, { error: "Ruxsat yo'q" }, 403);
    Q.cmDelete.run(cid);
    ws.sendAll({ type: 'del_comment', data: { commentId: cid, postId: own.post_id } });
    return json(res, { ok: true });
  }

  /* ── MESSAGES ── */
  if (p === '/api/messages' && m === 'GET') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const pairs = Q.msgConvos.all(u2, u2, u2);
    const result = [];
    for (const { oid } of pairs) {
      const other = Q.uById.get(oid); if (!other) continue;
      const last = Q.msgLast.get(u2, oid, oid, u2);
      result.push({ other: { ...other, online: ws.isOnline(other.id) }, last: last ? fmt(last) : null, unread: Q.msgUnread.get(u2).c });
    }
    return json(res, result);
  }
  if (p.match(/^\/api\/messages\/[^/]+$/) && m === 'GET') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const otherId = p.split('/')[3];
    Q.msgMarkRead.run(otherId, u2);
    return json(res, Q.msgThread.all(u2, otherId, otherId, u2).map(fmt));
  }
  if (p.match(/^\/api\/messages\/[^/]+$/) && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const toId = p.split('/')[3];
    const toUser = Q.uById.get(toId); if (!toUser) return json(res, { error: 'Topilmadi' }, 404);
    const b = await readBody(req);
    const body = (b.body || '').trim();
    if (!body) return json(res, { error: "Xabar bo'sh bo'lmasin" }, 400);
    const mid = uid();
    Q.msgInsert.run(mid, u2, toId, body);
    const from = Q.uById.get(u2);
    const msg = { id: mid, from_id: u2, to_id: toId, body, is_read: 0, ago: 'Hozir', created_at: Math.floor(Date.now() / 1000) };
    ws.sendTo(toId, { type: 'new_msg', data: { msg, from: { id: from.id, name: from.name, username: from.username, color: from.color, avatar: from.avatar } } });
    ws.sendTo(u2, { type: 'msg_sent', data: { msg } });
    return json(res, msg, 201);
  }

  /* ── NOTIFICATIONS ── */
  if (p === '/api/notifications' && m === 'GET') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    return json(res, Q.nAll.all(u2).map(fmt));
  }
  if (p === '/api/notifications/read' && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    Q.nMarkRead.run(u2); return json(res, { ok: true });
  }
  if (p === '/api/notifications/count' && m === 'GET') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    return json(res, { count: Q.nUnread.get(u2).c });
  }

  /* ── REPORTS ── */
  if (p === '/api/reports' && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const b = await readBody(req);
    if (!b.reason?.trim()) return json(res, { error: 'Sabab kiriting' }, 400);
    Q.rpInsert.run(uid(), u2, b.post_id || null, b.comment_id || null, b.reason.trim());
    return json(res, { ok: true });
  }

  /* ── ADMIN ── */
  if (p === '/api/admin/stats' && m === 'GET') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const user = Q.uById.get(u2); if (!user?.is_admin) return json(res, { error: "Ruxsat yo'q" }, 403);
    return json(res, Q.adminStats.get());
  }
  if (p === '/api/admin/users' && m === 'GET') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const user = Q.uById.get(u2); if (!user?.is_admin) return json(res, { error: "Ruxsat yo'q" }, 403);
    return json(res, Q.uAll.all().map(u => ({ ...fmt(u), online: ws.isOnline(u.id) })));
  }
  if (p === '/api/admin/action' && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const admin = Q.uById.get(u2); if (!admin?.is_admin) return json(res, { error: "Ruxsat yo'q" }, 403);
    const b = await readBody(req);
    const { target_id, action, reason } = b;
    if (!target_id || !action) return json(res, { error: 'target_id va action kerak' }, 400);
    if (action === 'ban')          Q.uBan.run(reason || '', target_id);
    else if (action === 'unban')   Q.uUnban.run(target_id);
    else if (action === 'make_admin') Q.uMakeAdmin.run(target_id);
    else if (action === 'remove_admin') Q.uRemAdmin.run(target_id);
    else return json(res, { error: 'Noma\'lum action' }, 400);
    return json(res, { ok: true });
  }
  if (p === '/api/admin/reports' && m === 'GET') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const user = Q.uById.get(u2); if (!user?.is_admin) return json(res, { error: "Ruxsat yo'q" }, 403);
    return json(res, Q.rpAll.all().map(fmt));
  }
  if (p.match(/^\/api\/admin\/reports\/[^/]+$/) && m === 'POST') {
    const u2 = getAuth(req); if (!u2) return json(res, { error: 'Unauthorized' }, 401);
    const user = Q.uById.get(u2); if (!user?.is_admin) return json(res, { error: "Ruxsat yo'q" }, 403);
    const b = await readBody(req);
    Q.rpResolve.run(b.status || 'resolved', p.split('/')[4]);
    return json(res, { ok: true });
  }

  return null;
}

module.exports = { route };
