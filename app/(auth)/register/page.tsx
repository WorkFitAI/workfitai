"use client"

import { AuthPageIllustration } from "@/components/auth/auth-page-illustration"
import { RegisterFormCandidate } from "@/components/auth/register-form-candidate"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="relative overflow-hidden px-4 py-16">
      <AuthPageIllustration />
      <div className="relative mx-auto max-w-lg">
        <p className="mb-2 text-center text-sm font-semibold text-primary">Register</p>
        <h1 className="mb-1 text-center text-3xl font-bold text-foreground">Let&apos;s Get Started</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Sign Up and get access to all the features.
        </p>
        <RegisterFormCandidate />
        <div className="mt-4 space-y-1 text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline">
              Sign In
            </Link>
          </p>
          <p>
            <Link href="/register?type=employer" className="text-muted-foreground underline">
              Is Employer?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
