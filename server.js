#!/usr/bin/env node
'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

require('./src/db');
const { route }       = require('./src/routes');
const ws              = require('./src/ws');
const { verifyToken } = require('./src/helpers');
const DATA_DIR = process.env.DATA_DIR || __dirname;
const PORT   = process.env.PORT || 3000;
const PUB    = path.join(DATA_DIR, 'public');
const UPLOAD = path.join(DATA_DIR, 'uploads');

if (!fs.existsSync(UPLOAD)) fs.mkdirSync(UPLOAD, { recursive: true });

const MIME = {
  '.html':'text/html;charset=utf-8', '.css':'text/css', '.js':'application/javascript',
  '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.gif':'image/gif', '.webp':'image/webp', '.svg':'image/svg+xml', '.ico':'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  const pname = url.parse(req.url).pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Headers': 'Authorization,Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    });
    return res.end();
  }

  if (pname.startsWith('/uploads/')) {
    const f = path.join(UPLOAD, path.basename(pname));
    if (fs.existsSync(f)) {
      const ext = path.extname(f).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'public,max-age=31536000' });
      return fs.createReadStream(f).pipe(res);
    }
    res.writeHead(404); return res.end('Not found');
  }

  if (pname.startsWith('/api/')) {
    try {
      const handled = await route(req, res);
      if (handled === null) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API topilmadi' }));
      }
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server xatosi' }));
      }
    }
    return;
  }

  let fp = path.join(PUB, pname === '/' ? 'index.html' : pname);
  if (!fs.existsSync(fp)) fp = path.join(PUB, 'index.html');
  if (fs.existsSync(fp)) {
    const ext = path.extname(fp).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    return fs.createReadStream(fp).pipe(res);
  }
  res.writeHead(404); res.end('Not found');
});

server.on('upgrade', (req, socket) => {
  try {
    ws.handshake(req, socket);
    const m   = (req.url || '').match(/[?&]token=([^&]+)/);
    const uid = m ? verifyToken(decodeURIComponent(m[1])) : null;
    const key = uid || `anon_${Date.now()}`;
    ws.add(key, socket);
    let buf = Buffer.alloc(0);
    socket.on('data', chunk => {
      buf = Buffer.concat([buf, chunk]);
      const f = ws.decode(buf);
      if (f) { buf = Buffer.alloc(0); if (f.close) socket.destroy(); }
    });
    socket.on('close', () => { if (uid) ws.remove(uid, socket); });
    socket.on('error', () => { try { socket.destroy(); } catch {} });
    socket.write(ws.encode({ type: 'connected', userId: uid }));
  } catch (err) {
    console.error(err);
    try { socket.destroy(); } catch {}
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  IdeaHub  →  http://localhost:${PORT}\n`);

});
