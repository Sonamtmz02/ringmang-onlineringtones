/**
 * RingMang — Download SmartLink (15A-1, fixed: reads GLOBAL settings from app_settings,
 * NOT the multi-row ad_settings slot table -> deterministic, no LIMIT-1 ambiguity).
 * Capture-phase listener; per-ringtone link from ringtones.download_ad_link.
 * Visible ?sldebug=1 bar for diagnosis (hidden in production).
 */
(function(){
 try{
  var d=document.getElementById("rm-data");if(!d)return;
  var ID=d.getAttribute("data-id");if(!ID)return;
  var CFG=window.RINGMANG_CONFIG||{};
  var SUPA=CFG.SUPABASE_URL||d.getAttribute("data-supa")||"";
  var KEY=CFG.SUPABASE_ANON_KEY||d.getAttribute("data-key")||"";
  var DEBUG=/[?&]sldebug=1/.test(location.search);
  var st={supa:!!SUPA,key:!!KEY,asStatus:"-",rtStatus:"-",mode:"?",behavior:"?",glink:"?",tlink:"?",fetch:"pending",click:"-"};
  function render(){ if(!DEBUG)return; var b=document.getElementById("rm-sl-debug"); if(!b){b=document.createElement("div");b.id="rm-sl-debug";b.style.cssText="position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#0b0f14;color:#3ddc97;font:11px/1.5 monospace;padding:8px 10px;border-top:2px solid #3ddc97;white-space:pre-wrap;word-break:break-all;text-align:left";document.body.appendChild(b);} b.textContent="SL DEBUG\nsupa="+st.supa+" key="+st.key+"\nfetch="+st.fetch+" appHTTP="+st.asStatus+" rtHTTP="+st.rtStatus+"\nmode="+st.mode+" behavior="+st.behavior+"\nglink="+st.glink+"\ntlink="+st.tlink+"\nclick="+st.click; }
  if(DEBUG)render();
  if(!SUPA||!KEY){ st.fetch="no-config"; render(); return; }
  var dlbtn=document.getElementById("dlbtn");if(!dlbtn){ st.fetch="no-dlbtn"; render(); return; }

  var mode="silent",behavior="both",globalLink="",trackLink="",ready=false;
  function short(s){s=(s||"").trim();return s?(s.length>42?s.slice(0,42)+"…":s):"(empty)"}
  function load(){
    return Promise.all([
      fetch(SUPA+"/rest/v1/app_settings?setting_key=in.(smartlink_global_link,smartlink_mode,smartlink_behavior)&select=setting_key,setting_value",{headers:{apikey:KEY}})
        .then(function(r){st.asStatus=r.status;return r.ok?r.json():[]}).catch(function(){st.asStatus="net";return[]}),
      fetch(SUPA+"/rest/v1/ringtones?select=download_ad_link&id=eq."+encodeURIComponent(ID),{headers:{apikey:KEY}})
        .then(function(r){st.rtStatus=r.status;return r.ok?r.json():[]}).catch(function(){st.rtStatus="net";return[]})
    ]).then(function(res){
      var rows=res[0]||[]; var m={}; for(var i=0;i<rows.length;i++){m[rows[i].setting_key]=rows[i].setting_value;}
      mode=m.smartlink_mode||"silent";
      behavior=m.smartlink_behavior||"both";
      globalLink=(m.smartlink_global_link||"").trim();
      var rt=(res[1]&&res[1][0])||{};
      trackLink=(rt.download_ad_link||"").trim();
      ready=true;
      st.mode=mode;st.behavior=behavior;st.glink=short(globalLink);st.tlink=short(trackLink);st.fetch="ok";
      render();
    }).catch(function(e){st.fetch="err";render()});
  }
  load();

  dlbtn.addEventListener("click",function(e){
    var link=trackLink||globalLink;
    if(!ready){ st.click="not-ready(silent)"; render(); return; }
    if(mode==="adgated"&&link){
      try{ window.open(link,"_blank","noopener,noreferrer"); st.click="OPENED "+short(link); }
      catch(err){ st.click="open-err:"+err.message; }
      render();
      if(behavior==="link_only"){ e.stopImmediatePropagation(); e.preventDefault(); st.click+=" | blob-stopped"; render(); }
    } else {
      st.click=(mode!=="adgated"?"mode=silent":"no-link")+" -> blob only"; render();
    }
  },true);

 }catch(err){ if(typeof console!=="undefined")console.warn("smartlink init failed",err); }
})();
