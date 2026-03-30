import { SITE } from "@/lib/config";

export async function GET() {
  const sitemapURL = new URL("/sitemap.xml", SITE.website);
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /page/

User-agent: Googlebot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: bingbot
Allow: /

Sitemap: ${sitemapURL.href}
Host: ${SITE.website}
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
