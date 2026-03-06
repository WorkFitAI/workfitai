"use client";

// HR staff registration form
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { authService } from "@/lib/auth/auth-service";
import {
  hrRegisterSchema,
  type HrRegisterFormValues,
} from "@/lib/schemas/auth-schemas";

export function RegisterFormHr() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HrRegisterFormValues>({
    resolver: zodResolver(hrRegisterSchema),
  });

  async function onSubmit(data: HrRegisterFormValues) {
    setIsLoading(true);
    try {
      await authService.register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        role: "HR",
        hrProfile: {
          department: data.department,
          hrManagerEmail: data.hrManagerEmail,
          address: data.address,
        },
      });
      // apiClient throws ApiError on non-2xx — reaching here means success
      toast.success("Account created! Check your email for the OTP.");
      router.push(
        `/register/verify-otp?email=${encodeURIComponent(data.email)}&role=HR`,
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="hr-fullName">Full Name</Label>
          <Input
            id="hr-fullName"
            placeholder="Jane Doe"
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">
              {errors.fullName.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="hr-phone">Phone</Label>
          <Input
            id="hr-phone"
            type="tel"
            placeholder="+1234567890"
            {...register("phoneNumber")}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-destructive">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="hr-email">Email</Label>
        <Input
          id="hr-email"
          type="email"
          placeholder="you@company.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="hr-dept">Department</Label>
          <Input
            id="hr-dept"
            placeholder="Engineering"
            {...register("department")}
          />
          {errors.department && (
            <p className="text-sm text-destructive">
              {errors.department.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="hr-address">Address</Label>
          <Input
            id="hr-address"
            placeholder="123 Main St"
            {...register("address")}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="hr-manager-email">HR Manager Email</Label>
        <Input
          id="hr-manager-email"
          type="email"
          placeholder="manager@company.com"
          {...register("hrManagerEmail")}
        />
        {errors.hrManagerEmail && (
          <p className="text-sm text-destructive">
            {errors.hrManagerEmail.message}
          </p>
        )}
      </div>

      <PasswordInput
        id="hr-password"
        label="Password"
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordInput
        id="hr-confirm"
        label="Confirm Password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create HR Account
      </Button>
    </form>
  );
}
