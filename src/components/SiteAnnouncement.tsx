"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const EXIT_MS = 300;
const NOTICE_ID = "CT-SYS-2026-UPGRADE";

const STYLES = `
  .gw-overlay {
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    pointer-events: none;
  }
  .gw-overlay[data-open="true"] { pointer-events: auto; }

  .gw-mask {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.32);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    opacity: 0;
    transition: opacity 0.35s ease;
  }
  .gw-overlay[data-open="true"] .gw-mask { opacity: 1; }

  .gw-doc {
    position: relative;
    width: min(100%, 34rem);
    opacity: 0;
    transform: translateY(18px) scale(0.97);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .gw-overlay[data-open="true"] .gw-doc {
    opacity: 1; transform: translateY(0) scale(1);
  }

  .gw-paper {
    background: #fffdf7;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.5);
    overflow: hidden;
  }

  /* 红头 */
  .gw-head {
    padding: 1.8rem 2rem 0;
    text-align: center;
  }
  .gw-head::after {
    content: ''; display: block;
    height: 2.5px;
    margin: 1rem -2rem 0;
    background: #b91c1c;
  }
  .gw-org {
    margin: 0;
    color: #b91c1c;
    font-family: var(--font-serif), "Noto Serif SC", STSong, SimSun, serif;
    font-size: clamp(1.3rem, 3.5vw, 1.7rem);
    font-weight: 900;
    letter-spacing: 0.15em;
  }

  /* 文号 */
  .gw-ref {
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    padding: 0.55rem 2rem;
    color: rgba(15,23,42,0.45);
    font-size: 0.72rem; font-weight: 600;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }
  .gw-ref-dot { width: 2.5px; height: 2.5px; border-radius: 50%; background: rgba(15,23,42,0.2); }

  /* 正文 */
  .gw-body { padding: 1.1rem 2rem 1.5rem; }

  .gw-title {
    margin: 0 0 0.9rem; text-align: center;
    color: #0f172a;
    font-family: var(--font-serif), "Noto Serif SC", SimSun, serif;
    font-size: 1.08rem; font-weight: 800;
    letter-spacing: 0.03em;
  }

  .gw-para {
    margin: 0 0 0.8rem;
    font-size: 0.82rem; line-height: 1.75;
    color: rgba(30,41,59,0.8);
    text-indent: 2em;
  }

  /* 条目 */
  .gw-items { margin: 0.6rem 0 0; padding: 0; list-style: none; }
  .gw-item {
    display: flex; gap: 0.5rem;
    padding: 0.45rem 0;
    border-bottom: 1px dashed rgba(15,23,42,0.06);
  }
  .gw-item:last-child { border-bottom: none; }
  .gw-item-n {
    flex-shrink: 0;
    color: rgba(15,23,42,0.3);
    font-size: 0.78rem; font-weight: 800;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .gw-item-t {
    margin: 0; font-size: 0.82rem; font-weight: 700; color: #0f172a;
  }
  .gw-item-d {
    margin: 0.1rem 0 0;
    font-size: 0.76rem; line-height: 1.6;
    color: rgba(30,41,59,0.65);
  }
  .gw-item.is-key .gw-item-t { color: #b91c1c; }
  .gw-item.is-key .gw-item-n { color: rgba(185,28,28,0.5); }

  /* 落款 */
  .gw-sign {
    margin-top: 1rem;
    padding-top: 0.8rem;
    border-top: 1px solid rgba(15,23,42,0.06);
    display: flex; align-items: flex-end; justify-content: flex-end;
    position: relative;
  }
  .gw-sign-info { text-align: right; display: flex; flex-direction: column; gap: 0.1rem; }
  .gw-sign-name { color: #0f172a; font-size: 0.82rem; font-weight: 800; }
  .gw-sign-date { color: rgba(15,23,42,0.45); font-size: 0.72rem; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }

  .gw-stamp {
    position: absolute; right: -0.3rem; bottom: -0.8rem;
    width: 4.8rem; height: 4.8rem;
    opacity: 0.15; transform: rotate(-8deg);
    pointer-events: none;
  }

  /* 底栏 */
  .gw-bar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.55rem 2rem;
    border-top: 1px solid rgba(15,23,42,0.06);
    background: rgba(15,23,42,0.015);
    border-radius: 0 0 0.5rem 0.5rem;
  }
  .gw-hint {
    color: rgba(15,23,42,0.35); font-size: 0.68rem;
  }
  .gw-hint kbd {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 1.2rem; padding: 0 0.25rem;
    border: 1px solid rgba(15,23,42,0.1); border-bottom-width: 2px;
    border-radius: 0.25rem; background: white;
    color: rgba(15,23,42,0.55);
    font-size: 0.62rem; font-weight: 700;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .gw-btn {
    padding: 0.45rem 1.2rem;
    border: none; border-radius: 0.3rem;
    background: #0f172a; color: white;
    font-size: 0.76rem; font-weight: 700;
    cursor: pointer; transition: background 0.15s ease;
  }
  .gw-btn:hover { background: #1e293b; }

  /* 移动端 */
  @media (max-width: 640px) {
    .gw-overlay { padding: 0; align-items: flex-end; }
    .gw-doc { width: 100%; transform: translateY(100%); }
    .gw-overlay[data-open="true"] .gw-doc { transform: translateY(0); }
    .gw-paper {
      border-radius: 1rem 1rem 0 0;
      border-bottom: none;
      max-height: 92dvh;
      overflow-y: auto;
      overscroll-behavior: contain;
    }
    .gw-paper::before {
      content: ''; display: block;
      width: 2rem; height: 0.18rem;
      margin: 0.5rem auto 0;
      border-radius: 1rem;
      background: rgba(15,23,42,0.15);
    }
    .gw-head { padding: 1.3rem 1.3rem 0; }
    .gw-head::after { margin-left: -1.3rem; margin-right: -1.3rem; }
    .gw-ref { padding: 0.45rem 1.3rem; }
    .gw-body { padding: 0.9rem 1.3rem 1.2rem; }
    .gw-bar { padding: 0.5rem 1.3rem; border-radius: 0; }
    .gw-hint { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .gw-mask, .gw-doc, .gw-btn { transition: none; }
  }
`;

export const SiteAnnouncement: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const btnRef = useRef<HTMLButtonElement>(null);
  const exitRef = useRef<number>(0);

  useEffect(() => {
    try {
      if (localStorage.getItem("site_notice_dismissed") !== NOTICE_ID) setDismissed(false);
    } catch { setDismissed(false); }
  }, []);

  const dismiss = useCallback(() => {
    setOpen(false);
    try { localStorage.setItem("site_notice_dismissed", NOTICE_ID); } catch {}
    exitRef.current = window.setTimeout(() => { setMounted(false); setDismissed(true); }, EXIT_MS);
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const t = window.setTimeout(() => { setMounted(true); requestAnimationFrame(() => setOpen(true)); }, 500);
    return () => clearTimeout(t);
  }, [dismissed]);

  useEffect(() => {
    if (!mounted) return;
    const p = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = p; };
  }, [mounted]);

  useEffect(() => { if (open) btnRef.current?.focus(); }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [dismiss, mounted]);

  if (dismissed || !mounted) return null;

  return (
    <>
      <style>{STYLES}</style>
      <div className="gw-overlay" data-open={open}>
        <div className="gw-mask" onClick={dismiss} aria-hidden="true" />
        <article className="gw-doc" role="dialog" aria-modal="true" aria-label="系统公告">
          <div className="gw-paper">
            <div className="gw-head">
              <h1 className="gw-org">Cotovo 站点通知</h1>
            </div>
            <div className="gw-ref">
              <span>{NOTICE_ID}</span>
              <span className="gw-ref-dot" aria-hidden="true" />
              <span>2026年04月02日</span>
            </div>

            <div className="gw-body">
              <h2 className="gw-title">关于系统架构升级的通知</h2>
              <p className="gw-para">
                站点主干正在进行阶段性整理，现将当前更新方向通知如下。
              </p>

              <ul className="gw-items">
                <li className="gw-item">
                  <span className="gw-item-n">一、</span>
                  <div>
                    <p className="gw-item-t">全站渲染链路重整</p>
                    <p className="gw-item-d">已迁入 Next.js App Router，构建与静态产出链路统一整理中。</p>
                  </div>
                </li>
                <li className="gw-item">
                  <span className="gw-item-n">二、</span>
                  <div>
                    <p className="gw-item-t">视图编排与阅读交互更新</p>
                    <p className="gw-item-d">目录层级与组件边界重构，阅读路径将逐步对齐新版架构。</p>
                  </div>
                </li>
                <li className="gw-item is-key">
                  <span className="gw-item-n">三、</span>
                  <div>
                    <p className="gw-item-t">评论 KV 存储完善中（重点）</p>
                    <p className="gw-item-d">进入存储补全阶段，处理写入稳定性与扩展兼容。</p>
                  </div>
                </li>
              </ul>

              <div className="gw-sign">
                <div className="gw-sign-info">
                  <span className="gw-sign-name">Perimsx（1722288011）</span>
                  <span className="gw-sign-date">二〇二六年四月二日</span>
                </div>
                <svg className="gw-stamp" viewBox="0 0 100 100" aria-hidden="true">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#b91c1c" strokeWidth="3" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#b91c1c" strokeWidth="1" />
                  <text x="50" y="38" textAnchor="middle" fill="#b91c1c" fontSize="11" fontWeight="800" letterSpacing="0.15em">COTOVO</text>
                  <line x1="22" y1="44" x2="78" y2="44" stroke="#b91c1c" strokeWidth="0.8" />
                  <text x="50" y="58" textAnchor="middle" fill="#b91c1c" fontSize="10" fontWeight="700">站点公告</text>
                  <text x="50" y="72" textAnchor="middle" fill="#b91c1c" fontSize="7" fontWeight="600">2026.04.02</text>
                </svg>
              </div>
            </div>

            <div className="gw-bar">
              <span className="gw-hint">按 <kbd>Esc</kbd> 关闭</span>
              <button ref={btnRef} type="button" className="gw-btn" onClick={dismiss}>知悉</button>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};
