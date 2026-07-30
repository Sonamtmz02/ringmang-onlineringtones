/**
 * RingMang — /dmca  (Phase 14B) self-authored DMCA policy + WORKING takedown form.
 * Form -> dmca_reports (public insert). Honeypot + timing guard vs spam.
 * Insert-only (no id returned) -> success shows "received at <timestamp>".
 * Alive: layered ambient, § watermark, progress bar, scroll-reveal policy, process timeline,
 * focus-lit fields, char counter, gated checkboxes, submit morph, animated seal on success.
 */
const escHtml=(s)=>String(s==null?"":s).replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const UPDATED="2026-07-30";
const CSS=`*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:"Outfit",system-ui,sans-serif;background:#071417;color:#c7d2d6;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;line-height:1.72}
.progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:60;background:rgba(255,255,255,.04)}.progress-fill{height:100%;width:0;background:linear-gradient(90deg,#fb7185,#fbbf24,#3ddc97);box-shadow:0 0 10px rgba(251,113,133,.5);transition:width .12s linear}
.watermark{position:fixed;top:46%;right:-3vw;transform:translateY(-50%);font-family:"Space Mono",monospace;font-size:44vh;line-height:1;color:#fb7185;opacity:.035;z-index:0;pointer-events:none;user-select:none}
.stage{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 58% 48% at 8% -8%,rgba(251,113,133,.12),transparent 60%),radial-gradient(ellipse 52% 46% at 94% 106%,rgba(251,191,36,.09),transparent 60%),linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px);background-size:100% 100%,100% 100%,42px 42px,42px 42px}
a{color:inherit}.wrap{position:relative;z-index:1;max-width:980px;margin:0 auto;padding:0 1.2rem}
.top{position:sticky;top:0;z-index:40;background:rgba(7,20,23,.86);backdrop-filter:blur(10px);border-bottom:1px solid rgba(30,58,64,.6)}.top-in{display:flex;align-items:center;justify-content:space-between;gap:1rem;height:3.4rem}.brand{display:flex;align-items:center;gap:.6rem;text-decoration:none}
.eqm{display:flex;align-items:flex-end;gap:2.5px;height:18px}.eqm span{width:3px;border-radius:2px;transform-origin:bottom;animation:eqb .9s ease-in-out infinite}.eqm span:nth-child(1){background:#ff6b4a;height:60%}.eqm span:nth-child(2){background:#ffd166;height:100%;animation-delay:.15s}.eqm span:nth-child(3){background:#3ddc97;height:45%;animation-delay:.3s}.eqm span:nth-child(4){background:#4cc9f0;height:80%;animation-delay:.45s}@keyframes eqb{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
.wm{font-family:"Unbounded",sans-serif;font-weight:800;font-size:1.05rem;color:#fff;letter-spacing:-.01em}.wm .c{color:#ff6b4a}.back{font-family:"Space Mono",monospace;font-size:.66rem;letter-spacing:.08em;color:#9fb0b3;text-decoration:none;border:1px solid #2a4d55;border-radius:2rem;padding:.35rem .8rem;transition:all .2s;white-space:nowrap}.back:hover{color:#071417;background:#fb7185;border-color:#fb7185}
.opener{padding:2.6rem 0 .8rem}.kicker{font-family:"Space Mono",monospace;font-size:.64rem;letter-spacing:.26em;text-transform:uppercase;color:#fb7185;margin-bottom:.9rem;display:flex;align-items:center;gap:.6rem}.kicker .ln{flex:0 0 34px;height:2px;background:linear-gradient(90deg,#fb7185,transparent);border-radius:2px}
h1{font-family:"Unbounded",sans-serif;font-weight:800;font-size:clamp(2.1rem,7.4vw,3.6rem);line-height:1.04;color:#fff;letter-spacing:-.025em}.lede{margin-top:1rem;color:#9fb0b3;font-size:1.02rem;max-width:64ch}
.meta-row{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1.2rem}.meta-pill{display:inline-flex;align-items:center;gap:.45rem;font-family:"Space Mono",monospace;font-size:.6rem;letter-spacing:.08em;color:#7f9099;border:1px solid #1e3a40;border-radius:2rem;padding:.32rem .7rem}.meta-pill .d{width:7px;height:7px;border-radius:50%;background:#fb7185;box-shadow:0 0 7px rgba(251,113,133,.7)}.meta-pill b{color:#cdd8da;font-weight:700}
.grid2{display:grid;grid-template-columns:1fr;gap:1.4rem;margin-top:1.8rem}@media(min-width:860px){.grid2{grid-template-columns:1.35fr 1fr;align-items:start}}
.card{position:relative;background:linear-gradient(180deg,#10151c,#0c1117);border:1px solid #1e3a40;border-radius:1rem;padding:1.4rem 1.3rem;overflow:hidden;opacity:0;transform:translateY(18px)}.card.revealed{opacity:1;transform:translateY(0);transition:opacity .55s ease,transform .55s ease}
.card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--ac,#fb7185);box-shadow:0 0 12px var(--ac,#fb7185)}
.card h2{font-family:"Unbounded",sans-serif;font-weight:700;font-size:1.05rem;color:#fff;margin-bottom:.3rem}.card .sub{font-size:.82rem;color:#7f9099;margin-bottom:1.1rem}
.field{margin-bottom:1rem}.field label{display:block;font-family:"Space Mono",monospace;font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:#9ca3af;margin-bottom:.45rem}
.req{color:#fb7185}.field .inp{position:relative}
.field input,.field textarea,.field select{width:100%;background:#0a0f14;border:1px solid #232d3a;border-left:3px solid #232d3a;border-radius:.55rem;color:#dbe4e6;font-family:"Outfit",sans-serif;font-size:.92rem;padding:.7rem .8rem;outline:none;transition:border-color .2s,box-shadow .2s,border-left-color .2s}
.field textarea{resize:vertical;min-height:96px;line-height:1.6}
.field input:focus,.field textarea:focus,.field select:focus{border-color:#fb7185;border-left-color:#fb7185;box-shadow:0 0 0 3px rgba(251,113,133,.12)}
.field input.bad,.field textarea.bad,.field select.bad{border-color:#fb7185;border-left-color:#fb7185}
.field .hint{font-size:.7rem;color:#56676a;margin-top:.35rem}.field .err{display:none;font-size:.7rem;color:#fb7185;margin-top:.35rem}.field.invalid .err{display:block}
.counter{font-family:"Space Mono",monospace;font-size:.62rem;color:#56676a;text-align:right;margin-top:.3rem}.counter.warn{color:#fbbf24}.counter.over{color:#fb7185}
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;opacity:0}
.check{display:flex;align-items:flex-start;gap:.65rem;margin:.7rem 0;cursor:pointer}.check input{margin-top:.2rem;width:18px;height:18px;accent-color:#fb7185;flex-shrink:0}.check span{font-size:.82rem;color:#9fb0b3;line-height:1.5}
.submit{width:100%;margin-top:.6rem;display:flex;align-items:center;justify-content:center;gap:.6rem;padding:.85rem 1rem;border:none;border-radius:.6rem;background:#fb7185;color:#071417;font-family:"Unbounded",sans-serif;font-weight:700;font-size:.86rem;cursor:pointer;transition:background .2s,transform .12s,opacity .2s;box-shadow:0 8px 24px rgba(251,113,133,.35)}
.submit:hover:not(:disabled){background:#fda4af;transform:translateY(-1px)}.submit:active:not(:disabled){transform:scale(.98)}.submit:disabled{opacity:.5;cursor:not-allowed}
.submit .sp{width:16px;height:16px;border:2px solid rgba(7,20,23,.35);border-top-color:#071417;border-radius:50%;animation:spin .7s linear infinite;display:none}@keyframes spin{to{transform:rotate(360deg)}}
.submit.loading .sp{display:inline-block}.submit.loading .lbl{opacity:.8}
.formerr{display:none;margin-top:.8rem;font-family:"Space Mono",monospace;font-size:.74rem;color:#fb7185;background:rgba(251,113,133,.1);border:1px solid rgba(251,113,133,.3);border-radius:.5rem;padding:.6rem .8rem}.formerr.show{display:block}
/* success */
.done{display:none;text-align:center;padding:.6rem 0}.done.show{display:block;animation:fade .4s ease-out}@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.seal{width:84px;height:84px;margin:0 auto 1rem}.seal circle{fill:none;stroke:#3ddc97;stroke-width:4;stroke-dasharray:226;stroke-dashoffset:226;animation:drawc .7s ease-out forwards}.seal path{fill:none;stroke:#3ddc97;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:48;stroke-dashoffset:48;animation:drawc .4s ease-out .55s forwards}@keyframes drawc{to{stroke-dashoffset:0}}
.done h3{font-family:"Unbounded",sans-serif;font-weight:700;font-size:1.2rem;color:#fff}.done .ref{font-family:"Space Mono",monospace;font-size:.72rem;color:#3ddc97;margin:.6rem 0}.done p{font-size:.86rem;color:#9fb0b3;max-width:42ch;margin:.4rem auto}.done .again{margin-top:1.1rem;font-family:"Space Mono",monospace;font-size:.7rem;color:#9fb0b3;background:#1a222d;border:1px solid #2e3a4a;border-radius:2rem;padding:.5rem 1rem;cursor:pointer;transition:all .2s}.done .again:hover{color:#071417;background:#3ddc97;border-color:#3ddc97}
/* timeline */
.tl{position:relative;padding-left:1.6rem}.tl-step{position:relative;padding-bottom:1.3rem}.tl-step:last-child{padding-bottom:0}.tl-step::before{content:"";position:absolute;left:-1.6rem;top:.15rem;width:14px;height:14px;border-radius:50%;background:#0a0f14;border:2px solid var(--ac,#fb7185);box-shadow:0 0 8px var(--ac,#fb7185);z-index:1}
.tl-step::after{content:"";position:absolute;left:calc(-1.6rem + 6px);top:1rem;bottom:-.2rem;width:2px;background:#1e3a40}.tl-step:last-child::after{display:none}
.tl-step h4{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:.9rem;color:#e5e7eb}.tl-step p{font-size:.8rem;color:#7f9099;margin-top:.2rem;line-height:1.55}
.valid-list{list-style:none;margin:.4rem 0}.valid-list li{position:relative;padding-left:1.3rem;margin:.4rem 0;font-size:.84rem;color:#9fb0b3}.valid-list li::before{content:"";position:absolute;left:.1rem;top:.55rem;width:7px;height:7px;border-radius:2px;background:#fbbf24;transform:rotate(45deg)}
/* policy */
.prose{padding:1.6rem 0 1rem}.sec{margin:0 0 1.7rem;scroll-margin-top:5.2rem;opacity:0;transform:translateY(16px)}.sec.revealed{opacity:1;transform:translateY(0);transition:opacity .55s ease,transform .55s ease}
.sec-h{display:flex;align-items:baseline;gap:.7rem;margin-bottom:.5rem}.sec-n{font-family:"Space Mono",monospace;font-size:.72rem;font-weight:700;color:#fb7185;flex-shrink:0}.sec.revealed .sec-n{animation:popn .5s cubic-bezier(.34,1.5,.64,1)}@keyframes popn{0%{transform:scale(.4);opacity:0}100%{transform:scale(1);opacity:1}}
.sec-h h2{font-family:"Unbounded",sans-serif;font-weight:700;font-size:1.1rem;color:#fff}.prose p{margin:.5rem 0;color:#9fb0b3}.prose strong{color:#dbe4e6}.prose a{color:#4cc9f0;text-decoration:none;border-bottom:1px dashed rgba(76,201,240,.4)}.prose a:hover{color:#7fd9f5}
.softnote{margin:1.4rem 0 .4rem;border-top:1px dashed #2a4d55;padding-top:1.1rem}.softnote p{font-family:"Space Mono",monospace;font-size:.72rem;color:#6b7280;line-height:1.7}.softnote b{color:#9fb0b3}
.totop{position:fixed;right:1.1rem;bottom:1.3rem;z-index:50;width:2.9rem;height:2.9rem;border-radius:50%;background:#152a2f;border:1px solid #2a4d55;color:#fb7185;font-size:1.1rem;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .3s,transform .3s,background .2s;box-shadow:0 8px 24px rgba(0,0,0,.5)}.totop.show{opacity:1;transform:translateY(0);pointer-events:auto}.totop:hover{background:#fb7185;color:#071417}
.foot{position:relative;z-index:1;border-top:1px solid rgba(20,38,42,.8);margin-top:1.5rem}.foot-in{max-width:980px;margin:0 auto;padding:1.6rem 1.2rem 2.4rem}.foot-links{display:flex;flex-wrap:wrap;gap:.5rem 1.2rem;margin-bottom:.8rem}.foot-links a{font-family:"Space Mono",monospace;font-size:.68rem;letter-spacing:.06em;color:#7c8d90;text-decoration:none;text-transform:uppercase;transition:color .2s}.foot-links a:hover{color:#ff6b4a}.foot-links a[aria-current="page"]{color:#fb7185}.foot p{font-size:.72rem;color:#56676a;line-height:1.6;max-width:64ch}`;
const CLIENT=`(function(){
 var CFG=window.RINGMANG_CONFIG||{};var SUPA=CFG.SUPABASE_URL,KEY=CFG.SUPABASE_ANON_KEY;
 var sb=(SUPA&&KEY&&window.supabase)?window.supabase.createClient(SUPA,KEY):null;
 var loadT=Date.now();
 var fill=document.getElementById("pf");
 function prog(){var h=document.documentElement;var max=h.scrollHeight-h.clientHeight;var p=max>0?(h.scrollTop/max)*100:0;if(fill)fill.style.width=p+"%";var t=document.getElementById("totop");if(t)t.classList.toggle("show",h.scrollTop>500)}
 window.addEventListener("scroll",prog,{passive:true});prog();
 var tt=document.getElementById("totop");if(tt)tt.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"})});
 if("IntersectionObserver"in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("revealed");io.unobserve(e.target)}})},{threshold:.12});document.querySelectorAll(".card,.sec").forEach(function(s){io.observe(s)})}else{document.querySelectorAll(".card,.sec").forEach(function(s){s.classList.add("revealed")})}
 var form=document.getElementById("dmcaform"),btn=document.getElementById("send"),formWrap=document.getElementById("formwrap"),doneBox=document.getElementById("donebox"),formErr=document.getElementById("formerr");
 var c1=document.getElementById("c1"),c2=document.getElementById("c2");
 var stmt=document.getElementById("statement"),stmtC=document.getElementById("stmtc");
 function gate(){if(btn)btn.disabled=!(c1&&c1.checked&&c2&&c2.checked)}
 if(c1)c1.addEventListener("change",gate);if(c2)c2.addEventListener("change",gate);gate();
 if(stmt&&stmtC){var upd=function(){var n=stmt.value.length;stmtC.textContent=n+" / 1500";stmtC.className="counter"+(n>1500?" over":(n>1200?" warn":""))};stmt.addEventListener("input",upd);upd()}
 var EMAIL=/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
 function setBad(id,bad){var f=document.getElementById(id);if(!f)return;var w=f.closest(".field");f.classList.toggle("bad",bad);if(w)w.classList.toggle("invalid",bad)}
 function showDone(){if(formWrap)formWrap.style.display="none";if(doneBox){var r=document.getElementById("reft");if(r)r.textContent="Received at "+new Date().toLocaleString();doneBox.classList.add("show")}window.scrollTo({top:formWrap?formWrap.offsetTop-90:0,behavior:"smooth"})}
 if(form)form.addEventListener("submit",function(e){e.preventDefault();formErr.classList.remove("show");
   if((document.getElementById("website")||{}).value){showDone();return}
   if(Date.now()-loadT<1500){showDone();return}
   var wt=document.getElementById("work_title").value.trim(),iu=document.getElementById("infringing_url").value.trim(),rn=document.getElementById("reporter_name").value.trim(),re=document.getElementById("reporter_email").value.trim(),rel=document.getElementById("relationship").value,st=stmt?stmt.value.trim():"";
   var ok=true;[["work_title",wt],["infringing_url",iu],["reporter_name",rn],["reporter_email",re],["relationship",rel],["statement",st]].forEach(function(p){var bad=!p[1];setBad(p[0],bad);if(bad)ok=false});
   if(re&&!EMAIL.test(re)){setBad("reporter_email",true);ok=false}
   if(!(c1&&c1.checked&&c2&&c2.checked))ok=false;
   if(!ok){formErr.textContent="Please complete the highlighted fields and confirm both statements.";formErr.classList.add("show");var first=form.querySelector(".bad");if(first)first.focus();return}
   btn.classList.add("loading");btn.disabled=true;
   if(!sb){btn.classList.remove("loading");btn.disabled=false;formErr.textContent="Submission service is not configured. Please email us directly.";formErr.classList.add("show");return}
   sb.from("dmca_reports").insert({work_title:wt,infringing_url:iu,reporter_name:rn,reporter_email:re,relationship:rel,statement:st,reason:("DMCA takedown: "+wt).slice(0,200),ringtone_id:null}).then(function(res){btn.classList.remove("loading");if(res.error){formErr.textContent="Could not send right now ("+res.error.message+"). Please try again or email us.";formErr.classList.add("show");btn.disabled=false;gate();return}showDone()}).catch(function(er){btn.classList.remove("loading");formErr.textContent="Network error. Please try again.";formErr.classList.add("show");btn.disabled=false;gate()});
 });
 var ag=document.getElementById("again");if(ag)ag.addEventListener("click",function(){location.reload()});
})();`;
function sec(n,t,h){return '<section class="sec"><div class="sec-h"><span class="sec-n">'+String(n).padStart(2,"0")+'</span><h2>'+escHtml(t)+'</h2></div>'+h+'</section>'}
export async function onRequestGet(context){
 const origin=new URL(context.request.url).origin;const L=(u)=>origin+u;
 const foot='<div class="foot-links"><a href="'+L("/terms")+'">Terms</a><a href="'+L("/privacy")+'">Privacy</a><a href="'+L("/dmca")+'" aria-current="page">DMCA</a><a href="'+L("/contact")+'">Contact</a><a href="'+L("/")+'">Home</a></div>';
 const POLICY=
   sec(1,"We respect intellectual property","<p>RingMang respects the copyright of others and expects its users to do the same. We do not want to host material that infringes anyone’s rights. If you are a copyright owner — or authorised to act for one — and you believe a ringtone on RingMang uses your work without permission, this page explains exactly how to tell us, and what we will do.</p>")
   + sec(2,"How to send a takedown notice","<p>The fastest way is the form above. A valid notice includes:</p><ul class=\"valid-list\"><li>Identification of the copyrighted work you claim is infringed.</li><li>Where it is on RingMang — paste the track’s URL, or its exact title as shown on the site.</li><li>Your name and a working email address.</li><li>Your relationship to the work (owner, or authorised representative).</li><li>A statement that you have a <strong>good-faith belief</strong> the use is not authorised by the owner, its agent, or the law.</li><li>A statement that the information is accurate and that you are the owner or authorised to act — given under penalty of perjury.</li></ul><p>The two checkboxes in the form capture these last two statements.</p>")
   + sec(3,"What we do when we receive a valid notice","<p>On receiving a notice that meets the requirements above, we review it promptly and, where appropriate, remove or disable access to the identified ringtone. We may contact you at the email you provide if we need clarification. We keep a record of notices for legal and operational purposes.</p>")
   + sec(4,"If your content was removed by mistake","<p>If you uploaded a ringtone that we removed and you believe this was an error — for example, you hold the rights or the use is permitted — reply to the email we send you, or use the <a href=\""+L("/contact")+"\">contact page</a>, explaining why the material should be restored. This is your counter-notice. We will review it and let you know the outcome.</p>")
   + sec(5,"Repeat infringement","<p>Where appropriate, and consistent with our <a href=\""+L("/terms")+"\">Terms</a>, we may restrict or terminate the access of anyone who repeatedly uploads infringing material.</p>")
   + sec(6,"Good faith & contact","<p>We handle every notice in good faith and without penalty to anyone who reports honestly. For anything that is not a takedown (general questions, partnerships, bugs), please use the <a href=\""+L("/contact")+"\">contact page</a> instead so your message reaches the right place.</p>");
 const html='<!doctype html><html lang="en"><head>'
  +'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
  +'<title>DMCA / Copyright — RingMang</title>'
  +'<meta name="description" content="RingMang respects copyright. Rights holders can submit a DMCA takedown notice here; we review valid notices and act promptly.">'
  +'<meta name="robots" content="index,follow"><link rel="canonical" href="'+L("/dmca")+'">'
  +'<meta property="og:type" content="article"><meta property="og:site_name" content="RingMang"><meta property="og:title" content="DMCA / Copyright — RingMang"><meta property="og:description" content="Submit a copyright takedown notice. We respect intellectual property and act on valid notices."><meta property="og:url" content="'+L("/dmca")+'"><meta property="og:image" content="'+L("/icon.svg")+'">'
  +'<meta name="twitter:card" content="summary"><meta name="theme-color" content="#071417"><link rel="manifest" href="/manifest.webmanifest"><link rel="icon" type="image/svg+xml" href="/icon.svg"><link rel="apple-touch-icon" href="/icon.svg">'
  +'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Outfit:wght@300;400;500;600&family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">'
  +'<script src="/config.js"></script><script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>'
  +'<style>'+CSS+'</style></head><body>'
  +'<div class="progress"><div id="pf" class="progress-fill"></div></div><div class="watermark" aria-hidden="true">§</div><div class="stage"></div>'
  +'<header class="top"><div class="wrap top-in"><a class="brand" href="'+L("/")+'"><div class="eqm" aria-hidden="true"><span></span><span></span><span></span><span></span></div><span class="wm">Ring<span class="c">Mang</span></span></a><a class="back" href="'+L("/")+'">← Home</a></div></header>'
  +'<main class="wrap">'
  +'<div class="opener"><div class="kicker"><span class="ln"></span>RIGHTS HOLDERS · DMCA / COPYRIGHT</div>'
  +'<h1>Report infringing content</h1>'
  +'<p class="lede">If your copyrighted work appears on RingMang without permission, use the form below to send a takedown notice — we review valid notices and act promptly. (You may write your notice in any language; the field labels are in English for legal precision.)</p>'
  +'<div class="meta-row"><span class="meta-pill"><span class="d"></span>Reviewed <b>promptly</b></span><span class="meta-pill">No account <b>needed</b></span><span class="meta-pill">Good-faith <b>process</b></span></div>'
  +'</div>'
  +'<div class="grid2">'
  +'<div class="card" style="--ac:#fb7185"><h2>Submit a takedown notice</h2><p class="sub">Fields marked <span class="req">*</span> are required. Your details are used only to handle this notice.</p>'
  +'<div id="formwrap"><form id="dmcaform" novalidate>'
  +'<div class="field"><label for="work_title">Copyrighted work <span class="req">*</span></label><div class="inp"><input id="work_title" name="work_title" type="text" maxlength="240" placeholder="e.g. Song or movie title you own"></div><p class="err">Please name the work.</p></div>'
  +'<div class="field"><label for="infringing_url">Where it is on RingMang <span class="req">*</span></label><div class="inp"><input id="infringing_url" name="infringing_url" type="text" maxlength="500" placeholder="Paste the track URL or its exact title"></div><p class="hint">The track page URL (…/ringtone/…) is best.</p><p class="err">Please tell us where to find it.</p></div>'
  +'<div class="field"><label for="reporter_name">Your name <span class="req">*</span></label><div class="inp"><input id="reporter_name" name="reporter_name" type="text" maxlength="120" placeholder="Full name"></div><p class="err">Please add your name.</p></div>'
  +'<div class="field"><label for="reporter_email">Your email <span class="req">*</span></label><div class="inp"><input id="reporter_email" name="reporter_email" type="email" maxlength="160" placeholder="you@example.com"></div><p class="err">Please add a valid email.</p></div>'
  +'<div class="field"><label for="relationship">Your relationship to the work <span class="req">*</span></label><div class="inp"><select id="relationship" name="relationship"><option value="">Select…</option><option>I am the copyright owner</option><option>I am authorised to act for the owner</option><option>Other (explain in the statement)</option></select></div><p class="err">Please select one.</p></div>'
  +'<div class="field"><label for="statement">Good-faith statement <span class="req">*</span></label><div class="inp"><textarea id="statement" name="statement" maxlength="1500" placeholder="I have a good-faith belief that the use of the material identified above is not authorised by the copyright owner, its agent, or the law. The information in this notice is accurate.">I have a good-faith belief that the use of the material identified above is not authorised by the copyright owner, its agent, or the law. The information in this notice is accurate.</textarea></div><p class="counter" id="stmtc">0 / 1500</p><p class="err">Please include your statement.</p></div>'
  +'<label class="check"><input type="checkbox" id="c1"><span>I state, under penalty of perjury, that the information in this notice is accurate.</span></label>'
  +'<label class="check"><input type="checkbox" id="c2"><span>I am the copyright owner, or authorised to act on the owner’s behalf.</span></label>'
  +'<div class="hp" aria-hidden="true"><label>Leave empty<input type="text" id="website" name="website" tabindex="-1" autocomplete="off"></label></div>'
  +'<div id="formerr" class="formerr"></div>'
  +'<button type="submit" id="send" class="submit"><span class="sp"></span><span class="lbl">Send takedown notice</span></button>'
  +'</form></div>'
  +'<div id="donebox" class="done"><svg class="seal" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="36"/><path d="M27 43 l10 10 l20 -22"/></svg><h3>Notice received</h3><p class="ref" id="reft">Received at —</p><p>Thank you. We review valid notices promptly and will act where appropriate. If we need anything, we’ll use the email you provided.</p><button class="again" id="again">Send another notice</button></div>'
  +'</div>'
  +'<div class="card" style="--ac:#fbbf24"><h2>What happens next</h2><p class="sub">A clear, three-step path.</p>'
  +'<div class="tl"><div class="tl-step"><h4>1 · We receive it</h4><p>Your notice is logged with a timestamp and queued for review.</p></div><div class="tl-step"><h4>2 · We review it</h4><p>We check that it meets the requirements and identifies the content clearly.</p></div><div class="tl-step"><h4>3 · We act</h4><p>Where appropriate we remove or disable the ringtone, and may email you.</p></div></div>'
  +'<p class="sub" style="margin-top:1.2rem;margin-bottom:.4rem">Not a takedown?</p><p style="font-size:.84rem;color:#9fb0b3">General questions, bugs or partnerships belong on the <a href="'+L("/contact")+'" style="color:#4cc9f0;text-decoration:none;border-bottom:1px dashed rgba(76,201,240,.4)">contact page</a>.</p>'
  +'</div></div>'
  +'<div class="prose">'+POLICY
  +'<div class="softnote"><p><b>A plain-language note.</b> This page and form describe exactly how RingMang handles copyright notices today and are complete as published. RingMang is run independently, without in-house legal counsel; if the project later scales, a qualified lawyer can refine the wording — but you do not need one to use this process as it stands.</p></div>'
  +'</div></main>'
  +'<footer class="foot"><div class="foot-in">'+foot+'<p>© 2026 RingMang · All rights reserved · Made for music lovers.</p></div></footer>'
  +'<button id="totop" class="totop" aria-label="Back to top">↑</button>'
  +'<script>'+CLIENT+'</script></body></html>';
 return new Response(html,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"public, max-age=120, s-maxage=300"}});
}
// RM14B_DMCA_END
