import type React from "react";

type IconProps = {
  className?: string;
};

export const CommentIconMessage: React.FC<IconProps> = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 18.25H5.75A2.75 2.75 0 0 1 3 15.5v-8A2.75 2.75 0 0 1 5.75 4.75h12.5A2.75 2.75 0 0 1 21 7.5v8a2.75 2.75 0 0 1-2.75 2.75H11.8L8.15 21.2a.75.75 0 0 1-1.15-.63v-2.32Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    />
  </svg>
);

export const CommentIconReply: React.FC<IconProps> = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 8 4.75 12 9 16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    />
    <path
      d="M5.25 12H13a6.75 6.75 0 0 1 6.75 6.75"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    />
  </svg>
);

export const CommentIconGlobe: React.FC<IconProps> = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.75" />
    <path
      d="M3.9 12h16.2M12 3.75c2.3 2.15 3.6 5.08 3.6 8.25S14.3 18.1 12 20.25M12 3.75C9.7 5.9 8.4 8.83 8.4 12S9.7 18.1 12 20.25"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    />
  </svg>
);

export const CommentIconBrowser: React.FC<IconProps> = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      height="15.5"
      rx="2.5"
      stroke="currentColor"
      strokeWidth="1.75"
      width="18"
      x="3"
      y="4.25"
    />
    <path
      d="M3.75 8.75h16.5M7.25 6.5h.01M10.5 6.5h.01"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    />
  </svg>
);

export const CommentIconDevice: React.FC<IconProps> = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      height="11.5"
      rx="2.5"
      stroke="currentColor"
      strokeWidth="1.75"
      width="15.5"
      x="4.25"
      y="4.25"
    />
    <path
      d="M9 19.25h6M12 15.75v3.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    />
  </svg>
);

export const CommentIconSmile: React.FC<IconProps> = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.75" />
    <path
      d="M9 14.25a3.75 3.75 0 0 0 6 0M9.25 10h.01M14.75 10h.01"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    />
  </svg>
);
