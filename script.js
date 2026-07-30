/**
 * RingMang Users Panel — Phase 6 (Home/List) + Phase 7 (Player + Silent Download)
 * Public read via RLS. Audio via Edge Function signed URL. No new tab on download.
 */

const { SUPABASE_URL, SUPABASE_ANON_KEY, APP_NAME, PAGE_SIZE } = window.RINGMANG_CONFIG || {};
const $ = (id) => document.getElementById(id);
const el = {
  topbarCount:$("topbar-count"), tickerTrack:$("ticker-track"),
  statRingtones:$("stat-ringtones"), statDownloads:$("stat-downloads"), statCategories:$("stat-categories"),
  categoryChips:$("category-chips"), grid:$("ringtone-grid"), emptyState:$("empty-state"),
  shownCount:$("shown-count"), loadMoreBtn:$("load-more-btn"), toast:$("toast"), toastMessage:$("toast-message"),
  playerModal:$("player-modal"), playerClose:$("player-close"), playerViz:$("player-viz"),
  playerCat:$("player-cat"), playerTitle:$("player-title"), playerArtist:$("player-artist"),
  playerCur:$("player-cur"), playerBar:$("player-bar"), playerDur:$("player-dur"),
  playerToggle:$("player-toggle"), playerBack10:$("player-back10"), playerFwd10:$("player-fwd10"),
  playerVol:$("player-vol"), playerDownload:$("player-download"), playerShell:null,
  dlModal:$("dl-modal"), dlClose:$("dl-close"), dlTrack:$("dl-track"),
  dlCountdownPhase:$("dl-countdown-phase"), dlRingFg:$("dl-ring-fg"), dlCount:$("dl-count"),
  dlProgressPhase:$("dl-progress-phase"), dlProgBar:$("dl-prog-bar"), dlProgText:$("dl-prog-text"),
  dlDonePhase:$("dl-done-phase"), dlAction:$("dl-action"),
};
el.playerShell = el.playerModal ? el.playerModal.querySelector(".player-shell") : null;

// ===== Utilities =====
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function formatBytes(b){ if(b<1024)return b+" B"; if(b<1048576)return (b/1024).toFixed(1)+" KB"; return (b/1048576).toFixed(2)+" MB"; }
function formatCount(n){ if(n>=1000000)return (n/1000000).toFixed(1)+"M"; if(n>=1000)return (n/1000).toFixed(1)+"K"; return String(n); }
function fmtTime(s){ if(!isFinite(s)||s<0)s=0; return Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0"); }
function extFromMime(m){ return ({ "audio/mpeg":"mp3","audio/mp4":"m4a","audio/ogg":"ogg","audio/wav":"wav" })[m] || "mp3"; }
function safeName(t,e){ return (String(t).replace(/[^\w\-]+/g,"_").replace(/^_+|_+$/g,"").slice(0,60)||"ringtone")+"."+e; }
let toastTimer;
function showToast(m){ if(!el.toast)return; el.toastMessage.textContent=m; el.toast.classList.remove("hidden"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.toast.classList.add("hidden"),3000); }
function countUp(tEl,target,dur=1300){ if(!tEl)return; const st=performance.now(); (function tick(now){ const p=Math.min((now-st)/dur,1); tEl.textContent=Math.round(target*(1-Math.pow(1-p,3))).toLocaleString(); if(p<1)requestAnimationFrame(tick); })(st); }
const revealObserver = new IntersectionObserver((es)=>{ es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("revealed"); revealObserver.unobserve(e.target);} }); },{ threshold:0.08 });
function waveSpans(seed){ let b=""; for(let i=0;i<14;i++){ const h=25+Math.abs(Math.sin(seed*3.7+i*1.3))*75; b+=`<span style="height:${Math.round(h)}%"></span>`; } return b; }

// ===== Diagnostic Banner =====
function showFatalBanner(title,body){ const old=document.getElementById("fatal-banner"); if(old)old.remove();
  const b=document.createElement("div"); b.id="fatal-banner"; b.setAttribute("role","alert");
  b.style.cssText="position:fixed;top:0;left:0;right:0;z-index:9999;background:#2a0e0e;border-bottom:2px solid #ff6b4a;color:#ffd9cf;padding:14px 16px 16px;font-family:'Space Mono',monospace;font-size:12px;line-height:1.6;box-shadow:0 10px 30px rgba(0,0,0,.55)";
  b.innerHTML=`<div style="font-family:'Unbounded',sans-serif;font-weight:700;color:#ff6b4a;font-size:13px;margin-bottom:6px">⚠ ${title}</div><div>${body}</div><button id="fatal-close" style="margin-top:10px;background:transparent;border:1px solid #ff6b4a;color:#ff6b4a;border-radius:6px;padding:5px 12px;font-family:'Space Mono',monospace;font-size:11px;cursor:pointer">लुकाउनुहोस्</button>`;
  document.body.prepend(b); document.getElementById("fatal-close").addEventListener("click",()=>b.remove());
}

// ===== Supabase client =====
let supabaseClient=null;
function createSafeClient(){
  if(!SUPABASE_URL||String(SUPABASE_URL).includes("YOUR_SUPABASE")){ showFatalBanner("CONFIG MISSING","ringmang-onlineringtones repo को <b>config.js</b> मा वास्तविक Supabase URL राख्नुहोस्।"); return false; }
  if(!SUPABASE_ANON_KEY||String(SUPABASE_ANON_KEY).includes("YOUR_SUPABASE")){ showFatalBanner("CONFIG MISSING","config.js मा <b>SUPABASE_ANON_KEY</b> राख्नुहोस्।"); return false; }
  try{ supabaseClient=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY); return true; }
  catch(e){ showFatalBanner("CONNECTION ERROR","<code>"+escapeHtml(e.message)+"</code> — config.js जाँच्नुहोस्।"); return false; }
}

// ===== Signed URL fetcher =====
async function fetchSigned(id,intent){
  const res=await fetch(`${SUPABASE_URL}/functions/v1/serve-ringtone?id=${encodeURIComponent(id)}&intent=${intent}`,{ headers:{ apikey:SUPABASE_ANON_KEY } });
  const data=await res.json().catch(()=>({}));
  if(!res.ok||!data.url) throw new Error(data.error||"Could not prepare audio");
  return data;
}

// ===== Audio Manager (single instance + visualizer) =====
const Audio_ = {
  el:null, ctx:null, srcNode:null, analyser:null, freq:null, useReal:false, graphReady:false,
  raf:null, currentId:null, currentBtn:null,
  init(){ if(this.el)return; this.el=new window.Audio(); this.el.preload="metadata"; this.el.crossOrigin="anonymous";
    this.el.addEventListener("loadedmetadata",()=>{ el.playerDur.textContent=fmtTime(this.el.duration); el.playerBar.max=this.el.duration||100; });
    this.el.addEventListener("timeupdate",()=>{ if(this.el.duration){ el.playerCur.textContent=fmtTime(this.el.currentTime); if(!seeking) el.playerBar.value=this.el.currentTime; } });
    this.el.addEventListener("ended",()=>this.setPlaying(false));
    this.el.addEventListener("play",()=>{ this.setPlaying(true); this.startViz(); });
    this.el.addEventListener("pause",()=>this.setPlaying(false));
    this.el.addEventListener("error",()=>{ showToast("⚠ Audio load भएन। फेरि प्रयास गर्नुहोस्।"); this.setPlaying(false); });
  },
  buildViz(){ if(el.playerViz.children.length)return; let h=""; for(let i=0;i<28;i++)h+="<span></span>"; el.playerViz.innerHTML=h; },
  ensureGraph(){ if(this.graphReady)return this.useReal;
    try{ this.ctx=new (window.AudioContext||window.webkitAudioContext)(); this.srcNode=this.ctx.createMediaElementSource(this.el);
      this.analyser=this.ctx.createAnalyser(); this.analyser.fftSize=64; this.freq=new Uint8Array(this.analyser.frequencyBinCount);
      this.srcNode.connect(this.analyser); this.analyser.connect(this.ctx.destination); this.graphReady=true; this.useReal=true; return true; }
    catch(e){ this.useReal=false; return false; }
  },
  startViz(){ cancelAnimationFrame(this.raf); const bars=el.playerViz.children;
    if(this.useReal) el.playerViz.classList.remove("viz-fake"); else el.playerViz.classList.add("viz-fake");
    const loop=()=>{ if(this.el.paused)return;
      if(this.useReal&&this.analyser){ try{ this.analyser.getByteFrequencyData(this.freq); let sum=0;
          for(let i=0;i<bars.length;i++){ const v=this.freq[i%this.freq.length]; sum+=v; bars[i].style.height=(12+(v/255)*88)+"%"; }
          if(sum===0){ this.useReal=false; el.playerViz.classList.add("viz-fake"); } }
        catch(e){ this.useReal=false; el.playerViz.classList.add("viz-fake"); } }
      this.raf=requestAnimationFrame(loop); };
    this.raf=requestAnimationFrame(loop);
  },
  setPlaying(on){ el.playerToggle.textContent=on?"❚❚":"▶"; el.playerShell.classList.toggle("playing",on); el.playerViz.classList.toggle("playing",on);
    if(this.currentBtn) this.currentBtn.classList.toggle("is-active",on);
    if(!on){ cancelAnimationFrame(this.raf); } },
  async load(id,meta,btn){ this.init(); this.buildViz();
    if(this.currentId===id&&!this.el.paused){ this.el.pause(); return; }      // toggle off
    if(this.currentId===id&&this.el.paused){ this.el.play().catch(()=>{}); this.currentBtn=btn; return; } // resume
    this.currentBtn=btn; this.currentId=id;
    el.playerTitle.textContent=meta.title; el.playerArtist.textContent=meta.artist; el.playerCat.textContent=meta.cat;
    el.playerCur.textContent="0:00"; el.playerDur.textContent="0:00"; el.playerBar.value=0;
    try{ const s=await fetchSigned(id,"play"); this.el.src=s.url; this.el.load();
      this.ensureGraph(); if(this.ctx&&this.ctx.state==="suspended") this.ctx.resume();
      await this.el.play(); }
    catch(e){ showToast("▶ Play भएन: "+e.message); this.setPlaying(false); }
  },
  toggle(){ if(!this.el||!this.el.src)return; if(this.el.paused)this.el.play().catch(()=>{}); else this.el.pause(); },
  seek(v){ if(!this.el)return; this.el.currentTime=parseFloat(v); },
  vol(v){ if(this.el)this.el.volume=parseFloat(v); },
  skip(sec){ if(!this.el)return; this.el.currentTime=Math.max(0,Math.min((this.el.duration||0),this.el.currentTime+sec)); },
};
let seeking=false;

// ===== Player modal open/close =====
function openPlayer(id,meta,btn){ Audio_.load(id,meta,btn); el.playerModal.classList.remove("hidden"); document.body.style.overflow="hidden"; }
function closePlayer(){ el.playerModal.classList.add("hidden"); document.body.style.overflow=""; }

// ===== Download flow (countdown → click → blob → hidden anchor) =====
let dlState="idle", dlCurrentId=null, dlCurrentTitle="";
const RING_CIRC=276.46;
function openDlModal(id,title){ dlCurrentId=id; dlCurrentTitle=title; dlState="countdown";
  el.dlTrack.textContent=title;
  el.dlCountdownPhase.classList.remove("hidden"); el.dlProgressPhase.classList.add("hidden"); el.dlDonePhase.classList.add("hidden");
  el.dlAction.disabled=true; el.dlAction.textContent="Please wait…";
  el.dlModal.classList.remove("hidden"); document.body.style.overflow="hidden";
  runCountdown(5);
}
function closeDlModal(){ el.dlModal.classList.add("hidden"); document.body.style.overflow=""; dlState="idle"; }
function runCountdown(n){ el.dlCount.textContent=n; el.dlRingFg.style.strokeDashoffset=0;
  const tick=()=>{ if(dlState!=="countdown")return;
    el.dlRingFg.style.strokeDashoffset=String(RING_CIRC*(1-n/5));
    if(n<=0){ el.dlStateReady(); return; }
    el.dlCount.textContent=n; el.dlAction.textContent=`Please wait (${n}s)`;
    n--; setTimeout(tick,1000); };
  tick();
}
// helper attached for clarity
el.dlStateReady=()=>{ dlState="ready"; el.dlCount.textContent="✓"; el.dlAction.disabled=false; el.dlAction.textContent="⬇ Download Now"; };

async function beginDownloadFetch(){ if(dlState!=="ready"||!dlCurrentId)return; dlState="fetching";
  el.dlCountdownPhase.classList.add("hidden"); el.dlProgressPhase.classList.remove("hidden");
  el.dlProgBar.style.width="0%"; el.dlProgBar.classList.remove("indet"); el.dlProgText.textContent="Preparing secure link…";
  el.dlAction.disabled=true; el.dlAction.textContent="Downloading…";
  try{
    const meta=await fetchSigned(dlCurrentId,"download");
    el.dlProgText.textContent="Fetching from secure storage…";
    const res=await fetch(meta.url);
    if(!res.ok) throw new Error("Storage fetch failed");
    const total=parseInt(res.headers.get("Content-Length")||"0",10);
    const reader=res.body.getReader(); const chunks=[]; let loaded=0;
    if(!total) el.dlProgBar.classList.add("indet");
    while(true){ const {done,value}=await reader.read(); if(done)break; chunks.push(value); loaded+=value.length;
      if(total){ const p=Math.min(100,(loaded/total)*100); el.dlProgBar.classList.remove("indet"); el.dlProgBar.style.width=p.toFixed(0)+"%"; el.dlProgText.textContent=`Downloading… ${p.toFixed(0)}%`; } }
    const blob=new Blob(chunks,{ type:meta.mime_type||"audio/mpeg" });
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=safeName(dlCurrentTitle,extFromMime(meta.mime_type));
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),2000);
    // done
    dlState="done"; el.dlProgressPhase.classList.add("hidden"); el.dlDonePhase.classList.remove("hidden");
    el.dlAction.disabled=false; el.dlAction.textContent="Close"; showToast(`✓ "${dlCurrentTitle}" save भयो!`);
    refreshStatsQuiet();
  }catch(e){ dlState="idle"; showToast("⬇ Download भएन: "+e.message); closeDlModal(); }
}
async function refreshStatsQuiet(){ try{ const {count}=await supabaseClient.from("ringtones").select("*",{count:"exact",head:true}); if(count!=null)el.topbarCount.textContent=count; }catch{} }

// ===== Phase 6: Ticker / Stats / Chips / Cards =====
async function loadTicker(){ try{ const {data,error}=await supabaseClient.from("ringtones").select("title, download_count").order("download_count",{ascending:false}).limit(10);
    if(error)throw error; if(!data||!data.length){ el.tickerTrack.innerHTML='<span class="font-mono text-xs text-gray-500 py-2.5">Fresh ringtones dropping soon…</span>'; return; }
    const items=data.map(r=>`<span class="ticker-item"><span class="t-title">${escapeHtml(r.title)}</span><span class="t-count">▲ ${formatCount(r.download_count||0)}</span><span class="t-sep">◆</span></span>`).join("");
    el.tickerTrack.innerHTML=items+items; }catch(e){ el.tickerTrack.innerHTML='<span class="font-mono text-xs text-gray-500 py-2.5">Trending unavailable</span>'; } }
async function loadStats(){ try{ const [{count:rCount},{count:cCount},{data:dlRows}]=await Promise.all([
      supabaseClient.from("ringtones").select("*",{count:"exact",head:true}),
      supabaseClient.from("categories").select("*",{count:"exact",head:true}),
      supabaseClient.from("ringtones").select("download_count")]);
    const totalDl=(dlRows||[]).reduce((s,r)=>s+(r.download_count||0),0);
    el.topbarCount.textContent=rCount||0; countUp(el.statRingtones,rCount||0); countUp(el.statDownloads,totalDl); countUp(el.statCategories,cCount||0); }catch(e){ showToast("Stats load भएन: "+e.message); } }
async function loadCategoryChips(){ try{ const {data:cats}=await supabaseClient.from("categories").select("id, name").order("name");
    const {data:rings}=await supabaseClient.from("ringtones").select("category_id"); const cm={}; (rings||[]).forEach(r=>{ if(r.category_id)cm[r.category_id]=(cm[r.category_id]||0)+1; });
    if(!cats||!cats.length){ el.categoryChips.innerHTML='<span class="font-mono text-[11px] text-gray-600 py-2">Categories coming soon…</span>'; return; }
    el.categoryChips.innerHTML=cats.map(c=>`<span class="chip">${escapeHtml(c.name)}<span class="chip-count">${cm[c.id]||0}</span></span>`).join(""); }catch{ el.categoryChips.innerHTML='<span class="font-mono text-[11px] text-gray-600 py-2">Categories unavailable</span>'; } }

function renderCard(r,idx){ const isCopy=r.copyright_status==="copyrighted";
  const artist=r.artists?.name||"Unknown Artist", cat=r.categories?.name||"Uncategorized";
  const card=document.createElement("div"); card.className="ring-card"; card.style.transitionDelay=`${(idx%PAGE_SIZE)*40}ms`;
  card.innerHTML=`<div class="card-wave" aria-hidden="true">${waveSpans(idx+r.title.length)}</div>
    <div class="flex items-start justify-between gap-3"><div class="min-w-0"><p class="card-title truncate">${escapeHtml(r.title)}</p><p class="card-sub truncate">${escapeHtml(artist)} · ${escapeHtml(cat)}</p></div>${isCopy?'<span class="badge-copy">©</span>':'<span class="badge-orig">FREE</span>'}</div>
    <div class="card-meta"><span>${formatBytes(r.file_size_bytes)}</span><span class="dl">⬇ ${formatCount(r.download_count||0)}</span></div>
    <div class="card-actions"><button class="btn-play" data-id="${r.id}" data-title="${escapeHtml(r.title)}" data-artist="${escapeHtml(artist)}" data-cat="${escapeHtml(cat)}">▶ Play</button><button class="btn-download" data-id="${r.id}" data-title="${escapeHtml(r.title)}">⬇ Get</button></div>`;
  return card;
}
let ringtoneOffset=0,totalRingtones=0;
async function loadRingtones(append=false){ if(!append)el.grid.innerHTML='<div class="card-skeleton"></div>'.repeat(6);
  try{ const from=ringtoneOffset,to=from+PAGE_SIZE-1;
    const {data,error,count}=await supabaseClient.from("ringtones").select("*, categories(name, slug), artists(name, slug)",{count:"exact"}).order("created_at",{ascending:false}).range(from,to);
    if(error)throw error; totalRingtones=count||0; el.topbarCount.textContent=totalRingtones; if(!append)el.grid.innerHTML="";
    if(!data||!data.length){ if(totalRingtones===0){ el.emptyState.classList.remove("hidden"); el.loadMoreBtn.classList.add("hidden"); } return; }
    el.emptyState.classList.add("hidden"); data.forEach((r,i)=>{ const c=renderCard(r,from+i); el.grid.appendChild(c); revealObserver.observe(c); });
    ringtoneOffset+=data.length; el.shownCount.textContent=ringtoneOffset;
    if(ringtoneOffset<totalRingtones)el.loadMoreBtn.classList.remove("hidden"); else el.loadMoreBtn.classList.add("hidden");
  }catch(e){ if(!append)el.grid.innerHTML='<p class="col-span-full text-center text-gray-500 py-10">Ringtones load भएनन्।</p>'; showToast("Ringtones load भएन: "+e.message); } }

// ===== Card actions → Player / Download =====
el.grid.addEventListener("click",(e)=>{ const btn=e.target.closest(".btn-play, .btn-download"); if(!btn)return;
  const id=btn.dataset.id, title=btn.dataset.title;
  if(btn.classList.contains("btn-play")){ openPlayer(id,{ title, artist:btn.dataset.artist, cat:btn.dataset.cat },btn); }
  else { openDlModal(id,title); } });

// ===== Player controls =====
el.playerClose.addEventListener("click",closePlayer);
el.playerModal.addEventListener("click",(e)=>{ if(e.target===el.playerModal)closePlayer(); });
el.playerToggle.addEventListener("click",()=>Audio_.toggle());
el.playerBack10.addEventListener("click",()=>Audio_.skip(-10));
el.playerFwd10.addEventListener("click",()=>Audio_.skip(10));
el.playerBar.addEventListener("input",(e)=>{ seeking=true; el.playerCur.textContent=fmtTime(parseFloat(e.target.value)); });
el.playerBar.addEventListener("change",(e)=>{ Audio_.seek(e.target.value); seeking=false; });
el.playerVol.addEventListener("input",(e)=>Audio_.vol(e.target.value));
el.playerDownload.addEventListener("click",()=>{ if(Audio_.currentId)openDlModal(Audio_.currentId,el.playerTitle.textContent); });

// ===== Download controls =====
el.dlClose.addEventListener("click",closeDlModal);
el.dlModal.addEventListener("click",(e)=>{ if(e.target===el.dlModal&&dlState!=="fetching")closeDlModal(); });
el.dlAction.addEventListener("click",()=>{ if(dlState==="ready")beginDownloadFetch(); else if(dlState==="done")closeDlModal(); });

// ===== Load More =====
el.loadMoreBtn.addEventListener("click",()=>{ el.loadMoreBtn.disabled=true; el.loadMoreBtn.textContent="Loading…"; loadRingtones(true).finally(()=>{ el.loadMoreBtn.disabled=false; el.loadMoreBtn.textContent="Load More Ringtones"; }); });

// ===== Boot =====
document.addEventListener("DOMContentLoaded",()=>{ if(!createSafeClient())return; loadTicker(); loadStats(); loadCategoryChips(); loadRingtones(false); });
