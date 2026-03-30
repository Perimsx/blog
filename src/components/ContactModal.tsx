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
        setStatusText("发送成功！我会尽快回复你。");
        setTimeout(closeModal, 1500);
      } else {
        setStatus("error");
        setStatusText(result.error || "发送失败，请重试。");
      }
    } catch {
      setStatus("error");
      setStatusText("网络错误，请检查网络后重试。");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="contact-modal"
      className="fixed inset-0 z-[120] overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={closeModal}
    >
      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div
          className="absolute inset-0 bg-slate-950/28 opacity-100 transition-opacity duration-300 dark:bg-black/60"
          aria-hidden="true"
        />

        <div
          id="contact-modal-panel"
          className="relative z-[121] w-full max-w-[20rem] translate-y-3 scale-[0.97] overflow-hidden rounded-[1rem] border border-slate-200 bg-white shadow-[0_22px_56px_-28px_rgba(15,23,42,0.28)] transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="contact-modal-header flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <h2 id="modal-title" className="text-[0.95rem] font-bold tracking-tight text-slate-900 dark:text-slate-100">
              建议与留言
            </h2>
            <button
              data-contact-modal-close
              className="inline-flex size-7 items-center justify-center rounded-full text-slate-400 transition-all duration-200 hover:rotate-90 hover:bg-slate-100 hover:text-slate-700 active:scale-95 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="关闭"
              type="button"
              onClick={closeModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </header>

          <div className="contact-modal-body px-5 py-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="contact-modal-field space-y-1.5">
                <label htmlFor="contact-modal-qq" className="block text-[0.8rem] font-medium text-slate-700 dark:text-slate-200">
                  邮箱/QQ
                </label>
                <input
                  id="contact-modal-qq"
                  name="qq"
                  type="text"
                  placeholder="方便我回复你"
                  value={qq}
                  onChange={(e) => setQq(e.target.value)}
                  className="h-10 w-full rounded-[0.75rem] border border-slate-200 bg-slate-50 px-3 text-[0.85rem] text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:-translate-y-px focus:border-slate-300 focus:bg-white focus:shadow-[0_10px_20px_-18px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-slate-900 dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-white/20 dark:focus:bg-slate-800"
                />
              </div>

              <div className="contact-modal-field space-y-1.5">
                <label htmlFor="contact-modal-message" className="block text-[0.8rem] font-medium text-slate-700 dark:text-slate-200">
                  建议
                </label>
                <textarea
                  id="contact-modal-message"
                  name="message"
                  rows={4}
                  required
                  placeholder="你的建议或想说的话..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[5.5rem] w-full resize-none rounded-[0.75rem] border border-slate-200 bg-slate-50 px-3 py-2.5 text-[0.85rem] leading-5 text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:-translate-y-px focus:border-slate-300 focus:bg-white focus:shadow-[0_10px_20px_-18px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-slate-900 dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-white/20 dark:focus:bg-slate-800"
                />
              </div>

              {statusText && (
                <div className={`text-sm ${status === "error" ? "text-red-500" : "text-green-500"}`}>
                  {statusText}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="contact-modal-submit-row w-full rounded-[0.75rem] bg-slate-900 py-2.5 text-[0.78rem] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_16px_30px_-18px_rgba(15,23,42,0.55)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-75 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {status === "loading" ? "发送中..." : "发送"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
