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
      <div className="bg-white w-full max-w-6xl max-h-[85vh] rounded-2xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Report Details</h2>
            <p className="text-sm text-gray-500">
              Company: {report.companyName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6">
          {/* LEFT - JOB SNAPSHOT */}
          <div className="border rounded-xl bg-blue-50 p-5 max-h-[70vh] overflow-y-auto">
            <div>
              <h3 className="text-xl font-semibold">
                {report.snapshot.title}
              </h3>

              <p className="text-sm text-gray-600 mt-1">
                {report.snapshot.shortDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Location</span>
                <p>{report.snapshot.location}</p>
              </div>

              <div>
                <span className="font-medium">Salary</span>
                <p>
                  ${report.snapshot.salaryMin} - $
                  {report.snapshot.salaryMax}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-1">Skills</h4>
              <p className="text-sm text-gray-700">
                {report.snapshot.skills}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-1">Description</h4>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {report.snapshot.description}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-1">Requirements</h4>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {report.snapshot.requirements}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-1">Benefits</h4>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {report.snapshot.benefits}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-1">Responsibilities</h4>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {report.snapshot.responsibilities}
              </p>
            </div>
          </div>

          {/* RIGHT - REPORTS */}
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Reports ({report.reportCount})
              </h3>
            </div>

            <div className="space-y-4">
              {report.reports.map((r, index) => (
                <div
                  key={r.reportId}
                  className="border rounded-xl p-4 bg-white hover:shadow-sm transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">
                      Report #{index + 1}
                    </span>

                    <span className="text-xs text-gray-400">
                      {new Date(r.createdDate).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">
                    {r.reportContent}
                  </p>

                  <div className="text-xs text-gray-500 mb-2">
                    Created by: {r.createdBy}
                  </div>

                  {r.imageUrls?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {r.imageUrls.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Report ${i}`}
                          className="w-24 h-24 rounded-lg border object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}