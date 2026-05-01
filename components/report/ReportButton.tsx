"use client";

import { useState, useRef, useEffect } from "react";
import { X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { reportService } from "@/lib/report/report-service";

interface Props {
  open: boolean;
  onClose: () => void;
  jobId: string;
}

export const ReportDialog = ({
  open,
  onClose,
  jobId,
}: Props) => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      images.forEach((file) => URL.revokeObjectURL(file as never));
    };
  }, [images]);

  if (!open) return null;

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const valid = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only images allowed");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Max 5MB per image");
        return false;
      }
      return true;
    });

    if (images.length + valid.length > 5) {
      toast.warning("Max 5 images");
      return;
    }

    setImages((prev) => [...prev, ...valid]);

    if (inputRef.current) inputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

const handleSubmit = async () => {
  if (!content.trim()) {
    toast.warning("Please describe the issue");
    return;
  }

  try {
    setLoading(true);

    await reportService.submitReport(jobId, content, images);

    toast.success("Report submitted");

    setContent("");
    setImages([]);
    onClose();
  } catch (e: unknown) {
    toast.error((e as Error)?.message || "Submit failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="w-[600px] bg-white rounded-2xl shadow-xl border">

        {/* HEADER */}
        <div className="flex justify-between items-start p-5 border-b">
          <div>
            <p className="text-xs font-semibold text-red-500 uppercase">
              Report Content
            </p>

            <div className="flex gap-2 text-sm mt-2">
              <span className="text-red-500 font-medium">● Report</span>
              <span className="text-gray-400">→ Evidence</span>
              <span className="text-gray-400">→ Submit</span>
            </div>
          </div>

          <X
            onClick={onClose}
            className="w-5 h-5 cursor-pointer text-gray-500 hover:text-black"
          />
        </div>

        {/* BODY */}
        <div className="p-5 space-y-5">

          {/* CONTENT */}
          <div>
            <label className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </label>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe the issue clearly..."
              className="mt-2 w-full h-32 p-3 rounded-xl border 
              focus:ring-2 focus:ring-red-400 outline-none resize-none"
            />

            <div className="text-xs text-gray-400 text-right">
              {content.length}/2000
            </div>
          </div>

          {/* UPLOAD */}
          <div>
            <label className="text-sm font-medium">
              Evidence (optional)
            </label>

            <input
              type="file"
              multiple
              hidden
              ref={inputRef}
              onChange={handleSelect}
            />

            <div
              onClick={() => inputRef.current?.click()}
              className="mt-2 border-2 border-dashed rounded-xl p-5 
              flex flex-col items-center justify-center text-gray-500 
              cursor-pointer hover:border-red-400 transition"
            >
              <ImagePlus className="w-6 h-6 mb-2" />
              <p className="text-sm">Upload images</p>
              <p className="text-xs text-gray-400">
                Max 5 images • 5MB each
              </p>
            </div>

            {/* Preview */}
            <div className="flex gap-2 flex-wrap mt-3">
              {images.map((file, i) => {
                const url = URL.createObjectURL(file);
                return (
                  <div key={i} className="relative">
                    <img
                      src={url}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <X
                      onClick={() => removeImage(i)}
                      className="absolute top-0 right-0 w-4 h-4 bg-white rounded-full cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 p-5 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </div>
    </div>
  );
};