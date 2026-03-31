import type { Metadata } from "next";
import { getSortedPosts } from "@/lib/blog";
import { SITE } from "@/lib/config";
import { Card } from "@/components/Card";

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

function getPostsByGroupCondition<T>(
  posts: T[],
  groupFunction: (item: T, index?: number) => string | number | symbol
): Record<string | number | symbol, T[]> {
  const result: Record<string | number | symbol, T[]> = {};
  for (let i = 0; i < posts.length; i++) {
    const item = posts[i];
    const groupKey = groupFunction(item, i);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
  }
  return result;
}

export default async function PostsPage() {
  const sortedPosts = await getSortedPosts();

  const byYear = getPostsByGroupCondition(sortedPosts, (post) => {
    return new Date(post.data.pubDatetime).getFullYear();
  });

  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <main id="main-content" className="ui-page mx-auto w-full max-w-3xl px-4 pb-6 sm:pb-4">
      <h1 className="mt-6 text-[1.75rem] font-semibold tracking-tight sm:mt-8 sm:text-3xl">所有文章</h1>
      <p className="mt-2 mb-5 text-sm italic sm:mb-6">按年月浏览全部博客文章</p>

      {years.map((year) => (
        <div key={year} className="mb-7 sm:mb-8">
          <h2 className="mb-5 border-b border-accent pb-2 text-[1.35rem] font-bold sm:mb-6 sm:text-2xl">
            {year}
            <sup className="text-sm ml-1">{byYear[year].length}</sup>
          </h2>

          {Object.entries(
            getPostsByGroupCondition(byYear[year], (post) => {
              return new Date(post.data.pubDatetime).getMonth() + 1;
            })
          )
            .sort(([monthA], [monthB]) => Number(monthB) - Number(monthA))
            .map(([month, monthPosts]) => (
              <div key={month} className="mt-6 sm:mt-8">
                <h3 className="mb-3 text-[1.08rem] font-bold sm:mb-4 sm:text-xl">
                  {MONTHS[Number(month) - 1]}
                  <sup className="text-sm ml-1">{monthPosts.length}</sup>
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
    </main>
  );
}
