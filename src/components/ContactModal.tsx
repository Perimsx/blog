"use client";

import React, { useState, useEffect, useCallback } from "react";

export const ContactModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [qq, setQq] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    document.addEventListener("open-contact-modal", handleOpen);
    return () => document.removeEventListener("open-contact-modal", handleOpen);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setQq("");
    setMessage("");
    setStatus("idle");
    setStatusText("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setStatus("error");
      setStatusText("请填写留言内容");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qq: qq.trim(), message: message.trim() }),
      });
      const result = await res.json();
      if (res.ok) {
        setStatus("success");
        setStatusText("发送成功！");
        setTimeout(closeModal, 1200);
      } else {
        setStatus("error");
        setStatusText(result.error || "发送失败");
      }
    } catch {
      setStatus("error");
      setStatusText("网络错误");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="contact-modal"
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[4px] transition-opacity duration-300 dark:bg-black/70" 
        onClick={closeModal}
      />

      {/* Modal Shell */}
      <div
        className="relative z-10 w-full max-w-[19rem] overflow-hidden rounded-2xl border border-border/40 bg-background shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)] animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-[0.85rem] font-bold tracking-tight text-foreground/80">
            建议与留言
          </h2>
          <button
            className="group flex size-6 items-center justify-center rounded-full transition-colors hover:bg-muted"
            onClick={closeModal}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 group-hover:opacity-100 italic transition-opacity">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </header>

        <div className="px-4 pb-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="c-qq" className="text-[0.65rem] font-bold uppercase tracking-wider text-foreground/30">
                邮箱/QQ
              </label>
              <input
                id="c-qq"
                type="text"
                placeholder="留下联系方式 (可选)"
                value={qq}
                onChange={(e) => setQq(e.target.value)}
                className="h-9 w-full rounded-xl border border-border/50 bg-muted/20 px-3 text-[0.8rem] text-foreground outline-none transition-all placeholder:text-foreground/20 focus:border-accent/40 focus:bg-background"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="c-msg" className="text-[0.65rem] font-bold uppercase tracking-wider text-foreground/30">
                内容
              </label>
              <textarea
                id="c-msg"
                required
                rows={3}
                placeholder="你想说的话..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full resize-none rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-[0.8rem] leading-relaxed text-foreground outline-none transition-all placeholder:text-foreground/20 focus:border-accent/40 focus:bg-background"
              />
            </div>

            {statusText && (
              <p className={`text-[0.75rem] font-medium ${status === "error" ? "text-red-500/80" : "text-green-600/80"}`}>
                {statusText}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-1 w-full rounded-xl bg-foreground py-2.5 text-[0.75rem] font-bold text-background transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {status === "loading" ? "正在投递..." : "发送"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
