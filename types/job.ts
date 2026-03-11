import { Company } from "@/types/company";

export interface Job {
  postId: string;
  title: string;
  shortDescription: string;
  company: Company;
  employmentType: string;
  experienceLevel: string;
  createdDate: Date;
  skillNames: string[];
  salaryMin: number;
  salaryMax: number;
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

export interface JobResponse {
  status: number;
  message: string;
  data: JobData;
}