/**
 * RingMang — /sitemap  (Phase 9C-3) human-readable CRAWL MAP console (bonus, noindex).
 * Crawlers use /sitemap.xml; this is for humans/auditors. Alive: ambient grid, count-up, scroll-reveal map cards.
 */
const CHUNK = 50000;
const escHtml = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const escAttr = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const today = () => new Date().toISOString().slice(0, 10);
async function getJSON(SUPA, KEY, path) { const r = await fetch(SUPA + "/rest/v1/" + path, { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Accept: "application/json" } }); if (!r.ok) return null; return r.json(); }
async function headCount(SUPA, KEY, table, extra) { const r = await fetch(SUPA + "/rest/v1/" + table + "?" + (extra || "select=id"), { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Prefer: "count=exact", Range: "0-0" } }); if (!r.ok) return 0; return parseInt(r.headers.get("content-range")?.split("/")[1] || "0", 10) || 0; }

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
body{font-family:"Outfit",system-ui,sans-serif;background:#071417;color:#dbe4e6;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.stage{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 50% at 10% -8%,rgba(45,212,191,.12),transparent 60%),radial-gradient(ellipse 55% 45% at 92% 106%,rgba(251,191,36,.10),transparent 60%),linear-gradient(rgba(255,255,255,.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.013) 1px,transparent 1px);background-size:100% 100%,100% 100%,42px 42px,42px 42px}
a{color:inherit}.wrap{position:relative;z-index:1;max-width:980px;margin:0 auto;padding:0 1.1rem}
.top{position:sticky;top:0;z-index:30;background:rgba(7,20,23,.82);backdrop-filter:blur(10px);border-bottom:1px solid rgba(30,58,64,.6)}
.top-in{display:flex;align-items:center;justify-content:space-between;gap:1rem;height:3.4rem}
.brand{display:flex;align-items:center;gap:.6rem;text-decoration:none}
.eqm{display:flex;align-items:flex-end;gap:2.5px;height:18px}.eqm span{width:3px;border-radius:2px;transform-origin:bottom;animation:eqb .9s ease-in-out infinite}
.eqm span:nth-child(1){background:#ff6b4a;height:60%}.eqm span:nth-child(2){background:#ffd166;height:100%;animation-delay:.15s}.eqm span:nth-child(3){background:#3ddc97;height:45%;animation-delay:.3s}.eqm span:nth-child(4){background:#4cc9f0;height:80%;animation-delay:.45s}
@keyframes eqb{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
.wm{font-family:"Unbounded",sans-serif;font-weight:800;font-size:1.05rem;color:#fff;letter-spacing:-.01em}.wm .c{color:#ff6b4a}
.pill{display:inline-flex;align-items:center;gap:.45rem;font-family:"Space Mono",monospace;font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:#3ddc97;border:1px solid rgba(45,212,191,.4);border-radius:2rem;padding:.3rem .7rem}
.pill .d{width:7px;height:7px;border-radius:50%;background:#3ddc97;box-shadow:0 0 8px rgba(45,212,191,.8);animation:lp 1.6s ease-in-out infinite}@keyframes lp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
.opener{padding:2.8rem 0 1.4rem}
.kicker{font-family:"Space Mono",monospace;font-size:.66rem;letter-spacing:.26em;text-transform:uppercase;color:#3ddc97;margin-bottom:.9rem;display:flex;align-items:center;gap:.6rem}
.kicker .ln{flex:0 0 36px;height:2px;background:linear-gradient(90deg,#3ddc97,transparent);border-radius:2px}
h1{font-family:"Unbounded",sans-serif;font-weight:800;font-size:clamp(2.2rem,7vw,4rem);line-height:1.02;color:#fff;letter-spacing:-.03em;max-width:14ch}
h1 em{font-style:normal;color:#ffd166}
.lede{margin-top:1.1rem;color:#84969a;font-size:1.02rem;line-height:1.65;max-width:54ch}
.lede code{font-family:"Space Mono",monospace;font-size:.86em;background:#102226;border:1px solid #1e3a40;color:#4cc9f0;padding:.05rem .4rem;border-radius:.3rem}
.stats{margin-top:1.8rem;display:grid;grid-template-columns:repeat(3,1fr);gap:.8rem}
@media(max-width:560px){.stats{grid-template-columns:1fr}}
.st{position:relative;background:linear-gradient(180deg,#10151c,#0c1117);border:1px solid #1e3a40;border-radius:.85rem;padding:1rem 1.1rem;overflow:hidden;transition:transform .25s,border-color .25s,box-shadow .25s}
.st:hover{transform:translateY(-3px);border-color:#2e3a4a;box-shadow:0 12px 30px rgba(0,0,0,.45)}
.st::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--sc,#3ddc97);box-shadow:0 0 10px var(--sc,#3ddc97)}
.st b{display:block;font-family:"Space Mono",monospace;font-size:1.9rem;font-weight:700;color:#fff;line-height:1}
.st span{display:block;margin-top:.35rem;font-family:"Space Mono",monospace;font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;color:#6b7280}
.sec-h{font-family:"Unbounded",sans-serif;font-size:.95rem;font-weight:700;color:#fff;margin:2.4rem 0 .9rem;display:flex;align-items:center;gap:.5rem}
.sec-h .bar{width:4px;height:1.1rem;border-radius:2px;background:#ffd166;box-shadow:0 0 8px rgba(255,209,102,.6)}
.sec-h .n{margin-left:auto;font-family:"Space Mono",monospace;font-size:.62rem;font-weight:400;color:#5b6b6e}
.maps{display:flex;flex-direction:column;gap:.6rem;padding-bottom:1rem}
.mcard{position:relative;display:grid;grid-template-columns:3rem 1fr auto;align-items:center;gap:1rem;background:#102226;border:1px solid #1e3a40;border-radius:.85rem;padding:1rem 1.1rem;overflow:hidden;transition:transform .25s,border-color .25s,box-shadow .25s;opacity:0;transform:translateY(16px)}
.mcard.revealed{opacity:1;transform:translateY(0);transition:opacity .5s ease,transform .5s ease,transform .25s,border-color .25s,box-shadow .25s}
.mcard::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--mc,#3ddc97);box-shadow:0 0 12px var(--mc,#3ddc97)}
.mcard:hover{transform:translateY(-3px);border-color:#2a4d55;box-shadow:0 12px 30px rgba(0,0,0,.45)}
.mico{width:3rem;height:3rem;border-radius:.7rem;display:flex;align-items:center;justify-content:center;font-family:"Space Mono",monospace;font-size:1.1rem;font-weight:700;background:var(--mc,#3ddc97)1a;border:1px solid var(--mc,#3ddc97)55;color:var(--mc,#3ddc97)}
.mbody{min-width:0}
.mtype{font-family:"Space Mono",monospace;font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;color:var(--mc,#3ddc97)}
.murl{font-family:"Space Mono",monospace;font-size:.82rem;color:#cdd8da;margin-top:.2rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mmeta{font-size:.7rem;color:#6b7280;margin-top:.3rem}
.mmeta b{color:#9fb0b3;font-weight:600}
.mopen{font-family:"Space Mono",monospace;font-size:.66rem;font-weight:700;color:#9fb0b3;text-decoration:none;border:1px solid #2a4d55;border-radius:2rem;padding:.45rem .85rem;transition:all .2s;white-space:nowrap}
.mopen:hover{color:#071417;background:var(--mc,#3ddc97);border-color:var(--mc,#3ddc97);transform:translateY(-2px)}
.note{margin:1rem 0 2.4rem;font-family:"Space Mono",monospace;font-size:.72rem;color:#56676a;line-height:1.7;border-left:2px dashed #2a4d55;padding:.4rem 0 .4rem .9rem}
.note b{color:#7c8d90}
.foot{position:relative;z-index:1;border-top:1px solid rgba(20,38,42,.8)}.foot-in{padding:1.6rem 0 2.2rem}.foot a{color:#7c8d90;text-decoration:none;font-family:"Space Mono",monospace;font-size:.72rem}.foot a:hover{color:#ff6b4a}
`;

const CLIENT = `
(function(){function cup(el,tgt){if(!el)return;var st=performance.now();(function tk(now){var p=Math.min((now-st)/1200,1);el.textContent=Math.round(tgt*(1-Math.pow(1-p,3))).toLocaleString();if(p<1)requestAnimationFrame(tk)})(st)}
 cup(document.getElementById("n-urls"),parseInt(document.getElementById("n-urls").getAttribute("data-n"),10)||0);
 cup(document.getElementById("n-maps"),parseInt(document.getElementById("n-maps").getAttribute("data-n"),10)||0);
 cup(document.getElementById("n-tax"),parseInt(document.getElementById("n-tax").getAttribute("data-n"),10)||0);
 if("IntersectionObserver"in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("revealed");io.unobserve(e.target)}})},{threshold:.1});document.querySelectorAll(".mcard").forEach(function(x){io.observe(x)})}else{document.querySelectorAll(".mcard").forEach(function(x){x.classList.add("revealed")})}})();
`;

export async function onRequestGet(context) {
  const { env } = context;
  const origin = new URL(context.request.url).origin;
  const SUPA = env.SUPABASE_URL, KEY = env.SUPABASE_ANON_KEY;
  if (!SUPA || !KEY) return new Response("Missing env", { status: 500 });

  const rCount = await headCount(SUPA, KEY, "ringtones", "select=id&seo_noindex=eq.false");
  const cCount = await headCount(SUPA, KEY, "categories", "select=id&seo_noindex=eq.false");
  const aCount = await headCount(SUPA, KEY, "artists", "select=id&seo_noindex=eq.false");
  let lastmod = today();
  const lm = await getJSON(SUPA, KEY, "ringtones?select=updated_at&order=updated_at.desc&limit=1");
  if (Array.isArray(lm) && lm[0] && lm[0].updated_at) lastmod = String(lm[0].updated_at).slice(0, 10);

  const rChildren = rCount > 0 ? Math.ceil(rCount / CHUNK) : 0;
  const taxCount = 1 + cCount + aCount;
  const totalUrls = rCount + taxCount;
  const childCount = rChildren + 1;

  const cards = [];
  for (let i = 0; i < rChildren; i++) {
    const sliceN = (i === rChildren - 1) ? (rCount - i * CHUNK) : CHUNK;
    cards.push({ ic: "♫", mc: "#ff6b4a", type: "Ringtones · page " + (i + 1) + " of " + rChildren, url: origin + "/sitemaps/ringtones-" + i + ".xml", count: sliceN, lm: lastmod, freq: "weekly" });
  }
  cards.push({ ic: "▤", mc: "#3ddc97", type: "Taxonomy · home + categories + artists", url: origin + "/sitemaps/taxonomy.xml", count: taxCount, lm: lastmod, freq: "daily" });

  const cardHtml = cards.map((c, i) =>
    '<div class="mcard" style="--mc:' + c.mc + ';animation-delay:' + (i * 40) + 'ms">'
    + '<div class="mico">' + c.ic + '</div>'
    + '<div class="mbody"><div class="mtype">' + escHtml(c.type) + '</div><div class="murl">' + escHtml(c.url) + '</div><div class="mmeta"><b>' + c.count.toLocaleString() + '</b> URLs · lastmod ' + escHtml(c.lm) + ' · ' + c.freq + '</div></div>'
    + '<a class="mopen" href="' + escAttr(c.url) + '">OPEN XML ↗</a></div>'
  ).join("");

  const html = '<!doctype html><html lang="en"><head>'
    + '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>Sitemap · Crawl Map — RingMang</title>'
    + '<meta name="description" content="Human-readable sitemap index for RingMang — every track, category and artist URL mapped for search engines.">'
    + '<meta name="robots" content="noindex,follow"><link rel="canonical" href="' + origin + '/">'
    + '<meta name="theme-color" content="#071417"><link rel="icon" type="image/svg+xml" href="/icon.svg">'
    + '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    + '<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Outfit:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">'
    + '<style>' + CSS + '</style></head><body>'
    + '<div class="stage"></div>'
    + '<header class="top"><div class="wrap top-in"><a class="brand" href="' + origin + '/"><div class="eqm" aria-hidden="true"><span></span><span></span><span></span><span></span></div><span class="wm">Ring<span class="c">Mang</span></span></a><span class="pill"><span class="d"></span>live crawl map</span></div></header>'
    + '<main class="wrap">'
    + '<section class="opener"><div class="kicker"><span class="ln"></span>SITEMAP · CRAWL MAP</div>'
    + '<h1>Every door, <em>mapped.</em></h1>'
    + '<p class="lede">This is the human view of RingMang’s sitemap. Search engines read the machine index at <code>/sitemap.xml</code>, which points to the child maps below — each auto-split so no file ever exceeds 50,000 URLs.</p>'
    + '<div class="stats">'
    + '<div class="st" style="--sc:#ff6b4a"><b id="n-urls" data-n="' + totalUrls + '">0</b><span>Indexed URLs</span></div>'
    + '<div class="st" style="--sc:#3ddc97"><b id="n-maps" data-n="' + childCount + '">0</b><span>Child maps</span></div>'
    + '<div class="st" style="--sc:#ffd166"><b id="n-tax" data-n="' + taxCount + '">0</b><span>Taxonomy URLs</span></div>'
    + '</div></section>'
    + '<section><h2 class="sec-h"><span class="bar"></span>Child sitemaps<span class="n">last crawl hint · ' + escHtml(lastmod) + '</span></h2><div class="maps">' + cardHtml + '</div></section>'
    + '<p class="note"><b>robots.txt</b> already declares <code style="font-family:Space Mono,monospace;color:#4cc9f0">Sitemap: ' + escHtml(origin) + '/sitemap.xml</code> — so crawlers discover the index automatically. Submit the same URL in Google Search Console to accelerate first indexing.</p>'
    + '</main>'
    + '<footer class="foot"><div class="wrap foot-in"><a href="' + origin + '/sitemap.xml">/sitemap.xml (machine index)</a> · <a href="' + origin + '/robots.txt">/robots.txt</a> · <a href="' + origin + '/">home</a></div></footer>'
    + '<script>' + CLIENT + '</script></body></html>';

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=120, s-maxage=300" } });
}
// RM9C_SITEMAP_HUMAN_END
