/**
 * RingMang Users Panel — Phase 6: Home + List View (+ Self-Diagnostic Boot)
 * Public read via Supabase RLS (dmca_flag=false only)
 * Play/Download = placeholders → Phase 7 मा activate
 */

const { SUPABASE_URL, SUPABASE_ANON_KEY, APP_NAME, PAGE_SIZE } = window.RINGMANG_CONFIG || {};

// ===== DOM =====
const $ = (id) => document.getElementById(id);
const el = {
  topbarCount: $("topbar-count"), tickerTrack: $("ticker-track"),
  statRingtones: $("stat-ringtones"), statDownloads: $("stat-downloads"), statCategories: $("stat-categories"),
  categoryChips: $("category-chips"), grid: $("ringtone-grid"), emptyState: $("empty-state"),
  shownCount: $("shown-count"), loadMoreBtn: $("load-more-btn"),
  toast: $("toast"), toastMessage: $("toast-message"),
};

// ===== Visible Diagnostic Banner (console नचाहिने, mobile-friendly) =====
function showFatalBanner(title, body){
  const old = document.getElementById("fatal-banner"); if(old) old.remove();
  const b = document.createElement("div");
  b.id = "fatal-banner"; b.setAttribute("role","alert");
  b.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:9999;background:#2a0e0e;border-bottom:2px solid #ff6b4a;color:#ffd9cf;padding:14px 16px 16px;font-family:'Space Mono',monospace;font-size:12px;line-height:1.6;box-shadow:0 10px 30px rgba(0,0,0,.55)";
  b.innerHTML =
    `<div style="font-family:'Unbounded',sans-serif;font-weight:700;color:#ff6b4a;font-size:13px;margin-bottom:6px">⚠ ${title}</div>`+
    `<div style="color:#ffd9cf">${body}</div>`+
    `<button id="fatal-close" style="margin-top:10px;background:transparent;border:1px solid #ff6b4a;color:#ff6b4a;border-radius:6px;padding:5px 12px;font-family:'Space Mono',monospace;font-size:11px;cursor:pointer">लुकाउनुहोस् (Hide)</button>`;
  document.body.prepend(b);
  document.getElementById("fatal-close").addEventListener("click", ()=>b.remove());
}

// ===== Utilities =====
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function formatBytes(b){ if(b<1024)return b+" B"; if(b<1048576)return (b/1024).toFixed(1)+" KB"; return (b/1048576).toFixed(2)+" MB"; }
function formatCount(n){ if(n>=1000000)return (n/1000000).toFixed(1)+"M"; if(n>=1000)return (n/1000).toFixed(1)+"K"; return String(n); }
let toastTimer;
function showToast(msg){ if(!el.toast)return; el.toastMessage.textContent=msg; el.toast.classList.remove("hidden"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.toast.classList.add("hidden"),2800); }
function countUp(targetEl, target, duration=1300){ if(!targetEl)return; const start=performance.now();
  (function tick(now){ const p=Math.min((now-start)/duration,1); targetEl.textContent=Math.round(target*(1-Math.pow(1-p,3))).toLocaleString(); if(p<1)requestAnimationFrame(tick); })(start);
}
const revealObserver = new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("revealed"); revealObserver.unobserve(e.target);} }); },{ threshold:0.08 });
function waveSpans(seed){ let bars=""; for(let i=0;i<14;i++){ const h=25+Math.abs(Math.sin(seed*3.7+i*1.3))*75; bars+=`<span style="height:${Math.round(h)}%"></span>`; } return bars; }

// ===== Supabase Client (safe create) =====
let supabaseClient = null;
function createSafeClient(){
  if(!SUPABASE_URL || String(SUPABASE_URL).includes("YOUR_SUPABASE")){
    showFatalBanner("CONFIG MISSING — config.js अधूरो छ",
      "ringmang-onlineringtones repo को <b>config.js</b> मा अझै <code>YOUR_SUPABASE_PROJECT_URL</code> नै छ।<br>"+
      "त्यसलाई मेटाएर आफ्नो वास्तविक <b>Supabase Project URL</b> र <b>anon key</b> राख्नुहोस् (Settings → API)।<br>"+
      "(admin repo को config.js बाट Copy गरेर यहाँ Paste गर्दा पनि हुन्छ।)");
    return false;
  }
  if(!SUPABASE_ANON_KEY || String(SUPABASE_ANON_KEY).includes("YOUR_SUPABASE")){
    showFatalBanner("CONFIG MISSING — anon key छैन",
      "config.js मा <b>SUPABASE_ANON_KEY</b> राख्नुहोस् (Supabase → Settings → API → anon public)।");
    return false;
  }
  try{
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return true;
  }catch(err){
    showFatalBanner("CONNECTION ERROR",
      "Supabase client बनाउन सकिएन: <code>"+escapeHtml(err.message)+"</code><br>"+
      "config.js मा URL मा <b>https://</b> छ कि छैन जाँच्नुहोस्, र Quotes/Comma ठीक छन् कि छैनन्।");
    return false;
  }
}

// ===== Trending Ticker =====
async function loadTicker(){
  try{
    const { data, error } = await supabaseClient.from("ringtones").select("title, download_count").order("download_count",{ ascending:false }).limit(10);
    if(error) throw error;
    if(!data || data.length===0){ el.tickerTrack.innerHTML='<span class="font-mono text-xs text-gray-500 py-2.5">Fresh ringtones dropping soon…</span>'; return; }
    const items = data.map(r=>`<span class="ticker-item"><span class="t-title">${escapeHtml(r.title)}</span><span class="t-count">▲ ${formatCount(r.download_count||0)}</span><span class="t-sep">◆</span></span>`).join("");
    el.tickerTrack.innerHTML = items + items;
  }catch(e){ el.tickerTrack.innerHTML='<span class="font-mono text-xs text-gray-500 py-2.5">Trending unavailable</span>'; showToast("Ticker load भएन: "+e.message); }
}

// ===== Stats =====
async function loadStats(){
  try{
    const [{ count: rCount }, { count: cCount }, { data: dlRows }] = await Promise.all([
      supabaseClient.from("ringtones").select("*",{ count:"exact", head:true }),
      supabaseClient.from("categories").select("*",{ count:"exact", head:true }),
      supabaseClient.from("ringtones").select("download_count"),
    ]);
    const totalDl = (dlRows||[]).reduce((s,r)=>s+(r.download_count||0),0);
    el.topbarCount.textContent = rCount||0;
    countUp(el.statRingtones, rCount||0); countUp(el.statDownloads, totalDl); countUp(el.statCategories, cCount||0);
  }catch(e){ showToast("Stats load भएन: "+e.message); }
}

// ===== Category Chips =====
async function loadCategoryChips(){
  try{
    const { data: cats } = await supabaseClient.from("categories").select("id, name").order("name");
    const { data: rings } = await supabaseClient.from("ringtones").select("category_id");
    const countMap = {}; (rings||[]).forEach(r=>{ if(r.category_id) countMap[r.category_id]=(countMap[r.category_id]||0)+1; });
    if(!cats || cats.length===0){ el.categoryChips.innerHTML='<span class="font-mono text-[11px] text-gray-600 py-2">Categories coming soon…</span>'; return; }
    el.categoryChips.innerHTML = cats.map(c=>`<span class="chip">${escapeHtml(c.name)}<span class="chip-count">${countMap[c.id]||0}</span></span>`).join("");
  }catch(e){ el.categoryChips.innerHTML='<span class="font-mono text-[11px] text-gray-600 py-2">Categories unavailable</span>'; }
}

// ===== Ringtone Card =====
function renderCard(r, idx){
  const isCopy = r.copyright_status === "copyrighted";
  const artistName = r.artists?.name || "Unknown Artist";
  const catName = r.categories?.name || "Uncategorized";
  const card = document.createElement("div");
  card.className = "ring-card"; card.style.transitionDelay = `${(idx % PAGE_SIZE) * 40}ms`;
  card.innerHTML = `
    <div class="card-wave" aria-hidden="true">${waveSpans(idx + r.title.length)}</div>
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="card-title truncate">${escapeHtml(r.title)}</p>
        <p class="card-sub truncate">${escapeHtml(artistName)} · ${escapeHtml(catName)}</p>
      </div>
      ${isCopy ? '<span class="badge-copy">©</span>' : '<span class="badge-orig">FREE</span>'}
    </div>
    <div class="card-meta"><span>${formatBytes(r.file_size_bytes)}</span><span class="dl">⬇ ${formatCount(r.download_count||0)}</span></div>
    <div class="card-actions">
      <button class="btn-play" data-id="${r.id}" data-title="${escapeHtml(r.title)}">▶ Play</button>
      <button class="btn-download" data-id="${r.id}" data-title="${escapeHtml(r.title)}">⬇ Get</button>
    </div>`;
  return card;
}

// ===== Load Ringtones =====
let ringtoneOffset = 0, totalRingtones = 0;
async function loadRingtones(append=false){
  if(!append) el.grid.innerHTML = '<div class="card-skeleton"></div>'.repeat(6);
  try{
    const from = ringtoneOffset, to = from + PAGE_SIZE - 1;
    const { data, error, count } = await supabaseClient
      .from("ringtones").select("*, categories(name, slug), artists(name, slug)", { count:"exact" })
      .order("created_at", { ascending:false }).range(from, to);
    if(error) throw error;
    totalRingtones = count||0; el.topbarCount.textContent = totalRingtones;
    if(!append) el.grid.innerHTML = "";
    if(!data || data.length===0){
      if(totalRingtones===0){ el.emptyState.classList.remove("hidden"); el.loadMoreBtn.classList.add("hidden"); }
      return;
    }
    el.emptyState.classList.add("hidden");
    data.forEach((r,i)=>{ const card=renderCard(r,from+i); el.grid.appendChild(card); revealObserver.observe(card); });
    ringtoneOffset += data.length; el.shownCount.textContent = ringtoneOffset;
    if(ringtoneOffset < totalRingtones) el.loadMoreBtn.classList.remove("hidden"); else el.loadMoreBtn.classList.add("hidden");
  }catch(e){
    if(!append) el.grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">Ringtones load भएनन्।</p>';
    showToast("Ringtones load भएन: "+e.message);
  }
}

// ===== Play / Download placeholders =====
el.grid?.addEventListener("click", (e)=>{
  const btn = e.target.closest(".btn-play, .btn-download"); if(!btn) return;
  const title = btn.dataset.title;
  showToast(btn.classList.contains("btn-play") ? `▶ "${title}" — Player अर्को update मा!` : `⬇ "${title}" — Download अर्को update मा!`);
});
el.loadMoreBtn?.addEventListener("click", ()=>{
  el.loadMoreBtn.disabled=true; el.loadMoreBtn.textContent="Loading…";
  loadRingtones(true).finally(()=>{ el.loadMoreBtn.disabled=false; el.loadMoreBtn.textContent="Load More Ringtones"; });
});

// ===== BOOT =====
document.addEventListener("DOMContentLoaded", ()=>{
  if(!createSafeClient()) return;   // config/connection खराब भए यही रोकिन्छ + banner देखिन्छ
  loadTicker(); loadStats(); loadCategoryChips(); loadRingtones(false);
});
