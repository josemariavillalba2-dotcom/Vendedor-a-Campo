// Service worker — Vendedor a Campo (Agroterra Posventa)
// Red primero; el cache es respaldo para cuando no hay señal en el campo.
var CACHE = 'agroterra-vendedor-campo-v1';

self.addEventListener('install', function () { self.skipWaiting(); });

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  // La sincronización con la planilla nunca se cachea.
  if (req.url.indexOf('script.google.com') !== -1) return;

  var isNav = req.mode === 'navigate';
  var netReq = isNav ? new Request(req.url, { cache: 'no-store' }) : req;

  e.respondWith(
    fetch(netReq).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        if (hit) return hit;
        if (isNav) return caches.match('/Agroterra-vendedor/index.html');
      });
    })
  );
});
