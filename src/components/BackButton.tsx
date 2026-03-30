import React from "react";
import Link from "next/link";
import { SITE } from "@/lib/config";

export const BackButton: React.FC = () => {
  if (!SITE.showBackButton) return null;

  return (
    <div className="mx-auto flex w-full max-w-3xl items-center justify-start px-2">
      <Link
        href="/"
        className="focus-outline mt-8 mb-2 flex hover:text-foreground/75"
        id="back-button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="inline-block size-6"
        >
          <path d="M0 0h24v24H0z" stroke="none" />
          <path d="M15 6l-6 6l6 6" />
        </svg>
        <span>Go back</span>
      </Link>
    </div>
  );
};
