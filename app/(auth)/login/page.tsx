import { AuthPageIllustration } from "@/components/auth/auth-page-illustration"
import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-16">
      <AuthPageIllustration />
      <div className="relative mx-auto max-w-lg">
        <p className="mb-2 text-center text-sm font-semibold text-primary">Welcome Back!</p>
        <h1 className="mb-1 text-center text-3xl font-bold text-foreground">Member Login</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">Sign in to continue.</p>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-foreground underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
