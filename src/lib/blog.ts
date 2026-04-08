import "server-only";
import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import matter from "gray-matter";
import type { Html, Image, Parent, Root } from "mdast";
import { cache } from "react";
import readingTimeLib from "reading-time";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { createHighlighter } from "shiki";
import type { PluggableList } from "unified";
import { unified } from "unified";
import type { Node } from "unist";
import { visit } from "unist-util-visit";
import { SITE } from "./config";
import { escapeHtml } from "./html";
import { shouldProxyExternalImage, toImageProxyUrl } from "./imageProxy";
import { slugifyStr } from "./slugify";

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

export const BLOG_DIR = "src/content/blog";

function findPostBySlug(posts: Post[], slug: string) {
  const exactMatch = posts.find((post) => post.url === slug);
  if (exactMatch) {
    return exactMatch;
  }

  return posts.find((post) => post.slug === slug) ?? null;
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

type MDExtraNode = Node & {
  type?: string;
  name?: string;
  attributes?: Array<{ type: string; name: string; value: unknown }>;
  meta?: string | null;
  data?: Record<string, unknown> & { hProperties?: Record<string, unknown> };
};

function visitChildren(node: Parent) {
  if (!node || !Array.isArray(node.children)) return;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index] as MDExtraNode;

    if (child?.type === "code") {
      const title = extractCodeBlockTitle(child.meta ?? undefined);
      if (title) {
        node.children.splice(index, 0, {
          type: "html",
          value: `<div class="code-block-title">${escapeHtml(title)}</div>`,
        } satisfies Html);
        index += 1;
      }
    }

    visitChildren(child as Parent);
  }
}

function remarkCodeBlockTitle() {
  return (tree: Root) => {
    visitChildren(tree);
  };
}

function remarkLazyLoadImages() {
  return (tree: Root) => {
    visit(tree, "image", (node: Image) => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties.loading = "lazy";
    });
  };
}

function normalizePublicAssetPath(value?: string) {
  if (!value) return value;
  return value.startsWith("./") ? `/${value.replace(/^\.\//, "")}` : value;
}

function remarkProxyExternalImages() {
  return (tree: Root) => {
    visit(tree, "image", (node: Image) => {
      if (typeof node.url !== "string") return;

      if (shouldProxyExternalImage(node.url)) {
        node.url = toImageProxyUrl(node.url);
      } else {
        const normalized = normalizePublicAssetPath(node.url);
        node.url = normalized ?? node.url;
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(
      tree,
      (node: any) => node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement",
      (node: any) => {
        if (!["img", "AdaptiveImage"].includes(node.name ?? "")) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const srcAttr = (node.attributes as any[])?.find(
          (attr) => attr.type === "mdxJsxAttribute" && attr.name === "src"
        );
        if (!srcAttr || typeof srcAttr.value !== "string") return;

        if (shouldProxyExternalImage(srcAttr.value)) {
          srcAttr.value = toImageProxyUrl(srcAttr.value);
        } else {
          srcAttr.value = normalizePublicAssetPath(srcAttr.value);
        }

        if (node.name === "img") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const loadingAttr = (node.attributes as any[])?.find(
            (attr) => attr.type === "mdxJsxAttribute" && attr.name === "loading"
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

let _highlighter: any = null;
let _highlighterPromise: Promise<any> | null = null;

export async function getHighlighter() {
  if (_highlighter) return _highlighter;

  if (!_highlighterPromise) {
    _highlighterPromise = (async () => {
      _highlighter = await createHighlighter({
        themes: ["min-light", "night-owl"],
        langs: [
          "typescript",
          "javascript",
          "tsx",
          "jsx",
          "css",
          "html",
          "json",
          "markdown",
          "bash",
          "sh",
          "yaml",
          "rust",
          "go",
          "python",
        ],
      });
      return _highlighter;
    })();
  }

  return _highlighterPromise;
}

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

function normalizeFrontmatterImages(frontmatter: PostFrontmatter) {
  for (const key of ["coverImage", "heroImage", "ogImage"] as const) {
    frontmatter[key] = normalizePublicAssetPath(frontmatter[key]);
  }
}

function getAllMarkdownFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
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

const loadAllPosts = cache(async (): Promise<Post[]> => {
  const blogPath = path.resolve(BLOG_DIR);

  if (!fs.existsSync(blogPath)) {
    return [];
  }

  const files = getAllMarkdownFiles(blogPath);

  return Promise.all(
    files.map(async (filePath) => {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      const frontmatter = data as PostFrontmatter;

      if (!frontmatter.tags) frontmatter.tags = ["others"];
      if (!frontmatter.author) frontmatter.author = SITE.author;
      normalizeFrontmatterImages(frontmatter);

      const relativePath = path.relative(blogPath, filePath);
      const slug = relativePath.replace(/\\/g, "/").replace(/\.(md|mdx)$/, "");

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
});

const loadSortedVisiblePosts = cache(async (): Promise<Post[]> => {
  const posts = await loadAllPosts();

  return posts.filter(isPostVisible).sort((a, b) => {
    const dateA = new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime();
    const dateB = new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime();
    return Math.floor(dateB / 1000) - Math.floor(dateA / 1000);
  });
});

export async function getAllPosts(): Promise<Post[]> {
  return loadAllPosts();
}

export async function getSortedPosts(): Promise<Post[]> {
  return loadSortedVisiblePosts();
}

export async function getPostBySlug(
  slug: string,
  options?: { includeHidden?: boolean }
): Promise<Post | null> {
  const posts = options?.includeHidden ? await getAllPosts() : await getSortedPosts();
  return findPostBySlug(posts, slug);
}

export async function getUniqueTags(): Promise<{ tag: string; tagName: string }[]> {
  const posts = await getSortedPosts();
  const seen = new Set<string>();
  const tags: { tag: string; tagName: string }[] = [];

  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      const slug = slugifyStr(tag);
      if (seen.has(slug)) continue;
      seen.add(slug);
      tags.push({ tag: slug, tagName: tag });
    }
  }

  return tags.sort((a, b) => a.tag.localeCompare(b.tag));
}

export async function getAllSlugs(): Promise<string[]> {
  const posts = await getSortedPosts();
  return posts.map((post) => post.url);
}

export function getPostImage(data: PostFrontmatter) {
  return data.coverImage ?? data.heroImage;
}

export const mdxRemarkPlugins: PluggableList = [
  remarkGfm,
  remarkCodeBlockTitle,
  remarkLazyLoadImages,
  remarkProxyExternalImages,
];

export const mdxRehypePlugins: PluggableList = [
  [rehypeRaw, { passThrough: ["mdxJsxFlowElement", "mdxJsxTextElement", "mdxjsEsm"] }],
  rehypeSlug,
];

export function extractHeadingsFromMarkdown(content: string): Heading[] {
  const processor = unified().use(remarkParse);
  const file = processor.parse(content);
  const headings: Heading[] = [];
  const slugger = new GithubSlugger();

  visit(
    file,
    "heading",
    (node: { depth: number; children?: Array<{ type: string; value?: string }> }) => {
      if (node.depth < 2 || node.depth > 3) return;

      let text = "";
      for (const child of node.children ?? []) {
        if (child.type === "text" && child.value) {
          text += child.value;
        } else if (child.type === "inlineCode" && child.value) {
          text += child.value;
        }
      }

      if (!text.trim()) return;

      headings.push({
        depth: node.depth,
        slug: slugger.slug(text.trim()),
        text: text.trim(),
      });
    }
  );

  return headings;
}
