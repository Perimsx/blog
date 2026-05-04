import type React from "react";

interface HrProps {
  noPadding?: boolean;
}

export const Hr: React.FC<HrProps> = ({ noPadding = false }) => (
  <div className={["layout-frame", noPadding ? "px-0" : ""].join(" ")}>
    <hr className="m-0 border-border" aria-hidden />
  </div>
);
