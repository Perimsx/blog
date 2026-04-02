"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const ENTRY_DELAY_MS = 420;
const EXIT_ANIMATION_MS = 220;

const NOTICE_ID = "CT-SYS-2026-UPGRADE";
const NOTICE_STATUS = "发布实施";
const NOTICE_DATE = "2026.04.02";

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
    z-index: 220;
    display: flex;
    align-items: center;
    justify-content: center;
    padding:
      max(1.25rem, calc(env(safe-area-inset-top, 0px) + 1.25rem))
      max(1rem, calc(env(safe-area-inset-right, 0px) + 1rem))
      max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 1.25rem))
      max(1rem, calc(env(safe-area-inset-left, 0px) + 1rem));
  }

  .notice-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(245, 245, 244, 0.88);
    opacity: 0;
    transition: opacity 0.18s ease;
  }

  .notice-root[data-state="open"] .notice-backdrop {
    opacity: 1;
  }

  .notice-shell {
    position: relative;
    width: min(100%, 42rem);
    opacity: 0;
    transform: translateY(18px);
    transition:
      opacity 0.18s ease,
      transform 0.28s ease;
  }

  .notice-root[data-state="open"] .notice-shell {
    opacity: 1;
    transform: translateY(0);
  }

  .notice-paper {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(17, 24, 39, 0.14);
    border-radius: 0.4rem;
    background: #fffdfa;
    box-shadow:
      0 18px 30px -24px rgba(15, 23, 42, 0.22),
      0 2px 10px rgba(15, 23, 42, 0.04);
  }

  .notice-close {
    position: absolute;
    top: 1.3rem;
    right: 1.35rem;
    z-index: 2;
    width: auto;
    height: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    border: 0;
    background: transparent;
    color: rgba(15, 23, 42, 0.46);
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition:
      transform 0.18s ease,
      color 0.18s ease;
  }

  .notice-close:hover {
    transform: translateX(1px);
    color: rgba(15, 23, 42, 0.82);
  }

  .notice-content {
    position: relative;
    z-index: 1;
    padding: 3.35rem 2.9rem 2.35rem;
  }

  .notice-eyebrow {
    margin: 0;
    text-align: center;
    color: rgba(15, 23, 42, 0.42);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .notice-title {
    margin: 0.9rem 0 1.15rem;
    text-align: center;
    color: #111827;
    font-family: var(--font-serif);
    font-size: clamp(1.95rem, 3vw, 2.6rem);
    font-weight: 700;
    line-height: 1.18;
    letter-spacing: -0.04em;
    text-wrap: balance;
  }

  .notice-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    color: rgba(15, 23, 42, 0.46);
    font-size: 0.74rem;
    font-weight: 700;
    line-height: 1.5;
  }

  .notice-meta span {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .notice-meta strong {
    color: rgba(15, 23, 42, 0.68);
    font-weight: 800;
  }

  .notice-rule {
    margin: 0.85rem 0 1.45rem;
    height: 1px;
    background: rgba(17, 24, 39, 0.82);
  }

  .notice-body {
    color: rgba(17, 24, 39, 0.9);
  }

  .notice-salutation {
    margin: 0;
    font-size: 0.98rem;
    font-weight: 800;
    line-height: 1.9;
  }

  .notice-lead {
    margin: 0.3rem 0 0;
    font-size: 0.98rem;
    line-height: 1.98;
    color: rgba(31, 41, 55, 0.86);
  }

  .notice-lead strong {
    color: #0f172a;
    font-weight: 800;
  }

  .notice-list {
    margin-top: 1.55rem;
  }

  .notice-item + .notice-item {
    margin-top: 1.1rem;
  }

  .notice-item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.8rem;
    align-items: start;
  }

  .notice-marker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 0.9rem;
    height: 0.9rem;
    margin-top: 0.28rem;
    color: #111827;
    font-size: 0.78rem;
    line-height: 1;
  }

  .notice-item.is-accent .notice-marker {
    color: #0369a1;
  }

  .notice-item-main {
    padding-left: 0.95rem;
    border-left: 1px solid rgba(15, 23, 42, 0.14);
  }

  .notice-item.is-accent .notice-item-main {
    border-left-color: rgba(3, 105, 161, 0.42);
  }

  .notice-item-title {
    margin: 0;
    color: #111827;
    font-size: 1rem;
    font-weight: 800;
    line-height: 1.68;
  }

  .notice-item.is-accent .notice-item-title {
    color: #0369a1;
  }

  .notice-item-desc {
    margin: 0.2rem 0 0;
    color: rgba(31, 41, 55, 0.82);
    font-size: 0.93rem;
    line-height: 1.88;
  }

  .notice-note {
    margin-top: 1.55rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
    color: rgba(15, 23, 42, 0.52);
    font-size: 0.82rem;
    line-height: 1.8;
  }

  .notice-note kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    padding: 0.05rem 0.4rem;
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-bottom-width: 2px;
    border-radius: 0.45rem;
    background: rgba(255, 255, 255, 0.92);
    color: rgba(15, 23, 42, 0.7);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .notice-footer {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1.55rem;
    padding-top: 1.3rem;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
  }

  .notice-sign {
    display: flex;
    flex-direction: column;
    gap: 0.34rem;
  }

  .notice-sign strong {
    color: #111827;
    font-size: 0.94rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    line-height: 1.65;
  }

  .notice-sign span {
    color: rgba(15, 23, 42, 0.46);
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    line-height: 1.6;
    text-transform: uppercase;
  }

  .notice-action {
    min-width: 8.8rem;
    padding: 0.88rem 1.2rem;
    border: 1px solid rgba(15, 23, 42, 0.78);
    border-radius: 0;
    background: transparent;
    color: #111827;
    font-size: 0.84rem;
    font-weight: 800;
    letter-spacing: 0.03em;
    transition:
      transform 0.18s ease,
      background-color 0.18s ease,
      color 0.18s ease;
  }

  .notice-action:hover {
    transform: translateX(1px);
    background: #111827;
    color: white;
  }

  @media (max-width: 720px) {
    .notice-content {
      padding: 3.1rem 1.2rem 1.45rem;
    }

    .notice-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.28rem;
    }

    .notice-rule {
      margin-bottom: 1.15rem;
    }

    .notice-footer {
      flex-direction: column;
      align-items: stretch;
    }

    .notice-action {
      width: 100%;
    }
  }

  @media (max-width: 520px) {
    .notice-root {
      align-items: stretch;
      padding: 0;
    }

    .notice-shell {
      width: 100%;
    }

    .notice-paper {
      min-height: 100dvh;
      border-radius: 0;
      border-left: 0;
      border-right: 0;
    }

    .notice-close {
      top: max(0.9rem, calc(env(safe-area-inset-top, 0px) + 0.4rem));
      right: 0.85rem;
    }

    .notice-content {
      padding:
        max(3.4rem, calc(env(safe-area-inset-top, 0px) + 2.5rem))
        1rem
        max(1.35rem, calc(env(safe-area-inset-bottom, 0px) + 1rem));
    }

    .notice-title {
      font-size: 1.8rem;
    }

    .notice-lead,
    .notice-item-desc {
      font-size: 0.92rem;
      line-height: 1.82;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .notice-backdrop,
    .notice-shell,
    .notice-close,
    .notice-action {
      transition: none;
    }
  }
`;

export const SiteAnnouncement: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openTimerRef = useRef<number>(0);
  const exitTimerRef = useRef<number>(0);

  const dismiss = useCallback(() => {
    clearTimeout(openTimerRef.current);
    clearTimeout(exitTimerRef.current);
    setIsOpen(false);

    exitTimerRef.current = window.setTimeout(() => {
      setIsMounted(false);
    }, EXIT_ANIMATION_MS);
  }, []);

  useEffect(() => {
    openTimerRef.current = window.setTimeout(() => {
      setIsMounted(true);
      window.requestAnimationFrame(() => setIsOpen(true));
    }, ENTRY_DELAY_MS);

    return () => {
      clearTimeout(openTimerRef.current);
      clearTimeout(exitTimerRef.current);
    };
  }, []);

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

  if (!isMounted) return null;

  return (
    <>
      <style>{ANNOUNCEMENT_STYLES}</style>

      <div className="notice-root" data-state={isOpen ? "open" : "closed"}>
        <div className="notice-backdrop" onClick={() => dismiss()} aria-hidden="true" />

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
              onClick={() => dismiss()}
              aria-label="关闭公告"
            >
              <span>Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
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
                      className={`notice-item${item.tone === "accent" ? " is-accent" : ""}`}
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

                <div className="notice-note">
                  当前页面刷新后会再次提示一次；按 <kbd>Esc</kbd> 或下方按钮可关闭本次公告。
                </div>
              </div>

              <footer className="notice-footer">
                <div className="notice-sign">
                  <strong>文献编号：{NOTICE_ID}</strong>
                  <span>
                    执行状态：{NOTICE_STATUS} | {NOTICE_DATE}
                  </span>
                </div>

                <button type="button" className="notice-action" onClick={() => dismiss()}>
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
