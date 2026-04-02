import type { ImageProps } from "next/image";
import Image from "next/image";
import type React from "react";

interface AdaptiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  quality?: number;
  priority?: boolean;
  sizes?: ImageProps["sizes"];
}

export const AdaptiveImage: React.FC<AdaptiveImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  loading = "lazy",
  quality,
  priority = false,
  sizes,
}) => {
  // Normalize relative paths: "./foo" → "/foo"
  const normalizedSrc = src.startsWith("./") ? src.slice(1) : src;

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? undefined : loading}
      quality={quality}
      priority={priority}
      sizes={sizes}
    />
  );
};
