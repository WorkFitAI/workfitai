"use client";

// OTP verification page after registration
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpInput } from "@/components/auth/otp-input";
import { authService } from "@/lib/auth/auth-service";

const RESEND_COOLDOWN_SECONDS = 60;

/** Inner component — must be inside <Suspense> because it calls useSearchParams() */
function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const role = searchParams.get("role") ?? "CANDIDATE";

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Guard: redirect back if email param is missing
  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  // Tick down resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!email) return null;

  // Accepts an optional code so OtpInput.onComplete can pass the just-completed
  // value (React state `otp` is still stale within that same event tick).
  async function handleSubmit(otpValue?: string) {
    const code = otpValue ?? otp;
    if (code.length < 6) return toast.error("Enter the 6-digit OTP");
    if (isSubmitting) return;
    setIsSubmitting(true);
    setOtpError(false);
    try {
      await authService.verifyOtp({ email, otp: code });
      // apiClient throws ApiError on non-2xx — reaching here means success
      if (role === "HR" || role === "HR_MANAGER") {
        toast.success("Email verified! Your account is pending approval.");
        router.push(`/pending-approval?role=${role}`);
      } else {
        toast.success("Email verified! Welcome to WorkfitAI.");
        router.push("/login");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
      setOtpError(true);
      setOtp("");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    try {
      await authService.resendOtp(email);
      toast.success("OTP resent to your email");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to resend OTP");
    }
  }

  return (
    <AuthShell
      eyebrow="Verify Email"
      title="Verify Your Email"
      subtitle={
        <>
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </>
      }
    >
      <div className="flex flex-col items-center gap-6">
        <OtpInput
          value={otp}
          onChange={(v) => {
            setOtp(v);
            if (otpError) setOtpError(false);
          }}
          onComplete={handleSubmit}
          error={otpError}
          disabled={isSubmitting}
        />

        <Button
          className="w-full"
          onClick={() => handleSubmit()}
          disabled={isSubmitting || otp.length < 6}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify
        </Button>

        <Button
          variant="ghost"
          className="text-sm"
          onClick={handleResend}
          disabled={cooldown > 0}
        >
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
        </Button>
      </div>
    </AuthShell>
  );
}

/** Page export — wraps content in Suspense (required by Next.js for useSearchParams) */
export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpContent />
    </Suspense>
  );
}
