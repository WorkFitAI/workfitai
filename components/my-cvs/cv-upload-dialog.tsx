"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cvService } from "@/lib/cv/cv-service";
import { formatFileSize } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface Props {
  onUploaded: () => void;
}

export default function CVUploadDialog({ onUploaded }: Props) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string | null => {
    if (f.type !== "application/pdf") return "Only PDF files are accepted.";
    if (f.size > MAX_SIZE_BYTES) return "File must be under 5 MB.";
    return null;
  };

  const handleFileSelect = (f: File) => {
    const err = validateFile(f);
    setFileError(err);
    setFile(err ? null : f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await cvService.uploadCV(file);
      toast.success("CV uploaded successfully.");
      setOpen(false);
      setFile(null);
      onUploaded();
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setFileError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetDialog();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload CV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload CV</DialogTitle>
        </DialogHeader>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "mt-2 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors",
            file
              ? "border-primary/40 bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-muted/50",
          )}
        >
          {file ? (
            <>
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="font-medium text-sm text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setFileError(null);
                }}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Drop PDF here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  PDF only · max 5 MB
                </p>
              </div>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
            e.target.value = "";
          }}
        />

        {fileError && (
          <p className="text-xs text-destructive">{fileError}</p>
        )}

        <div className="flex gap-3 justify-end mt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
