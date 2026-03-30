"use client";

import React, { useState, useEffect } from "react";

export const SiteAnnouncement: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const closeModal = () => {
    const container = document.getElementById("bulletin-container");
    if (container) {
      container.style.opacity = "0";
      container.style.transform = "translateY(-10px)";
    }
    setTimeout(() => {
      setIsOpen(false);
      document.body.style.overflow = "";
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div
      id="bulletin-container"
      className="fixed inset-0 z-[9999] flex flex-col justify-center overflow-y-auto bg-background p-4 text-foreground transition-all duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] sm:p-8"
      role="dialog"
      aria-modal="true"
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes printInFast {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-print {
          animation: printInFast 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards;
          opacity: 0;
        }
      `}} />

      {/* 真公告排版：紧凑架构，保证桌面端一屏展示 */}
      <div className="mx-auto w-full max-w-[42rem]">
        
        {/* 报头 / 眉首 */}
        <header className="anim-print mb-6 border-b-2 border-foreground pb-4" style={{ animationDelay: '0s' }}>
          <h1 className="text-center font-sans text-xl font-black tracking-widest sm:text-3xl">
            系统重构升级公告
          </h1>
          <div className="mt-4 flex flex-row items-center justify-between font-sans text-[0.65rem] font-semibold tracking-wider opacity-60 sm:text-xs">
            <span>文献编号：PRMSX-2026-UPGRADE</span>
            <span>执行状态：发布实施</span>
          </div>
        </header>

        {/* 公文正文主体 - 高度紧凑 */}
        <main className="space-y-5 font-serif text-[0.85rem] leading-relaxed tracking-wide text-foreground/90 sm:text-[0.95rem] sm:leading-[1.8]">
          
          <p className="anim-print text-justify" style={{ animationDelay: '0.1s' }}>
            <strong>致各位访客与同行：</strong><br />
            鉴于深层性能诉求，本站已启动彻底的底层重构。工程栈由 Astro 全域变轨至 <strong>Next.js (App Router)</strong>。核心调整明细如下：
          </p>

          <section className="anim-print space-y-2" style={{ animationDelay: '0.2s' }}>
            <h2 className="flex items-center gap-2 font-sans text-[0.95rem] font-bold text-foreground">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center bg-foreground text-[0.6rem] text-background">一</span>
              全模态静态跃迁 (SSG Export)
            </h2>
            <div className="border-l-2 border-foreground/20 pl-4 opacity-90 text-[0.9em]">
              彻底废除 Node.js 运行时及动态中间件，Data-Fetching 100% 转移至 Build 侧，消除 SSR 承载损耗，极致压降 TTFB（首字节延迟）。
            </div>
          </section>

          <section className="anim-print space-y-2" style={{ animationDelay: '0.3s' }}>
            <h2 className="flex items-center gap-2 font-sans text-[0.95rem] font-bold text-foreground">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center bg-foreground text-[0.6rem] text-background">二</span>
              视图解耦与微观交互革新
            </h2>
            <div className="border-l-2 border-foreground/20 pl-4 opacity-90 text-[0.9em]">
              基于 RSC 组件重置基准网格布局，废弃生硬交互，上线响应式 Drawer 层级栈 (TOC)，并接管 View Transitions 实现主体无极切换平滑度。
            </div>
          </section>

          <section className="anim-print space-y-2" style={{ animationDelay: '0.4s' }}>
            <h2 className="flex items-center gap-2 font-sans text-[0.95rem] font-bold text-foreground">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center bg-accent text-[0.6rem] text-background">三</span>
              系统免责声明 (WIP)
            </h2>
            <div className="border-l-2 border-accent pl-4 opacity-90 text-[0.9em]">
              为实现像素级跨栈映射，正强制介入 MDX 解析链。当前生产系统处 <span className="text-accent font-bold">高敏调优期</span>，引发的局部样式异化及 404 断层属预期现象，敬请无视与包容。
            </div>
          </section>

        </main>

        {/* 落款与确认区 */}
        <footer className="anim-print mt-8 flex flex-row items-end justify-between border-t border-foreground/20 pt-6" style={{ animationDelay: '0.5s' }}>
          
          <div className="flex flex-col text-left font-sans">
            <span className="mb-1 text-[0.8rem] font-bold tracking-[0.1em] text-foreground sm:text-[0.9rem]">
              Perimsx (1722288011)
            </span>
            <span className="text-[0.65rem] tracking-wider text-foreground/60 sm:text-xs">
              {new Date().toISOString().split('T')[0].replace(/-/g, ' · ')}
            </span>
          </div>

          <button
            onClick={closeModal}
            className="group relative inline-flex h-9 shrink-0 items-center justify-center border-2 border-foreground bg-transparent px-5 font-sans text-[0.7rem] font-bold tracking-widest text-foreground transition-all duration-300 hover:bg-foreground hover:text-background focus:outline-none sm:h-10 sm:px-8 sm:text-[0.75rem]"
          >
            知悉并进入
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
              <path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>

        </footer>

      </div>
    </div>
  );
};
