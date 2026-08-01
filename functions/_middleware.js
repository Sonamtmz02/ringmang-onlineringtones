/**
 * RingMang — Verification backbone (15B-1). Global Pages middleware.
 * 1) /.rm-vm-probe  -> plain-text count (mobile-verifiable proof the backbone runs).
 * 2) file verify    -> serve a stored verification file at its path (15C-ready),
 *                      only when not a protected asset (denylist) -> static wins otherwise.
 * 3) meta verify    -> HTMLRewriter injects enabled <meta> tags into <head> of EVERY
 *                      text/html response (home + all edge pages) AT THE EDGE, so the
 *                      raw served HTML contains them (verifier-safe; JS-render not required).
 * Every step is wrapped: on any failure the original response passes through unchanged,
 * so this middleware can NEVER break the site (worst case = no injection).
 */
const TTL = 60000;
let CACHE = { t: 0, metas: [], files: {} };
const DENY = new Set(["index.html", "manifest.webmanifest", "sw.js", "config.js", "script.js", "style.css", "admin.html", "admin-script.js", "admin-style.css", "smartlink.js", "pwa.js", "icon.svg", "icon-maskable.svg", "robots.txt", "sitemap.xml"]);

function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

// ---- on-brand raster favicon, generated as a real PNG (no upload, no tool) ----
const PNG_SIG = [137, 80, 78, 71, 13, 10, 26, 10];
const CRC_TABLE = (function () { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function adler32(buf) { let a = 1, b = 0; for (let i = 0; i < buf.length; i++) { a = (a + buf[i]) % 65521; b = (b + a) % 65521; } return ((b << 16) | a) >>> 0; }
function be32(n) { return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]; }
function pngChunk(type, data) { const td = [type.charCodeAt(0), type.charCodeAt(1), type.charCodeAt(2), type.charCodeAt(3)]; const crcIn = new Uint8Array(td.concat(Array.prototype.slice.call(data))); return be32(data.length).concat(td, Array.prototype.slice.call(data), be32(crc32(crcIn))); }
function buildPNG(w, h, rgba) {
  const rowLen = 1 + w * 4; const raw = new Uint8Array(rowLen * h);
  for (let y = 0; y < h; y++) { raw[y * rowLen] = 0; raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * rowLen + 1); }
  const len = raw.length, nlen = (~len) & 0xFFFF;
  const zlib = new Uint8Array(7 + len + 4);
  zlib[0] = 0x78; zlib[1] = 0x01; zlib[2] = 0x01; zlib[3] = len & 255; zlib[4] = (len >>> 8) & 255; zlib[5] = nlen & 255; zlib[6] = (nlen >>> 8) & 255;
  zlib.set(raw, 7); const ad = be32(adler32(raw)); zlib.set(ad, 7 + len);
  const ihdr = new Uint8Array(be32(w).concat(be32(h), [8, 6, 0, 0, 0]));
  return new Uint8Array([].concat(PNG_SIG, pngChunk('IHDR', ihdr), pngChunk('IDAT', zlib), pngChunk('IEND', new Uint8Array(0))));
}
function makeIcon() {
  const w = 96, h = 96; const rgba = new Uint8Array(w * h * 4);
  const px = (x, y, r, g, b) => { const i = (y * w + x) * 4; rgba[i] = r; rgba[i + 1] = g; rgba[i + 2] = b; rgba[i + 3] = 255; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px(x, y, 11, 15, 20);
  const cols = [[255, 107, 74], [255, 209, 102], [61, 220, 151], [76, 201, 240]];
  const heights = [0.60, 1.0, 0.45, 0.80]; const baseY = 78, maxH = 58, barW = 12, gap = 8, startX = 12;
  for (let bI = 0; bI < 4; bI++) { const bx = startX + bI * (barW + gap); const bh = Math.round(heights[bI] * maxH); const ty = baseY - bh; for (let yy = ty; yy <= baseY; yy++) for (let xx = bx; xx < bx + barW; xx++) px(xx, yy, cols[bI][0], cols[bI][1], cols[bI][2]); }
  return buildPNG(w, h, rgba);
}
let _ICO = null; function iconBytes() { if (!_ICO) _ICO = makeIcon(); return _ICO; }
async function load(SUPA, KEY) {
  const now = Date.now();
  if (now - CACHE.t < TTL && CACHE.metas) return CACHE;
  try {
    const r = await fetch(SUPA + "/rest/v1/verifications?enabled=eq.true&select=vtype,meta_name,meta_content,file_path,file_content", { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Accept: "application/json" } });
    const rows = r.ok ? await r.json() : [];
    const metas = [], files = {};
    for (const row of rows) {
      if (row.vtype === "meta" && row.meta_name && row.meta_content) metas.push({ n: String(row.meta_name), c: String(row.meta_content) });
      else if (row.vtype === "file" && row.file_path && row.file_content != null) {
        const k = String(row.file_path).replace(/^\/+/, "");
        if (k && !DENY.has(k) && /\.[a-z0-9]+$/i.test(k)) files[k] = row.file_content;
      }
    }
    CACHE = { t: now, metas, files };
  } catch (e) { /* keep previous cache (or empty) on failure */ }
  return CACHE;
}

export async function onRequest(context) {
  const { request, env } = context;
  const SUPA = env.SUPABASE_URL, KEY = env.SUPABASE_ANON_KEY;
  const url = new URL(request.url);

  // (1) mobile-verifiable probe
  if (url.pathname === "/.rm-vm-probe") {
    if (!SUPA || !KEY) return new Response("vm no-config", { headers: { "content-type": "text/plain", "cache-control": "no-store", "x-robots-tag": "noindex" } });
    const c = await load(SUPA, KEY);
    return new Response("vm metas=" + c.metas.length + " files=" + Object.keys(c.files).length, { headers: { "content-type": "text/plain", "cache-control": "no-store", "x-robots-tag": "noindex" } });
  }

  // (favicon) on-brand raster PNG — what Google's favicon pipeline actually reads
  if (request.method === "GET" && url.pathname === "/favicon.png") {
    return new Response(iconBytes(), { headers: { "content-type": "image/png", "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" } });
  }
  
  // (2) file verification serve (15C-ready)
  if (SUPA && KEY && request.method === "GET") {
    try {
      const c = await load(SUPA, KEY);
      const key = url.pathname.replace(/^\/+/, "");
      if (key && c.files && Object.prototype.hasOwnProperty.call(c.files, key)) {
        const ct = /\.xml$/i.test(key) ? "application/xml" : (/\.txt$/i.test(key) ? "text/plain" : "text/html");
        return new Response(c.files[key], { headers: { "content-type": ct + "; charset=utf-8", "cache-control": "public, max-age=300", "x-robots-tag": "noindex" } });
      }
    } catch (e) { /* fall through to normal handling */ }
  }

  // get the downstream response (static asset or edge function)
  let response;
  try { response = await context.next(); } catch (e) { return new Response("middleware next() error", { status: 500 }); }

  // (3) meta injection — only for HTML, only if we have metas
  if (!SUPA || !KEY) return response;
  const ctype = response.headers.get("content-type") || "";
  if (!ctype.includes("text/html")) return response;
  let metas = [];
  try { metas = (await load(SUPA, KEY)).metas || []; } catch (e) { metas = []; }
  const fav = '<link rel="icon" type="image/png" sizes="96x96" href="/favicon.png"><link rel="apple-touch-icon" href="/favicon.png">';
  const inject = fav + metas.map((m) => '<meta name="' + esc(m.n) + '" content="' + esc(m.c) + '">').join("");
  try {
    const rewriter = new HTMLRewriter().on("head", { element(el) { el.append(inject, { html: true }); } });
    return rewriter.transform(response);
  } catch (e) { return response; }
}
// RM15B_MIDDLEWARE_END
