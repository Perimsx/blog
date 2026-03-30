import { getSortedPosts } from "@/lib/blog";
import { SITE } from "@/lib/config";

export async function GET() {
  const posts = await getSortedPosts();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE.website}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE.website}posts</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE.website}tags</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE.website}about</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE.website}contact</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
${posts
  .map((post) => {
    const postUrl = `${SITE.website}posts/${post.url}`;
    const lastmod = post.data.modDatetime
      ? new Date(post.data.modDatetime).toISOString().split("T")[0]
      : new Date(post.data.pubDatetime).toISOString().split("T")[0];
    return `  <url>
    <loc>${postUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
