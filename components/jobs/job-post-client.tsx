"use client";

import { useEffect, useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { useJobFilters } from "@/hooks/useJobFilters";

import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JobDialog } from "@/components/jobs/post/job-dialog";
import { toast } from "sonner";
import { Job } from "@/types/job";
import { JobFormValues } from "@/lib/schemas/job-schemas";

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
import { Briefcase, MapPin, Clock } from "lucide-react";

export default function JobAdminPage() {
  const { page, pageSize, filters, buildUrl } = useJobFilters();
  const { jobs, totalPages, loading } = useJobs(
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
        console.error("Lỗi load skills", err);
      }
    };

    fetchSkills();
  }, []);

  const handleOpenAdd = () => {
    setDialogState({
      isOpen: true,
      editingJob: null,
    });
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

      setDialogState({
        isOpen: true,
        editingJob: normalizedData,
      });

    } catch (error) {
      toast.error("Không lấy được chi tiết job");
    }
  };

  const handleSubmit = async (data: JobFormValues) => {
    try {
      if (dialogState.editingJob) {
        const skillIdsToSave = data.skillNames
        .map((name) => skills.find((s) => s.name === name)?.skillId)
        .filter((id): id is number => id !== undefined);

        const newData = { ...data, jobId: dialogState.editingJob.postId, skillIds: skillIdsToSave };

        console.log("Updating job with data:", newData);

        await jobService.updateJob(newData);
        toast.success("Đã cập nhật công việc");
      } else {        
      const skillIdsToSave = data.skillNames
        .map((name) => skills.find((s) => s.name === name)?.skillId)
        .filter((id): id is number => id !== undefined);

      const newData = { ...data, skillIds: skillIdsToSave };
        await jobService.createJob(newData);
        toast.success("Đã tạo công việc mới");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: string | number) => {
    if (confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        // await deleteJob(id);
        toast.success("Đã xóa công việc");
      } catch (error) {
        toast.error("Xóa thất bại");
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Job Post Management
          </h1>
          <p className="text-muted-foreground">
            Manage your job postings, view applications, and track performance all in one place.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus size={18} /> Add Job
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="grid gap-4 mb-8">
          {jobs?.map((job: Job) => (
            <Card key={job.postId} className="hover:shadow-md transition-shadow">
              <CardContent className="flex justify-between items-center p-6">
                <div>
                  <h3 className="font-bold text-lg text-blue-700">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {job.shortDescription}
                  </p>
                  <div className="flex gap-3 text-xs text-gray-500 mt-4">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-gray-400" />
                      {job.employmentType}
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {new Date(job.createdDate).toLocaleDateString("vn-VN")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(job)}
                  >
                    <Pencil size={18} className="text-blue-600" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(job.postId)}
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {!jobs?.length && (
            <div className="text-center py-10 border-2 border-dashed rounded-xl">
              <p className="text-muted-foreground">
                Chưa có công việc nào được tạo.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {jobs && totalPages > 1 && (
        <div className="mt-5 flex justify-center items-center md:col-span-12">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildUrl(page - 1)}
                  className={
                    page === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href={buildUrl(p)}
                      isActive={p === page}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  href={buildUrl(page + 1)}
                  className={
                    page === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Dialog */}
      <JobDialog
        initialData={dialogState.editingJob}
        isOpen={dialogState.isOpen}
        onOpenChange={(open) =>
          setDialogState({ ...dialogState, isOpen: open })
        }
        onSubmit={handleSubmit}
      />
    </div>
  );
}