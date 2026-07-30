/**
 * RingMang — /artist/<slug>  (Phase 9C-2) server-rendered "stage spotlight" landing page.
 * MusicGroup + ItemList + BreadcrumbList JSON-LD. Internal links: track, category, sibling artists.
 * Universal render. Setlist rows = stretched-link (title->track) + raised category link (no nested <a>).
 */
const escHtml=(s)=>String(s==null?"":s).replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const escAttr=(s)=>String(s==null?"":s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const safeJson=(o)=>JSON.stringify(o).replace(/</g,"\\u003c");
const enc=(s)=>encodeURIComponent(String(s==null?"":s));
const applyTpl=(p,ctx)=>String(p||"").replace(/\{(title|artist|category|duration|count)\}/g,(_,k)=>{const v=ctx[k];return(v==null||v==="")?"":String(v)});
const fmt=(n)=>{n=n||0;if(n>=1000000)return(n/1000000).toFixed(1)+"M";if(n>=1000)return(n/1000).toFixed(1)+"K";return String(n)};
const hashStr=(s)=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const initials=(n)=>{const p=String(n||"").trim().split(/\s+/).filter(Boolean);if(p.length>=2)return(p[0][0]+p[1][0]).toUpperCase();return String(n||"?").slice(0,2).toUpperCase()};
function waveBars(seed,n){let b="";for(let i=0;i<n;i++){const h=22+Math.abs(Math.sin((seed%97)*0.7+i*0.9))*78;b+='<span style="height:'+Math.round(h)+'%"></span>'}return b}
async function getJSON(SUPA,KEY,path){const r=await fetch(SUPA+"/rest/v1/"+path,{headers:{apikey:KEY,Authorization:"Bearer "+KEY,Accept:"application/json"}});if(!r.ok)return null;return r.json()}

const CSS=`
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
body{font-family:"Outfit",system-ui,sans-serif;background:#071417;color:#dbe4e6;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.stage{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 50% 42% at 78% -6%,var(--glow,rgba(76,201,240,.16)),transparent 60%),radial-gradient(ellipse 55% 48% at 8% 104%,var(--glow2,rgba(255,107,74,.12)),transparent 60%),linear-gradient(rgba(255,255,255,.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.013) 1px,transparent 1px);background-size:100% 100%,100% 100%,40px 40px,40px 40px}
a{color:inherit}.wrap{position:relative;z-index:1;max-width:1040px;margin:0 auto;padding:0 1.1rem}
.top{position:sticky;top:0;z-index:30;background:rgba(7,20,23,.82);backdrop-filter:blur(10px);border-bottom:1px solid rgba(30,58,64,.6)}
.top-in{display:flex;align-items:center;justify-content:space-between;gap:1rem;height:3.4rem}
.brand{display:flex;align-items:center;gap:.6rem;text-decoration:none}
.eqm{display:flex;align-items:flex-end;gap:2.5px;height:18px}.eqm span{width:3px;border-radius:2px;transform-origin:bottom;animation:eqb .9s ease-in-out infinite}
.eqm span:nth-child(1){background:#ff6b4a;height:60%}.eqm span:nth-child(2){background:#ffd166;height:100%;animation-delay:.15s}.eqm span:nth-child(3){background:#3ddc97;height:45%;animation-delay:.3s}.eqm span:nth-child(4){background:#4cc9f0;height:80%;animation-delay:.45s}
@keyframes eqb{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
.wm{font-family:"Unbounded",sans-serif;font-weight:800;font-size:1.05rem;color:#fff;letter-spacing:-.01em}.wm .c{color:#ff6b4a}
.crumb{display:flex;align-items:center;gap:.45rem;font-family:"Space Mono",monospace;font-size:.62rem;color:#6b7280;min-width:0}
.crumb a{color:#9fb0b3;text-decoration:none;transition:color .2s}.crumb a:hover{color:var(--accent,#4cc9f0)}.crumb .sep{color:#2a4d55}.crumb .now{color:var(--accent,#3ddc97);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:42vw}
.browse{font-family:"Space Mono",monospace;font-size:.62rem;letter-spacing:.1em;color:#9fb0b3;text-decoration:none;border:1px solid #2a4d55;border-radius:2rem;padding:.35rem .8rem;transition:all .2s;white-space:nowrap}.browse:hover{color:#071417;background:var(--accent,#3ddc97);border-color:var(--accent,#3ddc97)}
/* spotlight opener */
.spot{display:grid;grid-template-columns:1fr;gap:1.8rem;align-items:center;padding:2.6rem 0 1.6rem}
@media(min-width:820px){.spot{grid-template-columns:auto 1fr;gap:2.4rem;padding:3.2rem 0 2rem}}
.discwrap{position:relative;width:172px;height:172px;margin:0 auto}
@media(min-width:820px){.discwrap{margin:0}}
.glow{position:absolute;inset:-26px;border-radius:50%;background:radial-gradient(circle,var(--glow,rgba(76,201,240,.5)),transparent 68%);animation:gp 3.6s ease-in-out infinite;filter:blur(2px)}
@keyframes gp{0%,100%{opacity:.55;transform:scale(.96)}50%{opacity:1;transform:scale(1.04)}}
.disc{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 38% 32%,#16202a,#071417 72%);border:1px solid #1e3a40;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 40px rgba(0,0,0,.6)}
.ring{position:absolute;inset:8px;border-radius:50%;border:2px dashed var(--accent,#4cc9f0);opacity:.5;animation:spin 22s linear infinite}
.ring2{position:absolute;inset:20px;border-radius:50%;border:1px solid var(--accent2,#ffd166);opacity:.25;animation:spin 14s linear infinite reverse}
@keyframes spin{to{transform:rotate(360deg)}}
.mono{position:relative;font-family:"Unbounded",sans-serif;font-weight:800;font-size:3.4rem;letter-spacing:-.02em;background:linear-gradient(160deg,var(--accent,#4cc9f0),var(--accent2,#ffd166));-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1}
.livepin{position:absolute;top:6px;right:6px;width:12px;height:12px;border-radius:50%;background:var(--accent,#3ddc97);box-shadow:0 0 10px var(--glow,rgba(61,220,151,.9));animation:lp 1.6s ease-in-out infinite}@keyframes lp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
.sbody{min-width:0;text-align:center}
@media(min-width:820px){.sbody{text-align:left}}
.kicker{display:inline-flex;align-items:center;gap:.6rem;margin-bottom:.9rem}
.ktxt{font-family:"Space Mono",monospace;font-size:.62rem;letter-spacing:.24em;text-transform:uppercase;color:var(--accent,#3ddc97)}
.kcount{font-family:"Space Mono",monospace;font-size:.6rem;color:#9fb0b3;border:1px solid #2a4d55;border-radius:2rem;padding:.18rem .6rem}
h1{font-family:"Unbounded",sans-serif;font-weight:800;font-size:clamp(2.4rem,7.4vw,4.6rem);line-height:1.0;color:#fff;letter-spacing:-.03em;position:relative;display:inline-block}
.squig{position:absolute;left:0;right:0;bottom:-.5rem;width:100%;height:14px}.squig path{stroke-dasharray:420;stroke-dashoffset:420;animation:draw 1.3s ease-out .4s forwards}@keyframes draw{to{stroke-dashoffset:0}}
.role{margin-top:1rem;font-family:"Space Mono",monospace;font-size:.74rem;letter-spacing:.06em;color:#84969a}
.desc{margin-top:.9rem;color:#84969a;font-size:1.02rem;line-height:1.65;max-width:54ch;display:inline-block}
.astats{margin-top:1.4rem;display:flex;flex-wrap:wrap;gap:1.6rem;justify-content:center}
@media(min-width:820px){.astats{justify-content:flex-start}}
.astat{display:flex;flex-direction:column;gap:.15rem}.astat b{font-family:"Space Mono",monospace;font-size:1.55rem;font-weight:700;color:#fff;line-height:1}.astat span{font-family:"Space Mono",monospace;font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;color:#6b7280}
.topcrate{display:inline-flex;align-items:center;gap:.5rem;margin-top:1.1rem;text-decoration:none;font-family:"Space Mono",monospace;font-size:.72rem;color:#9fb0b3;border:1px solid #2a4d55;border-radius:2rem;padding:.4rem .9rem;transition:all .22s}.topcrate:hover{color:#fff;border-color:var(--accent,#4cc9f0);transform:translateY(-2px)}.topcrate .d{width:8px;height:8px;border-radius:50%;background:var(--accent2,#ffd166);box-shadow:0 0 7px var(--accent2,#ffd166)}
/* setlist */
.rail-h{font-family:"Unbounded",sans-serif;font-size:.95rem;font-weight:700;color:#fff;margin:2.2rem 0 .9rem;display:flex;align-items:center;gap:.5rem}.rail-h .bar{width:4px;height:1.1rem;border-radius:2px;background:var(--accent,#4cc9f0);box-shadow:0 0 8px var(--glow,rgba(76,201,240,.6))}.rail-h .n{margin-left:auto;font-family:"Space Mono",monospace;font-size:.62rem;font-weight:400;color:#5b6b6e;letter-spacing:.08em}
.list{display:flex;flex-direction:column;gap:.55rem;padding-bottom:1rem}
.row{position:relative;display:grid;grid-template-columns:2.2rem 56px 1fr auto 1.4rem;align-items:center;gap:.85rem;background:#102226;border:1px solid #1e3a40;border-radius:.8rem;padding:.85rem 1rem;overflow:hidden;transition:transform .25s,border-color .25s,box-shadow .25s,background .25s;opacity:0;transform:translateY(16px)}
.row.revealed{opacity:1;transform:translateY(0);transition:opacity .5s ease,transform .5s ease,transform .25s,border-color .25s,box-shadow .25s,background .25s}
.row::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--accent,#4cc9f0);transform:scaleY(0);transform-origin:top;transition:transform .3s ease}
.row:hover{transform:translateY(-3px);border-color:#2a4d55;background:#13191f;box-shadow:0 12px 30px rgba(0,0,0,.45)}.row:hover::before{transform:scaleY(1)}
.rk{font-family:"Space Mono",monospace;font-size:.78rem;color:#4b5563;text-align:right}
.rw{display:flex;align-items:flex-end;gap:2px;height:24px}.rw span{flex:1;border-radius:2px;background:#2a4d55;transform-origin:bottom;transition:background .3s}.row:hover .rw span{background:var(--accent,#4cc9f0);animation:cw .7s ease-in-out infinite}.rw span:nth-child(3n){animation-delay:.1s}.rw span:nth-child(4n){animation-delay:.2s}@keyframes cw{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}
.rbody{min-width:0;display:flex;flex-direction:column;gap:.25rem}
.rt{position:relative;font-family:"Unbounded",sans-serif;font-size:.92rem;font-weight:600;color:#eef3f4;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rt::after{content:"";position:absolute;inset:0;z-index:1}.row:hover .rt{color:#fff}
.rmeta{font-size:.72rem;color:#6b7280;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.rcat{position:relative;z-index:2;color:var(--accent2,#ffd166);text-decoration:none;border-bottom:1px dashed rgba(255,209,102,.4);transition:color .2s}.rcat:hover{color:#fff}
.rdl{font-family:"Space Mono",monospace;font-size:.68rem;color:#3ddc97;white-space:nowrap}
.rarr{color:#3a4a5e;font-size:.9rem;transition:color .2s,transform .2s}.row:hover .rarr{color:var(--accent,#4cc9f0);transform:translateX(3px)}
.empty{color:#6b7280;text-align:center;padding:2rem;font-family:"Space Mono",monospace;font-size:.8rem}
/* sibling artists */
.artists{display:flex;gap:.7rem;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:.6rem;scrollbar-width:thin;scrollbar-color:#2a4d55 transparent}.artists::-webkit-scrollbar{height:6px}.artists::-webkit-scrollbar-thumb{background:#2a4d55;border-radius:3px}
.acard{scroll-snap-align:start;flex:0 0 auto;display:flex;align-items:center;gap:.7rem;text-decoration:none;background:#102226;border:1px solid #1e3a40;border-radius:.8rem;padding:.6rem .9rem .6rem .6rem;transition:all .22s;opacity:0;transform:translateY(12px)}.acard.revealed{opacity:1;transform:translateY(0);transition:opacity .5s ease,transform .5s ease,all .22s}
.acard:hover{transform:translateY(-3px);border-color:var(--accent,#4cc9f0);box-shadow:0 8px 22px rgba(0,0,0,.4)}
.acard .av{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:"Unbounded",sans-serif;font-weight:700;font-size:.8rem;flex-shrink:0;border:2px solid}
.acard .an{font-family:"Space Grotesk",sans-serif;font-weight:600;font-size:.82rem;color:#e5e7eb;white-space:nowrap}.acard .ac{font-family:"Space Mono",monospace;font-size:.6rem;color:#6b7280}
.foot{position:relative;z-index:1;border-top:1px solid rgba(20,38,42,.8);margin-top:2rem}.foot-in{padding:1.8rem 0 2.4rem}.foot .wm2{font-family:"Unbounded",sans-serif;font-weight:700;color:#cdd8da;font-size:.9rem;margin-bottom:.6rem}.foot p{font-size:.74rem;color:#56676a;line-height:1.6;max-width:64ch}.foot a{color:#7c8d90;text-decoration:none}.foot a:hover{color:var(--accent,#4cc9f0)}
@media(max-width:560px){.row{grid-template-columns:1.8rem 1fr auto}.rw{display:none}.crumb .now{max-width:46vw}}
`;

const CLIENT=`
(function(){var d=document.getElementById("rm-art");var tN=parseInt(d.getAttribute("data-tracks"),10)||0;var dN=parseInt(d.getAttribute("data-dl"),10)||0;
 function cup(el,tgt){if(!el)return;var st=performance.now();(function tk(now){var p=Math.min((now-st)/1100,1);el.textContent=Math.round(tgt*(1-Math.pow(1-p,3))).toLocaleString();if(p<1)requestAnimationFrame(tk)})(st)}
 cup(document.getElementById("arttracks"),tN);cup(document.getElementById("artdl"),dN);
 if("IntersectionObserver"in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("revealed");io.unobserve(e.target)}})},{threshold:.08});document.querySelectorAll(".row,.acard").forEach(function(x){io.observe(x)})}else{document.querySelectorAll(".row,.acard").forEach(function(x){x.classList.add("revealed")})}})();
`;

const PALETTES=[["#4cc9f0","#ffd166","rgba(76,201,240,.16)","rgba(255,209,102,.12)"],["#3ddc97","#4cc9f0","rgba(61,220,151,.16)","rgba(76,201,240,.12)"],["#ff6b4a","#ffd166","rgba(255,107,74,.16)","rgba(255,209,102,.12)"],["#c084fc","#4cc9f0","rgba(192,132,252,.16)","rgba(76,201,240,.12)"],["#fb7185","#fbbf24","rgba(251,113,133,.16)","rgba(251,191,36,.12)"],["#38bdf8","#3ddc97","rgba(56,189,248,.16)","rgba(61,220,151,.12)"]];

export async function onRequestGet(context){
  const { env, params } = context;
  const origin = new URL(env.__ORIGIN || new URL(context.request.url).origin ? new URL(context.request.url).origin : "");
  const o = new URL(context.request.url).origin;
  const SUPA = env.SUPABASE_URL, KEY = env.SUPABASE_ANON_KEY;
  const slug = (params.path || []).join("/");
  const home = () => new Response(null, { status: 301, headers: { Location: o + "/", "Cache-Control": "public, max-age=3600" } });
  if (!SUPA || !KEY || !slug) return home();

  const ar = await getJSON(SUPA, KEY, "artists?slug=eq." + enc(slug) + "&select=id,name,slug,seo_title,seo_description,seo_noindex&limit=1");
  if (!Array.isArray(ar) || !ar[0]) {
    return new Response('<!doctype html><meta charset="utf-8"><title>Artist not found · RingMang</title><meta name="robots" content="noindex,follow"><link rel="canonical" href="' + o + '/"><p style="font-family:monospace;color:#9ca3af;padding:2rem">Artist not found. <a style="color:#4cc9f0" href="' + o + '/">Home</a></p>', { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
  const A = ar[0];
  const tracks = (await getJSON(SUPA, KEY, "ringtones?artist_id=eq." + enc(A.id) + "&select=id,title,seo_slug,download_count,genre,categories(name,slug)&order=download_count.desc&limit=80")) || [];
  const sibs = (await getJSON(SUPA, KEY, "artists?id=neq." + enc(A.id) + "&select=id,name,slug&order=name&limit=40")) || [];
  const sibCounts = {};
  if (sibs.length) { const all = (await getJSON(SUPA, KEY, "ringtones?artist_id=not.is.null&select=artist_id&limit=5000")) || []; all.forEach((r) => { if (r.artist_id) sibCounts[r.artist_id] = (sibCounts[r.artist_id] || 0) + 1; }); }

  const totalDl = tracks.reduce((s, t) => s + (t.download_count || 0), 0);
  // top crate (most frequent category among this artist's tracks)
  const cMap = {}; tracks.forEach((t) => { if (t.categories && t.categories.slug) cMap[t.categories.slug] = cMap[t.categories.slug] || { name: t.categories.name, slug: t.categories.slug, n: 0 }; if (t.categories && t.categories.slug) cMap[t.categories.slug].n++; });
  const topCrate = Object.values(cMap).sort((a, b) => b.n - a.n)[0] || null;
  const genreLabel = (tracks.find((t) => t.genre) || {}).genre || (topCrate ? topCrate.name : "");

  const tpls = (await getJSON(SUPA, KEY, "seo_templates?select=template_key,pattern")) || []; const tmap = {}; tpls.forEach((t) => { tmap[t.template_key] = t.pattern; });
  const ctx = { artist: A.name, count: String(tracks.length) };
  const metaTitle = (A.seo_title && A.seo_title.trim()) ? A.seo_title.trim() : applyTpl(tmap["artist_title"], ctx);
  const metaDesc = (A.seo_description && A.seo_description.trim()) ? A.seo_description.trim() : applyTpl(tmap["artist_desc"], ctx);
  const canonical = o + "/artist/" + enc(A.slug);
  const ogImage = o + "/og/artist/" + enc(A.slug) + ".svg";
  const noindex = A.seo_noindex === true;
  const robots = noindex ? "noindex,follow" : "index,follow,max-image-preview:large";
  const pal = PALETTES[hashStr(A.slug) % PALETTES.length];

  const rows = tracks.length ? tracks.map((t, i) => {
    const c = t.categories;
    const catHtml = (c && c.slug) ? '<a class="rcat" href="' + o + '/category/' + enc(c.slug) + '">' + escHtml(c.name) + '</a>' : '<span style="color:#4b5563">Uncategorized</span>';
    return '<div class="row" style="animation-delay:' + (i * 26) + 'ms"><span class="rk">' + String(i + 1).padStart(2, "0") + '</span><span class="rw" aria-hidden="true">' + waveBars(hashStr(t.title) + i, 14) + '</span><span class="rbody"><a class="rt" href="' + o + '/ringtone/' + enc(t.seo_slug) + '">' + escHtml(t.title) + '</a><span class="rmeta">' + catHtml + (t.genre ? ' · <span style="color:#6b7280">' + escHtml(t.genre) + '</span>' : '') + '</span></span><span class="rdl">⬇ ' + fmt(t.download_count) + '</span><span class="rarr" aria-hidden="true">→</span></div>';
  }).join("") : '<div class="empty">No tracks from this artist yet — check back soon.</div>';

  const artistRail = sibs.length ? '<section class="wrap"><h2 class="rail-h"><span class="bar" style="background:var(--accent2,#ffd166);box-shadow:0 0 8px var(--glow2,rgba(255,209,102,.6))"></span>More artists<span class="n">' + sibs.length + ' on RingMang</span></h2><div class="artists">' + sibs.map((s, i) => { const p = PALETTES[hashStr(s.slug) % PALETTES.length]; const ini = initials(s.name); return '<a class="acard" href="' + o + '/artist/' + enc(s.slug) + '" style="animation-delay:' + (i * 22) + 'ms"><span class="av" style="background:' + p[0] + '1f;border-color:' + p[0] + '66;color:' + p[0] + '">' + escHtml(ini) + '</span><span><span class="an">' + escHtml(s.name) + '</span><span class="ac">' + (sibCounts[s.id] || 0) + ' tracks</span></span></a>'; }).join("") + '</div></section>' : '';

  const group = { "@context": "https://schema.org", "@type": "MusicGroup", name: A.name, url: canonical, image: ogImage };
  if (genreLabel) group.genre = genreLabel;
  const itemList = { "@context": "https://schema.org", "@type": "ItemList", name: metaTitle, itemListElement: tracks.slice(0, 50).map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.title, url: o + "/ringtone/" + enc(t.seo_slug) })) };
  const page = { "@context": "https://schema.org", "@type": "CollectionPage", name: metaTitle, description: metaDesc, url: canonical, about: group, mainEntity: itemList };
  const bc = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Home", item: o + "/" }, { "@type": "ListItem", position: 2, name: A.name, item: canonical } ] };

  const html = '<!doctype html><html lang="en"><head>'
    + '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>' + escHtml(metaTitle) + '</title>'
    + '<meta name="description" content="' + escAttr(metaDesc) + '">'
    + '<meta name="robots" content="' + robots + '"><link rel="canonical" href="' + canonical + '">'
    + '<meta property="og:type" content="profile"><meta property="og:site_name" content="RingMang">'
    + '<meta property="og:title" content="' + escAttr(metaTitle) + '"><meta property="og:description" content="' + escAttr(metaDesc) + '">'
    + '<meta property="og:url" content="' + canonical + '"><meta property="og:image" content="' + ogImage + '">'
    + '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
    + '<meta property="profile:username" content="' + escAttr(A.slug) + '">'
    + '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' + escAttr(metaTitle) + '"><meta name="twitter:description" content="' + escAttr(metaDesc) + '"><meta name="twitter:image" content="' + ogImage + '">'
    + '<meta name="theme-color" content="#071417"><link rel="manifest" href="/manifest.webmanifest"><link rel="icon" type="image/svg+xml" href="/icon.svg"><link rel="apple-touch-icon" href="/icon.svg">'
    + '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    + '<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Outfit:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">'
    + '<script type="application/ld+json">' + safeJson(group) + '</script><script type="application/ld+json">' + safeJson(itemList) + '</script><script type="application/ld+json">' + safeJson(bc) + '</script>'
    + '<style>' + CSS + '</style></head>'
    + '<body style="--accent:' + pal[0] + ';--accent2:' + pal[1] + ';--glow:' + pal[2] + ';--glow2:' + pal[3] + '">'
    + '<div class="stage"></div>'
    + '<div id="rm-art" class="wrap" style="display:none" data-tracks="' + tracks.length + '" data-dl="' + totalDl + '"></div>'
    + '<header class="top"><div class="wrap top-in"><a class="brand" href="' + o + '/"><div class="eqm" aria-hidden="true"><span></span><span></span><span></span><span></span></div><span class="wm">Ring<span class="c">Mang</span></span></a><nav class="crumb" aria-label="Breadcrumb"><a href="' + o + '/">Home</a><span class="sep">/</span><span class="now">' + escHtml(A.name) + '</span></nav><a class="browse" href="' + o + '/#library">Browse all</a></div></header>'
    + '<main>'
    + '<section class="wrap spot">'
    + '<div class="discwrap"><div class="glow" aria-hidden="true"></div><div class="disc"><div class="ring" aria-hidden="true"></div><div class="ring2" aria-hidden="true"></div><span class="mono">' + escHtml(initials(A.name)) + '</span></div><span class="livepin" aria-hidden="true"></span></div>'
    + '<div class="sbody">'
    + '<div class="kicker"><span class="ktxt">Artist · On stage</span><span class="kcount"><span id="arttracks">' + tracks.length + '</span> tracks</span></div>'
    + '<h1>' + escHtml(A.name) + '<svg class="squig" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10 Q 75 2, 150 9 T 297 6" fill="none" stroke="' + pal[1] + '" stroke-width="4" stroke-linecap="round"/></svg></h1>'
    + '<p class="role">Ringtones &amp; sound clips · RingMang</p>'
    + '<p class="desc">' + escHtml(metaDesc) + '</p>'
    + '<div class="astats"><div class="astat"><b>' + tracks.length + '</b><span>Tracks</span></div><div class="astat"><b id="artdl">' + fmt(totalDl) + '</b><span>Downloads</span></div>' + (genreLabel ? '<div class="astat"><b style="font-size:1rem;color:var(--accent2,' + pal[1] + ')">' + escHtml(genreLabel) + '</b><span>Top genre</span></div>' : '') + '</div>'
    + (topCrate ? '<a class="topcrate" href="' + o + '/category/' + enc(topCrate.slug) + '"><span class="d"></span>Mostly in · ' + escHtml(topCrate.name) + '</a>' : '')
    + '</div></section>'
    + '<section class="wrap"><h2 class="rail-h"><span class="bar"></span>Discography<span class="n">' + tracks.length + ' tracks · by downloads</span></h2><div class="list">' + rows + '</div></section>'
    + artistRail
    + '</main>'
    + '<footer class="foot"><div class="wrap foot-in"><div class="wm2">Ring<span style="color:var(--accent,#4cc9f0)">Mang</span></div><p><strong style="color:#7c8d90">Copyright &amp; DMCA:</strong> RingMang respects intellectual property rights. Content marked © Copyrighted is shared for preview and promotional purposes. If you believe your copyright has been infringed, submit a DMCA takedown request and we will promptly review it. <a href="' + o + '/">RingMang home</a></p></div></footer>'
    + '<script>' + CLIENT + '</script></body></html>';

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300" } });
}
// RM9C_ARTIST_END
