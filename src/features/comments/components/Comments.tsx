"use client";

import { CommentIconMessage } from "./icons";

interface CommentsProps {
  path?: string;
}

export default function Comments({ path }: CommentsProps) {
  return (
    <section id="comments" className="mt-6 flex justify-center pb-4 sm:mt-8 sm:pb-6">
      <div className="flex items-center gap-2.5 rounded-full bg-muted/30 px-5 py-2 text-foreground/50 transition-colors hover:bg-muted/50 dark:bg-muted/20">
        <CommentIconMessage className="h-4 w-4" />
        <span className="whitespace-nowrap text-[0.9rem] font-medium italic tracking-wider">暂未开放评论功能</span>
      </div>
    </section>
  );
}
