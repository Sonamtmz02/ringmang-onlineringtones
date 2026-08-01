/**
 * RingMang — /contact  (Phase 14B) self-authored contact page + WORKING form -> contact_messages.
 * Subject chips, char counter, honeypot + timing guard, submit morph, animated seal success.
 * Mailto fallback link. Honest "where messages go" note. Alive ambient (sky/teal).
 */
const escHtml=(s)=>String(s==null?"":s).replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const MAILTO="ringmangsupport@gmail.com";
const CSS=`*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:"Outfit",system-ui,sans-serif;background:#071417;color:#c7d2d6;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;line-height:1.72}
.progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:60;background:rgba(255,255,255,.04)}.progress-fill{height:100%;width:0;background:linear-gradient(90deg,#4cc9f0,#3ddc97,#fbbf24);box-shadow:0 0 10px rgba(76,201,240,.5);transition:width .12s linear}
.watermark{position:fixed;top:46%;left:-3vw;transform:translateY(-50%);font-family:"Space Mono",monospace;font-size:40vh;line-height:1;color:#4cc9f0;opacity:.04;z-index:0;pointer-events:none;user-select:none}
.stage{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 58% 48% at 8% -8%,rgba(76,201,240,.12),transparent 60%),radial-gradient(ellipse 52% 46% at 94% 106%,rgba(61,220,151,.09),transparent 60%),linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px);background-size:100% 100%,100% 100%,42px 42px,42px 42px}
a{color:inherit}.wrap{position:relative;z-index:1;max-width:980px;margin:0 auto;padding:0 1.2rem}
.top{position:sticky;top:0;z-index:40;background:rgba(7,20,23,.86);backdrop-filter:blur(10px);border-bottom:1px solid rgba(30,58,64,.6)}.top-in{display:flex;align-items:center;justify-content:space-between;gap:1rem;height:3.4rem}.brand{display:flex;align-items:center;gap:.6rem;text-decoration:none}
.eqm{display:flex;align-items:flex-end;gap:2.5px;height:18px}.eqm span{width:3px;border-radius:2px;transform-origin:bottom;animation:eqb .9s ease-in-out infinite}.eqm span:nth-child(1){background:#ff6b4a;height:60%}.eqm span:nth-child(2){background:#ffd166;height:100%;animation-delay:.15s}.eqm span:nth-child(3){background:#3ddc97;height:45%;animation-delay:.3s}.eqm span:nth-child(4){background:#4cc9f0;height:80%;animation-delay:.45s}@keyframes eqb{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
.wm{font-family:"Unbounded",sans-serif;font-weight:800;font-size:1.05rem;color:#fff;letter-spacing:-.01em}.wm .c{color:#ff6b4a}.back{font-family:"Space Mono",monospace;font-size:.66rem;letter-spacing:.08em;color:#9fb0b3;text-decoration:none;border:1px solid #2a4d55;border-radius:2rem;padding:.35rem .8rem;transition:all .2s;white-space:nowrap}.back:hover{color:#071417;background:#4cc9f0;border-color:#4cc9f0}
.opener{padding:2.6rem 0 .8rem}.kicker{font-family:"Space Mono",monospace;font-size:.64rem;letter-spacing:.26em;text-transform:uppercase;color:#4cc9f0;margin-bottom:.9rem;display:flex;align-items:center;gap:.6rem}.kicker .ln{flex:0 0 34px;height:2px;background:linear-gradient(90deg,#4cc9f0,transparent);border-radius:2px}
h1{font-family:"Unbounded",sans-serif;font-weight:800;font-size:clamp(2.1rem,7.4vw,3.6rem);line-height:1.04;color:#fff;letter-spacing:-.025em}.lede{margin-top:1rem;color:#9fb0b3;font-size:1.02rem;max-width:64ch}
.meta-row{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1.2rem}.meta-pill{display:inline-flex;align-items:center;gap:.45rem;font-family:"Space Mono",monospace;font-size:.6rem;letter-spacing:.08em;color:#7f9099;border:1px solid #1e3a40;border-radius:2rem;padding:.32rem .7rem}.meta-pill .d{width:7px;height:7px;border-radius:50%;background:#4cc9f0;box-shadow:0 0 7px rgba(76,201,240,.7)}.meta-pill b{color:#cdd8da;font-weight:700}
.grid2{display:grid;grid-template-columns:1fr;gap:1.4rem;margin-top:1.8rem}@media(min-width:860px){.grid2{grid-template-columns:1.35fr 1fr;align-items:start}}
.card{position:relative;background:linear-gradient(180deg,#10151c,#0c1117);border:1px solid #1e3a40;border-radius:1rem;padding:1.4rem 1.3rem;overflow:hidden;opacity:0;transform:translateY(18px)}.card.revealed{opacity:1;transform:translateY(0);transition:opacity .55s ease,transform .55s ease}
.card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--ac,#4cc9f0);box-shadow:0 0 12px var(--ac,#4cc9f0)}
.card h2{font-family:"Unbounded",sans-serif;font-weight:700;font-size:1.05rem;color:#fff;margin-bottom:.3rem}.card .sub{font-size:.82rem;color:#7f9099;margin-bottom:1.1rem}
.field{margin-bottom:1rem}.field label{display:block;font-family:"Space Mono",monospace;font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:#9ca3af;margin-bottom:.45rem}.req{color:#fb7185}
.field input,.field textarea{width:100%;background:#0a0f14;border:1px solid #232d3a;border-left:3px solid #232d3a;border-radius:.55rem;color:#dbe4e6;font-family:"Outfit",sans-serif;font-size:.92rem;padding:.7rem .8rem;outline:none;transition:border-color .2s,box-shadow .2s,border-left-color .2s}
.field textarea{resize:vertical;min-height:120px;line-height:1.6}
.field input:focus,.field textarea:focus{border-color:#4cc9f0;border-left-color:#4cc9f0;box-shadow:0 0 0 3px rgba(76,201,240,.12)}
.field input.bad,.field textarea.bad{border-color:#fb7185;border-left-color:#fb7185}
.field .err{display:none;font-size:.7rem;color:#fb7185;margin-top:.35rem}.field.invalid .err{display:block}
.counter{font-family:"Space Mono",monospace;font-size:.62rem;color:#56676a;text-align:right;margin-top:.3rem}.counter.warn{color:#fbbf24}.counter.over{color:#fb7185}
.chips{display:flex;flex-wrap:wrap;gap:.45rem;margin-bottom:1rem}.chip{font-family:"Space Mono",monospace;font-size:.66rem;font-weight:700;letter-spacing:.04em;color:#9fb0b3;background:#0a0f14;border:1px solid #232d3a;border-radius:2rem;padding:.42rem .8rem;cursor:pointer;transition:all .2s;user-select:none}.chip:hover{border-color:#4cc9f0;color:#cdd8da;transform:translateY(-1px)}.chip.on{background:rgba(76,201,240,.14);border-color:#4cc9f0;color:#fff;box-shadow:0 3px 12px rgba(76,201,240,.2)}
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;opacity:0}
.submit{width:100%;margin-top:.4rem;display:flex;align-items:center;justify-content:center;gap:.6rem;padding:.85rem 1rem;border:none;border-radius:.6rem;background:#4cc9f0;color:#071417;font-family:"Unbounded",sans-serif;font-weight:700;font-size:.86rem;cursor:pointer;transition:background .2s,transform .12s,opacity .2s;box-shadow:0 8px 24px rgba(76,201,240,.32)}
.submit:hover:not(:disabled){background:#7fd9f5;transform:translateY(-1px)}.submit:active:not(:disabled){transform:scale(.98)}.submit:disabled{opacity:.5;cursor:not-allowed}
.submit .sp{width:16px;height:16px;border:2px solid rgba(7,20,23,.35);border-top-color:#071417;border-radius:50%;animation:spin .7s linear infinite;display:none}@keyframes spin{to{transform:rotate(360deg)}}.submit.loading .sp{display:inline-block}
.formerr{display:none;margin-top:.8rem;font-family:"Space Mono",monospace;font-size:.74rem;color:#fb7185;background:rgba(251,113,133,.1);border:1px solid rgba(251,113,133,.3);border-radius:.5rem;padding:.6rem .8rem}.formerr.show{display:block}
.done{display:none;text-align:center;padding:.6rem 0}.done.show{display:block;animation:fade .4s ease-out}@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.seal{width:84px;height:84px;margin:0 auto 1rem}.seal circle{fill:none;stroke:#3ddc97;stroke-width:4;stroke-dasharray:226;stroke-dashoffset:226;animation:drawc .7s ease-out forwards}.seal path{fill:none;stroke:#3ddc97;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:48;stroke-dashoffset:48;animation:drawc .4s ease-out .55s forwards}@keyframes drawc{to{stroke-dashoffset:0}}
.done h3{font-family:"Unbounded",sans-serif;font-weight:700;font-size:1.2rem;color:#fff}.done .ref{font-family:"Space Mono",monospace;font-size:.72rem;color:#3ddc97;margin:.6rem 0}.done p{font-size:.86rem;color:#9fb0b3;max-width:42ch;margin:.4rem auto}.done .again{margin-top:1.1rem;font-family:"Space Mono",monospace;font-size:.7rem;color:#9fb0b3;background:#1a222d;border:1px solid #2e3a4a;border-radius:2rem;padding:.5rem 1rem;cursor:pointer;transition:all .2s}.done .again:hover{color:#071417;background:#3ddc97;border-color:#3ddc97}
.qrow{display:flex;align-items:flex-start;gap:.7rem;padding:.7rem 0;border-bottom:1px solid #14262a}.qrow:last-child{border-bottom:none}.qrow .qi{width:30px;height:30px;border-radius:.5rem;display:flex;align-items:center;justify-content:center;font-size:.95rem;flex-shrink:0;background:rgba(76,201,240,.12);border:1px solid rgba(76,201,240,.3)}
.qrow h4{font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:.88rem;color:#e5e7eb}.qrow p{font-size:.8rem;color:#7f9099;margin-top:.15rem;line-height:1.5}.qrow a{color:#4cc9f0;text-decoration:none;border-bottom:1px dashed rgba(76,201,240,.4)}
.mailto{display:inline-flex;align-items:center;gap:.5rem;margin-top:1rem;font-family:"Space Mono",monospace;font-size:.74rem;color:#9fb0b3;border:1px solid #2a4d55;border-radius:2rem;padding:.5rem .9rem;text-decoration:none;transition:all .2s}.mailto:hover{color:#071417;background:#4cc9f0;border-color:#4cc9f0}
.privnote{margin-top:1.1rem;font-size:.74rem;color:#56676a;line-height:1.6}.privnote a{color:#7c8d90;text-decoration:none;border-bottom:1px dashed #2a4d55}
.totop{position:fixed;right:1.1rem;bottom:1.3rem;z-index:50;width:2.9rem;height:2.9rem;border-radius:50%;background:#152a2f;border:1px solid #2a4d55;color:#4cc9f0;font-size:1.1rem;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .3s,transform .3s,background .2s;box-shadow:0 8px 24px rgba(0,0,0,.5)}.totop.show{opacity:1;transform:translateY(0);pointer-events:auto}.totop:hover{background:#4cc9f0;color:#071417}
.foot{position:relative;z-index:1;border-top:1px solid rgba(20,38,42,.8);margin-top:1.5rem}.foot-in{max-width:980px;margin:0 auto;padding:1.6rem 1.2rem 2.4rem}.foot-links{display:flex;flex-wrap:wrap;gap:.5rem 1.2rem;margin-bottom:.8rem}.foot-links a{font-family:"Space Mono",monospace;font-size:.68rem;letter-spacing:.06em;color:#7c8d90;text-decoration:none;text-transform:uppercase;transition:color .2s}.foot-links a:hover{color:#ff6b4a}.foot-links a[aria-current="page"]{color:#4cc9f0}.foot p{font-size:.72rem;color:#56676a;line-height:1.6;max-width:64ch}`;
const CLIENT=`(function(){
 var CFG=window.RINGMANG_CONFIG||{};var SUPA=CFG.SUPABASE_URL,KEY=CFG.SUPABASE_ANON_KEY;
 var sb=(SUPA&&KEY&&window.supabase)?window.supabase.createClient(SUPA,KEY):null;
 var loadT=Date.now();
 var fill=document.getElementById("pf");
 function prog(){var h=document.documentElement;var max=h.scrollHeight-h.clientHeight;var p=max>0?(h.scrollTop/max)*100:0;if(fill)fill.style.width=p+"%";var t=document.getElementById("totop");if(t)t.classList.toggle("show",h.scrollTop>500)}
 window.addEventListener("scroll",prog,{passive:true});prog();
 var tt=document.getElementById("totop");if(tt)tt.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"})});
 if("IntersectionObserver"in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("revealed");io.unobserve(e.target)}})},{threshold:.12});document.querySelectorAll(".card").forEach(function(s){io.observe(s)})}else{document.querySelectorAll(".card").forEach(function(s){s.classList.add("revealed")})}
 var subjInput=document.getElementById("subject");
 document.querySelectorAll(".chip").forEach(function(c){c.addEventListener("click",function(){document.querySelectorAll(".chip").forEach(function(x){x.classList.remove("on")});c.classList.add("on");if(subjInput)subjInput.value=c.getAttribute("data-v")})});
 var form=document.getElementById("cform"),btn=document.getElementById("send"),formWrap=document.getElementById("formwrap"),doneBox=document.getElementById("donebox"),formErr=document.getElementById("formerr");
 var msg=document.getElementById("message"),msgC=document.getElementById("msgc");
 if(msg&&msgC){var upd=function(){var n=msg.value.length;msgC.textContent=n+" / 2000";msgC.className="counter"+(n>2000?" over":(n>1700?" warn":""))};msg.addEventListener("input",upd);upd()}
 var EMAIL=/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
 function setBad(id,bad){var f=document.getElementById(id);if(!f)return;var w=f.closest(".field");f.classList.toggle("bad",bad);if(w)w.classList.toggle("invalid",bad)}
 function showDone(){if(formWrap)formWrap.style.display="none";if(doneBox){var r=document.getElementById("reft");if(r)r.textContent="Received at "+new Date().toLocaleString();doneBox.classList.add("show")}window.scrollTo({top:formWrap?formWrap.offsetTop-90:0,behavior:"smooth"})}
 if(form)form.addEventListener("submit",function(e){e.preventDefault();formErr.classList.remove("show");
   if((document.getElementById("website")||{}).value){showDone();return}
   if(Date.now()-loadT<1500){showDone();return}
   var nm=document.getElementById("name").value.trim(),em=document.getElementById("email").value.trim(),sj=(subjInput&&subjInput.value)||"General",ms=msg?msg.value.trim():"";
   var ok=true;[["name",nm],["email",em],["message",ms]].forEach(function(p){var bad=!p[1];setBad(p[0],bad);if(bad)ok=false});
   if(em&&!EMAIL.test(em)){setBad("email",true);ok=false}
   if(!ok){formErr.textContent="Please complete the highlighted fields.";formErr.classList.add("show");var first=form.querySelector(".bad");if(first)first.focus();return}
   btn.classList.add("loading");btn.disabled=true;
   if(!sb){btn.classList.remove("loading");btn.disabled=false;formErr.textContent="Form service is not configured. Please use the email link below.";formErr.classList.add("show");return}
   sb.from("contact_messages").insert({name:nm,email:em,subject:sj,message:ms}).then(function(res){btn.classList.remove("loading");if(res.error){formErr.textContent="Could not send right now ("+res.error.message+"). Please use the email link below.";formErr.classList.add("show");btn.disabled=false;return}showDone()}).catch(function(){btn.classList.remove("loading");formErr.textContent="Network error. Please use the email link below.";formErr.classList.add("show");btn.disabled=false});
 });
 var ag=document.getElementById("again");if(ag)ag.addEventListener("click",function(){location.reload()});
})();`;
export async function onRequestGet(context){
 const origin=new URL(context.request.url).origin;const L=(u)=>origin+u;
 const foot='<div class="foot-links"><a href="'+L("/terms")+'">Terms</a><a href="'+L("/privacy")+'">Privacy</a><a href="'+L("/dmca")+'">DMCA</a><a href="'+L("/contact")+'" aria-current="page">Contact</a><a href="'+L("/")+'">Home</a></div>';
 const html='<!doctype html><html lang="en"><head>'
  +'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
  +'<title>Contact — RingMang</title>'
  +'<meta name="description" content="Get in touch with RingMang — questions, bug reports, partnerships and suggestions. We read every message and reply in 1–2 days.">'
  +'<meta name="robots" content="index,follow"><link rel="canonical" href="'+L("/contact")+'">'
  +'<meta property="og:type" content="article"><meta property="og:site_name" content="RingMang"><meta property="og:title" content="Contact — RingMang"><meta property="og:description" content="Questions, bugs, partnerships or suggestions? Send us a message — we read every one."><meta property="og:url" content="'+L("/contact")+'"><meta property="og:image" content="'+L("/icon.svg")+'">'
  +'<meta name="twitter:card" content="summary"><meta name="theme-color" content="#071417"><link rel="manifest" href="/manifest.webmanifest"><link rel="icon" type="image/svg+xml" href="/icon.svg"><link rel="apple-touch-icon" href="/icon.svg">'
  +'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Outfit:wght@300;400;500;600&family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">'
  +'<script src="/config.js"></script><script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>'
  +'<style>'+CSS+'</style></head><body>'
  +'<div class="progress"><div id="pf" class="progress-fill"></div></div><div class="watermark" aria-hidden="true">@</div><div class="stage"></div>'
  +'<header class="top"><div class="wrap top-in"><a class="brand" href="'+L("/")+'"><div class="eqm" aria-hidden="true"><span></span><span></span><span></span><span></span></div><span class="wm">Ring<span class="c">Mang</span></span></a><a class="back" href="'+L("/")+'">← Home</a></div></header>'
  +'<main class="wrap">'
  +'<div class="opener"><div class="kicker"><span class="ln"></span>CONTACT · WE READ EVERY MESSAGE</div>'
  +'<h1>Say hello</h1>'
  +'<p class="lede">Questions, bug reports, partnerships or suggestions — write to us about anything. We read every message ourselves and reply within 1–2 days. (Messages in Nepali or English are both welcome.)</p>'
  +'<div class="meta-row"><span class="meta-pill"><span class="d"></span>Replies in <b>1–2 days</b></span><span class="meta-pill">No spam, <b>ever</b></span><span class="meta-pill">Nepali or <b>English</b></span></div>'
  +'</div>'
  +'<div class="grid2">'
  +'<div class="card" style="--ac:#4cc9f0"><h2>Send a message</h2><p class="sub">Pick a topic, then write to us. <span class="req">*</span> = required.</p>'
  +'<div id="formwrap"><form id="cform" novalidate>'
  +'<div class="field"><label>Topic</label><div class="chips"><span class="chip on" data-v="General">General</span><span class="chip" data-v="Bug report">Bug report</span><span class="chip" data-v="Partnership">Partnership</span><span class="chip" data-v="Suggestion">Suggestion</span><span class="chip" data-v="Other">Other</span></div><input type="hidden" id="subject" value="General"></div>'
  +'<div class="field"><label for="name">Your name <span class="req">*</span></label><input id="name" name="name" type="text" maxlength="120" placeholder="How should we call you?"><p class="err">Please add your name.</p></div>'
  +'<div class="field"><label for="email">Your email <span class="req">*</span></label><input id="email" name="email" type="email" maxlength="160" placeholder="you@example.com"><p class="err">Please add a valid email.</p></div>'
  +'<div class="field"><label for="message">Message <span class="req">*</span></label><textarea id="message" name="message" maxlength="2000" placeholder="Tell us what’s on your mind…"></textarea><div class="counter" id="msgc">0 / 2000</div><p class="err">Please write a short message.</p></div>'
  +'<div class="hp" aria-hidden="true"><label>Leave empty<input type="text" id="website" name="website" tabindex="-1" autocomplete="off"></label></div>'
  +'<div id="formerr" class="formerr"></div>'
  +'<button type="submit" id="send" class="submit"><span class="sp"></span><span class="lbl">Send message</span></button>'
  +'</form></div>'
  +'<div id="donebox" class="done"><svg class="seal" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="36"/><path d="M27 43 l10 10 l20 -22"/></svg><h3>Message sent</h3><p class="ref" id="reft">Received at —</p><p>Thanks for writing. We read every message ourselves and will reply within 1–2 days to the email you gave.</p><button class="again" id="again">Send another message</button></div>'
  +'</div>'
  +'<div class="card" style="--ac:#3ddc97"><h2>Before you write</h2><p class="sub">A few quick pointers so we can help faster.</p>'
  +'<div class="qrow"><div class="qi">©</div><div><h4>Copyright / DMCA takedown</h4><p>That has its own dedicated process — please use the <a href="'+L("/dmca")+'">DMCA page</a> so it reaches the right queue.</p></div></div>'
  +'<div class="qrow"><div class="qi">🐞</div><div><h4>Reporting a bug</h4><p>Tell us the page, what you did, and what you expected. Your device/browser helps too.</p></div></div>'
  +'<div class="qrow"><div class="qi">🤝</div><div><h4>Partnerships & ads</h4><p>Share who you are and what you have in mind; we’ll follow up.</p></div></div>'
  +'<a class="mailto" href="mailto:'+MAILTO+'">✉ '+MAILTO+' (fallback)</a>'
  +'<p class="privnote">Your name, email and message are stored only to answer you — see the <a href="'+L("/privacy")+'">Privacy Policy</a>. We never sell your data.</p>'
  +'</div></div>'
  +'</main>'
  +'<footer class="foot"><div class="foot-in">'+foot+'<p>© 2026 RingMang · All rights reserved · Made for music lovers.</p></div></footer>'
  +'<button id="totop" class="totop" aria-label="Back to top">↑</button>'
  +'<script>'+CLIENT+'</script></body></html>';
 return new Response(html,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"public, max-age=120, s-maxage=300"}});
}
// RM14B_CONTACT_END
