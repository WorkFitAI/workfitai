import { Job } from "@/types/job";
import { Company } from "@/types/company";

export const mockCompany: Company = {
  companyNo: "COMP-001",
  name: "Tech Corp",
  description: "A leading technology company specialized in AI and Web.",
  address: "123 Innovation Street, Hanoi",
  websiteUrl: "https://techcorp.com",
  logoUrl: "/images/logos/techcorp.png",
  size: 500,
};

export const mockJobs: Job[] = [
  {
    postId: "job-001",
    title: "Frontend Developer",
    shortDescription: "Join our team to build amazing user interfaces.",
    company: mockCompany, // Sử dụng object company vừa tạo
    employmentType: "Full-time",
    experienceLevel: "Senior",
    createdDate: new Date("2024-03-15"),
    skillNames: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    salaryMin: 2000,
    salaryMax: 4500,
  },
  {
    postId: "job-002",
    title: "Backend Engineer",
    shortDescription: "Build scalable APIs and microservices.",
    company: {
      ...mockCompany,
      name: "Data Systems",
      companyNo: "COMP-002"
    },
    employmentType: "Full-time",
    experienceLevel: "Middle",
    createdDate: new Date("2024-03-14"),
    skillNames: ["Node.js", "PostgreSQL", "Docker"],
    salaryMin: 2500,
    salaryMax: 5000,
  }
];

export const mockJobApiResponse = {
  data: {
    result: mockJobs,
    meta: {
      page: 1,
      pageSize: 4,
      pages: 3,
      total: 12
    },
  },
};