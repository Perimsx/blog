"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const EXIT_MS = 300;
const NOTICE = {
  id: "CT-SYS-2026-STAGE-20260405B",
  dateLabel: "2026年04月05日",
  signedDateLabel: "二〇二六年四月五日",
  stampDateLabel: "2026.04.05",
  title: "关于站点阶段整理与后续更新的通知",
} as const;

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

  /* 落款区域优化 */
  .gw-sign {
    margin-top: 1.2rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(15,23,42,0.06);
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1.5rem;
  }
  .gw-sign-block {
    position: relative;
    padding: 0.5rem 0.8rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.3s ease;
  }
  .gw-sign-info {
    position: relative;
    z-index: 2;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    pointer-events: none;
  }
  .gw-sign-name { 
    color: #0f172a; 
    font-size: 0.82rem; 
    font-weight: 800; 
    white-space: nowrap;
    letter-spacing: 0.02em;
  }
  .gw-sign-date { 
    color: rgba(15,23,42,0.5); 
    font-size: 0.7rem; 
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; 
    white-space: nowrap; 
    letter-spacing: -0.01em;
  }

  .gw-stamp {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 5.2rem; height: 5.2rem;
    color: rgba(185, 28, 28, 0.18);
    opacity: 1;
    transform: translate(-45%, -48%) rotate(-12deg);
    pointer-events: none;
    z-index: 1;
  }

  .gw-sign-action {
    flex-shrink: 0;
    margin-bottom: 0.2rem;
  }
  .gw-btn {
    padding: 0.5rem 1.4rem;
    border: none; border-radius: 0.4rem;
    background: #0f172a; color: white;
    font-size: 0.78rem; font-weight: 700;
    cursor: pointer; 
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px -1px rgba(15,23,42,0.1), 0 2px 4px -2px rgba(15,23,42,0.1);
  }
  .gw-btn:hover { 
    background: #1e293b; 
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(15,23,42,0.15);
  }
  .gw-btn:active { transform: translateY(0); }

  /* 移动端适配 */
  @media (max-width: 640px) {
    .gw-overlay { padding: 0; align-items: flex-end; }
    .gw-doc { width: 100%; transform: translateY(100%); }
    .gw-overlay[data-open="true"] .gw-doc { transform: translateY(0); }
    .gw-paper {
      border-radius: 1.25rem 1.25rem 0 0;
      border-bottom: none;
      max-height: 90vh; /* fallback */
      max-height: 90dvh;
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior: contain;
    }
    .gw-paper::before {
      content: ''; display: block;
      width: 2.5rem; height: 0.25rem;
      margin: 0.6rem auto 0;
      border-radius: 1rem;
      background: rgba(15,23,42,0.1);
    }
    .gw-head { padding: 1.5rem 1.5rem 0; }
    .gw-head::after { margin-left: -1.5rem; margin-right: -1.5rem; }
    .gw-ref { padding: 0.5rem 1.5rem; }
    .gw-body { padding: 1rem 1.5rem 1.5rem; }
    
    .gw-sign { 
      flex-direction: row; 
      justify-content: space-between; 
      align-items: flex-end;
      margin-top: 1rem;
      padding-top: 0.8rem;
    }
    .gw-sign-block { padding: 0.2rem; transform: scale(0.9); transform-origin: left bottom; }
    .gw-btn { padding: 0.45rem 1.1rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .gw-mask, .gw-doc, .gw-btn { transition: none; }
  }
`;

export const SiteAnnouncement: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const exitRef = useRef<number>(0);

  const dismiss = useCallback(() => {
    setOpen(false);
    exitRef.current = window.setTimeout(() => { setMounted(false); setDismissed(true); }, EXIT_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (exitRef.current) {
        window.clearTimeout(exitRef.current);
      }
    };
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
              <span>{NOTICE.id}</span>
              <span className="gw-ref-dot" aria-hidden="true" />
              <span>{NOTICE.dateLabel}</span>
            </div>

            <div className="gw-body">
              <h2 className="gw-title">{NOTICE.title}</h2>
              <p className="gw-para">
                站点当前进入阶段整理期，近期更新将围绕内容收束、链路校正、评论存储与监控修复同步推进，现将主要方向统一说明如下。
              </p>

              <ul className="gw-items">
                <li className="gw-item">
                  <span className="gw-item-n">一、</span>
                  <div>
                    <p className="gw-item-t">内容体系继续收束</p>
                    <p className="gw-item-d">文章将继续围绕精选内容进行整理，旧稿、测试稿与不再保留的历史内容会逐步下线或归档，避免内容池继续无边界扩张。</p>
                  </div>
                </li>
                <li className="gw-item">
                  <span className="gw-item-n">二、</span>
                  <div>
                    <p className="gw-item-t">站点逻辑与路由边界校正</p>
                    <p className="gw-item-d">文章访问、分页、公告、分享图、元信息等链路正在逐项修正，后续会优先保证公开内容、页面地址和对外分享结果保持一致。</p>
                  </div>
                </li>
                <li className="gw-item is-key">
                  <span className="gw-item-n">三、</span>
                  <div>
                    <p className="gw-item-t">评论 KV 存储仍是当前重点</p>
                    <p className="gw-item-d">评论系统正处于存储修复与切换阶段，优先解决写入稳定性、运行兼容性与后续审核扩展能力问题。</p>
                  </div>
                </li>
                <li className="gw-item">
                  <span className="gw-item-n">四、</span>
                  <div>
                    <p className="gw-item-t">监控与统计口径持续校准</p>
                    <p className="gw-item-d">监控页展示、访问统计、来源识别与页面标题聚合等细节会继续校正，减少展示层与真实运行状态之间的偏差。</p>
                  </div>
                </li>
                <li className="gw-item">
                  <span className="gw-item-n">五、</span>
                  <div>
                    <p className="gw-item-t">后续更新以稳为先</p>
                    <p className="gw-item-d">短期内不会追求功能数量扩张，更新会优先落在内容质量、结构稳定、页面一致性和长期维护成本这几条线上。</p>
                  </div>
                </li>
              </ul>

              <div className="gw-sign">
                <div className="gw-sign-block">
                  <div className="gw-sign-info">
                    <span className="gw-sign-name">Perimsx（1722288011）</span>
                    <span className="gw-sign-date">{NOTICE.signedDateLabel}</span>
                  </div>
                  <svg className="gw-stamp" viewBox="0 0 100 100" aria-hidden="true">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
                    <text x="50" y="38" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="800" letterSpacing="0.15em">COTOVO</text>
                    <line x1="22" y1="44" x2="78" y2="44" stroke="currentColor" strokeWidth="0.8" />
                    <text x="50" y="58" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="700">站点公告</text>
                    <text x="50" y="72" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="600">{NOTICE.stampDateLabel}</text>
                  </svg>
                </div>
                <div className="gw-sign-action">
                  <button ref={btnRef} type="button" className="gw-btn" onClick={dismiss}>
                    知悉
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};
