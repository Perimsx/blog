import Link from "next/link";
import type React from "react";
import { IconEdit } from "@/components/icons";
import { SITE } from "@/lib/config";

interface EditPostProps {
  post: {
    filePath?: string;
  };
  hideEditPost?: boolean;
  className?: string;
}

export const EditPost: React.FC<EditPostProps> = ({ post, hideEditPost, className = "" }) => {
  const hasValidTarget = Boolean(post.filePath) && SITE.editPost.url.trim() !== "";
  const href = hasValidTarget ? `${SITE.editPost.url}${post.filePath}` : "";
  const showEditPost = SITE.editPost.enabled && !hideEditPost && hasValidTarget;

  if (!showEditPost) return null;

  return (
    <div className={["opacity-80", className].join(" ")}>
      <span aria-hidden="true" className="max-sm:hidden">
        |
      </span>
      <Link
        className="space-x-1.5 hover:opacity-75"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <IconEdit className="inline-block size-6" />
        <span className="italic max-sm:text-sm sm:inline">{SITE.editPost.text}</span>
      </Link>
    </div>
  );
};
