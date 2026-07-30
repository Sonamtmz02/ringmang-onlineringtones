/**
 * RingMang — /terms  (Phase 14A, corrected) self-authored, publish-ready Terms of Service.
 * Alive legal doc: reading-progress bar, scroll-spy TOC, scroll-reveal, watermark, back-to-top.
 * index,follow. Plain-language English body + one Nepali intro line. Soft (non-blocking) footnote.
 */
const escHtml=(s)=>String(s==null?"":s).replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const UPDATED="2026-07-30", VERSION="1.0";
const CSS=`*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:"Outfit",system-ui,sans-serif;background:#071417;color:#c7d2d6;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;line-height:1.72}
.progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:60;background:rgba(255,255,255,.04)}
.progress-fill{height:100%;width:0;background:linear-gradient(90deg,#ff6b4a,#ffd166,#3ddc97);box-shadow:0 0 10px rgba(255,107,74,.5);transition:width .12s linear}
.watermark{position:fixed;top:50%;right:-3vw;transform:translateY(-50%);font-family:"Space Mono",monospace;font-size:46vh;line-height:1;color:#fbbf24;opacity:.035;z-index:0;pointer-events:none;user-select:none}
.stage{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 50% at 8% -8%,rgba(251,191,36,.11),transparent 60%),radial-gradient(ellipse 55% 45% at 94% 106%,rgba(255,107,74,.08),transparent 60%),linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px);background-size:100% 100%,100% 100%,42px 42px,42px 42px}
a{color:inherit}.wrap{position:relative;z-index:1;max-width:800px;margin:0 auto;padding:0 1.2rem}
.top{position:sticky;top:0;z-index:40;background:rgba(7,20,23,.86);backdrop-filter:blur(10px);border-bottom:1px solid rgba(30,58,64,.6)}
.top-in{display:flex;align-items:center;justify-content:space-between;gap:1rem;height:3.4rem;max-width:980px;margin:0 auto;padding:0 1.2rem}
.brand{display:flex;align-items:center;gap:.6rem;text-decoration:none}
.eqm{display:flex;align-items:flex-end;gap:2.5px;height:18px}.eqm span{width:3px;border-radius:2px;transform-origin:bottom;animation:eqb .9s ease-in-out infinite}
.eqm span:nth-child(1){background:#ff6b4a;height:60%}.eqm span:nth-child(2){background:#ffd166;height:100%;animation-delay:.15s}.eqm span:nth-child(3){background:#3ddc97;height:45%;animation-delay:.3s}.eqm span:nth-child(4){background:#4cc9f0;height:80%;animation-delay:.45s}
@keyframes eqb{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
.wm{font-family:"Unbounded",sans-serif;font-weight:800;font-size:1.05rem;color:#fff;letter-spacing:-.01em}.wm .c{color:#ff6b4a}
.back{font-family:"Space Mono",monospace;font-size:.66rem;letter-spacing:.08em;color:#9fb0b3;text-decoration:none;border:1px solid #2a4d55;border-radius:2rem;padding:.35rem .8rem;transition:all .2s;white-space:nowrap}.back:hover{color:#071417;background:#ffd166;border-color:#ffd166}
.opener{padding:2.6rem 0 .6rem}
.kicker{font-family:"Space Mono",monospace;font-size:.64rem;letter-spacing:.26em;text-transform:uppercase;color:#fbbf24;margin-bottom:.9rem;display:flex;align-items:center;gap:.6rem}.kicker .ln{flex:0 0 34px;height:2px;background:linear-gradient(90deg,#fbbf24,transparent);border-radius:2px}
h1{font-family:"Unbounded",sans-serif;font-weight:800;font-size:clamp(2.1rem,7.4vw,3.6rem);line-height:1.04;color:#fff;letter-spacing:-.025em}
.lede{margin-top:1rem;color:#9fb0b3;font-size:1.02rem;max-width:64ch}
.meta-row{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1.2rem}
.meta-pill{display:inline-flex;align-items:center;gap:.45rem;font-family:"Space Mono",monospace;font-size:.6rem;letter-spacing:.08em;color:#7f9099;border:1px solid #1e3a40;border-radius:2rem;padding:.32rem .7rem}
.meta-pill .d{width:7px;height:7px;border-radius:50%;background:#3ddc97;box-shadow:0 0 7px rgba(61,220,151,.7)}
.meta-pill b{color:#cdd8da;font-weight:700}
.toc{margin:1.4rem 0 .4rem;display:flex;gap:.5rem;overflow-x:auto;scroll-snap-type:x mandatory;padding:.3rem 0 .8rem;scrollbar-width:thin;scrollbar-color:#2a4d55 transparent}
.toc::-webkit-scrollbar{height:6px}.toc::-webkit-scrollbar-thumb{background:#2a4d55;border-radius:3px}
.toclink{scroll-snap-align:start;flex:0 0 auto;display:flex;align-items:center;gap:.5rem;text-decoration:none;background:#102226;border:1px solid #1e3a40;border-radius:2rem;padding:.42rem .85rem;transition:all .22s;opacity:.9}
.toclink:hover{border-color:#fbbf24;transform:translateY(-2px);opacity:1}
.toclink.active{border-color:#fbbf24;background:rgba(251,191,36,.12);opacity:1;box-shadow:0 4px 16px rgba(251,191,36,.18)}
.toclink .tn{font-family:"Space Mono",monospace;font-size:.62rem;font-weight:700;color:#fbbf24}
.toclink .tt{font-family:"Space Grotesk",sans-serif;font-size:.74rem;font-weight:600;color:#cdd8da;white-space:nowrap}
.toclink.active .tt{color:#fff}
.prose{padding:.6rem 0 1rem}
.sec{margin:0 0 1.9rem;scroll-margin-top:5.2rem;opacity:0;transform:translateY(16px)}
.sec.revealed{opacity:1;transform:translateY(0);transition:opacity .55s ease,transform .55s ease}
.sec-h{display:flex;align-items:baseline;gap:.7rem;margin-bottom:.6rem}
.sec-n{font-family:"Space Mono",monospace;font-size:.74rem;font-weight:700;color:#ff6b4a;flex-shrink:0}
.sec.revealed .sec-n{animation:popn .5s cubic-bezier(.34,1.5,.64,1)}
@keyframes popn{0%{transform:scale(.4);opacity:0}100%{transform:scale(1);opacity:1}}
.sec-h h2{font-family:"Unbounded",sans-serif;font-weight:700;font-size:1.14rem;color:#fff;line-height:1.3}
.prose p{margin:.55rem 0;color:#9fb0b3}
.prose ul{margin:.55rem 0 .55rem .2rem;list-style:none}
.prose li{position:relative;padding-left:1.25rem;margin:.4rem 0;color:#9fb0b3}
.prose li::before{content:"";position:absolute;left:.15rem;top:.66rem;width:6px;height:6px;border-radius:50%;background:#2a4d55;transition:background .2s}
.sec.revealed .prose li::before{background:#fbbf24}
.prose strong{color:#dbe4e6;font-weight:600}
.prose a{color:#4cc9f0;text-decoration:none;border-bottom:1px dashed rgba(76,201,240,.4)}.prose a:hover{color:#7fd9f5}
.softnote{margin:1.6rem 0 .4rem;border-top:1px dashed #2a4d55;padding-top:1.1rem}
.softnote p{font-family:"Space Mono",monospace;font-size:.72rem;color:#6b7280;line-height:1.7}
.softnote b{color:#9fb0b3}
.totop{position:fixed;right:1.1rem;bottom:1.3rem;z-index:50;width:2.9rem;height:2.9rem;border-radius:50%;background:#152a2f;border:1px solid #2a4d55;color:#fbbf24;font-size:1.1rem;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .3s,transform .3s,background .2s;box-shadow:0 8px 24px rgba(0,0,0,.5)}
.totop.show{opacity:1;transform:translateY(0);pointer-events:auto}
.totop:hover{background:#fbbf24;color:#071417}
.foot{position:relative;z-index:1;border-top:1px solid rgba(20,38,42,.8);margin-top:1.5rem}
.foot-in{max-width:980px;margin:0 auto;padding:1.6rem 1.2rem 2.4rem}
.foot-links{display:flex;flex-wrap:wrap;gap:.5rem 1.2rem;margin-bottom:.8rem}
.foot-links a{font-family:"Space Mono",monospace;font-size:.68rem;letter-spacing:.06em;color:#7c8d90;text-decoration:none;text-transform:uppercase;transition:color .2s}.foot-links a:hover{color:#ff6b4a}
.foot p{font-size:.72rem;color:#56676a;line-height:1.6;max-width:64ch}`;
const CLIENT=`(function(){
 var fill=document.getElementById("pf");
 function prog(){var h=document.documentElement;var max=h.scrollHeight-h.clientHeight;var p=max>0?(h.scrollTop/max)*100:0;if(fill)fill.style.width=p+"%";var t=document.getElementById("totop");if(t)t.classList.toggle("show",h.scrollTop>600)}
 window.addEventListener("scroll",prog,{passive:true});prog();
 var tt=document.getElementById("totop");if(tt)tt.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"})});
 if("IntersectionObserver"in window){
   var rev=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("revealed");rev.unobserve(e.target)}})},{threshold:.12});
   document.querySelectorAll(".sec").forEach(function(s){rev.observe(s)});
   var links={};document.querySelectorAll(".toclink").forEach(function(a){links[a.getAttribute("data-toc")]=a});
   var spy=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var id=e.target.id.replace("s","");Object.keys(links).forEach(function(k){links[k].classList.toggle("active",k===id)})}})},{rootMargin:"-45% 0px -50% 0px",threshold:0});
   document.querySelectorAll(".sec").forEach(function(s){spy.observe(s)});
 }else{document.querySelectorAll(".sec").forEach(function(s){s.classList.add("revealed")})}
})();`;
const SECS=[
["Acceptance of these terms","<p>Welcome to <strong>RingMang</strong>. These Terms of Service (“Terms”) are a binding agreement between you and RingMang (“we”, “us”, “our”). By visiting the website, browsing ringtones, playing previews, downloading files, or otherwise using the Service, you confirm that you have read, understood, and agree to these Terms. If you do not agree, please stop using the Service.</p>"],
["About the Service","<p>RingMang is a free platform that lets anyone browse, preview and download ringtones without creating an account. We may add, modify, limit, suspend or remove any feature, page or piece of content at any time, with or without notice, and we are not obliged to keep any particular ringtone available.</p>"],
["Who may use it","<p>You may use the Service only if you are legally able to enter into this agreement in the place where you live, and only in a way that complies with these Terms and with all laws that apply to you. By using RingMang you represent that both of these are true.</p>"],
["Content on RingMang","<p>The audio on RingMang falls into two clearly labelled categories:</p><ul><li><strong>Original / royalty-free</strong> — audio that is created for, or licensed to, free distribution.</li><li><strong>Copyrighted clips</strong> — short excerpts from movies, songs or other works, shared for preview and promotional purposes. We do not own these works, and their presence on RingMang does not transfer any rights to you.</li></ul><p>Each track shows its copyright status. You are responsible for making sure your own use of any clip is lawful where you are.</p>"],
["Your licence to download & use","<p>When you download a ringtone, we grant you a limited, personal, non-exclusive, non-transferable licence to use that file for <strong>personal, non-commercial</strong> purposes — for example, setting it as a ringtone on your own phone. Original / royalty-free tracks may be used within the terms stated on the track. This licence does not let you sell, sublicense, redistribute, publicly perform, or build a competing service with the files.</p>"],
["Things you must not do","<p>When using RingMang you agree not to:</p><ul><li>use the Service for anything unlawful, harmful, or to infringe anyone’s rights;</li><li>scrape, mirror, copy or automatically harvest the site or its files at scale;</li><li>try to break, overload, or interfere with the Service or its security;</li><li>remove or hide copyright, licence or attribution notices; or</li><li>use copyrighted clips in a way that the rights holder has not allowed.</li></ul>"],
["Copyright & our DMCA process","<p>We respect intellectual property and we act on valid takedown notices. If you are a rights holder (or authorised to act for one) and you believe a ringtone on RingMang infringes your copyright, please send a notice through our <a href=\"/dmca\">DMCA page</a> with the details described there. On receiving a valid notice we will review it and, where appropriate, remove or disable the content promptly.</p>"],
["Advertising & third-party links","<p>RingMang stays free partly because we show sponsor messages. Ads load only after you give consent, and aggressive formats (such as pop-unders or redirects) are switched off by default. Clicking an ad, or any external link, takes you to a third-party site that we do not control; we are not responsible for those sites, their content, or their privacy practices.</p>"],
["RingMang’s own intellectual property","<p>The RingMang name, logo, layout, design and the code behind the Service belong to us or our licensors. You may not copy or reproduce the Service itself. This does not affect the copyright status of individual ringtone files, which is shown on each track.</p>"],
["No accounts, no listener data","<p>Listeners do not register, so we hold no listener passwords, profiles or purchase histories. This keeps your footprint small and is explained further in our <a href=\"/privacy\">Privacy Policy</a>, which forms part of these Terms.</p>"],
["Disclaimer (“as is”)","<p>THE SERVICE AND ALL CONTENT ARE PROVIDED <strong>“AS IS”</strong> AND “AS AVAILABLE”, WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. We do not promise that the Service will be uninterrupted, secure, error-free, or that any content is legally cleared for use in your country. We make no guarantees about rankings, availability, quality, or fitness for a particular purpose.</p>"],
["Limitation of liability","<p>To the fullest extent allowed by law, RingMang, its operators and contributors are not liable for any indirect, incidental, special, consequential or punitive damages, or for any loss of data, profit or goodwill, arising from your use of (or inability to use) the Service, any content, any advertisement, or any third-party link. Where liability cannot be excluded, it is limited to the minimum required by the law that applies to you.</p>"],
["Indemnity","<p>You agree to indemnify and hold RingMang harmless from any claim, loss or expense (including reasonable legal costs) arising from your breach of these Terms, your misuse of the Service, or your violation of any third party’s rights.</p>"],
["Termination","<p>We may restrict or end your access to the Service at any time, without notice, if we believe you have breached these Terms or if we need to for legal or operational reasons. The clauses that by their nature should survive (such as disclaimers, limitation of liability, indemnity and governing law) continue to apply after termination.</p>"],
["Governing law & disputes","<p>RingMang is operated independently from Nepal. These Terms are governed by the laws of Nepal, without regard to conflict-of-law rules. Nothing here removes any consumer protection that the law of the country where you live gives you and that cannot be waived. If a dispute arises, we both agree to first try to resolve it in good faith through the <a href=\"/contact\">contact page</a>.</p>"],
["General","<p>If any part of these Terms is found unenforceable, the rest stays in full effect. These Terms (with the Privacy Policy) are the entire agreement between you and RingMang about the Service. Our failure to enforce any right is not a waiver of it. Headings are for convenience only.</p>"],
["Changes to these terms","<p>We may update these Terms from time to time. When we do, the “Last updated” date at the top of this page changes. Material changes are posted here. Your continued use of the Service after changes means you accept the revised Terms.</p>"],
["Contact us","<p>Questions about these Terms? Reach us through the <a href=\"/contact\">contact page</a>. We read every message.</p>"]
];
function toc(){return SECS.map((s,i)=>'<a class="toclink" href="#s'+(i+1)+'" data-toc="'+(i+1)+'"><span class="tn">'+String(i+1).padStart(2,"0")+'</span><span class="tt">'+escHtml(s[0])+'</span></a>').join("")}
function prose(){return SECS.map((s,i)=>'<section class="sec" id="s'+(i+1)+'"><div class="sec-h"><span class="sec-n">'+String(i+1).padStart(2,"0")+'</span><h2>'+escHtml(s[0])+'</h2></div>'+s[1]+'</section>').join("")}
export async function onRequestGet(context){
 const origin=new URL(context.request.url).origin;const L=(u)=>origin+u;
 const foot='<div class="foot-links"><a href="'+L("/terms")+'">Terms</a><a href="'+L("/privacy")+'">Privacy</a><a href="'+L("/dmca")+'">DMCA</a><a href="'+L("/contact")+'">Contact</a><a href="'+L("/")+'">Home</a></div>';
 const html='<!doctype html><html lang="en"><head>'
  +'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
  +'<title>Terms of Service — RingMang</title>'
  +'<meta name="description" content="Terms of Service for RingMang — free ringtones. Content, copyright, DMCA, advertising, disclaimers and your rights, in plain language.">'
  +'<meta name="robots" content="index,follow"><link rel="canonical" href="'+L("/terms")+'">'
  +'<meta property="og:type" content="article"><meta property="og:site_name" content="RingMang"><meta property="og:title" content="Terms of Service — RingMang"><meta property="og:description" content="The rules for using RingMang — content, copyright, DMCA, ads and disclaimers, written in plain language."><meta property="og:url" content="'+L("/terms")+'"><meta property="og:image" content="'+L("/icon.svg")+'">'
  +'<meta name="twitter:card" content="summary"><meta name="theme-color" content="#071417"><link rel="manifest" href="/manifest.webmanifest"><link rel="icon" type="image/svg+xml" href="/icon.svg"><link rel="apple-touch-icon" href="/icon.svg">'
  +'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Outfit:wght@300;400;500;600&family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">'
  +'<style>'+CSS+'</style></head><body>'
  +'<div class="progress"><div id="pf" class="progress-fill"></div></div>'
  +'<div class="watermark" aria-hidden="true">§</div>'
  +'<div class="stage"></div>'
  +'<header class="top"><div class="top-in"><a class="brand" href="'+L("/")+'"><div class="eqm" aria-hidden="true"><span></span><span></span><span></span><span></span></div><span class="wm">Ring<span class="c">Mang</span></span></a><a class="back" href="'+L("/")+'">← Home</a></div></header>'
  +'<main class="wrap">'
  +'<div class="opener"><div class="kicker"><span class="ln"></span>LEGAL · TERMS OF SERVICE</div>'
  +'<h1>Terms of Service</h1>'
  +'<p class="lede">यो पृष्ठले RingMang प्रयोग गर्ने नियमहरू सरल भाषामा व्याख्या गर्छ — content, copyright, DMCA, ads र तपाईंका अधिकारहरू। (The legal text below is in standard English so it is precise and publish-ready.)</p>'
  +'<div class="meta-row"><span class="meta-pill"><span class="d"></span>Effective <b>'+UPDATED+'</b></span><span class="meta-pill">Version <b>'+VERSION+'</b></span><span class="meta-pill">Operated from <b>Nepal</b></span><span class="meta-pill">Plain-language <b>English</b></span></div>'
  +'</div>'
  +'<nav class="toc" aria-label="On this page">'+toc()+'</nav>'
  +'<div class="prose">'+prose()
  +'<div class="softnote"><p><b>A plain-language note.</b> We wrote these Terms in clear English so anyone can read them, and they describe exactly how RingMang works today — they are complete as published. RingMang is run independently, without in-house legal counsel. If the project later grows into a larger company, a qualified lawyer in your region can polish the wording, but you do not need one to rely on these Terms as they stand.</p></div>'
  +'</div></main>'
  +'<footer class="foot"><div class="foot-in">'+foot+'<p>© 2026 RingMang · All rights reserved · Made for music lovers.</p></div></footer>'
  +'<button id="totop" class="totop" aria-label="Back to top">↑</button>'
  +'<script>'+CLIENT+'</script></body></html>';
 return new Response(html,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"public, max-age=300, s-maxage=600"}});
}
// RM14A_TERMS_END
