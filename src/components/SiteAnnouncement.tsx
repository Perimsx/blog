"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const ENTRY_DELAY_MS = 600;
const EXIT_ANIMATION_MS = 300;

const NOTICE_ID = "CT-SYS-2026-UPGRADE";
const NOTICE_STATUS = "发布实施";
const NOTICE_DATE = "2026.04.02";
const NOTICE_SIGNATURE = "Perimsx（1722288011）";

const UPDATE_ITEMS = [
  {
    tone: "default",
    title: "全站渲染链路重整",
    desc: "站点主干已迁入 Next.js App Router，页面构建、数据获取与静态产出链路正在统一整理，以降低冗余负担并稳定首屏交付。",
  },
  {
    tone: "default",
    title: "视图编排与阅读交互更新",
    desc: "文章页目录层级、段落组织与局部交互正在按新的组件边界重构，后续阅读路径与页面细节反馈会逐步对齐新版架构。",
  },
  {
    tone: "accent",
    title: "评论 KV 存储完善中",
    desc: "评论链路当前进入 KV 存储补全阶段，重点处理写入稳定性、字段整理与后续扩展兼容，相关能力将按阶段逐步接入。",
  },
] as const;

const ANNOUNCEMENT_STYLES = `
  .notice-root {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: max(1.5rem, calc(env(safe-area-inset-top, 0px) + 1.5rem)) 1.25rem;
    pointer-events: none;
  }

  .notice-root[data-state="open"] {
    pointer-events: auto;
  }

  .notice-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    opacity: 0;
    transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .notice-root[data-state="open"] .notice-backdrop {
    opacity: 1;
  }

  .notice-shell {
    position: relative;
    width: min(100%, 46rem);
    max-height: 100%;
    opacity: 0;
    transform: translateY(20px) scale(0.96);
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .notice-root[data-state="open"] .notice-shell {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .notice-paper {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    max-height: min(90dvh, 52rem);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(20px) saturate(1.2);
    -webkit-backdrop-filter: blur(20px) saturate(1.2);
    box-shadow:
      0 24px 48px -12px rgba(15, 23, 42, 0.15),
      0 4px 24px -2px rgba(15, 23, 42, 0.05),
      inset 0 1px 1px rgba(255, 255, 255, 0.6);
  }

  .notice-close {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    z-index: 10;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.2rem;
    height: 2.2rem;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(15, 23, 42, 0.04);
    color: rgba(15, 23, 42, 0.5);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .notice-close:hover {
    background: rgba(15, 23, 42, 0.08);
    color: rgba(15, 23, 42, 0.9);
    transform: scale(1.05);
  }

  .notice-close:active {
    transform: scale(0.95);
  }

  .notice-content {
    position: relative;
    z-index: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 3rem 3rem 2.5rem;
  }

  .notice-eyebrow {
    margin: 0;
    color: rgba(15, 23, 42, 0.45);
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .notice-title {
    margin: 0.5rem 0 1rem;
    color: #0f172a;
    font-family: var(--font-serif), ui-serif, Georgia, serif;
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }

  .notice-meta {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    color: rgba(15, 23, 42, 0.55);
    font-size: 0.8rem;
    font-weight: 500;
  }

  .notice-meta strong {
    color: rgba(15, 23, 42, 0.85);
    font-weight: 700;
  }

  .notice-rule {
    margin: 1.5rem 0;
    height: 1px;
    background: linear-gradient(to right, rgba(15, 23, 42, 0.1), transparent);
  }

  .notice-body {
    color: rgba(30, 41, 59, 0.85);
  }

  .notice-salutation {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    font-weight: 800;
    color: #0f172a;
  }

  .notice-lead {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.8;
  }

  .notice-lead strong {
    color: #0f172a;
    font-weight: 800;
    background: rgba(15, 23, 42, 0.05);
    padding: 0.1rem 0.3rem;
    border-radius: 0.25rem;
  }

  .notice-list {
    margin-top: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .notice-item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 1rem;
    align-items: start;
    padding: 1.25rem;
    border-radius: 0.75rem;
    background: rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.6);
    transition: transform 0.2s ease, background 0.2s ease;
  }

  .notice-item:hover {
    background: rgba(255, 255, 255, 0.7);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
  }

  .notice-marker {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: rgba(15, 23, 42, 0.06);
    color: #0f172a;
    font-size: 0.7rem;
    margin-top: 0.1rem;
  }

  .notice-item.is-accent .notice-marker {
    background: rgba(3, 105, 161, 0.1);
    color: #0369a1;
  }

  .notice-item-title {
    margin: 0 0 0.25rem;
    color: #0f172a;
    font-size: 0.95rem;
    font-weight: 800;
  }

  .notice-item.is-accent .notice-item-title {
    color: #0369a1;
  }

  .notice-item-desc {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.7;
    color: rgba(30, 41, 59, 0.75);
  }

  .notice-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
  }

  .notice-sign {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .notice-sign strong {
    color: #0f172a;
    font-size: 0.9rem;
    font-weight: 800;
  }

  .notice-sign span {
    color: rgba(15, 23, 42, 0.5);
    font-size: 0.75rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  .notice-action {
    padding: 0.75rem 1.6rem;
    border: none;
    border-radius: 2rem;
    background: #0f172a;
    color: white;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
  }

  .notice-action:hover {
    background: #1e293b;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
  }

  .notice-action:active {
    transform: translateY(0);
  }

  @media (max-width: 720px) {
    .notice-content { padding: 2rem 1.5rem; }
    .notice-meta { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
    .notice-footer { flex-direction: column; align-items: stretch; gap: 1.5rem; }
  }

  @media (max-width: 520px) {
    .notice-root { padding: 0; align-items: flex-end; }
    .notice-shell { width: 100%; transform: translateY(100%); }
    .notice-paper { max-height: 85dvh; border-radius: 1.5rem 1.5rem 0 0; border-bottom: none; border-left: none; border-right: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .notice-backdrop, .notice-shell, .notice-close, .notice-action, .notice-item { transition: none; }
  }
`;

export const SiteAnnouncement: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // 默认视为已隐藏，以防 SSR 时闪烁，直至挂载后读取出未读状态
  const [isDismissed, setIsDismissed] = useState(true);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openTimerRef = useRef<number>(0);
  const exitTimerRef = useRef<number>(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("site_notice_dismissed");
      if (stored !== NOTICE_ID) {
        setIsDismissed(false);
      }
    } catch (e) {
      setIsDismissed(false); // 降级处理
    }
  }, []);

  const dismiss = useCallback(() => {
    setIsOpen(false);
    
    // 写入本地防打扰状态
    try {
      localStorage.setItem("site_notice_dismissed", NOTICE_ID);
    } catch (e) {
      // ignore
    }

    exitTimerRef.current = window.setTimeout(() => {
      setIsMounted(false);
      setIsDismissed(true); // 确保从 DOM 中移除
    }, EXIT_ANIMATION_MS);
  }, []);

  useEffect(() => {
    if (isDismissed) return;

    openTimerRef.current = window.setTimeout(() => {
      setIsMounted(true);
      window.requestAnimationFrame(() => setIsOpen(true));
    }, ENTRY_DELAY_MS);

    return () => clearTimeout(openTimerRef.current);
  }, [isDismissed]);

  useEffect(() => {
    if (!isMounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isMounted) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dismiss, isMounted]);

  if (isDismissed || !isMounted) return null;

  return (
    <>
      <style>{ANNOUNCEMENT_STYLES}</style>

      <div className="notice-root" data-state={isOpen ? "open" : "closed"}>
        <div className="notice-backdrop" onClick={dismiss} aria-hidden="true" />

        <section
          className="notice-shell"
          role="dialog"
          aria-modal="true"
          aria-labelledby="site-announcement-title"
          aria-describedby="site-announcement-lead"
        >
          <div className="notice-paper">
            <button
              ref={closeButtonRef}
              type="button"
              className="notice-close"
              onClick={dismiss}
              aria-label="关闭公告"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            <div className="notice-content">
              <p className="notice-eyebrow">System Bulletin</p>
              <h2 id="site-announcement-title" className="notice-title">
                系统架构升级公告
              </h2>

              <div className="notice-meta">
                <span>
                  <strong>文献编号：</strong>
                  {NOTICE_ID}
                </span>
                <span>
                  <strong>执行状态：</strong>
                  {NOTICE_STATUS}
                </span>
              </div>

              <div className="notice-rule" aria-hidden="true" />

              <div className="notice-body">
                <p className="notice-salutation">致各位访客与同行：</p>
                <p id="site-announcement-lead" className="notice-lead">
                  鉴于站点主干正在进行阶段性的系统整理，本次公告用于说明当前更新方向。现阶段的重点事项为
                  <strong> 评论 KV 存储完善中 </strong>
                  ，其余页面架构与阅读交互也在按既定方案持续调整，概要如下：
                </p>

                <div className="notice-list">
                  {UPDATE_ITEMS.map((item) => (
                    <article
                      key={item.title}
                      className={\`notice-item\${item.tone === "accent" ? " is-accent" : ""}\`}
                    >
                      <div className="notice-marker" aria-hidden="true">
                        ■
                      </div>
                      <div className="notice-item-main">
                        <h3 className="notice-item-title">{item.title}</h3>
                        <p className="notice-item-desc">{item.desc}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <footer className="notice-footer">
                <div className="notice-sign">
                  <strong>{NOTICE_SIGNATURE}</strong>
                  <span>{NOTICE_DATE}</span>
                </div>

                <button type="button" className="notice-action" onClick={dismiss}>
                  知悉并进入
                </button>
              </footer>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
