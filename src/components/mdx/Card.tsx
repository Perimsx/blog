import React from "react";

interface CardProps {
  eyebrow?: string;
  title?: string;
  desc?: string;
  accent?: "amber" | "emerald" | "sky" | "violet" | "rose" | "slate" | "default";
  children?: React.ReactNode;
}

const accentStyles: Record<string, string> = {
  amber: "border-amber-500/20 bg-amber-500/8 text-amber-900/90 dark:text-amber-200/90",
  emerald: "border-emerald-500/20 bg-emerald-500/8 text-emerald-900/90 dark:text-emerald-200/90",
  sky: "border-sky-500/20 bg-sky-500/8 text-sky-900/90 dark:text-sky-200/90",
  violet: "border-violet-500/20 bg-violet-500/8 text-violet-900/90 dark:text-violet-200/90",
  rose: "border-rose-500/20 bg-rose-500/8 text-rose-900/90 dark:text-rose-200/90",
  slate: "border-slate-500/20 bg-slate-500/8 text-slate-900/90 dark:text-slate-200/90",
  default: "border-border/70 bg-muted/22 text-foreground/85",
};

export const Card: React.FC<CardProps> = ({
  eyebrow,
  title,
  desc,
  accent = "default",
  children,
}) => {
  const currentAccent = accentStyles[accent] || accentStyles.default;

  return (
    <aside
      className={[
        "not-prose my-3.5 rounded-xl border px-4.5 py-3 text-[0.88rem] leading-snug shadow-sm",
        currentAccent,
      ].join(" ")}
    >
      {eyebrow && (
        <p className={`text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/45 ${title || desc || children ? 'mb-2' : ''}`}>
          {eyebrow}
        </p>
      )}
      {title && <p className={`font-bold tracking-tight text-foreground ${desc || children ? 'mb-1.5' : ''}`}>{title}</p>}
      {desc && <p className="mt-1 text-[13px] leading-relaxed text-foreground/70">{desc}</p>}
      {children && <div className="callout-content opacity-90">{children}</div>}
    </aside>
  );
};
