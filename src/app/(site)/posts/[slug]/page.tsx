import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSortedPosts, getPostBySlug, getAllSlugs, extractHeadingsFromMarkdown, mdxRemarkPlugins, mdxRehypePlugins } from "@/lib/blog";
import { SITE } from "@/lib/config";
import { Tag } from "@/components/Tag";
import { Datetime } from "@/components/Datetime";
import { ShareLinks } from "@/components/ShareLinks";
import { IconChevronLeft, IconChevronRight, IconEdit } from "@/components/icons";
import { TocProvider } from "@/components/TocContext";
import { slugifyStr } from "@/lib/slugify";
import { ArticleEnhancer } from "@/components/ArticleEnhancer";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Grid } from "@/components/mdx/Grid";
import { Card } from "@/components/mdx/Card";
import { Callout } from "@/components/mdx/Callout";
import { Pre } from "@/components/mdx/Pre";
import FloatingToc from "@/components/FloatingToc";

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
  const postUrl = `/posts/${post.url}`;

  let ogImageUrl: string | undefined;
  const articleImage = coverImage ?? post.data.heroImage;

  if (typeof articleImage === "string") {
    ogImageUrl = articleImage;
  } else if (typeof ogImage === "string") {
    ogImageUrl = ogImage;
  } else if (SITE.dynamicOgImage) {
    ogImageUrl = `${postUrl}/index.png`;
  }

  const computedCanonicalURL = post.data.canonicalURL ?? new URL(postUrl, SITE.website).href;

  return {
    title,
    description,
    authors: [{ name: author || SITE.author }],
    openGraph: {
      type: "article",
      title,
      description,
      url: computedCanonicalURL,
      ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {}),
      publishedTime: new Date(pubDatetime).toISOString(),
      ...(modDatetime ? { modifiedTime: new Date(modDatetime).toISOString() } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    alternates: {
      canonical: computedCanonicalURL,
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
  const { title, description, pubDatetime, modDatetime, timezone, tags, coverImage, heroImage, hideEditPost } = post.data;

  // Extract headings from raw markdown using lightweight AST traversal
  // (avoids expensive full MDX compilation + shiki highlighting)
  const headings = extractHeadingsFromMarkdown(post.content);
  const tocHeadings = headings.filter((h) => h.depth > 1 && h.depth < 4);

  // Reading time and word count
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = post.readingTime;

  // Prev/Next posts
  const allPostPaths = sortedPosts.map((p) => ({
    path: `/posts/${p.url}`,
    slug: p.slug,
    title: p.data.title,
  }));
  const currentIndex = allPostPaths.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIndex > 0 ? allPostPaths[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < allPostPaths.length - 1 ? allPostPaths[currentIndex + 1] : null;

  const postUrl = `/posts/${post.url}`;
  const articleImage = coverImage ?? heroImage;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    author: {
      "@type": "Person",
      name: post.data.author || SITE.author,
      url: `${SITE.website}about`,
    },
    datePublished: new Date(pubDatetime).toISOString(),
    dateModified: new Date(modDatetime ?? pubDatetime).toISOString(),
    publisher: {
      "@type": "Organization",
      name: SITE.title,
      url: SITE.website,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": new URL(postUrl, SITE.website).href,
    },
    image: articleImage || `${SITE.website}og-image.jpg`,
    articleSection: tags?.[0] || "Technology",
    keywords: tags?.join(", ") || "",
    wordCount,
    timeRequired: readingTime ? `PT${Math.ceil(parseInt(readingTime, 10))}M` : undefined,
    inLanguage: SITE.lang || "zh-CN",
  };

  const showEditPost = SITE.editPost.enabled && !hideEditPost;
  const editPostUrl = `${SITE.editPost.url}${post.filePath}`;

  return (
    <TocProvider>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main
        id="main-content"
        className="layout-frame w-full pb-8 mt-4"
        data-pagefind-body
      >
        <h1
          title={title}
          className="block w-full text-[1.22rem] leading-[1.18] font-semibold text-accent sm:text-[1.98rem] lg:text-[1.9rem] lg:truncate"
        >
          {title}
        </h1>

        <div className="mt-1 mb-1.5 sm:mt-1.5 sm:mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Datetime pubDatetime={pubDatetime} modDatetime={modDatetime} timezone={timezone} size="lg" />
            {readingTime && (
              <>
                <span className="text-foreground/30">•</span>
                <span className="text-[0.95rem] italic text-foreground/60">{readingTime}</span>
              </>
            )}
          </div>
          {showEditPost && (
            <a
              href={editPostUrl}
              rel="noopener noreferrer"
              target="_blank"
              className="hidden max-sm:hidden opacity-80 hover:opacity-75"
            >
              <IconEdit className="inline-block size-6" />
              <span className="italic max-sm:text-sm sm:inline">{SITE.editPost.text}</span>
            </a>
          )}
        </div>

        <article id="article" className="article-detail prose mx-auto mt-2 sm:mt-6 max-w-3xl">
          {articleImage && typeof articleImage === "string" && (
            <img
              src={articleImage}
              alt={title}
              className="mb-6 aspect-video w-full rounded-md object-cover"
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
              }
            }}
          />
          <ArticleEnhancer />
        </article>

        {/* Floating Table of Contents & Scroll Tools */}
        <FloatingToc toc={headings} />

        {/* Tags and Share */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 mb-4 sm:my-6">
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {(tags ?? []).map((tag, idx) => (
              <Tag key={`${tag}-${idx}`} tag={slugifyStr(tag)} tagName={tag} />
            ))}
          </ul>
          <ShareLinks url={new URL(postUrl, SITE.website).href} title={title} />
        </div>

        {/* Edit Post (mobile) */}
        {showEditPost && (
          <a
            href={editPostUrl}
            rel="noopener noreferrer"
            target="_blank"
            className="sm:hidden opacity-80 hover:opacity-75"
          >
            <IconEdit className="inline-block size-6" />
            <span className="italic text-sm">{SITE.editPost.text}</span>
          </a>
        )}

        <hr className="my-6 border-dashed" />

        {/* Prev/Next Post Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          {prevPost ? (
            <Link
              href={prevPost.path}
              className="flex gap-2 hover:opacity-75 items-start"
            >
              <IconChevronLeft className="inline-block flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="block text-sm text-foreground/70">上一篇</span>
                <div className="text-accent/85">{prevPost.title}</div>
              </div>
            </Link>
          ) : <div />}

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
          ) : <div />}
        </div>
      </main>
    </TocProvider>
  );
}
