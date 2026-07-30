/**
 * RingMang — /ringtone/[slug]-[short-id]  (Phase 9B-1)
 * Universal server-rendered landing page: humans + ALL crawlers get full HTML.
 * Override-aware meta + keywords + canonical + OG/Twitter + deep JSON-LD
 * (MusicRecording w/ genre, interactionStatistic=downloads, byArtist, duration + BreadcrumbList).
 * Resolver: exact seo_slug first, else short_id (301 to canonical on short-id hit).
 * Living UI: rotating vinyl + real Web-Audio visualizer (CSS fallback) + silent blob download + share.
 */

const escHtml = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const escAttr = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const safeJson = (o) => JSON.stringify(o).replace(/</g, "\\u003c");
const makeSlug = (s) => String(s || "").toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "ringtone";
const applyTpl = (p, ctx) => String(p || "").replace(/\{(title|artist|category|duration|count)\}/g, (_, k) => { const v = ctx[k]; return (v == null || v === "") ? "" : String(v); });
const durLabel = (s) => { s = parseInt(s, 10) || 0; return s > 0 ? (Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0")) : ""; };
const durIso = (s) => { s = parseInt(s, 10) || 0; return s > 0 ? ("PT" + Math.floor(s / 60) + "M" + (s % 60) + "S") : ""; };
const fmt = (n) => { n = n || 0; if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"; if (n >= 1000) return (n / 1000).toFixed(1) + "K"; return String(n); };
const fbytes = (b) => { b = b || 0; if (b < 1024) return b + " B"; if (b < 1048576) return (b / 1024).toFixed(1) + " KB"; return (b / 1048576).toFixed(2) + " MB"; };
const extOf = (k) => { const m = /\.([a-z0-9]+)$/i.exec(String(k || "")); return m ? m[1].toLowerCase() : "mp3"; };
const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
function waveBars(seed, n) { let b = ""; for (let i = 0; i < n; i++) { const h = 22 + Math.abs(Math.sin((seed % 97) * 0.7 + i * 0.9)) * 78; b += '<span style="height:' + Math.round(h) + '%"></span>'; } return b; }

const SELECT = "id,title,description,file_url,file_size_bytes,download_count,copyright_status,duration_seconds,genre,seo_title,seo_description,seo_keywords,seo_slug,short_id,seo_noindex,created_at,category_id,artist_id,categories(name,slug),artists(name,slug)";

async function getJSON(SUPA, KEY, path) {
  const r = await fetch(SUPA + "/rest/v1/" + path, { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Accept: "application/json" } });
  if (!r.ok) return null;
  return r.json();
}

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:"Outfit",system-ui,sans-serif;background:#071417;color:#dbe4e6;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.stage{position:fixed;inset:0;z-index:0;pointer-events:none;background:
  radial-gradient(ellipse 60% 45% at 8% -6%,rgba(255,107,74,.13),transparent 60%),
  radial-gradient(ellipse 55% 45% at 96% 8%,rgba(61,220,151,.10),transparent 60%),
  radial-gradient(ellipse 50% 40% at 70% 108%,rgba(255,209,102,.08),transparent 60%),
  linear-gradient(rgba(255,255,255,.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.013) 1px,transparent 1px);
  background-size:100% 100%,100% 100%,100% 100%,40px 40px,40px 40px}
a{color:inherit}
.wrap{position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:0 1.1rem}
/* topbar */
.top{position:sticky;top:0;z-index:30;background:rgba(7,20,23,.82);backdrop-filter:blur(10px);border-bottom:1px solid rgba(30,58,64,.6)}
.top-in{display:flex;align-items:center;justify-content:space-between;gap:1rem;height:3.4rem}
.brand{display:flex;align-items:center;gap:.6rem;text-decoration:none}
.eqm{display:flex;align-items:flex-end;gap:2.5px;height:18px}
.eqm span{width:3px;border-radius:2px;transform-origin:bottom;animation:eqb .9s ease-in-out infinite}
.eqm span:nth-child(1){background:#ff6b4a;height:60%}.eqm span:nth-child(2){background:#ffd166;height:100%;animation-delay:.15s}.eqm span:nth-child(3){background:#3ddc97;height:45%;animation-delay:.3s}.eqm span:nth-child(4){background:#4cc9f0;height:80%;animation-delay:.45s}
@keyframes eqb{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
.wm{font-family:"Unbounded",sans-serif;font-weight:800;font-size:1.05rem;color:#fff;letter-spacing:-.01em}
.wm .c{color:#ff6b4a}
.crumb{display:flex;align-items:center;gap:.45rem;font-family:"Space Mono",monospace;font-size:.62rem;letter-spacing:.06em;color:#6b7280;min-width:0}
.crumb a{color:#9fb0b3;text-decoration:none;white-space:nowrap;transition:color .2s}
.crumb a:hover{color:#ff6b4a}
.crumb .sep{color:#2a4d55}
.crumb .now{color:#3ddc97;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:34vw}
.browse{font-family:"Space Mono",monospace;font-size:.62rem;letter-spacing:.1em;color:#9fb0b3;text-decoration:none;border:1px solid #2a4d55;border-radius:2rem;padding:.35rem .8rem;transition:all .2s;white-space:nowrap}
.browse:hover{color:#071417;background:#3ddc97;border-color:#3ddc97}
/* ticker */
.tick{position:relative;z-index:1;border-bottom:1px solid rgba(30,58,64,.5);background:rgba(12,26,29,.6);overflow:hidden}
.tick-in{display:flex;width:max-content;animation:marq 38s linear infinite}
.tick-in:hover{animation-play-state:paused}
@keyframes marq{to{transform:translateX(-50%)}}
.tick a{display:inline-flex;align-items:center;gap:.5rem;padding:.55rem 1.3rem;font-family:"Space Mono",monospace;font-size:.7rem;color:#9ca3af;text-decoration:none;white-space:nowrap;border-right:1px solid rgba(30,58,64,.4);transition:color .2s}
.tick a:hover{color:#ffd166}
.tick a .d{color:#3ddc97}
/* hero */
.hero{display:grid;grid-template-columns:1fr;gap:1.8rem;padding:2.4rem 0 1.6rem}
@media(min-width:860px){.hero{grid-template-columns:1.25fr 1fr;gap:2.4rem;align-items:center;padding:3rem 0 2rem}}
.kicker{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:1rem}
.live{width:8px;height:8px;border-radius:50%;background:#3ddc97;box-shadow:0 0 8px rgba(61,220,151,.8);animation:lp 1.6s ease-in-out infinite}
@keyframes lp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
.ktxt{font-family:"Space Mono",monospace;font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;color:#3ddc97}
.chip{font-family:"Space Mono",monospace;font-size:.6rem;letter-spacing:.08em;color:#9fb0b3;border:1px solid #2a4d55;border-radius:2rem;padding:.2rem .6rem;text-decoration:none;transition:all .2s}
.chip:hover{border-color:#4cc9f0;color:#4cc9f0}
h1{font-family:"Unbounded",sans-serif;font-weight:800;font-size:clamp(2.1rem,6.4vw,3.9rem);line-height:1.04;color:#fff;letter-spacing:-.02em;position:relative;display:inline-block}
.squig{position:absolute;left:0;right:0;bottom:-.5rem;width:100%;height:14px}
.squig path{stroke-dasharray:420;stroke-dashoffset:420;animation:draw 1.3s ease-out .4s forwards}
@keyframes draw{to{stroke-dashoffset:0}}
.byline{margin-top:1.1rem;font-size:1rem;color:#9fb0b3}
.byline a{color:#4cc9f0;text-decoration:none;border-bottom:1px dashed rgba(76,201,240,.4)}
.byline a:hover{color:#7fd9f5}
.desc{margin-top:1rem;color:#84969a;font-size:1rem;line-height:1.65;max-width:52ch}
.stats{margin-top:1.3rem;display:flex;flex-wrap:wrap;gap:.5rem 1.3rem;font-family:"Space Mono",monospace;font-size:.72rem;color:#5b6b6e}
.stats .dl{color:#3ddc97}.stats b{color:#cdd8da;font-weight:700}
.ctrls{margin-top:1.6rem;display:flex;align-items:center;gap:.8rem;flex-wrap:wrap}
.play{width:3.7rem;height:3.7rem;border-radius:50%;border:none;background:#ff6b4a;color:#071417;font-size:1.25rem;cursor:pointer;box-shadow:0 8px 26px rgba(255,107,74,.45);transition:transform .15s,background .2s;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.play:hover{background:#ff8266;transform:scale(1.08)}.play:active{transform:scale(.92)}
.btn{display:inline-flex;align-items:center;gap:.5rem;padding:.7rem 1.1rem;border-radius:.6rem;font-family:"Unbounded",sans-serif;font-weight:600;font-size:.78rem;cursor:pointer;transition:all .2s;background:transparent}
.btn.dl{border:1.5px solid rgba(61,220,151,.5);color:#3ddc97}.btn.dl:hover{background:rgba(61,220,151,.14);box-shadow:0 0 18px rgba(61,220,151,.22)}
.btn.sh{border:1.5px solid rgba(76,201,240,.45);color:#4cc9f0}.btn.sh:hover{background:rgba(76,201,240,.14);box-shadow:0 0 16px rgba(76,201,240,.22)}
.btn:disabled{opacity:.5;cursor:default}
.dlcd{position:relative;width:2.6rem;height:2.6rem;flex-shrink:0}
.dlcd svg{width:100%;height:100%;transform:rotate(-90deg)}
.dlcd .rb{fill:none;stroke:#1e3a40;stroke-width:5}.dlcd .rf{fill:none;stroke:#3ddc97;stroke-width:5;stroke-linecap:round;stroke-dasharray:113;stroke-dashoffset:0;transition:stroke-dashoffset .8s linear}
.dlcd .n{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:"Space Mono",monospace;font-size:.85rem;font-weight:700;color:#3ddc97}
.hidden{display:none !important}
/* visualizer card */
.vizcard{position:relative;border:1px solid #1e3a40;border-radius:1.2rem;overflow:hidden;background:radial-gradient(circle at 50% 30%,#152a2f,#071417);padding:1.4rem;box-shadow:0 24px 60px rgba(0,0,0,.5)}
.vizcard::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(255,107,74,.16),transparent 62%);animation:gp 3.4s ease-in-out infinite}
@keyframes gp{0%,100%{opacity:.55}50%{opacity:1}}
.viztop{position:relative;display:flex;align-items:center;gap:1.1rem}
.vinyl{position:relative;width:96px;height:96px;flex-shrink:0;border-radius:50%;background:repeating-radial-gradient(circle at 50% 50%,#0b0f14 0 4px,#16202a 4px 6px);border:2px solid rgba(255,209,102,.25);display:flex;align-items:center;justify-content:center}
.vinyl::after{content:"";width:24px;height:24px;border-radius:50%;background:radial-gradient(circle,#ff6b4a,#7a1f12);box-shadow:0 0 12px rgba(255,107,74,.6)}
.vinyl.spin{animation:spin 6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.vizsig{position:relative;font-family:"Space Mono",monospace;font-size:.6rem;letter-spacing:.18em;color:#6b7280;text-transform:uppercase}
.vizsig b{display:block;color:#3ddc97;font-size:.95rem;letter-spacing:.04em;margin-top:.2rem}
.viz{position:relative;display:flex;align-items:flex-end;gap:3px;height:84px;margin-top:1.2rem}
.viz span{flex:1;height:16%;border-radius:3px 3px 0 0;background:linear-gradient(to top,#ff6b4a,#ffd166);transform-origin:bottom;transition:height .09s linear}
.viz.playing:not(.real) span{animation:fb .85s ease-in-out infinite}
.viz.playing:not(.real) span:nth-child(odd){animation-duration:1.05s}
.viz.playing:not(.real) span:nth-child(3n){animation-delay:.12s}
.viz.playing:not(.real) span:nth-child(4n){animation-delay:.24s}
@keyframes fb{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
.seek{position:relative;display:flex;align-items:center;gap:.6rem;margin-top:1.1rem}
.tm{font-family:"Space Mono",monospace;font-size:.66rem;color:#6b7280;width:2.4rem;text-align:center}
.rng{-webkit-appearance:none;appearance:none;flex:1;height:6px;border-radius:3px;background:#1e3a40;outline:none;cursor:pointer}
.rng::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:#ff6b4a;box-shadow:0 0 9px rgba(255,107,74,.6);cursor:pointer}
.rng::-moz-range-thumb{width:15px;height:15px;border:none;border-radius:50%;background:#ff6b4a;cursor:pointer}
.vol{position:relative;display:flex;align-items:center;gap:.5rem;margin-top:.7rem}
.vol .rng{max-width:8rem}
/* rails */
.rail{padding:1.4rem 0 .4rem}
.rail h2{font-family:"Unbounded",sans-serif;font-size:1rem;font-weight:700;color:#fff;margin-bottom:.9rem;display:flex;align-items:center;gap:.5rem}
.rail h2 .bar{width:4px;height:1.1rem;border-radius:2px;background:#ff6b4a;box-shadow:0 0 8px rgba(255,107,74,.6)}
.scroller{display:flex;gap:.8rem;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:.6rem;scrollbar-width:thin;scrollbar-color:#2a4d55 transparent}
.scroller::-webkit-scrollbar{height:6px}.scroller::-webkit-scrollbar-thumb{background:#2a4d55;border-radius:3px}
.rcard{scroll-snap-align:start;flex:0 0 220px;text-decoration:none;background:#102226;border:1px solid #1e3a40;border-radius:.8rem;padding:.9rem;transition:transform .25s,border-color .25s,box-shadow .25s;opacity:0;transform:translateY(16px)}
.rcard.revealed{opacity:1;transform:translateY(0);transition:opacity .5s ease,transform .5s ease,border-color .25s,box-shadow .25s}
.rcard:hover{transform:translateY(-4px);border-color:#2a4d55;box-shadow:0 12px 30px rgba(0,0,0,.45)}
.rcard .mw{display:flex;align-items:flex-end;gap:3px;height:26px;margin-bottom:.7rem}
.rcard .mw span{flex:1;border-radius:2px;background:#2a4d55;transform-origin:bottom;transition:background .3s}
.rcard:hover .mw span{background:#ff6b4a;animation:cw .7s ease-in-out infinite}
.rcard .mw span:nth-child(3n){animation-delay:.1s}.rcard .mw span:nth-child(4n){animation-delay:.2s}
@keyframes cw{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}
.rcard .rt{font-family:"Unbounded",sans-serif;font-size:.84rem;font-weight:600;color:#eef3f4;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rcard .rm{font-family:"Space Mono",monospace;font-size:.62rem;color:#6b7280;margin-top:.3rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rcard .rd{font-family:"Space Mono",monospace;font-size:.62rem;color:#3ddc97;margin-top:.4rem}
/* footer */
.foot{position:relative;z-index:1;border-top:1px solid rgba(20,38,42,.8);margin-top:2rem}
.foot-in{padding:1.8rem 0 2.4rem}
.foot .wm2{font-family:"Unbounded",sans-serif;font-weight:700;color:#cdd8da;font-size:.9rem;margin-bottom:.6rem}
.foot p{font-size:.74rem;color:#56676a;line-height:1.6;max-width:64ch}
.foot a{color:#7c8d90;text-decoration:none}.foot a:hover{color:#ff6b4a}
.toast{position:fixed;bottom:1.4rem;left:50%;transform:translateX(-50%);background:#152a2f;border:1px solid #2a4d55;color:#e5e7eb;padding:.7rem 1.2rem;border-radius:.7rem;font-size:.82rem;z-index:60;box-shadow:0 10px 30px rgba(0,0,0,.5);animation:ti .3s cubic-bezier(.34,1.3,.64,1);max-width:90%}
@keyframes ti{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@media screen and (max-width:768px){.crumb .now{max-width:42vw}}
`;

// client script: NO edge-interpolated values (reads from #rm-data); uses only string concatenation (no nested template literals)
const CLIENT = `
(function(){
  var d=document.getElementById("rm-data");
  var ID=d.getAttribute("data-id"),CANON=d.getAttribute("data-canon"),SUPA=d.getAttribute("data-supa"),KEY=d.getAttribute("data-key"),TITLE=d.getAttribute("data-title");
  var audio=document.getElementById("pa"),play=document.getElementById("play"),dl=document.getElementById("dlbtn"),sh=document.getElementById("shbtn");
  var viz=document.getElementById("viz"),vinyl=document.querySelector(".vinyl"),bar=document.getElementById("seek"),cur=document.getElementById("cur"),dur=document.getElementById("dur"),vol=document.getElementById("vol");
  var dlcd=document.getElementById("dlcd"),dln=document.getElementById("dln"),dlf=document.getElementById("dlf");
  var ctx=null,src=null,an=null,freq=null,real=false,raf=null,drag=false;
  function fmt(s){if(!isFinite(s)||s<0)s=0;return Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0")}
  function toast(m){var t=document.getElementById("toast");if(!t){t=document.createElement("div");t.id="toast";document.body.appendChild(t)}t.textContent=m;t.style.display="block";clearTimeout(window.__rt);window.__rt=setTimeout(function(){t.style.display="none"},3000)}
  function setPlay(on){play.textContent=on?"\\u275A\\u275A":"\\u25B6";viz.classList.toggle("playing",on);vinyl.classList.toggle("spin",on)}
  function buildGraph(){if(ctx)return real;try{ctx=new(window.AudioContext||window.webkitAudioContext)();src=ctx.createMediaElementSource(audio);an=ctx.createAnalyser();an.fftSize=64;freq=new Uint8Array(an.frequencyBinCount);src.connect(an);an.connect(ctx.destination);real=true;viz.classList.add("real");return true}catch(e){return false}}
  function loop(){if(audio.paused)return;if(real&&an){try{an.getByteFrequencyData(freq);var bars=viz.children,sum=0;for(var i=0;i<bars.length;i++){var v=freq[i%freq.length];sum+=v;bars[i].style.height=(12+(v/255)*88)+"%"}if(sum===0){real=false;viz.classList.remove("real")}}catch(e){real=false;viz.classList.remove("viz-fake")}}raf=requestAnimationFrame(loop)}
  function signed(intent){return fetch(SUPA+"/functions/v1/serve-ringtone?id="+encodeURIComponent(ID)+"&intent="+intent,{headers:{apikey:KEY}}).then(function(r){return r.json().then(function(j){if(!r.ok||!j.url)throw new Error(j.error||"fail");return j})})}
  play.addEventListener("click",function(){
    if(!audio.src){play.disabled=true;signed("play").then(function(j){audio.src=j.url;buildGraph();if(ctx&&ctx.state==="suspended")ctx.resume();return audio.play()}).then(function(){setPlay(true);play.disabled=false;cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}).catch(function(){toast("\\u25B6 Preview unavailable right now");setPlay(false);play.disabled=false});return}
    if(audio.paused){if(ctx&&ctx.state==="suspended")ctx.resume();audio.play().then(function(){setPlay(true);cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}).catch(function(){});}else{audio.pause()}
  });
  audio.addEventListener("play",function(){setPlay(true)});audio.addEventListener("pause",function(){setPlay(false)});audio.addEventListener("ended",function(){setPlay(false)});
  audio.addEventListener("loadedmetadata",function(){dur.textContent=fmt(audio.duration);bar.max=audio.duration||100});
  audio.addEventListener("timeupdate",function(){if(!drag&&audio.duration){cur.textContent=fmt(audio.currentTime);bar.value=audio.currentTime}});
  bar.addEventListener("input",function(){drag=true;cur.textContent=fmt(parseFloat(bar.value))});
  bar.addEventListener("change",function(){audio.currentTime=parseFloat(bar.value);drag=false});
  vol.addEventListener("input",function(){audio.volume=parseFloat(vol.value)});
  dl.addEventListener("click",function(){if(dl.disabled)return;dl.disabled=true;dlcd.classList.remove("hidden");var n=3;dln.textContent=n;dlf.style.strokeDashoffset="0";
    var iv=setInterval(function(){n--;dlf.style.strokeDashoffset=String(113*(1-n/3));if(n<=0){clearInterval(iv);dln.textContent="\\u2026";doDl()}else{dln.textContent=n}},800)});
  function doDl(){signed("download").then(function(j){return fetch(j.url).then(function(r){if(!r.ok)throw new Error("fetch");return r.blob()}).then(function(blob){var mt=j.mime_type||"";var ext=mt.indexOf("mp4")>-1?"m4a":(mt.indexOf("ogg")>-1?"ogg":(mt.indexOf("wav")>-1?"wav":"mp3"));var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(TITLE||"ringtone").replace(/[^\\w-]+/g,"_").slice(0,50)+"."+ext;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},2000);dlcd.classList.add("hidden");dl.disabled=false;toast("\\u2713 Saved to your device")})}).catch(function(){dlcd.classList.add("hidden");dl.disabled=false;toast("\\u2B07 Download failed \\u2014 try again")})}
  sh.addEventListener("click",function(){var text=(TITLE||"RingMang")+" \\u2014 free ringtone on RingMang";
    if(navigator.share){navigator.share({title:TITLE||"RingMang",text:text,url:CANON}).catch(function(){});return}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(CANON).then(function(){toast("\\uD83D\\uDD17 Link copied!")}).catch(function(){toast(CANON)});return}
    toast(CANON)});
  // count-up downloads
  var dc=document.getElementById("dlcount");if(dc){var tgt=parseInt(dc.getAttribute("data-n"),10)||0,st=performance.now();(function tk(now){var p=Math.min((now-st)/1100,1);dc.textContent=Math.round(tgt*(1-Math.pow(1-p,3))).toLocaleString();if(p<1)requestAnimationFrame(tk)})(st)}
  // scroll reveal rails
  if("IntersectionObserver"in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("revealed");io.unobserve(e.target)}})},{threshold:.1});document.querySelectorAll(".rcard").forEach(function(c){io.observe(c)})}else{document.querySelectorAll(".rcard").forEach(function(c){c.classList.add("revealed")})}
})();
`;

function notFound(origin) {
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Track not found · RingMang</title><meta name="robots" content="noindex,follow"><meta property="og:title" content="Track not found · RingMang"><meta property="og:site_name" content="RingMang"><link rel="canonical" href="' + origin + '/"><link rel="icon" href="/icon.svg"><style>' + CSS + 'body{display:flex;align-items:center;justify-content:center}.nf{text-align:center;position:relative;z-index:1;padding:2rem}.nf h1{font-size:2rem}.nf p{color:#84969a;margin:.8rem 0 1.4rem}</style></head><body><div class="stage"></div><div class="nf"><div class="eqm" style="margin:0 auto .8rem;height:26px"><span></span><span></span><span></span><span></span></div><h1>404 — not in the crate</h1><p>This ringtone may have been removed or the link is incomplete.</p><a class="browse" href="' + origin + '/">← Back to all ringtones</a></div></body></html>';
  return new Response(html, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60" } });
}

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const origin = new URL(request.url).origin;
  const SUPA = env.SUPABASE_URL, KEY = env.SUPABASE_ANON_KEY;
  if (!SUPA || !KEY) return new Response("Missing env", { status: 500 });

  const raw = (params.path || []).join("/");
  if (!raw) return notFound(origin);
  const lastDash = raw.lastIndexOf("-");
  const candShort = lastDash >= 0 ? raw.slice(lastDash + 1) : "";

  // resolve: exact slug first, then short_id
  let row = null, byShort = false;
  const bySlug = await getJSON(SUPA, KEY, "ringtones?seo_slug=eq." + encodeURIComponent(raw) + "&select=" + encodeURIComponent(SELECT) + "&limit=1");
  if (Array.isArray(bySlug) && bySlug[0]) row = bySlug[0];
  if (!row && candShort) {
    const bySid = await getJSON(SUPA, KEY, "ringtones?short_id=eq." + encodeURIComponent(candShort) + "&select=" + encodeURIComponent(SELECT) + "&limit=1");
    if (Array.isArray(bySid) && bySid[0]) { row = bySid[0]; byShort = true; }
  }
  if (!row) return notFound(origin);
  // consolidate URL via 301 when landed on short-id form
  if (byShort && raw !== row.seo_slug) {
    return new Response(null, { status: 301, headers: { Location: origin + "/ringtone/" + encodeURIComponent(row.seo_slug), "Cache-Control": "public, max-age=86400" } });
  }

  const canonical = origin + "/ringtone/" + encodeURIComponent(row.seo_slug);
  const title = row.title || "Untitled";
  const artist = (row.artists && row.artists.name) || "";
  const category = (row.categories && row.categories.name) || "";
  const catSlug = (row.categories && row.categories.slug) || "";
  const artistSlug = (row.artists && row.artists.slug) || "";
  const dLabel = durLabel(row.duration_seconds);
  const dIso = durIso(row.duration_seconds);
  const dl = row.download_count || 0;

  // templates
  const tpls = (await getJSON(SUPA, KEY, "seo_templates?select=template_key,pattern")) || [];
  const tmap = {}; tpls.forEach((t) => { tmap[t.template_key] = t.pattern; });
  const ctx = { title, artist: artist || "Unknown Artist", category: category || "Uncategorized", duration: dLabel, count: String(dl) };
  const metaTitle = (row.seo_title && row.seo_title.trim()) ? row.seo_title.trim() : applyTpl(tmap["track_title"], ctx);
  const metaDesc = (row.seo_description && row.seo_description.trim()) ? row.seo_description.trim() : applyTpl(tmap["track_desc"], ctx);
  const keywords = (row.seo_keywords && row.seo_keywords.trim()) ? row.seo_keywords.trim() : [title, artist, category, "ringtone", "free download", "mp3"].filter(Boolean).join(", ");
  const ogImage = origin + "/og/" + encodeURIComponent(row.id) + ".svg";
  const noindex = row.seo_noindex === true;
  const robots = noindex ? "noindex,follow" : "index,follow,max-image-preview:large";
  const isCopy = row.copyright_status === "copyrighted";
  const created = row.created_at ? String(row.created_at).slice(0, 10) : "";
  const ext = extOf(row.file_url);

  // related (same category) + artist tracks
  let related = [], artistTracks = [];
  if (row.category_id) {
    const r = await getJSON(SUPA, KEY, "ringtones?id=neq." + encodeURIComponent(row.id) + "&category_id=eq." + encodeURIComponent(row.category_id) + "&select=id,title,seo_slug,download_count,artists(name)&order=download_count.desc&limit=10");
    if (Array.isArray(r)) related = r;
  }
  if (related.length < 4) {
    const r2 = await getJSON(SUPA, KEY, "ringtones?id=neq." + encodeURIComponent(row.id) + "&select=id,title,seo_slug,download_count,artists(name)&order=download_count.desc&limit=10");
    if (Array.isArray(r2)) { const have = {}; related.forEach((x) => have[x.id] = 1); r2.forEach((x) => { if (!have[x.id] && related.length < 10) related.push(x); }); }
  }
  if (row.artist_id) {
    const a = await getJSON(SUPA, KEY, "ringtones?id=neq." + encodeURIComponent(row.id) + "&artist_id=eq." + encodeURIComponent(row.artist_id) + "&select=id,title,seo_slug,download_count&order=download_count.desc&limit=8");
    if (Array.isArray(a)) artistTracks = a;
  }

  // JSON-LD
  const music = { "@context": "https://schema.org", "@type": "MusicRecording", name: title, description: metaDesc, inLanguage: "en", isFamilyFriendly: !isCopy, datePublished: created || undefined, keywords: keywords,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical }, image: ogImage,
    audio: { "@type": "AudioObject", encodingFormat: "audio/" + ext, uploadDate: created || undefined },
    interactionStatistic: { "@type": "InteractionCounter", interactionType: { "@type": "DownloadAction" }, userInteractionCount: dl } };
  if (artist) music.byArtist = { "@type": "MusicGroup", name: artist };
  if (category) music.genre = category;
  if (row.genre) music.genre = row.genre;
  if (dIso) music.duration = dIso;
  const bc = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: origin + "/" },
    { "@type": "ListItem", position: 2, name: category || "Ringtones", item: catSlug ? (origin + "/category/" + encodeURIComponent(catSlug)) : (origin + "/") },
    { "@type": "ListItem", position: 3, name: title, item: canonical } ] };

  const rcards = (arr) => arr.map((r, i) => {
    const a = (r.artists && r.artists.name) || "";
    return '<a class="rcard" href="' + origin + '/ringtone/' + encodeURIComponent(r.seo_slug) + '"><div class="mw" aria-hidden="true">' + waveBars(hashStr(r.title) + i, 12) + '</div><div class="rt">' + escHtml(r.title) + '</div><div class="rm">' + escHtml(a || "RingMang") + '</div><div class="rd">⬇ ' + fmt(r.download_count) + '</div></a>';
  }).join("");
  const ticker = (related.length ? related : []).map((r) => '<a href="' + origin + '/ringtone/' + encodeURIComponent(r.seo_slug) + '">' + escHtml(r.title) + ' <span class="d">⬇' + fmt(r.download_count) + '</span></a>').join("");

  const html = '<!doctype html><html lang="en"><head>'
    + '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>' + escHtml(metaTitle) + '</title>'
    + '<meta name="description" content="' + escAttr(metaDesc) + '">'
    + '<meta name="keywords" content="' + escAttr(keywords) + '">'
    + '<meta name="robots" content="' + robots + '">'
    + '<link rel="canonical" href="' + canonical + '">'
    + '<meta property="og:type" content="music.song">'
    + '<meta property="og:site_name" content="RingMang">'
    + '<meta property="og:title" content="' + escAttr(metaTitle) + '">'
    + '<meta property="og:description" content="' + escAttr(metaDesc) + '">'
    + '<meta property="og:url" content="' + canonical + '">'
    + '<meta property="og:image" content="' + ogImage + '">'
    + '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
    + '<meta property="music:musician" content="' + escAttr(artist || "RingMang") + '">'
    + (dIso ? '<meta property="music:duration" content="' + row.duration_seconds + '">' : '')
    + '<meta name="twitter:card" content="summary_large_image">'
    + '<meta name="twitter:title" content="' + escAttr(metaTitle) + '">'
    + '<meta name="twitter:description" content="' + escAttr(metaDesc) + '">'
    + '<meta name="twitter:image" content="' + ogImage + '">'
    + '<meta name="theme-color" content="#071417">'
    + '<link rel="manifest" href="/manifest.webmanifest"><link rel="icon" type="image/svg+xml" href="/icon.svg"><link rel="apple-touch-icon" href="/icon.svg">'
    + '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="RingMang">'
    + '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    + '<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Outfit:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">'
    + '<script type="application/ld+json">' + safeJson(music) + '</script>'
    + '<script type="application/ld+json">' + safeJson(bc) + '</script>'
    + '<style>' + CSS + '</style></head><body>'
    + '<div class="stage"></div>'
    + '<div id="rm-data" class="hidden" data-id="' + escAttr(row.id) + '" data-canon="' + escAttr(canonical) + '" data-supa="' + escAttr(SUPA) + '" data-key="' + escAttr(KEY) + '" data-title="' + escAttr(title) + '"></div>'
    + '<header class="top"><div class="wrap top-in">'
    + '<a class="brand" href="' + origin + '/"><div class="eqm" aria-hidden="true"><span></span><span></span><span></span><span></span></div><span class="wm">Ring<span class="c">Mang</span></span></a>'
    + '<nav class="crumb" aria-label="Breadcrumb"><a href="' + origin + '/">Home</a><span class="sep">/</span>' + (catSlug ? '<a href="' + origin + '/category/' + encodeURIComponent(catSlug) + '">' + escHtml(category) + '</a><span class="sep">/</span>' : '') + '<span class="now">' + escHtml(title) + '</span></nav>'
    + '<a class="browse" href="' + origin + '/#library">Browse all</a>'
    + '</div></header>'
    + (ticker ? '<div class="tick"><div class="tick-in">' + ticker + ticker + '</div></div>' : '')
    + '<main class="wrap"><section class="hero">'
    + '<div>'
    + '<div class="kicker"><span class="live"></span><span class="ktxt">' + (isCopy ? "© Copyrighted clip" : "Original · royalty-free") + '</span>' + (category ? '<a class="chip" href="' + origin + '/category/' + encodeURIComponent(catSlug) + '">' + escHtml(category) + '</a>' : '') + (row.genre ? '<span class="chip">' + escHtml(row.genre) + '</span>' : '') + '</div>'
    + '<h1>' + escHtml(title) + '<svg class="squig" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10 Q 75 2, 150 9 T 297 6" fill="none" stroke="#ffd166" stroke-width="4" stroke-linecap="round"/></svg></h1>'
    + '<p class="byline">by ' + (artist ? '<a href="' + origin + '/artist/' + encodeURIComponent(artistSlug) + '">' + escHtml(artist) + '</a>' : escHtml("Unknown Artist")) + '</p>'
    + '<p class="desc">' + escHtml(metaDesc) + '</p>'
    + '<div class="stats"><span class="dl">⬇ <b id="dlcount" data-n="' + dl + '">0</b> downloads</span><span>· ' + fbytes(row.file_size_bytes) + '</span><span>· ' + ext.toUpperCase() + '</span>' + (dLabel ? '<span>· ' + dLabel + '</span>' : '') + '</div>'
    + '<div class="ctrls"><button id="play" class="play" aria-label="Play preview">▶</button><button id="dlbtn" class="btn dl">⬇ Download</button><div id="dlcd" class="dlcd hidden"><svg viewBox="0 0 40 40"><circle class="rb" cx="20" cy="20" r="18"/><circle id="dlf" class="rf" cx="20" cy="20" r="18"/></svg><span id="dln" class="n"></span></div><button id="shbtn" class="btn sh">⤴ Share</button></div>'
    + '</div>'
    + '<div class="vizcard"><div class="viztop"><div class="vinyl" aria-hidden="true"></div><div class="vizsig">now spinning<b>' + escHtml(title.length > 22 ? title.slice(0, 21) + "…" : title) + '</b></div></div><div id="viz" class="viz" aria-hidden="true">' + waveBars(hashStr(title), 22) + '</div><div class="seek"><span id="cur" class="tm">0:00</span><input id="seek" class="rng" type="range" min="0" max="100" value="0" step="0.1" aria-label="Seek"><span id="dur" class="tm">0:00</span></div><div class="vol"><span style="font-size:.85rem">🔊</span><input id="vol" class="rng" type="range" min="0" max="1" step="0.01" value="1" aria-label="Volume"></div></div>'
    + '</section>'
    + (related.length ? '<section class="rail"><h2><span class="bar"></span>More like this</h2><div class="scroller">' + rcards(related) + '</div></section>' : '')
    + (artistTracks.length ? '<section class="rail"><h2><span class="bar" style="background:#4cc9f0;box-shadow:0 0 8px rgba(76,201,240,.6)"></span>More from ' + escHtml(artist) + '</h2><div class="scroller">' + rcards(artistTracks) + '</div></section>' : '')
    + '</main>'
    + '<footer class="foot"><div class="wrap foot-in"><div class="wm2">Ring<span style="color:#ff6b4a">Mang</span></div><p><strong style="color:#7c8d90">Copyright &amp; DMCA:</strong> RingMang respects intellectual property rights. Content marked © Copyrighted is shared for preview and promotional purposes. If you believe your copyright has been infringed, submit a DMCA takedown request and we will promptly review it. <a href="' + origin + '/">RingMang home</a></p></div></footer>'
    + '<audio id="pa" preload="none" crossorigin="anonymous"></audio>'
    + '<script>' + CLIENT + '</script>'
    + '</body></html>';

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300" } });
}
// RM9B_RINGTONE_END
