import * as z from "zod";

export const jobSchema = z.object({
  postId: z.string().optional(),
  title: z.string().min(5, "Tittle has to be at least 5 characters").max(120, "Title can be at most 120 characters"),
  shortDescription: z.string().min(20, "Short description has to be at least 20 characters").max(300, "Short description can be at most 300 characters"),
  description: z.string().min(20, "Description has to be at least 20 characters").max(5000, "Description can be at most 5000 characters"),
  employmentType: z.string(),
  experienceLevel: z.string(),
  salaryMin: z.coerce.number().min(0, "Minimum Salary is required"),
  salaryMax: z.coerce.number().min(1, "Maximum Salary is required"),
  currency: z.string().regex(/^[A-Z]{3}$/).default("USD"),
  location: z.string().min(5, "Location has to be at least 5 characters").max(255, "Location can be at most 255 characters"),
  quantity: z.coerce.number().min(1),
  expiresAt: z.date(),
  educationLevel: z.string().min(2, "Education level has to be at least 2 characters").max(120, "Education level can be at most 120 characters"),
  benefits: z.string().max(5000, "Benefits can be at most 5000 characters"),
  requirements: z.string().max(5000, "Requirements can be at most 5000 characters"),
  responsibilities: z.string().max(5000, "Responsibilities can be at most 5000 characters"),
  requiredExperience: z.string().min(2, "Required experience has to be at least 2 characters").max(120, "Required experience can be at most 120 characters"),
  companyNo: z.string(),
  skillNames: z.array(z.string()).default([]),
  status: z.string(),
});

export type JobFormValues = z.infer<typeof jobSchema>;