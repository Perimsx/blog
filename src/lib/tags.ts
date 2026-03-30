import { getSortedPosts } from "./blog";
import { slugifyStr } from "./slugify";

export async function getUniqueTags() {
  const posts = await getSortedPosts();
  const tags = posts
    .flatMap((post) => post.data.tags ?? [])
    .map((tag) => ({ tag: slugifyStr(tag), tagName: tag }))
    .filter((value, index, self) => self.findIndex((tag) => tag.tag === value.tag) === index)
    .sort((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));
  return tags;
}
