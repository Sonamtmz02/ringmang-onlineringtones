/**
 * RingMang — Per-ringtone edge-rendered landing page (Cloudflare Pages Function = Edge Worker)
 * Serves FULL server-rendered HTML (OG + Twitter + JSON-LD + canonical + related links).
 * Works for humans AND no-JS social crawlers AND search bots — no redirect, no bot-detection needed.
 * Secrets read from Pages env (context.env), never hardcoded. Domain derived from request (never hardcoded).
 */

const PAGE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:"Outfit",system-ui,sans-serif;background:#071417;color:#dbe4e6;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.stage{position:fixed;inset:0;z-index:0;pointer-events:none;background:
  radial-gradient(ellipse 65% 50% at 14% -6%, rgba(255,107,74,.12), transparent 60%),
  radial-gradient(ellipse 55% 45% at 88% 106%, rgba(61,220,151,.09), transparent 60%),
  radial-gradient(ellipse 38% 32% at 78% 4%, rgba(255,209,102,.06), transparent 55%),
  linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px);
  background-size:100% 100%,100% 100%,100% 100%,34px 34px,34px 34px}
.topbar{position:relative;z-index:2;max-width:960px;margin:0 auto;padding:1.1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;text-decoration:none}
.wm{font-family:"Unbounded",sans-serif;font-weight:800;font-size:1.15rem;color:#fff;letter-spacing:-.01em}
.wm .c{color:#ff6b4a}
.crumb{font-family:"Space Mono",monospace;font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;color:#5b6b6e}
.card{position:relative;z-index:1;max-width:960px;margin:0 auto;padding:0 1.25rem 2rem}
.hero{display:grid;grid-template-columns:1fr;gap:1.6rem;background:linear-gradient(180deg,#102226,#0b181b);border:1px solid #1e3a40;border-radius:1.3rem;padding:1.4rem;box-shadow:0 24px 70px rgba(0,0,0,.5);overflow:hidden}
@media(min-width:760px){.hero{grid-template-columns:300px 1fr;gap:2rem;padding:1.8rem}}
.cover{position:relative;border-radius:1rem;overflow:hidden;border:1px solid #1e3a40;aspect-ratio:1/1;background:#071417}
.cover svg{display:block;width:100%;height:100%}
.kicker{font-family:"Space Mono",monospace;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:#3ddc97;margin-bottom:.7rem}
.kicker.copy{color:#ff6b4a}
h1{font-family:"Unbounded",sans-serif;font-weight:800;font-size:1.7rem;line-height:1.12;color:#fff;letter-spacing:-.01em}
@media(min-width:760px){h1{font-size:2.1rem}}
.artist{margin-top:.6rem;color:#9fb0b3;font-size:.95rem}
.artist a{color:#4cc9f0;text-decoration:none;border-bottom:1px dashed rgba(76,201,240,.4)}
.artist a:hover{color:#7fd9f5}
.desc{margin-top:.9rem;color:#84969a;font-size:.92rem;line-height:1.6;max-width:46ch}
.stats{margin-top:1rem;display:flex;flex-wrap:wrap;gap:.4rem 1rem;font-family:"Space Mono",monospace;font-size:.7rem;color:#5b6b6e}
.stats .dl{color:#3ddc97}
.controls{margin-top:1.3rem;display:flex;align-items:center;gap:1rem}
.play{width:3.6rem;height:3.6rem;border-radius:50%;border:none;background:#ff6b4a;color:#071417;font-size:1.2rem;cursor:pointer;box-shadow:0 8px 26px rgba(255,107,74,.45);transition:transform .15s,background .2s;flex-shrink:0}
.play:hover{background:#ff8266;transform:scale(1.07)}
.play:active{transform:scale(.93)}
.ptxt{font-family:"Space Mono",monospace;font-size:.72rem;color:#9fb0b3}
.peq{display:flex;align-items:flex-end;gap:3px;height:26px;margin-left:auto}
.peq span{width:4px;height:30%;border-radius:2px;background:#2a4d55;transform-origin:bottom}
.peq.on span{background:linear-gradient(to top,#ff6b4a,#ffd166);animation:eq .8s ease-in-out infinite}
.peq.on span:nth-child(odd){animation-duration:1s}
.peq.on span:nth-child(3n){animation-delay:.12s}
.peq.on span:nth-child(4n){animation-delay:.24s}
@keyframes eq{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
.dlwrap{margin-top:1.1rem;display:flex;align-items:center;gap:1rem}
.dl{padding:.7rem 1.3rem;border-radius:.6rem;border:1.5px solid rgba(61,220,151,.45);background:rgba(61,220,151,.1);color:#3ddc97;font-family:"Unbounded",sans-serif;font-weight:600;font-size:.8rem;cursor:pointer;transition:all .2s}
.dl:hover{background:rgba(61,220,151,.22);box-shadow:0 0 18px rgba(61,220,151,.22)}
.dl:disabled{opacity:.55;cursor:default}
.ringwrap{position:relative;width:42px;height:42px;flex-shrink:0}
.ring{width:100%;height:100%;transform:rotate(-90deg)}
.rbg{fill:none;stroke:#1e3a40;stroke-width:5}
.rfg{fill:none;stroke:#3ddc97;stroke-width:5;stroke-linecap:round;stroke-dasharray:188.5;stroke-dashoffset:0;transition:stroke-dashoffset .8s linear}
.dnum{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:"Space Mono",monospace;font-size:.85rem;font-weight:700;color:#3ddc97}
.browse{display:inline-block;margin-top:1.3rem;font-family:"Space Mono",monospace;font-size:.7rem;color:#9fb0b3;text-decoration:none;border-bottom:1px solid #2a4d55;padding-bottom:2px;transition:color .2s,border-color .2s}
.browse:hover{color:#ff6b4a;border-color:#ff6b4a}
.related{margin-top:2.4rem}
.related h2{font-family:"Unbounded",sans-serif;font-size:1rem;font-weight:700;color:#fff;margin-bottom:1rem}
.rgrid{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}
@media(min-width:640px){.rgrid{grid-template-columns:repeat(3,1fr)}}
.rcard{display:flex;flex-direction:column;gap:.25rem;padding:.85rem .9rem;background:#102226;border:1px solid #1e3a40;border-radius:.7rem;text-decoration:none;transition:transform .2s,border-color .2s,box-shadow .2s}
.rcard:hover{transform:translateY(-3px);border-color:#2a4d55;box-shadow:0 10px 26px rgba(0,0,0,.4)}
.rcard .rt{font-family:"Unbounded",sans-serif;font-size:.82rem;font-weight:600;color:#eef3f4;line-height:1.25}
.rcard .rm{font-family:"Space Mono",monospace;font-size:.62rem;color:#3ddc97}
.foot{position:relative;z-index:1;max-width:960px;margin:1rem auto 0;padding:1.6rem 1.25rem 2.4rem;border-top:1px solid #14262a}
.foot p{font-size:.72rem;color:#56676a;line-height:1.6;max-width:60ch}
.foot a{color:#7c8d90;text-decoration:none}
.foot a:hover{color:#ff6b4a}
.foot .wm2{font-family:"Unbounded",sans-serif;font-weight:700;color:#cdd8da;font-size:.85rem;margin-bottom:.5rem}
`;

function escHtml(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function escXml(s){ return String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
function slugify(s){ return String(s || "").toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "ringtone"; }
function hashStr(s){ let h = 2166136261; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function fmt(n){ n = n || 0; if (n >= 1000000) return (n/1000000).toFixed(1)+"M"; if (n >= 1000) return (n/1000).toFixed(1)+"K"; return String(n); }
function fbytes(b){ b = b || 0; if (b < 1024) return b+" B"; if (b < 1048576) return (b/1024).toFixed(1)+" KB"; return (b/1048576).toFixed(2)+" MB"; }
function durLabel(s){ s = s || 0; return Math.floor(s/60)+":"+String(s%60).padStart(2,"0"); }
function extOf(key){ const m = /\.([a-z0-9]+)$/i.exec(String(key || "")); return m ? m[1].toLowerCase() : "mp3"; }
function mimeOf(ext){ return ({ mp3:"audio/mpeg", m4a:"audio/mp4", ogg:"audio/ogg", wav:"audio/wav" })[ext] || "audio/mpeg"; }

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

function notFound(origin, id){
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>Track not found · RingMang</title><meta name="robots" content="noindex,follow">'
    + '<meta property="og:title" content="Track not found · RingMang"><meta property="og:site_name" content="RingMang">'
    + '<link rel="canonical" href="'+origin+'/"><style>' + PAGE_CSS + 'body{display:flex;align-items:center;justify-content:center}'
    + '.nf{text-align:center;position:relative;z-index:1;padding:2rem}.nf h1{font-size:2rem}.nf p{color:#84969a;margin:.8rem 0 1.4rem}</style></head>'
    + '<body><div class="stage"></div><div class="nf"><h1>404 — not in the crate</h1>'
    + '<p>This ringtone may have been removed or the link is incomplete.</p>'
    + '<a class="browse" href="'+origin+'/">← Back to all ringtones</a></div></body></html>';
  return new Response(html, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60" } });
}

function serverError(msg){
  return new Response("RingMang server error: " + msg, { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export async function onRequestGet(context){
  const { request, env, params } = context;
  let origin;
  try { origin = new URL(request.url).origin; } catch { origin = ""; }

  const parts = params.path || [];
  const id = parts[0];
  if (!id || !/^[0-9a-f-]{8,}$/i.test(id)) return notFound(origin, id);

  const SUPA = env.SUPABASE_URL, KEY = env.SUPABASE_ANON_KEY;
  if (!SUPA || !KEY) return serverError("Missing Pages environment variables SUPABASE_URL / SUPABASE_ANON_KEY. Add them in Pages Settings → Variables and Secrets.");

  const sel = "id,title,description,file_url,file_size_bytes,download_count,copyright_status,duration_seconds,created_at,category_id,categories(name,slug),artists(name,slug)";
  let rows = [];
  try {
    const r = await fetch(SUPA + "/rest/v1/ringtones?id=eq." + encodeURIComponent(id) + "&select=" + encodeURIComponent(sel),
      { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Accept: "application/json" } });
    rows = await r.json();
    if (!r.ok || !Array.isArray(rows) || rows.length === 0) return notFound(origin, id);
  } catch (e) { return notFound(origin, id); }

  const t = rows[0];
  const title = t.title || "Untitled";
  const artist = (t.artists && t.artists.name) || "Unknown Artist";
  const catName = (t.categories && t.categories.name) || "Uncategorized";
  const catSlug = (t.categories && t.categories.slug) || null;
  const desc = (t.description && String(t.description).trim()) || (title + " — a free ringtone on RingMang. Preview the audio and download it straight to your phone in one tap.");
  const isCopy = t.copyright_status === "copyrighted";
  const slug = slugify(title);
  const canonical = origin + "/r/" + encodeURIComponent(id) + "/" + encodeURIComponent(slug);
  const ogImage = origin + "/og/" + encodeURIComponent(id) + ".svg";
  const catLink = catSlug ? (origin + "/?cat=" + encodeURIComponent(catSlug)) : null;
  const ext = extOf(t.file_url);
  const enc = mimeOf(ext);
  const durSec = parseInt(t.duration_seconds, 10) || 0;
  const durIso = durSec > 0 ? ("PT" + Math.floor(durSec/60) + "M" + (durSec%60) + "S") : "";
  const created = t.created_at ? String(t.created_at).slice(0, 10) : "";

  // related (same category if any, else most downloaded), excludes self, RLS-filtered
  let related = [];
  try {
    let rq = SUPA + "/rest/v1/ringtones?id=neq." + encodeURIComponent(id) + "&select=id,title,download_count&order=download_count.desc&limit=6";
    if (t.category_id) rq += "&category_id=eq." + encodeURIComponent(t.category_id);
    const rr = await fetch(rq, { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Accept: "application/json" } });
    const rj = await rr.json();
    if (rr.ok && Array.isArray(rj)) related = rj;
  } catch {}

  const cover = buildCover(title, artist);

  // JSON-LD (built as objects then stringified; '<' escaped to avoid breaking out of <script>)
  const music = { "@context": "https://schema.org", "@type": "MusicRecording", name: title, description: desc,
    inLanguage: "en", isFamilyFriendly: !isCopy, datePublished: created || undefined,
    byArtist: { "@type": "MusicGroup", name: artist },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    audio: { "@type": "AudioObject", encodingFormat: enc, uploadDate: created || undefined } };
  if (durIso) music.duration = durIso;
  const bc = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: origin + "/" },
    { "@type": "ListItem", position: 2, name: catName, item: catLink || (origin + "/") },
    { "@type": "ListItem", position: 3, name: title, item: canonical } ] };
  const safeJson = (o) => JSON.stringify(o).replace(/</g, "\\u003c");

  const eqBars = Array.from({length:12}, () => "<span></span>").join("");
  const relatedHtml = related.map((r) => {
    const rs = slugify(r.title);
    return '<a class="rcard" href="' + origin + '/r/' + encodeURIComponent(r.id) + '/' + encodeURIComponent(rs) + '">'
      + '<span class="rt">' + escHtml(r.title) + '</span><span class="rm">⬇ ' + fmt(r.download_count) + '</span></a>';
  }).join("");

  const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escHtml(title)} — ${escHtml(artist)} · RingMang</title>
<meta name="description" content="${escHtml(desc)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="music.song">
<meta property="og:site_name" content="RingMang">
<meta property="og:title" content="${escHtml(title)}">
<meta property="og:description" content="${escHtml(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="music:musician" content="${escHtml(artist)}">
${durIso ? `<meta property="music:duration" content="${durSec}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escHtml(title)}">
<meta name="twitter:description" content="${escHtml(desc)}">
<meta name="twitter:image" content="${ogImage}">
<meta name="theme-color" content="#071417">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Outfit:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<script type="application/ld+json">${safeJson(music)}</script>
<script type="application/ld+json">${safeJson(bc)}</script>
<style>${PAGE_CSS}</style>
</head><body>
<div class="stage"></div>
<a class="topbar" href="${origin}/"><span class="wm">Ring<span class="c">Mang</span></span><span class="crumb">/ track</span></a>
<main class="card">
  <div class="hero">
    <div class="cover">${cover}</div>
    <div class="meta">
      <p class="kicker${isCopy ? " copy" : ""}">${isCopy ? "© Copyrighted clip" : "Original / Royalty-free"} · ${escHtml(catName)}</p>
      <h1>${escHtml(title)}</h1>
      <p class="artist">by ${escHtml(artist)}${catLink ? ` · <a href="${catLink}">${escHtml(catName)}</a>` : ""}</p>
      <p class="desc">${escHtml(desc)}</p>
      <div class="stats"><span class="dl">⬇ ${fmt(t.download_count)} downloads</span><span>· ${fbytes(t.file_size_bytes)}</span><span>· ${ext.toUpperCase()}</span>${durSec ? `<span>· ${durLabel(durSec)}</span>` : ""}</div>
      <div class="controls">
        <button id="pbtn" class="play" aria-label="Play preview">▶</button>
        <span id="ptxt" class="ptxt">Tap to play preview</span>
        <div id="peq" class="peq" aria-hidden="true">${eqBars}</div>
      </div>
      <div class="dlwrap">
        <button id="dbtn" class="dl">⬇ Download ringtone</button>
        <div class="ringwrap"><svg viewBox="0 0 64 64" class="ring"><circle cx="32" cy="32" r="30" class="rbg"/><circle id="dring" cx="32" cy="32" r="30" class="rfg"/></svg><span id="dnum" class="dnum"></span></div>
      </div>
      <a class="browse" href="${origin}/">← Browse all ringtones</a>
    </div>
  </div>
  ${relatedHtml ? `<section class="related"><h2>More like this</h2><div class="rgrid">${relatedHtml}</div></section>` : ""}
</main>
<footer class="foot">
  <div class="wm2">Ring<span style="color:#ff6b4a">Mang</span></div>
  <p><strong style="color:#7c8d90">Copyright &amp; DMCA:</strong> RingMang respects intellectual property rights. Content marked © Copyrighted is shared for preview and promotional purposes. If you believe your copyright has been infringed, submit a DMCA takedown request and we will promptly review it. <a href="${origin}/">RingMang home</a></p>
</footer>
<audio id="pa" preload="none"></audio>
<script>
(function(){
  var ID = ${JSON.stringify(id)};
  var SUPA = ${JSON.stringify(SUPA)};
  var KEY = ${JSON.stringify(KEY)};
  var audio = document.getElementById('pa');
  var pbtn = document.getElementById('pbtn');
  var ptxt = document.getElementById('ptxt');
  var eq = document.getElementById('peq');
  var dbtn = document.getElementById('dbtn');
  var dnum = document.getElementById('dnum');
  var dring = document.getElementById('dring');
  var CIRC = 188.5;
  function signed(intent){
    return fetch(SUPA + '/functions/v1/serve-ringtone?id=' + encodeURIComponent(ID) + '&intent=' + intent, { headers: { 'apikey': KEY } })
      .then(function(r){ return r.json().then(function(j){ if(!r.ok || !j.url) throw new Error(j.error || 'fail'); return j; }); });
  }
  function setPlay(on){ pbtn.textContent = on ? '❚❚' : '▶'; ptxt.textContent = on ? 'Now playing preview' : 'Tap to play preview'; if(on) eq.classList.add('on'); else eq.classList.remove('on'); }
  pbtn.addEventListener('click', function(){
    if(!audio.src){
      ptxt.textContent = 'Loading…';
      signed('play').then(function(j){ audio.src = j.url; return audio.play(); }).then(function(){ setPlay(true); }).catch(function(){ ptxt.textContent = 'Preview unavailable'; setPlay(false); });
    } else if(audio.paused){ audio.play().then(function(){ setPlay(true); }).catch(function(){}); }
    else { audio.pause(); }
  });
  audio.addEventListener('play', function(){ setPlay(true); });
  audio.addEventListener('pause', function(){ setPlay(false); });
  audio.addEventListener('ended', function(){ setPlay(false); });
  dbtn.addEventListener('click', function(){
    if(dbtn.disabled) return; dbtn.disabled = true; var n = 3; dnum.textContent = n; dring.style.strokeDashoffset = '0';
    var iv = setInterval(function(){ n--; dring.style.strokeDashoffset = String(CIRC * (1 - n/3));
      if(n <= 0){ clearInterval(iv); dnum.textContent = '…'; doDownload(); } else { dnum.textContent = n; }
    }, 800);
  });
  function doDownload(){
    signed('download').then(function(j){
      return fetch(j.url).then(function(r){ if(!r.ok) throw new Error('fetch'); return r.blob(); }).then(function(blob){
        var mt = j.mime_type || ''; var ext = mt.indexOf('mp4') > -1 ? 'm4a' : (mt.indexOf('ogg') > -1 ? 'ogg' : (mt.indexOf('wav') > -1 ? 'wav' : 'mp3'));
        var name = (ID + '').replace(/[^\\w-]+/g, '_').slice(0, 40) + '.' + ext;
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
        dnum.textContent = '✓'; dbtn.disabled = false; dbtn.textContent = 'Downloaded ✓';
      });
    }).catch(function(){ dnum.textContent = '!'; dbtn.disabled = false; dbtn.textContent = 'Retry download'; });
  }
})();
</script>
</body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300" } });
        }
