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

export const IconBlueSky: React.FC<IconProps> = ({
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
    <path
      d="M12 11.5c-.87-1.69-3.24-4.84-5.44-6.4-2.1-1.48-2.89-1.24-3.42-1.01-.62.27-.72 1.17-.72 1.72 0 .55.3 4.52.5 5.18.65 2.19 2.97 2.93 5.1 2.69.11-.02.22-.03.33-.04-.11.01-.22.03-.33.04-3.13.47-5.91 1.61-2.26 5.67 4.01 4.15 5.5-.89 6.26-3.45.76 2.56 1.64 7.42 6.19 3.45 3.41-3.45.94-5.2-2.19-5.67-.11-.01-.22-.03-.33-.04.11.01.22.02.33.04 2.14.24 4.45-.5 5.1-2.69.2-.66.5-4.63.5-5.18 0-.55-.11-1.49-.72-1.77-.53-.24-1.33-.5-3.44.99-2.2 1.56-4.57 3.71-5.44 6.4Z"
      strokeWidth="1.815"
    />
  </svg>
);

export const IconBrandX: React.FC<IconProps> = ({
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
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

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

export const IconFacebook: React.FC<IconProps> = ({
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
    <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
  </svg>
);

export const IconGitHub: React.FC<IconProps> = ({
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
    <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
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

export const IconLinkedin: React.FC<IconProps> = ({
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
    <path d="M8 11v5" />
    <path d="M8 8v.01" />
    <path d="M12 16v-5" />
    <path d="M16 16v-3a2 2 0 1 0 -4 0" />
    <path d="M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4z" />
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

export const IconTelegram: React.FC<IconProps> = ({
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
    <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />
  </svg>
);

export const IconX: React.FC<IconProps> = ({ className, size = 24, width, height, ...props }) => (
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
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </svg>
);

export const IconDouyin: React.FC<IconProps> = ({
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
    className={className}
    {...props}
  >
    <path
      fill="currentColor"
      stroke="none"
      d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
    />
  </svg>
);

export const IconBilibili: React.FC<IconProps> = ({
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
    className={className}
    {...props}
  >
    <path
      fill="currentColor"
      stroke="none"
      d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z"
    />
  </svg>
);

export const IconWechat: React.FC<IconProps> = ({
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
    <path d="M16.5 10c3.038 0 5.5 2.015 5.5 4.5c0 1.397 -.778 2.645 -2 3.47l0 2.03l-1.964 -1.178a6.649 6.649 0 0 1 -1.536 .178c-3.038 0 -5.5 -2.015 -5.5 -4.5s2.462 -4.5 5.5 -4.5z" />
    <path d="M11.197 15.698c-.69 .196 -1.43 .302 -2.197 .302a8.008 8.008 0 0 1 -2.612 -.432l-2.388 1.432v-2.801c-1.237 -1.082 -2 -2.564 -2 -4.199c0 -3.314 3.134 -6 7 -6c3.527 0 6.45 2.283 6.934 5.271" />
  </svg>
);

export const IconQQ: React.FC<IconProps> = ({ className, size = 24, width, height, ...props }) => (
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
    <path d="M12 3c-3.866 0 -7 3.134 -7 7v1c-1 2 -1.5 3.5 -.5 5c.203 .304 .5 .5 .5 .5c-.5 1.5 -.5 2.5 .5 3.5c.667 .333 1.333 .333 2 0c0 0 1.5 1 4.5 1s4.5 -1 4.5 -1c.667 .333 1.333 .333 2 0c1 -1 1 -2 .5 -3.5c0 0 .297 -.196 .5 -.5c1 -1.5 .5 -3 -.5 -5v-1c0 -3.866 -3.134 -7 -7 -7z" />
    <path d="M9 10h.01" />
    <path d="M15 10h.01" />
  </svg>
);
