import path from "node:path";
import { slugifyStr } from "./slugify";

export const BLOG_DIR = "src/content/blog";

function normalizeCustomPostPath(customPath?: string) {
  if (!customPath) return undefined;

  const trimmedPath = customPath.trim();
  if (!trimmedPath) return undefined;

  return trimmedPath
    .replace(/^\/+/, "")
    .replace(/^posts\/+/, "")
    .replace(/\/+$/, "");
}

/**
 * Get full path of a blog post
 * @param id - id of the blog post (aka slug)
 * @param filePath - the blog post full file location
 * @param customPath - custom URL path from frontmatter
 * @param includeBase - whether to include `/posts` in return value
 * @returns blog post path
 */
export function getPath(
  id: string,
  filePath: string | undefined,
  customPath?: string,
  includeBase = true
) {
  const normalizedCustomPath = normalizeCustomPostPath(customPath);
  const pathSegments = filePath
    ?.replace(BLOG_DIR, "")
    .split(path.sep)
    .filter((p) => p !== "")
    .filter((p) => !p.startsWith("_"))
    .slice(0, -1)
    .map((segment) => slugifyStr(segment));

  const basePath = includeBase ? "/posts" : "";

  if (normalizedCustomPath) {
    return [basePath, normalizedCustomPath].join("/");
  }

  // Making sure `id` does not contain the directory
  const blogId = id.split("/");
  const slug = blogId.length > 0 ? blogId[blogId.length - 1] : blogId;

  // If not inside the sub-dir, simply return the file path
  if (!pathSegments || pathSegments.length < 1) {
    return [basePath, slug].join("/");
  }

  return [basePath, ...pathSegments, slug].join("/");
}
