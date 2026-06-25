import { X } from "lucide-react";
import { Report } from "@/types/report";
import { useState } from "react";

interface Props {
  report: Report | null;
  onClose: () => void;
}

export default function ReportModal({ report, onClose }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!report) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden">

        {/* HEADER (JIRA STYLE) */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Issue Detail
            </p>
            <h2 className="text-lg font-semibold text-gray-900">
              {report.snapshot.title}
            </h2>
            <p className="text-xs text-gray-500">
              {report.companyName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[42%_58%] overflow-hidden">

          {/* LEFT - ISSUE DETAILS */}
          <div className="border-r p-6 overflow-y-auto h-full space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border rounded-lg p-3">
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-medium">{report.snapshot.location}</p>
              </div>

              <div className="bg-white border rounded-lg p-3">
                <p className="text-xs text-gray-500">Salary</p>
                <p className="text-sm font-medium">
                  ${report.snapshot.salaryMin} - ${report.snapshot.salaryMax}
                </p>
              </div>
            </div>

            {/* SINGLE CONTENT CARD (QUAN TRỌNG NHẤT) */}
            <div className="bg-white border rounded-xl p-4 space-y-4">

              <div>
                <p className="text-xs text-gray-500 uppercase">Skills</p>
                <p className="text-sm text-gray-700">{report.snapshot.skills}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {report.snapshot.description}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">Requirements</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {report.snapshot.requirements}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">Benefits</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {report.snapshot.benefits}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">Responsibilities</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {report.snapshot.responsibilities}
                </p>
              </div>

            </div>
          </div>
          {/* RIGHT - REPORT THREAD */}
          <div className="p-6 overflow-y-auto bg-white">

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Activity ({report.reportCount})
              </h3>
            </div>

            <div className="space-y-6">
              {report.reports.map((r, index) => (
                <div key={r.reportId} className="relative pl-8">

                  {/* dot */}
                  <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-red-500" />

                  {/* line */}
                  {index !== report.reports.length - 1 && (
                    <div className="absolute left-[5px] top-5 w-[2px] h-full bg-slate-200" />
                  )}

                  <div className="pb-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">
                        Report #{index + 1}
                      </h4>

                      <span className="text-xs text-slate-400">
                        {new Date(r.createdDate).toLocaleString("vi-VN")}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-700">
                      {r.reportContent}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      by {r.createdBy}
                    </p>
                    
                    {r.imageUrls?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {r.imageUrls.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            className="
                              w-24 h-24
                              object-cover
                              rounded-lg
                              border
                              cursor-pointer
                              hover:scale-105
                              transition
                            "
                            onClick={(e) => setSelectedImage(img)}
                          />
                        ))}
                      </div>
                    )}

                    {selectedImage && (
                      <div
                        className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center"
                        onClick={() => setSelectedImage(null)}
                      >
                        <img
                          src={selectedImage}
                          alt=""
                          onClick={(e) => e.stopPropagation()}
                          className="
                            max-w-[90vw]
                            max-h-[90vh]
                            object-contain
                            rounded-lg
                          "
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}