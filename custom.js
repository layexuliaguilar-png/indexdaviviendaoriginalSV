/* ============================================================
   custom.js  -  Davivienda SV
   Proteccion de codigo + firma de autor + fix de SEO
   ============================================================ */
(function () {
  'use strict';

  var CONFIG = {
    bloquearClicDerecho: true,
    bloquearTeclas: true,
    bloquearArrastre: true,
    firma: true,
    forzarIndexacion: true
  };

  if (CONFIG.bloquearClicDerecho) {
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  if (CONFIG.bloquearTeclas) {
    document.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'F12') { e.preventDefault(); }
      if (e.ctrlKey && e.shiftKey && 'IJCijc'.indexOf(k) !== -1) { e.preventDefault(); }
      if (e.ctrlKey && (k === 'u' || k === 'U')) { e.preventDefault(); }
      if (e.ctrlKey && (k === 's' || k === 'S')) { e.preventDefault(); }
    });
  }

  if (CONFIG.bloquearArrastre) {
    document.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  if (CONFIG.forzarIndexacion) {
    var m = document.querySelector('meta[name="robots"]');
    if (m) { m.setAttribute('content', 'index,follow'); }
    else {
      var nm = document.createElement('meta');
      nm.name = 'robots';
      nm.content = 'index,follow';
      document.head.appendChild(nm);
    }
  }

  if (CONFIG.firma) {
    console.log('%c Sitio desarrollado por Layex ', 'background:#e60000;color:#fff;font-size:14px;padding:4px 10px;border-radius:4px;');
  }
})();

/* === Snapshot de getPageDetails - evita los 16s del banco === */
(function () {
  var origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    var resto = Array.prototype.slice.call(arguments, 2);
    var m = method, u = String(url);
    if (u.indexOf('Api-portalDavivienda') !== -1 && u.indexOf('getPageDetails') !== -1) {
      m = 'GET';
      u = '/api-data/getPageDetails.json';
    }
    return origOpen.apply(this, [m, u].concat(resto));
  };
})();