"use client";

import { useState } from "react";
import { useCVs } from "@/hooks/useCVs";
import CVList from "./cv-list";
import CVUploadDialog from "./cv-upload-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function MyCVsPageClient() {
  const [page, setPage] = useState(0);
  const { cvs, totalPages, total, loading, error, refresh } = useCVs(page);

  const handleUploaded = () => {
    // If already on page 0, useEffect won't re-fire — call refresh directly.
    // Otherwise setPage(0) triggers the useEffect which handles the fetch.
    if (page === 0) refresh();
    else setPage(0);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My CVs
          </h1>
          <p className="mt-1 text-muted-foreground">
            {loading
              ? "Loading…"
              : `${total} CV${total !== 1 ? "s" : ""} uploaded`}
          </p>
        </div>
        <CVUploadDialog onUploaded={handleUploaded} />
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* CV list */}
      <CVList cvs={cvs} loading={loading} onDeleted={refresh} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 0) setPage((p) => p - 1);
                  }}
                  className={
                    page === 0 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(p);
                    }}
                    isActive={p === page}
                  >
                    {p + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages - 1) setPage((p) => p + 1);
                  }}
                  className={
                    page === totalPages - 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
