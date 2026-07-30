/**
 * RingMang — /sitemaps/<child>  (Phase 9C-3) child sitemaps
 *   ringtones-N.xml  -> ringtone URLs slice N*50000..(N+1)*50000 (lastmod = updated_at)
 *   taxonomy.xml     -> home + every /category/<slug> + /artist/<slug> (lastmod = created_at)
 */
const CHUNK = 50000;
const escXml = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const dOnly = (v) => (v ? String(v).slice(0, 10) : today());
async function getJSON(SUPA, KEY, path) { const r = await fetch(SUPA + "/rest/v1/" + path, { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Accept: "application/json" } }); if (!r.ok) return null; return r.json(); }
function urlEntry(loc, lastmod, prio, freq) { return "  <url><loc>" + escXml(loc) + "</loc><lastmod>" + lastmod + "</lastmod><changefreq>" + freq + "</changefreq><priority>" + prio + "</priority></url>\n"; }

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const origin = new URL(request.url).origin;
  const SUPA = env.SUPABASE_URL, KEY = env.SUPABASE_ANON_KEY;
  const file = (params.path || []).join("/");
  const XML = { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=600" };
  if (!SUPA || !KEY) return new Response("Missing env", { status: 500 });

  // ---- ringtones-N.xml ----
  const m = /^ringtones-(\d+)\.xml$/.exec(file);
  if (m) {
    const n = parseInt(m[1], 10);
    const off = n * CHUNK;
    const rows = (await getJSON(SUPA, KEY, "ringtones?seo_noindex=eq.false&select=seo_slug,updated_at&order=created_at.desc&limit=" + CHUNK + "&offset=" + off)) || [];
    let body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    rows.forEach((r) => { if (r.seo_slug) body += urlEntry(origin + "/ringtone/" + encodeURIComponent(r.seo_slug), dOnly(r.updated_at), "0.8", "weekly"); });
    body += "</urlset>\n";
    return new Response(body, { headers: XML });
  }

  // ---- taxonomy.xml (home + categories + artists) ----
  if (file === "taxonomy.xml") {
    const cats = (await getJSON(SUPA, KEY, "categories?seo_noindex=eq.false&select=slug,created_at&order=name")) || [];
    const arts = (await getJSON(SUPA, KEY, "artists?seo_noindex=eq.false&select=slug,created_at&order=name")) || [];
    let body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    body += urlEntry(origin + "/", today(), "1.0", "daily");
    cats.forEach((c) => { if (c.slug) body += urlEntry(origin + "/category/" + encodeURIComponent(c.slug), dOnly(c.created_at), "0.7", "weekly"); });
    arts.forEach((a) => { if (a.slug) body += urlEntry(origin + "/artist/" + encodeURIComponent(a.slug), dOnly(a.created_at), "0.7", "weekly"); });
    body += "</urlset>\n";
    return new Response(body, { headers: XML });
  }

  return new Response("Not found", { status: 404 });
}
// RM9C_SITEMAPS_CHILD_END
