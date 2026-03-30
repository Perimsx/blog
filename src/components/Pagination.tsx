import React from "react";
import Link from "next/link";
import { IconArrowLeft, IconArrowRight } from "@/components/icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  baseUrl = "/posts",
}) => {
  if (totalPages <= 1) return null;

  const prevUrl = currentPage > 1
    ? currentPage === 2 ? `${baseUrl}/` : `${baseUrl}/${currentPage - 1}`
    : null;
  const nextUrl = currentPage < totalPages ? `${baseUrl}/${currentPage + 1}` : null;

  return (
    <nav className="mt-auto mb-8 flex items-center justify-center text-sm sm:text-base" aria-label="Pagination">
      {prevUrl ? (
        <Link
          href={prevUrl}
          className="mr-3 select-none text-[0.95rem] sm:mr-4 sm:text-base group inline-block hover:text-accent"
          aria-label="Previous"
        >
          <IconArrowLeft className="inline-block" />
          Prev
        </Link>
      ) : (
        <span className="mr-3 select-none text-[0.95rem] opacity-50 sm:mr-4 sm:text-base">
          <IconArrowLeft className="inline-block" />
          Prev
        </span>
      )}
      {currentPage} / {totalPages}
      {nextUrl ? (
        <Link
          href={nextUrl}
          className="ml-3 select-none text-[0.95rem] sm:ml-4 sm:text-base group inline-block hover:text-accent"
          aria-label="Next"
        >
          Next
          <IconArrowRight className="inline-block" />
        </Link>
      ) : (
        <span className="ml-3 select-none text-[0.95rem] opacity-50 sm:ml-4 sm:text-base">
          Next
          <IconArrowRight className="inline-block" />
        </span>
      )}
    </nav>
  );
};
