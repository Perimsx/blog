import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { MDXRemote } from "next-mdx-remote/rsc";
import { AdaptiveImage } from "@/components/AdaptiveImage";
import { ArticleEnhancer } from "@/components/ArticleEnhancer";
import { Datetime } from "@/components/Datetime";
import { EditPost } from "@/components/EditPost";
import FloatingToc from "@/components/FloatingToc";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";
import { Callout } from "@/components/mdx/Callout";
import { Card } from "@/components/mdx/Card";
import { Grid } from "@/components/mdx/Grid";
import { Pre } from "@/components/mdx/Pre";
import { ShareLinks } from "@/components/ShareLinks";
import { Tag } from "@/components/Tag";
import { TocProvider } from "@/components/TocContext";
import Comments from "@/features/comments/components/Comments";
import {
  extractHeadingsFromMarkdown,
  getAllSlugs,
  getPostBySlug,
  getPostImage,
  getSortedPosts,
  mdxRehypePlugins,
  mdxRemarkPlugins,
} from "@/lib/blog";
import { SITE } from "@/lib/config";
import { getPostCanonicalUrl, getPostShareImage, toAbsoluteUrl } from "@/lib/seo";
import { slugifyStr } from "@/lib/slugify";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const { title, description, pubDatetime, modDatetime, coverImage, ogImage, author } = post.data;
  const canonicalUrl = getPostCanonicalUrl(post.url, post.data.canonicalURL);
  const shareImage = getPostShareImage(title, ogImage, coverImage, post.data.heroImage, `/posts/${slug}/og-image`);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    authors: [{ name: author || SITE.author, url: SITE.profile }],
    keywords: post.data.tags ?? [],
    openGraph: {
      description,
      images: [shareImage],
      locale: "zh_CN",
      publishedTime: new Date(pubDatetime).toISOString(),
      siteName: "Perimsx",
      title,
      type: "article",
      ...(modDatetime ? { modifiedTime: new Date(modDatetime).toISOString() } : {}),
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      description,
      images: [shareImage.url],
      title,
    },
  };
}

const mdxComponents = {
  Grid,
  Card,
  Callout,
  pre: Pre,
};

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const sortedPosts = await getSortedPosts();
  const { title, description, pubDatetime, modDatetime, timezone, tags } = post.data;

  const headings = extractHeadingsFromMarkdown(post.content);
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = post.readingTime;

  const allPostPaths = sortedPosts.map((p) => ({
    path: `/posts/${p.url}`,
    slug: p.slug,
    title: p.data.title,
  }));
  const currentIndex = allPostPaths.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIndex > 0 ? allPostPaths[currentIndex - 1] : null;
  const nextPost =
    currentIndex >= 0 && currentIndex < allPostPaths.length - 1
      ? allPostPaths[currentIndex + 1]
      : null;

  const postUrl = `/posts/${post.url}`;
  const articleImage = getPostImage(post.data);
  const uniqueTags = Array.from(
    new Map((tags ?? []).map((tag) => [slugifyStr(tag), tag])).entries()
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            item: SITE.website,
            name: "首页",
            position: 1,
          },
          {
            "@type": "ListItem",
            item: `${SITE.website}posts`,
            name: "文章归档",
            position: 2,
          },
          {
            "@type": "ListItem",
            item: getPostCanonicalUrl(post.url, post.data.canonicalURL),
            name: title,
            position: 3,
          },
        ],
      },
      {
        "@type": "BlogPosting",
        articleSection: tags?.[0] || "Technology",
        author: {
          "@type": "Person",
          name: post.data.author || SITE.author,
          url: `${SITE.website}about`,
        },
        dateModified: new Date(modDatetime ?? pubDatetime).toISOString(),
        datePublished: new Date(pubDatetime).toISOString(),
        description,
        headline: title,
        image: [
          getPostShareImage(title, post.data.ogImage, post.data.coverImage, articleImage, `/posts/${post.slug}/og-image`).url,
          articleImage ? toAbsoluteUrl(articleImage) : "",
        ].filter(Boolean),
        inLanguage: SITE.lang || "zh-CN",
        keywords: tags?.join(", ") || "",
        mainEntityOfPage: {
          "@id": getPostCanonicalUrl(post.url, post.data.canonicalURL),
          "@type": "WebPage",
        },
        publisher: {
          "@type": "Organization",
          logo: {
            "@type": "ImageObject",
            url: `${SITE.website}android-chrome-512x512.png`,
          },
          name: "Perimsx",
          url: SITE.website,
        },
        timeRequired: readingTime ? `PT${Math.ceil(parseInt(readingTime, 10))}M` : undefined,
        url: getPostCanonicalUrl(post.url, post.data.canonicalURL),
        wordCount,
      },
    ],
  };

  return (
    <TocProvider>
      <Script id={`post-json-ld-${post.slug}`} type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>

      <main
        id="main-content"
        className="layout-frame w-full pt-5 pb-0 sm:pt-7 sm:pb-0"
        data-pagefind-body
      >
        <h1
          title={title}
          className="block w-full text-[1.12rem] leading-[1.16] font-semibold tracking-tight text-accent sm:text-[1.82rem] lg:text-[1.78rem] lg:truncate"
        >
          {title}
        </h1>

        <div className="mt-2 mb-3.5 flex items-center justify-between gap-3 sm:mt-2.5 sm:mb-5">
          <div className="flex items-center gap-2.5">
            <Datetime
              pubDatetime={pubDatetime}
              modDatetime={modDatetime}
              timezone={timezone}
              size="lg"
            />
            {readingTime && (
              <>
                <span className="text-foreground/30">•</span>
                <span className="text-[0.88rem] italic text-foreground/60 sm:text-[0.92rem]">
                  {readingTime}
                </span>
              </>
            )}
          </div>
          <EditPost post={post} hideEditPost={post.data.hideEditPost} className="hidden sm:block" />
        </div>

        <article id="article" className="article-detail prose mx-auto mt-4.5 max-w-3xl sm:mt-5">
          {articleImage && typeof articleImage === "string" && (
            <AdaptiveImage
              src={articleImage}
              alt={title}
              width={1200}
              height={675}
              sizes="(max-width: 768px) 100vw, 896px"
              className="mb-3.5 aspect-video w-full rounded-md object-cover sm:mb-5"
              loading="lazy"
            />
          )}
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: mdxRemarkPlugins,
                rehypePlugins: mdxRehypePlugins,
              },
            }}
          />
          <ArticleEnhancer />
        </article>

        <FloatingToc toc={headings} />

        <div className="mt-5 mb-5 flex flex-wrap items-center justify-between gap-3 sm:my-7">
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {uniqueTags.map(([tag, tagName]) => (
              <Tag key={tag} tag={tag} tagName={tagName} />
            ))}
          </ul>
          <ShareLinks url={new URL(postUrl, SITE.website).href} />
        </div>

        <EditPost post={post} hideEditPost={post.data.hideEditPost} className="sm:hidden" />

        {SITE.comments.enabled ? (
          <>
            <hr className="mt-6 mb-2 border-dashed sm:mt-7 sm:mb-2.5" />
            <Comments path={postUrl} />
          </>
        ) : null}

        <hr className="my-5 border-dashed sm:my-6" />

        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          {prevPost ? (
            <Link href={prevPost.path} className="flex gap-2 hover:opacity-75 items-start">
              <IconChevronLeft className="inline-block flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="block text-sm text-foreground/70">上一篇</span>
                <div className="text-accent/85">{prevPost.title}</div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextPost ? (
            <Link
              href={nextPost.path}
              className="flex gap-2 hover:opacity-75 items-start justify-end text-right ml-auto"
            >
              <div className="min-w-0">
                <span className="block text-sm text-foreground/70">下一篇</span>
                <div className="text-accent/85">{nextPost.title}</div>
              </div>
              <IconChevronRight className="inline-block flex-shrink-0 mt-0.5" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>
    </TocProvider>
  );
}
