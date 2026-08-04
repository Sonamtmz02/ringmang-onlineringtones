/**
 * RingMang — RSS 2.0 feed (Master-plan P1). Auto-updating (reads DB each request),
 * so every new upload appears automatically. Read-only, additive, reversible
 * (delete this file to remove). No existing logic/DB/URL touched.
 */
const escXml=(s)=>String(s==null?"":s).replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
export async function onRequestGet(context){
 const {request,env}=context;
 const origin=new URL(request.url).origin;
 const SUPA=env.SUPABASE_URL,KEY=env.SUPABASE_ANON_KEY;
 if(!SUPA||!KEY)return new Response("Missing env",{status:500});
 const r=await fetch(SUPA+"/rest/v1/ringtones?seo_noindex=eq.false&select=title,seo_slug,description,created_at,categories(name)&order=created_at.desc&limit=50",{headers:{apikey:KEY,Authorization:"Bearer "+KEY,Accept:"application/json"}});
 const rows=r.ok?await r.json():[];
 const now=new Date().toUTCString();
 let xml='<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>\n';
 xml+='<title>'+escXml("RingMang — Free Ringtones")+'</title>\n';
 xml+='<link>'+escXml(origin)+'</link>\n';
 xml+='<atom:link href="'+escXml(origin+"/rss.xml")+'" rel="self" type="application/rss+xml"/>\n';
 xml+='<description>'+escXml("Browse, preview & download free ringtones — original beats to movie clips.")+'</description>\n';
 xml+='<lastBuildDate>'+now+'</lastBuildDate>\n';
 (rows||[]).forEach(function(t){
   const link=origin+"/ringtone/"+encodeURIComponent(t.seo_slug||"");
   const pub=t.created_at?new Date(t.created_at).toUTCString():now;
   xml+='<item><title>'+escXml(t.title||"")+'</title><link>'+escXml(link)+'</link><guid isPermaLink="true">'+escXml(link)+'</guid><pubDate>'+pub+'</pubDate><description>'+escXml(t.description||t.title)+'</description>'+((t.categories&&t.categories.name)?'<category>'+escXml(t.categories.name)+'</category>':'')+'</item>\n';
 });
 xml+='</channel></rss>\n';
 return new Response(xml,{headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, max-age=300, s-maxage=600"}});
}
// RM16_RSS_END
