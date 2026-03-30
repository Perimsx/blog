import type { Metadata } from "next";
import Link from "next/link";
import { getSortedPosts } from "@/lib/blog";
import { SITE } from "@/lib/config";
import { SOCIALS } from "@/lib/config";
import { Card } from "@/components/Card";
import { Hr } from "@/components/Hr";
import { IconRss, IconArrowRight } from "@/components/icons";
import { Socials } from "@/components/Socials";
import { LinkButton } from "@/components/LinkButton";

export const metadata: Metadata = {
  title: "序栈 | Perimsx",
  description: "记录成长，分享价值。信息安全专业学生，Web 开发爱好者。",
};

export default async function HomePage() {
  const sortedPosts = await getSortedPosts();
  const posts2025AndLater = sortedPosts.filter((post) => {
    const year = new Date(post.data.pubDatetime).getFullYear();
    return year >= 2025;
  });
  const featuredPosts = posts2025AndLater.filter((post) => post.data.featured);
  const recentPosts = posts2025AndLater.filter((post) => !post.data.featured);

  return (
    <main id="main-content" data-layout="index" className="ui-page">
      <section id="hero" className="pt-2 pb-1 sm:pt-5 sm:pb-2">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-3.5">
          <Link href="/about" className="block group">
            <img
              src="https://img1.tucang.cc/api/image/show/634a56a76f7455df0e2fb5419533e0cf"
              alt="Perimsx"
              className="h-[5.5rem] w-[5.5rem] rounded-full object-cover flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl sm:h-[9rem] sm:w-[9rem]"
            />
          </Link>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="font-logo my-1 inline-block text-[1.15rem] sm:my-2.5 sm:text-3xl">
                Hi, I&apos;m Perimsx.
              </h1>
              <a
                href="/rss.xml"
                target="_blank"
                className="inline-block"
                aria-label="rss feed"
                title="RSS Feed"
              >
                <IconRss width={20} height={20} className="scale-125 stroke-accent stroke-3" />
                <span className="sr-only">RSS Feed</span>
              </a>
            </div>
            <p className="text-[0.94rem] leading-7 sm:text-base">
              记录成长，分享价值。<br />
              信息安全专业学生，Web 开发爱好者。
            </p>
            {SOCIALS.filter((social) => social.active).length > 0 && (
              <div className="mt-2 flex flex-row items-center justify-center sm:mt-2.5 sm:justify-start">
                <Socials />
              </div>
            )}
          </div>
        </div>
      </section>

      <Hr />

      {featuredPosts.length > 0 && (
        <>
          <section id="featured" className="pt-4 pb-2 sm:pt-4 sm:pb-2">
            <h2 className="text-[1.35rem] font-semibold tracking-wide sm:text-2xl">精选文章</h2>
            <ul className="[&>li:first-child]:mt-3 sm:[&>li:first-child]:mt-4 [&>li:last-child]:mb-1">
              {featuredPosts.map((post) => (
                <Card key={post.slug} post={post} variant="h3" />
              ))}
            </ul>
          </section>
          {recentPosts.length > 0 && <Hr />}
        </>
      )}

      {recentPosts.length > 0 && (
        <section id="recent-posts" className="pt-2 pb-0 sm:pt-3 sm:pb-1">
          <ul className="[&>li:first-child]:mt-3 sm:[&>li:first-child]:mt-4 [&>li:last-child]:mb-1">
            {recentPosts.slice(0, SITE.postPerIndex).map((post) => (
              <Card key={post.slug} post={post} variant="h3" />
            ))}
          </ul>
        </section>
      )}

      <div className="mt-1 mb-4 text-center sm:mt-2 sm:mb-5">
        <LinkButton href="/posts">
          所有文章
          <IconArrowRight className="inline-block" />
        </LinkButton>
      </div>
    </main>
  );
}
