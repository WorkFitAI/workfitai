"use client";

// HR staff registration form
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
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
    watch,
    formState: { errors },
  } = useForm<HrRegisterFormValues>({
    resolver: zodResolver(hrRegisterSchema),
  });

  const passwordValue = watch("password", "");

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
      {/* Full name */}
      <div className="space-y-1">
        <Label htmlFor="hr-fullName">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="hr-fullName"
            placeholder="Jane Doe"
            className="h-12 rounded-lg pl-10"
            {...register("fullName")}
          />
        </div>
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1">
        <Label htmlFor="hr-email">Work Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="hr-email"
            type="email"
            placeholder="you@company.com"
            className="h-12 rounded-lg pl-10"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1">
        <Label htmlFor="hr-phone">Phone</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="hr-phone"
            type="tel"
            placeholder="+84 901 234 567"
            className="h-12 rounded-lg pl-10"
            {...register("phoneNumber")}
          />
        </div>
        {errors.phoneNumber && (
          <p className="text-sm text-destructive">
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

      {/* Department + Address */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="hr-dept">Department</Label>
          <Input
            id="hr-dept"
            placeholder="Engineering"
            className="h-12 rounded-lg"
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
            className="h-12 rounded-lg"
            {...register("address")}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>
      </div>

      {/* HR Manager Email */}
      <div className="space-y-1">
        <Label htmlFor="hr-manager-email">HR Manager&apos;s Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="hr-manager-email"
            type="email"
            placeholder="manager@company.com"
            className="h-12 rounded-lg pl-10"
            {...register("hrManagerEmail")}
          />
        </div>
        {errors.hrManagerEmail && (
          <p className="text-sm text-destructive">
            {errors.hrManagerEmail.message}
          </p>
        )}
      </div>

      {/* Passwords */}
      <div className="space-y-1">
        <PasswordInput
          id="hr-password"
          label="Password"
          placeholder="Password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrengthMeter value={passwordValue} />
      </div>
      <PasswordInput
        id="hr-confirm"
        label="Confirm Password"
        placeholder="Confirm password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button
        type="submit"
        className="h-12 w-full rounded-lg bg-primary text-base text-white hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create HR Account →
      </Button>
    </form>
  );
}
