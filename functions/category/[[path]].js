/**
 * RingMang — /category/<slug>  (Phase 9C-1) server-rendered "record crate" landing page.
 * CollectionPage + ItemList + BreadcrumbList JSON-LD. Internal links: tracks + sibling crates + artist.
 * Universal render (humans + crawlers). Stretched-link rows (title=track, artist=artist, no nested <a>).
 */
const escHtml=(s)=>String(s==null?"":s).replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const escAttr=(s)=>String(s==null?"":s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const safeJson=(o)=>JSON.stringify(o).replace(/</g,"\\u003c");
const enc=(s)=>encodeURIComponent(String(s==null?"":s));
const applyTpl=(p,ctx)=>String(p||"").replace(/\{(title|artist|category|duration|count)\}/g,(_,k)=>{const v=ctx[k];return(v==null||v==="")?"":String(v)});
const fmt=(n)=>{n=n||0;if(n>=1000000)return(n/1000000).toFixed(1)+"M";if(n>=1000)return(n/1000).toFixed(1)+"K";return String(n)};
const hashStr=(s)=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
function waveBars(seed,n){let b="";for(let i=0;i<n;i++){const h=22+Math.abs(Math.sin((seed%97)*0.7+i*0.9))*78;b+='<span style="height:'+Math.round(h)+'%"></span>'}return b}
async function getJSON(SUPA,KEY,path){const r=await fetch(SUPA+"/rest/v1/"+path,{headers:{apikey:KEY,Authorization:"Bearer "+KEY,Accept:"application/json"}});if(!r.ok)return null;return r.json()}

const CSS=`
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
body{font-family:"Outfit",system-ui,sans-serif;background:#071417;color:#dbe4e6;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.stage{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 50% at 6% -8%,var(--glow,rgba(255,107,74,.14)),transparent 60%),radial-gradient(ellipse 55% 45% at 96% 106%,var(--glow2,rgba(61,220,151,.10)),transparent 60%),linear-gradient(rgba(255,255,255,.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.013) 1px,transparent 1px);background-size:100% 100%,100% 100%,40px 40px,40px 40px}
a{color:inherit}.wrap{position:relative;z-index:1;max-width:1040px;margin:0 auto;padding:0 1.1rem}
.top{position:sticky;top:0;z-index:30;background:rgba(7,20,23,.82);backdrop-filter:blur(10px);border-bottom:1px solid rgba(30,58,64,.6)}
.top-in{display:flex;align-items:center;justify-content:space-between;gap:1rem;height:3.4rem}
.brand{display:flex;align-items:center;gap:.6rem;text-decoration:none}
.eqm{display:flex;align-items:flex-end;gap:2.5px;height:18px}.eqm span{width:3px;border-radius:2px;transform-origin:bottom;animation:eqb .9s ease-in-out infinite}
.eqm span:nth-child(1){background:#ff6b4a;height:60%}.eqm span:nth-child(2){background:#ffd166;height:100%;animation-delay:.15s}.eqm span:nth-child(3){background:#3ddc97;height:45%;animation-delay:.3s}.eqm span:nth-child(4){background:#4cc9f0;height:80%;animation-delay:.45s}
@keyframes eqb{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
.wm{font-family:"Unbounded",sans-serif;font-weight:800;font-size:1.05rem;color:#fff;letter-spacing:-.01em}.wm .c{color:#ff6b4a}
.crumb{display:flex;align-items:center;gap:.45rem;font-family:"Space Mono",monospace;font-size:.62rem;color:#6b7280;min-width:0}
.crumb a{color:#9fb0b3;text-decoration:none;transition:color .2s}.crumb a:hover{color:var(--accent,#ff6b4a)}.crumb .sep{color:#2a4d55}.crumb .now{color:var(--accent,#3ddc97);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:40vw}
.browse{font-family:"Space Mono",monospace;font-size:.62rem;letter-spacing:.1em;color:#9fb0b3;text-decoration:none;border:1px solid #2a4d55;border-radius:2rem;padding:.35rem .8rem;transition:all .2s;white-space:nowrap}.browse:hover{color:#071417;background:var(--accent,#3ddc97);border-color:var(--accent,#3ddc97)}
/* crate opener */
.crate{display:grid;grid-template-columns:auto 1fr;gap:1.3rem;align-items:stretch;padding:2.6rem 0 1.4rem}
.spine{position:relative;width:18px;border-radius:9px;background:linear-gradient(180deg,var(--accent,#ff6b4a),var(--accent2,#ffd166));box-shadow:0 0 22px var(--glow,rgba(255,107,74,.5));overflow:hidden}
.spine::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(180deg,rgba(0,0,0,.18) 0 6px,transparent 6px 12px)}
.spine .notch{position:absolute;top:14px;left:50%;transform:translateX(-50%);width:8px;height:8px;border-radius:50%;background:#071417;box-shadow:0 380px 0 #071417}
.cbody{min-width:0}
.kicker{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:.8rem}
.live{width:8px;height:8px;border-radius:50%;background:var(--accent,#3ddc97);box-shadow:0 0 8px var(--glow,rgba(61,220,151,.8));animation:lp 1.6s ease-in-out infinite}@keyframes lp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
.ktxt{font-family:"Space Mono",monospace;font-size:.62rem;letter-spacing:.24em;text-transform:uppercase;color:var(--accent,#3ddc97)}
.kcount{font-family:"Space Mono",monospace;font-size:.6rem;color:#9fb0b3;border:1px solid #2a4d55;border-radius:2rem;padding:.18rem .6rem}
h1{font-family:"Unbounded",sans-serif;font-weight:800;font-size:clamp(2.3rem,7vw,4.4rem);line-height:1.02;color:#fff;letter-spacing:-.025em;position:relative;display:inline-block}
.squig{position:absolute;left:0;right:0;bottom:-.55rem;width:100%;height:14px}.squig path{stroke-dasharray:420;stroke-dashoffset:420;animation:draw 1.3s ease-out .4s forwards}@keyframes draw{to{stroke-dashoffset:0}}
.desc{margin-top:1.2rem;color:#84969a;font-size:1.02rem;line-height:1.65;max-width:56ch}
.cstats{margin-top:1.2rem;display:flex;flex-wrap:wrap;gap:1.4rem}
.cstat{display:flex;flex-direction:column;gap:.15rem}.cstat b{font-family:"Space Mono",monospace;font-size:1.5rem;font-weight:700;color:#fff;line-height:1}.cstat span{font-family:"Space Mono",monospace;font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;color:#6b7280}
/* sibling crates rail */
.rail-h{font-family:"Unbounded",sans-serif;font-size:.92rem;font-weight:700;color:#fff;margin:2rem 0 .8rem;display:flex;align-items:center;gap:.5rem}.rail-h .bar{width:4px;height:1.05rem;border-radius:2px;background:var(--accent,#ff6b4a);box-shadow:0 0 8px var(--glow,rgba(255,107,74,.6))}
.crates{display:flex;gap:.6rem;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:.6rem;scrollbar-width:thin;scrollbar-color:#2a4d55 transparent}.crates::-webkit-scrollbar{height:6px}.crates::-webkit-scrollbar-thumb{background:#2a4d55;border-radius:3px}
.stab{scroll-snap-align:start;flex:0 0 auto;display:flex;align-items:center;gap:.5rem;text-decoration:none;font-family:"Space Mono",monospace;font-size:.72rem;font-weight:700;color:#9fb0b3;background:#102226;border:1px solid #1e3a40;border-radius:2rem;padding:.5rem .95rem;transition:all .22s;opacity:0;transform:translateY(12px)}.stab.revealed{opacity:1;transform:translateY(0);transition:opacity .5s ease,transform .5s ease,all .22s}
.stab:hover{color:#fff;border-color:var(--accent,#ff6b4a);transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,.4)}.stab .dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}.stab .n{color:#5b6b6e;font-weight:400}
/* records-in-crate list */
.list{display:flex;flex-direction:column;gap:.55rem;padding-bottom:1rem}
.row{position:relative;display:grid;grid-template-columns:2rem 56px 1fr auto 1.4rem;align-items:center;gap:.85rem;background:#102226;border:1px solid #1e3a40;border-radius:.8rem;padding:.85rem 1rem;overflow:hidden;transition:transform .25s,border-color .25s,box-shadow .25s,background .25s;opacity:0;transform:translateY(16px)}
.row.revealed{opacity:1;transform:translateY(0);transition:opacity .5s ease,transform .5s ease,transform .25s,border-color .25s,box-shadow .25s,background .25s}
.row::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--accent,#ff6b4a);transform:scaleY(0);transform-origin:top;transition:transform .3s ease}
.row:hover{transform:translateY(-3px);border-color:#2a4d55;background:#13191f;box-shadow:0 12px 30px rgba(0,0,0,.45)}.row:hover::before{transform:scaleY(1)}
.rk{font-family:"Space Mono",monospace;font-size:.74rem;color:#4b5563;text-align:right}
.rw{display:flex;align-items:flex-end;gap:2px;height:24px}.rw span{flex:1;border-radius:2px;background:#2a4d55;transform-origin:bottom;transition:background .3s}.row:hover .rw span{background:var(--accent,#ff6b4a);animation:cw .7s ease-in-out infinite}.rw span:nth-child(3n){animation-delay:.1s}.rw span:nth-child(4n){animation-delay:.2s}@keyframes cw{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}
.rbody{min-width:0;display:flex;flex-direction:column;gap:.2rem}
.rt{position:relative;font-family:"Unbounded",sans-serif;font-size:.92rem;font-weight:600;color:#eef3f4;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rt::after{content:"";position:absolute;inset:0;z-index:1}
.row:hover .rt{color:#fff}
.rm{font-size:.74rem;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ra{position:relative;z-index:2;color:#4cc9f0;text-decoration:none;border-bottom:1px dashed rgba(76,201,240,.35)}.ra:hover{color:#7fd9f5}
.rdl{font-family:"Space Mono",monospace;font-size:.68rem;color:#3ddc97;white-space:nowrap}
.rarr{color:#3a4a5e;font-size:.9rem;transition:color .2s,transform .2s}.row:hover .rarr{color:var(--accent,#ff6b4a);transform:translateX(3px)}
.empty{color:#6b7280;text-align:center;padding:2rem;font-family:"Space Mono",monospace;font-size:.8rem}
.foot{position:relative;z-index:1;border-top:1px solid rgba(20,38,42,.8);margin-top:2rem}.foot-in{padding:1.8rem 0 2.4rem}.foot .wm2{font-family:"Unbounded",sans-serif;font-weight:700;color:#cdd8da;font-size:.9rem;margin-bottom:.6rem}.foot p{font-size:.74rem;color:#56676a;line-height:1.6;max-width:64ch}.foot a{color:#7c8d90;text-decoration:none}.foot a:hover{color:var(--accent,#ff6b4a)}
@media(max-width:560px){.row{grid-template-columns:1.6rem 44px 1fr auto}.rw{display:none}.crumb .now{max-width:46vw}}
`;

const CLIENT=`
(function(){var d=document.getElementById("rm-cat");var total=parseInt(d.getAttribute("data-total"),10)||0;var c=document.getElementById("catcount");if(c){var st=performance.now();(function tk(now){var p=Math.min((now-st)/1100,1);c.textContent=Math.round(total*(1-Math.pow(1-p,3))).toLocaleString();if(p<1)requestAnimationFrame(tk)})(st)}if("IntersectionObserver"in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("revealed");io.unobserve(e.target)}})},{threshold:.08});document.querySelectorAll(".row,.stab").forEach(function(x){io.observe(x)})}else{document.querySelectorAll(".row,.stab").forEach(function(x){x.classList.add("revealed")})}})();
`;

const PALETTES=[["#ff6b4a","#ffd166","rgba(255,107,74,.14)","rgba(255,209,102,.10)"],["#3ddc97","#4cc9f0","rgba(61,220,151,.14)","rgba(76,201,240,.10)"],["#4cc9f0","#38bdf8","rgba(76,201,240,.14)","rgba(56,189,248,.10)"],["#ffd166","#fb923c","rgba(255,209,102,.14)","rgba(251,146,60,.10)"],["#c084fc","#4cc9f0","rgba(192,132,252,.14)","rgba(76,201,240,.10)"],["#fb7185","#fbbf24","rgba(251,113,133,.14)","rgba(251,191,36,.10)"]];

export async function onRequestGet(context){
  const { request, env, params } = context;
  const origin = new URL(request.url).origin;
  const SUPA = env.SUPABASE_URL, KEY = env.SUPABASE_ANON_KEY;
  const slug = (params.path || []).join("/");
  const home = () => new Response(null, { status: 301, headers: { Location: origin + "/", "Cache-Control": "public, max-age=3600" } });
  if (!SUPA || !KEY || !slug) return home();

  const cat = await getJSON(SUPA, KEY, "categories?slug=eq." + enc(slug) + "&select=id,name,slug,seo_title,seo_description,seo_noindex&limit=1");
  if (!Array.isArray(cat) || !cat[0]) {
    return new Response('<!doctype html><meta charset="utf-8"><title>Category not found · RingMang</title><meta name="robots" content="noindex,follow"><link rel="canonical" href="' + origin + '/"><p style="font-family:monospace;color:#9ca3af;padding:2rem">Category not found. <a style="color:#4cc9f0" href="' + origin + '/">Home</a></p>', { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
  const C = cat[0];
  const tracks = (await getJSON(SUPA, KEY, "ringtones?category_id=eq." + enc(C.id) + "&select=id,title,seo_slug,download_count,artists(name,slug)&order=download_count.desc&limit=60")) || [];
  const sibs = (await getJSON(SUPA, KEY, "categories?id=neq." + enc(C.id) + "&select=id,name,slug&order=name")) || [];
  // per-sibling counts (lightweight)
  const sibCounts = {};
  if (sibs.length) { const all = (await getJSON(SUPA, KEY, "ringtones?category_id=not.is.null&select=category_id&limit=5000")) || []; all.forEach((r) => { if (r.category_id) sibCounts[r.category_id] = (sibCounts[r.category_id] || 0) + 1; }); }
  const tpls = (await getJSON(SUPA, KEY, "seo_templates?select=template_key,pattern")) || []; const tmap = {}; tpls.forEach((t) => { tmap[t.template_key] = t.pattern; });
  const totalDl = tracks.reduce((s, t) => s + (t.download_count || 0), 0);
  const ctx = { title: C.name, category: C.name, count: String(tracks.length) };
  const metaTitle = (C.seo_title && C.seo_title.trim()) ? C.seo_title.trim() : applyTpl(tmap["category_title"], ctx);
  const metaDesc = (C.seo_description && C.seo_description.trim()) ? C.seo_description.trim() : applyTpl(tmap["category_desc"], ctx);
  const canonical = origin + "/category/" + enc(C.slug);
  const ogImage = origin + "/og/category/" + enc(C.slug) + ".svg";
  const noindex = C.seo_noindex === true;
  const robots = noindex ? "noindex,follow" : "index,follow,max-image-preview:large";
  const pal = PALETTES[hashStr(C.slug) % PALETTES.length];

  const rows = tracks.length ? tracks.map((t, i) => {
    const a = t.artists;
    const artistHtml = (a && a.slug) ? '<a class="ra" href="' + origin + '/artist/' + enc(a.slug) + '">' + escHtml(a.name) + '</a>' : escHtml("RingMang");
    return '<div class="row" style="animation-delay:' + (i * 28) + 'ms"><span class="rk">' + String(i + 1).padStart(2, "0") + '</span><span class="rw" aria-hidden="true">' + waveBars(hashStr(t.title) + i, 14) + '</span><span class="rbody"><a class="rt" href="' + origin + '/ringtone/' + enc(t.seo_slug) + '">' + escHtml(t.title) + '</a><span class="rm">by ' + artistHtml + '</span></span><span class="rdl">⬇ ' + fmt(t.download_count) + '</span><span class="rarr" aria-hidden="true">→</span></div>';
  }).join("") : '<div class="empty">No ringtones in this crate yet — check back soon.</div>';

  const sibRail = sibs.length ? '<section class="wrap"><h2 class="rail-h"><span class="bar"></span>Other crates</h2><div class="crates">' + sibs.map((s, i) => { const p = PALETTES[hashStr(s.slug) % PALETTES.length]; return '<a class="stab" href="' + origin + '/category/' + enc(s.slug) + '" style="animation-delay:' + (i * 25) + 'ms"><span class="dot" style="background:' + p[0] + ';box-shadow:0 0 7px ' + p[0] + '"></span>' + escHtml(s.name) + '<span class="n">' + (sibCounts[s.id] || 0) + '</span></a>'; }).join("") + '</div></section>' : '';

  const itemList = { "@context": "https://schema.org", "@type": "ItemList", name: metaTitle, itemListElement: tracks.slice(0, 50).map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.title, url: origin + "/ringtone/" + enc(t.seo_slug) })) };
  const page = { "@context": "https://schema.org", "@type": "CollectionPage", name: metaTitle, description: metaDesc, url: canonical, isPartOf: { "@type": "WebSite", name: "RingMang", url: origin + "/" }, mainEntity: itemList };
  const bc = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Home", item: origin + "/" }, { "@type": "ListItem", position: 2, name: C.name, item: canonical } ] };

  const html = '<!doctype html><html lang="en"><head>'
    + '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>' + escHtml(metaTitle) + '</title>'
    + '<meta name="description" content="' + escAttr(metaDesc) + '">'
    + '<meta name="robots" content="' + robots + '"><link rel="canonical" href="' + canonical + '">'
    + '<meta property="og:type" content="music.playlist"><meta property="og:site_name" content="RingMang">'
    + '<meta property="og:title" content="' + escAttr(metaTitle) + '"><meta property="og:description" content="' + escAttr(metaDesc) + '">'
    + '<meta property="og:url" content="' + canonical + '"><meta property="og:image" content="' + ogImage + '">'
    + '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
    + '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' + escAttr(metaTitle) + '"><meta name="twitter:description" content="' + escAttr(metaDesc) + '"><meta name="twitter:image" content="' + ogImage + '">'
    + '<meta name="theme-color" content="#071417"><link rel="manifest" href="/manifest.webmanifest"><link rel="icon" type="image/svg+xml" href="/icon.svg"><link rel="apple-touch-icon" href="/icon.svg">'
    + '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    + '<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Outfit:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">'
    + '<script type="application/ld+json">' + safeJson(page) + '</script><script type="application/ld+json">' + safeJson(bc) + '</script>'
    + '<style>' + CSS + '</style></head>'
    + '<body style="--accent:' + pal[0] + ';--accent2:' + pal[1] + ';--glow:' + pal[2] + ';--glow2:' + pal[3] + '">'
    + '<div class="stage"></div>'
    + '<div id="rm-cat" class="wrap" style="display:none" data-total="' + tracks.length + '"></div>'
    + '<header class="top"><div class="wrap top-in"><a class="brand" href="' + origin + '/"><div class="eqm" aria-hidden="true"><span></span><span></span><span></span><span></span></div><span class="wm">Ring<span class="c">Mang</span></span></a><nav class="crumb" aria-label="Breadcrumb"><a href="' + origin + '/">Home</a><span class="sep">/</span><span class="now">' + escHtml(C.name) + '</span></nav><a class="browse" href="' + origin + '/#library">Browse all</a></div></header>'
    + '<main>'
    + '<section class="wrap crate"><div class="spine" aria-hidden="true"><span class="notch"></span></div><div class="cbody">'
    + '<div class="kicker"><span class="live"></span><span class="ktxt">Category · Crate</span><span class="kcount"><span id="catcount">0</span> ringtones</span></div>'
    + '<h1>' + escHtml(C.name) + '<svg class="squig" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10 Q 75 2, 150 9 T 297 6" fill="none" stroke="' + pal[1] + '" stroke-width="4" stroke-linecap="round"/></svg></h1>'
    + '<p class="desc">' + escHtml(metaDesc) + '</p>'
    + '<div class="cstats"><div class="cstat"><b id="catcount2" style="display:none">' + tracks.length + '</b><b>' + tracks.length + '</b><span>Tracks</span></div><div class="cstat"><b>' + fmt(totalDl) + '</b><span>Total downloads</span></div></div>'
    + '</div></section>'
    + '<section class="wrap"><h2 class="rail-h"><span class="bar"></span>Records in this crate</h2><div class="list">' + rows + '</div></section>'
    + sibRail
    + '</main>'
    + '<footer class="foot"><div class="wrap foot-in"><div class="wm2">Ring<span style="color:var(--accent,#ff6b4a)">Mang</span></div><p><strong style="color:#7c8d90">Copyright &amp; DMCA:</strong> RingMang respects intellectual property rights. Content marked © Copyrighted is shared for preview and promotional purposes. If you believe your copyright has been infringed, submit a DMCA takedown request and we will promptly review it. <a href="' + origin + '/">RingMang home</a></p></div></footer>'
    + '<script>' + CLIENT + '</script></body></html>';

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300" } });
}
// RM9C_CATEGORY_END
