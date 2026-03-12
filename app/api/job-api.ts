import { JobData } from "@/types/job";
import { ApiResponse } from "@/types/response";
import { SkillResponse } from "@/types/skill";

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
}: GetJobsParams): Promise<ApiResponse<JobData>> => {
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

export const getAllSkills = async (): Promise<ApiResponse<SkillResponse>> => {
  const res = await fetch(`${API_BASE}/job/public/skills`);
  if (!res.ok) {
    throw new Error("Failed to fetch skills");
  }
  return res.json();
}