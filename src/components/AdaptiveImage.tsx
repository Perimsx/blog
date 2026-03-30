import React from "react";
import Image from "next/image";
import type { ImageProps } from "next/image";

interface AdaptiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  quality?: number;
}

export const AdaptiveImage: React.FC<AdaptiveImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  loading = "lazy",
  quality,
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
      loading={loading}
      quality={quality}
    />
  );
};
