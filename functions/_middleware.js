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
  let metas;
  try { metas = (await load(SUPA, KEY)).metas || []; } catch (e) { return response; }
  if (!metas.length) return response;
  const inject = metas.map((m) => '<meta name="' + esc(m.n) + '" content="' + esc(m.c) + '">').join("");
  try {
    const rewriter = new HTMLRewriter().on("head", { element(el) { el.append(inject, { html: true }); } });
    return rewriter.transform(response);
  } catch (e) { return response; }
}
// RM15B_MIDDLEWARE_END
