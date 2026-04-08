import type React from "react";

interface IconProps {
  className?: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
}

export const IconCalendar: React.FC<IconProps> = ({
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
    <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" />
    <path d="M16 3v4" />
    <path d="M8 3v4" />
    <path d="M4 11h16" />
    <path d="M7 14h.013" />
    <path d="M10.01 14h.005" />
    <path d="M13.01 14h.005" />
    <path d="M16.015 14h.005" />
    <path d="M13.015 17h.005" />
    <path d="M7.01 17h.005" />
    <path d="M10.01 17h.005" />
  </svg>
);

export const IconEdit: React.FC<IconProps> = ({
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
    <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
    <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
    <path d="M16 5l3 3" />
  </svg>
);

export const IconHash: React.FC<IconProps> = ({
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
    <path d="M5 9l14 0" />
    <path d="M5 15l14 0" />
    <path d="M11 4l-4 16" />
    <path d="M17 4l-4 16" />
  </svg>
);

export const IconMail: React.FC<IconProps> = ({
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
    <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
    <path d="M3 7l9 6l9 -6" />
  </svg>
);

export const IconMenuDeep: React.FC<IconProps> = ({
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
    <path d="M4 6h16" />
    <path d="M7 12h13" />
    <path d="M10 18h10" />
  </svg>
);

export const IconMonitor: React.FC<IconProps> = ({
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
    <path d="M4 5a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
    <path d="M7 20h10" />
    <path d="M9 17v3" />
    <path d="M15 17v3" />
    <path d="M7 11h2l1.5 -3l3 6l1.5 -3h2" />
  </svg>
);

export const IconMoon: React.FC<IconProps> = ({
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
    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
  </svg>
);

export const IconRss: React.FC<IconProps> = ({ className, size = 24, width, height, ...props }) => (
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
    <path d="M5 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M4 4a16 16 0 0 1 16 16" />
    <path d="M4 11a9 9 0 0 1 9 9" />
  </svg>
);

export const IconSearch: React.FC<IconProps> = ({
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
    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
    <path d="M21 21l-6 -6" />
  </svg>
);

export const IconSunHigh: React.FC<IconProps> = ({
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
    <path d="M14.828 14.828a4 4 0 1 0 -5.656 -5.656a4 4 0 0 0 5.656 5.656z" />
    <path d="M6.343 17.657l-1.414 1.414" />
    <path d="M6.343 6.343l-1.414 -1.414" />
    <path d="M17.657 6.343l1.414 -1.414" />
    <path d="M17.657 17.657l1.414 1.414" />
    <path d="M4 12h-2" />
    <path d="M12 4v-2" />
    <path d="M20 12h2" />
    <path d="M12 20v2" />
  </svg>
);
