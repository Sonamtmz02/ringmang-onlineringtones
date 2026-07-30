/**
 * RingMang — /gsc  (Phase 9D-3) OWNER GUIDE: Google Search Console setup (Nepali, beginner).
 * noindex (owner-only doc). Alive: faux URL-inspection terminal, method toggle, copy chips,
 * localStorage progress checklist, count-up coverage (partly real: indexable vs noindex counts).
 */
const escHtml=(s)=>String(s==null?"":s).replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const escAttr=(s)=>String(s==null?"":s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
async function headCount(SUPA,KEY,extra){const r=await fetch(SUPA+"/rest/v1/ringtones?"+extra,{headers:{apikey:KEY,Authorization:"Bearer "+KEY,Prefer:"count=exact",Range:"0-0"}});if(!r.ok)return 0;return parseInt(r.headers.get("content-range")?.split("/")[1]||"0",10)||0}
async function headCountTbl(SUPA,KEY,tbl,extra){const r=await fetch(SUPA+"/rest/v1/"+tbl+"?"+extra,{headers:{apikey:KEY,Authorization:"Bearer "+KEY,Prefer:"count=exact",Range:"0-0"}});if(!r.ok)return 0;return parseInt(r.headers.get("content-range")?.split("/")[1]||"0",10)||0}

const CSS=`
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
body{font-family:"Outfit",system-ui,sans-serif;background:#071417;color:#dbe4e6;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
.stage{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 58% 48% at 8% -8%,rgba(52,211,153,.13),transparent 60%),radial-gradient(ellipse 52% 46% at 94% 6%,rgba(251,191,36,.10),transparent 60%),radial-gradient(ellipse 60% 50% at 70% 110%,rgba(76,201,240,.08),transparent 60%),linear-gradient(rgba(255,255,255,.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.013) 1px,transparent 1px);background-size:100% 100%,100% 100%,100% 100%,44px 44px,44px 44px}
a{color:inherit}.wrap{position:relative;z-index:1;max-width:960px;margin:0 auto;padding:0 1.1rem}
.top{position:sticky;top:0;z-index:30;background:rgba(7,20,23,.82);backdrop-filter:blur(10px);border-bottom:1px solid rgba(30,58,64,.6)}
.top-in{display:flex;align-items:center;justify-content:space-between;gap:1rem;height:3.4rem}
.brand{display:flex;align-items:center;gap:.6rem;text-decoration:none}
.eqm{display:flex;align-items:flex-end;gap:2.5px;height:18px}.eqm span{width:3px;border-radius:2px;transform-origin:bottom;animation:eqb .9s ease-in-out infinite}
.eqm span:nth-child(1){background:#ff6b4a;height:60%}.eqm span:nth-child(2){background:#ffd166;height:100%;animation-delay:.15s}.eqm span:nth-child(3){background:#3ddc97;height:45%;animation-delay:.3s}.eqm span:nth-child(4){background:#4cc9f0;height:80%;animation-delay:.45s}
@keyframes eqb{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
.wm{font-family:"Unbounded",sans-serif;font-weight:800;font-size:1.05rem;color:#fff;letter-spacing:-.01em}.wm .c{color:#ff6b4a}
.pill{display:inline-flex;align-items:center;gap:.45rem;font-family:"Space Mono",monospace;font-size:.58rem;letter-spacing:.14em;text-transform:uppercase;color:#fbbf24;border:1px solid rgba(251,191,36,.4);border-radius:2rem;padding:.3rem .7rem}
.pill .d{width:7px;height:7px;border-radius:50%;background:#fbbf24;box-shadow:0 0 8px rgba(251,191,36,.8);animation:lp 1.6s ease-in-out infinite}@keyframes lp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
/* faux URL-inspection terminal (opener motif) */
.term{position:relative;margin:2.4rem 0 1.6rem;border:1px solid #1e3a40;border-radius:.9rem;overflow:hidden;background:#0a0f14;box-shadow:0 24px 60px rgba(0,0,0,.5)}
.term-bar{display:flex;align-items:center;gap:.5rem;padding:.6rem .9rem;background:#10151c;border-bottom:1px solid #1e3a40}
.term-bar .dot{width:10px;height:10px;border-radius:50%}.term-bar .dot.r{background:#fb7185}.term-bar .dot.y{background:#fbbf24}.term-bar .dot.g{background:#3ddc97}
.term-bar .ttl{margin-left:.5rem;font-family:"Space Mono",monospace;font-size:.62rem;letter-spacing:.12em;color:#6b7280;text-transform:uppercase}
.term-body{padding:1.1rem 1.1rem 1.3rem;font-family:"Space Mono",monospace;font-size:.78rem;line-height:1.9}
.term-body .pr{color:#4b5563}.term-body .url{color:#cdd8da;word-break:break-all}
.term-body .ok{color:#3ddc97}.term-body .lbl{color:#6b7280}
.cursor{display:inline-block;width:8px;height:1.05em;background:#3ddc97;vertical-align:-2px;animation:blink 1s steps(1) infinite;margin-left:2px}@keyframes blink{50%{opacity:0}}
.kicker{font-family:"Space Mono",monospace;font-size:.66rem;letter-spacing:.26em;text-transform:uppercase;color:#34d399;margin-bottom:.9rem;display:flex;align-items:center;gap:.6rem}
.kicker .ln{flex:0 0 36px;height:2px;background:linear-gradient(90deg,#34d399,transparent);border-radius:2px}
h1{font-family:"Unbounded",sans-serif;font-weight:800;font-size:clamp(2.2rem,7vw,4rem);line-height:1.02;color:#fff;letter-spacing:-.03em;max-width:15ch}
h1 em{font-style:normal;color:#ffd166}
.lede{margin-top:1.1rem;color:#84969a;font-size:1.02rem;line-height:1.65;max-width:56ch}
.lede code{font-family:"Space Mono",monospace;font-size:.86em;background:#102226;border:1px solid #1e3a40;color:#4cc9f0;padding:.05rem .4rem;border-radius:.3rem}
/* coverage strip (partly real) */
.cov{margin-top:1.8rem;display:grid;grid-template-columns:repeat(3,1fr);gap:.8rem}
@media(max-width:560px){.cov{grid-template-columns:1fr}}
.cst{position:relative;background:linear-gradient(180deg,#10151c,#0c1117);border:1px solid #1e3a40;border-radius:.85rem;padding:1rem 1.1rem;overflow:hidden;transition:transform .25s,border-color .25s,box-shadow .25s}
.cst:hover{transform:translateY(-3px);border-color:#2e3a4a;box-shadow:0 12px 30px rgba(0,0,0,.45)}
.cst::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--cc,#3ddc97);box-shadow:0 0 10px var(--cc,#3ddc97)}
.cst b{display:block;font-family:"Space Mono",monospace;font-size:1.9rem;font-weight:700;color:#fff;line-height:1}
.cst span{display:block;margin-top:.35rem;font-family:"Space Mono",monospace;font-size:.56rem;letter-spacing:.14em;text-transform:uppercase;color:#6b7280}
.cov-note{margin-top:.7rem;font-family:"Space Mono",monospace;font-size:.62rem;color:#4b5563;text-align:center}
/* progress */
.prog{margin-top:2.2rem;background:#10151c;border:1px solid #1e3a40;border-radius:.9rem;padding:1.1rem 1.2rem}
.prog-top{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:.8rem}
.prog-top .t{font-family:"Unbounded",sans-serif;font-weight:700;font-size:.92rem;color:#fff}
.prog-top .p{font-family:"Space Mono",monospace;font-size:.8rem;color:#34d399}
.prog-track{height:8px;background:#1a222d;border-radius:4px;overflow:hidden}
.prog-fill{height:100%;width:0;background:linear-gradient(90deg,#34d399,#4cc9f0);border-radius:4px;transition:width .5s cubic-bezier(.4,0,.2,1)}
.checks{margin-top:1rem;display:flex;flex-direction:column;gap:.5rem}
.check-row{display:flex;align-items:center;gap:.7rem;padding:.55rem .7rem;border:1px solid #1e3a40;border-radius:.6rem;cursor:pointer;transition:all .2s;opacity:.92}
.check-row:hover{border-color:#2e3a4a;background:#13191f}
.check-row.done{opacity:.55;border-color:rgba(52,211,153,.3)}
.check-row.done .ct{ text-decoration:line-through;color:#6b7280}
.cbox{width:20px;height:20px;border-radius:5px;border:2px solid #2e3a4a;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.7rem;color:transparent;transition:all .2s}
.check-row.done .cbox{background:#34d399;border-color:#34d399;color:#071417}
.ct{font-size:.84rem;color:#cdd8da}
/* steps */
.sec-h{font-family:"Unbounded",sans-serif;font-size:.95rem;font-weight:700;color:#fff;margin:2.6rem 0 1rem;display:flex;align-items:center;gap:.5rem}.sec-h .bar{width:4px;height:1.1rem;border-radius:2px;background:#ffd166;box-shadow:0 0 8px rgba(255,209,102,.6)}
.step{position:relative;display:grid;grid-template-columns:3.4rem 1fr;gap:1.1rem;background:#102226;border:1px solid #1e3a40;border-radius:1rem;padding:1.3rem 1.3rem 1.4rem;overflow:hidden;margin-bottom:1rem;transition:transform .25s,border-color .25s,box-shadow .25s;opacity:0;transform:translateY(18px)}
.step.revealed{opacity:1;transform:translateY(0);transition:opacity .55s ease,transform .55s ease,transform .25s,border-color .25s,box-shadow .25s}
.step::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--sc,#34d399);box-shadow:0 0 12px var(--sc,#34d399)}
.step:hover{transform:translateY(-3px);border-color:#2a4d55;box-shadow:0 14px 34px rgba(0,0,0,.45)}
.snum{font-family:"Unbounded",sans-serif;font-weight:800;font-size:2.1rem;line-height:1;color:var(--sc,#34d399);opacity:.85}
.sbody h3{font-family:"Unbounded",sans-serif;font-weight:700;font-size:1.05rem;color:#fff;margin-bottom:.5rem}
.sbody p{font-size:.9rem;color:#9fb0b3;line-height:1.65;margin-bottom:.6rem}
.sbody p code,.li code{font-family:"Space Mono",monospace;font-size:.84em;background:#0a0f14;border:1px solid #1e3a40;color:#4cc9f0;padding:.05rem .4rem;border-radius:.3rem}
.li{font-size:.88rem;color:#9fb0b3;line-height:1.7;margin:.2rem 0 .2rem .2rem;padding-left:1.1rem;position:relative}
.li::before{content:"";position:absolute;left:.1rem;top:.62rem;width:6px;height:6px;border-radius:50%;background:var(--sc,#34d399)}
/* method toggle */
.mtabs{display:inline-flex;gap:.3rem;background:#0a0f14;border:1px solid #1e3a40;border-radius:.7rem;padding:.3rem;margin:.4rem 0 .8rem}
.mtab{font-family:"Space Mono",monospace;font-size:.68rem;font-weight:700;letter-spacing:.04em;color:#9ca3af;background:transparent;border:none;border-radius:.5rem;padding:.5rem .8rem;cursor:pointer;transition:all .2s}
.mtab.on{background:#34d399;color:#071417;box-shadow:0 2px 10px rgba(52,211,153,.35)}
.mpanel{display:none;animation:fade .3s ease-out}.mpanel:not(.hidden){display:block}@keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
/* copy chips */
.copyrow{display:flex;align-items:stretch;gap:.5rem;margin:.6rem 0;flex-wrap:wrap}
.copyval{flex:1;min-width:200px;font-family:"Space Mono",monospace;font-size:.74rem;color:#cdd8da;background:#0a0f14;border:1px solid #1e3a40;border-radius:.5rem;padding:.6rem .7rem;word-break:break-all;display:flex;align-items:center}
.copybtn{font-family:"Space Mono",monospace;font-size:.64rem;font-weight:700;letter-spacing:.08em;color:#9fb0b3;background:#1a222d;border:1px solid #2e3a4a;border-radius:.5rem;padding:.6rem .8rem;cursor:pointer;transition:all .2s;white-space:nowrap;align-self:stretch}
.copybtn:hover{color:#071417;background:#4cc9f0;border-color:#4cc9f0}
.copybtn.copied{background:#34d399;border-color:#34d399;color:#071417}
.warn{margin-top:.7rem;font-family:"Space Mono",monospace;font-size:.72rem;color:#fbbf24;line-height:1.6;border-left:2px solid rgba(251,191,36,.5);padding:.3rem 0 .3rem .8rem}
.honest{margin:1.4rem 0 2.6rem;background:linear-gradient(180deg,#10151c,#0c1117);border:1px solid rgba(251,191,36,.3);border-radius:1rem;padding:1.2rem 1.3rem}
.honest h4{font-family:"Unbounded",sans-serif;font-weight:700;font-size:.92rem;color:#fbbf24;margin-bottom:.6rem;display:flex;align-items:center;gap:.5rem}
.honest p{font-size:.86rem;color:#9fb0b3;line-height:1.7}
.honest p+p{margin-top:.5rem}
.foot{position:relative;z-index:1;border-top:1px solid rgba(20,38,42,.8)}.foot-in{padding:1.6rem 0 2.2rem;display:flex;flex-wrap:wrap;gap:.4rem 1.2rem}.foot a{color:#7c8d90;text-decoration:none;font-family:"Space Mono",monospace;font-size:.72rem}.foot a:hover{color:#ff6b4a}
.toast{position:fixed;bottom:1.4rem;left:50%;transform:translateX(-50%) translateY(14px);background:#152a2f;border:1px solid #2a4d55;color:#e5e7eb;padding:.7rem 1.2rem;border-radius:.7rem;font-size:.82rem;z-index:60;box-shadow:0 10px 30px rgba(0,0,0,.5);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s}.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
`;

const CLIENT=`
(function(){
 function toast(m){var t=document.getElementById("toast");if(!t){t=document.createElement("div");t.id="toast";document.body.appendChild(t)}t.textContent=m;t.classList.add("show");clearTimeout(window.__gt);window.__gt=setTimeout(function(){t.classList.remove("show")},2200)}
 function fallback(v){var ta=document.createElement("textarea");ta.value=v;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();try{document.execCommand("copy")}catch(e){}ta.remove()}
 document.querySelectorAll("[data-copy]").forEach(function(b){b.addEventListener("click",function(){var v=b.getAttribute("data-copy")||"";function done(){var old=b.getAttribute("data-label")||b.textContent;b.textContent="copied \\u2713";b.classList.add("copied");setTimeout(function(){b.textContent=old;b.classList.remove("copied")},1400);toast("Copied to clipboard")}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(v).then(done).catch(function(){fallback(v);done()})}else{fallback(v);done()}})});
 var tabs=document.querySelectorAll("[data-method-tab]");var panels=document.querySelectorAll("[data-method-panel]");
 tabs.forEach(function(t){t.addEventListener("click",function(){tabs.forEach(function(x){x.classList.remove("on")});t.classList.add("on");var m=t.getAttribute("data-method-tab");panels.forEach(function(p){p.classList.toggle("hidden",p.getAttribute("data-method-panel")!==m)})})});
 function cup(el,tgt){if(!el)return;var st=performance.now();(function tk(now){var p=Math.min((now-st)/1300,1);el.textContent=Math.round(tgt*(1-Math.pow(1-p,3))).toLocaleString();if(p<1)requestAnimationFrame(tk)})(st)}
 document.querySelectorAll("[data-cup]").forEach(function(el){cup(el,parseInt(el.getAttribute("data-cup"),10)||0)});
 if("IntersectionObserver"in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("revealed");io.unobserve(e.target)}})},{threshold:.12});document.querySelectorAll(".step").forEach(function(x){io.observe(x)})}else{document.querySelectorAll(".step").forEach(function(x){x.classList.add("revealed")})}
 var KEY="rm_gsc_progress_v1";var state={};try{state=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){state={}}
 var checks=document.querySelectorAll("[data-check]");var bar=document.getElementById("gsc-bar");var pct=document.getElementById("gsc-pct");
 function render(){var done=0;checks.forEach(function(c){var k=c.getAttribute("data-check");var on=!!state[k];var row=c.closest(".check-row");if(row)row.classList.toggle("done",on);var box=row?row.querySelector(".cbox"):null;if(box)box.textContent=on?"\\u2713":"";if(on)done++});var p=checks.length?Math.round(done/checks.length*100):0;if(bar)bar.style.width=p+"%";if(pct)pct.textContent=p+"%"}
 checks.forEach(function(c){var row=c.closest(".check-row");if(row)row.addEventListener("click",function(){var k=c.getAttribute("data-check");state[k]=!state[k];try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}render();if(state[k])toast("Step marked done \\u2713")})});
 render();
})();
`;

export async function onRequestGet(context){
  const { env } = context;
  const origin = new URL(context.request.url).origin;
  const host = new URL(origin).host;
  const SUPA = env.SUPABASE_URL, KEY = env.SUPABASE_ANON_KEY;
  const sitemapUrl = origin + "/sitemap.xml";
  const metaTpl = '<meta name="google-site-verification" content="YOUR_TOKEN_FROM_GSC" />';

  // partly-real coverage numbers
  let idx = 1, nox = 0;
  if (SUPA && KEY) {
    const ri = await headCount(SUPA, KEY, "select=id&seo_noindex=eq.false");
    const ci = await headCountTbl(SUPA, KEY, "categories", "select=id&seo_noindex=eq.false");
    const ai = await headCountTbl(SUPA, KEY, "artists", "select=id&seo_noindex=eq.false");
    const rn = await headCount(SUPA, KEY, "select=id&seo_noindex=eq.true");
    const cn = await headCountTbl(SUPA, KEY, "categories", "select=id&seo_noindex=eq.true");
    const an = await headCountTbl(SUPA, KEY, "artists", "select=id&seo_noindex=eq.true");
    idx = 1 + ri + ci + ai; nox = rn + cn + an;
  }

  const copyChip = (label, val) => '<div class="copyrow"><span class="copyval">' + escHtml(val) + '</span><button class="copybtn" data-label="' + escAttr(label) + '" data-copy="' + escAttr(val) + '">' + escHtml(label) + '</button></div>';

  const steps =
    // 01
    '<div class="step" style="--sc:#34d399"><div class="snum">01</div><div class="sbody"><h3>Property थप्नुहोस् (URL prefix)</h3>'
    + '<p><code>search.google.com/search-console</code> खोल्नुहोस् → माथि बायाँ <b>“Add property”</b> → <b>“URL prefix”</b> छान्नुहोस् → तपाईंको पूरै Pages URL हाल्नुहोस्:</p>'
    + copyChip("COPY URL", origin + "/")
    + '<p class="li">त्यसपछि <b>Continue</b> थिच्नुहोस् — verify गर्ने screen आउँछ (step 02)।</p></div></div>'
    // 02
    + '<div class="step" style="--sc:#4cc9f0"><div class="snum">02</div><div class="sbody"><h3>Verify गर्नुहोस् — दुई विधि</h3>'
    + '<p>तल दुई विधि छन्। <b>DNS TXT</b> recommended छ (code छुनु पर्दैन, Cloudflare बाटै हुन्छ)। जुन मन पर्छ त्यो tab छान्नुहोस्:</p>'
    + '<div class="mtabs"><button class="mtab on" data-method-tab="dns">DNS TXT (recommended)</button><button class="mtab" data-method-tab="meta">HTML meta tag</button></div>'
    + '<div class="mpanel" data-method-panel="dns">'
    + '<p class="li">Cloudflare dashboard → तपाईंको domain → बायाँ <b>DNS</b> → <b>Add record</b>।</p>'
    + '<p class="li">Type = <code>TXT</code> · Name = <code>@</code> (वा तपाईंको host) · Value = GSC ले दिएको <code>google-site-verification=...</code> string paste गर्नुहोस् · TTL = Auto · <b>Save</b>।</p>'
    + '<p class="li">Name field को लागि तपाईंको host (पूरै domain वा <code>@</code>):</p>'
    + copyChip("COPY HOST", host)
    + '<p class="li">१–२ मिनेट पछि GSC मा फर्केर <b>Verify</b> थिच्नुहोस्।</p>'
    + '<div class="warn">⚠ DNS propagate हुन केही मिनेट लाग्न सक्छ। पहिलो पटक fail भए 5 मिनेट पर्खेर फेरि Verify गर्नुहोस्।</div></div>'
    + '<div class="mpanel hidden" data-method-panel="meta">'
    + '<p class="li">GSC ले दिएको meta tag (यस्तो देखिन्छ) copy गर्नुहोस्। तल template छ — <code>YOUR_TOKEN_FROM_GSC</code> को ठाउँमा GSC को token राख्नुहोस्:</p>'
    + copyChip("COPY TEMPLATE", metaTpl)
    + '<p class="li">GitHub → <code>ringmang-onlineringtones</code> → <code>index.html</code> → पेन्सिल ✏️ → <code>&lt;head&gt;</code> खोज्नुहोस् → त्यसको <b>ठिक तल</b> यो meta tag paste गर्नुहोस् → Commit।</p>'
    + '<p class="li">Deploy (१–२ मिनेट) पछि GSC मा <b>Verify</b> थिच्नुहोस्।</p>'
    + '<div class="warn">⚠ Meta tag विधि प्रयोग गर्दा token लाई कहिल्यै public repo मा “secret” जस्तो नसम्झिनुहोस् — यो verification token हो, तर DNS विधि नै clean छ।</div></div>'
    + '</div></div>'
    // 03
    + '<div class="step" style="--sc:#ffd166"><div class="snum">03</div><div class="sbody"><h3>Sitemap submit गर्नुहोस्</h3>'
    + '<p>Verify भएपछि बायाँ मेनु → <b>Sitemaps</b> → “Add a new sitemap” मा तलको URL हाल्नुहोस् → <b>Submit</b>:</p>'
    + copyChip("COPY SITEMAP", sitemapUrl)
    + '<p class="li">Submit पछि status <b>“Success”</b> देखिनुपर्छ। Google ले अब sitemap पढेर URL हरू crawl गर्न थाल्छ।</p>'
    + '<p class="li">हाम्रो sitemap एउटा <i>index</i> हो जसले child maps (ringtones + taxonomy) लाई point गर्छ — त्यसैले एउटै URL ले सबै cover गर्छ।</p></div></div>'
    // 04
    + '<div class="step" style="--sc:#fb923c"><div class="snum">04</div><div class="sbody"><h3>Coverage report बुझ्नुहोस्</h3>'
    + '<p>बायाँ मेनु → <b>Pages</b> (Coverage) मा चार स्थिति देखिन्छन्:</p>'
    + '<p class="li"><b style="color:#34d399">Valid (Indexed)</b> = Google ले index गर्यो — राम्रो।</p>'
    + '<p class="li"><b style="color:#fbbf24">Excluded</b> = जानाजान index नगरिएका — जस्तै <code>noindex</code> भएका track/category/artist, वा <code>canonical</code> ले अर्को URL मा point गरेका। यो <i>error होइन</i>, हाम्रो design नै हो।</p>'
    + '<p class="li"><b style="color:#fb7185">Error</b> = fix गर्नुपर्ने (जस्तै 404/5xx)। हाम्रो server-rendered pages मा 404 branded छ, त्यसैले सामान्यतया error हुँदैन।</p>'
    + '<p class="li"><b style="color:#9ca3af">“Discovered – currently not indexed”</b> = Google ले भेट्यो तर अझै index गरेन — नयाँ site मा सामान्य। हामीले बनाएका <i>internal links</i> (related/artist/category rails) ले यसलाई घटाउँछन्; धैर्य + नियमित content ले सुधार्छ।</p></div></div>'
    // 05
    + '<div class="step" style="--sc:#fb7185"><div class="snum">05</div><div class="sbody"><h3>URL Inspection tool प्रयोग गर्नुहोस्</h3>'
    + '<p>माथिको search bar मा कुनै track URL (जस्तै <code>' + escHtml(origin) + '/ringtone/...</code>) हाल्नुहोस् → Enter → <b>“Live test”</b> थिच्नुहोस्।</p>'
    + '<p class="li">“View tested page” → <b>“More info” / “Screenshot”</b> मा server-rendered HTML, meta tags, र JSON-LD schema देखिनुपर्छ (हाम्रो universal render को प्रमाण)।</p>'
    + '<p class="li">यदि “Page not indexed” भन्छ भने <b>“Request indexing”</b> थिच्न सक्नुहुन्छ (एउटा URL प्रति दिन limit)।</p></div></div>';

  const checks =
    '<div class="check-row" data-check-wrap><span class="cbox"></span><span class="ct" data-check="s1">01 · Property थपियो</span></div>'
    + '<div class="check-row"><span class="cbox"></span><span class="ct" data-check="s2">02 · Verify भयो</span></div>'
    + '<div class="check-row"><span class="cbox"></span><span class="ct" data-check="s3">03 · Sitemap submit भयो</span></div>'
    + '<div class="check-row"><span class="cbox"></span><span class="ct" data-check="s4">04 · Coverage report हेरियो</span></div>'
    + '<div class="check-row"><span class="cbox"></span><span class="ct" data-check="s5">05 · URL Inspection test गरियो</span></div>';

  const html = '<!doctype html><html lang="ne"><head>'
    + '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>Google Search Console Setup · RingMang Owner Guide</title>'
    + '<meta name="description" content="RingMang लाई Google मा index गर्ने चरणबद्ध गाइड — verify, sitemap submit, coverage report (Nepali).">'
    + '<meta name="robots" content="noindex,nofollow"><link rel="canonical" href="' + origin + '/">'
    + '<meta name="theme-color" content="#071417"><link rel="icon" type="image/svg+xml" href="/icon.svg">'
    + '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    + '<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Outfit:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">'
    + '<style>' + CSS + '</style></head><body>'
    + '<div class="stage"></div>'
    + '<header class="top"><div class="wrap top-in"><a class="brand" href="' + origin + '/"><div class="eqm" aria-hidden="true"><span></span><span></span><span></span><span></span></div><span class="wm">Ring<span class="c">Mang</span></span></a><span class="pill"><span class="d"></span>owner guide · noindex</span></div></header>'
    + '<main class="wrap">'
    + '<div class="term" aria-hidden="true"><div class="term-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="ttl">url inspection · preview</span></div><div class="term-body"><div><span class="pr">$ inspect</span> <span class="url">' + escHtml(origin + '/') + '</span></div><div><span class="lbl">coverage …</span> <span class="ok">URL is on Google ✓</span></div><div><span class="lbl">rich results …</span> <span class="ok">MusicRecording detected ✓</span></div><div><span class="pr">$</span> <span class="cursor"></span></div></div></div>'
    + '<div class="kicker"><span class="ln"></span>GOOGLE SEARCH CONSOLE · SETUP</div>'
    + '<h1>Make Google <em>see</em> you.</h1>'
    + '<p class="lede">तपाईंको site को SEO foundation (server-rendered meta, schema, sitemap) तयार छ। अब Google लाई <i>बताउनु</i> बाँकी छ — “म यहाँ छु, crawl गर।” यो ५-चरण गाइड त्यही गर्छ। कुनै coding चाहिँदैन।</p>'
    + '<div class="cov"><div class="cst" style="--cc:#34d399"><b data-cup="' + idx + '">0</b><span>Index-eligible URLs</span></div><div class="cst" style="--cc:#fbbf24"><b data-cup="' + nox + '">0</b><span>Excluded (noindex)</span></div><div class="cst" style="--cc:#fb7185"><b>0</b><span>Errors (GSC मा हेर्नुहोस्)</span></div></div>'
    + '<p class="cov-note">पहिलो दुई संख्या तपाईंको DB बाट live छन्; “Errors” सधैं 0 देखाइएको छ — वास्तविक error GSC मा मात्र देखिन्छ।</p>'
    + '<div class="prog"><div class="prog-top"><span class="t">तपाईंको progress</span><span class="p"><span id="gsc-pct">0%</span></span></div><div class="prog-track"><div id="gsc-bar" class="prog-fill"></div></div><div class="checks">' + checks + '</div></div>'
    + '<h2 class="sec-h"><span class="bar"></span>चरणबद्ध गाइड</h2>'
    + steps
    + '<div class="honest"><h4>⚠ इमानदार अपेक्षा (पढ्नुहोस्)</h4>'
    + '<p>यो गाइड ले तपाईंको site लाई <b>technically indexable</b> बनाउँछ — जुन ranking को <i>necessary foundation</i> हो। तर <b>“कतै rank हुन्छ” भन्ने guarantee कसैले दिन सक्दैन</b>।</p>'
    + '<p>Ranking position यी कुरामा भर पर्छ: domain age, backlinks, content quality, user engagement, competition — जुन code भन्दा बाहिर छन्। नयाँ domain मा index हुन <b>केही दिन देखि केही हप्ता</b> लाग्न सक्छ; त्यो सामान्य हो।</p>'
    + '<p>हामीले जे बनाएका छौं — server-rendered meta, deep JSON-LD, sitemap index, internal-link web — त्यो <b>सही, दिगो SEO</b> हो। बाँकी समय र authority ले भर्छ।</p></div>'
    + '</main>'
    + '<footer class="foot"><div class="wrap foot-in"><a href="' + origin + '/sitemap.xml">/sitemap.xml</a><a href="' + origin + '/sitemap">/sitemap (human map)</a><a href="' + origin + '/robots.txt">/robots.txt</a><a href="' + origin + '/">home</a></div></footer>'
    + '<div id="toast" class="toast"></div>'
    + '<script>' + CLIENT + '</script></body></html>';

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=120, s-maxage=300" } });
}
// RM9D_GSC_END
