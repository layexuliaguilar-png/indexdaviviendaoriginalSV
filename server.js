const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm':  'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map':  'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.otf':  'font/otf',
  '.eot':  'application/vnd.ms-fontobject',
  '.txt':  'text/plain; charset=utf-8',
  '.xml':  'application/xml',
  '.pdf':  'application/pdf',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm'
};

function responder(res, code, body, headers) {
  var h = Object.assign({ 'Cache-Control': 'public, max-age=3600' }, headers || {});
  res.writeHead(code, h);
  res.end(body);
}

var server = http.createServer(function (req, res) {
  var ruta = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  if (ruta === '/') ruta = '/index.html';

  var archivo = path.join(ROOT, ruta);
  if (archivo.indexOf(ROOT) !== 0) archivo = path.join(ROOT, 'index.html');

  fs.stat(archivo, function (err, stat) {
    if (!err && stat.isFile()) {
      var ext = path.extname(archivo).toLowerCase();
      var tipo = MIME[ext] || 'application/octet-stream';
      fs.readFile(archivo, function (e, data) {
        if (e) return responder(res, 500, 'Error', { 'Content-Type': 'text/plain' });
        responder(res, 200, data, { 'Content-Type': tipo });
      });
      return;
    }

    var ext2 = path.extname(ruta).toLowerCase();
    if (ext2 && ext2 !== '.html') {
      return responder(res, 404, 'No encontrado: ' + ruta, { 'Content-Type': 'text/plain' });
    }

    fs.readFile(path.join(ROOT, 'index.html'), function (e2, data) {
      if (e2) return responder(res, 404, 'No encontrado', { 'Content-Type': 'text/plain' });
      responder(res, 200, data, { 'Content-Type': 'text/html; charset=utf-8' });
    });
  });
});

server.listen(PORT, function () {
  console.log('Servidor corriendo en el puerto ' + PORT);
});
