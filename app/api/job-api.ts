import { JobResponse } from "@/types/job";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9085";

type GetJobsParams = {
  page?: number;
  pageSize?: number;
  sort?: string;
  filter?: string;
};

export const getJobs = async ({
  page = 1,
  pageSize = 12,
  sort = "desc",
  filter,
}: GetJobsParams): Promise<JobResponse> => {
  const params = new URLSearchParams();

  params.append("page", String(page - 1));
  params.append("size", String(pageSize));
  params.append("sort", sort);

  if (filter) {
    params.append("filter", filter);
  }

  const res = await fetch(`${API_BASE}/job/public/jobs?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return res.json();
};