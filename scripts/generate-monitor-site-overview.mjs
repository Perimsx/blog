import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.resolve("src/content/blog");
const OUTPUT_FILE = path.resolve("src/generated/monitor-site-overview.json");
const SCHEDULED_POST_MARGIN_MS = 15 * 60 * 1000;

function countWords(content) {
  const normalized = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, " $1 ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~=-]+/g, " ")
    .replace(/\r?\n/g, " ");

  const cjkUnits =
    normalized.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu)
      ?.length ?? 0;
  const latinWords = normalized.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0;

  return cjkUnits + latinWords;
}

function getAllMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!entry.name.startsWith("_")) {
        files.push(...getAllMarkdownFiles(fullPath));
      }
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (extension === ".md" || extension === ".mdx") {
      files.push(fullPath);
    }
  }

  return files;
}

function isVisible(frontmatter) {
  const pubDate = new Date(frontmatter.pubDatetime).getTime();
  const publishTimeReached = Number.isFinite(pubDate)
    ? Date.now() > pubDate - SCHEDULED_POST_MARGIN_MS
    : false;

  return !frontmatter.draft && !frontmatter.unlisted && publishTimeReached;
}

function buildSummary() {
  const files = getAllMarkdownFiles(BLOG_DIR);
  const posts = [];

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);

    if (!isVisible(data)) {
      continue;
    }

    posts.push({
      content,
      latestPublishedAt: data.modDatetime ?? data.pubDatetime ?? null,
      tags: Array.isArray(data.tags) && data.tags.length ? data.tags : ["others"],
    });
  }

  posts.sort((left, right) => {
    const leftDate = new Date(left.latestPublishedAt ?? 0).getTime();
    const rightDate = new Date(right.latestPublishedAt ?? 0).getTime();
    return rightDate - leftDate;
  });

  return {
    latestPublishedAt: posts[0]?.latestPublishedAt ?? null,
    posts: posts.length,
    tags: new Set(posts.flatMap((post) => post.tags)).size,
    totalWords: posts.reduce((sum, post) => sum + countWords(post.content), 0),
  };
}

const summary = buildSummary();
fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
