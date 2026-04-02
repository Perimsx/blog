import type React from "react";

interface CalloutProps {
  eyebrow?: string;
  title?: string;
  desc?: string;
  accent?: "amber" | "emerald" | "sky" | "violet" | "rose" | "slate" | "default";
  children?: React.ReactNode;
}

const accentStyles: Record<string, string> = {
  amber: "border-amber-500/20 bg-amber-500/8 text-amber-700 dark:text-amber-300",
  emerald: "border-emerald-500/20 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300",
  sky: "border-sky-500/20 bg-sky-500/8 text-sky-700 dark:text-sky-300",
  violet: "border-violet-500/20 bg-violet-500/8 text-violet-700 dark:text-violet-300",
  rose: "border-rose-500/20 bg-rose-500/8 text-rose-700 dark:text-rose-300",
  slate: "border-slate-500/20 bg-slate-500/8 text-slate-700 dark:text-slate-300",
  default: "border-border/70 bg-background/88 text-foreground/45",
};

export const Callout: React.FC<CalloutProps> = ({
  eyebrow,
  title,
  desc,
  accent = "default",
  children,
}) => {
  const currentAccent = accentStyles[accent] || accentStyles.default;
  const eyebrowColor = accent === "default" ? "text-foreground/45" : currentAccent.split(" ")[2];

  return (
    <div
      className={[
        "rounded-xl border px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm my-2 sm:my-3",
        currentAccent,
      ].join(" ")}
    >
      {eyebrow && (
        <p
          className={["text-[11px] font-semibold uppercase tracking-[0.22em]", eyebrowColor].join(
            " "
          )}
        >
          {eyebrow}
        </p>
      )}
      {title && (
        <p className={`text-base font-semibold text-foreground ${eyebrow ? "mt-1.5" : ""}`}>
          {title}
        </p>
      )}
      {desc && <p className="mt-1 text-sm leading-6 text-foreground/72">{desc}</p>}
      <div className="callout-content opacity-90 mt-1">{children}</div>
    </div>
  );
};
