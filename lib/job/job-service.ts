import { CreateJobCategoryRequest, GetJobsParams, Job, JobCategoriesResponse, JobCategory, JobCategoryStats, JobData, JobDetail, JobRecommendationsData } from "@/types/job";
import { ApiResponse } from "@/types/response";
import { apiClient } from "@/lib/api-client";
import { CreateSkillRequest, FetchSkillsParams, Skill, SkillResponse } from "@/types/skill";
import { JobFormValues } from "@/lib/schemas/job-schemas";

export const jobService = {
  async getJobs({
    page = 1,
    pageSize = 12,
    sort = "desc",
    filter,
    keyword,
    role,
  }: GetJobsParams): Promise<ApiResponse<JobData>> {
    const params = new URLSearchParams();

    const sortValue = sort === "asc" ? "createdDate,asc" : "createdDate,desc";

    params.append("page", String(page - 1));
    params.append("size", String(pageSize));
    params.append("sort", sortValue);

    if (filter) {
      params.append("filter", filter);
    }

    if (keyword) {
      params.append("keyword", keyword);
    }

    const endpoint = getEndpoint(role as string, params);

    const res = await apiClient.get(endpoint) as ApiResponse<JobData>;

    if (!res.status || res.status >= 400) {
      throw new Error("Failed to fetch jobs");
    }

    return res;
  },

  async getAllSkills(page = 0, size = 10, filter?: string) {
    let url = `/job/public/skills?page=${page}&size=${size}`;

    if (filter) {
      url += `&filter=name~~'${encodeURIComponent(filter)}'`;
    }

    const res = await apiClient.get(url) as ApiResponse<SkillResponse>;

    if (!res.status || res.status >= 400) {
      throw new Error("Failed to fetch skills");
    }

    return res;
  },

  async getJobById(id: string): Promise<ApiResponse<JobDetail>> {
    const res = await apiClient.get(`/job/public/jobs/${id}`) as unknown as ApiResponse<JobDetail>;
    if (!res.status || res.status >= 400) {
      throw new Error("Failed to fetch job details");
    }
    return res;
  },

  async getJobByIdFromHr(id: string): Promise<ApiResponse<JobDetail>> {
    const res = await apiClient.get(`/job/hr/jobs/${id}`) as unknown as ApiResponse<JobDetail>;
    if (!res.status || res.status >= 400) {
      throw new Error("Failed to fetch job details");
    }
    return res;
  },

  async getSimilarJobs(id: string): Promise<ApiResponse<Job[]>> {
    const res = await apiClient.get(`/job/public/jobs/similar/${id}`) as unknown as ApiResponse<Job[]>;
    if (!res.status || res.status >= 400) {
      throw new Error("Failed to fetch similar jobs");
    }
    return res;
  },

  async getFeaturedJobs(pageNumber: number, size: number): Promise<ApiResponse<JobData>> {
    const res = await apiClient.get(`/job/public/jobs/featured?page=${pageNumber - 1}&size=${size}`) as unknown as ApiResponse<JobData>;
    if (!res.status || res.status >= 400) {
      throw new Error("Failed to fetch featured jobs");
    }
    return res;
  },

  /**
   * GET /job/public/recommendations/for-me?topK={topK}
   * CANDIDATE-only: jobs ranked by similarity to the candidate's CV.
   */
  async getRecommendedJobs(topK = 10): Promise<ApiResponse<JobRecommendationsData>> {
    const res = await apiClient.get(`/job/public/recommendations/for-me?topK=${topK}`) as unknown as ApiResponse<JobRecommendationsData>;
    if (!res.status || res.status >= 400) {
      throw new Error("Failed to fetch recommended jobs");
    }
    return res;
  },

  async createJob(data: JobFormValues): Promise<void> {
    const res = await apiClient.post(`/job/hr/jobs`, data) as ApiResponse<null>;
    if (!res.status || res.status >= 400) {
      throw new Error("Failed to create job");
    }
  },

  async updateJob(data: JobFormValues): Promise<void> {
    const res = await apiClient.put(`/job/hr/jobs`, data) as ApiResponse<null>;
    console.log("Update job response:", res);
    if (!res.status || res.status >= 400) {
      throw new Error("Failed to update job");
    }
  },

  async toggleJobStatus(id: string, newStatus: string): Promise<void> {
    const res = await apiClient.put(`/job/hr/jobs/${id}/${newStatus}`) as ApiResponse<null>;
    if (!res.status || res.status >= 400) {
      throw new Error("Failed to update job status");
    }
  },

  async onClose(id: string, newStatus: string): Promise<void> {
    const res = await apiClient.put(`/job/hr/jobs/${id}/${newStatus}`) as ApiResponse<null>;
    if (!res.status || res.status >= 500) {
      throw new Error("Failed to update job status");
    }
  },

  async softDeleteForAdmin(id: string): Promise<void> {
    const res = await apiClient.delete(`/job/admin/jobs/${id}`) as ApiResponse<null>;
    if (!res.status || res.status >= 500) {
      throw new Error("Failed to delete job");
    }
  },

  async getAllCategories() {
    const res = await apiClient.get(
      "/job/public/jobs/job-categories"
    ) as ApiResponse<JobCategoriesResponse>;

    if (!res.status || res.status >= 400) {
      throw new Error("Failed to fetch categories");
    }

    return res;
  },

  async createCategory(
    data: CreateJobCategoryRequest,
  ) {
    const res = await apiClient.post(
      "/job/public/jobs/job-categories",
      data,
    ) as ApiResponse<JobCategory>;

    if (!res.status || res.status >= 400) {
      throw new Error("Failed to create category");
    }

    return res;
  },

  async createSkill(
    data: CreateSkillRequest,
  ) {
    const res = await apiClient.post(
      "/job/public/skills",
      data,
    ) as ApiResponse<Skill>;

    console.log("Create skill response:", res);

    if (!res.status || res.status >= 400) {
      throw new Error("Failed to create skill");
    }

    return res;
  },

  async getTopCategories(limit: number): Promise<ApiResponse<JobCategoryStats[]>> {
    const res = await apiClient.get(`/job/public/jobs/job-categories/statistics/top?top=${limit}`) as ApiResponse<JobCategoryStats[]>;
    if (!res.status || res.status >= 400) {
      throw new Error("Failed to fetch top categories");
    }
    return res;
  }

}

const rolePathMap: Record<string, string> = {
  admin: "/job/admin/jobs",
  hr: "/job/hr/jobs",
  "hr-manager": "/job/hr/jobs",
};

const getEndpoint = (role: string, params: URLSearchParams) => {
  const path = rolePathMap[role] || "/job/public/jobs";
  return `${path}?${params.toString()}`;
};