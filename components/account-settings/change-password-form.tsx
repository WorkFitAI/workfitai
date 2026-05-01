"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { userService } from "@/lib/user/user-service";
import { changePasswordSchema, ChangePasswordFormValues } from "@/lib/schemas/user-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

function PasswordInput({ id, placeholder, ...props }: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative mt-1">
      <Input id={id} type={show ? "text" : "password"} placeholder={placeholder} {...props} />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function ChangePasswordForm() {
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      setSaving(true);
      await userService.changePassword(values);
      toast.success("Password changed successfully.");
      reset();
    } catch {
      toast.error("Failed to change password. Check your current password and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-5">
        <KeyRound className="h-5 w-5 text-primary shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
          <p className="text-xs text-muted-foreground">Use a strong password of at least 8 characters.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="currentPassword">Current Password</Label>
          <PasswordInput id="currentPassword" placeholder="Enter current password" {...register("currentPassword")} />
          <FieldError message={errors.currentPassword?.message} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <PasswordInput id="newPassword" placeholder="Min 8 characters" {...register("newPassword")} />
            <FieldError message={errors.newPassword?.message} />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <PasswordInput id="confirmPassword" placeholder="Repeat new password" {...register("confirmPassword")} />
            <FieldError message={errors.confirmPassword?.message} />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button type="submit" disabled={saving || !isDirty}>
            {saving ? "Updating…" : "Update password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
