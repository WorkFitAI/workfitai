import { Job, JobDetail, JobData } from "@/types/job";
import { Company } from "@/types/company";

/* =========================
   COMPANY
========================= */
export const mockCompany: Company = {
  companyNo: "COMP-001",
  name: "Tech Corp",
  description: "A leading technology company specialized in AI and Web.",
  address: "123 Innovation Street, Hanoi",
  websiteUrl: "https://techcorp.com",
  logoUrl: "/images/logos/techcorp.png",
  size: 500,
};

/* =========================
   JOB LIST
========================= */
export const mockJobs: Job[] = [
  {
    postId: "job-001",
    title: "Frontend Developer",
    shortDescription: "Join our team to build amazing user interfaces.",
    company: mockCompany,
    employmentType: "Full-time",
    experienceLevel: "Senior",
    createdDate: new Date("2024-03-15"),
    createdBy: "john.doe",
    skillNames: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    salaryMin: 2000,
    salaryMax: 4500,
    currency: "USD",
    location: "Hanoi",
    status: "PUBLISHED",
    lastModifiedDate: "2024-03-16T10:30:00Z",
    lastModifiedBy: "john.doe",
  },
  {
    postId: "job-002",
    title: "Backend Engineer",
    shortDescription: "Build scalable APIs and microservices.",
    company: {
      ...mockCompany,
      name: "Data Systems",
      companyNo: "COMP-002",
    },
    employmentType: "Full-time",
    experienceLevel: "Middle",
    createdDate: new Date("2024-03-14"),
    createdBy: "jane.smith",
    skillNames: ["Node.js", "PostgreSQL", "Docker"],
    salaryMin: 2500,
    salaryMax: 5000,
    currency: "USD",
    location: "Hanoi",
    status: "PUBLISHED",
    lastModifiedDate: "2024-03-15T14:20:00Z",
    lastModifiedBy: "jane.smith",
  },
];

/* =========================
   JOB DETAIL
========================= */
export const mockJobDetail: JobDetail = {
  postId: "job-001",

  title: "Frontend Developer",
  shortDescription: "Join our team to build amazing user interfaces.",
  description: "Full job description here...",

  company: mockCompany,
  bannerUrl: null,

  location: "Hanoi",

  employmentType: "Full-time",
  experienceLevel: "Senior",
  requiredExperience: "3+ years",
  educationLevel: "Bachelor",

  salaryMin: 2000,
  salaryMax: 4500,
  currency: "USD",

  quantity: 2,

  responsibilities: "Build UI, collaborate with team",
  requirements: "React, TypeScript",
  benefits: "Bonus, remote work",

  skillNames: ["React", "TypeScript"],

  status: "PUBLISHED",

  totalApplications: 10,

  expiresAt: new Date().toISOString(),

  createdBy: "admin",
  createdDate: new Date().toISOString(),
  lastModifiedDate: new Date().toISOString(),
};

/* =========================
   API RESPONSES
========================= */

// List API
export const mockJobApiResponse: { data: JobData } = {
  data: {
    result: mockJobs,
    meta: {
      page: 1,
      pageSize: 4,
      pages: 3,
      total: 12,
    },
  },
};

// Detail API
export const mockJobDetailResponse = {
  data: mockJobDetail,
};

/* =========================
   FACTORY (ADVANCED - TEST)
========================= */

// tạo job nhanh
export const createMockJob = (override: Partial<Job> = {}): Job => ({
  postId: "job-001",
  title: "Frontend Developer",
  shortDescription: "Join our team",
  company: mockCompany,
  employmentType: "Full-time",
  experienceLevel: "Senior",
  createdDate: new Date(),
  createdBy: "admin",
  skillNames: ["React"],
  salaryMin: 2000,
  salaryMax: 4000,
  currency: "USD",
  location: "Hanoi",
  status: "PUBLISHED",
  lastModifiedDate: new Date().toISOString(),
  lastModifiedBy: "admin",
  ...override,
});

// tạo job detail nhanh
export const createMockJobDetail = (
  override: Partial<JobDetail> = {}
): JobDetail => ({
  ...mockJobDetail,
  ...override,
});