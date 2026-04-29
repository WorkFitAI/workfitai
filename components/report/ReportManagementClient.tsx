"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RotateCcwIcon, Search } from "lucide-react";
import { reportService } from "@/lib/report/report-service";
import { Report } from "@/types/report";
import ReportCard from "@/components/report/ReportCard";
import Pagination from "@/components/report/Pagination";
import ReportModal from "@/components/report/ReportModal";
import { toast } from "sonner";
import { jobService } from "@/lib/job/job-service";

const ReportManagementClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const page = Number(searchParams.get("page") || 1);
  const keyword = searchParams.get("keyword") || "";
  const status = searchParams.get("status") || "";

  const [totalPages, setTotalPages] = useState(1);

  const fetchReports = async () => {
    try {
      const res = await reportService.getReports(
        keyword,
        status,
        page,
      );

      setReports(res.data.result);
      setTotalPages(res.data.meta.pages);
    } catch (err) {
      toast.error("Failed to fetch reports", {
        description: (err as Error).message,
      });
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports();
  }, [keyword, status, page]);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, value);
    else params.delete(key);

    router.push(`?${params.toString()}`);
  };

  const handleLock = async (jobId: string) => {
    try {
      await jobService.softDeleteForAdmin(jobId);
      await reportService.updateReportStatus(jobId, "RESOLVED");

      await fetchReports();
      toast.success("Job locked and report resolved");
    } catch (err) {
      toast.error("Failed to lock job", {
        description: (err as Error).message,
      });
    }
  };

  const handleChangeStatus = async (
    jobId: string,
    newStatus: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "DECLINE"
  ) => {
    try {
      await reportService.updateReportStatus(jobId, newStatus);
      await fetchReports();

      toast.success("Report status updated");
    } catch (err) {
      toast.error("Failed to update report status", {
        description: (err as Error).message,
      });
    }
  };

  return (
    <div className="p-8 bg-slate-50/40 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Report Management</h1>
          <p className="text-gray-500 text-sm">
            Monitor and handle user reports
          </p>
        </div>

        {/* Search + Filter (SYNC URL) */}
        <div className="flex gap-3 justify-between">
          <input
            placeholder="Search reports..."
            value={keyword}
            onChange={(e) => updateParams("keyword", e.target.value)}
            className="border bg-white rounded-md px-4 py-2 w-1/3"
          />
          <div className="flex gap-3">
            <select
              value={status}
              onChange={(e) => updateParams("status", e.target.value)}
              className="border bg-white rounded-md px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="PENDING">PENDING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="DECLINE">DECLINE</option>
            </select>

            {/* RESET BUTTON */}
            <button
              onClick={() => {
                router.push("/report");
              }}
              className="px-4 py-2 text-gray-600 hover:text-red-600 transition"
            >
              <RotateCcwIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard
              key={report.jobId}
              report={report}
              onView={setSelectedReport}
              onLock={handleLock}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </div>

        {/* Empty */}
        {reports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              No reports found
            </h3>
            <p className="text-slate-500">
              Try adjusting your search or filters.
            </p>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={(p) => updateParams("page", String(p))}
        />

        {/* Modal */}
        <ReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      </div>
    </div>
  );
};

export default ReportManagementClient;