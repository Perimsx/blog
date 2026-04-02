"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CreateCommentResponse } from "@/features/comments/lib/types";
import { buildQqAvatarUrl, cn } from "@/features/comments/lib/utils";
import CommentMarkdown from "./CommentMarkdown";
import { CommentIconSmile } from "./icons";

const COMMENT_EMOJIS = [
  "😀",
  "😄",
  "😁",
  "🙂",
  "😉",
  "😎",
  "🤔",
  "🥳",
  "👏",
  "🙌",
  "👍",
  "🔥",
  "✨",
  "💡",
  "🚀",
  "🎉",
] as const;

type CommentFormProps = {
  postSlug: string;
  parentId?: string | null;
  parentName?: string;
  onSubmitted: (response: CreateCommentResponse) => Promise<void> | void;
  onCancel?: () => void;
};

export default function CommentForm({
  postSlug,
  parentId,
  parentName,
  onSubmitted,
  onCancel,
}: CommentFormProps) {
  const [nickname, setNickname] = useState("");
  const [qq, setQq] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiToggleRef = useRef<HTMLButtonElement>(null);
  const emojiPanelRef = useRef<HTMLDivElement>(null);
  const avatarUrl = useMemo(() => buildQqAvatarUrl(qq), [qq]);

  useEffect(() => {
    if (!emojiOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (emojiPanelRef.current?.contains(target) || emojiToggleRef.current?.contains(target)) {
        return;
      }

      setEmojiOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [emojiOpen]);

  function insertEmoji(emoji: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((current) => `${current}${emoji} `);
      return;
    }

    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;
    const nextContent = `${content.slice(0, start)}${emoji} ${content.slice(end)}`;

    setContent(nextContent);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + emoji.length + 1;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postSlug,
          parentId,
          nickname,
          qq,
          content,
          website: "",
        }),
      });

      const payload = (await response.json()) as CreateCommentResponse & { error?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? payload.message ?? "评论提交失败，请稍后重试。");
      }

      setNickname("");
      setQq("");
      setContent("");
      setPreview(false);
      setEmojiOpen(false);
      setMessage(payload.message);
      await onSubmitted(payload);
      onCancel?.();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "评论提交失败，请稍后重试。");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-2.5" onSubmit={handleSubmit}>
      {parentName ? (
        <div className="text-[0.82rem] text-foreground/62">
          回复 <span className="font-medium text-accent/90">@{parentName}</span>
        </div>
      ) : null}

      <div className="flex items-start gap-2 sm:gap-3">
        {avatarUrl ? (
          <Image
            alt="QQ 头像预览"
            className="mt-0.5 h-8 w-8 shrink-0 rounded-full border border-border/70 object-cover sm:h-9 sm:w-9"
            height={40}
            loading="lazy"
            src={avatarUrl}
            unoptimized
            width={40}
          />
        ) : (
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-foreground/60 sm:h-9 sm:w-9 sm:text-xs">
            QQ
          </div>
        )}

        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="flex h-9 items-center overflow-hidden rounded-md border border-border/70 bg-background/85 sm:h-8">
            <span className="flex h-full shrink-0 items-center border-r border-border/70 bg-muted/35 px-2 text-[12px] font-medium text-foreground/72 sm:px-2.5 sm:text-[13px]">
              昵称
            </span>
            <input
              className="h-full w-full border-0 bg-transparent px-2 text-base outline-none sm:px-2.5 sm:text-sm"
              maxLength={40}
              name="nickname"
              onChange={(event) => setNickname(event.target.value)}
              placeholder="留下你的称呼"
              required
              value={nickname}
            />
          </label>

          <label className="flex h-9 items-center overflow-hidden rounded-md border border-border/70 bg-background/85 sm:h-8">
            <span className="flex h-full shrink-0 items-center border-r border-border/70 bg-muted/35 px-2 text-[12px] font-medium text-foreground/72 sm:px-2.5 sm:text-[13px]">
              QQ
            </span>
            <input
              className="h-full w-full border-0 bg-transparent px-2 text-base outline-none sm:px-2.5 sm:text-sm"
              inputMode="numeric"
              maxLength={12}
              minLength={5}
              name="qq"
              onChange={(event) => setQq(event.target.value.replace(/[^\d]/g, ""))}
              pattern="[0-9]{5,12}"
              placeholder="用于展示头像"
              required
              value={qq}
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border/70 bg-background/85">
        {preview ? (
          <div className="min-h-[4.5rem] px-2.5 py-2">
            <CommentMarkdown
              className={cn(
                "text-[13.5px] leading-6 sm:text-sm",
                !content && "opacity-65 text-foreground/58"
              )}
              content={content || "预览区会显示你的评论内容。"}
            />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            className="min-h-[4.5rem] w-full resize-y border-0 bg-transparent px-2.5 py-2 text-base leading-6 outline-none sm:text-sm"
            maxLength={1000}
            name="content"
            onChange={(event) => setContent(event.target.value)}
            placeholder="说点什么吧，支持基础 Markdown。"
            required
            value={content}
          />
        )}

        <div className="flex flex-col gap-2 border-t border-border/70 px-2 py-1.5 text-[11px] text-foreground/58 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                ref={emojiToggleRef}
                aria-expanded={emojiOpen}
                aria-label="插入表情"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground/68 transition hover:bg-muted hover:text-foreground"
                onClick={() => setEmojiOpen((current) => !current)}
                type="button"
              >
                <CommentIconSmile className="h-4.5 w-4.5" />
              </button>

              {emojiOpen ? (
                <div
                  ref={emojiPanelRef}
                  className="absolute bottom-full left-0 z-20 mb-1.5 grid w-[15rem] grid-cols-4 gap-1 rounded-md border border-border/80 bg-background/96 p-1.5 shadow-[0_12px_32px_-26px_rgba(15,23,42,0.45)] backdrop-blur"
                >
                  {COMMENT_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      aria-label={`插入 ${emoji}`}
                      className="inline-flex h-9 w-full items-center justify-center rounded-md text-xl transition hover:bg-muted"
                      onClick={() => {
                        insertEmoji(emoji);
                        setEmojiOpen(false);
                      }}
                      type="button"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              className="rounded-md px-2 py-1 text-[11px] text-foreground/68 transition hover:bg-muted hover:text-foreground sm:text-[12px]"
              onClick={() => setPreview((current) => !current)}
              type="button"
            >
              {preview ? "继续编辑" : "预览评论"}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="tabular-nums opacity-80">{content.length}/1000</span>
            {onCancel ? (
              <button
                className="rounded-md px-2.5 py-1 text-[11px] text-foreground/68 transition hover:bg-muted hover:text-foreground sm:text-[12px]"
                type="button"
                onClick={onCancel}
              >
                取消
              </button>
            ) : null}
            <button
              className="rounded-md bg-accent px-3 py-1 text-[11px] font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-65 sm:text-[12px]"
              disabled={pending}
              type="submit"
            >
              {pending ? "提交中..." : "发送评论"}
            </button>
          </div>
        </div>
      </div>

      <div aria-live="polite" className="min-h-5 text-[0.8rem]">
        {error ? <p className="text-red-500">{error}</p> : null}
        {!error && message ? <p className="text-accent/88">{message}</p> : null}
      </div>
    </form>
  );
}
