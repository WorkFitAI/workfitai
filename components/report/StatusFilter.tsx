import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
  status?: string;
  updateParams: (key: string, value: string) => void;
};

const statusOptions = [
  { value: "", label: "All statuses", color: "bg-gray-100 text-gray-600" },
  { value: "PENDING", label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  { value: "IN_PROGRESS", label: "In progress", color: "bg-blue-100 text-blue-700" },
  { value: "RESOLVED", label: "Resolved", color: "bg-green-100 text-green-700" },
  { value: "DECLINE", label: "Declined", color: "bg-red-100 text-red-700" },
];

export default function StatusFilter({ status, updateParams }: Props) {
  const [open, setOpen] = useState(false);

  const selected = statusOptions.find((s) => s.value === status) || statusOptions[0];

  return (
    <div className="relative w-52">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm
                   hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${selected.color}`}>
          {selected.label}
        </span>

        <span className="text-gray-400"><ChevronDown className="h-4 w-4" /></span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {statusOptions.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                updateParams("status", opt.value);
                setOpen(false);
              }}
              className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-gray-50"
            >
              <span>{opt.label}</span>

              <span className={`px-2 py-0.5 rounded-md text-xs ${opt.color}`}>
                {opt.value === status && "Selected"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}