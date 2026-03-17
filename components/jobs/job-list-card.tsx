import Image from "next/image";
import { useRouter } from "next/navigation";

import { Briefcase, MapPin, Clock } from "lucide-react";
import { Job } from "@/types/job";

interface Props {
  job: Job;
}

const JobListCard = ({ job }: Props) => {
  const router = useRouter();

  return (
    <div className="bg-white border rounded-xl p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => router.push(`/jobs/${job.postId}`)}>
      {/* Top */}
      <div className="flex justify-between items-start ">
        <div className="flex gap-3 items-center">
          {/* Logo */}
          <Image
            src={job.company.logoUrl}
            alt="company logo"
            width={48}
            height={48}
            className="rounded-lg object-cover"
          />

          <div>
            <p className="font-bold text-gray-800">{job.company.name}</p>

            <p className="flex items-center text-xs text-gray-500 gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              {job.company.address}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {job.skillNames.map((skill, index) => (
            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800">{job.title}</h2>

      {/* Job info */}
      <div className="flex gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Briefcase className="w-3 h-3 text-gray-400" />
          {job.employmentType}
        </span>

        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-gray-400" />
          {new Date(job.createdDate).toLocaleDateString("vn-VN")}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed">
        {job.shortDescription}
      </p>

      {/* Bottom */}
      <div className="flex justify-between items-center mt-1">
        <p className="text-blue-600 font-semibold text-md">
          ${job.salaryMin.toLocaleString("en-US")} - $
          {job.salaryMax.toLocaleString("en-US")}
        </p>

        <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm hover:bg-blue-200">
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default JobListCard;
