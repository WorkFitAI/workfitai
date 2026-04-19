import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JobForm } from "@/components/jobs/post/job-form";
import { JobFormValues } from "@/lib/schemas/job-schemas";

interface JobDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: JobFormValues) => void;
  initialData?: JobFormValues | null;
  onSuccess?: () => void;
}

export const JobDialog = ({ isOpen, onOpenChange, onSubmit, initialData, onSuccess }: JobDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-screen! h-screen!
          max-w-none!
          m-0! p-0!
          rounded-none
          left-0! top-0!
          translate-x-0! translate-y-0!
        "
      >
        <div className="h-full overflow-y-auto p-10">
          <DialogHeader>
            <DialogTitle>{initialData ? "Edit Job" : "Add New Job"}</DialogTitle>
            <DialogDescription>
              Fill in the details for the job position you want to post.
            </DialogDescription>
          </DialogHeader>
          <JobForm 
            initialData={initialData ?? undefined} 
            onSubmit={(data) => {
              onSubmit(data);
              onOpenChange(false);
            }} 
            onSuccess={onSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}