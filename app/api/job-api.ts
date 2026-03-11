import { JobResponse } from "@/types/job";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9085";

export const getJobs = async ({
  page = 0,
  size = 12,
  sort = "desc",
}): Promise<JobResponse> => {
  const res = await fetch(
    `${API_BASE}/job/public/jobs?page=${page - 1}&size=${size}&sort=${sort}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return res.json();
};