import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/Card";
import { Pagination } from "@/components/Pagination";
import { getSortedPosts } from "@/lib/blog";
import { getPostsByGroupCondition } from "@/lib/getPostsByGroupCondition";

export const metadata: Metadata = {
  title: "文章归档",
  description: "按时间浏览 Perimsx 的全部公开文章，涵盖信息安全、Web 开发与技术实践。",
};

const MONTHS = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
];

const POSTS_PER_PAGE = 10;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPaginationPage({ params }: PageProps) {
  const { slug } = await params;
  const page = Number.parseInt(slug, 10);

  if (Number.isNaN(page) || page < 2) {
    notFound();
  }

  const sortedPosts = await getSortedPosts();
  const totalPosts = sortedPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));

  if (page > totalPages) {
    notFound();
  }

  const start = (page - 1) * POSTS_PER_PAGE;
  const pagePosts = sortedPosts.slice(start, start + POSTS_PER_PAGE);

  const byYear = getPostsByGroupCondition(pagePosts, (post) => {
    return new Date(post.data.pubDatetime).getFullYear();
  });

  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <main id="main-content" className="ui-page layout-frame page-shell">
      <h1 className="mt-6 text-[1.75rem] font-semibold tracking-tight sm:mt-8 sm:text-3xl">
        所有文章
      </h1>
      <p className="mt-2 mb-5 text-sm italic sm:mb-6">按年月浏览全部博客文章</p>

      {years.map((year) => (
        <div key={year} className="mb-8 sm:mb-10">
          <h2 className="mb-5 border-b border-accent pb-2 text-[1.35rem] font-bold sm:mb-6 sm:text-2xl">
            {year}
            <sup className="ml-1 text-sm">{byYear[year].length}</sup>
          </h2>

          {Object.entries(
            getPostsByGroupCondition(byYear[year], (post) => {
              return new Date(post.data.pubDatetime).getMonth() + 1;
            })
          )
            .sort(([monthA], [monthB]) => Number(monthB) - Number(monthA))
            .map(([month, monthPosts]) => (
              <div key={month} className="mt-7 sm:mt-9">
                <h3 className="mb-3 text-[1.08rem] font-bold sm:mb-4 sm:text-xl">
                  {MONTHS[Number(month) - 1]}
                  <sup className="ml-1 text-sm">{monthPosts.length}</sup>
                </h3>
                <ul>
                  {monthPosts.map((post) => (
                    <Card key={post.slug} post={post} />
                  ))}
                </ul>
              </div>
            ))}
        </div>
      ))}

      <Pagination currentPage={page} totalPages={totalPages} baseUrl="/posts/page" />
    </main>
  );
}
