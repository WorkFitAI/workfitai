"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { AuthShell } from "@/components/auth/auth-shell";
import { RoleTabs } from "@/components/auth/role-tabs";
import { fadeSlideUp } from "@/components/auth/motion/auth-motion-variants";

// Cross-fade between role forms. Uses variant LABELS (not object values) so the
// "show" state propagates to child motion items (AuthFormField) — object-based
// animation would stop label propagation and leave those fields stuck at their
// hidden (opacity:0) variant.
const roleFormVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" } },
};
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
  // "employer" is an alias for "hr" (employers register as HR staff)
  const raw = searchParams.get("type") ?? "candidate";
  const activeType: RegisterType =
    raw === "hr" || raw === "employer"
      ? "hr"
      : raw === "hr-manager"
        ? "hr-manager"
        : "candidate";

  const { title, subtitle } = headings[activeType];

  function handleTabChange(id: RegisterType) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", id);
    router.replace(`/register?${params.toString()}`);
  }

  return (
    <AuthShell eyebrow="Register" title={title} subtitle={subtitle}>
      {/* Role switcher tabs */}
      <motion.div variants={fadeSlideUp} className="mb-8">
        <RoleTabs tabs={tabs} value={activeType} onChange={handleTabChange} />
      </motion.div>

      {/* Form — cross-fade between roles */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeType}
          variants={roleFormVariants}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          {activeType === "hr" && <RegisterFormHr />}
          {activeType === "hr-manager" && <RegisterFormHrManager />}
          {activeType === "candidate" && <RegisterFormCandidate />}
        </motion.div>
      </AnimatePresence>

      {/* Footer links */}
      <motion.div
        variants={fadeSlideUp}
        className="mt-4 space-y-1 text-center text-sm text-muted-foreground"
      >
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}
