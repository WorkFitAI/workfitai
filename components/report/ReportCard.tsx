import { Eye, Lock, MousePointerClick } from "lucide-react";
import Link from "next/link";
import { Report } from "@/types/report";

interface Props {
  report: Report;
  onView: (report: Report) => void;
  onLock: (jobId: string) => void;
  onChangeStatus: (jobId: string, status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "DECLINE") => void;
}

const getStatusColor = (status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "DECLINE") => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-600";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-600";
    case "RESOLVED":
      return "bg-green-100 text-green-600";
    case "DECLINE":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function ReportCard({
  report,
  onView,
  onLock,
  onChangeStatus,
}: Props) {
  const isClosed = report.status === "RESOLVED";

  return (
    <div className="flex justify-between items-center p-6 bg-white border rounded-2xl shadow-sm hover:shadow-md transition">
      {/* LEFT */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-lg">
            {report.companyName} - {report.reportCount} reports
          </h2>

          <span
            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
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
            className="text-sm text-gray-500 hover:text-blue-500 flex items-center gap-1"
          >
            <MousePointerClick size={16} />
            View Job Post
          </Link>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex gap-3 items-center">
        {/* View */}
        <button
          onClick={() => onView(report)}
          className="p-2 rounded-md border hover:bg-gray-100"
        >
          <Eye size={18} />
        </button>

        {/* Change status */}
        <select
          value={report.status}
          disabled={isClosed || report.isDeleted}
          onChange={(e) =>
            onChangeStatus(report.jobId, e.target.value as "PENDING" | "IN_PROGRESS" | "RESOLVED" | "DECLINE")
          }
          className={`px-2 py-2 rounded-md border text-sm ${getStatusColor(
            report.status
          )} disabled:opacity-50`}
        >
          <option value="PENDING">PENDING</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="DECLINE">DECLINE</option>
        </select>

        {/* Lock */}
        <button
          disabled={isClosed || report.isDeleted}
          onClick={() => onLock(report.jobId)}
          className="p-2 rounded-md border hover:bg-red-100 text-red-600 disabled:opacity-50"
        >
          <Lock size={18} />
        </button>
      </div>
    </div>
  );
}