import type React from "react";

interface IconProps {
  className?: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
}

export const IconArrowLeft: React.FC<IconProps> = ({
  className,
  size = 24,
  width,
  height,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width ?? size}
    height={height ?? size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M0 0h24v24H0z" stroke="none" />
    <path d="M5 12l14 0" />
    <path d="M5 12l6 6" />
    <path d="M5 12l6 -6" />
  </svg>
);

export const IconArrowRight: React.FC<IconProps> = ({
  className,
  size = 24,
  width,
  height,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width ?? size}
    height={height ?? size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M0 0h24v24H0z" stroke="none" />
    <path d="M5 12l14 0" />
    <path d="M13 18l6 -6" />
    <path d="M13 6l6 6" />
  </svg>
);

export const IconChevronLeft: React.FC<IconProps> = ({
  className,
  size = 24,
  width,
  height,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width ?? size}
    height={height ?? size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M0 0h24v24H0z" stroke="none" />
    <path d="M15 6l-6 6l6 6" />
  </svg>
);

export const IconChevronRight: React.FC<IconProps> = ({
  className,
  size = 24,
  width,
  height,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width ?? size}
    height={height ?? size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M0 0h24v24H0z" stroke="none" />
    <path d="M9 6l6 6l-6 6" />
  </svg>
);
