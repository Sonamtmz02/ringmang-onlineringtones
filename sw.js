/**
 * RingMang — Service Worker (PWA only).
 * Navigation = network-first, offline fallback to cached shell.
 * Static assets = cache-first. Signed audio + live API + admin = never cached.
 */
var CACHE = "ringmang-v2";
var SHELL = [
  "/", "/index.html", "/config.js", "/script.js", "/style.css",
  "/smartlink.js", "/manifest.webmanifest", "/icon.svg", "/icon-maskable.svg"
];

function isUncacheable(url) {
  var p = url.pathname || "";
  if (/\/(serve-ringtone|functions\/v1|rest\/v1|admin)/.test(url.href)) return true;
  if (/\.(mp3|m4a|ogg|wav)(\?|$)/i.test(p)) return true;
  if (/ringtones\//.test(url.href) && /\.(mp3|m4a|ogg|wav)/i.test(url.href)) return true;
  return false;
}
function isStaticAsset(url) {
  return /\.(js|css|svg|webmanifest|png|jpg|jpeg|woff2?)(\?|$)/i.test(url.pathname || "");
}

self.addEventListener("install", function (ev) {
  ev.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(SHELL).catch(function () {
        return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (ev) {
  ev.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (ev) {
  var req = ev.request;
  if (req.method !== "GET") return;
  var url; try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;
  if (isUncacheable(url)) return;

  if (req.mode === "navigate") {
    ev.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put("/", copy).catch(function () {}); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (r) {
          return r || caches.match("/").then(function (r2) { return r2 || caches.match("/index.html"); });
        });
      })
    );
    return;
  }

  if (isStaticAsset(url)) {
    ev.respondWith(
      caches.match(req).then(function (cached) {
        if (cached) return cached;
        return fetch(req).then(function (res) {
          if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy).catch(function () {}); }); }
          return res;
        });
      })
    );
    return;
  }
});
// RM_SW_END
