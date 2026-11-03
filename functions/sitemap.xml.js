/**
 * RingMang — /sitemap.xml (Full Direct Sitemap)
 * Automatically lists Home, Categories, Artists, and ALL Ringtones in one single valid XML!
 * Auto-updates directly from Supabase Database.
 */
const escXml = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const dOnly = (v) => (v ? String(v).slice(0, 10) : today());

async function getJSON(SUPA, KEY, path) {
  const r = await fetch(SUPA + "/rest/v1/" + path, {
    headers: {
      apikey: KEY,
      Authorization: "Bearer " + KEY,
      Accept: "application/json"
    }
  });
  if (!r.ok) return null;
  return r.json();
}

function urlEntry(loc, lastmod, prio, freq) {
  return "  <url><loc>" + escXml(loc) + "</loc><lastmod>" + lastmod + "</lastmod><changefreq>" + freq + "</changefreq><priority>" + prio + "</priority></url>\n";
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const origin = new URL(request.url).origin;
  const SUPA = env.SUPABASE_URL, KEY = env.SUPABASE_ANON_KEY;
  if (!SUPA || !KEY) return new Response("Missing env", { status: 500 });

  // 1. Fetch active ringtones
  const ringtones = (await getJSON(SUPA, KEY, "ringtones?seo_noindex=eq.false&select=seo_slug,updated_at&order=created_at.desc&limit=50000")) || [];

  // 2. Fetch categories
  const cats = (await getJSON(SUPA, KEY, "categories?seo_noindex=eq.false&select=slug,created_at&order=name")) || [];

  // 3. Fetch artists
  const arts = (await getJSON(SUPA, KEY, "artists?seo_noindex=eq.false&select=slug,created_at&order=name")) || [];

  // 4. Build single unified XML urlset
  let body = '<?xml version="1.0" encoding="UTF-8"?>\n';
  body += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Home Page
  body += urlEntry(origin + "/", today(), "1.0", "daily");

  // All Ringtones
  ringtones.forEach((r) => {
    if (r.seo_slug) {
      body += urlEntry(origin + "/ringtone/" + encodeURIComponent(r.seo_slug), dOnly(r.updated_at), "0.8", "weekly");
    }
  });

  // All Categories
  cats.forEach((c) => {
    if (c.slug) {
      body += urlEntry(origin + "/category/" + encodeURIComponent(c.slug), dOnly(c.created_at), "0.7", "weekly");
    }
  });

  // All Artists
  arts.forEach((a) => {
    if (a.slug) {
      body += urlEntry(origin + "/artist/" + encodeURIComponent(a.slug), dOnly(a.created_at), "0.7", "weekly");
    }
  });

  body += '</urlset>\n';

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600"
    }
  });
}
