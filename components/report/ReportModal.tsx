import { X } from "lucide-react";
import { Report } from "@/types/report";

interface Props {
  report: Report | null;
  onClose: () => void;
}

export default function ReportModal({ report, onClose }: Props) {
  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[600px] max-h-[80vh] overflow-y-auto rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Report Details</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="text-sm text-gray-500">
          Company: {report.companyName}
        </div>

        <div className="space-y-3">
          {report.reports.map((r) => (
            <div key={r.reportId} className="border rounded-xl p-3 space-y-1">
              <div className="text-sm font-medium">{r.reportContent}</div>

              <div className="text-xs text-gray-500">
                By: {r.createdBy}
              </div>

              <div className="text-xs text-gray-400">
                Dated: {new Date(r.createdDate).toLocaleDateString()}
              </div>

              {r.imageUrls?.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {r.imageUrls.map((img, i) => (
                    <img
                      key={i}
                      src={img || "/placeholder.png"}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}