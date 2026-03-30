"use client";

import React, { useState, useCallback } from "react";
import { SITE } from "@/lib/config";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", qq: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusText, setStatusText] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.message.trim()) {
      setStatus("error");
      setStatusText("请填写留言内容");
      return;
    }

    if (!form.email.trim() && !form.qq.trim()) {
      setStatus("error");
      setStatusText("请至少留下邮箱或 QQ");
      return;
    }

    setStatus("loading");
    setStatusText("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();

      if (res.ok) {
        setStatus("success");
        setStatusText("发送成功！我会尽快回复你。");
        setForm({ name: "", email: "", qq: "", message: "" });
      } else {
        setStatus("error");
        setStatusText(result.error || "发送失败，请重试。");
      }
    } catch {
      setStatus("error");
      setStatusText("网络错误，请检查网络后重试。");
    }
  };

  return (
    <main id="main-content" className="ui-page mx-auto w-full max-w-3xl px-4 pb-8 sm:pb-4">
      <h1 className="mt-6 text-[1.75rem] font-semibold tracking-tight sm:mt-8 sm:text-3xl">Contact</h1>
      <p className="mt-2 mb-5 text-sm italic sm:mb-6">Send me a message ...</p>

      <div className="space-y-6">
        <p className="text-[0.95rem] leading-7 text-foreground/80 sm:text-base">
          有任何问题或建议，欢迎留言。也可以通过以下方式联系我：
        </p>

        <div className="flex flex-wrap gap-3 sm:gap-4">
          <a
            href="mailto:1722288011@qq.com"
            className="inline-flex w-full items-center justify-center gap-2 rounded bg-accent px-4 py-2.5 text-[0.95rem] text-white transition-opacity hover:opacity-90 sm:w-auto sm:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            发送邮件
          </a>
          <a
            href="https://wpa.qq.com/msgrd?v=3&uin=1722288011&site=qq&menu=yes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded bg-muted px-4 py-2.5 text-[0.95rem] text-foreground transition-colors hover:bg-accent/20 sm:w-auto sm:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.38 0 2.5 1.12 2.5 2.5 0 .65-.25 1.24-.66 1.67-.41.43-.66 1.02-.66 1.67 0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5c0-.65.25-1.24.66-1.67.41-.43.66-1.02.66-1.67C14.5 6.12 13.38 5 12 5z"/>
              <path d="M7.88 11.67c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm4.12 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm4 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
            </svg>
            QQ 联系
          </a>
        </div>

        <hr className="border-border" />

        <form onSubmit={handleSubmit} className="max-w-lg space-y-3.5 sm:space-y-4">
          <div>
            <label htmlFor="contact-page-name" className="mb-1 block text-[0.9rem] font-medium text-foreground sm:text-sm">
              姓名（选填）
            </label>
            <input
              type="text"
              id="contact-page-name"
              name="name"
              placeholder="你的名字"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded border border-border bg-background px-3 py-2 text-[0.95rem] text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50 sm:text-base"
            />
          </div>

          <div>
            <label htmlFor="contact-page-email" className="mb-1 block text-[0.9rem] font-medium text-foreground sm:text-sm">
              邮箱（选填）
            </label>
            <input
              type="email"
              id="contact-page-email"
              name="email"
              placeholder="方便我回复你"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded border border-border bg-background px-3 py-2 text-[0.95rem] text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50 sm:text-base"
            />
          </div>

          <div>
            <label htmlFor="contact-page-qq" className="mb-1 block text-[0.9rem] font-medium text-foreground sm:text-sm">
              QQ（选填，推荐）
            </label>
            <input
              type="text"
              id="contact-page-qq"
              name="qq"
              placeholder="方便的话可以留下 QQ 号"
              value={form.qq}
              onChange={handleChange}
              className="w-full rounded border border-border bg-background px-3 py-2 text-[0.95rem] text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50 sm:text-base"
            />
          </div>

          <div>
            <label htmlFor="contact-page-message" className="mb-1 block text-[0.9rem] font-medium text-foreground sm:text-sm">
              留言内容 <span className="text-accent">*</span>
            </label>
            <textarea
              id="contact-page-message"
              name="message"
              rows={5}
              placeholder="想说点什么..."
              required
              value={form.message}
              onChange={handleChange}
              className="w-full resize-y rounded border border-border bg-background px-3 py-2 text-[0.95rem] text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50 sm:text-base"
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
            className="rounded bg-accent px-5 py-2.5 text-[0.95rem] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-2 sm:text-base"
          >
            {status === "loading" ? "发送中..." : "发送留言"}
          </button>
        </form>
      </div>
    </main>
  );
}
