const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;
const ORIGIN = 'https://www.davivienda.com.sv';
const API = '/Api-portalDavivienda/';

const MIME = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.otf':'font/otf','.eot':'application/vnd.ms-fontobject','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8','.map':'application/json'};

const CSP = "default-src 'self'; img-src 'self' data: https: *; style-src 'self' 'unsafe-inline' https: *; script-src 'self' 'unsafe-eval' 'unsafe-inline' https: *; font-src 'self' data: https: *; connect-src 'self' https: *; media-src 'self' https: *; object-src 'none'; frame-src 'self' https: *;";

function sec(res) {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', CSP);
}

function proxy(req, res) {
  const u = new URL(ORIGIN + req.url);
  const opt = {
    hostname: u.hostname,
    path: u.pathname + u.search,
    method: req.method,
    headers: {
      'Host': 'www.davivienda.com.sv',
      'Origin': 'https://www.davivienda.com.sv',
      'Referer': 'https://www.davivienda.com.sv/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
    }
  };
  const p = https.request(opt, (r) => {
    const h = Object.assign({}, r.headers);
    h['x-content-type-options'] = 'nosniff';
    h['referrer-policy'] = 'strict-origin-when-cross-origin';
    h['content-security-policy'] = CSP;
    res.writeHead(r.statusCode || 502, h);
    r.pipe(res);
  });
  p.on('error', () => { res.writeHead(502); res.end('proxy error'); });
  if (req.method === 'POST' || req.method === 'PUT') req.pipe(p); else p.end();
}

function send(res, file, code) {
  const e = path.extname(file).toLowerCase();
  res.statusCode = code || 200;
  res.setHeader('Content-Type', MIME[e] || 'application/octet-stream');
  if (['.png','.jpg','.jpeg','.gif','.svg','.webp','.ico','.woff','.woff2','.ttf','.otf','.eot'].includes(e)) res.setHeader('Cache-Control', 'public, max-age=604800');
  else if (['.js','.css'].includes(e)) res.setHeader('Cache-Control', 'public, max-age=3600');
  fs.createReadStream(file).on('error', () => { res.statusCode = 500; res.end('err'); }).pipe(res);
}

function stat(p) { try { return fs.statSync(p); } catch (x) { return null; } }

function serve(req, res) {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, path.normalize(p));
  if (stat(f) && stat(f).isFile()) return send(res, f);
  if (stat(f + '.html') && stat(f + '.html').isFile()) return send(res, f + '.html');
  const idx = path.join(f, 'index.html');
  if (stat(idx) && stat(idx).isFile()) return send(res, idx);
  const nf = path.join(ROOT, '404.html');
  if (stat(nf)) return send(res, nf, 404);
  res.statusCode = 404;
  res.end('Not found');
}

http.createServer((req, res) => {
  sec(res);
  if (req.url === '/health') { res.statusCode = 200; return res.end('ok'); }
  if (req.url.indexOf(API) === 0) return proxy(req, res);
  serve(req, res);
}).listen(PORT, () => console.log('listening on ' + PORT));
