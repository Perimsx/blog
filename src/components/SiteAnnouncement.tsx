"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "site-announcement-dismissed";
const ANNOUNCEMENT_VERSION = "2026-04-02-comments-kv-v2";
const AUTO_DISMISS_MS = 8000;
const ANNOUNCEMENT_STYLES = `
  .sa-wrap {
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    opacity: 0;
    top: clamp(4.75rem, 7vw, 5.6rem);
    right: max(0.9rem, calc(env(safe-area-inset-right, 0px) + 0.9rem));
    width: min(calc(100vw - 24px), 22.5rem);
    transform: translateY(-14px) scale(0.98);
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                opacity 0.4s ease;
  }
  .sa-wrap[data-visible="true"] {
    pointer-events: auto;
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  @media (max-width: 640px) {
    .sa-wrap {
      top: calc(env(safe-area-inset-top, 0px) + 0.75rem);
      left: 12px;
      right: 12px;
      width: auto;
    }
  }

  .sa-card {
    position: relative;
    overflow: hidden;
    border-radius: 0.95rem;
    padding: 0.72rem 0.78rem;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.72rem;
    border: 1px solid color-mix(in srgb, var(--color-accent) 12%, var(--color-border));
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--color-accent) 3%, white), transparent 70%),
      color-mix(in srgb, var(--color-background) 92%, rgba(255,255,255,0.7));
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow:
      0 14px 30px -22px rgba(15,23,42,0.2),
      0 6px 14px -10px rgba(15,23,42,0.1),
      inset 0 1px 0 rgba(255,255,255,0.5);
    color: var(--color-foreground);
  }

  html[data-theme="dark"] .sa-card {
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--color-accent) 8%, #0f172a), transparent 74%),
      color-mix(in srgb, var(--color-background) 92%, rgba(255,255,255,0.02));
    border-color: color-mix(in srgb, var(--color-accent) 14%, rgba(255,255,255,0.08));
    box-shadow:
      0 16px 34px -22px rgba(0,0,0,0.46),
      0 6px 14px -10px rgba(0,0,0,0.24),
      inset 0 1px 0 rgba(255,255,255,0.05);
  }

  .sa-mark {
    width: 2rem;
    height: 2rem;
    border-radius: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--color-accent) 8%, transparent);
    color: var(--color-accent);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.24);
  }

  html[data-theme="dark"] .sa-mark {
    background: color-mix(in srgb, var(--color-accent) 13%, transparent);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
  }

  .sa-copy {
    min-width: 0;
  }

  .sa-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.38rem;
    margin: 0 0 0.2rem;
    color: color-mix(in srgb, var(--color-foreground) 56%, transparent);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .sa-eyebrow::before {
    content: "";
    width: 0.32rem;
    height: 0.32rem;
    border-radius: 999px;
    background: var(--color-accent);
  }

  .sa-title {
    margin: 0;
    font-size: 0.88rem;
    line-height: 1.35;
    font-weight: 620;
    color: var(--color-foreground);
  }

  .sa-desc {
    margin: 0.22rem 0 0;
    font-size: 0.74rem;
    line-height: 1.48;
    color: color-mix(in srgb, var(--color-foreground) 68%, transparent);
  }

  .sa-status {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0.4rem;
    border-radius: 999px;
    padding: 0.18rem 0.48rem;
    background: color-mix(in srgb, var(--color-accent) 7%, transparent);
    color: color-mix(in srgb, var(--color-foreground) 62%, transparent);
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .sa-status::before {
    content: "";
    width: 0.32rem;
    height: 0.32rem;
    border-radius: 999px;
    background: var(--color-accent);
  }

  @media (max-width: 640px) {
    .sa-card {
      gap: 0.62rem;
      border-radius: 0.9rem;
      padding: 0.7rem 0.72rem;
    }
    .sa-mark {
      width: 1.9rem;
      height: 1.9rem;
    }
    .sa-title {
      font-size: 0.84rem;
    }
    .sa-desc {
      font-size: 0.72rem;
    }
  }

  .sa-close {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: none;
    background: color-mix(in srgb, var(--color-foreground) 4%, transparent);
    color: var(--color-foreground);
    opacity: 0.42;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
    padding: 0;
  }
  .sa-close:hover {
    opacity: 1;
    background: color-mix(in srgb, var(--color-foreground) 8%, transparent);
    transform: scale(1.08);
  }
  .sa-close:active {
    transform: scale(0.95);
  }
`;

export const SiteAnnouncement: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const timers = useRef<number[]>([]);
  const autoRef = useRef<number>(0);
  const elapsedRef = useRef(0);
  const startRef = useRef(0);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  // 自动关闭定时器（可暂停恢复）
  const startAutoClose = useCallback((remaining: number) => {
    startRef.current = Date.now();
    autoRef.current = window.setTimeout(() => {
      setVisible(false);
      localStorage.setItem(STORAGE_KEY, ANNOUNCEMENT_VERSION);
    }, remaining);
  }, []);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === ANNOUNCEMENT_VERSION) return;
    later(() => {
      setVisible(true);
      startAutoClose(AUTO_DISMISS_MS);
    }, 600);
    return () => {
      timers.current.forEach(clearTimeout);
      clearTimeout(autoRef.current);
    };
  }, [later, startAutoClose]);

  // hover 暂停 / 恢复
  const onEnter = useCallback(() => {
    setPaused(true);
    elapsedRef.current += Date.now() - startRef.current;
    clearTimeout(autoRef.current);
  }, []);

  const onLeave = useCallback(() => {
    setPaused(false);
    const remaining = AUTO_DISMISS_MS - elapsedRef.current;
    if (remaining > 0) startAutoClose(remaining);
  }, [startAutoClose]);

  const dismiss = useCallback(() => {
    clearTimeout(autoRef.current);
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, ANNOUNCEMENT_VERSION);
  }, []);

  return (
    <>
      <style>{ANNOUNCEMENT_STYLES}</style>

      <div
        className="sa-wrap"
        data-visible={visible}
        data-paused={paused}
        role="status"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <div className="sa-card">
          <div className="sa-mark" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 7.5h8" />
              <path d="M8 12h8" />
              <path d="M8 16.5h5" />
              <rect x="4.5" y="4.5" width="15" height="15" rx="3" />
            </svg>
          </div>
          <div className="sa-copy">
            <p className="sa-eyebrow">研发公告</p>
            <p className="sa-title">评论系统升级中</p>
            <p className="sa-desc">
              评论功能仍在建设中，<strong>KV 存储方案研发中</strong>
              ，地点展示与数据稳定性会随升级逐步补齐。
            </p>
            <div className="sa-status" aria-hidden="true">
              KV Storage R&amp;D
            </div>
          </div>
          <button type="button" className="sa-close" onClick={dismiss} aria-label="关闭">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
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
        </div>
      </div>
    </>
  );
};
