import { Briefcase, Clock, CheckCircle } from "lucide-react";
import { formatPostedTime } from "@/lib/utils";

interface JobDetailHeadProps {
  title: string;
  employmentType: string;
  createdDate: string;
}

const JobDetailHead = ({
  title,
  employmentType,
  createdDate,
}: JobDetailHeadProps) => {
  return (
    <div className="border-b border-gray-200 pb-6">
      <div className="flex items-center justify-between">
        {/* LEFT */}
        <div>
          <h1 className="text-[24px] font-semibold text-gray-900">{title}</h1>

          <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span>{employmentType}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatPostedTime(createdDate)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition">
          <CheckCircle className="w-4 h-4 inline-block mr-2" />
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default JobDetailHead;
