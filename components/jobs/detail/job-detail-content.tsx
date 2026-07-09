"use client";

import { JobDetail } from "@/types/job";
import ApplyNowButton from "@/components/applications/apply-now-button";
import { ReportDialog } from "@/components/report/ReportButton";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cleanText } from "@/lib/utils";

type JobContentProps = Pick<
  JobDetail,
  | "postId"
  | "title"
  | "description"
  | "requirements"
  | "responsibilities"
  | "benefits"
  | "skillNames"
>;

const JobDetailContent = ({
  postId,
  title,
  description,
  requirements,
  responsibilities,
  benefits,
  skillNames,
}: JobContentProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-8">
      {/* About */}
      <div>
        <h2 className="text-lg font-semibold mb-4 whitespace-pre-line">About the job</h2>

        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{cleanText(description)}</p>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-lg font-semibold mb-4 whitespace-pre-line">
          Essential Knowledge, Skills and Experience
        </h2>

        <ul className="list-disc pl-6 text-gray-600 space-y-2">
          {skillNames?.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
      </div>

      {/* Preferred */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Preferred Experience</h2>

        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{cleanText(requirements)}</p>
      </div>

      {/* Responsibilities */}
      <div>
        <h2 className="text-lg font-semibold mb-4 whitespace-pre-line">Responsibilities</h2>

        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{cleanText(responsibilities)}</p>
      </div>

      {/* Benefits */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Benefits</h2>

        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{cleanText(benefits)}</p>
      </div>

      <div className="flex justify-start mt-10 mx-auto gap-2">
        <ApplyNowButton jobId={postId} jobTitle={title} />

      <Button
        onClick={() => setOpen(true)}
        className="min-w-36 h-10 bg-red-50 text-red-600 border border-red-200 
        hover:bg-red-600 hover:text-white"
      >
        Report
      </Button>

      <ReportDialog
        open={open}
        onClose={() => setOpen(false)}
        jobId={postId}
      />
      </div>
    </div>
  );
};

export default JobDetailContent;
