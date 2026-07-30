/**
 * RingMang — robots.txt (points crawlers to the dynamic sitemap). Domain derived from request.
 */
export async function onRequestGet(context){
  const origin = new URL(context.request.url).origin;
  const body =
    "User-agent: *\n" +
    "Allow: /\n" +
    "Disallow: /cdn-cgi/\n" +
    "Disallow: /functions/\n" +
    "\n" +
    "Sitemap: " + origin + "/sitemap.xml\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
