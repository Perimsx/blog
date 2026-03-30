import React from "react";
import Link from "next/link";
import { Datetime } from "@/components/Datetime";
import { AdaptiveImage } from "@/components/AdaptiveImage";
import { Tag } from "@/components/Tag";
import { slugifyAll } from "@/lib/slugify";
import type { Post } from "@/lib/blog";

interface CardProps {
  post: Post;
  variant?: "h2" | "h3";
  showImage?: boolean;
}

export const Card: React.FC<CardProps> = ({
  post,
  variant = "h2",
  showImage = true,
}) => {
  const { title, description, pubDatetime, modDatetime, timezone: postTimezone, coverImage, heroImage, url, tags } = post.data;
  const readingTimeStr = post.readingTime;
  const articleImage = coverImage ?? heroImage;

  const postPath = url ? `/posts/${url}` : `/posts/${post.slug}`;

  const tagItems = tags ?? [];
  const slugs = slugifyAll(tagItems);

  return (
    <li className="my-5 sm:my-6">
      <div>
        <Link
          href={postPath}
          className="inline-block text-base font-medium text-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0 sm:text-lg"
        >
          {variant === "h2" ? (
            <h2 className="text-base font-medium decoration-dashed hover:underline sm:text-lg">{title}</h2>
          ) : (
            <h3 className="text-base font-medium decoration-dashed hover:underline sm:text-lg">{title}</h3>
          )}
        </Link>
        <div className="mb-2.5 flex items-center gap-2.5 sm:mb-3 sm:gap-3">
          <Datetime pubDatetime={pubDatetime} modDatetime={modDatetime} timezone={postTimezone} />
          <span className="text-sm italic opacity-80">• {readingTimeStr}</span>
        </div>
        <div className="flex items-start gap-3 sm:gap-4">
          {showImage && articleImage && (
            <Link
              href={postPath}
              className="flex-shrink-0 hidden sm:block group"
            >
              <AdaptiveImage
                src={articleImage}
                alt={title}
                width={140}
                height={79}
                className="rounded shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:scale-105 object-cover"
                quality={80}
              />
            </Link>
          )}
          <p className="flex-1 text-[0.95rem] leading-7 opacity-80 sm:text-base sm:leading-8">{description}</p>
        </div>
        {tagItems.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {tagItems.map((tagName, i) => (
              <Tag key={tagName} tag={slugs[i]} tagName={tagName} size="sm" />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
};
