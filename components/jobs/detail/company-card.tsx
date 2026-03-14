import { Company } from "@/types/company";
import Image from "next/image";

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
        <p>📍 {company.address}</p>
        <p>👥 {company.size} employees</p>
        <p>🌐 {company.websiteUrl}</p>
      </div>

      <button className="mt-4 w-full border rounded-lg py-2 hover:bg-gray-50">
        View Company
      </button>
    </div>
  );
};

export default CompanyCard;
