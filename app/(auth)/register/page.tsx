"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AuthPageIllustration } from "@/components/auth/auth-page-illustration";
import { RegisterFormCandidate } from "@/components/auth/register-form-candidate";
import { RegisterFormHr } from "@/components/auth/register-form-hr";
import { RegisterFormHrManager } from "@/components/auth/register-form-hr-manager";

type RegisterType = "candidate" | "hr" | "hr-manager";

const tabs: { id: RegisterType; label: string }[] = [
  { id: "candidate", label: "Candidate" },
  { id: "hr", label: "HR Staff" },
  { id: "hr-manager", label: "HR Manager" },
];

const headings: Record<RegisterType, { title: string; subtitle: string }> = {
  candidate: {
    title: "Let's Get Started",
    subtitle: "Sign up and get access to all the features.",
  },
  hr: {
    title: "Join as HR Staff",
    subtitle: "Register and get verified by your HR Manager.",
  },
  "hr-manager": {
    title: "Set Up Your Team",
    subtitle: "Create your HR Manager account and company profile.",
  },
};

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Resolve the active tab from the ?type= param
  const raw = searchParams.get("type") ?? "candidate";
  const activeType: RegisterType =
    raw === "hr" ? "hr" : raw === "hr-manager" ? "hr-manager" : "candidate";

  const { title, subtitle } = headings[activeType];

  function handleTabChange(id: RegisterType) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", id);
    router.replace(`/register?${params.toString()}`);
  }

  return (
    <div className="relative overflow-hidden px-4 py-16">
      <AuthPageIllustration />

      <div className="relative mx-auto max-w-lg">
        {/* Header */}
        <p className="mb-2 text-center text-sm font-semibold text-primary">
          Register
        </p>
        <h1 className="mb-1 text-center text-3xl font-bold text-foreground">
          {title}
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          {subtitle}
        </p>

        {/* Role switcher tabs */}
        <div className="mb-8 flex rounded-xl border border-border bg-muted/40 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
                activeType === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        {activeType === "hr" && <RegisterFormHr />}
        {activeType === "hr-manager" && <RegisterFormHrManager />}
        {activeType === "candidate" && <RegisterFormCandidate />}

        {/* Footer links */}
        <div className="mt-4 space-y-1 text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}
