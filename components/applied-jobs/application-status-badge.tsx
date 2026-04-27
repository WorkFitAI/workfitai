import { ApplicationStatus } from "@/types/application";
import { cn } from "@/lib/utils";

interface Props {
  status: ApplicationStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  APPLIED: {
    label: "Applied",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  REVIEWING: {
    label: "Reviewing",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  INTERVIEW: {
    label: "Interview",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  OFFER: {
    label: "Offer Received",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  HIRED: {
    label: "Hired 🎉",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-600 border-red-200",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

export default function ApplicationStatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["APPLIED"];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
