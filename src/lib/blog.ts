import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { visit } from "unist-util-visit";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { createHighlighter } from "shiki";
import readingTimeLib from "reading-time";

import { slugifyStr } from "./slugify";
import { shouldProxyExternalImage, toImageProxyUrl } from "./imageProxy";
import { SITE } from "./config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PostFrontmatter {
  author?: string;
  pubDatetime: string;
  modDatetime?: string;
  title: string;
  featured?: boolean;
  draft?: boolean;
  unlisted?: boolean;
  tags?: string[];
  coverImage?: string;
  ogImage?: string;
  heroImage?: string;
  description: string;
  url: string;
  canonicalURL?: string;
  hideEditPost?: boolean;
  timezone?: string;
  source?: string;
  AIDescription?: boolean;
}

export interface Post {
  slug: string;
  filePath: string;
  url: string;
  data: PostFrontmatter;
  content: string;
  readingTime: string;
}

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

// ---------------------------------------------------------------------------
// Directory
// ---------------------------------------------------------------------------

export const BLOG_DIR = "src/content/blog";

// ---------------------------------------------------------------------------
// Remark plugins (adapted from Astro)
// ---------------------------------------------------------------------------

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractCodeBlockTitle(meta: string | undefined) {
  if (!meta) return undefined;

  const patterns = [
    /\b(?:title|filename|file)="([^"]+)"/,
    /\b(?:title|filename|file)='([^']+)'/,
    /\b(?:title|filename|file)=([^\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = meta.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

function visitChildren(node: any) {
  if (!node || !Array.isArray(node.children)) return;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];

    if (child?.type === "code") {
      const title = extractCodeBlockTitle(child.meta);
      if (title) {
        node.children.splice(index, 0, {
          type: "html",
          value: `<div class="code-block-title">${escapeHtml(title)}</div>`,
        });
        index += 1;
      }
    }

    visitChildren(child);
  }
}

function remarkCodeBlockTitle() {
  return (tree: any) => {
    visitChildren(tree);
  };
}

function remarkLazyLoadImages() {
  return (tree: any) => {
    visit(tree, "image", (node: any) => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties.loading = "lazy";
    });
  };
}

function remarkProxyExternalImages() {
  return (tree: any) => {
    visit(tree, "image", (node: any) => {
      if (typeof node.url === "string") {
        if (shouldProxyExternalImage(node.url)) {
          node.url = toImageProxyUrl(node.url);
        } else if (node.url.startsWith("./")) {
          node.url = "/" + node.url.replace(/^\.\//, "");
        }
      }
    });

    visit(
      tree,
      (node: any) =>
        node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement",
      (node: any) => {
        if (!["img", "AdaptiveImage"].includes(node.name)) return;

        const srcAttr = node.attributes?.find(
          (attr: any) => attr.type === "mdxJsxAttribute" && attr.name === "src"
        );
        if (!srcAttr || typeof srcAttr.value !== "string") return;

        if (shouldProxyExternalImage(srcAttr.value)) {
          srcAttr.value = toImageProxyUrl(srcAttr.value);
        } else if (srcAttr.value.startsWith("./")) {
          srcAttr.value = "/" + srcAttr.value.replace(/^\.\//, "");
        }

        if (node.name === "img") {
          const loadingAttr = node.attributes?.find(
            (attr: any) => attr.type === "mdxJsxAttribute" && attr.name === "loading"
          );
          if (!loadingAttr) {
            node.attributes = node.attributes || [];
            node.attributes.push({
              type: "mdxJsxAttribute",
              name: "loading",
              value: "lazy",
            });
          }
        }
      }
    );
  };
}

// ---------------------------------------------------------------------------
// Shiki highlighter singleton
// ---------------------------------------------------------------------------

let _highlighter: Awaited<ReturnType<typeof createHighlighter>> | null = null;

export async function getHighlighter() {
  if (!_highlighter) {
    _highlighter = await createHighlighter({
      themes: ["min-light", "night-owl"],
      langs: [],
    });
  }
  return _highlighter;
}

// ---------------------------------------------------------------------------
// Core utilities
// ---------------------------------------------------------------------------

function calculateReadingTime(text: string): string {
  const stats = readingTimeLib(text);
  const minutes = Math.ceil(stats.minutes);
  return `${minutes} min read`;
}

function isPostVisible(post: Post): boolean {
  const now = Date.now();
  const pubDate = new Date(post.data.pubDatetime).getTime();
  const margin = SITE.scheduledPostMargin;
  const isPublishTimePassed = now > pubDate - margin;
  return (
    !post.data.draft &&
    !post.data.unlisted &&
    (process.env.NODE_ENV === "development" || isPublishTimePassed)
  );
}

function getAllMarkdownFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip directories starting with underscore
      if (!entry.name.startsWith("_")) {
        files.push(...getAllMarkdownFiles(fullPath));
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === ".md" || ext === ".mdx") {
        files.push(fullPath);
      }
    }
  }

  return files;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Read and parse all blog posts from the content directory.
 * Does NOT filter drafts or sort - returns raw posts.
 */
export async function getAllPosts(): Promise<Post[]> {
  const blogPath = path.resolve(BLOG_DIR);

  if (!fs.existsSync(blogPath)) {
    return [];
  }

  const files = getAllMarkdownFiles(blogPath);

  const posts: Post[] = await Promise.all(
    files.map(async (filePath) => {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);

      const frontmatter = data as PostFrontmatter;

      // Normalize frontmatter defaults
      if (!frontmatter.tags) frontmatter.tags = ["others"];
      if (!frontmatter.author) frontmatter.author = SITE.author;

      // Normalize relative image paths for Next.js public/ hosting
      ["coverImage", "ogImage", "heroImage"].forEach((key) => {
        const k = key as keyof PostFrontmatter;
        if (typeof frontmatter[k] === "string" && (frontmatter[k] as string).startsWith("./")) {
          // Removes leading ./ and turns it into an absolute public path
          (frontmatter as any)[k] = "/" + (frontmatter[k] as string).replace(/^\.\//, "");
        }
      });

      // The slug/id is derived from the relative path without extension
      const relativePath = path.relative(blogPath, filePath);
      const slug = relativePath
        .replace(/\\/g, "/")
        .replace(/\.(md|mdx)$/, "");

      return {
        slug,
        filePath,
        url: frontmatter.url ?? slug,
        data: frontmatter,
        content,
        readingTime: calculateReadingTime(content),
      };
    })
  );

  return posts;
}

/**
 * Get all published posts, sorted by date (newest first).
 * Filters out drafts, unlisted posts, and posts scheduled too far in the future.
 */
export async function getSortedPosts(): Promise<Post[]> {
  const posts = await getAllPosts();

  return posts
    .filter(isPostVisible)
    .sort((a, b) => {
      const dateA = new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime();
      const dateB = new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime();
      return Math.floor(dateB / 1000) - Math.floor(dateA / 1000);
    });
}

/**
 * Find a post by its URL slug (matches the `url` field in frontmatter).
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getAllPosts();

  // First try exact URL match
  const exactMatch = posts.find((p) => p.url === slug);
  if (exactMatch) return exactMatch;

  // Fallback: try matching by file slug
  const byFileSlug = posts.find((p) => p.slug === slug);
  return byFileSlug ?? null;
}

/**
 * Get all unique tags from sorted posts.
 */
export async function getUniqueTags(): Promise<{ tag: string; tagName: string }[]> {
  const posts = await getSortedPosts();
  const seen = new Set<string>();
  const tags: { tag: string; tagName: string }[] = [];

  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      const slug = slugifyStr(tag);
      if (!seen.has(slug)) {
        seen.add(slug);
        tags.push({ tag: slug, tagName: tag });
      }
    }
  }

  return tags.sort((a, b) => a.tag.localeCompare(b.tag));
}

/**
 * Get all URL slugs for generateStaticParams.
 */
export async function getAllSlugs(): Promise<string[]> {
  const posts = await getSortedPosts();
  return posts.map((p) => p.url);
}

export const mdxRemarkPlugins = [
  remarkGfm,
  remarkToc,
  remarkCodeBlockTitle,
  remarkLazyLoadImages,
  remarkProxyExternalImages,
];

export const mdxRehypePlugins = [
  [rehypeRaw, { passThrough: ['mdxJsxFlowElement', 'mdxJsxTextElement', 'mdxjsEsm'] }],
  rehypeSlug,
  [rehypeAutolinkHeadings, {
    behavior: "append",
    properties: {
      className: ["anchor-link"],
      ariaLabel: "Permalink",
    },
    content: {
      type: "element",
      tagName: "span",
      properties: {},
      children: [{ type: "text", value: "#" }],
    },
  }],
];

/**
 * Compile markdown content to HTML string using a remark/rehype pipeline.
 * Includes shiki syntax highlighting with dual themes.
 */
export async function compileMDX(content: string): Promise<string> {
  const highlighter = await getHighlighter();

  let processor: any = unified().use(remarkParse);
  
  for (const plugin of mdxRemarkPlugins) {
    if (Array.isArray(plugin)) {
      processor = processor.use(plugin[0], plugin[1]);
    } else {
      processor = processor.use(plugin);
    }
  }

  processor = processor.use(remarkRehype, { allowDangerousHtml: true });

  for (const plugin of mdxRehypePlugins) {
    if (Array.isArray(plugin)) {
      processor = processor.use(plugin[0], plugin[1]);
    } else {
      processor = processor.use(plugin);
    }
  }

  const file = await processor
    .use(rehypeStringify)
    .process(content);

  let html = String(file);

  // Apply shiki syntax highlighting to code blocks
  html = await highlightCodeBlocks(html, highlighter);

  return html;
}

/**
 * Highlight code blocks in the HTML string using shiki.
 * This processes pre/code elements that weren't handled by the remark pipeline.
 */
async function highlightCodeBlocks(
  html: string,
  highlighter: Awaited<ReturnType<typeof createHighlighter>>
): Promise<string> {
  // Match <pre><code class="language-xxx">...</code></pre> blocks
  // and replace them with shiki-highlighted HTML
  const codeBlockRegex = /<pre><code(?:\s+class="language-([^"]*)")?[^>]*>([\s\S]*?)<\/code><\/pre>/g;

  let result = html;
  const matches = [...html.matchAll(codeBlockRegex)];

  // Process matches in reverse order to preserve string positions
  for (const match of matches.reverse()) {
    const [fullMatch, lang, code] = match;
    const rawCode = decodeHtmlEntities(code);
    const language = lang && lang !== "" ? lang : "text";

    try {
      const highlighted = highlighter.codeToHtml(rawCode, {
        lang: language,
        themes: {
          light: "min-light",
          dark: "night-owl",
        },
        defaultColor: false,
        transformers: [],
      });

      // Wrap in a container for the code-block-title injection point
      result =
        result.slice(0, match.index!) +
        `<div class="code-block-wrapper">${highlighted}</div>` +
        result.slice(match.index! + fullMatch.length);
    } catch {
      // If highlighting fails (unknown language), keep original
      result =
        result.slice(0, match.index!) +
        `<div class="code-block-wrapper">${fullMatch}</div>` +
        result.slice(match.index! + fullMatch.length);
    }
  }

  return result;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Extract headings from compiled HTML for the Table of Contents.
 */
export function extractHeadings(html: string): Heading[] {
  const headings: Heading[] = [];
  const headingRegex = /<h([23])[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h[23]>/g;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(html)) !== null) {
    const depth = parseInt(match[1], 10);
    const slug = match[2];
    // Extract text content, stripping any inner HTML tags
    const rawText = match[3].replace(/<[^>]+>/g, "").trim();

    headings.push({ depth, slug, text: rawText });
  }

  return headings;
}
