import { formatSalary } from "@/lib/utils";
import { JobDetailOverviewProps } from "@/types/job";
import {
  GraduationCap,
  Network,
  CircleDollarSign,
  Clock10,
  MapPin,
  HandCoins,
  Layers2,
} from "lucide-react";

const JobDetailOverview = (props: JobDetailOverviewProps) => {
  const {
    experienceLevel,
    salaryMin,
    salaryMax,
    currency,
    location,
    requiredExperience,
    educationLevel,
    expiresAt,
    jobCategoryName,
  } = props;
  return (
    <div className="border rounded-xl p-6 mb-8">
      <h2 className="text-lg font-semibold mb-6">Employment Information</h2>

      <div className="grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="text-gray-500 flex items-center gap-1">
            <GraduationCap size={14} />
            Education
          </p>
          <p className="font-medium">{educationLevel}</p>
        </div>

        <div>
          <p className="text-gray-500 flex items-center gap-1">
            <Network size={14} />
            Job level
          </p>
          <p className="font-medium">{experienceLevel}</p>
        </div>

        <div>
          <p className="text-gray-500 flex items-center gap-1">
            <CircleDollarSign size={14} />
            Salary
          </p>
          <p className="font-medium">
            {currency === "USD"
              ? `$${formatSalary(salaryMin)} - $${formatSalary(salaryMax)}`
              : `${formatSalary(salaryMin)} - ${formatSalary(salaryMax)}`}
          </p>
        </div>

        <div>
          <p className="text-gray-500 flex items-center gap-1">
            <Layers2 size={14} />
            Job Category
          </p>
          <p className="font-medium">{jobCategoryName}</p>
        </div>

        <div>
          <p className="text-gray-500 flex items-center gap-1">
            <HandCoins size={14} />
            Experience
          </p>
          <p className="font-medium">{requiredExperience}</p>
        </div>

        <div>
          <p className="text-gray-500 flex items-center gap-1">
            <Clock10 size={14} />
            Deadline
          </p>
          <p className="font-medium">
            {new Date(expiresAt).toLocaleDateString("vi-VN")}
          </p>
        </div>

        <div>
          <p className="text-gray-500 flex items-center gap-1">
            <MapPin size={14} />
            Location
          </p>
          <p className="font-medium">{location}</p>
        </div>
      </div>
    </div>
  );
};

export default JobDetailOverview;
