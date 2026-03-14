import { JobDetail } from "@/types/job";

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
    </div>
  );
};

export default JobDetailContent;
