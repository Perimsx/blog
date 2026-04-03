import { getSortedPosts } from "@/lib/blog";
import { SITE } from "@/lib/config";
import { DEFAULT_SHARE_IMAGE, SEO_BRAND_NAME } from "@/lib/seo";

export async function GET() {
  const sortedPosts = await getSortedPosts();

  const items = sortedPosts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <link>${new URL(`/posts/${post.url}`, SITE.website).href}</link>
      <description><![CDATA[${post.data.description}]]></description>
      <pubDate>${new Date(post.data.modDatetime ?? post.data.pubDatetime).toUTCString()}</pubDate>
      <guid>${new URL(`/posts/${post.url}`, SITE.website).href}</guid>
    </item>`
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SEO_BRAND_NAME}</title>
    <link>${SITE.website}</link>
    <description>${SITE.desc}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE.website}rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${DEFAULT_SHARE_IMAGE.url}</url>
      <title>${SEO_BRAND_NAME}</title>
      <link>${SITE.website}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
