"use client";

import { Eye, Lock, MousePointerClick } from "lucide-react";
import Link from "next/link";
import { Report } from "@/types/report";

interface Props {
  report: Report;
  onView: (report: Report) => void;
  onLock: (jobId: string) => void;
  onChangeStatus: (
    jobId: string,
    status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "DECLINE"
  ) => void;
}

const statusStyles = {
  PENDING: {
    bar: "bg-yellow-400/50",
    badge: "bg-yellow-100 text-yellow-600",
  },
  IN_PROGRESS: {
    bar: "bg-blue-400/50",
    badge: "bg-blue-100 text-blue-600",
  },
  RESOLVED: {
    bar: "bg-green-400/50",
    badge: "bg-green-100 text-green-600",
  },
  DECLINE: {
    bar: "bg-red-400/50",
    badge: "bg-red-100 text-red-600",
  },
};

function getStatusColor(status: keyof typeof statusStyles) {
  return statusStyles[status].badge;
}

export default function ReportCard({
  report,
  onView,
  onLock,
  onChangeStatus,
}: Props) {
  const isClosed = report.status === "RESOLVED";

  return (
    <div className="relative flex justify-between items-center p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">

      {/* LEFT COLOR BAR */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-1 ${statusStyles[report.status].bar}`}
      />

      {/* LEFT CONTENT */}
      <div className="ml-3 flex-1">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-md text-slate-800">
            {report.companyName} - {report.reportCount} reports
          </h2>

          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
              report.status
            )}`}
          >
            {report.status}
          </span>
        </div>

        <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
          <Link
            href={`/jobs/${report.jobId}`}
            target="_blank"
            className="text-xs text-gray-500 hover:text-blue-500 flex items-center gap-1"
          >
            <MousePointerClick size={16} />
            View Job Post
          </Link>
        </div>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex gap-3 items-center ml-4">

        {/* VIEW */}
        <button
          onClick={() => onView(report)}
          className="p-2 rounded-md border hover:bg-gray-100 transition"
        >
          <Eye size={18} />
        </button>

        {/* STATUS */}
        <select
          value={report.status}
          disabled={isClosed || report.isDeleted}
          onChange={(e) =>
            onChangeStatus(
              report.jobId,
              e.target.value as
                | "PENDING"
                | "IN_PROGRESS"
                | "RESOLVED"
                | "DECLINE"
            )
          }
          className={`px-2 py-2 rounded-md border text-xs font-medium ${getStatusColor(
            report.status
          )} disabled:opacity-50`}
        >
          <option value="PENDING">PENDING</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="DECLINE">DECLINE</option>
        </select>

        {/* LOCK */}
        <button
          disabled={isClosed || report.isDeleted}
          onClick={() => onLock(report.jobId)}
          className="p-2 rounded-md border hover:bg-red-100 text-red-600 disabled:opacity-50 transition"
        >
          <Lock size={18} />
        </button>
      </div>
    </div>
  );
}