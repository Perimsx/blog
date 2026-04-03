import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/Card";
import { Tag } from "@/components/Tag";
import { getSortedPosts, getUniqueTags } from "@/lib/blog";
import { createPageMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = await getUniqueTags();
  return tags.map(({ tag }) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const tags = await getUniqueTags();
  const tagInfo = tags.find((t) => t.tag === tag);
  if (!tagInfo) return {};

  return createPageMetadata({
    description: `浏览所有包含标签「${tagInfo.tagName}」的公开文章。`,
    keywords: [tagInfo.tagName, "标签归档", "技术文章"],
    pathname: `/tags/${tagInfo.tag}`,
    title: `标签: ${tagInfo.tagName}`,
  });
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const tags = await getUniqueTags();
  const tagInfo = tags.find((t) => t.tag === tag);

  if (!tagInfo) {
    notFound();
  }

  const allPosts = await getSortedPosts();
  const tagSlug = tag;

  const filteredPosts = allPosts.filter((post) =>
    (post.data.tags ?? []).some((t) => t.toLowerCase() === tagSlug.toLowerCase() || t === tagSlug)
  );

  return (
    <main id="main-content" className="ui-page layout-frame page-shell">
      <h1 className="mt-6 text-[1.75rem] font-semibold tracking-tight sm:mt-8 sm:text-3xl">
        标签: <span className="text-accent">{tagInfo.tagName}</span>
      </h1>
      <p className="mt-2 mb-5 text-sm italic sm:mb-6">共 {filteredPosts.length} 篇文章</p>

      <ul>
        {filteredPosts.map((post) => (
          <Card key={post.slug} post={post} />
        ))}
      </ul>

      <hr className="my-9 border-dashed sm:my-10" />

      <h2 className="mb-4 text-[1.05rem] font-semibold sm:text-lg">所有标签</h2>
      <ul className="flex flex-wrap gap-x-3 gap-y-2 sm:gap-2">
        {tags.map(({ tag: t, tagName: tn }) => (
          <Tag key={t} tag={t} tagName={tn} size="sm" />
        ))}
      </ul>
    </main>
  );
}
