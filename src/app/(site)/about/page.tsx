import type { Metadata } from "next";
import { getSortedPosts } from "@/lib/blog";
import { SITE } from "@/lib/config";
import { PostHeatmap } from "@/components/PostHeatmap";

export const metadata: Metadata = {
  title: `关于 | ${SITE.title}`,
  description: "Perimsx | 记录成长，分享价值",
};

export default async function AboutPage() {
  const sortedPosts = await getSortedPosts();

  return (
    <main id="main-content" className="ui-page mx-auto w-full max-w-3xl px-4 pb-4 sm:pb-6">
      <section
        id="about"
        className="prose mt-4 mb-6 w-full max-w-none prose-img:border-0 sm:mt-6 sm:mb-8"
        style={{ width: "100%", maxWidth: "none", marginInline: 0, paddingInline: 0, overflowX: "clip" }}
      >
        {/* Hero section */}
        <div className="about-hero">
          <img
            className="about-avatar"
            src="https://img1.tucang.cc/api/image/show/634a56a76f7455df0e2fb5419533e0cf"
            alt="Perimsx 头像"
            loading="eager"
          />
          <div className="about-hero-copy">
            <h2>你好，我是 Perimsx</h2>
            <p>一名即将毕业的信息安全专业学生。这里主要记录我的网络安全学习心得、开发实践经历与技术笔记。</p>
          </div>
        </div>

        {/* Heatmap */}
        <div className="about-block about-block-heatmap">
          <h2>文章热力图</h2>
          <PostHeatmap posts={sortedPosts.map(p => ({ pubDatetime: p.data.pubDatetime }))} />
        </div>

        {/* Recent activity */}
        <div className="about-block">
          <h2>近期活动</h2>
          <ul className="about-list about-timeline">
            <li><strong>2026 年 3 月</strong> · 使用 Astro 和 React 框架重构个人博客主站（<a href="https://chenguitao.com" target="_blank" rel="noopener noreferrer">chenguitao.com</a>）</li>
            <li><strong>2026 年 2 月</strong> · 使用 Nuxt 4 重构个人博客（<a href="https://blog.coet.ink" target="_blank" rel="noopener noreferrer">blog.coet.ink</a>）</li>
          </ul>
        </div>

        {/* Credits */}
        <div className="about-block">
          <h2>鸣谢与开源规划</h2>
          <p>
           本站的开发离不开开源社区的启发，特别感谢
            <span className="about-author-badges">
              <a
                className="about-author-badge"
                href="https://github.com/L33Z22L11"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="about-author-badge__avatar"
                  src="https://github.com/L33Z22L11.png?size=56"
                  alt=""
                  width={28}
                  height={28}
                  loading="lazy"
                  decoding="async"
                />
                <span className="about-author-badge__label">Zhilu</span>
              </a>
              <a
                className="about-author-badge"
                href="https://github.com/lxchapu"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="about-author-badge__avatar"
                  src="https://github.com/lxchapu.png?size=56"
                  alt=""
                  width={28}
                  height={28}
                  loading="lazy"
                  decoding="async"
                />
                <span className="about-author-badge__label">lxchapu</span>
              </a>
            </span>
            两位作者的开源项目与创意设计。
          </p>
          <p className="about-note">
            当前主要参考了
            <a href="https://github.com/L33Z22L11/blog-v3" target="_blank" rel="noopener noreferrer">blog-v3</a>
            与
            <a href="https://github.com/lxchapu/astro-gyoza" target="_blank" rel="noopener noreferrer">astro-gyoza</a>。
          </p>
          <p className="about-note">
            当前博客待细节优化后也即将开源，欢迎关注仓库：<a href="https://github.com/Perimsx/blog" target="_blank" rel="noopener noreferrer">Perimsx/blog</a>。
          </p>
        </div>
      </section>

      <style>{`
        #about .about-hero {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1.3rem;
        }
        #about .about-avatar {
          width: 5.5rem;
          height: 5.5rem;
          margin: 0;
          border-radius: 999px;
          object-fit: cover;
          border: 1px solid color-mix(in srgb, var(--color-border) 85%, transparent);
          box-shadow: 0 1px 0 color-mix(in srgb, var(--color-border) 55%, transparent);
        }
        #about .about-hero-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100%;
          min-width: 0;
        }
        #about .about-hero-copy > h2 {
          margin-top: 0;
          margin-bottom: 0.26rem;
          font-size: clamp(1.06rem, 4.25vw, 1.26rem);
          line-height: 1.22;
          letter-spacing: -0.018em;
        }
        #about .about-hero-copy > p {
          margin: 0;
          max-width: 34rem;
          font-size: 0.9rem;
          line-height: 1.68;
        }
        #about .about-block + .about-block {
          margin-top: 1.2rem;
        }
        #about .about-block > h2 {
          display: flex;
          align-items: center;
          gap: 0.52rem;
          margin: 0 0 0.58rem;
          font-size: clamp(1.02rem, 4.5vw, 1.2rem);
          line-height: 1.32;
          letter-spacing: -0.015em;
        }
        #about .about-block > h2::before {
          content: "";
          flex: none;
          width: 0.42rem;
          height: 0.42rem;
          border-radius: 999px;
          background: color-mix(in srgb, var(--color-accent) 72%, transparent);
        }
        #about .about-block > p,
        #about .about-note {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.68;
        }
        #about .about-list {
          margin: 0;
          padding-left: 0.95rem;
        }
        #about .about-list li {
          margin-block: 0.42rem;
          line-height: 1.65;
        }
        #about .about-author-badges {
          display: inline;
          white-space: normal;
        }
        #about .about-author-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          margin-inline: 0.08rem;
          height: 1.82rem;
          box-sizing: border-box;
          padding: 0 0.46rem 0 0.08rem;
          border-radius: 999px;
          background: color-mix(in srgb, var(--color-foreground) 4%, transparent);
          border: 1px solid color-mix(in srgb, var(--color-border) 78%, transparent);
          color: inherit;
          font-size: 0.96em;
          line-height: 1;
          text-decoration: none;
          vertical-align: middle;
          transition: background-color 0.18s ease, border-color 0.18s ease;
        }
        #about .about-author-badge:hover {
          color: inherit;
          background: color-mix(in srgb, var(--color-accent) 10%, transparent);
          border-color: color-mix(in srgb, var(--color-accent) 28%, var(--color-border));
        }
        #about .about-author-badge__avatar {
          width: 1.52rem;
          height: 1.52rem;
          margin: 0;
          border-radius: 999px;
          object-fit: cover;
          flex: none;
          border: 1px solid color-mix(in srgb, var(--color-border) 75%, transparent);
        }
        #about .about-author-badge__label {
          font-weight: 500;
          line-height: 1;
        }
        #about .about-note {
          margin-top: 0.5rem;
        }
        #about a {
          word-break: break-word;
        }
        #about a:not(.about-author-badge) {
          color: inherit;
          text-decoration: none !important;
          box-shadow: inset 0 -0.14em 0 color-mix(in srgb, var(--color-accent) 16%, transparent);
          transition: color 0.18s ease, box-shadow 0.18s ease;
        }
        #about a:not(.about-author-badge):hover {
          color: var(--color-accent);
          box-shadow: inset 0 -0.22em 0 color-mix(in srgb, var(--color-accent) 22%, transparent);
        }

        @media (min-width: 641px) {
          #about .about-hero {
            grid-template-columns: 5.8rem minmax(0, 1fr);
            gap: 1.05rem;
            margin-bottom: 1.2rem;
          }
          #about .about-avatar {
            width: 5.8rem;
            height: 5.8rem;
          }
          #about .about-hero-copy > h2 {
            margin-bottom: 0.32rem;
            font-size: clamp(1.16rem, 2.2vw, 1.36rem);
          }
          #about .about-hero-copy > p {
            font-size: 0.94rem;
            line-height: 1.72;
          }
          #about .about-block + .about-block {
            margin-top: 1.35rem;
          }
          #about .about-block > h2 {
            gap: 0.56rem;
            margin-bottom: 0.7rem;
            font-size: clamp(1.08rem, 1.8vw, 1.24rem);
          }
          #about .about-list {
            padding-left: 1.05rem;
          }
          #about .about-list li {
            margin-block: 0.5rem;
            line-height: 1.7;
          }
          #about .about-block > p,
          #about .about-note {
            font-size: 0.93rem;
            line-height: 1.72;
          }
        }

        @media (max-width: 640px) {
          #about .about-avatar {
            width: 4.9rem;
            height: 4.9rem;
          }
          #about .about-author-badge {
            gap: 0.28rem;
            margin-inline: 0.08rem;
            height: 1.74rem;
            padding: 0 0.42rem 0 0.08rem;
          }
          #about .about-author-badge__avatar {
            width: 1.42rem;
            height: 1.42rem;
          }
        }
      `}</style>
    </main>
  );
}
