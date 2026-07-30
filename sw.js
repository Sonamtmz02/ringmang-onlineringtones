/**
 * RingMang Service Worker — Phase 11
 * Strategies:
 *  - Navigation (HTML):        network-first -> offline fallback to cached shell
 *  - Same-origin static:       cache-first  -> then update (css/js/svg/manifest/icons)
 *  - Supabase ringtones list:  stale-while-revalidate + OFFLINE SNAPSHOT (so library shows offline)
 *  - R2 audio + serve-ringtone: NETWORK ONLY, never cached (signed URLs expire; security)
 *  - Fonts (gstatic):          cache-first (immutable)
 * Honest offline: shell + last library snapshot render; play/download need a connection.
 */
const VERSION = "ringmang-v11";
const SHELL = `${VERSION}-shell`;
const DATA = `${VERSION}-data`;
const SNAP = `${VERSION}-snap`;
const PRECACHE = ["/", "/index.html", "/style.css", "/script.js", "/config.js", "/pwa.js", "/manifest.webmanifest", "/icon.svg", "/icon-maskable.svg"];
const SNAP_KEY = "/__rm_offline_ringtones__";

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    await c.addAll(PRECACHE).catch(() => {}); // best-effort; don't fail install if one 404s
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== SHELL && k !== DATA && k !== SNAP).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

const isRingtonesList = (u) => u.pathname.includes("/rest/v1/ringtones") && u.search.includes("select=") && !u.search.includes("head=true");
const isSignedOrR2 = (u) => u.pathname.includes("/functions/v1/serve-ringtone") || u.hostname.includes(".r2.") || u.hostname.includes("r2.cloudflare");
const isGstatic = (u) => u.hostname.includes("fonts.gstatic.com");

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Signed audio + R2: never cache (expiry + security). Clean 503 when offline.
  if (isSignedOrR2(url)) {
    e.respondWith(fetch(req).catch(() => new Response(JSON.stringify({ error: "offline" }), { status: 503, headers: { "Content-Type": "application/json" } })));
    return;
  }

  // Same-origin
  if (url.origin === self.location.origin) {
    // Navigation: network-first, offline -> cached shell
    if (req.mode === "navigate") {
      e.respondWith((async () => {
        try { const r = await fetch(req); const c = await caches.open(SHELL); c.put("/index.html", r.clone()); return r; }
        catch { return (await caches.match("/index.html")) || (await caches.match(req)) || new Response("Offline", { status: 503 }); }
      })());
      return;
    }
    // Supabase ringtones list: SWR + write offline snapshot
    if (isRingtonesList(url)) {
      e.respondWith((async () => {
        const cache = await caches.open(DATA);
        const cached = await cache.match(req);
        const net = fetch(req).then(async (r) => {
          if (r && r.ok) {
            cache.put(req, r.clone());
            // also store a normalized snapshot for offline fallback
            try { const sc = await caches.open(SNAP); sc.put(new Request(SNAP_KEY), r.clone()); } catch {}
          }
          return r;
        }).catch(() => cached);
        return cached || net;
      })());
      return;
    }
    // Other same-origin static: cache-first, then update
    e.respondWith((async () => {
      const cache = await caches.open(SHELL);
      const cached = await cache.match(req);
      const net = fetch(req).then((r) => { if (r && r.ok) cache.put(req, r.clone()); return r; }).catch(() => cached);
      return cached || net;
    })());
    return;
  }

  // Cross-origin: fonts cache-first; everything else network w/ cache fallback
  if (isGstatic(url)) {
    e.respondWith((async () => {
      const cache = await caches.open(DATA);
      const cached = await cache.match(req);
      if (cached) return cached;
      try { const r = await fetch(req); if (r && r.ok) cache.put(req, r.clone()); return r; } catch { return cached || new Response("", { status: 503 }); }
    })());
    return;
  }
  // Supabase REST (counts, categories, etc.) & others: network, cache fallback when offline
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});

// Offline fallback for ringtones list when even SWR cache miss (e.g. filtered query never cached)
self.addEventListener("fetch", (e) => {
  // (handled inline above; this listener kept intentionally empty to avoid double-respond)
});

// Tell clients when a new SW is waiting (app can show a "refresh" toast)
self.addEventListener("message", (e) => { if (e.data === "SKIP_WAITING") self.skipWaiting(); });
