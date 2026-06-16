"use client";

// Step 1 of forgot-password flow — enter email to receive OTP
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { fadeSlideUp } from "@/components/auth/motion/auth-motion-variants";
import { authService } from "@/lib/auth/auth-service";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/schemas/auth-schemas";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data);
      // apiClient throws ApiError on non-2xx — reaching here means success
      toast.success("OTP sent to your email");
      router.push(
        `/forgot-password/verify?email=${encodeURIComponent(data.email)}`,
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Forgot Password?"
      title="Reset your password."
      subtitle="Enter your email and instructions will be sent to you!"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthFormField
          id="fp-email"
          label="Email"
          icon={Mail}
          type="email"
          placeholder="Email address"
          error={errors.email?.message}
          {...register("email")}
        />

        <motion.div variants={fadeSlideUp} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            className="h-12 w-full rounded-lg bg-primary text-base text-white hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Password Reset Link
          </Button>
        </motion.div>
      </form>

      <motion.p variants={fadeSlideUp} className="mt-6 text-center text-sm">
        <Link href="/login" className="text-foreground underline">
          Back to login page
        </Link>
      </motion.p>
    </AuthShell>
  );
}
