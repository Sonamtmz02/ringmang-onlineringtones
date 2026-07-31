/**
 * RingMang Users — Phase 6 (Home/List) + 7 (Player+Silent DL) + 8 (Search/Filter) + 9 (Share/SEO) + 10B (Ad layer)
 * Public read via RLS. Audio via Edge signed URL. Ads: consent-gated, sandboxed (no allow-same-origin), freq-capped.
 */
const { SUPABASE_URL, SUPABASE_ANON_KEY, APP_NAME, PAGE_SIZE } = window.RINGMANG_CONFIG || {};
const $=(id)=>document.getElementById(id);
const el={
 topbarCount:$("topbar-count"),tickerTrack:$("ticker-track"),statRingtones:$("stat-ringtones"),statDownloads:$("stat-downloads"),statCategories:$("stat-categories"),categoryChips:$("category-chips"),
 library:$("library"),scanner:$("scanner"),searchInput:$("search-input"),searchClear:$("search-clear"),searchHint:$("search-hint"),
 filterRibbon:$("filter-ribbon"),ribbonCat:$("ribbon-cat"),ribbonQ:$("ribbon-q"),ribbonClear:$("ribbon-clear"),
 grid:$("ringtone-grid"),emptyState:$("empty-state"),filterEmpty:$("filter-empty"),feSub:$("fe-sub"),feClear:$("fe-clear"),shownCount:$("shown-count"),loadMoreBtn:$("load-more-btn"),toast:$("toast"),toastMessage:$("toast-message"),
 homeBannerWrap:$("home-banner-wrap"),homeBanner:$("home-banner"),
 playerModal:$("player-modal"),playerClose:$("player-close"),playerViz:$("player-viz"),playerCat:$("player-cat"),playerTitle:$("player-title"),playerArtist:$("player-artist"),playerCur:$("player-cur"),playerBar:$("player-bar"),playerDur:$("player-dur"),playerToggle:$("player-toggle"),playerBack10:$("player-back10"),playerFwd10:$("player-fwd10"),playerVol:$("player-vol"),playerDownload:$("player-download"),playerShell:null,
 dlModal:$("dl-modal"),dlClose:$("dl-close"),dlTrack:$("dl-track"),dlAdSlot:$("dl-ad-slot"),dlCountdownPhase:$("dl-countdown-phase"),dlRingFg:$("dl-ring-fg"),dlCount:$("dl-count"),dlProgressPhase:$("dl-progress-phase"),dlProgBar:$("dl-prog-bar"),dlProgText:$("dl-prog-text"),dlDonePhase:$("dl-done-phase"),dlAction:$("dl-action"),
 interstitial:$("interstitial"),interAd:$("interstitial-ad"),interSkip:$("inter-skip"),
 consentBanner:$("consent-banner"),consentText:$("consent-text"),consentAccept:$("consent-accept"),consentDecline:$("consent-decline"),
};
el.playerShell=el.playerModal?el.playerModal.querySelector(".player-shell"):null;

const filter={q:"",catId:null,catName:null,catSlug:null};
const filterActive=()=>!!(filter.q||filter.catId);
let ringtoneOffset=0;

// ===== Ad state (Phase 10B) =====
const AD={ consentRequired:true, aggressiveMaster:false, freqCap:1, consentText:"", slots:{}, ready:false, consentGiven:null };
const CONSENT_KEY="rm_ad_consent_v1"; // "yes" | "no"
const INTER_KEY="rm_inter_count_v1";

function escHtml(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escAttr(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function cssAttr(s){return String(s).replace(/["\\]/g,"\\$&")}
function formatBytes(b){if(b<1024)return b+" B";if(b<1048576)return(b/1024).toFixed(1)+" KB";return(b/1048576).toFixed(2)+" MB"}
function formatCount(n){if(n>=1000000)return(n/1000000).toFixed(1)+"M";if(n>=1000)return(n/1000).toFixed(1)+"K";return String(n)}
function fmtTime(s){if(!isFinite(s)||s<0)s=0;return Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0")}
function extFromMime(m){return({"audio/mpeg":"mp3","audio/mp4":"m4a","audio/ogg":"ogg","audio/wav":"wav"})[m]||"mp3"}
function safeName(t,e){return(String(t).replace(/[^\w\-]+/g,"_").replace(/^_+|_+$/g,"").slice(0,60)||"ringtone")+"."+e}
let toastTimer;
function showToast(m){if(!el.toast)return;el.toastMessage.textContent=m;el.toast.classList.remove("hidden");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.toast.classList.add("hidden"),3000)}
function countUp(tEl,target,dur=1300){if(!tEl)return;const st=performance.now();(function tick(now){const p=Math.min((now-st)/dur,1);tEl.textContent=Math.round(target*(1-Math.pow(1-p,3))).toLocaleString();if(p<1)requestAnimationFrame(tick)})(st)}
const revealObserver=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("revealed");revealObserver.unobserve(e.target)}})},{threshold:0.08});
function waveSpans(seed){let b="";for(let i=0;i<14;i++){const h=25+Math.abs(Math.sin(seed*3.7+i*1.3))*75;b+=`<span style="height:${Math.round(h)}%"></span>`}return b}
function slugify(s){return String(s||"").toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/[\s-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60)||"ringtone"}
function shareUrl(id,slug){return location.origin+"/ringtone/"+encodeURIComponent(slug||"ringtone")}
async function doShare(id,slug,title){const url=shareUrl(id,slug);const text=(title||"RingMang")+" — free ringtone on RingMang";
 try{if(navigator.share){await navigator.share({title:title||"RingMang",text,url});return}}catch(e){}
 try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(url);showToast("🔗 Share link copied!");return}}catch(e){}
 const ta=document.createElement("textarea");ta.value=url;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();
 try{document.execCommand("copy");showToast("🔗 Share link copied!")}catch(e2){showToast("Copy this link: "+url)}ta.remove()}

function showFatalBanner(title,body){const old=document.getElementById("fatal-banner");if(old)old.remove();
 const b=document.createElement("div");b.id="fatal-banner";b.setAttribute("role","alert");
 b.style.cssText="position:fixed;top:0;left:0;right:0;z-index:9999;background:#2a0e0e;border-bottom:2px solid #ff6b4a;color:#ffd9cf;padding:14px 16px 16px;font-family:'Space Mono',monospace;font-size:12px;line-height:1.6;box-shadow:0 10px 30px rgba(0,0,0,.55)";
 b.innerHTML=`<div style="font-family:'Unbounded',sans-serif;font-weight:700;color:#ff6b4a;font-size:13px;margin-bottom:6px">⚠ ${title}</div><div>${body}</div><button id="fatal-close" style="margin-top:10px;background:transparent;border:1px solid #ff6b4a;color:#ff6b4a;border-radius:6px;padding:5px 12px;font-family:'Space Mono',monospace;font-size:11px;cursor:pointer">लुकाउनुहोस्</button>`;
 document.body.prepend(b);document.getElementById("fatal-close").addEventListener("click",()=>b.remove())}

let supabaseClient=null;
function createSafeClient(){
 if(!SUPABASE_URL||String(SUPABASE_URL).includes("YOUR_SUPABASE")){showFatalBanner("CONFIG MISSING","ringmang-onlineringtones repo को <b>config.js</b> मा वास्तविक Supabase URL राख्नुहोस्।");return false}
 if(!SUPABASE_ANON_KEY||String(SUPABASE_ANON_KEY).includes("YOUR_SUPABASE")){showFatalBanner("CONFIG MISSING","config.js मा <b>SUPABASE_ANON_KEY</b> राख्नुहोस्।");return false}
 try{supabaseClient=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);return true}catch(e){showFatalBanner("CONNECTION ERROR","<code>"+escHtml(e.message)+"</code> — config.js जाँच्नुहोस्।");return false}}

async function fetchSigned(id,intent){const res=await fetch(`${SUPABASE_URL}/functions/v1/serve-ringtone?id=${encodeURIComponent(id)}&intent=${intent}`,{headers:{apikey:SUPABASE_ANON_KEY}});
 const data=await res.json().catch(()=>({}));if(!res.ok||!data.url)throw new Error(data.error||"Could not prepare audio");return data}

// ===== AD LAYER (Phase 10B) =====
function adAllowed(slotName){const s=AD.slots[slotName];if(!s)return false;const code=(s.ad_code||"").trim();if(!code)return false;if(!s.is_active)return false;if(s.aggressive&&!AD.aggressiveMaster)return false;return true}
function adMayShow(){return AD.consentGiven===true||(AD.consentGiven===null&&!AD.consentRequired)}
// Render arbitrary admin-provided code inside a SANDBOXED iframe (no allow-same-origin => cannot read main-site cookies/storage).
function renderSandboxed(container,code,emptyLabel){
 if(!container)return;
 if(!code||!code.trim()){container.innerHTML='<div class="ad-empty"><span>'+escHtml(emptyLabel||"Sponsored · awaiting signal")+'</span></div>';return}
 const doc='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;background:transparent}body{display:flex;align-items:center;justify-content:center;min-height:90px;font-family:monospace;font-size:12px;color:#9ca3af;text-align:center;padding:8px;overflow:hidden}a{color:#38bdf8}img{max-width:100%;height:auto;border-radius:6px}</style></head><body>'+code+'</body></html>';
 const tag='<span class="ad-tag">AD</span>';
 container.innerHTML=tag+'<iframe sandbox="allow-scripts allow-popups" referrerpolicy="no-referrer" title="Sponsored content" srcdoc="'+escAttr(doc)+'"></iframe>'}
function fillBanner(){if(!el.homeBanner)return;if(adMayShow()&&adAllowed("homepage_banner")){el.homeBannerWrap.classList.remove("hidden");renderSandboxed(el.homeBanner,AD.slots["homepage_banner"].ad_code)}else{el.homeBannerWrap.classList.add("hidden")}}
function fillDownloadAd(){if(!el.dlAdSlot)return;
 if(!adMayShow()){el.dlAdSlot.innerHTML='<div class="ad-empty"><b>Sponsored space</b><span>'+(AD.consentGiven===false?"You declined sponsor messages — downloads still work free.":"Accept sponsors in the banner below to see them here.")+'</span></div>';return}
 if(adAllowed("download_modal")){renderSandboxed(el.dlAdSlot,AD.slots["download_modal"].ad_code)}
 else{el.dlAdSlot.innerHTML='<div class="ad-empty"><b>Sponsored space</b><span>No sponsor configured yet · your download is unaffected</span></div>'}}
function interCount(){try{return parseInt(sessionStorage.getItem(INTER_KEY)||"0",10)||0}catch(e){return 0}}
function interBump(){try{sessionStorage.setItem(INTER_KEY,String(interCount()+1))}catch(e){}}
function showInterstitial(){if(!adMayShow())return;if(!adAllowed("homepage_interstitial"))return;if(interCount()>=(AD.freqCap||0))return;
 renderSandboxed(el.interAd,AD.slots["homepage_interstitial"].ad_code,"Sponsored intermission");
 el.interstitial.classList.remove("hidden");document.body.style.overflow="hidden";interBump();
 let n=3;el.interSkip.disabled=true;el.interSkip.textContent="Skip in "+n;
 const iv=setInterval(()=>{n--;if(n<=0){clearInterval(iv);el.interSkip.disabled=false;el.interSkip.textContent="Skip ad ▸"}else{el.interSkip.textContent="Skip in "+n}},1000)}
function closeInterstitial(){el.interstitial.classList.add("hidden");document.body.style.overflow=""}
async function loadAdSettings(){try{
 const[{data:app},{data:slots}]=await Promise.all([
  supabaseClient.from("app_settings").select("setting_key,setting_value").in("setting_key",["ad_consent_required","ad_aggressive_enabled","ad_interstitial_freq_cap","ad_consent_text"]),
  supabaseClient.from("ad_settings").select("slot_name,ad_code,is_active,aggressive,format_type")]);
 const m=Object.fromEntries((app||[]).map(r=>[r.setting_key,r.setting_value]));
 AD.consentRequired=(m.ad_consent_required||"true")==="true";
 AD.aggressiveMaster=(m.ad_aggressive_enabled||"false")==="true";
 AD.freqCap=Math.max(0,parseInt(m.ad_interstitial_freq_cap||"1",10));
 AD.consentText=m.ad_consent_text||"";
 AD.slots={};(slots||[]).forEach(s=>{AD.slots[s.slot_name]=s});
 AD.ready=true;
}catch(e){console.warn("Ad settings load failed:",e.message);AD.ready=true}}
function applyConsentText(){if(AD.consentText&&el.consentText)el.consentText.textContent=AD.consentText}
function showConsentBanner(){applyConsentText();el.consentBanner.classList.remove("hidden")}
function hideConsentBanner(){el.consentBanner.classList.add("hidden")}
function onConsentAccept(){try{localStorage.setItem(CONSENT_KEY,"yes")}catch(e){}AD.consentGiven=true;hideConsentBanner();fillBanner();fillDownloadAd();setTimeout(showInterstitial,1200)}
function onConsentDecline(){try{localStorage.setItem(CONSENT_KEY,"no")}catch(e){}AD.consentGiven=false;hideConsentBanner();fillBanner();fillDownloadAd()}
async function initAds(){await loadAdSettings();
 try{const v=localStorage.getItem(CONSENT_KEY);AD.consentGiven=(v==="yes")?true:(v==="no")?false:null}catch(e){AD.consentGiven=null}
 if(AD.consentRequired&&AD.consentGiven===null){showConsentBanner();fillDownloadAd()} // ads wait; download slot shows honest note
 else{fillBanner();fillDownloadAd();if(AD.consentGiven!==false)setTimeout(showInterstitial,1500)}}

// ===== URL state (Phase 8) =====
function updateURL(){const p=new URLSearchParams();if(filter.q)p.set("q",filter.q);if(filter.catId&&filter.catSlug)p.set("cat",filter.catSlug);const qs=p.toString();const url=location.pathname+(qs?("?"+qs):"")+(location.hash||"");try{history.replaceState(null,"",url)}catch{}}
function readURL(){const p=new URLSearchParams(location.search);const q=p.get("q")||"",catSlug=p.get("cat")||"";filter.q=q;if(q){el.searchInput.value=q;el.searchClear.classList.remove("hidden")}
 if(catSlug){const btn=el.categoryChips.querySelector(`.chip[data-slug="${cssAttr(catSlug)}"]`);if(btn){filter.catId=btn.dataset.id;filter.catName=btn.dataset.name;filter.catSlug=catSlug}}markActiveChip(filter.catId);updateRibbon()}
function markActiveChip(id){el.categoryChips.querySelectorAll(".chip").forEach(c=>{c.classList.toggle("active",id?c.dataset.id===id:c.dataset.id==="all")})}
function updateRibbon(){const active=filterActive();el.filterRibbon.classList.toggle("hidden",!active);
 if(filter.catId){el.ribbonCat.classList.remove("hidden");el.ribbonCat.textContent="▤ "+(filter.catName||"Category")}else el.ribbonCat.classList.add("hidden");
 if(filter.q){el.ribbonQ.classList.remove("hidden");el.ribbonQ.textContent='🔍 "'+filter.q+'"'}else el.ribbonQ.classList.add("hidden")}
function setScanning(on){el.scanner.classList.toggle("scanning",on)}
async function applyFilter(opts={}){ringtoneOffset=0;if(!opts.fromURL)updateURL();updateRibbon();markActiveChip(filter.catId);setScanning(true);el.searchHint.innerHTML='<span class="hl">Scanning the library…</span>';await loadRingtones(false);setScanning(false);if(opts.scroll&&el.library)el.library.scrollIntoView({behavior:"smooth",block:"start"})}
function clearAll(){filter.q="";filter.catId=null;filter.catName=null;filter.catSlug=null;el.searchInput.value="";el.searchClear.classList.add("hidden");applyFilter()}

// ===== Audio Manager =====
const Audio_={el:null,ctx:null,srcNode:null,analyser:null,freq:null,useReal:false,graphReady:false,raf:null,currentId:null,currentBtn:null,
 init(){if(this.el)return;this.el=new window.Audio();this.el.preload="metadata";this.el.crossOrigin="anonymous";
  this.el.addEventListener("loadedmetadata",()=>{el.playerDur.textContent=fmtTime(this.el.duration);el.playerBar.max=this.el.duration||100});
  this.el.addEventListener("timeupdate",()=>{if(this.el.duration){el.playerCur.textContent=fmtTime(this.el.currentTime);if(!seeking)el.playerBar.value=this.el.currentTime}});
  this.el.addEventListener("ended",()=>this.setPlaying(false));this.el.addEventListener("play",()=>{this.setPlaying(true);this.startViz()});
  this.el.addEventListener("pause",()=>this.setPlaying(false));this.el.addEventListener("error",()=>{showToast("⚠ Audio load भएन। फेरि प्रयास गर्नुहोस्।");this.setPlaying(false)})},
 buildViz(){if(el.playerViz.children.length)return;let h="";for(let i=0;i<28;i++)h+="<span></span>";el.playerViz.innerHTML=h},
 ensureGraph(){if(this.graphReady)return this.useReal;try{this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.srcNode=this.ctx.createMediaElementSource(this.el);this.analyser=this.ctx.createAnalyser();this.analyser.fftSize=64;this.freq=new Uint8Array(this.analyser.frequencyBinCount);this.srcNode.connect(this.analyser);this.analyser.connect(this.ctx.destination);this.graphReady=true;this.useReal=true;return true}catch(e){this.useReal=false;return false}},
 startViz(){cancelAnimationFrame(this.raf);const bars=el.playerViz.children;if(this.useReal)el.playerViz.classList.remove("viz-fake");else el.playerViz.classList.add("viz-fake");
  const loop=()=>{if(this.el.paused)return;if(this.useReal&&this.analyser){try{this.analyser.getByteFrequencyData(this.freq);let sum=0;for(let i=0;i<bars.length;i++){const v=this.freq[i%this.freq.length];sum+=v;bars[i].style.height=(12+(v/255)*88)+"%"}if(sum===0){this.useReal=false;el.playerViz.classList.add("viz-fake")}}catch(e){this.useReal=false;el.playerViz.classList.add("viz-fake")}}this.raf=requestAnimationFrame(loop)};this.raf=requestAnimationFrame(loop)},
 setPlaying(on){el.playerToggle.textContent=on?"❚❚":"▶";el.playerShell.classList.toggle("playing",on);el.playerViz.classList.toggle("playing",on);if(this.currentBtn)this.currentBtn.classList.toggle("is-active",on);if(!on)cancelAnimationFrame(this.raf)},
 async load(id,meta,btn){this.init();this.buildViz();
  if(this.currentId===id&&!this.el.paused){this.el.pause();return}
  if(this.currentId===id&&this.el.paused){this.el.play().catch(()=>{});this.currentBtn=btn;return}
  this.currentBtn=btn;this.currentId=id;el.playerTitle.textContent=meta.title;el.playerTitle.style.whiteSpace="normal";el.playerTitle.style.overflowWrap="anywhere";el.playerTitle.style.wordBreak="break-word";el.playerArtist.textContent=meta.artist;el.playerCat.textContent=meta.cat;el.playerCur.textContent="0:00";el.playerDur.textContent="0:00";el.playerBar.value=0;
  try{const s=await fetchSigned(id,"play");this.el.src=s.url;this.el.load();this.ensureGraph();if(this.ctx&&this.ctx.state==="suspended")this.ctx.resume();await this.el.play()}catch(e){showToast("▶ Play भएन: "+e.message);this.setPlaying(false)}},
 toggle(){if(!this.el||!this.el.src)return;if(this.el.paused)this.el.play().catch(()=>{});else this.el.pause()},
 seek(v){if(!this.el)return;this.el.currentTime=parseFloat(v)},vol(v){if(this.el)this.el.volume=parseFloat(v)},
 skip(sec){if(!this.el)return;this.el.currentTime=Math.max(0,Math.min((this.el.duration||0),this.el.currentTime+sec))}};
let seeking=false;
function openPlayer(id,meta,btn){Audio_.load(id,meta,btn);el.playerModal.classList.remove("hidden");document.body.style.overflow="hidden"}
function closePlayer(){el.playerModal.classList.add("hidden");document.body.style.overflow=""}

// ===== Download flow =====
let dlState="idle",dlCurrentId=null,dlCurrentTitle="";const RING_CIRC=276.46;
function openDlModal(id,title){dlCurrentId=id;dlCurrentTitle=title;dlState="countdown";el.dlTrack.textContent=title;
 el.dlCountdownPhase.classList.remove("hidden");el.dlProgressPhase.classList.add("hidden");el.dlDonePhase.classList.add("hidden");
 el.dlAction.disabled=true;el.dlAction.textContent="Please wait…";fillDownloadAd();
 el.dlModal.classList.remove("hidden");document.body.style.overflow="hidden";runCountdown(5)}
function closeDlModal(){el.dlModal.classList.add("hidden");document.body.style.overflow="";dlState="idle"}
function runCountdown(n){el.dlCount.textContent=n;el.dlRingFg.style.strokeDashoffset="0";
 const tick=()=>{if(dlState!=="countdown")return;el.dlRingFg.style.strokeDashoffset=String(RING_CIRC*(1-n/5));
  if(n<=0){dlReady();return}el.dlCount.textContent=n;el.dlAction.textContent=`Please wait (${n}s)`;n--;setTimeout(tick,1000)};tick()}
function dlReady(){dlState="ready";el.dlCount.textContent="✓";el.dlAction.disabled=false;el.dlAction.textContent="⬇ Download Now"}
async function beginDownloadFetch(){if(dlState!=="ready"||!dlCurrentId)return;dlState="fetching";
 el.dlCountdownPhase.classList.add("hidden");el.dlProgressPhase.classList.remove("hidden");el.dlProgBar.style.width="0%";el.dlProgBar.classList.remove("indet");el.dlProgText.textContent="Preparing secure link…";el.dlAction.disabled=true;el.dlAction.textContent="Downloading…";
 try{const meta=await fetchSigned(dlCurrentId,"download");el.dlProgText.textContent="Fetching from secure storage…";
  const res=await fetch(meta.url);if(!res.ok)throw new Error("Storage fetch failed");
  const total=parseInt(res.headers.get("Content-Length")||"0",10);const reader=res.body.getReader();const chunks=[];let loaded=0;if(!total)el.dlProgBar.classList.add("indet");
  while(true){const{done,value}=await reader.read();if(done)break;chunks.push(value);loaded+=value.length;if(total){const p=Math.min(100,(loaded/total)*100);el.dlProgBar.classList.remove("indet");el.dlProgBar.style.width=p.toFixed(0)+"%";el.dlProgText.textContent=`Downloading… ${p.toFixed(0)}%`}}
  const blob=new Blob(chunks,{type:meta.mime_type||"audio/mpeg"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=safeName(dlCurrentTitle,extFromMime(meta.mime_type));document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  dlState="done";el.dlProgressPhase.classList.add("hidden");el.dlDonePhase.classList.remove("hidden");el.dlAction.disabled=false;el.dlAction.textContent="Close";showToast(`✓ "${dlCurrentTitle}" save भयो!`);refreshStatsQuiet()}
 catch(e){dlState="idle";showToast("⬇ Download भएन: "+e.message);closeDlModal()}}
async function refreshStatsQuiet(){try{const{count}=await supabaseClient.from("ringtones").select("*",{count:"exact",head:true});if(count!=null)el.topbarCount.textContent=count}catch{}}

// ===== Ticker / Stats / Chips =====
async function loadTicker(){try{const{data,error}=await supabaseClient.from("ringtones").select("title, download_count").order("download_count",{ascending:false}).limit(10);if(error)throw error;if(!data||!data.length){el.tickerTrack.innerHTML='<span class="font-mono text-xs text-gray-500 py-2.5">Fresh ringtones dropping soon…</span>';return}
 const items=data.map(r=>`<span class="ticker-item"><span class="t-title">${escHtml(r.title)}</span><span class="t-count">▲ ${formatCount(r.download_count||0)}</span><span class="t-sep">◆</span></span>`).join("");el.tickerTrack.innerHTML=items+items}catch(e){el.tickerTrack.innerHTML='<span class="font-mono text-xs text-gray-500 py-2.5">Trending unavailable</span>'}}
async function loadStats(){try{const[{count:rCount},{count:cCount},{data:dlRows}]=await Promise.all([supabaseClient.from("ringtones").select("*",{count:"exact",head:true}),supabaseClient.from("categories").select("*",{count:"exact",head:true}),supabaseClient.from("ringtones").select("download_count")]);
 const totalDl=(dlRows||[]).reduce((s,r)=>s+(r.download_count||0),0);el.topbarCount.textContent=rCount||0;countUp(el.statRingtones,rCount||0);countUp(el.statDownloads,totalDl);countUp(el.statCategories,cCount||0)}catch(e){showToast("Stats load भएन: "+e.message)}}
async function loadCategoryChips(){try{const{data:cats}=await supabaseClient.from("categories").select("id, name, slug").order("name");const{data:rings}=await supabaseClient.from("ringtones").select("category_id");const cm={};(rings||[]).forEach(r=>{if(r.category_id)cm[r.category_id]=(cm[r.category_id]||0)+1});const total=(rings||[]).length;
 if(!cats||!cats.length){el.categoryChips.innerHTML='<button class="chip active" data-id="all">All<span class="chip-count">'+total+'</span></button><span class="font-mono text-[11px] text-gray-600 py-2 ml-2">Categories coming soon…</span>';return}
 const allChip=`<button class="chip ${!filter.catId?'active':''}" data-id="all">All<span class="chip-count">${total}</span></button>`;
 const catChips=cats.map(c=>`<button class="chip ${filter.catId===c.id?'active':''}" data-id="${c.id}" data-slug="${escHtml(c.slug)}" data-name="${escHtml(c.name)}">${escHtml(c.name)}<span class="chip-count">${cm[c.id]||0}</span></button>`).join("");
 el.categoryChips.innerHTML=allChip+catChips}catch{el.categoryChips.innerHTML='<span class="font-mono text-[11px] text-gray-600 py-2">Categories unavailable</span>'}}

function renderCard(r,idx){const ra=parseFloat(r.rating_avg)||0,rc=r.rating_count||0;let cstars="";if(rc>0){for(let i=0;i<5;i++){const w=Math.max(0,Math.min(1,ra-i))*100;cstars+='<span class="cstar"><span class="csb">★</span><span class="csf" style="width:'+w.toFixed(1)+'%">★</span></span>'}cstars='<span class="card-stars" title="'+ra.toFixed(1)+' / 5 · '+rc+' ratings">'+cstars+'</span><span class="card-rate">'+ra.toFixed(1)+'</span>'}else{cstars='<span class="card-stars empty" aria-hidden="true">'+Array(5).fill('<span class="cstar"><span class="csb">★</span></span>').join('')+'</span><span class="card-new">new</span>'}const isCopy=r.copyright_status==="copyrighted";;const artist=r.artists?.name||"Unknown Artist",cat=r.categories?.name||"Uncategorized";
 const card=document.createElement("div");card.className="ring-card";card.style.transitionDelay=`${(idx%PAGE_SIZE)*40}ms`;
 card.innerHTML=`<div class="card-wave" aria-hidden="true">${waveSpans(idx+r.title.length)}</div>
  <div class="flex items-start justify-between gap-3"><div class="min-w-0"><a class="card-title truncate" href="/ringtone/${escHtml(r.seo_slug||slugify(r.title))}">${escHtml(r.title)}</a><p class="card-sub truncate">${escHtml(artist)} · ${escHtml(cat)}</p></div>${isCopy?'<span class="badge-copy">©</span>':'<span class="badge-orig">FREE</span>'}</div>
  <div class="card-meta">${cstars}<span>${formatBytes(r.file_size_bytes)}</span><span class="dl">⬇ ${formatCount(r.download_count||0)}</span></div>
  <div class="card-actions"><button class="btn-play" data-id="${r.id}" data-title="${escHtml(r.title)}" data-artist="${escHtml(artist)}" data-cat="${escHtml(cat)}">▶ Play</button><button class="btn-download" data-id="${r.id}" data-title="${escHtml(r.title)}">⬇ Get</button><button class="btn-share" data-id="${r.id}" data-title="${escHtml(r.title)}" data-slug="${escHtml(r.seo_slug||slugify(r.title))}" aria-label="Share">⤴</button></div>`;
 return card}
async function loadRingtones(append=false){if(!append)el.grid.innerHTML='<div class="card-skeleton"></div>'.repeat(6);
 try{const from=ringtoneOffset,to=from+PAGE_SIZE-1;let query=supabaseClient.from("ringtones").select("*, categories(name, slug), artists(name, slug)",{count:"exact"});
  if(filter.catId)query=query.eq("category_id",filter.catId);if(filter.q)query=query.ilike("title",`%${filter.q}%`);
  query=query.order("created_at",{ascending:false}).range(from,to);const{data,error,count}=await query;if(error)throw error;const matchCount=count||0;if(!append)el.grid.innerHTML="";
  if(!data||!data.length){if(filterActive()){el.filterEmpty.classList.remove("hidden");el.emptyState.classList.add("hidden");el.feSub.textContent=filter.q?`Nothing found for "${filter.q}".`:"No ringtones in this category yet."}else{el.emptyState.classList.remove("hidden");el.filterEmpty.classList.add("hidden")}el.loadMoreBtn.classList.add("hidden");el.shownCount.textContent=ringtoneOffset;updateHint(matchCount);return}
  el.emptyState.classList.add("hidden");el.filterEmpty.classList.add("hidden");data.forEach((r,i)=>{const c=renderCard(r,from+i);el.grid.appendChild(c);revealObserver.observe(c)});
  ringtoneOffset+=data.length;el.shownCount.textContent=ringtoneOffset;if(ringtoneOffset<matchCount)el.loadMoreBtn.classList.remove("hidden");else el.loadMoreBtn.classList.add("hidden");updateHint(matchCount)}
 catch(e){if(!append)el.grid.innerHTML='<p class="col-span-full text-center text-gray-500 py-10">Ringtones load भएनन्।</p>';showToast("Ringtones load भएन: "+e.message);el.searchHint.innerHTML=""}}
function updateHint(matchCount){if(filterActive()){el.searchHint.innerHTML=`<b>${matchCount}</b> match${matchCount===1?"":"es"}${filter.q?` for "<span class="hl">${escHtml(filter.q)}</span>"`:""}${filter.catName?` in <span class="hl">${escHtml(filter.catName)}</span>`:""}`}else{el.searchHint.innerHTML=`Browse the full library · <b>${matchCount}</b> ringtones · newest first`}}

// ===== Card actions =====
el.grid.addEventListener("click",e=>{const btn=e.target.closest(".btn-play, .btn-download, .btn-share");if(!btn)return;const id=btn.dataset.id,title=btn.dataset.title;
 if(btn.classList.contains("btn-play"))openPlayer(id,{title,artist:btn.dataset.artist,cat:btn.dataset.cat},btn);
 else if(btn.classList.contains("btn-share"))doShare(id,btn.dataset.slug||slugify(title),title);
 else openDlModal(id,title)});

// ===== Search =====
let searchTimer;
el.searchInput.addEventListener("input",e=>{const v=e.target.value;el.searchClear.classList.toggle("hidden",v.length===0);clearTimeout(searchTimer);searchTimer=setTimeout(()=>{filter.q=v.trim();applyFilter()},320)});
el.searchInput.addEventListener("keydown",e=>{if(e.key==="Escape"){el.searchInput.value="";filter.q="";el.searchClear.classList.add("hidden");applyFilter()}});
el.searchClear.addEventListener("click",()=>{el.searchInput.value="";filter.q="";el.searchClear.classList.add("hidden");el.searchInput.focus();applyFilter()});
el.categoryChips.addEventListener("click",e=>{const btn=e.target.closest(".chip");if(!btn||btn.dataset.id===undefined)return;const id=btn.dataset.id;
 if(id==="all"){filter.catId=null;filter.catName=null;filter.catSlug=null}else{filter.catId=id;filter.catName=btn.dataset.name;filter.catSlug=btn.dataset.slug}applyFilter({scroll:true})});
el.ribbonClear.addEventListener("click",clearAll);el.feClear.addEventListener("click",clearAll);

// ===== Player / Download / Interstitial / Consent controls =====
el.playerClose.addEventListener("click",closePlayer);el.playerModal.addEventListener("click",e=>{if(e.target===el.playerModal)closePlayer()});
el.playerToggle.addEventListener("click",()=>Audio_.toggle());el.playerBack10.addEventListener("click",()=>Audio_.skip(-10));el.playerFwd10.addEventListener("click",()=>Audio_.skip(10));
el.playerBar.addEventListener("input",e=>{seeking=true;el.playerCur.textContent=fmtTime(parseFloat(e.target.value))});el.playerBar.addEventListener("change",e=>{Audio_.seek(e.target.value);seeking=false});
el.playerVol.addEventListener("input",e=>Audio_.vol(e.target.value));el.playerDownload.addEventListener("click",()=>{if(Audio_.currentId)openDlModal(Audio_.currentId,el.playerTitle.textContent)});
el.dlClose.addEventListener("click",closeDlModal);el.dlModal.addEventListener("click",e=>{if(e.target===el.dlModal&&dlState!=="fetching")closeDlModal()});
el.dlAction.addEventListener("click",()=>{if(dlState==="ready")beginDownloadFetch();else if(dlState==="done")closeDlModal()});
el.interSkip.addEventListener("click",()=>{if(!el.interSkip.disabled)closeInterstitial()});
el.interstitial.addEventListener("click",e=>{if(e.target===el.interstitial)closeInterstitial()});
el.consentAccept.addEventListener("click",onConsentAccept);el.consentDecline.addEventListener("click",onConsentDecline);
el.loadMoreBtn.addEventListener("click",()=>{el.loadMoreBtn.disabled=true;el.loadMoreBtn.textContent="Loading…";loadRingtones(true).finally(()=>{el.loadMoreBtn.disabled=false;el.loadMoreBtn.textContent="Load More Ringtones"})});

// ===== Injected player share + home SEO (Phase 9) =====
(function(){if(!el.playerShell)return;const b=document.createElement("button");b.type="button";b.className="player-share-btn";b.textContent="⤴ Share this ringtone";el.playerShell.appendChild(b);
 b.addEventListener("click",function(){const id=Audio_.currentId;if(!id){showToast("Play a ringtone first to share it.");return}doShare(id,slugify(el.playerTitle.textContent||""),el.playerTitle.textContent||"RingMang ringtone")})})();
(function homeSeo(){try{const o=location.origin;
 const lc=document.createElement("link");lc.rel="canonical";lc.href=o+"/";document.head.appendChild(lc);
 // CWV: preconnect + dns-prefetch to Supabase (first data fetch छिटो -> FCP/LCP adjacent gain)
 try{const su=String((window.RINGMANG_CONFIG&&window.RINGMANG_CONFIG.SUPABASE_URL)||"");if(su){const u=new URL(su);const dp=document.createElement("link");dp.rel="dns-prefetch";dp.href="//"+u.host;document.head.appendChild(dp);const pc=document.createElement("link");pc.rel="preconnect";pc.href=u.origin;pc.crossOrigin="";document.head.appendChild(pc)}}catch(_){}
 const add=(obj)=>{const s=document.createElement("script");s.type="application/ld+json";s.textContent=JSON.stringify(obj);document.head.appendChild(s)};
 add({"@context":"https://schema.org","@type":"WebSite","name":"RingMang","url":o+"/","potentialAction":{"@type":"SearchAction","target":o+"/?q={search_term_string}","query-input":"required name=search_term_string"}});
 add({"@context":"https://schema.org","@type":"Organization","name":"RingMang","url":o+"/","logo":o+"/icon.svg","description":"Free ringtones — browse, preview and download original beats and movie clips, no sign-up.","sameAs":[]});
 }catch(e){}})();

// ===== Boot =====
document.addEventListener("DOMContentLoaded",async()=>{if(!createSafeClient())return;
 loadTicker();loadStats();await loadCategoryChips();readURL();loadRingtones(false);initAds()});
