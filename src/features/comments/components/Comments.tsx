"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CommentListResponse,
  CommentModerationMode,
  CommentTreeItem,
  CreateCommentResponse,
} from "@/features/comments/lib/types";
import { countComments } from "@/features/comments/lib/utils";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { CommentIconMessage } from "./icons";

type CommentsProps = {
  postSlug: string;
};

const defaultMeta = {
  storage: "local-file" as const,
  moderation: "auto-approve" as CommentModerationMode,
};

function CommentChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m6.75 9.75 5.25 5.25 5.25-5.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export default function Comments({ postSlug }: CommentsProps) {
  const [comments, setComments] = useState<CommentTreeItem[]>([]);
  const [meta, setMeta] = useState(defaultMeta);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadComments = useCallback(
    async (keepPrevious = false) => {
      if (!keepPrevious) {
        setLoading(true);
      }

      setError("");

      try {
        const response = await fetch(`/api/comments?postSlug=${encodeURIComponent(postSlug)}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as CommentListResponse & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "评论加载失败，请稍后重试。");
        }

        setComments(payload.comments);
        setMeta(payload.meta);
        setHasLoaded(true);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "评论加载失败，请稍后重试。");
      } finally {
        setLoading(false);
      }
    },
    [postSlug]
  );

  useEffect(() => {
    const syncExpandedStateFromHash = () => {
      if (window.location.hash === "#comments") {
        setIsExpanded(true);
      }
    };

    syncExpandedStateFromHash();
    window.addEventListener("hashchange", syncExpandedStateFromHash);
    return () => window.removeEventListener("hashchange", syncExpandedStateFromHash);
  }, []);

  useEffect(() => {
    if (!isExpanded || hasLoaded || loading) {
      return;
    }

    void loadComments();
  }, [hasLoaded, isExpanded, loadComments, loading]);

  const totalCount = useMemo(() => countComments(comments), [comments]);
  const panelId = `comments-panel-${postSlug}`;

  async function handleCommentSubmitted(response: CreateCommentResponse) {
    setIsExpanded(true);

    if (response.status === "approved") {
      await loadComments(true);
    }
  }

  return (
    <section id="comments" className="mt-1 sm:mt-1.5">
      <div>
        <button
          aria-controls={panelId}
          aria-expanded={isExpanded}
          className={`flex w-full justify-between gap-3 text-left transition ${
            isExpanded ? "items-start py-2.5 sm:py-3" : "items-center py-2 sm:py-2.5"
          }`}
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
        >
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="inline-flex items-center gap-2 text-[0.98rem] font-semibold text-accent/92 sm:text-[1.02rem]">
                <CommentIconMessage className="h-[0.98rem] w-[0.98rem]" />
                <span>评论</span>
                {hasLoaded ? (
                  <span className="text-[0.82rem] font-medium text-foreground/52">
                    {totalCount > 0 ? `(${totalCount})` : ""}
                  </span>
                ) : null}
              </h2>
            </div>

            <p className="max-w-2xl pr-2 text-[0.8rem] leading-6 text-foreground/52">
              {isExpanded
                ? meta.moderation === "manual"
                  ? "提交后会先进入审核队列，公开评论会显示地点、浏览器和系统信息。"
                  : "公开评论会显示地点、浏览器和系统信息。"
                : hasLoaded && totalCount > 0
                  ? `已有 ${totalCount} 条公开评论，点击展开继续查看或留言。`
                  : "点击展开查看评论与留言表单。"}
            </p>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1 text-[0.78rem] font-medium text-foreground/58 transition hover:text-accent ${isExpanded ? "mt-0.5" : ""}`}
          >
            <span>{isExpanded ? "收起" : "展开"}</span>
            <CommentChevron expanded={isExpanded} />
          </span>
        </button>

        {isExpanded ? (
          <div id={panelId} className="border-t border-border/45 pt-3 sm:pt-3.5">
            <CommentForm onSubmitted={handleCommentSubmitted} postSlug={postSlug} />

            {loading ? (
              <div className="mt-3 space-y-3">
                <div className="h-[4.5rem] border-b border-border/45 bg-muted/10" />
                <div className="h-[4.5rem] border-b border-border/35 bg-muted/5" />
              </div>
            ) : error ? (
              <div className="mt-3 border-b border-red-200/70 py-3 text-sm text-red-600 dark:border-red-500/30 dark:text-red-300">
                <p>{error}</p>
                <button
                  className="mt-2 text-[0.82rem] font-medium transition hover:opacity-80"
                  type="button"
                  onClick={() => void loadComments()}
                >
                  重新加载
                </button>
              </div>
            ) : comments.length === 0 ? (
              <div className="mt-3 border-b border-dashed border-border/55 py-4 text-sm leading-7 text-foreground/58">
                这里还没有评论，来留下第一条想法吧。
              </div>
            ) : (
              <ul className="mt-3 flex flex-col">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    depth={0}
                    onCommentSubmitted={handleCommentSubmitted}
                  />
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
