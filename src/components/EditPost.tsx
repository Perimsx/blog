import React from "react";
import Link from "next/link";
import { SITE } from "@/lib/config";
import { IconEdit } from "@/components/icons";

interface EditPostProps {
  post: {
    filePath?: string;
  };
  hideEditPost?: boolean;
  className?: string;
}

export const EditPost: React.FC<EditPostProps> = ({ post, hideEditPost, className = "" }) => {
  const href = `${SITE.editPost.url}${post.filePath}`;
  const showEditPost = SITE.editPost.enabled && !hideEditPost && href.trim() !== "";

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
        <span className="italic max-sm:text-sm sm:inline">
          {SITE.editPost.text}
        </span>
      </Link>
    </div>
  );
};
