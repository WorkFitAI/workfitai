import { Company } from "@/types/company";

export interface Job {
  postId: string;
  title: string;
  shortDescription: string;
  company: Company;
  employmentType: string;
  experienceLevel: string;
  createdDate: Date;
  createdBy: string;
  skillNames: string[];
  salaryMin: number;
  salaryMax: number;
  currency: string;
  location: string;
  status: string;
  jobCategoryName: string;
  lastModifiedDate: string;
  lastModifiedBy: string;
}

export interface JobDetail {
  postId: string;

  title: string;
  shortDescription: string;
  description: string;

  company: Company;
  bannerUrl: string | null;

  location: string;

  employmentType: string;
  experienceLevel: string;
  requiredExperience: string;
  educationLevel: string;

  salaryMin: number;
  salaryMax: number;
  currency: string;

  quantity: number;

  responsibilities: string;
  requirements: string;
  benefits: string;

  skillNames: string[];

  status: string;

  totalApplications: number;

  expiresAt: string;

  jobCategoryName: string;

  createdBy: string;
  createdDate: string;
  lastModifiedDate: string;
}

export interface JobDetailOverviewProps {
  employmentType: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  location: string;
  requiredExperience: string;
  educationLevel: string;
  expiresAt: string;
  jobCategoryName: string;
}


export interface JobContent {
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
}

export interface JobMeta {
  page: number;
  pageSize: number;
  pages: number;
  total: number;
}

export interface JobData {
  meta: JobMeta;
  result: Job[];
}

export type GetJobsParams = {
  page?: number;
  pageSize?: number;
  sort?: string;
  filter?: string;
  keyword?: string;
  role?: string;
};

// types
export interface CreateJobCategoryRequest {
  name: string;
}

export interface JobCategoriesResponse {
  result: JobCategory[];
}

export interface JobCategory {
  id: string;
  name: string;
}

export interface RecommendedJob {
  postId: string;
  title: string;
  shortDescription: string;
  employmentType: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  expiresAt: string;
  skillNames: string[];
  jobCategoryName: string;
  company: Company;
  createdDate: string;
  status: string;
  deleted: boolean;
}

export interface JobRecommendation {
  job: RecommendedJob;
  score: number;
  rank: number;
}

export interface JobRecommendationsData {
  recommendations: JobRecommendation[];
  totalResults: number;
  processingTime: string;
}

export interface JobCategoryStats {
  jobCategoryId: string;
  name: string;
  totalJobs: number;
}