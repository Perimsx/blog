import React from "react";

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
    <div className={["not-prose my-8 grid gap-4", gridCols, className].join(" ")}>
      {children}
    </div>
  );
};
