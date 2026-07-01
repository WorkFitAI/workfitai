import Image from "next/image";
import { Globe, Pin, UserRoundPlus, Users } from "lucide-react";

import { Company } from "@/types/company";

import JobLocationMap from "@/components/jobs/detail/job-location-map";
import Link from "next/link";

interface CompanyCardProps {
  company: Company;
  quantity: number;
  totalApplications: number;
}

const CompanyCard = ({
  company,
  quantity,
  totalApplications,
}: CompanyCardProps) => {
  return (
    <div className="border rounded-xl p-6 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Image
          src={company.logoUrl || "/placeholder-logo.png"}
          alt="Company"
          width={50}
          height={50}
          className="rounded"
        />

        <div>
          <h3 className="font-semibold text-gray-900">{company.name}</h3>
          <p className="text-sm text-gray-500">{company.description}</p>
        </div>
      </div>

      <div className="text-sm text-gray-600 space-y-2">
        <div className="flex items-center gap-2">
          <Pin size={13} />
          <span>{company.address}</span>
        </div>

        <div className="flex items-center gap-2">
          <Users size={13} />
          <span>{company.size} employees</span>
        </div>

        <div className="flex items-center gap-2">
          <Globe size={13} />
          <span>{company.websiteUrl}</span>
        </div>

        <div className="flex items-center gap-2">
          <UserRoundPlus size={13} />
          <span>
            {totalApplications} / {quantity} applications
          </span>
        </div>
      </div>

      
      <Link
        href={`/companies/${company.companyNo}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 w-full block text-center border rounded-lg py-2 hover:bg-gray-100 active:scale-[0.99] transition"
      >
        View Company
      </Link>

      <JobLocationMap address={company?.address || ""} />
    </div>
  );
};

export default CompanyCard;
