import type { Metadata } from "next";
import { getUniqueTags } from "@/lib/blog";
import { SITE } from "@/lib/config";
import { Tag } from "@/components/Tag";

export const metadata: Metadata = {
  title: "标签",
  description: "按标签浏览所有博客文章",
};

export default async function TagsPage() {
  const tags = await getUniqueTags();

  return (
    <main id="main-content" className="ui-page tags-page mx-auto w-full max-w-3xl px-4 pb-10 sm:pb-12">
      <h1 className="mt-6 text-[1.75rem] font-semibold tracking-tight sm:mt-8 sm:text-3xl">标签</h1>
      <p className="mt-2 mb-5 italic sm:mb-6">共 {tags.length} 个标签</p>
      <ul className="tags-list flex flex-wrap gap-x-4 gap-y-3 sm:gap-x-6 sm:gap-y-4">
        {tags.map(({ tag, tagName }) => (
          <Tag key={tag} tag={tag} tagName={tagName} size="lg" />
        ))}
      </ul>

      <style>{`
        @media (max-width: 640px) {
          .tags-page .tags-list {
            align-items: baseline;
          }
        }
      `}</style>
    </main>
  );
}
