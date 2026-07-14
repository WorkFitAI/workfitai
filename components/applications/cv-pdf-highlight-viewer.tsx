"use client";

import { useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { LottieLoader } from "@/components/ui/lottie-loader";
import { matchHighlightSegments, expandCommaTerms } from "@/lib/cv/highlight-matcher";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface CvPdfHighlightViewerProps {
  blobUrl: string;
  highlightTerms: string[];
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderHighlightedHtml(text: string, terms: string[]): string {
  const segments = matchHighlightSegments(text, terms);
  const hasMatch = segments.some((seg) => seg.matched);

  if (!hasMatch) return escapeHtml(text);

  return `<mark class="rounded-sm bg-yellow-200 px-0.5">${escapeHtml(text)}</mark>`;
}

export default function CvPdfHighlightViewer({ blobUrl, highlightTerms }: CvPdfHighlightViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [highlightOn, setHighlightOn] = useState(true);

  const expandedTerms = useMemo(() => expandCommaTerms(highlightTerms), [highlightTerms]);

  const uniqueTermCount = useMemo(
    () => new Set(expandedTerms.map((t) => t.toLowerCase())).size,
    [expandedTerms],
  );

  return (
    <div className="flex flex-col h-full min-h-0 gap-2">
      {uniqueTermCount > 0 && (
        <div className="flex items-center justify-between shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
          <span>
            Highlighting {uniqueTermCount} matched term{uniqueTermCount !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setHighlightOn((v) => !v)}
            className="rounded px-2 py-1 font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            {highlightOn ? "Hide highlights" : "Show highlights"}
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-gray-200 bg-gray-50 flex items-start justify-center">
        {loadError ? (
          <div className="flex items-center gap-2 text-sm text-red-600 p-6">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {loadError}
          </div>
        ) : (
          <Document
            file={blobUrl}
            onLoadSuccess={({ numPages: n }) => setNumPages(n)}
            onLoadError={() => setLoadError("Failed to render CV PDF.")}
            loading={
              <div className="flex flex-col items-center justify-center gap-2 p-10 text-sm text-gray-400">
                <LottieLoader size={80} />
                Loading preview…
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              renderAnnotationLayer={false}
              customTextRenderer={
                highlightOn && expandedTerms.length > 0
                  ? ({ str }) => renderHighlightedHtml(str, expandedTerms)
                  : undefined
              }
            />
          </Document>
        )}
      </div>

      {numPages > 1 && (
        <div className="flex items-center justify-center gap-3 shrink-0 text-xs text-gray-500">
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="rounded p-1 hover:bg-gray-100 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="rounded p-1 hover:bg-gray-100 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
