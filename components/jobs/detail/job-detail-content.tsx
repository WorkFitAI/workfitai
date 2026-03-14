import { JobDetail } from "@/types/job";
import { CheckCircle } from "lucide-react";

type JobContentProps = Pick<
  JobDetail,
  | "description"
  | "requirements"
  | "responsibilities"
  | "benefits"
  | "skillNames"
>;

const JobDetailContent = ({
  description,
  requirements,
  responsibilities,
  benefits,
  skillNames,
}: JobContentProps) => {
  return (
    <div className="space-y-8">
      {/* About */}
      <div>
        <h2 className="text-lg font-semibold mb-4">About the job</h2>

        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
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

        <p className="text-gray-600 leading-relaxed">{requirements}</p>
      </div>

      {/* Responsibilities */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Responsibilities</h2>

        <p className="text-gray-600 leading-relaxed">{responsibilities}</p>
      </div>

      {/* Benefits */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Benefits</h2>

        <p className="text-gray-600 leading-relaxed">{benefits}</p>
      </div>

      <div className="flex justify-start mt-10 mx-auto gap-2">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition">
          <CheckCircle className="w-4 h-4 inline-block mr-2" />
          Apply Now
        </button>

        <button className="text-gray-500 px-6 py-3 border border-gray-500 rounded-md hover:bg-gray-100 font-medium transition">
          Save Job
        </button>
      </div>
    </div>
  );
};

export default JobDetailContent;
