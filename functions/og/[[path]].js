/**
 * RingMang — Generated SVG cover art per ringtone (used as og:image / twitter:image + page hero source-of-truth).
 * Deterministic from title+artist. Domain-agnostic. No hardcoded secrets (anon key from env for the meta fetch).
 */
function escXml(s){ return String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
function hashStr(s){ let h = 2166136261; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function buildCover(title, artist){
  const h = hashStr(title + "|" + (artist || ""));
  const pals = [["#ff6b4a","#ffd166"],["#3ddc97","#4cc9f0"],["#4cc9f0","#ff6b4a"],["#ffd166","#3ddc97"],["#ff6b4a","#3ddc97"]];
  const p = pals[h % pals.length];
  let bars = "";
  for (let i = 0; i < 44; i++){
    const v = 18 + Math.abs(Math.sin((h % 97) * 0.7 + i * 0.9)) * 78;
    const x = 70 + i * 24;
    bars += '<rect x="'+x+'" y="'+(315 - v/2)+'" width="12" height="'+v+'" rx="6" fill="url(#g)" opacity="'+(0.55 + (i%5)*0.09).toFixed(2)+'"/>';
  }
  const t = escXml(title.length > 30 ? title.slice(0, 29) + "…" : title);
  const a = escXml((artist || "RingMang").length > 34 ? (artist || "RingMang").slice(0, 33) + "…" : (artist || "RingMang"));
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="'+t+'">'
    + '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+p[0]+'"/><stop offset="1" stop-color="'+p[1]+'"/></linearGradient>'
    + '<radialGradient id="rg" cx="22%" cy="14%" r="80%"><stop offset="0" stop-color="'+p[0]+'" stop-opacity="0.22"/><stop offset="1" stop-color="#071417" stop-opacity="0"/></radialGradient></defs>'
    + '<rect width="1200" height="630" fill="#071417"/><rect width="1200" height="630" fill="url(#rg)"/>'
    + '<g opacity="0.9">'+bars+'</g>'
    + '<text x="70" y="150" font-family="Unbounded, sans-serif" font-weight="800" font-size="58" fill="#ffffff">'+t+'</text>'
    + '<text x="72" y="196" font-family="Space Mono, monospace" font-size="24" fill="'+p[1]+'">by '+a+'</text>'
    + '<text x="70" y="560" font-family="Unbounded, sans-serif" font-weight="800" font-size="34" fill="#ffffff">Ring<tspan fill="'+p[0]+'">Mang</tspan></text>'
    + '<text x="1130" y="560" text-anchor="end" font-family="Space Mono, monospace" font-size="20" fill="#5b6b6e" letter-spacing="3">FREE RINGTONE</text>'
    + '</svg>';
}

export async function onRequestGet(context){
  const { request, env, params } = context;
  const SUPA = env.SUPABASE_URL, KEY = env.SUPABASE_ANON_KEY;
  const fallback = buildCover("RingMang", "Free Ringtones");
  if (!SUPA || !KEY) return new Response(fallback, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" } });

  const raw = (params.path || [])[0] || "";
  const id = raw.replace(/\.svg$/i, "");
  if (!id || !/^[0-9a-f-]{8,}$/i.test(id)) return new Response(fallback, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" } });

  let title = "RingMang", artist = "Free Ringtones";
  try {
    const r = await fetch(SUPA + "/rest/v1/ringtones?id=eq." + encodeURIComponent(id) + "&select=title,artists(name)",
      { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Accept: "application/json" } });
    const rows = await r.json();
    if (r.ok && Array.isArray(rows) && rows[0]){ title = rows[0].title || title; artist = (rows[0].artists && rows[0].artists.name) || artist; }
  } catch {}

  return new Response(buildCover(title, artist), { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400, s-maxage=604800" } });
}
