import * as z from "zod";

export const jobSchema = z.object({
  title: z.string().min(5, "Tittle has to be at least 5 characters"),
  shortDescription: z.string().max(200),
  description: z.string().min(10, "Description has to be at least 10 characters"),
  employmentType: z.string(),
  experienceLevel: z.string(),
  salaryMin: z.coerce.number().min(0, "Minimum Salary is required"),
  salaryMax: z.coerce.number().min(1, "Maximum Salary is required"),
  currency: z.string().default("USD"),
  location: z.string(),
  quantity: z.number().min(1),
  expiresAt: z.date(),
  educationLevel: z.string().min(10, "Education level has to be at least 10 characters"),
  benefits: z.string().min(10, "Benefits has to be at least 10 characters"),
  requirements: z.string().min(10, "Requirements has to be at least 10 characters"),
  responsibilities: z.string().min(10, "Responsibilities has to be at least 10 characters"),
  companyNo: z.string(),
  skillNames: z.array(z.string()).default([]),
});

export type JobFormValues = z.infer<typeof jobSchema>;