/**
 * RingMang — /ringtone/[slug]-[short-id]  (Phase 14C-2 hardening)
 * Fixes: (A) lenient resolver with URL-encoded LIKE wildcard -> 301;
 * (B/C/D) rating isolated in its OWN <script> so a rating fault can NEVER kill the player;
 *        + a safety-net reveal script shows cards even if JS dies;
 *        + dual-source SUPABASE url (env + config.js);
 * (E) overflow-wrap so long underscore titles wrap (h1 + body).
 * Sound fix preserved (audio crossorigin). Universal render.
 */
const escHtml=(s)=>String(s==null?"":s).replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const escAttr=(s)=>String(s==null?"":s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const safeJson=(o)=>JSON.stringify(o).replace(/</g,"\\u003c");
const enc=(s)=>encodeURIComponent(String(s==null?"":s));
const applyTpl=(p,ctx)=>String(p||"").replace(/\{(title|artist|category|duration|count)\}/g,(_,k)=>{const v=ctx[k];return(v==null||v==="")?"":String(v)});
const durLabel=(s)=>{s=parseInt(s,10)||0;return s>0?(Math.floor(s/60)+":"+String(s%60).padStart(2,"0")):""};
const durIso=(s)=>{s=parseInt(s,10)||0;return s>0?("PT"+Math.floor(s/60)+"M"+(s%60)+"S"):""};
const fmt=(n)=>{n=n||0;if(n>=1000000)return(n/1000000).toFixed(1)+"M";if(n>=1000)return(n/1000).toFixed(1)+"K";return String(n)};
const fbytes=(b)=>{b=b||0;if(b<1024)return b+" B";if(b<1048576)return(b/1024).toFixed(1)+" KB";return(b/1048576).toFixed(2)+" MB"};
const extOf=(k)=>{const m=/\.([a-z0-9]+)$/i.exec(String(k||""));return m?m[1].toLowerCase():"mp3"};
const hashStr=(s)=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
function waveBars(seed,n){let b="";for(let i=0;i<n;i++){const h=22+Math.abs(Math.sin((seed%97)*0.7+i*0.9))*78;b+='<span style="height:'+Math.round(h)+'%"></span>'}return b}
function starRow(a){let h="";for(let i=0;i<5;i++){const w=Math.max(0,Math.min(1,a-i))*100;h+='<span class="star"><span class="sb">★</span><span class="sf" style="width:'+w.toFixed(1)+'%">★</span></span>';}return h}
async function getJSON(SUPA,KEY,path){const r=await fetch(SUPA+"/rest/v1/"+path,{headers:{apikey:KEY,Authorization:"Bearer "+KEY,Accept:"application/json"}});if(!r.ok)return null;return r.json()}
const SELECT="id,title,description,file_url,file_size_bytes,download_count,copyright_status,duration_seconds,genre,seo_title,seo_description,seo_keywords,seo_slug,short_id,seo_noindex,rating_avg,rating_count,created_at,category_id,artist_id,categories(name,slug),artists(name,slug)";

const CSS=`
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
body{font-family:"Outfit",system-ui,sans-serif;background:#071417;color:#dbe4e6;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;overflow-wrap:break-word}
.stage{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 45% at 8% -6%,rgba(255,107,74,.13),transparent 60%),radial-gradient(ellipse 55% 45% at 96% 8%,rgba(61,220,151,.10),transparent 60%),radial-gradient(ellipse 50% 40% at 70% 108%,rgba(255,209,102,.08),transparent 60%),linear-gradient(rgba(255,255,255,.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.013) 1px,transparent 1px);background-size:100% 100%,100% 100%,100% 100%,40px 40px,40px 40px}
a{color:inherit}.wrap{position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:0 1.1rem}
.top{position:sticky;top:0;z-index:30;background:rgba(7,20,23,.82);backdrop-filter:blur(10px);border-bottom:1px solid rgba(30,58,64,.6)}
.top-in{display:flex;align-items:center;justify-content:space-between;gap:1rem;height:3.4rem}
.brand{display:flex;align-items:center;gap:.6rem;text-decoration:none}
.eqm{display:flex;align-items:flex-end;gap:2.5px;height:18px}.eqm span{width:3px;border-radius:2px;transform-origin:bottom;animation:eqb .9s ease-in-out infinite}
.eqm span:nth-child(1){background:#ff6b4a;height:60%}.eqm span:nth-child(2){background:#ffd166;height:100%;animation-delay:.15s}.eqm span:nth-child(3){background:#3ddc97;height:45%;animation-delay:.3s}.eqm span:nth-child(4){background:#4cc9f0;height:80%;animation-delay:.45s}
@keyframes eqb{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
.wm{font-family:"Unbounded",sans-serif;font-weight:800;font-size:1.05rem;color:#fff;letter-spacing:-.01em}.wm .c{color:#ff6b4a}
.crumb{display:flex;align-items:center;gap:.45rem;font-family:"Space Mono",monospace;font-size:.62rem;letter-spacing:.06em;color:#6b7280;min-width:0}
.crumb a{color:#9fb0b3;text-decoration:none;white-space:nowrap;transition:color .2s}.crumb a:hover{color:#ff6b4a}.crumb .sep{color:#2a4d55}.crumb .now{color:#3ddc97;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:34vw}
.browse{font-family:"Space Mono",monospace;font-size:.62rem;letter-spacing:.1em;color:#9fb0b3;text-decoration:none;border:1px solid #2a4d55;border-radius:2rem;padding:.35rem .8rem;transition:all .2s;white-space:nowrap}.browse:hover{color:#071417;background:#3ddc97;border-color:#3ddc97}
.tick{position:relative;z-index:1;border-bottom:1px solid rgba(30,58,64,.5);background:rgba(12,26,29,.6);overflow:hidden}
.tick-in{display:flex;width:max-content;animation:marq 38s linear infinite}.tick-in:hover{animation-play-state:paused}@keyframes marq{to{transform:translateX(-50%)}}
.tick a{display:inline-flex;align-items:center;gap:.5rem;padding:.55rem 1.3rem;font-family:"Space Mono",monospace;font-size:.7rem;color:#9ca3af;text-decoration:none;white-space:nowrap;border-right:1px solid rgba(30,58,64,.4);transition:color .2s}.tick a:hover{color:#ffd166}.tick a .d{color:#3ddc97}
.hero{display:grid;grid-template-columns:1fr;gap:1.8rem;padding:2.4rem 0 1.6rem}
@media(min-width:860px){.hero{grid-template-columns:1.25fr 1fr;gap:2.4rem;align-items:center;padding:3rem 0 2rem}}
.kicker{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:1rem}
.live{width:8px;height:8px;border-radius:50%;background:#3ddc97;box-shadow:0 0 8px rgba(61,220,151,.8);animation:lp 1.6s ease-in-out infinite}@keyframes lp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
.ktxt{font-family:"Space Mono",monospace;font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;color:#3ddc97}
.chip{font-family:"Space Mono",monospace;font-size:.6rem;letter-spacing:.08em;color:#9fb0b3;border:1px solid #2a4d55;border-radius:2rem;padding:.2rem .6rem;text-decoration:none;transition:all .2s}.chip:hover{border-color:#4cc9f0;color:#4cc9f0}
h1{font-family:"Unbounded",sans-serif;font-weight:800;font-size:clamp(2.1rem,6.4vw,3.9rem);line-height:1.04;color:#fff;letter-spacing:-.02em;position:relative;display:inline-block;overflow-wrap:anywhere;word-break:break-word;max-width:100%}
.squig{position:absolute;left:0;right:0;bottom:-.5rem;width:100%;height:14px}.squig path{stroke-dasharray:420;stroke-dashoffset:420;animation:draw 1.3s ease-out .4s forwards}@keyframes draw{to{stroke-dashoffset:0}}
.byline{margin-top:1.1rem;font-size:1rem;color:#9fb0b3}.byline a{color:#4cc9f0;text-decoration:none;border-bottom:1px dashed rgba(76,201,240,.4)}.byline a:hover{color:#7fd9f5}
.desc{margin-top:1rem;color:#84969a;font-size:1rem;line-height:1.65;max-width:52ch}
.stats{margin-top:1.3rem;display:flex;flex-wrap:wrap;gap:.5rem 1.3rem;font-family:"Space Mono",monospace;font-size:.72rem;color:#5b6b6e}.stats .dl{color:#3ddc97}.stats b{color:#cdd8da;font-weight:700}
.ctrls{margin-top:1.6rem;display:flex;align-items:center;gap:.8rem;flex-wrap:wrap}
.play{width:3.7rem;height:3.7rem;border-radius:50%;border:none;background:#ff6b4a;color:#071417;font-size:1.25rem;cursor:pointer;box-shadow:0 8px 26px rgba(255,107,74,.45);transition:transform .15s,background .2s;flex-shrink:0;display:flex;align-items:center;justify-content:center}.play:hover{background:#ff8266;transform:scale(1.08)}.play:active{transform:scale(.92)}
.btn{display:inline-flex;align-items:center;gap:.5rem;padding:.7rem 1.1rem;border-radius:.6rem;font-family:"Unbounded",sans-serif;font-weight:600;font-size:.78rem;cursor:pointer;transition:all .2s;background:transparent}
.btn.dl{border:1.5px solid rgba(61,220,151,.5);color:#3ddc97}.btn.dl:hover{background:rgba(61,220,151,.14);box-shadow:0 0 18px rgba(61,220,151,.22)}
.btn.sh{border:1.5px solid rgba(76,201,240,.45);color:#4cc9f0}.btn.sh:hover{background:rgba(76,201,240,.14);box-shadow:0 0 16px rgba(76,201,240,.22)}.btn:disabled{opacity:.5;cursor:default}
.dlcd{position:relative;width:2.6rem;height:2.6rem;flex-shrink:0}.dlcd svg{width:100%;height:100%;transform:rotate(-90deg)}.dlcd .rb{fill:none;stroke:#1e3a40;stroke-width:5}.dlcd .rf{fill:none;stroke:#3ddc97;stroke-width:5;stroke-linecap:round;stroke-dasharray:113;stroke-dashoffset:0;transition:stroke-dashoffset .8s linear}.dlcd .n{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:"Space Mono",monospace;font-size:.85rem;font-weight:700;color:#3ddc97}
.hidden{display:none !important}
.vizcard{position:relative;border:1px solid #1e3a40;border-radius:1.2rem;overflow:hidden;background:radial-gradient(circle at 50% 30%,#152a2f,#071417);padding:1.4rem;box-shadow:0 24px 60px rgba(0,0,0,.5)}
.vizcard::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(255,107,74,.16),transparent 62%);animation:gp 3.4s ease-in-out infinite}@keyframes gp{0%,100%{opacity:.55}50%{opacity:1}}
.viztop{position:relative;display:flex;align-items:center;gap:1.1rem}
.vinyl{position:relative;width:96px;height:96px;flex-shrink:0;border-radius:50%;background:repeating-radial-gradient(circle at 50% 50%,#0b0f14 0 4px,#16202a 4px 6px);border:2px solid rgba(255,209,102,.25);display:flex;align-items:center;justify-content:center}.vinyl::after{content:"";width:24px;height:24px;border-radius:50%;background:radial-gradient(circle,#ff6b4a,#7a1f12);box-shadow:0 0 12px rgba(255,107,74,.6)}.vinyl.spin{animation:spin 6s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
.vizsig{position:relative;font-family:"Space Mono",monospace;font-size:.6rem;letter-spacing:.18em;color:#6b7280;text-transform:uppercase;overflow-wrap:anywhere}.vizsig b{display:block;color:#3ddc97;font-size:.95rem;letter-spacing:.04em;margin-top:.2rem;overflow-wrap:anywhere;word-break:break-word}
.viz{position:relative;display:flex;align-items:flex-end;gap:3px;height:84px;margin-top:1.2rem}.viz span{flex:1;height:16%;border-radius:3px 3px 0 0;background:linear-gradient(to top,#ff6b4a,#ffd166);transform-origin:bottom;transition:height .09s linear}
.viz.playing:not(.real) span{animation:fb .85s ease-in-out infinite}.viz.playing:not(.real) span:nth-child(odd){animation-duration:1.05s}.viz.playing:not(.real) span:nth-child(3n){animation-delay:.12s}.viz.playing:not(.real) span:nth-child(4n){animation-delay:.24s}@keyframes fb{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
.seek{position:relative;display:flex;align-items:center;gap:.6rem;margin-top:1.1rem}.tm{font-family:"Space Mono",monospace;font-size:.66rem;color:#6b7280;width:2.4rem;text-align:center}
.rng{-webkit-appearance:none;appearance:none;flex:1;height:6px;border-radius:3px;background:#1e3a40;outline:none;cursor:pointer}.rng::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:#ff6b4a;box-shadow:0 0 9px rgba(255,107,74,.6);cursor:pointer}.rng::-moz-range-thumb{width:15px;height:15px;border:none;border-radius:50%;background:#ff6b4a;cursor:pointer}
.vol{position:relative;display:flex;align-items:center;gap:.5rem;margin-top:.7rem}.vol .rng{max-width:8rem}
.verdict{position:relative;margin-top:1.5rem;background:linear-gradient(180deg,#10151c,#0c1117);border:1px solid #1e3a40;border-radius:1rem;padding:1.2rem 1.2rem 1.3rem;overflow:hidden}
.verdict::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#fbbf24,#fb923c);box-shadow:0 0 12px rgba(251,191,36,.5)}
.verdict::after{content:"";position:absolute;right:-30px;top:-30px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(251,191,36,.12),transparent 70%);pointer-events:none}
.vtop{display:flex;align-items:center;gap:1rem;flex-wrap:wrap}
.vavg{display:flex;align-items:baseline;gap:.2rem}
.vnum{font-family:"Unbounded",sans-serif;font-weight:800;font-size:2.7rem;line-height:1;color:#fff;text-shadow:0 0 22px rgba(251,191,36,.25)}
.vout{font-family:"Space Mono",monospace;font-size:.8rem;color:#56676a}
.vstars{display:flex;gap:.1rem}
.vcnt{font-family:"Space Mono",monospace;font-size:.66rem;letter-spacing:.08em;color:#7f9099;margin-left:auto}
.star{position:relative;display:inline-block;font-size:1.05rem;line-height:1}.star .sb{color:#2a4d55}.star .sf{position:absolute;left:0;top:0;overflow:hidden;white-space:nowrap;color:#fbbf24;text-shadow:0 0 8px rgba(251,191,36,.55)}
.dist{margin:1rem 0 .4rem;display:flex;flex-direction:column;gap:.32rem}
.drow{display:grid;grid-template-columns:1.4rem 1fr 2.2rem;align-items:center;gap:.5rem}
.dlbl{font-family:"Space Mono",monospace;font-size:.62rem;color:#6b7280;text-align:right}
.dtrack{height:6px;background:#13191f;border-radius:3px;overflow:hidden}
.dfill{display:block;height:100%;width:0;background:linear-gradient(90deg,#fb923c,#fbbf24);border-radius:3px;transition:width .8s cubic-bezier(.4,0,.2,1)}
.dcnt{font-family:"Space Mono",monospace;font-size:.62rem;color:#56676a;text-align:right}
.rate{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;margin-top:.9rem;padding-top:.9rem;border-top:1px dashed #1e3a40}
.rate-lbl{font-family:"Space Mono",monospace;font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:#9ca3af}
.rstars{display:flex;gap:.15rem}
.rstar{background:none;border:none;padding:0 .04rem;font-size:1.5rem;line-height:1;color:#2a4d55;cursor:pointer;transition:color .15s,transform .15s,text-shadow .15s}
.rstar:hover{transform:scale(1.18)}.rstar.lit{color:#fbbf24;text-shadow:0 0 10px rgba(251,191,36,.6)}
.rstar.burst{animation:burst .5s cubic-bezier(.34,1.6,.64,1)}@keyframes burst{0%{transform:scale(1)}40%{transform:scale(1.6);text-shadow:0 0 18px rgba(251,191,36,.9)}100%{transform:scale(1)}}
.rate-msg{font-family:"Space Mono",monospace;font-size:.66rem;color:#56676a;opacity:0;transition:opacity .25s}.rate-msg.on{opacity:1;color:#3ddc97}
.rate-note{width:100%;font-family:"Space Mono",monospace;font-size:.58rem;color:#4b5563;margin-top:.2rem}
.rail{padding:1.4rem 0 .4rem}.rail h2{font-family:"Unbounded",sans-serif;font-size:1rem;font-weight:700;color:#fff;margin-bottom:.9rem;display:flex;align-items:center;gap:.5rem}.rail h2 .bar{width:4px;height:1.1rem;border-radius:2px;background:#ff6b4a;box-shadow:0 0 8px rgba(255,107,74,.6)}
.scroller{display:flex;gap:.8rem;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:.6rem;scrollbar-width:thin;scrollbar-color:#2a4d55 transparent}.scroller::-webkit-scrollbar{height:6px}.scroller::-webkit-scrollbar-thumb{background:#2a4d55;border-radius:3px}
.rcard{scroll-snap-align:start;flex:0 0 220px;text-decoration:none;background:#102226;border:1px solid #1e3a40;border-radius:.8rem;padding:.9rem;transition:transform .25s,border-color .25s,box-shadow .25s,opacity .5s ease,transform .5s ease;opacity:0;transform:translateY(16px)}
.rcard.revealed{opacity:1;transform:translateY(0)}
.rcard:hover{transform:translateY(-4px);border-color:#2a4d55;box-shadow:0 12px 30px rgba(0,0,0,.45)}
.rcard .mw{display:flex;align-items:flex-end;gap:3px;height:26px;margin-bottom:.7rem}.rcard .mw span{flex:1;border-radius:2px;background:#2a4d55;transform-origin:bottom;transition:background .3s}.rcard:hover .mw span{background:#ff6b4a;animation:cw .7s ease-in-out infinite}.rcard .mw span:nth-child(3n){animation-delay:.1s}.rcard .mw span:nth-child(4n){animation-delay:.2s}@keyframes cw{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}
.rcard .rt{font-family:"Unbounded",sans-serif;font-size:.84rem;font-weight:600;color:#eef3f4;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rcard .rm{font-family:"Space Mono",monospace;font-size:.62rem;color:#6b7280;margin-top:.3rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rcard .rd{font-family:"Space Mono",monospace;font-size:.62rem;color:#3ddc97;margin-top:.4rem}
.foot{position:relative;z-index:1;border-top:1px solid rgba(20,38,42,.8);margin-top:2rem}.foot-in{padding:1.8rem 0 2.4rem}.foot .wm2{font-family:"Unbounded",sans-serif;font-weight:700;color:#cdd8da;font-size:.9rem;margin-bottom:.6rem}.foot p{font-size:.74rem;color:#56676a;line-height:1.6;max-width:64ch}.foot a{color:#7c8d90;text-decoration:none}.foot a:hover{color:#ff6b4a}
@media(max-width:560px){.crumb .now{max-width:42vw}}
`;

/* ===== MAIN CORE (player / download / share / reveal) — isolated from rating ===== */
const CORE=`
(function(){
 try{
 var d=document.getElementById("rm-data");if(!d)return;
 var CFG=window.RINGMANG_CONFIG||{};
 var ID=d.getAttribute("data-id"),CANON=d.getAttribute("data-canon"),TITLE=d.getAttribute("data-title");
 var SUPA=d.getAttribute("data-supa")||CFG.SUPABASE_URL||"";
 var KEY=d.getAttribute("data-key")||CFG.SUPABASE_ANON_KEY||"";
 var audio=document.getElementById("pa"),play=document.getElementById("play"),dl=document.getElementById("dlbtn"),sh=document.getElementById("shbtn");
 var viz=document.getElementById("viz"),vinyl=document.querySelector(".vinyl"),bar=document.getElementById("seek"),cur=document.getElementById("cur"),dur=document.getElementById("dur"),vol=document.getElementById("vol");
 var dlcd=document.getElementById("dlcd"),dln=document.getElementById("dln"),dlf=document.getElementById("dlf");
 var ctx=null,src=null,an=null,freq=null,real=false,raf=null,drag=false;
 function fmtT(s){if(!isFinite(s)||s<0)s=0;return Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0")}
 function toast(m){var t=document.getElementById("toast");if(!t){t=document.createElement("div");t.id="toast";t.className="toast";document.body.appendChild(t)}t.textContent=m;t.style.display="block";clearTimeout(window.__rt);window.__rt=setTimeout(function(){t.style.display="none"},3000)}
 function setPlay(on){if(!play)return;play.textContent=on?"\\u275A\\u275A":"\\u25B6";if(viz)viz.classList.toggle("playing",on);if(vinyl)vinyl.classList.toggle("spin",on)}
 function buildGraph(){if(ctx)return real;try{ctx=new(window.AudioContext||window.webkitAudioContext)();src=ctx.createMediaElementSource(audio);an=ctx.createAnalyser();an.fftSize=64;freq=new Uint8Array(an.frequencyBinCount);src.connect(an);an.connect(ctx.destination);real=true;viz.classList.add("real");return true}catch(e){return false}}
 function loop(){if(audio.paused)return;if(real&&an){try{an.getByteFrequencyData(freq);var bars=viz.children,sum=0;for(var i=0;i<bars.length;i++){var v=freq[i%freq.length];sum+=v;bars[i].style.height=(12+(v/255)*88)+"%"}if(sum===0){real=false;viz.classList.remove("real")}}catch(e){real=false}}raf=requestAnimationFrame(loop)}
 function signed(intent){return fetch(SUPA+"/functions/v1/serve-ringtone?id="+encodeURIComponent(ID)+"&intent="+intent,{headers:{apikey:KEY}}).then(function(r){return r.json().then(function(j){if(!r.ok||!j.url)throw new Error(j.error||"fail");return j})})}
 if(play)play.addEventListener("click",function(){
  if(!audio.src){play.disabled=true;signed("play").then(function(j){audio.crossOrigin="anonymous";audio.src=j.url;buildGraph();if(ctx&&ctx.state==="suspended")ctx.resume();return audio.play()}).then(function(){setPlay(true);play.disabled=false;cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}).catch(function(){toast("\\u25B6 Preview unavailable right now");setPlay(false);play.disabled=false});return}
  if(audio.paused){if(ctx&&ctx.state==="suspended")ctx.resume();audio.play().then(function(){setPlay(true);cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}).catch(function(){});}else{audio.pause()}
 });
 if(audio){audio.addEventListener("play",function(){setPlay(true)});audio.addEventListener("pause",function(){setPlay(false)});audio.addEventListener("ended",function(){setPlay(false)});
 audio.addEventListener("loadedmetadata",function(){if(dur)dur.textContent=fmtT(audio.duration);if(bar)bar.max=audio.duration||100});
 audio.addEventListener("timeupdate",function(){if(!drag&&audio.duration){if(cur)cur.textContent=fmtT(audio.currentTime);if(bar)bar.value=audio.currentTime}});}
 if(bar){bar.addEventListener("input",function(){drag=true;if(cur)cur.textContent=fmtT(parseFloat(bar.value))});bar.addEventListener("change",function(){audio.currentTime=parseFloat(bar.value);drag=false});}
 if(vol)vol.addEventListener("input",function(){audio.volume=parseFloat(vol.value)});
 if(dl)dl.addEventListener("click",function(){if(dl.disabled)return;dl.disabled=true;if(dlcd)dlcd.classList.remove("hidden");var n=3;if(dln)dln.textContent=n;if(dlf)dlf.style.strokeDashoffset="0";var iv=setInterval(function(){n--;if(dlf)dlf.style.strokeDashoffset=String(113*(1-n/3));if(n<=0){clearInterval(iv);if(dln)dln.textContent="\\u2026";doDl()}else{if(dln)dln.textContent=n}},800)});
 function doDl(){signed("download").then(function(j){return fetch(j.url).then(function(r){if(!r.ok)throw new Error("fetch");return r.blob()}).then(function(blob){var mt=j.mime_type||"";var ext=mt.indexOf("mp4")>-1?"m4a":(mt.indexOf("ogg")>-1?"ogg":(mt.indexOf("wav")>-1?"wav":"mp3"));var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(TITLE||"ringtone").replace(/[^\\w-]+/g,"_").slice(0,50)+"."+ext;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},2000);if(dlcd)dlcd.classList.add("hidden");if(dl)dl.disabled=false;toast("\\u2713 Saved to your device")})}).catch(function(){if(dlcd)dlcd.classList.add("hidden");if(dl)dl.disabled=false;toast("\\u2B07 Download failed \\u2014 try again")})}
 if(sh)sh.addEventListener("click",function(){var text=(TITLE||"RingMang")+" \\u2014 free ringtone on RingMang";if(navigator.share){navigator.share({title:TITLE||"RingMang",text:text,url:CANON}).catch(function(){});return}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(CANON).then(function(){toast("\\uD83D\\uDD17 Link copied!")}).catch(function(){toast(CANON)});return}toast(CANON)});
 var dc=document.getElementById("dlcount");if(dc){var tgt=parseInt(dc.getAttribute("data-n"),10)||0,st=performance.now();(function tk(now){var p=Math.min((now-st)/1100,1);dc.textContent=Math.round(tgt*(1-Math.pow(1-p,3))).toLocaleString();if(p<1)requestAnimationFrame(tk)})(st)}
 function revealCards(){var cs=document.querySelectorAll(".rcard");for(var i=0;i<cs.length;i++){(function(c,i){setTimeout(function(){c.classList.add("revealed")},i*60)})(cs[i],i)}}
 if("IntersectionObserver"in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("revealed");io.unobserve(e.target)}})},{threshold:.1});document.querySelectorAll(".rcard").forEach(function(c){io.observe(c)})}
 revealCards();
 }catch(e){console.warn("core init failed",e)}
})();
`;

/* ===== RATING — fully isolated in its own script; a fault here cannot touch the player ===== */
const RATING=`
(function(){
 try{
 var d=document.getElementById("rm-data");if(!d)return;
 var RID=d.getAttribute("data-id");
 var CFG=window.RINGMANG_CONFIG||{};
 var SUPA=d.getAttribute("data-supa")||CFG.SUPABASE_URL||"";
 var KEY=d.getAttribute("data-key")||CFG.SUPABASE_ANON_KEY||"";
 if(!SUPA||!KEY||!RID)return;
 var rstars=document.getElementById("rstars");if(!rstars)return;
 function rid(){var k="rm_rater_id",v;try{v=localStorage.getItem(k)}catch(e){}if(!v){v=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():("r"+Date.now()+Math.random().toString(36).slice(2,10));try{localStorage.setItem(k,v)}catch(e){}}return v}
 var MY=rid();
 var rateMsg=document.getElementById("rateMsg"),avgnum=document.getElementById("avgnum"),avgcnt=document.getElementById("avgcnt"),avgstars=document.getElementById("avgstars");
 function paint(el,a){if(!el)return;var h="";for(var i=0;i<5;i++){var w=Math.max(0,Math.min(1,a-i))*100;h+='<span class="star"><span class="sb">\\u2605</span><span class="sf" style="width:'+w.toFixed(1)+'%">\\u2605</span></span>';}el.innerHTML=h}
 function lit(n){var bs=rstars.querySelectorAll(".rstar");for(var i=0;i<bs.length;i++){bs[i].classList.toggle("lit",parseInt(bs[i].getAttribute("data-v"),10)<=n)}}
 function cntFor(s){return fetch(SUPA+"/rest/v1/ratings?ringtone_id=eq."+encodeURIComponent(RID)+"&score=eq."+s+"&select=id",{headers:{apikey:KEY,Prefer:"count=exact",Range:"0-0"}}).then(function(r){var c=r.headers.get("content-range");var n=c?parseInt(c.split("/")[1],10):0;return isNaN(n)?0:n}).catch(function(){return 0})}
 function refresh(){Promise.all([1,2,3,4,5].map(cntFor)).then(function(cs){var total=0,sum=0,mx=0;for(var i=0;i<5;i++){total+=cs[i];sum+=(i+1)*cs[i];if(cs[i]>mx)mx=cs[i]}if(mx<1)mx=1;for(var s=1;s<=5;s++){var f=document.querySelector('.dfill[data-s="'+s+'"]');var ct=document.querySelector('.dcnt[data-sc="'+s+'"]');if(f)f.style.width=(cs[s-1]/mx*100).toFixed(1)+"%";if(ct)ct.textContent=cs[s-1]}var avg=total?sum/total:0;if(avgnum)avgnum.textContent=total?avg.toFixed(1):"\\u2014";if(avgcnt)avgcnt.textContent=total;if(avgstars)paint(avgstars,avg)})}
 var myVote=0;
 function showMine(v){myVote=v;lit(v);if(rateMsg){if(v){rateMsg.textContent="You rated \\u2605"+v+" \\u00B7 tap a star to change";rateMsg.classList.add("on")}else{rateMsg.textContent="";rateMsg.classList.remove("on")}}}
 function loadMine(){var ls=0;try{ls=parseInt(localStorage.getItem("rm_vote_"+RID),10)||0}catch(e){}return fetch(SUPA+"/rest/v1/ratings?ringtone_id=eq."+encodeURIComponent(RID)+"&rater_id=eq."+encodeURIComponent(MY)+"&select=score&limit=1",{headers:{apikey:KEY}}).then(function(r){return r.ok?r.json():[]}).then(function(rows){var v=(Array.isArray(rows)&&rows[0])?parseInt(rows[0].score,10):ls;if(v>=1&&v<=5){try{localStorage.setItem("rm_vote_"+RID,String(v))}catch(e){}showMine(v)}return v}).catch(function(){if(ls)showMine(ls);return ls})}
 var bs=rstars.querySelectorAll(".rstar");
 for(var i=0;i<bs.length;i++){(function(b){
  b.addEventListener("mouseenter",function(){lit(parseInt(b.getAttribute("data-v"),10))});
  b.addEventListener("click",function(){var v=parseInt(b.getAttribute("data-v"),10);b.classList.add("burst");setTimeout(function(){b.classList.remove("burst")},520);lit(v);if(rateMsg){rateMsg.textContent="Saving\\u2026";rateMsg.classList.add("on")}
   fetch(SUPA+"/rest/v1/ratings",{method:"POST",headers:{apikey:KEY,"Content-Type":"application/json",Prefer:"return=minimal,resolution=merge-duplicates"},body:JSON.stringify({ringtone_id:RID,rater_id:MY,score:v})}).then(function(r){if(r.ok||r.status===200||r.status===201){try{localStorage.setItem("rm_vote_"+RID,String(v))}catch(e){}showMine(v);refresh()}else{return r.text().then(function(t){var code="";try{code=(JSON.parse(t||"{}")||{}).code||""}catch(e){}if(code==="23505"||r.status===409){loadMine().then(refresh)}else if(rateMsg){rateMsg.textContent="Could not save \\u2014 try again"}})}else if(rateMsg){rateMsg.textContent="Could not save \\u2014 try again"}}).catch(function(){if(rateMsg){rateMsg.textContent="Network error \\u2014 try again"}lit(myVote)});
  });
 })(bs[i])}
 rstars.addEventListener("mouseleave",function(){lit(myVote)});
 loadMine().then(refresh);
 }catch(e){console.warn("rating init failed",e)}
})();
`;

/* ===== SAFETY NET — reveals cards even if every other script dies ===== */
const REVEAL=`(function(){setTimeout(function(){var els=document.querySelectorAll(".rcard");for(var i=0;i<els.length;i++)els[i].classList.add("revealed")},1800)})();`;

function notFound(origin){
 const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Track not found · RingMang</title><meta name="robots" content="noindex,follow"><meta property="og:title" content="Track not found · RingMang"><meta property="og:site_name" content="RingMang"><link rel="canonical" href="'+origin+'/"><link rel="icon" href="/icon.svg"><style>'+CSS+'body{display:flex;align-items:center;justify-content:center}.nf{text-align:center;position:relative;z-index:1;padding:2rem}.nf h1{font-size:2rem}.nf p{color:#84969a;margin:.8rem 0 1.4rem}</style></head><body><div class="stage"></div><div class="nf"><div class="eqm" style="margin:0 auto .8rem;height:26px"><span></span><span></span><span></span><span></span></div><h1>404 — not in the crate</h1><p>This ringtone may have been removed or the link is incomplete.</p><a class="browse" href="'+origin+'/">← Back to all ringtones</a></div></body></html>';
 return new Response(html,{status:404,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"public, max-age=60"}});
}

export async function onRequestGet(context){
 const {request,env,params}=context;
 const origin=new URL(request.url).origin;
 const SUPA=env.SUPABASE_URL,KEY=env.SUPABASE_ANON_KEY;
 if(!SUPA||!KEY)return new Response("Missing env",{status:500});
 const raw=(params.path||[]).join("/");
 if(!raw)return notFound(origin);
 const lastDash=raw.lastIndexOf("-");
 const candShort=lastDash>=0?raw.slice(lastDash+1):"";
 let row=null,byShort=false;
 const bySlug=await getJSON(SUPA,KEY,"ringtones?seo_slug=eq."+enc(raw)+"&select="+enc(SELECT)+"&limit=1");
 if(Array.isArray(bySlug)&&bySlug[0])row=bySlug[0];
 if(!row&&candShort){const bySid=await getJSON(SUPA,KEY,"ringtones?short_id=eq."+enc(candShort)+"&select="+enc(SELECT)+"&limit=1");if(Array.isArray(bySid)&&bySid[0]){row=bySid[0];byShort=true}}
 if(!row){const byPre=await getJSON(SUPA,KEY,"ringtones?seo_slug=like."+enc(raw+"-%")+"&select="+enc(SELECT)+"&order=created_at.desc&limit=1");if(Array.isArray(byPre)&&byPre[0]){row=byPre[0];byShort=true}}
 if(!row)return notFound(origin);
 if(byShort&&raw!==row.seo_slug){return new Response(null,{status:301,headers:{Location:origin+"/ringtone/"+enc(row.seo_slug),"Cache-Control":"public, max-age=86400"}})}

 const canonical=origin+"/ringtone/"+enc(row.seo_slug);
 const title=row.title||"Untitled";
 const artist=(row.artists&&row.artists.name)||"";
 const category=(row.categories&&row.categories.name)||"";
 const catSlug=(row.categories&&row.categories.slug)||"";
 const artistSlug=(row.artists&&row.artists.slug)||"";
 const dLabel=durLabel(row.duration_seconds);
 const dIso=durIso(row.duration_seconds);
 const dl=row.download_count||0;
 const isCopy=row.copyright_status==="copyrighted";
 const rAvg=parseFloat(row.rating_avg)||0;
 const rCnt=row.rating_count||0;
 const avgStarsHtml=starRow(rAvg);
 const avgTxt=rCnt>0?rAvg.toFixed(1):"—";

 const tpls=(await getJSON(SUPA,KEY,"seo_templates?select=template_key,pattern"))||[];const tmap={};tpls.forEach((t)=>{tmap[t.template_key]=t.pattern});
 const ctx={title,artist:artist||"Unknown Artist",category:category||"Uncategorized",duration:dLabel,count:String(dl)};
 const metaTitle=(row.seo_title&&row.seo_title.trim())?row.seo_title.trim():applyTpl(tmap["track_title"],ctx);
 const metaDesc=(row.seo_description&&row.seo_description.trim())?row.seo_description.trim():applyTpl(tmap["track_desc"],ctx);
 const keywords=(row.seo_keywords&&row.seo_keywords.trim())?row.seo_keywords.trim():[title,artist,category,"ringtone","free download","mp3"].filter(Boolean).join(", ");
 const ogImage=origin+"/og/"+enc(row.id)+".svg";
 const noindex=row.seo_noindex===true;
 const robots=noindex?"noindex,follow":"index,follow,max-image-preview:large";
 const created=row.created_at?String(row.created_at).slice(0,10):"";
 const ext=extOf(row.file_url);

 let related=[],artistTracks=[];
 if(row.category_id){const r=await getJSON(SUPA,KEY,"ringtones?id=neq."+enc(row.id)+"&category_id=eq."+enc(row.category_id)+"&select=id,title,seo_slug,download_count,artists(name)&order=download_count.desc&limit=10");if(Array.isArray(r))related=r}
 if(related.length<4){const r2=await getJSON(SUPA,KEY,"ringtones?id=neq."+enc(row.id)+"&select=id,title,seo_slug,download_count,artists(name)&order=download_count.desc&limit=10");if(Array.isArray(r2)){const have={};related.forEach((x)=>have[x.id]=1);r2.forEach((x)=>{if(!have[x.id]&&related.length<10)related.push(x)})}}
 if(row.artist_id){const a=await getJSON(SUPA,KEY,"ringtones?id=neq."+enc(row.id)+"&artist_id=eq."+enc(row.artist_id)+"&select=id,title,seo_slug,download_count&order=download_count.desc&limit=8");if(Array.isArray(a))artistTracks=a}

 const music={"@context":"https://schema.org","@type":"MusicRecording",name:title,description:metaDesc,inLanguage:"en",isFamilyFriendly:!isCopy,datePublished:created||undefined,keywords:keywords,mainEntityOfPage:{"@type":"WebPage","@id":canonical},image:ogImage,audio:{"@type":"AudioObject",encodingFormat:"audio/"+ext,uploadDate:created||undefined},interactionStatistic:{"@type":"InteractionCounter",interactionType:{"@type":"DownloadAction"},userInteractionCount:dl}};
 if(artist)music.byArtist={"@type":"MusicGroup",name:artist};
 if(category)music.genre=category;
 if(row.genre)music.genre=row.genre;
 if(dIso)music.duration=dIso;
 if(rCnt>0)music.aggregateRating={"@type":"AggregateRating","ratingValue":Math.round(rAvg*100)/100,"reviewCount":rCnt,"bestRating":5,"worstRating":1};
 const bc={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:origin+"/"},{"@type":"ListItem",position:2,name:category||"Ringtones",item:catSlug?(origin+"/category/"+enc(catSlug)):(origin+"/")},{"@type":"ListItem",position:3,name:title,item:canonical}]};

 const rcards=(arr)=>arr.map((r,i)=>{const a=(r.artists&&r.artists.name)||"";return '<a class="rcard" href="'+origin+'/ringtone/'+enc(r.seo_slug)+'"><div class="mw" aria-hidden="true">'+waveBars(hashStr(r.title)+i,12)+'</div><div class="rt">'+escHtml(r.title)+'</div><div class="rm">'+escHtml(a||"RingMang")+'</div><div class="rd">⬇ '+fmt(r.download_count)+'</div></a>'}).join("");
 const ticker=(related.length?related:[]).map((r)=>'<a href="'+origin+'/ringtone/'+enc(r.seo_slug)+'">'+escHtml(r.title)+' <span class="d">⬇'+fmt(r.download_count)+'</span></a>').join("");

 const verdictHtml='<section class="verdict"><div class="vtop"><div class="vavg"><span class="vnum" id="avgnum">'+avgTxt+'</span><span class="vout">/5</span></div><div class="vstars" id="avgstars">'+avgStarsHtml+'</div><div class="vcnt"><span id="avgcnt">'+rCnt+'</span> ratings</div></div><div class="dist" id="dist">'+[5,4,3,2,1].map(function(n){return '<div class="drow"><span class="dlbl">'+n+'</span><span class="dtrack"><span class="dfill" data-s="'+n+'"></span></span><span class="dcnt" data-sc="'+n+'">0</span></div>'}).join('')+'</div><div class="rate" id="rate"><span class="rate-lbl">Your rating</span><div class="rstars" id="rstars">'+[1,2,3,4,5].map(function(n){return '<button type="button" class="rstar" data-v="'+n+'" aria-label="'+n+' star">★</button>'}).join('')+'</div><span class="rate-msg" id="rateMsg"></span><span class="rate-note">One rating per device · tap again to change it</span></div></section>';

 const html='<!doctype html><html lang="en"><head>'
  +'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
  +'<title>'+escHtml(metaTitle)+'</title>'
  +'<meta name="description" content="'+escAttr(metaDesc)+'">'
  +'<meta name="keywords" content="'+escAttr(keywords)+'">'
  +'<meta name="robots" content="'+robots+'">'
  +'<link rel="canonical" href="'+canonical+'">'
  +'<meta property="og:type" content="music.song"><meta property="og:site_name" content="RingMang">'
  +'<meta property="og:title" content="'+escAttr(metaTitle)+'"><meta property="og:description" content="'+escAttr(metaDesc)+'">'
  +'<meta property="og:url" content="'+canonical+'"><meta property="og:image" content="'+ogImage+'">'
  +'<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
  +'<meta property="music:musician" content="'+escAttr(artist||"RingMang")+'">'
  +(dIso?'<meta property="music:duration" content="'+row.duration_seconds+'">':'')
  +'<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="'+escAttr(metaTitle)+'"><meta name="twitter:description" content="'+escAttr(metaDesc)+'"><meta name="twitter:image" content="'+ogImage+'">'
  +'<meta name="theme-color" content="#071417"><link rel="manifest" href="/manifest.webmanifest"><link rel="icon" type="image/svg+xml" href="/icon.svg"><link rel="apple-touch-icon" href="/icon.svg">'
  +'<script src="/config.js"></script>'
  +'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
  +'<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Outfit:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">'
  +'<script type="application/ld+json">'+safeJson(music)+'</script><script type="application/ld+json">'+safeJson(bc)+'</script>'
  +'<style>'+CSS+'</style></head><body>'
  +'<div class="stage"></div>'
  +'<div id="rm-data" class="hidden" data-id="'+escAttr(row.id)+'" data-canon="'+escAttr(canonical)+'" data-supa="'+escAttr(SUPA)+'" data-key="'+escAttr(KEY)+'" data-title="'+escAttr(title)+'"></div>'
  +'<header class="top"><div class="wrap top-in"><a class="brand" href="'+origin+'/"><div class="eqm" aria-hidden="true"><span></span><span></span><span></span><span></span></div><span class="wm">Ring<span class="c">Mang</span></span></a><nav class="crumb" aria-label="Breadcrumb"><a href="'+origin+'/">Home</a><span class="sep">/</span>'+(catSlug?'<a href="'+origin+'/category/'+enc(catSlug)+'">'+escHtml(category)+'</a><span class="sep">/</span>':'')+'<span class="now">'+escHtml(title)+'</span></nav><a class="browse" href="'+origin+'/#library">Browse all</a></div></header>'
  +(ticker?'<div class="tick"><div class="tick-in">'+ticker+ticker+'</div></div>':'')
  +'<main class="wrap"><section class="hero">'
  +'<div>'
  +'<div class="kicker"><span class="live"></span><span class="ktxt">'+(isCopy?"© Copyrighted clip":"Original · royalty-free")+'</span>'+(category?'<a class="chip" href="'+origin+'/category/'+enc(catSlug)+'">'+escHtml(category)+'</a>':'')+(row.genre?'<span class="chip">'+escHtml(row.genre)+'</span>':'')+'</div>'
  +'<h1>'+escHtml(title)+'<svg class="squig" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10 Q 75 2, 150 9 T 297 6" fill="none" stroke="#ffd166" stroke-width="4" stroke-linecap="round"/></svg></h1>'
  +'<p class="byline">by '+(artist?'<a href="'+origin+'/artist/'+enc(artistSlug)+'">'+escHtml(artist)+'</a>':escHtml("Unknown Artist"))+'</p>'
  +'<p class="desc">'+escHtml(metaDesc)+'</p>'
  +'<div class="stats"><span class="dl">⬇ <b id="dlcount" data-n="'+dl+'">0</b> downloads</span><span>· '+fbytes(row.file_size_bytes)+'</span><span>· '+ext.toUpperCase()+'</span>'+(dLabel?'<span>· '+dLabel+'</span>':'')+(rCnt>0?'<span>· ★ '+rAvg.toFixed(1)+' ('+rCnt+')</span>':'')+'</div>'
  +'<div class="ctrls"><button id="play" class="play" aria-label="Play preview">▶</button><button id="dlbtn" class="btn dl">⬇ Download</button><div id="dlcd" class="dlcd hidden"><svg viewBox="0 0 40 40"><circle class="rb" cx="20" cy="20" r="18"/><circle id="dlf" class="rf" cx="20" cy="20" r="18"/></svg><span id="dln" class="n"></span></div><button id="shbtn" class="btn sh">⤴ Share</button></div>'
  +verdictHtml
  +'</div>'
  +'<div class="vizcard"><div class="viztop"><div class="vinyl" aria-hidden="true"></div><div class="vizsig">now spinning<b>'+escHtml(title.length>22?title.slice(0,21)+"…":title)+'</b></div></div><div id="viz" class="viz" aria-hidden="true">'+waveBars(hashStr(title),22)+'</div><div class="seek"><span id="cur" class="tm">0:00</span><input id="seek" class="rng" type="range" min="0" max="100" value="0" step="0.1" aria-label="Seek"><span id="dur" class="tm">0:00</span></div><div class="vol"><span style="font-size:.85rem">🔊</span><input id="vol" class="rng" type="range" min="0" max="1" step="0.01" value="1" aria-label="Volume"></div></div>'
  +'</section>'
  +(related.length?'<section class="rail"><h2><span class="bar"></span>More like this</h2><div class="scroller">'+rcards(related)+'</div></section>':'')
  +(artistTracks.length?'<section class="rail"><h2><span class="bar" style="background:#4cc9f0;box-shadow:0 0 8px rgba(76,201,240,.6)"></span>More from '+escHtml(artist)+'</h2><div class="scroller">'+rcards(artistTracks)+'</div></section>':'')
  +'</main>'
  +'<footer class="foot"><div class="wrap foot-in"><div class="wm2">Ring<span style="color:#ff6b4a">Mang</span></div><p><strong style="color:#7c8d90">Copyright &amp; DMCA:</strong> RingMang respects intellectual property rights. Content marked © Copyrighted is shared for preview and promotional purposes. If you believe your copyright has been infringed, submit a DMCA takedown request and we will promptly review it. <a href="'+origin+'/">RingMang home</a></p></div></footer>'
  +'<audio id="pa" preload="none" crossorigin="anonymous"></audio>'
  +'<script>'+CORE+'</script>'
  +'<script>'+RATING+'</script>'
  +'<script>'+REVEAL+'</script>'
  +'</body></html>';
 return new Response(html,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"public, max-age=60, s-maxage=120, stale-while-revalidate=300"}});
}
// RM14C2_RINGTONE_END
