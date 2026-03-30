import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL, siteUrl: string) => `
User-agent: *
Allow: /
Disallow: /page/

User-agent: Googlebot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: bingbot
Allow: /

Sitemap: ${sitemapURL.href}
Host: ${siteUrl}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(getRobotsTxt(sitemapURL, site?.toString() || ""), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
