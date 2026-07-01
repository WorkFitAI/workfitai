"use client";

// Candidate registration form — firstName, lastName, email, phone, password, confirm, accountType, terms
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Building2, Loader2, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/auth/password-input";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { authService } from "@/lib/auth/auth-service";
import {
  candidateRegisterSchema,
  type CandidateRegisterFormValues,
} from "@/lib/schemas/auth-schemas";
import { cn } from "@/lib/utils";

type AccountType = "job_seeker" | "employer";

const accountTypes = [
  {
    id: "job_seeker" as const,
    icon: User,
    title: "Job Seeker",
    desc: "Looking for job opportunities",
  },
  {
    id: "employer" as const,
    icon: Building2,
    title: "Employer",
    desc: "Hiring talented professionals",
  },
];

function AccountTypeSelector({
  value,
  onChange,
}: {
  value: AccountType;
  onChange: (v: AccountType) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {accountTypes.map(({ id, icon: Icon, title, desc }) => (
        <motion.button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-colors",
            value === id
              ? "border-primary bg-primary/5 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40",
          )}
        >
          <Icon className="h-8 w-8" />
          <span className="font-semibold text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground">{desc}</span>
        </motion.button>
      ))}
    </div>
  );
}

export function RegisterFormCandidate() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("job_seeker");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CandidateRegisterFormValues>({
    resolver: zodResolver(candidateRegisterSchema),
  });

  const passwordValue = watch("password", "");

  async function onSubmit(data: CandidateRegisterFormValues) {
    if (!agreeTerms) {
      toast.error("Please agree to the terms and policy");
      return;
    }
    setIsLoading(true);
    try {
      await authService.register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        role: accountType === "employer" ? "EMPLOYER" : "CANDIDATE",
      });
      // apiClient throws ApiError on non-2xx — reaching here means success
      toast.success("Account created! Check your email for the OTP.");
      router.push(
        `/register/verify-otp?email=${encodeURIComponent(data.email)}`,
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
      {/* Full name (maps to existing fullName field) */}
      <AuthFormField
        id="c-fullName"
        label="Full Name"
        icon={User}
        placeholder="Full name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />

      {/* Email */}
      <AuthFormField
        id="c-email"
        label="Email"
        icon={Mail}
        type="email"
        placeholder="Email address"
        error={errors.email?.message}
        {...register("email")}
      />

      {/* Phone */}
      <div className="space-y-1">
        <Label htmlFor="c-phone">Phone</Label>
        <div className="flex gap-2">
          <select aria-label="Country code" className="h-12 rounded-lg border border-border bg-white px-2 text-sm">
            <option>🇻🇳 +84</option>
          </select>
          <Input
            id="c-phone"
            type="tel"
            placeholder="Phone number"
            className="h-12 flex-1 rounded-lg"
            {...register("phoneNumber")}
          />
        </div>
        {errors.phoneNumber && (
          <p className="text-sm text-destructive">
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <PasswordInput
          id="c-password"
          label="Password"
          placeholder="Password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrengthMeter value={passwordValue} />
      </div>

      {/* Confirm Password */}
      <PasswordInput
        id="c-confirm"
        label="Password confirmation"
        placeholder="Password confirmation"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {/* Terms */}
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={agreeTerms}
          onCheckedChange={(v) => setAgreeTerms(!!v)}
          className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
        />
        Agree our terms and policy
      </label>

      {/* Submit */}
      <Button
        type="submit"
        className="h-12 w-full rounded-lg bg-primary text-base text-white hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Register →
      </Button>
    </form>
  );
}
