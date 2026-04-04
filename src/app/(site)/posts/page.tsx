import type { Metadata } from "next";
import { PostArchive } from "@/components/PostArchive";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  description: "按时间浏览 Perimsx 的全部公开文章，涵盖信息安全、Web 开发与技术实践。",
  keywords: ["文章归档", "信息安全文章", "Web 开发文章", "技术实践"],
  pathname: "/posts",
  title: "文章归档",
});

export default async function PostsPage() {
  return <PostArchive currentPage={1} />;
}
