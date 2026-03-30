import React from "react";
import Link from "next/link";
import { IconHash } from "@/components/icons";

interface TagProps {
  tag: string;
  tagName: string;
  size?: "sm" | "lg";
}

export const Tag: React.FC<TagProps> = ({ tag, tagName, size = "sm" }) => {
  return (
    <li
      className={[
        "group inline-block max-w-full group-hover:cursor-pointer",
        size === "sm" ? "underline-offset-4" : "underline-offset-6 sm:underline-offset-8",
      ].join(" ")}
    >
      <Link
        href={`/tags/${tag}`}
        className={[
          "relative inline-flex max-w-full items-center whitespace-nowrap underline decoration-dashed transition-colors group-hover:-top-0.5 group-hover:text-accent focus-visible:p-1",
          size === "sm" ? "text-sm underline-offset-4" : "text-base underline-offset-6 sm:text-lg sm:underline-offset-8",
        ].join(" ")}
      >
        <IconHash
          className={[
            "mr-1 inline-block shrink-0 opacity-80 sm:mr-1.5",
            size === "sm" ? "size-3.5" : "size-4 sm:size-5",
          ].join(" ")}
        />
        <span>{tagName}</span>
      </Link>
    </li>
  );
};
