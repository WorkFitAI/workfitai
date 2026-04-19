"use client";

import { Briefcase, Clock } from "lucide-react";
import { formatPostedTime } from "@/lib/utils";
import ApplyNowButton from "@/components/applications/apply-now-button";

interface JobDetailHeadProps {
  jobId: string;
  title: string;
  employmentType: string;
  createdDate: string;
}

const JobDetailHead = ({
  jobId,
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
        <ApplyNowButton jobId={jobId} jobTitle={title} />
      </div>
    </div>
  );
};

export default JobDetailHead;
