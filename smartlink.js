/**
 * RingMang — Download SmartLink (15A-1)
 * Append-only, capture-phase listener on the track page download button.
 * Resolves: per-ringtone download_ad_link || global_download_link || null.
 * If ad-gated + link exists: opens SmartLink in new tab (noopener) +
 *   - behavior 'both': also lets the existing silent blob download run
 *   - behavior 'link_only': stops the existing blob download (stopImmediatePropagation)
 * If silent mode or no link: existing silent blob download runs unchanged.
 * Self-contained: fetches its own config (no edge data injection needed).
 */
(function(){
  try{
    var d=document.getElementById("rm-data");if(!d)return;
    var ID=d.getAttribute("data-id");if(!ID)return;
    var CFG=window.RINGMANG_CONFIG||{};
    var SUPA=CFG.SUPABASE_URL||d.getAttribute("data-supa")||"";
    var KEY=CFG.SUPABASE_ANON_KEY||d.getAttribute("data-key")||"";
    if(!SUPA||!KEY)return;
    var dlbtn=document.getElementById("dlbtn");if(!dlbtn)return;

    var mode="silent",behavior="both",globalLink="",trackLink="",ready=false;

    // fetch config + per-ringtone link in parallel (fast, single-row queries)
    Promise.all([
      fetch(SUPA+"/rest/v1/ad_settings?select=global_download_link,download_mode,smartlink_behavior&id=eq.1",{headers:{apikey:KEY}})
        .then(function(r){return r.ok?r.json():[]}).catch(function(){return[]}),
      fetch(SUPA+"/rest/v1/ringtones?select=download_ad_link&id=eq."+encodeURIComponent(ID),{headers:{apikey:KEY}})
        .then(function(r){return r.ok?r.json():[]}).catch(function(){return[]})
    ]).then(function(res){
      var ads=(res[0]&&res[0][0])||{};
      mode=ads.download_mode||"silent";
      behavior=ads.smartlink_behavior||"both";
      globalLink=(ads.global_download_link||"").trim();
      var rt=(res[1]&&res[1][0])||{};
      trackLink=(rt.download_ad_link||"").trim();
      ready=true;
    });

    // capture-phase listener: runs BEFORE the existing bubble-phase blob download listener
    dlbtn.addEventListener("click",function(e){
      var link=trackLink||globalLink;
      if(mode==="adgated"&&link){
        // open SmartLink in new tab (ad revenue), secure
        window.open(link,"_blank","noopener,noreferrer");
        if(behavior==="link_only"){
          // prevent the existing silent blob download
          e.stopImmediatePropagation();
          e.preventDefault();
        }
        // if behavior==='both', do NOT stop -> existing blob download also runs (user gets file)
      }
      // if mode==='silent' or no link -> existing silent blob download runs unchanged
    },true); // capture=true -> runs before bubble-phase listeners

  }catch(err){console.warn("smartlink init failed",err)}
})();
