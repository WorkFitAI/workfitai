"use client";

// HR Manager registration form with company details
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
          hrManagerEmail: data.email,
          address: data.address,
        },
        company: {
          name: data.companyName,
          address: data.companyAddress,
          websiteUrl: data.companyWebsite || undefined,
          description: data.companyDescription || undefined,
          size: data.companySize || undefined,
        },
      });
      // apiClient throws ApiError on non-2xx — reaching here means success
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
      {/* Personal info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="hrm-fullName">Full Name</Label>
          <Input
            id="hrm-fullName"
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
          <Label htmlFor="hrm-phone">Phone</Label>
          <Input
            id="hrm-phone"
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
        <Label htmlFor="hrm-email">Email</Label>
        <Input
          id="hrm-email"
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
          <Label htmlFor="hrm-dept">Department</Label>
          <Input id="hrm-dept" placeholder="HR" {...register("department")} />
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
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordInput
        id="hrm-confirm"
        label="Confirm Password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Separator />
      <p className="text-sm font-medium text-muted-foreground">
        Company Details
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="hrm-co-name">Company Name</Label>
          <Input
            id="hrm-co-name"
            placeholder="Acme Corp"
            {...register("companyName")}
          />
          {errors.companyName && (
            <p className="text-sm text-destructive">
              {errors.companyName.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="hrm-co-size">Company Size</Label>
          <Input
            id="hrm-co-size"
            placeholder="50-200"
            {...register("companySize")}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="hrm-co-address">Company Address</Label>
        <Input
          id="hrm-co-address"
          placeholder="456 Business Ave"
          {...register("companyAddress")}
        />
        {errors.companyAddress && (
          <p className="text-sm text-destructive">
            {errors.companyAddress.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="hrm-co-web">Website (optional)</Label>
        <Input
          id="hrm-co-web"
          type="url"
          placeholder="https://acme.com"
          {...register("companyWebsite")}
        />
        {errors.companyWebsite && (
          <p className="text-sm text-destructive">
            {errors.companyWebsite.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create HR Manager Account
      </Button>
    </form>
  );
}
