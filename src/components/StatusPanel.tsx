import React from "react";

interface StatusPanelProps {
  code?: string;
  title: string;
  description: string;
  variant?: "error" | "warning" | "info";
  compact?: boolean;
  children?: React.ReactNode;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  code,
  title,
  description,
  variant = "error",
  compact = false,
  children,
}) => {
  return (
    <div
      className={[
        "status-panel",
        `status-panel--${variant}`,
        compact ? "status-panel--compact" : "",
      ].join(" ")}
    >
      <div className="status-panel__eyebrow">
        {code && <span className="status-panel__code">{code}</span>}
        <span className="status-panel__pill">
          {variant === "error" ? "异常状态" : variant === "warning" ? "注意" : "提示"}
        </span>
      </div>
      <h1 className="status-panel__title">{title}</h1>
      <p className="status-panel__desc">{description}</p>
      <div className="status-panel__actions">{children}</div>
    </div>
  );
};
