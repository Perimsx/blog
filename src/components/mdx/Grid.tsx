import type React from "react";

interface GridProps {
  cols?: 2 | 3 | 4;
  className?: string;
  children?: React.ReactNode;
}

const gridColsMap: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export const Grid: React.FC<GridProps> = ({ cols = 3, className = "", children }) => {
  const gridCols = gridColsMap[cols] || gridColsMap[3];

  return (
    <div
      className={[
        "not-prose my-3 sm:my-6 grid gap-x-6 gap-y-2 sm:gap-y-3 [&>*]:my-0",
        gridCols,
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
};
