/**
 * RingMang Users Panel — Phase 6: Home + List View
 * Reads public data via Supabase (RLS: dmca_flag=false only)
 * Play/Download are placeholders — activated in Phase 7
 */

const { SUPABASE_URL, SUPABASE_ANON_KEY, APP_NAME, PAGE_SIZE } = window.RINGMANG_CONFIG;
if (!SUPABASE_URL || SUPABASE_URL === "YOUR_SUPABASE_PROJECT_URL") {
  console.warn("⚠️ config.js मा SUPABASE_URL र SUPABASE_ANON_KEY set गर्नुहोस्!");
}

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== State =====
let ringtoneOffset = 0;
let totalRingtones = 0;

// ===== DOM =====
const $ = (id) => document.getElementById(id);
const el = {
  topbarCount: $("topbar-count"),
  tickerTrack: $("ticker-track"),
  statRingtones: $("stat-ringtones"),
  statDownloads: $("stat-downloads"),
  statCategories: $("stat-categories"),
  categoryChips: $("category-chips"),
  grid: $("ringtone-grid"),
  emptyState: $("empty-state"),
  shownCount: $("shown-count"),
  loadMoreBtn: $("load-more-btn"),
  toast: $("toast"),
  toastMessage: $("toast-message"),
};

// ===== Utilities =====
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function formatBytes(b){ if(b<1024)return b+" B"; if(b<1048576)return (b/1024).toFixed(1)+" KB"; return (b/1048576).toFixed(2)+" MB"; }
function formatCount(n){ if(n>=1000000)return (n/1000000).toFixed(1)+"M"; if(n>=1000)return (n/1000).toFixed(1)+"K"; return String(n); }

let toastTimer;
function showToast(msg){
  el.toastMessage.textContent = msg;
  el.toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.toast.classList.add("hidden"), 2800);
}

// ===== Count-up Animation =====
function countUp(targetEl, target, duration=1300){
  const start = performance.now();
  function tick(now){
    const p = Math.min((now-start)/duration, 1);
    const eased = 1 - Math.pow(1-p, 3);
    targetEl.textContent = Math.round(target*eased).toLocaleString();
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ===== Scroll Reveal =====
const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add("revealed"); revealObserver.unobserve(e.target); }
  });
},{ threshold:0.08 });

// ===== Waveform Generator (organic per-card) =====
function waveSpans(seed){
  let bars = "";
  for(let i=0;i<14;i++){
    const h = 25 + Math.abs(Math.sin(seed*3.7 + i*1.3)) * 75; // 25-100%
    bars += `<span style="height:${Math.round(h)}%"></span>`;
  }
  return bars;
}

// ===== Trending Ticker =====
async function loadTicker(){
  try{
    const { data } = await supabaseClient
      .from("ringtones").select("title, download_count")
      .order("download_count",{ ascending:false }).limit(10);
    if(!data || data.length===0){
      el.tickerTrack.innerHTML = '<span class="font-mono text-xs text-gray-500 py-2.5">Fresh ringtones dropping soon…</span>';
      return;
    }
    const items = data.map(r=>
      `<span class="ticker-item"><span class="t-title">${escapeHtml(r.title)}</span><span class="t-count">▲ ${formatCount(r.download_count||0)}</span><span class="t-sep">◆</span></span>`
    ).join("");
    // Duplicate for seamless loop
    el.tickerTrack.innerHTML = items + items;
  }catch(e){
    el.tickerTrack.innerHTML = '<span class="font-mono text-xs text-gray-500 py-2.5">Trending unavailable</span>';
  }
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
    totalRingtones = rCount||0;

    el.topbarCount.textContent = totalRingtones;
    countUp(el.statRingtones, totalRingtones);
    countUp(el.statDownloads, totalDl);
    countUp(el.statCategories, cCount||0);
  }catch(e){ console.warn("Stats load failed:", e.message); }
}

// ===== Category Chips =====
async function loadCategoryChips(){
  try{
    const { data: cats } = await supabaseClient.from("categories").select("id, name").order("name");
    const { data: rings } = await supabaseClient.from("ringtones").select("category_id");
    const countMap = {};
    (rings||[]).forEach(r=>{ if(r.category_id) countMap[r.category_id]=(countMap[r.category_id]||0)+1; });

    if(!cats || cats.length===0){
      el.categoryChips.innerHTML = '<span class="font-mono text-[11px] text-gray-600 py-2">Categories coming soon…</span>';
      return;
    }
    el.categoryChips.innerHTML = cats.map(c=>
      `<span class="chip">${escapeHtml(c.name)}<span class="chip-count">${countMap[c.id]||0}</span></span>`
    ).join("");
  }catch(e){
    el.categoryChips.innerHTML = '<span class="font-mono text-[11px] text-gray-600 py-2">Categories unavailable</span>';
  }
}

// ===== Ringtone Card =====
function renderCard(r, idx){
  const isCopy = r.copyright_status === "copyrighted";
  const artistName = r.artists?.name || "Unknown Artist";
  const catName = r.categories?.name || "Uncategorized";
  const card = document.createElement("div");
  card.className = "ring-card";
  card.style.transitionDelay = `${(idx % PAGE_SIZE) * 40}ms`;
  card.innerHTML = `
    <div class="card-wave" aria-hidden="true">${waveSpans(idx + r.title.length)}</div>
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="card-title truncate">${escapeHtml(r.title)}</p>
        <p class="card-sub truncate">${escapeHtml(artistName)} · ${escapeHtml(catName)}</p>
      </div>
      ${isCopy ? '<span class="badge-copy">©</span>' : '<span class="badge-orig">FREE</span>'}
    </div>
    <div class="card-meta">
      <span>${formatBytes(r.file_size_bytes)}</span>
      <span class="dl">⬇ ${formatCount(r.download_count||0)}</span>
    </div>
    <div class="card-actions">
      <button class="btn-play" data-id="${r.id}" data-title="${escapeHtml(r.title)}">▶ Play</button>
      <button class="btn-download" data-id="${r.id}" data-title="${escapeHtml(r.title)}">⬇ Get</button>
    </div>
  `;
  return card;
}

// ===== Load Ringtones (paginated) =====
async function loadRingtones(append=false){
  if(!append){
    el.grid.innerHTML = '<div class="card-skeleton"></div>'.repeat(6);
  }
  try{
    const from = ringtoneOffset;
    const to = from + PAGE_SIZE - 1;
    const { data, error, count } = await supabaseClient
      .from("ringtones")
      .select("*, categories(name, slug), artists(name, slug)", { count:"exact" })
      .order("created_at", { ascending:false })
      .range(from, to);
    if(error) throw error;

    totalRingtones = count||0;
    el.topbarCount.textContent = totalRingtones;

    if(!append) el.grid.innerHTML = "";

    if(!data || data.length===0){
      if(totalRingtones===0){
        el.emptyState.classList.remove("hidden");
        el.loadMoreBtn.classList.add("hidden");
      }
      return;
    }
    el.emptyState.classList.add("hidden");

    data.forEach((r,i)=>{
      const card = renderCard(r, from+i);
      el.grid.appendChild(card);
      revealObserver.observe(card);
    });

    ringtoneOffset += data.length;
    el.shownCount.textContent = ringtoneOffset;

    // Show/hide Load More
    if(ringtoneOffset < totalRingtones){
      el.loadMoreBtn.classList.remove("hidden");
    }else{
      el.loadMoreBtn.classList.add("hidden");
    }
  }catch(e){
    console.warn("Ringtones load failed:", e.message);
    if(!append){
      el.grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">Could not load ringtones. Please refresh.</p>';
    }
  }
}

// ===== Play / Download (Phase 6 placeholders → Phase 7 activates) =====
el.grid.addEventListener("click", (e)=>{
  const btn = e.target.closest(".btn-play, .btn-download");
  if(!btn) return;
  const title = btn.dataset.title;
  if(btn.classList.contains("btn-play")){
    showToast(`▶ "${title}" — Audio player activates in the next update!`);
  }else{
    showToast(`⬇ "${title}" — Download activates in the next update!`);
  }
});

// ===== Load More =====
el.loadMoreBtn.addEventListener("click", ()=>{
  el.loadMoreBtn.disabled = true;
  el.loadMoreBtn.textContent = "Loading…";
  loadRingtones(true).finally(()=>{
    el.loadMoreBtn.disabled = false;
    el.loadMoreBtn.textContent = "Load More Ringtones";
  });
});

// ===== Init =====
document.addEventListener("DOMContentLoaded", ()=>{
  loadTicker();
  loadStats();
  loadCategoryChips();
  loadRingtones(false);
});
