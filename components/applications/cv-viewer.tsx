"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { AlertCircle, Download } from "lucide-react";
import { applicationService } from "@/lib/application/application-service";
import { cvService } from "@/lib/cv/cv-service";
import { LottieLoader } from "@/components/ui/lottie-loader";

const CvPdfHighlightViewer = dynamic(() => import("@/components/applications/cv-pdf-highlight-viewer"), {
  ssr: false,
});

interface CvViewerProps {
  /** Use for CVs linked to an application (HRM panel, applied-jobs detail). */
  applicationId?: string;
  /** Use for self-uploaded CVs on the My CVs page. */
  objectName?: string;
  fileName?: string;
  /** AI-matched terms to highlight in the rendered PDF (HRM ranking panel only). */
  highlightTerms?: string[];
}

export function CvViewer({ applicationId, objectName, fileName, highlightTerms }: CvViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!applicationId && !objectName) return;

    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);
    setBlobUrl(null);
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }

    const fetchBlob = applicationId
      ? applicationService.fetchCvBlobUrl(applicationId)
      : cvService.fetchCvBlobUrl(objectName!);

    fetchBlob
      .then((url) => {
        if (cancelled) { URL.revokeObjectURL(url); return; }
        urlRef.current = url;
        setBlobUrl(url);
      })
      .catch(() => { if (!cancelled) setPreviewError("Failed to load CV preview."); })
      .finally(() => { if (!cancelled) setPreviewLoading(false); });

    return () => {
      cancelled = true;
      if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }
    };
  }, [applicationId, objectName]);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      if (applicationId) {
        await applicationService.downloadCv(applicationId, fileName);
      } else if (objectName) {
        await cvService.downloadCvByObjectName(objectName, fileName);
      }
    } catch {
      setDownloadError("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-3">
      {/* Download trigger */}
      <div className="flex items-center gap-3 flex-wrap shrink-0">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <Download className="h-4 w-4 text-blue-500" />
          {downloading ? "Downloading…" : fileName || "Download CV"}
        </button>
        {downloadError && (
          <span className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {downloadError}
          </span>
        )}
      </div>

      {/* Inline PDF preview — fills remaining height */}
      {previewLoading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-sm text-gray-400">
          <LottieLoader size={80} />
          Loading preview…
        </div>
      )}
      {previewError && !previewLoading && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {previewError}
        </div>
      )}
      {blobUrl && !previewError && highlightTerms && highlightTerms.length > 0 && (
        <div className="flex-1 min-h-0">
          <CvPdfHighlightViewer key={blobUrl} blobUrl={blobUrl} highlightTerms={highlightTerms} />
        </div>
      )}
      {blobUrl && !previewError && (!highlightTerms || highlightTerms.length === 0) && (
        <div className="flex-1 min-h-0 rounded-xl border border-gray-200 overflow-hidden">
          <iframe
            src={blobUrl}
            title="CV Preview"
            className="w-full h-full"
            style={{ border: "none" }}
          />
        </div>
      )}
    </div>
  );
}
