import React from "react";
import { SITE } from "@/lib/config";

interface StructuredDataProps {
  type: "BlogPosting" | "Person" | "WebSite";
  data: Record<string, unknown>;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const siteUrl = SITE.website;
  const siteName = SITE.title;
  const siteAuthor = SITE.author;
  const siteDesc = SITE.desc;
  const siteOgImage = `${siteUrl}og-image.jpg`;

  let structuredData: Record<string, unknown> = {};

  if (type === "BlogPosting") {
    const readingMinutes =
      typeof data.readingTime === "string" ? Number.parseInt(data.readingTime as string, 10) : undefined;

    structuredData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: data.title,
      description: data.description,
      author: {
        "@type": "Person",
        name: data.author || siteAuthor,
        url: `${siteUrl}about`,
      },
      datePublished: data.pubDatetime instanceof Date ? data.pubDatetime.toISOString() : data.pubDatetime,
      dateModified: data.modDatetime instanceof Date
        ? data.modDatetime.toISOString()
        : (data.modDatetime as string | undefined) || data.pubDatetime,
      publisher: {
        "@type": "Organization",
        name: siteName,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: siteOgImage,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": data.url,
      },
      image: data.coverImage || data.ogImage || data.heroImage || siteOgImage,
      articleSection: (Array.isArray(data.tags) ? (data.tags as string[])[0] : undefined) || "Technology",
      keywords: Array.isArray(data.tags) ? (data.tags as string[]).join(", ") : "",
      wordCount: data.wordCount,
      ...(readingMinutes ? { timeRequired: `PT${readingMinutes}M` } : {}),
      isPartOf: {
        "@type": "WebSite",
        name: siteName,
        url: siteUrl,
      },
      inLanguage: SITE.lang || "zh-CN",
    };
  } else if (type === "Person") {
    structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: siteAuthor,
      url: siteUrl,
      image: siteOgImage,
      sameAs: ["https://github.com/Perimsx", "https://space.bilibili.com/9655855"],
      jobTitle: "信息安全学生 / Web 开发爱好者",
      description: siteDesc,
    };
  } else if (type === "WebSite") {
    structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
      description: siteDesc,
      inLanguage: SITE.lang || "zh-CN",
      author: {
        "@type": "Person",
        name: siteAuthor,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};
