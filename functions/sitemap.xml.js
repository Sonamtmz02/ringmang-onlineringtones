/**
 * RingMang — Dynamic XML sitemap (auto-updates on every request). Domain derived from request.
 */
function escXml(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c])); }
function slugify(s){ return String(s || "").toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "ringtone"; }
function today(){ return new Date().toISOString().slice(0, 10); }

export async function onRequestGet(context){
  const { request, env } = context;
  const origin = new URL(request.url).origin;
  const SUPA = env.SUPABASE_URL, KEY = env.SUPABASE_ANON_KEY;
  const now = today();

  const urls = [{ loc: origin + "/", lastmod: now, prio: "1.0", freq: "daily" }];

  if (SUPA && KEY){
    // categories -> /?cat=slug
    try {
      const r = await fetch(SUPA + "/rest/v1/categories?select=slug", { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Accept: "application/json" } });
      const cats = await r.json();
      if (r.ok && Array.isArray(cats)) cats.forEach((c) => { if (c.slug) urls.push({ loc: origin + "/?cat=" + encodeURIComponent(c.slug), lastmod: now, prio: "0.6", freq: "weekly" }); });
    } catch {}
    // ringtones (paginated up to 4000) -> /r/id/slug
    try {
      for (let off = 0; off < 4000; off += 1000){
        const r = await fetch(SUPA + "/rest/v1/ringtones?select=id,title,created_at&order=created_at.desc&limit=1000&offset=" + off,
          { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Accept: "application/json" } });
        const rows = await r.json();
        if (!r.ok || !Array.isArray(rows) || rows.length === 0) break;
        rows.forEach((t) => {
          const lm = t.created_at ? String(t.created_at).slice(0, 10) : now;
          urls.push({ loc: origin + "/r/" + encodeURIComponent(t.id) + "/" + encodeURIComponent(slugify(t.title)), lastmod: lm, prio: "0.8", freq: "monthly" });
        });
        if (rows.length < 1000) break;
      }
    } catch {}
  }

  let body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  urls.forEach((u) => {
    body += "  <url><loc>" + escXml(u.loc) + "</loc><lastmod>" + u.lastmod + "</lastmod><changefreq>" + u.freq + "</changefreq><priority>" + u.prio + "</priority></url>\n";
  });
  body += "</urlset>\n";

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=600" } });
}
