import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArchive } from "@/components/PostArchive";
import { createPageMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = Number.parseInt(slug, 10);

  if (Number.isNaN(page) || page < 2) {
    return {};
  }

  return createPageMetadata({
    description: `第 ${page} 页文章归档，用于继续浏览 Perimsx 的历史文章。`,
    keywords: ["文章归档", `第 ${page} 页`, "历史文章"],
    pathname: `/posts/page/${page}`,
    robots: {
      follow: true,
      index: false,
    },
    title: `文章归档 - 第 ${page} 页`,
  });
}

export default async function PostPaginationPage({ params }: PageProps) {
  const { slug } = await params;
  const page = Number.parseInt(slug, 10);

  if (Number.isNaN(page) || page < 2) {
    notFound();
  }

  return <PostArchive currentPage={page} />;
}
