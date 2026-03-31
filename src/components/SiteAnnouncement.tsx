"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "site-announcement-dismissed";
const ANNOUNCEMENT_VERSION = "2026-04-01";
const AUTO_DISMISS_MS = 6000;

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
      <style dangerouslySetInnerHTML={{ __html: `
        .sa-wrap {
          position: fixed;
          z-index: 9999;
          pointer-events: none;
          opacity: 0;
          right: var(--layout-floating-right);
          bottom: calc(var(--layout-floating-bottom) + 48px);
          width: min(380px, calc(100vw - 40px));
          transform: translateY(14px) scale(0.96);
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 0.45s ease;
        }
        .sa-wrap[data-visible="true"] {
          pointer-events: auto;
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        @media (max-width: 640px) {
          .sa-wrap {
            right: 0; bottom: 0; left: 0;
            width: 100%;
            transform: translateY(100%);
            padding: 0 env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0);
          }
          .sa-wrap[data-visible="true"] { transform: translateY(0); }
          .sa-card {
            border-radius: 16px 16px 0 0 !important;
            border-bottom: none !important;
            padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0)) !important;
          }
        }

        .sa-card {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          padding: 16px 18px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid var(--color-border);
          background: var(--color-background);
          box-shadow:
            0 24px 56px -16px rgba(0,0,0,0.14),
            0 8px 20px -8px rgba(0,0,0,0.06);
          color: var(--color-foreground);
          transition: box-shadow 0.3s ease;
        }
        .sa-card:hover {
          box-shadow:
            0 28px 64px -16px rgba(0,0,0,0.18),
            0 10px 24px -8px rgba(0,0,0,0.08),
            inset 0 0.5px 0 color-mix(in srgb, var(--color-foreground) 5%, transparent);
        }
        html[data-theme="dark"] .sa-card {
          border-color: rgba(255,255,255,0.06);
          box-shadow:
            0 24px 56px -16px rgba(0,0,0,0.6),
            0 8px 20px -8px rgba(0,0,0,0.3),
            inset 0 0.5px 0 rgba(255,255,255,0.06);
        }
        html[data-theme="dark"] .sa-card:hover {
          box-shadow:
            0 28px 64px -16px rgba(0,0,0,0.7),
            0 10px 24px -8px rgba(0,0,0,0.35),
            inset 0 0.5px 0 rgba(255,255,255,0.08);
        }

        /* 左侧 accent 色条 */
        .sa-card::before {
          content: "";
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: var(--color-accent);
          opacity: 0.6;
        }

        /* 底部进度条 */
        .sa-card::after {
          content: "";
          position: absolute;
          left: 0; bottom: 0;
          height: 2px;
          width: 100%;
          background: linear-gradient(90deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 40%, transparent));
          opacity: 0.45;
        }
        .sa-wrap[data-visible="true"]:not([data-paused="true"]) .sa-card::after {
          width: 0%;
          transition: width ${AUTO_DISMISS_MS}ms linear;
        }
        /* hover 暂停进度条 */
        .sa-wrap[data-paused="true"] .sa-card::after {
          transition: none;
        }

        .sa-icon {
          flex-shrink: 0;
          margin-top: 2px;
          width: 32px; height: 32px;
          border-radius: 8px;
          background: color-mix(in srgb, var(--color-accent) 10%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-accent);
        }

        .sa-body { flex: 1; min-width: 0; }
        .sa-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          opacity: 0.85;
          margin-bottom: 2px;
        }
        .sa-text {
          margin: 0;
          font-size: 0.78rem;
          line-height: 1.55;
          opacity: 0.55;
        }
        .sa-text strong {
          color: var(--color-foreground);
          font-weight: 600;
          opacity: 0.8;
        }

        .sa-close {
          flex-shrink: 0;
          width: 24px; height: 24px;
          border-radius: 50%;
          border: none;
          background: color-mix(in srgb, var(--color-foreground) 5%, transparent);
          color: var(--color-foreground);
          opacity: 0.25;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s, background 0.2s, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
          padding: 0;
          margin: 2px -4px 0 0;
        }
        .sa-close:hover {
          opacity: 0.6;
          background: color-mix(in srgb, var(--color-foreground) 10%, transparent);
          transform: scale(1.08);
        }
        .sa-close:active {
          transform: scale(0.95);
        }
      `}} />

      <div
        className="sa-wrap"
        data-visible={visible}
        data-paused={paused}
        role="status"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <div className="sa-card">
          <span className="sa-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
          </span>
          <div className="sa-body">
            <span className="sa-label">站点公告</span>
            <p className="sa-text">
              底层架构已迁移至 <strong>Next.js SSG</strong>，部分页面仍在调优中，如遇异常敬请包涵。
            </p>
          </div>
          <button className="sa-close" onClick={dismiss} aria-label="关闭">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};
