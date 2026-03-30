import React from "react";

interface HrProps {
  noPadding?: boolean;
}

export const Hr: React.FC<HrProps> = ({ noPadding = false }) => (
  <div className={`max-w-3xl mx-auto ${noPadding ? "px-0" : "px-4"}`}>
    <hr className="border-border" aria-hidden />
  </div>
);
