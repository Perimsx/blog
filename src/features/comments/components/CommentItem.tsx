"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";
import {
  formatCommentLocation,
  getCommentBrowserIconPath,
  getCommentOsIconPath,
  hasKnownCommentMeta,
  stripCommentClientVersionLabel,
} from "@/features/comments/lib/display";
import type { CommentTreeItem, CreateCommentResponse } from "@/features/comments/lib/types";
import { buildQqAvatarUrl, cn, formatCommentTime } from "@/features/comments/lib/utils";
import CommentForm from "./CommentForm";
import CommentMarkdown from "./CommentMarkdown";
import { CommentIconBrowser, CommentIconDevice, CommentIconGlobe, CommentIconReply } from "./icons";

type CommentItemProps = {
  comment: CommentTreeItem;
  depth: number;
  parentAuthorName?: string;
  onCommentSubmitted: (response: CreateCommentResponse) => Promise<void> | void;
};

function buildMetaItems(comment: CommentTreeItem) {
  const location = formatCommentLocation(comment.location);
  const browser = hasKnownCommentMeta(comment.browser) ? String(comment.browser).trim() : "";
  const os = hasKnownCommentMeta(comment.os) ? String(comment.os).trim() : "";

  return [
    location
      ? {
          key: "location",
          label: location,
          icon: <CommentIconGlobe className="h-[0.9rem] w-[0.9rem]" />,
        }
      : null,
    browser
      ? {
          key: "browser",
          label: browser,
          iconPath: getCommentBrowserIconPath(browser),
          icon: <CommentIconBrowser className="h-[0.9rem] w-[0.9rem]" />,
        }
      : null,
    os
      ? {
          key: "os",
          label: os,
          iconPath: getCommentOsIconPath(os),
          icon: <CommentIconDevice className="h-[0.9rem] w-[0.9rem]" />,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    icon: ReactNode;
    iconPath?: string | null;
  }>;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export default function CommentItem({
  comment,
  depth,
  parentAuthorName,
  onCommentSubmitted,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const avatarSrc = comment.avatar || buildQqAvatarUrl(comment.qq);
  const metaItems = buildMetaItems(comment);
  const isReply = depth > 0;

  return (
    <li className={cn(isReply ? "mt-3" : "border-b border-border/45 py-5 last:border-0")}>
      <article
        className={cn("group flex items-start gap-2.5 sm:gap-3", isReply && "gap-2 sm:gap-2.5")}
      >
        <div className="flex shrink-0 flex-col items-center">
          {avatarSrc ? (
            <Image
              alt={`${comment.authorName} 的头像`}
              className={cn(
                "rounded-full border border-border/65 object-cover",
                isReply ? "mt-1 h-8 w-8 sm:h-9 sm:w-9" : "mt-0.5 h-10 w-10 sm:h-11 sm:w-11"
              )}
              height={44}
              loading="lazy"
              src={avatarSrc}
              unoptimized
              width={44}
            />
          ) : (
            <div
              className={cn(
                "flex items-center justify-center rounded-full border border-dashed border-border/65 bg-muted/35 text-[11px] font-semibold text-foreground/68",
                isReply ? "mt-1 h-8 w-8 sm:h-9 sm:w-9" : "mt-0.5 h-10 w-10 sm:h-11 sm:w-11"
              )}
            >
              {getInitials(comment.authorName)}
            </div>
          )}

          {comment.replies.length > 0 && !isReply ? (
            <div className="mt-2 w-px flex-1 bg-border/45" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[0.95rem] font-semibold text-foreground/92">
                {comment.authorName}
              </span>
              {parentAuthorName ? (
                <span className="text-[0.8rem] text-foreground/55">
                  回复 <span className="text-accent/80">@{parentAuthorName}</span>
                </span>
              ) : null}
              <time className="text-[0.8rem] text-foreground/48" dateTime={comment.createdAt}>
                {formatCommentTime(comment.createdAt)}
              </time>
            </div>

            <button
              className="inline-flex items-center gap-1 text-[0.8rem] text-foreground/56 opacity-90 transition hover:text-accent sm:opacity-0 sm:group-hover:opacity-100"
              type="button"
              onClick={() => setIsReplying((current) => !current)}
            >
              <CommentIconReply className="h-4 w-4" />
              回复
            </button>
          </div>

          <CommentMarkdown className="mt-1.5" content={comment.content} />

          {metaItems.length ? (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-[12px] text-foreground/56">
              {metaItems.map((item) => (
                <span key={`${comment.id}-${item.key}`} className="inline-flex items-center gap-1">
                  {item.iconPath ? (
                    <Image
                      alt=""
                      aria-hidden="true"
                      className="h-[14px] w-[14px] shrink-0"
                      height={14}
                      loading="lazy"
                      src={item.iconPath}
                      unoptimized
                      width={14}
                    />
                  ) : (
                    item.icon
                  )}
                  {item.key === "location" ? (
                    <span>{item.label}</span>
                  ) : (
                    <>
                      <span className="max-w-[84px] truncate sm:hidden">
                        {stripCommentClientVersionLabel(item.label)}
                      </span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </>
                  )}
                </span>
              ))}
            </div>
          ) : null}

          {isReplying ? (
            <div className="mt-4">
              <CommentForm
                onCancel={() => setIsReplying(false)}
                onSubmitted={async (response) => {
                  await onCommentSubmitted(response);
                  setIsReplying(false);
                }}
                parentId={comment.id}
                parentName={comment.authorName}
                postSlug={comment.postSlug}
              />
            </div>
          ) : null}

          {comment.replies.length ? (
            <ul className="mt-3 space-y-1">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  onCommentSubmitted={onCommentSubmitted}
                  parentAuthorName={comment.authorName}
                />
              ))}
            </ul>
          ) : null}
        </div>
      </article>
    </li>
  );
}
