/**
 * RingMang — /og/<id-or-slug>.svg  generated cover art (Phase 9B-2: id-first + slug/short_id fallback)
 */
function escXml(s){return String(s==null?"":s).replace(/[&<>]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function buildCover(title,artist){const h=hashStr(title+"|"+(artist||""));const pals=[["#ff6b4a","#ffd166"],["#3ddc97","#4cc9f0"],["#4cc9f0","#ff6b4a"],["#ffd166","#3ddc97"],["#ff6b4a","#3ddc97"]];const p=pals[h%pals.length];let bars="";for(let i=0;i<44;i++){const v=18+Math.abs(Math.sin((h%97)*0.7+i*0.9))*78;const x=70+i*24;bars+='<rect x="'+x+'" y="'+(315-v/2)+'" width="12" height="'+v+'" rx="6" fill="url(#g)" opacity="'+(0.55+(i%5)*0.09).toFixed(2)+'"/>'}const t=escXml(title.length>30?title.slice(0,29)+"…":title);const a=escXml((artist||"RingMang").length>34?(artist||"RingMang").slice(0,33)+"…":(artist||"RingMang"));return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="'+t+'"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+p[0]+'"/><stop offset="1" stop-color="'+p[1]+'"/></linearGradient><radialGradient id="rg" cx="22%" cy="14%" r="80%"><stop offset="0" stop-color="'+p[0]+'" stop-opacity="0.22"/><stop offset="1" stop-color="#071417" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="630" fill="#071417"/><rect width="1200" height="630" fill="url(#rg)"/><g opacity="0.9">'+bars+'</g><text x="70" y="150" font-family="Unbounded, sans-serif" font-weight="800" font-size="58" fill="#ffffff">'+t+'</text><text x="72" y="196" font-family="Space Mono, monospace" font-size="24" fill="'+p[1]+'">by '+a+'</text><text x="70" y="560" font-family="Unbounded, sans-serif" font-weight="800" font-size="34" fill="#ffffff">Ring<tspan fill="'+p[0]+'">Mang</tspan></text><text x="1130" y="560" text-anchor="end" font-family="Space Mono, monospace" font-size="20" fill="#5b6b6e" letter-spacing="3">FREE RINGTONE</text></svg>'}
const FALLBACK=buildCover("RingMang","Free Ringtones");
async function getJSON(SUPA,KEY,path){const r=await fetch(SUPA+"/rest/v1/"+path,{headers:{apikey:KEY,Authorization:"Bearer "+KEY,Accept:"application/json"}});if(!r.ok)return null;return r.json()}
export async function onRequestGet(context){const{request,env,params}=context;const SUPA=env.SUPABASE_URL,KEY=env.SUPABASE_ANON_KEY;const hdr={"Content-Type":"image/svg+xml","Cache-Control":"public, max-age=86400, s-maxage=604800"};if(!SUPA||!KEY)return new Response(FALLBACK,{headers:hdr});
 const raw=((params.path||[])[0]||"").replace(/\.svg$/i,"");if(!raw)return new Response(FALLBACK,{headers:hdr});
 const sel=encodeURIComponent("title,artists(name)");
 const tryFetch=async(q)=>{const j=await getJSON(SUPA,KEY,"ringtones?"+q+"&select="+sel+"&limit=1");return Array.isArray(j)&&j[0]?j[0]:null};
 let row=await tryFetch("id=eq."+encodeURIComponent(raw));
 if(!row)row=await tryFetch("short_id=eq."+encodeURIComponent(raw));
 if(!row)row=await tryFetch("seo_slug=eq."+encodeURIComponent(raw));
 const title=row?row.title:"RingMang";const artist=row&&row.artists?row.artists.name:"Free Ringtones";
 return new Response(buildCover(title,artist),{headers:hdr});}
// RM9B_OG_END
