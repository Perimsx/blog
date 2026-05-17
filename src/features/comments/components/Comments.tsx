"use client";

import { CommentIconMessage } from "./icons";

export default function Comments() {
  return (
    <section id="comments" className="mt-12 flex justify-center pb-8 sm:mt-16 sm:pb-12">
      <div className="flex items-center gap-3 rounded-full bg-muted/30 px-6 py-2.5 text-foreground/50 transition-colors hover:bg-muted/50 dark:bg-muted/20">
        <CommentIconMessage className="h-[1.1rem] w-[1.1rem]" />
        <span className="text-[0.95rem] font-medium italic tracking-widest">评论功能集成中</span>
      </div>
    </section>
  );
}
