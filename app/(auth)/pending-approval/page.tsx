"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthPageIllustration } from "@/components/auth/auth-page-illustration";

const ROLE_CONFIG = {
  HR_MANAGER: {
    title: "Awaiting Admin Approval",
    subtitle: "Your HR Manager account is under review",
    message:
      "Your registration has been submitted and is pending approval by a platform administrator. " +
      "You will receive an email notification once your account is approved.",
    approver: "Platform Administrator",
    icon: "🏢",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
  },
  HR: {
    title: "Awaiting HR Manager Approval",
    subtitle: "Your HR Staff account is under review",
    message:
      "Your registration has been submitted and is pending approval by your HR Manager. " +
      "You will receive an email notification once your account is approved.",
    approver: "HR Manager",
    icon: "👤",
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
  },
} as const;

function PendingApprovalContent() {
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") ?? "HR") as keyof typeof ROLE_CONFIG;
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.HR;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-16">
      <AuthPageIllustration />
      <div className="relative mx-auto max-w-lg">
        {/* Status badge */}
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            Pending Approval
          </span>
        </div>

        {/* Icon + heading */}
        <div className="mb-2 text-center text-5xl">{config.icon}</div>
        <p className="mb-1 text-center text-sm font-semibold text-primary">
          Almost there!
        </p>
        <h1 className="mb-1 text-center text-3xl font-bold text-foreground">
          {config.title}
        </h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          {config.subtitle}
        </p>

        {/* Info card */}
        <div className={`rounded-xl border p-6 ${config.bg} ${config.border}`}>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {config.message}
          </p>

          <div className="mt-4 flex items-center gap-3 rounded-lg bg-white/60 px-4 py-3 dark:bg-black/20">
            <span className="text-2xl">📧</span>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Check your email
              </p>
              <p className="text-xs text-muted-foreground">
                We'll notify you when {config.approver} reviews your account.
              </p>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="mt-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What happens next?
          </p>
          {[
            {
              step: "1",
              text: `${config.approver} receives a notification about your request`,
            },
            { step: "2", text: "They review your registration details" },
            {
              step: "3",
              text: "You receive an email when approved — then you can log in",
            },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${config.color.replace("text-", "bg-")}`}
              >
                {step}
              </span>
              <p className="text-sm text-muted-foreground pt-0.5">{text}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PendingApprovalPage() {
  return (
    <Suspense>
      <PendingApprovalContent />
    </Suspense>
  );
}
