/**
 * RingMang — /privacy  (Phase 14A, corrected) self-authored, publish-ready Privacy Policy.
 * Alive legal doc: reading-progress bar, scroll-spy TOC, scroll-reveal, watermark, back-to-top.
 * Privacy-first truth: listeners don't register; minimal data; honest about CDN logs + sandboxed ads.
 */
const escHtml=(s)=>String(s==null?"":s).replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const UPDATED="2026-07-30", VERSION="1.0";
const CSS=`*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:"Outfit",system-ui,sans-serif;background:#071417;color:#c7d2d6;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;line-height:1.72}
.progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:60;background:rgba(255,255,255,.04)}
.progress-fill{height:100%;width:0;background:linear-gradient(90deg,#3ddc97,#4cc9f0,#fbbf24);box-shadow:0 0 10px rgba(61,220,151,.5);transition:width .12s linear}
.watermark{position:fixed;top:50%;left:-2vw;transform:translateY(-50%);font-family:"Space Mono",monospace;font-size:42vh;line-height:1;color:#3ddc97;opacity:.035;z-index:0;pointer-events:none;user-select:none}
.stage{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 60% 50% at 8% -8%,rgba(45,212,191,.11),transparent 60%),radial-gradient(ellipse 55% 45% at 94% 106%,rgba(76,201,240,.08),transparent 60%),linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px);background-size:100% 100%,100% 100%,42px 42px,42px 42px}
a{color:inherit}.wrap{position:relative;z-index:1;max-width:800px;margin:0 auto;padding:0 1.2rem}
.top{position:sticky;top:0;z-index:40;background:rgba(7,20,23,.86);backdrop-filter:blur(10px);border-bottom:1px solid rgba(30,58,64,.6)}
.top-in{display:flex;align-items:center;justify-content:space-between;gap:1rem;height:3.4rem;max-width:980px;margin:0 auto;padding:0 1.2rem}
.brand{display:flex;align-items:center;gap:.6rem;text-decoration:none}
.eqm{display:flex;align-items:flex-end;gap:2.5px;height:18px}.eqm span{width:3px;border-radius:2px;transform-origin:bottom;animation:eqb .9s ease-in-out infinite}
.eqm span:nth-child(1){background:#ff6b4a;height:60%}.eqm span:nth-child(2){background:#ffd166;height:100%;animation-delay:.15s}.eqm span:nth-child(3){background:#3ddc97;height:45%;animation-delay:.3s}.eqm span:nth-child(4){background:#4cc9f0;height:80%;animation-delay:.45s}
@keyframes eqb{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
.wm{font-family:"Unbounded",sans-serif;font-weight:800;font-size:1.05rem;color:#fff;letter-spacing:-.01em}.wm .c{color:#ff6b4a}
.back{font-family:"Space Mono",monospace;font-size:.66rem;letter-spacing:.08em;color:#9fb0b3;text-decoration:none;border:1px solid #2a4d55;border-radius:2rem;padding:.35rem .8rem;transition:all .2s;white-space:nowrap}.back:hover{color:#071417;background:#3ddc97;border-color:#3ddc97}
.opener{padding:2.6rem 0 .6rem}
.kicker{font-family:"Space Mono",monospace;font-size:.64rem;letter-spacing:.26em;text-transform:uppercase;color:#3ddc97;margin-bottom:.9rem;display:flex;align-items:center;gap:.6rem}.kicker .ln{flex:0 0 34px;height:2px;background:linear-gradient(90deg,#3ddc97,transparent);border-radius:2px}
h1{font-family:"Unbounded",sans-serif;font-weight:800;font-size:clamp(2.1rem,7.4vw,3.6rem);line-height:1.04;color:#fff;letter-spacing:-.025em}
.lede{margin-top:1rem;color:#9fb0b3;font-size:1.02rem;max-width:64ch}
.meta-row{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1.2rem}
.meta-pill{display:inline-flex;align-items:center;gap:.45rem;font-family:"Space Mono",monospace;font-size:.6rem;letter-spacing:.08em;color:#7f9099;border:1px solid #1e3a40;border-radius:2rem;padding:.32rem .7rem}
.meta-pill .d{width:7px;height:7px;border-radius:50%;background:#3ddc97;box-shadow:0 0 7px rgba(61,220,151,.7)}
.meta-pill b{color:#cdd8da;font-weight:700}
.toc{margin:1.4rem 0 .4rem;display:flex;gap:.5rem;overflow-x:auto;scroll-snap-type:x mandatory;padding:.3rem 0 .8rem;scrollbar-width:thin;scrollbar-color:#2a4d55 transparent}
.toc::-webkit-scrollbar{height:6px}.toc::-webkit-scrollbar-thumb{background:#2a4d55;border-radius:3px}
.toclink{scroll-snap-align:start;flex:0 0 auto;display:flex;align-items:center;gap:.5rem;text-decoration:none;background:#102226;border:1px solid #1e3a40;border-radius:2rem;padding:.42rem .85rem;transition:all .22s;opacity:.9}
.toclink:hover{border-color:#3ddc97;transform:translateY(-2px);opacity:1}
.toclink.active{border-color:#3ddc97;background:rgba(61,220,151,.12);opacity:1;box-shadow:0 4px 16px rgba(61,220,151,.18)}
.toclink .tn{font-family:"Space Mono",monospace;font-size:.62rem;font-weight:700;color:#3ddc97}
.toclink .tt{font-family:"Space Grotesk",sans-serif;font-size:.74rem;font-weight:600;color:#cdd8da;white-space:nowrap}
.toclink.active .tt{color:#fff}
.prose{padding:.6rem 0 1rem}
.sec{margin:0 0 1.9rem;scroll-margin-top:5.2rem;opacity:0;transform:translateY(16px)}
.sec.revealed{opacity:1;transform:translateY(0);transition:opacity .55s ease,transform .55s ease}
.sec-h{display:flex;align-items:baseline;gap:.7rem;margin-bottom:.6rem}
.sec-n{font-family:"Space Mono",monospace;font-size:.74rem;font-weight:700;color:#3ddc97;flex-shrink:0}
.sec.revealed .sec-n{animation:popn .5s cubic-bezier(.34,1.5,.64,1)}
@keyframes popn{0%{transform:scale(.4);opacity:0}100%{transform:scale(1);opacity:1}}
.sec-h h2{font-family:"Unbounded",sans-serif;font-weight:700;font-size:1.14rem;color:#fff;line-height:1.3}
.prose p{margin:.55rem 0;color:#9fb0b3}
.prose ul{margin:.55rem 0 .55rem .2rem;list-style:none}
.prose li{position:relative;padding-left:1.25rem;margin:.4rem 0;color:#9fb0b3}
.prose li::before{content:"";position:absolute;left:.15rem;top:.66rem;width:6px;height:6px;border-radius:50%;background:#2a4d55;transition:background .2s}
.sec.revealed .prose li::before{background:#3ddc97}
.prose strong{color:#dbe4e6;font-weight:600}
.prose a{color:#4cc9f0;text-decoration:none;border-bottom:1px dashed rgba(76,201,240,.4)}.prose a:hover{color:#7fd9f5}
.softnote{margin:1.6rem 0 .4rem;border-top:1px dashed #2a4d55;padding-top:1.1rem}
.softnote p{font-family:"Space Mono",monospace;font-size:.72rem;color:#6b7280;line-height:1.7}
.softnote b{color:#9fb0b3}
.totop{position:fixed;right:1.1rem;bottom:1.3rem;z-index:50;width:2.9rem;height:2.9rem;border-radius:50%;background:#152a2f;border:1px solid #2a4d55;color:#3ddc97;font-size:1.1rem;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .3s,transform .3s,background .2s;box-shadow:0 8px 24px rgba(0,0,0,.5)}
.totop.show{opacity:1;transform:translateY(0);pointer-events:auto}
.totop:hover{background:#3ddc97;color:#071417}
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
["Our privacy promise","<p>RingMang is built to collect as little as possible. Because listeners never create accounts, we do not store listener passwords, profiles, or purchase histories — there simply are none. This policy explains the small amount of data that does exist, and the choices you have over it.</p>"],
["Information we collect","<ul><li><strong>Nothing required to listen or download.</strong> You can browse, preview and download without giving us any personal information.</li><li><strong>Aggregate popularity.</strong> We keep a non-identifying download count per track, only to show how popular it is.</li><li><strong>Standard access logs.</strong> Our CDN (Cloudflare) automatically sees technical data such as IP address, browser and device type, and the pages requested. This is used to deliver pages, cache content and stop abuse — not to build a profile of you.</li><li><strong>Forms.</strong> If you submit a DMCA notice or the contact form, we receive the name, email and message you choose to type.</li></ul>"],
["How we use it","<p>We use the limited data above only to run and protect the Service: to serve pages and files, to show popularity counts, to handle your form submissions, and to keep the site secure. We do not sell personal data, and we do not build advertising profiles of listeners — we have none to build.</p>"],
["Legal basis, in plain terms","<p>Where the law asks for a basis: we rely on your <strong>consent</strong> before showing ads; on our <strong>legitimate interest</strong> in delivering the Service and keeping it secure; and, for forms, on the need to <strong>respond to your request</strong> (and, for DMCA, our legal obligation to handle valid notices).</p>"],
["Cookies & local storage","<p>We do <strong>not</strong> use tracking cookies for ad profiling. We store a few small items in your browser’s local storage only to remember your ad-consent choice, whether you dismissed the install prompt, and to make offline use (PWA) work. These are functional, not tracking. You can clear them at any time in your browser settings.</p>"],
["Service providers & where data lives","<p>We use <strong>Cloudflare</strong> (hosting, CDN and file storage) and <strong>Supabase</strong> (database and admin sign-in). They process data on our behalf and store it in their own regions. Ringtone files live on Cloudflare R2 and are served through short-lived signed links, not a public bucket. By using the Service you accept that data may be processed in the countries where these providers operate.</p>"],
["Advertising & your consent","<p>Ads appear only after you give consent. When an ad is shown, the ad network may receive the same standard technical data a normal web request includes (for example IP, browser and the page URL) so it can choose an ad. Ads render in isolated (sandboxed) frames so they <strong>cannot read your RingMang data</strong>. If you decline ads, the Service still works fully.</p>"],
["Your rights","<p>Depending on where you live, you may have rights to access, correct, delete, or restrict the use of personal data, and to withdraw consent. Because we hold so little about listeners, most requests are simple: clear your site data to remove local storage and the offline cache, or write to us via the <a href=\"/contact\">contact page</a> and we will handle form-related data. We will respond within a reasonable time.</p>"],
["Children","<p>RingMang is not directed to children under 13. We do not knowingly collect personal data from children. If you believe a child has sent us information, contact us and we will remove it.</p>"],
["Security","<p>We take reasonable steps to protect the Service: admin access requires two-factor authentication, database access is restricted by row-level rules, and audio is delivered through expiring signed links. No system is perfectly secure, but we design with caution and we do not hold sensitive listener data that would make a breach catastrophic.</p>"],
["Retention","<p>Form submissions are kept only as long as needed to handle the request. Access logs follow our providers’ own retention policies. Aggregate download counts are kept as part of running the Service.</p>"],
["Changes & contact","<p>We may update this Privacy Policy; the “Last updated” date above will change when we do, and material changes are posted here. For any privacy question or request, use the <a href=\"/contact\">contact page</a> — we read every message.</p>"]
];
function toc(){return SECS.map((s,i)=>'<a class="toclink" href="#s'+(i+1)+'" data-toc="'+(i+1)+'"><span class="tn">'+String(i+1).padStart(2,"0")+'</span><span class="tt">'+escHtml(s[0])+'</span></a>').join("")}
function prose(){return SECS.map((s,i)=>'<section class="sec" id="s'+(i+1)+'"><div class="sec-h"><span class="sec-n">'+String(i+1).padStart(2,"0")+'</span><h2>'+escHtml(s[0])+'</h2></div>'+s[1]+'</section>').join("")}
export async function onRequestGet(context){
 const origin=new URL(context.request.url).origin;const L=(u)=>origin+u;
 const foot='<div class="foot-links"><a href="'+L("/terms")+'">Terms</a><a href="'+L("/privacy")+'">Privacy</a><a href="'+L("/dmca")+'">DMCA</a><a href="'+L("/contact")+'">Contact</a><a href="'+L("/")+'">Home</a></div>';
 const html='<!doctype html><html lang="en"><head>'
  +'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
  +'<title>Privacy Policy — RingMang</title>'
  +'<meta name="description" content="Privacy Policy for RingMang — what little data we handle, cookies, service providers, ads and your rights, in plain language.">'
  +'<meta name="robots" content="index,follow"><link rel="canonical" href="'+L("/privacy")+'">'
  +'<meta property="og:type" content="article"><meta property="og:site_name" content="RingMang"><meta property="og:title" content="Privacy Policy — RingMang"><meta property="og:description" content="How RingMang handles data — minimal by design, with your choices front and centre."><meta property="og:url" content="'+L("/privacy")+'"><meta property="og:image" content="'+L("/icon.svg")+'">'
  +'<meta name="twitter:card" content="summary"><meta name="theme-color" content="#071417"><link rel="manifest" href="/manifest.webmanifest"><link rel="icon" type="image/svg+xml" href="/icon.svg"><link rel="apple-touch-icon" href="/icon.svg">'
  +'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Outfit:wght@300;400;500;600&family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">'
  +'<style>'+CSS+'</style></head><body>'
  +'<div class="progress"><div id="pf" class="progress-fill"></div></div>'
  +'<div class="watermark" aria-hidden="true">§</div>'
  +'<div class="stage"></div>'
  +'<header class="top"><div class="top-in"><a class="brand" href="'+L("/")+'"><div class="eqm" aria-hidden="true"><span></span><span></span><span></span><span></span></div><span class="wm">Ring<span class="c">Mang</span></span></a><a class="back" href="'+L("/")+'">← Home</a></div></header>'
  +'<main class="wrap">'
  +'<div class="opener"><div class="kicker"><span class="ln"></span>LEGAL · PRIVACY POLICY</div>'
  +'<h1>Privacy Policy</h1>'
  +'<p class="lede">We collect as little data as possible — listeners never create an account, so there are no passwords or profiles to store. This policy explains the small amount of data that does exist, and the choices you have over it.</p>'
  +'<div class="meta-row"><span class="meta-pill"><span class="d"></span>Effective <b>'+UPDATED+'</b></span><span class="meta-pill">Version <b>'+VERSION+'</b></span><span class="meta-pill">No listener accounts <b>by design</b></span><span class="meta-pill">No ad-tracking cookies <b>ever</b></span></div>'
  +'</div>'
  +'<nav class="toc" aria-label="On this page">'+toc()+'</nav>'
  +'<div class="prose">'+prose()
  +'<div class="softnote"><p><b>A plain-language note.</b> This policy describes exactly how RingMang works today and is complete as published. RingMang is run independently, without in-house legal counsel. If the project later scales into a larger company, a qualified lawyer in your region can refine the wording — but you do not need one to rely on this policy as it stands.</p></div>'
  +'</div></main>'
  +'<footer class="foot"><div class="foot-in">'+foot+'<p>© 2026 RingMang · All rights reserved · Made for music lovers.</p></div></footer>'
  +'<button id="totop" class="totop" aria-label="Back to top">↑</button>'
  +'<script>'+CLIENT+'</script></body></html>';
 return new Response(html,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"public, max-age=300, s-maxage=600"}});
}
// RM14A_PRIVACY_END
