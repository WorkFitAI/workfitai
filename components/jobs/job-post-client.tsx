"use client";

import { useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { useJobFilters } from "@/hooks/useJobFilters";

import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JobDialog } from "@/components/jobs/post/job-dialog";
import { toast } from "sonner";
import { Job, JobDetail } from "@/types/job";
import { JobFormValues } from "@/lib/schemas/job-schemas";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// MOCK API (bạn thay bằng service thật)
const getJobById = async (id: string | number): Promise<JobDetail> => {
  // TODO: gọi API thật
  return {} as JobDetail;
};

const createJob = async (data: JobFormValues) => {
  // TODO: gọi API thật
};

const updateJob = async (id: string | number, data: JobFormValues) => {
  // TODO: gọi API thật
};

const deleteJob = async (id: string | number) => {
  // TODO: gọi API thật
};

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

  // ADD
  const handleOpenAdd = () => {
    setDialogState({
      isOpen: true,
      editingJob: null,
    });
  };

  // EDIT (CALL API getById)
  const handleOpenEdit = async (job: Job) => {
    try {
      const detail = await getJobById(job.postId);

    const normalizedData: JobFormValues = {
        ...detail,
        companyNo: "1",

        salaryMin: detail.salaryMin ?? 0,
        salaryMax: detail.salaryMax ?? 0,
        quantity: detail.quantity ?? 1,

        skillNames: detail.skillNames ?? [],

        expiresAt: detail.expiresAt
          ? new Date(detail.expiresAt)
          : new Date(),
      };

      setDialogState({
        isOpen: true,
        editingJob: normalizedData,
      });

    } catch (error) {
      toast.error("Không lấy được chi tiết job");
    }
  };

  // SUBMIT
  const handleSubmit = async (data: JobFormValues) => {
    try {
      if (dialogState.editingJob) {
        // await updateJob(dialogState.editingJob.postId, data);
        toast.success("Đã cập nhật công việc");
      } else {
        console.log("Creating job with data:", data);
        await createJob(data);
        toast.success("Đã tạo công việc miớ");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  // DELETE
  const handleDelete = async (id: string | number) => {
    if (confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await deleteJob(id);
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
            Dashboard Tuyển Dụng
          </h1>
          <p className="text-muted-foreground">
            Quản lý danh sách các vị trí đang đăng tuyển.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus size={18} /> Thêm Job
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
                  <h3 className="font-bold text-lg">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {job.salaryMin} • {job.salaryMax}
                  </p>
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