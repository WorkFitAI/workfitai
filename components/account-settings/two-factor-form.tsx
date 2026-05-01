"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Mail } from "lucide-react";
import { userService } from "@/lib/user/user-service";
import { disableTwoFactorSchema, DisableTwoFactorFormValues } from "@/lib/schemas/user-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export default function TwoFactorForm() {
  const [enabling, setEnabling] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [showDisableForm, setShowDisableForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DisableTwoFactorFormValues>({
    resolver: zodResolver(disableTwoFactorSchema),
    defaultValues: { password: "", code: "" },
  });

  const handleEnable = async () => {
    try {
      setEnabling(true);
      await userService.enableTwoFactor({ method: "EMAIL" });
      toast.success("Two-factor authentication enabled via email.");
    } catch {
      toast.error("Failed to enable 2FA. Please try again.");
    } finally {
      setEnabling(false);
    }
  };

  const onDisableSubmit = async (values: DisableTwoFactorFormValues) => {
    try {
      setDisabling(true);
      await userService.disableTwoFactor(values);
      toast.success("Two-factor authentication disabled.");
      reset();
      setShowDisableForm(false);
    } catch {
      toast.error("Failed to disable 2FA. Check your password and code.");
    } finally {
      setDisabling(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-white p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Two-Factor Authentication</h3>
          <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
        </div>
      </div>

      {/* Enable */}
      <div className="flex items-start justify-between rounded-lg border border-border bg-muted/30 px-4 py-3.5">
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-medium">Email authentication</p>
            <p className="text-xs text-muted-foreground">Receive a code to your email when signing in.</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleEnable}
          disabled={enabling}
          className="shrink-0"
        >
          {enabling ? "Enabling…" : "Enable"}
        </Button>
      </div>

      {/* Disable */}
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3.5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <ShieldOff className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">Disable 2FA</p>
              <p className="text-xs text-muted-foreground">Requires your password and a verification code.</p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowDisableForm((v) => !v)}
            className="shrink-0 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
          >
            {showDisableForm ? "Cancel" : "Disable"}
          </Button>
        </div>

        {showDisableForm && (
          <form onSubmit={handleSubmit(onDisableSubmit)} className="pt-1 space-y-3 border-t border-border">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="disable-password" className="text-xs">Password</Label>
                <Input
                  id="disable-password"
                  type="password"
                  placeholder="Your current password"
                  {...register("password")}
                  className="mt-1"
                />
                <FieldError message={errors.password?.message} />
              </div>
              <div>
                <Label htmlFor="disable-code" className="text-xs">Verification Code</Label>
                <Input
                  id="disable-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  {...register("code")}
                  className="mt-1"
                />
                <FieldError message={errors.code?.message} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" variant="destructive" disabled={disabling}>
                {disabling ? "Disabling…" : "Confirm disable"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
