import { getCanonicalUrl } from "@/lib/seo";

export async function GET() {
  const sitemapURL = getCanonicalUrl("/sitemap.xml");
  const host = new URL(getCanonicalUrl("/")).host;
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/comments

Sitemap: ${sitemapURL}
Host: ${host}
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
