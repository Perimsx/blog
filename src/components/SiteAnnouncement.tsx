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
          top: 24px;
          left: 50%;
          width: max-content;
          max-width: calc(100vw - 32px);
          transform: translate(-50%, -20px) scale(0.95);
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.4s ease;
        }
        .sa-wrap[data-visible="true"] {
          pointer-events: auto;
          opacity: 1;
          transform: translate(-50%, 0) scale(1);
        }

        @media (max-width: 640px) {
          .sa-wrap {
            top: env(safe-area-inset-top, 16px);
            margin-top: 16px;
            width: calc(100vw - 32px);
          }
        }

        .sa-card {
          position: relative;
          overflow: hidden;
          border-radius: 99px;
          padding: 6px 8px 6px 6px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent);
          background: color-mix(in srgb, var(--color-background) 75%, rgba(255,255,255,0.6));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow:
            0 16px 32px -12px rgba(0,0,0,0.1),
            0 4px 12px -4px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,0.5);
          color: var(--color-foreground);
        }
        
        html[data-theme="dark"] .sa-card {
          background: color-mix(in srgb, var(--color-background) 75%, rgba(255,255,255,0.02));
          border-color: rgba(255,255,255,0.08);
          box-shadow:
            0 16px 40px -12px rgba(0,0,0,0.5),
            0 4px 12px -4px rgba(0,0,0,0.2),
            inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .sa-badge {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          border-radius: 99px;
          padding: 4px 10px;
          background: color-mix(in srgb, var(--color-foreground) 4%, transparent);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          white-space: nowrap;
          color: var(--color-foreground);
          opacity: 0.9;
        }
        
        @keyframes pulse-dot {
          0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent) 50%, transparent); }
          70% { box-shadow: 0 0 0 4px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }

        .sa-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--color-accent);
          animation: pulse-dot 2s infinite;
        }

        .sa-body {
          flex: 1;
          min-width: 0;
        }

        .sa-text {
          margin: 0;
          font-size: 0.8rem;
          line-height: 1.4;
          opacity: 0.75;
          font-weight: 450;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sa-text strong {
          color: var(--color-foreground);
          font-weight: 600;
          opacity: 0.9;
        }

        @media (max-width: 640px) {
          .sa-card {
            border-radius: 20px;
            padding: 8px 10px;
          }
          .sa-text {
            white-space: normal;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            font-size: 0.78rem;
          }
          .sa-badge {
            align-self: flex-start;
          }
        }

        .sa-close {
          flex-shrink: 0;
          width: 26px; height: 26px;
          border-radius: 50%;
          border: none;
          background: color-mix(in srgb, var(--color-foreground) 5%, transparent);
          color: var(--color-foreground);
          opacity: 0.5;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
          padding: 0;
        }
        .sa-close:hover {
          opacity: 1;
          background: color-mix(in srgb, var(--color-foreground) 10%, transparent);
          transform: scale(1.08);
        }
        .sa-close:active {
          transform: scale(0.95);
        }
        
        /* 隐藏进度条相关逻辑，因为极简设计不再使用进度条 */
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
          <div className="sa-badge">
             <div className="sa-dot" />
             <span>公告</span>
          </div>
          <div className="sa-body">
            <p className="sa-text">
              底层架构已迁移至 <strong>Next.js SSG</strong>，部分页面仍在调优中。
            </p>
          </div>
          <button className="sa-close" onClick={dismiss} aria-label="关闭">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};
