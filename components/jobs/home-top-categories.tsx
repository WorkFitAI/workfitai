import TopCategories from "@/components/jobs/top-categories";
import { jobService } from "@/lib/job/job-service";

export async function HomeTopCategories() {
  const categories = await jobService.getTopCategories(8);

  return <TopCategories categories={categories.data} />;
}