"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"
import { fadeSlideUp } from "@/components/auth/motion/auth-motion-variants"

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome Back!"
      title="Member Login"
      subtitle="Sign in to continue."
    >
      <LoginForm />
      <motion.p
        variants={fadeSlideUp}
        className="mt-4 text-center text-sm text-muted-foreground"
      >
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-foreground underline">
          Sign Up
        </Link>
      </motion.p>
    </AuthShell>
  )
}
