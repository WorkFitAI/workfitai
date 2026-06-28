"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Building2, Eye, Flag, Lock, RotateCcwIcon, Search } from "lucide-react";
import { reportService } from "@/lib/report/report-service";
import { Report } from "@/types/report";
import Pagination from "@/components/report/Pagination";
import ReportModal from "@/components/report/ReportModal";
import { toast } from "sonner";
import { jobService } from "@/lib/job/job-service";
import Link from "next/link";
import StatusFilter from "./StatusFilter";
import { useDebounce } from "@/hooks/useDebounce";

const ReportManagementClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const page = Number(searchParams.get("page") || 1);
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const status = searchParams.get("status") || "";

  const [totalPages, setTotalPages] = useState(1);

  const debouncedKeyword = useDebounce(keyword, 2000);

  const statusStyles = {
    PENDING: {
      badge: "bg-yellow-100 text-yellow-600",
      active: "bg-yellow-500 text-white",
      hover: "hover:bg-yellow-50",
    },
    IN_PROGRESS: {
      badge: "bg-blue-100 text-blue-600",
      active: "bg-blue-500 text-white",
      hover: "hover:bg-blue-50",
    },
    RESOLVED: {
      badge: "bg-green-100 text-green-600",
      active: "bg-green-500 text-white",
      hover: "hover:bg-green-50",
    },
    DECLINE: {
      badge: "bg-red-100 text-red-600",
      active: "bg-red-500 text-white",
      hover: "hover:bg-red-50",
    },
  } as const;

  const getStatusStyle = (status: keyof typeof statusStyles) =>
    statusStyles[status];

  const fetchReports = useCallback(async () => {
    try {
      const res = await reportService.getReports(
        debouncedKeyword,
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
  }, [debouncedKeyword, status, page]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedKeyword) {
      params.set("keyword", debouncedKeyword);
    } else {
      params.delete("keyword");
    }

    router.replace(`?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

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
    <div className="py-8 bg-slate-50/40 min-h-screen">
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Report Management</h1>
          <p className="text-gray-500 text-sm">
            Monitor and handle user reports
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 justify-between">
          <div className="relative w-1/3">
            <div className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <Search className="w-5 h-5"/>
            </div>

            <input
              placeholder="Search reports..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
              }}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 shadow-sm
                        transition placeholder:text-gray-400
                        focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 text-ellipsis"
            />
          </div>
          <div className="flex gap-3">
            <StatusFilter status={status} updateParams={updateParams} />

            {/* RESET BUTTON */}
            <button
              onClick={() => {
                  setKeyword("");

                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("keyword");
                  params.delete("status");

                  router.replace(`?${params.toString()}`);
              }}
              className="px-2 py-2 text-gray-400 hover:text-red-600 transition"
            >
              <RotateCcwIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden bg-white border rounded-2xl">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr className="text-left text-sm text-slate-500">
                <th className="px-6 py-4">Job</th>
                <th className="px-6 py-4">Report Counts</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const isClosed = report.status === "RESOLVED";

                return (
                  <tr
                    key={report.jobId}
                    className="border-b hover:bg-slate-50"
                  >
                    {/* Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                          <Flag className="h-5 w-5 text-red-600" />
                          
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800 max-w-[300px] truncate">
                            {report.snapshot?.title || "Job Title Unavailable"}
                            <Link
                            href={`/jobs/${report.jobId}`}
                            target="_blank"
                            className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                          />
                          </p>

                          <div className="mt-1 flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            <p className="text-xs text-slate-500">
                              {report.companyName}
                            </p>
                          </div>


                        </div>
                      </div>
                    </td>

                    {/* JOB */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500">
                          {report.reportCount} reports
                      </p>
                    </td>

                    {/* CHANGE STATUS */}
                    <td className="px-6 py-4">
                      <div className="inline-flex rounded-lg border overflow-hidden">
                        {/* PROCESS */}
                        <button
                          onClick={() => handleChangeStatus(report.jobId, "IN_PROGRESS")}
                          className={`px-3 py-1 text-xs transition border-r ${
                            report.status === "IN_PROGRESS"
                              ? getStatusStyle("IN_PROGRESS").active
                              : getStatusStyle("IN_PROGRESS").hover
                          }`}
                        >
                          Process
                        </button>

                        {/* RESOLVE */}
                        <button
                          onClick={() => handleChangeStatus(report.jobId, "RESOLVED")}
                          className={`px-3 py-1 text-xs transition border-r ${
                            report.status === "RESOLVED"
                              ? getStatusStyle("RESOLVED").active
                              : getStatusStyle("RESOLVED").hover
                          }`}
                        >
                          Resolve
                        </button>

                        {/* DECLINE */}
                        <button
                          onClick={() => handleChangeStatus(report.jobId, "DECLINE")}
                          className={`px-3 py-1 text-xs transition ${
                            report.status === "DECLINE"
                              ? getStatusStyle("DECLINE").active
                              : getStatusStyle("DECLINE").hover
                          }`}
                        >
                          Decline
                        </button>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="p-2 border rounded-md hover:bg-slate-100"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          disabled={isClosed || report.isDeleted}
                          onClick={() => handleLock(report.jobId)}
                          className="p-2 border rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Lock size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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