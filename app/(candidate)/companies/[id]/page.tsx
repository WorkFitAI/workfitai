import CompanyDetail from "@/components/companies/company-detail";
import FeaturedJobs from "@/components/jobs/featured-jobs";
import { companyService } from "@/lib/company/company-service";
import { Company } from "@/types/company";
import { cookies } from "next/headers";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CompanyDetailPage({ params }: Props) {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get("auth_session")?.value;

  const canEdit = !!cookieValue;
  const { id } = await params;

  let company: Company | null = null;

  try {
    const res = await companyService.getCompanyById(id);
    company = res.data;
  } catch (error) {
    console.error("Error fetching company details", error);
  }
  
  if (!company) {
    return (
      <div className="text-center py-20">
        <div className="w-full overflow-hidden rounded-xl mb-6">
          Company not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1320px] mx-auto px-4 pb-10">
        <CompanyDetail company={company} canEdit={canEdit} />
        <FeaturedJobs />
      </div>
    </div>
  );
}
