import { getSortedPosts, getUniqueTags } from "@/lib/blog";
import { getCanonicalUrl, getPostCanonicalUrl } from "@/lib/seo";

function toDateString(value: string | Date) {
  return new Date(value).toISOString().split("T")[0];
}

function renderUrlEntry({
  changefreq,
  lastmod,
  loc,
  priority,
}: {
  changefreq: string;
  lastmod?: string;
  loc: string;
  priority: string;
}) {
  return `  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export async function GET() {
  const posts = await getSortedPosts();
  const tags = await getUniqueTags();
  const latestUpdate =
    posts[0]?.data.modDatetime ?? posts[0]?.data.pubDatetime ?? new Date().toISOString();

  const staticEntries = [
    renderUrlEntry({
      changefreq: "daily",
      lastmod: toDateString(latestUpdate),
      loc: getCanonicalUrl("/"),
      priority: "1.0",
    }),
    renderUrlEntry({
      changefreq: "weekly",
      lastmod: toDateString(latestUpdate),
      loc: getCanonicalUrl("/posts"),
      priority: "0.9",
    }),
    renderUrlEntry({
      changefreq: "weekly",
      lastmod: toDateString(latestUpdate),
      loc: getCanonicalUrl("/tags"),
      priority: "0.8",
    }),
    renderUrlEntry({
      changefreq: "monthly",
      lastmod: toDateString(latestUpdate),
      loc: getCanonicalUrl("/about"),
      priority: "0.7",
    }),
    renderUrlEntry({
      changefreq: "monthly",
      lastmod: toDateString(latestUpdate),
      loc: getCanonicalUrl("/contact"),
      priority: "0.6",
    }),

  ];

  const postEntries = posts
    .filter(
      (post) => !post.data.canonicalURL || post.data.canonicalURL.startsWith(getCanonicalUrl("/"))
    )
    .map((post) =>
      renderUrlEntry({
        changefreq: "weekly",
        lastmod: toDateString(post.data.modDatetime ?? post.data.pubDatetime),
        loc: getPostCanonicalUrl(post.url, post.data.canonicalURL),
        priority: "0.8",
      })
    );

  const tagEntries = tags.map(({ tag, tagName }) => {
    const taggedPosts = posts.filter((post) =>
      (post.data.tags ?? []).some((postTag) => postTag === tagName)
    );
    const tagLastmod =
      taggedPosts[0]?.data.modDatetime ?? taggedPosts[0]?.data.pubDatetime ?? latestUpdate;

    return renderUrlEntry({
      changefreq: "weekly",
      lastmod: toDateString(tagLastmod),
      loc: getCanonicalUrl(`/tags/${tag}`),
      priority: "0.7",
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...postEntries, ...tagEntries].join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
