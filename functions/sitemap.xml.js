/**
 * RingMang — /sitemap.xml  (Phase 9C-3) SITEMAP INDEX
 * Lists child sitemaps: /sitemaps/ringtones-N.xml (split per 50k) + /sitemaps/taxonomy.xml
 * lastmod = global max(updated_at) of ringtones (hint-level, valid).
 * robots.txt already points here -> no robots change needed.
 */
const CHUNK = 50000;
const escXml = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
const today = () => new Date().toISOString().slice(0, 10);
async function getJSON(SUPA, KEY, path) { const r = await fetch(SUPA + "/rest/v1/" + path, { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Accept: "application/json" } }); if (!r.ok) return null; return r.json(); }
async function headCount(SUPA, KEY, table) { const r = await fetch(SUPA + "/rest/v1/" + table + "?select=id", { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Prefer: "count=exact", Range: "0-0" } }); if (!r.ok) return 0; return parseInt(r.headers.get("content-range")?.split("/")[1] || "0", 10) || 0; }

export async function onRequestGet(context) {
  const { request, env } = context;
  const origin = new URL(request.url).origin;
  const SUPA = env.SUPABASE_URL, KEY = env.SUPABASE_ANON_KEY;
  if (!SUPA || !KEY) return new Response("Missing env", { status: 500 });

  const rCount = await headCount(SUPA, KEY, "ringtones");
  // global lastmod hint
  let lastmod = today();
  const lm = await getJSON(SUPA, KEY, "ringtones?select=updated_at&order=updated_at.desc&limit=1");
  if (Array.isArray(lm) && lm[0] && lm[0].updated_at) lastmod = String(lm[0].updated_at).slice(0, 10);

  const rChildren = rCount > 0 ? Math.ceil(rCount / CHUNK) : 0;
  let body = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (let i = 0; i < rChildren; i++) {
    body += "  <sitemap><loc>" + escXml(origin + "/sitemaps/ringtones-" + i + ".xml") + "</loc><lastmod>" + lastmod + "</lastmod></sitemap>\n";
  }
  body += "  <sitemap><loc>" + escXml(origin + "/sitemaps/taxonomy.xml") + "</loc><lastmod>" + lastmod + "</lastmod></sitemap>\n";
  body += "</sitemapindex>\n";

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=600" } });
}
// RM9C_SITEMAP_INDEX_END
