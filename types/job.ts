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

  createdBy: string;
  createdDate: string;
  lastModifiedDate: string;
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
  role?: string;
};