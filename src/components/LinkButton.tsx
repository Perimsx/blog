import React from "react";
import Link from "next/link";

interface LinkButtonProps {
  id?: string;
  href: string;
  className?: string;
  ariaLabel?: string;
  title?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const LinkButton: React.FC<LinkButtonProps> = ({
  id,
  href,
  className = "",
  ariaLabel,
  title,
  disabled = false,
  children,
}) => {
  if (disabled) {
    return (
      <span
        id={id}
        className={["group inline-block", className].filter(Boolean).join(" ")}
        title={title}
        aria-disabled={disabled}
      >
        {children}
      </span>
    );
  }

  // Check if it's an external link
  const isExternal = href.startsWith("http");

  if (isExternal) {
    return (
      <a
        id={id}
        href={href}
        className={["group inline-block hover:text-accent", className].filter(Boolean).join(" ")}
        aria-label={ariaLabel}
        title={title}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      id={id}
      href={href}
      className={["group inline-block hover:text-accent", className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </Link>
  );
};
