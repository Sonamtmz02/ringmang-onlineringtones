/**
 * RingMang — /r/... legacy route → 301 to canonical /ringtone/<seo_slug>
 * Preserves link equity from old Phase-9 URLs. Resolves by id (parts[0]), then short_id.
 */
export async function onRequestGet(context) {
  const { request, env, params } = context;
  const origin = new URL(request.url).origin;
  const SUPA = env.SUPABASE_URL, KEY = env.SUPABASE_ANON_KEY;
  const parts = params.path || [];
  const id = parts[0];
  const home = () => new Response(null, { status: 301, headers: { Location: origin + "/", "Cache-Control": "public, max-age=3600" } });
  if (!SUPA || !KEY || !id) return home();
  const sel = encodeURIComponent("seo_slug,short_id");
  const tryFetch = async (q) => {
    const r = await fetch(SUPA + "/rest/v1/ringtones?" + q + "&select=" + sel + "&limit=1", { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Accept: "application/json" } });
    if (!r.ok) return null; const j = await r.json(); return Array.isArray(j) && j[0] ? j[0] : null;
  };
  let row = await tryFetch("id=eq." + encodeURIComponent(id));
  if (!row && /^[0-9a-f]{8}$/i.test(id)) row = await tryFetch("short_id=eq." + encodeURIComponent(id));
  if (!row || !row.seo_slug) return home();
  return new Response(null, { status: 301, headers: { Location: origin + "/ringtone/" + encodeURIComponent(row.seo_slug), "Cache-Control": "public, max-age=86400" } });
}
// RM9B_R_REDIRECT_END
