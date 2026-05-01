"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { userService } from "@/lib/user/user-service";
import {
  deactivateSchema,
  deleteAccountSchema,
  DeactivateFormValues,
  DeleteAccountFormValues,
} from "@/lib/schemas/user-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

function DeactivateDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DeactivateFormValues>({
    resolver: zodResolver(deactivateSchema),
  });

  const onSubmit = async (values: DeactivateFormValues) => {
    try {
      setLoading(true);
      await userService.deactivateAccount(values);
      toast.success("Account deactivated. You will be logged out shortly.");
      setOpen(false);
      reset();
    } catch {
      toast.error("Failed to deactivate account. Check your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400">
          Deactivate account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate your account?</AlertDialogTitle>
          <AlertDialogDescription>
            Your profile will be hidden and you won&apos;t receive any notifications.
            You can reactivate by logging in again within 90 days.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="deactivate-password">Confirm your password</Label>
            <Input id="deactivate-password" type="password" {...register("password")} className="mt-1" />
            <FieldError message={errors.password?.message} />
          </div>
          <div>
            <Label htmlFor="deactivate-reason">Reason (optional)</Label>
            <Textarea id="deactivate-reason" {...register("reason")} rows={2} className="mt-1 resize-none" placeholder="Taking a break…" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" onClick={() => reset()}>Cancel</AlertDialogCancel>
            <Button type="submit" variant="outline" disabled={loading}
              className="border-amber-300 text-amber-700 hover:bg-amber-50">
              {loading ? "Deactivating…" : "Deactivate"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
  });

  const onSubmit = async (values: DeleteAccountFormValues) => {
    try {
      setLoading(true);
      await userService.requestAccountDeletion({ password: values.password, reason: values.reason });
      toast.success("Deletion requested. Your account will be permanently deleted in 30 days.");
      setOpen(false);
      reset();
    } catch {
      toast.error("Failed to request account deletion. Check your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/5 hover:border-destructive/60">
          Delete account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Permanently delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            All your data — applications, CVs, and profile — will be permanently removed after 30 days.
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="delete-password">Confirm your password</Label>
            <Input id="delete-password" type="password" {...register("password")} className="mt-1" />
            <FieldError message={errors.password?.message} />
          </div>
          <div>
            <Label htmlFor="delete-reason">Reason (optional)</Label>
            <Textarea id="delete-reason" {...register("reason")} rows={2} className="mt-1 resize-none" placeholder="Leaving the platform…" />
          </div>
          <div>
            <Label htmlFor="confirm-text">
              Type <span className="font-mono font-semibold">DELETE</span> to confirm
            </Label>
            <Input id="confirm-text" {...register("confirmText")} className="mt-1" placeholder="DELETE" />
            <FieldError message={errors.confirmText?.message} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" onClick={() => reset()}>Cancel</AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "Requesting…" : "Delete my account"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function DangerZone() {
  return (
    <div className="space-y-4">
      {/* Warning banner */}
      <div className="flex gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
        <div className="text-sm text-destructive">
          <p className="font-medium">Irreversible actions ahead</p>
          <p className="mt-0.5 text-destructive/80">
            Deactivating hides your account temporarily. Deleting is permanent after 30 days.
          </p>
        </div>
      </div>

      {/* Deactivate */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Deactivate account</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Temporarily hide your profile. Reactivate anytime by logging in.
            </p>
          </div>
          <DeactivateDialog />
        </div>
      </div>

      {/* Delete */}
      <div className="rounded-xl border border-destructive/20 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-destructive">Delete account</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Permanently delete your account and all data after a 30-day grace period.
            </p>
          </div>
          <DeleteDialog />
        </div>
      </div>
    </div>
  );
}
