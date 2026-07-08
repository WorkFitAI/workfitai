"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Download, Calendar, Lock, ExternalLink, Eye, EyeOff } from "lucide-react";
import { CVMetadata } from "@/types/cv";
import { cvService } from "@/lib/cv/cv-service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import CVDeleteDialog from "./cv-delete-dialog";
import { CvViewer } from "@/components/applications/cv-viewer";

const TEMPLATE_LABELS: Record<string, string> = {
  UPLOAD: "Uploaded",
  GENERAL: "General",
  TECH: "Technical",
  CREATIVE: "Creative",
};

const TEMPLATE_COLORS: Record<string, string> = {
  UPLOAD: "bg-blue-50 text-blue-600",
  GENERAL: "bg-green-50 text-green-600",
  TECH: "bg-purple-50 text-purple-600",
  CREATIVE: "bg-orange-50 text-orange-600",
};

/** Strip leading UUID prefix to get the original upload filename. */
function extractFilename(objectName: string | null, fallback: string): string {
  if (!objectName) return fallback;
  const uuidPrefix = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i;
  return objectName.replace(uuidPrefix, "") || objectName;
}

interface Props {
  cv: CVMetadata;
  onDeleted: () => void;
}

export default function CVCard({ cv, onDeleted }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // CVs uploaded as part of a job application are view-only and cannot be deleted.
  const isApplicationCV = cv.applicationId !== null;
  const filename = extractFilename(
    cv.objectName,
    cv.headline || TEMPLATE_LABELS[cv.templateType] || "CV",
  );

  const uploadedDate = new Date(cv.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await cvService.downloadCV(cv);
    } catch {
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const canPreview = cv.objectName !== null;
  const viewerProps = cv.applicationId
    ? { applicationId: cv.applicationId }
    : { objectName: cv.objectName! };

  return (
    <div className="group bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200">
      {/* Main row */}
      <div className="flex items-center gap-5 p-5">
        {/* File icon */}
        <div className="shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="h-6 w-6 text-primary" />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{filename}</p>

          {/* Headline — only shown when not null/empty */}
          {cv.headline && (
            <p className="text-sm text-gray-700 truncate mt-0.5">{cv.headline}</p>
          )}

          {/* Summary — only shown when not null/empty */}
          {cv.summary && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {cv.summary}
            </p>
          )}

          <div className="mt-1.5 flex items-center gap-3 flex-wrap">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                TEMPLATE_COLORS[cv.templateType] ?? "bg-muted text-muted-foreground",
              )}
            >
              {TEMPLATE_LABELS[cv.templateType] ?? cv.templateType}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {uploadedDate}
            </span>
            {isApplicationCV && (
              <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                <Lock className="h-3 w-3" />
                View only
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {canPreview && (
            <button
              onClick={() => setShowPreview((v) => !v)}
              title={showPreview ? "Hide preview" : "Preview CV"}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              {showPreview ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              {showPreview ? "Hide" : "Preview"}
            </button>
          )}
          {cv.objectName && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              title="Download CV"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {downloading ? "…" : "Download"}
            </button>
          )}
          {isApplicationCV ? (
            <Link
              href={`/applied-jobs/${cv.applicationId}`}
              title="View application"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View application
            </Link>
          ) : (
            <CVDeleteDialog cvId={cv.cvId} filename={filename} onDeleted={onDeleted} />
          )}
        </div>
      </div>

      {/* Expandable PDF preview */}
      {showPreview && canPreview && (
        <div className="border-t border-border px-5 pb-5 pt-4 h-[640px] flex flex-col">
          <CvViewer {...viewerProps} fileName={filename} />
        </div>
      )}
    </div>
  );
}
