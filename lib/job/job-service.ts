import { GetJobsParams, Job, JobData, JobDetail } from "@/types/job";
import { ApiResponse } from "@/types/response";
import { apiClient } from "@/lib/api-client";
import { SkillResponse } from "@/types/skill";
import { JobFormValues } from "../schemas/job-schemas";

export const jobService = {
  async getJobs({
    page = 1,
    pageSize = 12,
    sort = "desc",
    filter,
    role,
  }: GetJobsParams): Promise<ApiResponse<JobData>> {
    const params = new URLSearchParams();

    params.append("page", String(page - 1));
    params.append("size", String(pageSize));
    params.append("sort", sort);

    if (filter) {
      params.append("filter", filter);
    }

    const endpoint = role === 'hr' ? `/job/hr/jobs?${params.toString()}` : `/job/public/jobs?${params.toString()}`;
    const res = await apiClient.get(endpoint) as ApiResponse<JobData>;

    if (!res.status || res.status >= 400) {
      throw new Error("Failed to fetch jobs");
    }

    return res;
  },

  async getAllSkills(): Promise<ApiResponse<SkillResponse>> {
    const res = await apiClient.get(`/job/public/skills`) as ApiResponse<SkillResponse>;
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

  async softDelete(id: string, newStatus: string): Promise<void> {
    const res = await apiClient.put(`/job/hr/jobs/${id}/${newStatus}`) as ApiResponse<null>;
    if (!res.status || res.status >= 400) {
      throw new Error("Failed to update job status");
    }
  },
}