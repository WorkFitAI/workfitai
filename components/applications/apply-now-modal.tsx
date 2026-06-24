"use client";

/**
 * ApplyNowModal — global application submission modal.
 *
 * Rendered once at root layout via ApplyModalProvider.
 * Fields:
 *   - email (required — auto-filled from auth context)
 *   - cvPdfFile (PDF ≤ 5 MB, required) — field name matches backend DTO
 *   - coverLetter (optional, ≤ 5000 chars)
 *
 * Content-Type is intentionally NOT set — apiClient.upload() lets the
 * browser attach the correct multipart/form-data boundary automatically.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  FileText,
  X,
  CheckCircle2,
  Briefcase,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Mail,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { applicationService } from "@/lib/application/application-service";
import { ApiError } from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_COVER_LETTER_CHARS = 5000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApplyNowModalProps {
  isOpen: boolean;
  jobId: string;
  jobTitle: string;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ApplyNowModal({
  isOpen,
  jobId,
  jobTitle,
  onClose,
}: ApplyNowModalProps) {
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLLabelElement>(null);

  // ---------------------------------------------------------------------------
  // Reset state when modal opens for a new job
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isOpen && jobId) {
      // Auto-fill email from session (user.email preferred, fallback username)
      setEmail(user?.email ?? (user?.username ? `${user.username}@gmail.com` : ""));
      setCvFile(null);
      setCoverLetter("");
      setFileError(null);
      setEmailError(null);
      setIsSubmitting(false);
      setAlreadyApplied(false);

      // Pre-check for duplicate application
      applicationService
        .checkApplied(jobId)
        .then((res) => {
          if (res.data?.applied) setAlreadyApplied(true);
        })
        .catch(() => {});
    }
  }, [isOpen, jobId, user]);

  // ---------------------------------------------------------------------------
  // File validation
  // ---------------------------------------------------------------------------
  const validateAndSetFile = useCallback((file: File | null) => {
    setFileError(null);
    if (!file) {
      setCvFile(null);
      return;
    }
    if (file.type !== "application/pdf") {
      setFileError("Only PDF files are accepted.");
      setCvFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File exceeds the ${MAX_FILE_SIZE_MB} MB limit.`);
      setCvFile(null);
      return;
    }
    setCvFile(file);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      validateAndSetFile(e.target.files?.[0] ?? null);
    },
    [validateAndSetFile],
  );

  const handleRemoveFile = useCallback(() => {
    setCvFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ---------------------------------------------------------------------------
  // Drag & drop
  // ---------------------------------------------------------------------------
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      validateAndSetFile(e.dataTransfer.files?.[0] ?? null);
    },
    [validateAndSetFile],
  );

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Client-side validation
      if (!email.trim()) {
        setEmailError("Email address is required.");
        return;
      }
      if (!cvFile) {
        setFileError("Please attach your CV (PDF) before submitting.");
        return;
      }

      setIsSubmitting(true);
      try {
        // Field names: jobId, email, cvPdfFile (matches backend @Valid DTO)
        await applicationService.submitApplication(
          jobId,
          email.trim(),
          cvFile,
          coverLetter.trim() || undefined,
        );
        toast.success("Application submitted! 🎉", {
          description: `Your application for "${jobTitle}" has been received.`,
        });
        onClose();
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 409) {
            setAlreadyApplied(true);
            toast.info("You've already applied to this job.");
          } else if (err.status === 413) {
            setFileError(`File too large. Maximum is ${MAX_FILE_SIZE_MB} MB.`);
          } else {
            toast.error(err.message || "Submission failed. Please try again.");
          }
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, cvFile, coverLetter, jobId, jobTitle, onClose],
  );

  const charPercent = Math.round(
    (coverLetter.length / MAX_COVER_LETTER_CHARS) * 100,
  );
  const charColor =
    charPercent > 90
      ? "text-red-500"
      : charPercent > 70
        ? "text-amber-500"
        : "text-gray-400";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-145 p-0 gap-0 flex flex-col max-h-[90vh]">

        {/* ── Outline Header ── */}
        <div className="bg-white px-6 pt-5 pb-4 border-b border-gray-100 rounded-lg">
          <DialogTitle className="sr-only">Apply for {jobTitle}</DialogTitle>

          <div className="flex items-center gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 shrink-0">
              <Briefcase className="w-5 h-5 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-blue-500 text-xs font-medium tracking-wide uppercase">
                Job Application
              </p>
              <h2 className="text-gray-900 font-semibold text-lg leading-tight mt-0.5 line-clamp-2 max-w-85">
                {jobTitle}
              </h2>
            </div>
          </div>

          {/* Step progress dots */}
          {!alreadyApplied && (
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${email.trim() ? "bg-blue-500" : "bg-gray-200"}`}
                />
                <span className={`text-xs transition-colors ${email.trim() ? "text-blue-600 font-medium" : "text-gray-400"}`}>Email</span>
              </div>
              <ArrowRight className="w-3 h-3 text-gray-300" />
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${cvFile ? "bg-blue-500" : "bg-gray-200"}`}
                />
                <span className={`text-xs transition-colors ${cvFile ? "text-blue-600 font-medium" : "text-gray-400"}`}>CV / Resume</span>
              </div>
              <ArrowRight className="w-3 h-3 text-gray-300" />
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${coverLetter.length > 0 ? "bg-blue-500" : "bg-gray-200"}`}
                />
                <span className={`text-xs transition-colors ${coverLetter.length > 0 ? "text-blue-600 font-medium" : "text-gray-400"}`}>Cover Letter</span>
              </div>
              <ArrowRight className="w-3 h-3 text-gray-300" />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-200" />
                <span className="text-xs text-gray-400">Submit</span>
              </div>
            </div>
          )}
        </div>


        {/* ── Body (scrollable so a tall cover letter doesn't overflow) ── */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {alreadyApplied ? (
            /* Already-applied state */
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="bg-green-50 rounded-full p-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <p className="text-gray-800 font-semibold text-lg">
                  Already Applied
                </p>
                <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
                  You&apos;ve already submitted an application for this
                  position. Track your progress in{" "}
                  <Link
                    href="/applied-jobs"
                    className="text-blue-600 hover:underline font-medium"
                    onClick={onClose}
                  >
                    My Applied Jobs
                  </Link>
                  .
                </p>
              </div>
              <Button
                variant="outline"
                onClick={onClose}
                className="mt-1 px-6"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ── Email ── */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="apply-email"
                  className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  Email
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="apply-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  className={`rounded-xl text-sm ${emailError ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-blue-300"}`}
                  required
                />
                {emailError && (
                  <div className="flex items-center gap-1.5 text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <p className="text-sm">{emailError}</p>
                  </div>
                )}
              </div>

              {/* ── CV Upload ── */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  CV / Resume
                  <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-1 text-xs">
                    PDF only · max {MAX_FILE_SIZE_MB} MB
                  </span>
                </Label>

                <p className="flex items-start gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-400" />
                  For accurate AI matching, upload a CV using the Harvard formal resume template
                  with complete sections (education, experience, skills).
                </p>

                {cvFile ? (
                  /* Selected file card */
                  <div className="flex items-center gap-3 px-4 py-3 border border-green-200 bg-green-50 rounded-xl">
                    <div className="bg-green-100 rounded-lg p-2 shrink-0">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-800 truncate">
                        {cvFile.name}
                      </p>
                      <p className="text-xs text-green-600 mt-0.5">
                        {formatFileSize(cvFile.size)} · PDF
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Drop zone */
                  <label
                    ref={dropZoneRef}
                    htmlFor="cv-upload"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={[
                      "flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-7 cursor-pointer",
                      "transition-all duration-200",
                      isDragging
                        ? "border-blue-400 bg-blue-50 scale-[1.01]"
                        : fileError
                          ? "border-red-300 bg-red-50/50 hover:border-red-400"
                          : "border-gray-200 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30",
                    ].join(" ")}
                  >
                    <div
                      className={`rounded-full p-3 ${isDragging ? "bg-blue-100" : fileError ? "bg-red-100" : "bg-gray-100"} transition-colors`}
                    >
                      {fileError ? (
                        <AlertCircle className="w-6 h-6 text-red-500" />
                      ) : (
                        <Upload
                          className={`w-6 h-6 ${isDragging ? "text-blue-500" : "text-gray-400"} transition-colors`}
                        />
                      )}
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-sm font-medium ${isDragging ? "text-blue-600" : fileError ? "text-red-600" : "text-gray-600"}`}
                      >
                        {isDragging
                          ? "Drop your CV here"
                          : "Click to upload or drag & drop"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        PDF · Maximum {MAX_FILE_SIZE_MB} MB
                      </p>
                    </div>
                  </label>
                )}

                <input
                  id="cv-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={handleFileChange}
                />

                {fileError && (
                  <div className="flex items-center gap-1.5 text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <p className="text-sm">{fileError}</p>
                  </div>
                )}
              </div>

              {/* ── Cover Letter ── */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="cover-letter"
                  className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Cover Letter
                  <span className="text-gray-400 font-normal text-xs">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="cover-letter"
                  placeholder="Tell the hiring team why you're a great fit for this role…&#10;&#10;Tip: mention your key achievements, relevant experience, and why this role excites you."
                  rows={6}
                  maxLength={MAX_COVER_LETTER_CHARS}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="resize-y rounded-xl border-gray-200 focus:border-blue-300 text-sm placeholder:text-gray-400 leading-relaxed min-h-35 max-h-100 w-full"
                />
                {/* Char counter — below textarea, no longer overlapping resize handle */}
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">
                    Describe your motivation and relevant experience
                  </p>
                  <span className={`text-xs ${charColor} tabular-nums transition-colors shrink-0`}>
                    {coverLetter.length}/{MAX_COVER_LETTER_CHARS}
                  </span>
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !cvFile || !email.trim()}
                  className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-36 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
