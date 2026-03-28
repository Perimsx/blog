import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");
const RESERVED_URLS = new Set(["index", "index.png"]);
const RESERVED_SEGMENTS = new Set([".", ".."]);

function normalizeUrlPath(input) {
  if (typeof input !== "string") return "";

  return input
    .trim()
    .replace(/^\/+/, "")
    .replace(/^posts\/+/, "")
    .replace(/\/+$/, "");
}

function validateUrlPath(url, fileName) {
  if (!url) {
    throw new Error(`[blog:url] ${fileName} 缺少 url 字段`);
  }

  if (/[?#\\]/.test(url)) {
    throw new Error(`[blog:url] ${fileName} 的 url 不能包含 ?, # 或反斜杠`);
  }

  if (RESERVED_URLS.has(url) || /^\d+$/.test(url)) {
    throw new Error(`[blog:url] ${fileName} 的 url "${url}" 为保留路径`);
  }

  const segments = url.split("/");
  if (segments.some(segment => !segment || RESERVED_SEGMENTS.has(segment))) {
    throw new Error(`[blog:url] ${fileName} 的 url "${url}" 包含非法路径段`);
  }
}

export function validateBlogContent() {
  if (!fs.existsSync(BLOG_DIR)) return;

  const entries = [];
  const stack = [BLOG_DIR];

  while (stack.length > 0) {
    const currentDir = stack.pop();
    if (!currentDir) continue;

    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
        entries.push(fullPath);
      }
    }
  }

  const urlToFile = new Map();

  for (const fullPath of entries) {
    const fileName = path.relative(BLOG_DIR, fullPath);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(raw);

    const url = normalizeUrlPath(data.url);
    validateUrlPath(url, fileName);

    if (urlToFile.has(url)) {
      throw new Error(
        `[blog:url] ${fileName} 与 ${urlToFile.get(url)} 使用了重复 url "${url}"`
      );
    }

    urlToFile.set(url, fileName);
  }
}
