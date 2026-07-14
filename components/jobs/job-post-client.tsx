"use client";

import { useEffect, useRef, useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { useJobFilters } from "@/hooks/useJobFilters";

import { Plus, Pencil, Briefcase, Clock, Search, LockOpen, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JobDialog } from "@/components/jobs/post/job-dialog";
import { LottieLoader } from "@/components/ui/lottie-loader";
import { toast } from "sonner";
import { Job, JobCategory } from "@/types/job";
import { JobFormValues } from "@/lib/schemas/job-schemas";
import { Badge } from "@/components/ui/badge";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skill } from "@/types/skill";
import { jobService } from "@/lib/job/job-service";
import JobFilterBar from "@/components/jobs/job-filter-bar";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function JobAdminPage({ roles, companyId }: { roles: string[]; companyId: string }) {
  const getUserType = (roles: string[]) => {
  if (roles?.includes("ROLE_ADMIN")) return "admin";
  if (roles?.includes("ROLE_HR_MANAGER")) return "hr-manager";
  if (roles?.includes("ROLE_HR")) return "hr";
  return "guest";
};

  const userType = getUserType(roles);
  const { page, pageSize, filters, buildUrl } = useJobFilters();
  const { jobs, totalPages, loading, refetch } = useJobs(
    page,
    pageSize,
    filters,
    userType
  );

  const router = useRouter();

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    editingJob: JobFormValues | null;
  }>({
    isOpen: false,
    editingJob: null,
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);

 const [hrNameToFullName, setHrNameToFullName] = useState<Record<string, string>>({});

// fetch skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await jobService.getAllSkills(0, 1000);
        setSkills(res.data.result);
      } catch (err) {
        console.error("Error fetching skills", err);
      }
    };

    fetchSkills();
  }, []);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!jobs || jobs.length === 0 || initializedRef.current) return;

    const map = Object.fromEntries(
      [...new Set(jobs.map((j) => j.createdBy))].map((name) => [name, name])
    );

    setHrNameToFullName(map);
    initializedRef.current = true;
  }, [jobs]);

    const handleOpenAdd = () => {
      setDialogState({ isOpen: true, editingJob: null });
  };

  const handleOpenEdit = async (job: Job) => {
    try {
      const detail = await jobService.getJobByIdFromHr(job.postId);
      const normalizedData: JobFormValues = {
        postId: detail.data.postId,
        title: detail.data.title,
        shortDescription: detail.data.shortDescription,
        description: detail.data.description,
        employmentType: detail.data.employmentType,
        experienceLevel: detail.data.experienceLevel,
        salaryMin: detail.data.salaryMin,
        salaryMax: detail.data.salaryMax,
        currency: detail.data.currency,
        location: detail.data.location,
        quantity: detail.data.quantity,
        expiresAt: new Date(detail.data.expiresAt),
        educationLevel: detail.data.educationLevel,
        benefits: detail.data.benefits,
        requirements: detail.data.requirements,
        responsibilities: detail.data.responsibilities,
        requiredExperience: detail.data.requiredExperience,
        companyNo: companyId,
        skillNames: detail.data.skillNames.map(s => s.trim()),
        status: detail.data.status,
        jobCategoryName: detail.data.jobCategoryName,
      };

      setDialogState({ isOpen: true, editingJob: normalizedData });
    } catch (error) {
      toast.error("Failed to fetch job details");
    }
  };

  const handleSubmit = async (data: JobFormValues) => {
    try {
      const skillIdsToSave = data.skillNames
        .map((name) => skills.find((s) => s.name === name)?.skillId)
        .filter((id): id is number => id !== undefined);

      const categoryRes = await jobService.getAllCategories();

      const category = categoryRes.data.result.find(
        (c: JobCategory) =>
          c.name.trim().toLowerCase() ===
          data.jobCategoryName.trim().toLowerCase()
      );

      if (!category) {
        toast.error("Category not found");
        return;
      }

      if (dialogState.editingJob) {
        const newData = {
          ...data,
          jobId: dialogState.editingJob.postId,
          jobCategoryId: category.id,
          companyNo: companyId,
          skillIds: skillIdsToSave,
        };

        await jobService.updateJob(newData);
        toast.success("Updated job successfully");
      } else {
        const newData = {
          ...data,
          companyNo: companyId,
          jobCategoryId: category.id,
          skillIds: skillIdsToSave,
        };

        await jobService.createJob(newData);
        toast.success("Created new job successfully");
      }

      setDialogState({
        ...dialogState,
        isOpen: false,
      });
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    if (userType === "admin") {
      try {
        await jobService.softDeleteForAdmin(id);
        toast.success("Deleted job successfully");
        return;
      } catch (error: unknown) {
        toast.error((error as Error).message);
        return;
      }
    }

    toast("Are you sure you want to delete?", {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await jobService.onClose(id, "CLOSED");
            toast.success("Deleted job successfully");
          } catch (error: unknown) {
            toast.error((error as Error).message);
          } finally {
            refetch();
          }
        },
      },
    });
  };

  return (
    <div className="bg-slate-50/30 min-h-screen">
      <div>
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              Job Postings
            </h1>
            <p className="text-slate-500 max-w-xl">
              Manage your career opportunities and track applicant engagement in real-time.
            </p>
          </div>
          {userType !== "admin" && (
            <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 px-6 h-12 gap-2 text-md font-semibold transition-all active:scale-95">
              <Plus size={20} /> Create New Job
            </Button>
          )}
        </div>
        <JobFilterBar hrNames={hrNameToFullName} />

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed">
            <LottieLoader size={140} className="mb-4" />
            <p className="text-slate-400 font-medium">Fetching your job posts...</p>
          </div>
        ) : (
          <div className="grid gap-6 mb-10">
            {jobs?.map((job: Job) => (
              <Card key={job.postId} className="group border-none shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 bg-white overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Status Bar */}
                    <div className={`w-1.5 ${job.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none'
                                : job.status === 'CLOSED'
                                ? 'bg-red-100 text-red-700 hover:bg-red-100 border-none'
                                : 'bg-slate-100 text-slate-600 border-none'}`} />
                    
                    <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-md text-slate-800 group-hover:text-blue-600 transition-colors">
                            <Link
                              href={`/jobs/${job.postId}`}
                              target="_blank"
                              className="text-gray-500 hover:text-blue-500 flex items-center gap-1"
                            >
                              {job.title}
                            </Link>
                          
                          </h3>
                          <Badge
                            variant="default"
                            className={
                              job.status === 'PUBLISHED'
                                ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none'
                                : job.status === 'CLOSED'
                                ? 'bg-red-100 text-red-700 hover:bg-red-100 border-none'
                                : 'bg-slate-100 text-slate-600 border-none'
                            }
                          >
                            {job.status}
                          </Badge>
                        </div>
                        
                        <p className="text-slate-500 text-sm line-clamp-1 max-w-xl italic">
                          {job.shortDescription}
                        </p>

                        <div className="flex flex-wrap gap-6 pt-1">
                          <p className="text-slate-500 text-sm line-clamp-1 max-w-xl italic">
                            <span className="font-semibold">Created By:</span> {job.createdBy}
                          </p>
                          <p className="text-slate-500 text-sm line-clamp-1 max-w-xl italic">
                            <span className="font-semibold">Modified By:</span> {job.lastModifiedBy}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-1">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                            <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                            {job.employmentType}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                            <Clock className="w-3.5 h-3.5 text-orange-500" />
                            Posted: {new Date(job.createdDate).toLocaleDateString("vi-VN")}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                            <Clock className="w-3.5 h-3.5 text-green-500" />
                            Modified: {new Date(job.lastModifiedDate).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl group-hover:bg-blue-50/50 transition-colors">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={userType === "admin"}
                          className="h-8 w-8 rounded-lg hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all"
                          onClick={() => handleOpenEdit(job)}
                        >
                          <Pencil size={16} />
                        </Button>

                        <div className="w-[1px] h-6 bg-slate-200 mx-1" />

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-white hover:text-red-600 hover:shadow-sm transition-all"
                          onClick={() => handleDelete(job.postId)}
                        >
                          <LockOpen size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!jobs?.length && (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div className="bg-slate-50 p-6 rounded-full mb-4">
                   <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No jobs found</h3>
                <p className="text-slate-500">Get started by creating your first job posting.</p>
              </div>
            )}
          </div>
        )}

        {/* PAGINATION SECTION */}
        {jobs && totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination className="bg-white p-2 rounded-full shadow-sm border w-fit">
              <PaginationContent>

                {/* PREVIOUS */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) {
                        router.push(buildUrl(page - 1));
                      }
                    }}
                    className={
                      page === 1
                        ? "pointer-events-none opacity-40"
                        : "hover:bg-slate-100 rounded-full cursor-pointer"
                    }
                  />
                </PaginationItem>

                {/* PAGE NUMBERS */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(buildUrl(p));
                      }}
                      isActive={p === page}
                      className={
                        p === page
                          ? "bg-blue-600 text-white hover:bg-blue-700 rounded-full cursor-pointer"
                          : "hover:bg-slate-100 rounded-full cursor-pointer"
                      }
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {/* NEXT */}
                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) {
                        router.push(buildUrl(page + 1));
                      }
                    }}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-40"
                        : "hover:bg-slate-100 rounded-full cursor-pointer"
                    }
                  />
                </PaginationItem>

              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* DIALOG COMPONENT */}
        <JobDialog
          initialData={dialogState.editingJob}
          isOpen={dialogState.isOpen}
          onOpenChange={(open) =>
            setDialogState({ ...dialogState, isOpen: open })
          }
          onSubmit={handleSubmit}
          onSuccess={refetch}
        />
      </div>
    </div>
  );
}