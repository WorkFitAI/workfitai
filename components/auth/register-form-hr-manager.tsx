"use client";

// HR Manager registration form — personal info + company details
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, Loader2, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { authService } from "@/lib/auth/auth-service";
import {
  hrManagerRegisterSchema,
  type HrManagerRegisterFormValues,
} from "@/lib/schemas/auth-schemas";

export function RegisterFormHrManager() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HrManagerRegisterFormValues>({
    resolver: zodResolver(hrManagerRegisterSchema),
  });

  async function onSubmit(data: HrManagerRegisterFormValues) {
    setIsLoading(true);
    try {
      await authService.register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        role: "HR_MANAGER",
        hrProfile: {
          department: data.department,
          address: data.address,
        },
        company: {
          name: data.companyName,
          address: data.companyAddress,
          companyNo: data.companyNo || undefined,
          websiteUrl: data.companyWebsite || undefined,
          description: data.companyDescription || undefined,
          size: data.companySize || undefined,
        },
      });
      toast.success("Account created! Check your email for the OTP.");
      router.push(
        `/register/verify-otp?email=${encodeURIComponent(data.email)}&role=HR_MANAGER`,
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
      {/* ── Personal info ───────────────────────────────────────── */}
      <div className="space-y-1">
        <Label htmlFor="hrm-fullName">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="hrm-fullName"
            placeholder="Jane Doe"
            className="h-12 rounded-lg pl-10"
            {...register("fullName")}
          />
        </div>
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="hrm-email">Work Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="hrm-email"
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

      <div className="space-y-1">
        <Label htmlFor="hrm-phone">Phone</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="hrm-phone"
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="hrm-dept">Department</Label>
          <Input
            id="hrm-dept"
            placeholder="Human Resources"
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
          <Label htmlFor="hrm-address">Your Address</Label>
          <Input
            id="hrm-address"
            placeholder="123 Main St"
            className="h-12 rounded-lg"
            {...register("address")}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>
      </div>

      <PasswordInput
        id="hrm-password"
        label="Password"
        placeholder="Password"
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordInput
        id="hrm-confirm"
        label="Confirm Password"
        placeholder="Confirm password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {/* ── Company Details ─────────────────────────────────────── */}
      <div className="relative my-2 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          Company Details
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="hrm-co-name">Company Name</Label>
          <Input
            id="hrm-co-name"
            placeholder="Acme Corp"
            className="h-12 rounded-lg"
            {...register("companyName")}
          />
          {errors.companyName && (
            <p className="text-sm text-destructive">
              {errors.companyName.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="hrm-co-no">Company No. (TaxID)</Label>
          <Input
            id="hrm-co-no"
            placeholder="0123456789"
            className="h-12 rounded-lg"
            {...register("companyNo")}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="hrm-co-address">Company Address</Label>
        <Input
          id="hrm-co-address"
          placeholder="456 Business Ave"
          className="h-12 rounded-lg"
          {...register("companyAddress")}
        />
        {errors.companyAddress && (
          <p className="text-sm text-destructive">
            {errors.companyAddress.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="hrm-co-size">Company Size</Label>
          <Input
            id="hrm-co-size"
            placeholder="50–200"
            className="h-12 rounded-lg"
            {...register("companySize")}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hrm-co-web">Website (optional)</Label>
          <Input
            id="hrm-co-web"
            type="url"
            placeholder="https://acme.com"
            className="h-12 rounded-lg"
            {...register("companyWebsite")}
          />
          {errors.companyWebsite && (
            <p className="text-sm text-destructive">
              {errors.companyWebsite.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="hrm-co-desc">Company Description (optional)</Label>
        <Input
          id="hrm-co-desc"
          placeholder="A short description of your company"
          className="h-12 rounded-lg"
          {...register("companyDescription")}
        />
      </div>

      <Button
        type="submit"
        className="h-12 w-full rounded-lg bg-primary text-base text-white hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create HR Manager Account →
      </Button>
    </form>
  );
}
