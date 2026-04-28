"use client";

import { useEffect, useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { useJobFilters } from "@/hooks/useJobFilters";

import { Plus, Pencil, Loader2, Briefcase, Clock, Search, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JobDialog } from "@/components/jobs/post/job-dialog";
import { toast } from "sonner";
import { Job } from "@/types/job";
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

export default function JobAdminPage() {
  const { page, pageSize, filters, buildUrl } = useJobFilters();
  const { jobs, totalPages, loading, refetch } = useJobs(
    page,
    pageSize,
    filters,
    "hr"
  );

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    editingJob: JobFormValues | null;
  }>({
    isOpen: false,
    editingJob: null,
  });

  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await jobService.getAllSkills();
        setSkills(res.data.result); 
      } catch (err) {
        console.error("Error fetching skills", err);
      }
    };
    fetchSkills();
  }, []);

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
        companyNo: detail.data.company.companyNo,
        skillNames: detail.data.skillNames.map(s => s.trim()),
        status: detail.data.status,
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

      if (dialogState.editingJob) {
        const newData = { ...data, jobId: dialogState.editingJob.postId, skillIds: skillIdsToSave };
        await jobService.updateJob(newData);
        toast.success("Updated job successfully");
      } else {        
        const newData = { ...data, skillIds: skillIdsToSave };
        await jobService.createJob(newData);
        toast.success("Created new job successfully");
      }
      setDialogState({ ...dialogState, isOpen: false });
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      refetch();
    }
  };

  const handleDelete = (id: string) => {
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
    <div className="p-8 bg-slate-50/30 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
              Job Postings
            </h1>
            <p className="text-slate-500 max-w-lg">
              Manage your career opportunities and track applicant engagement in real-time.
            </p>
          </div>
          <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 px-6 h-12 gap-2 text-md font-semibold transition-all active:scale-95">
            <Plus size={20} /> Create New Job
          </Button>
        </div>
        <JobFilterBar />

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-400 font-medium">Fetching your job posts...</p>
          </div>
        ) : (
          <div className="grid gap-6 mb-10">
            {jobs?.map((job: Job) => (
              <Card key={job.postId} className="group border-none shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 bg-white overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Status Bar (Dọc bên trái) */}
                    <div className={`w-1.5 ${job.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none'
                                : job.status === 'CLOSED'
                                ? 'bg-red-100 text-red-700 hover:bg-red-100 border-none'
                                : 'bg-slate-100 text-slate-600 border-none'}`} />
                    
                    <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors">
                            {job.title}
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

                        <div className="flex flex-wrap gap-4 pt-1">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                            <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                            {job.employmentType}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                            <Clock className="w-3.5 h-3.5 text-orange-500" />
                            Posted: {new Date(job.createdDate).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl group-hover:bg-blue-50/50 transition-colors">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-lg hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all"
                          onClick={() => handleOpenEdit(job)}
                        >
                          <Pencil size={18} />
                        </Button>

                        <div className="w-[1px] h-6 bg-slate-200 mx-1" />

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-lg hover:bg-white hover:text-red-600 hover:shadow-sm transition-all"
                          onClick={() => handleDelete(job.postId)}
                        >
                          <LockOpen size={18} />
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
                <PaginationItem>
                  <PaginationPrevious
                    href={buildUrl(page - 1)}
                    className={page === 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-100 rounded-full"}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href={buildUrl(p)}
                      isActive={p === page}
                      className={p === page ? "bg-blue-600 text-white hover:bg-blue-700 rounded-full" : "hover:bg-slate-100 rounded-full"}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href={buildUrl(page + 1)}
                    className={page === totalPages ? "pointer-events-none opacity-40" : "hover:bg-slate-100 rounded-full"}
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