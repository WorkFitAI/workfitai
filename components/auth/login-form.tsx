"use client";

// Login form — email with Mail icon + check, password with Lock icon + eye, remember me checkbox
import { useState } from "react";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/auth/password-input";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { fadeSlideUp } from "@/components/auth/motion/auth-motion-variants";
import { useAuth } from "@/contexts/auth-context";
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth-schemas";
import { apiClient } from "@/lib/api-client";
import type { OAuthAuthorizeResponse } from "@/types/auth";

/** Google's official multi-color "G" mark — brand colors stay fixed regardless of theme. */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.8741 2.6836-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1818l-2.9087-2.2581c-.8064.54-1.8368.8591-3.0477.8591-2.3446 0-4.3282-1.5831-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.2827-1.1168-.2827-1.71s.1027-1.17.2827-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.964 10.71z" />
      <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5814-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6555 3.5795 9 3.5795z" />
    </svg>
  );
}

export function LoginForm() {

  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"GOOGLE" | "GITHUB" | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  async function handleOAuthLogin(provider: "GOOGLE" | "GITHUB") {
    setOauthLoading(provider);
    try {
      const res = await apiClient.get<OAuthAuthorizeResponse>(
        `/auth/oauth/authorize/${provider}`,
      );
      window.location.href = res.data.authorizationUrl;
    } catch {
      toast.error("Failed to initiate OAuth login. Please try again.");
      setOauthLoading(null);
    }
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const emailValue = watch("usernameOrEmail", "");
  const isEmailValid = emailValue.includes("@") && emailValue.includes(".");

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      await login(data);
      // login() throws on failure, so reaching here means success.
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", data.usernameOrEmail);
      }
      toast.success("Signed in successfully");
      // Navigation is handled by the auth context (role-based redirect).
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email field */}
      <AuthFormField
        id="usernameOrEmail"
        label="Email"
        icon={Mail}
        placeholder="Email address"
        autoComplete="username"
        error={errors.usernameOrEmail?.message}
        adornment={
          isEmailValid ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : undefined
        }
        {...register("usernameOrEmail")}
      />

      {/* Password field */}
      <motion.div variants={fadeSlideUp} className="space-y-1">
        <Label htmlFor="login-password">Password</Label>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          error={errors.password?.message}
          placeholder="Password"
          {...register("password")}
        />
      </motion.div>

      {/* Remember me + forgot password */}
      <motion.div variants={fadeSlideUp} className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={rememberMe}
            onCheckedChange={(v) => setRememberMe(!!v)}
            className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
          />
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="text-sm text-foreground underline"
        >
          Forgot password?
        </Link>
      </motion.div>

      {/* Submit */}
      <motion.div variants={fadeSlideUp} whileTap={{ scale: 0.98 }}>
        <Button
          type="submit"
          className="h-12 w-full rounded-lg bg-primary text-base text-white hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login →
        </Button>
      </motion.div>

      {/* OAuth */}
      <motion.div variants={fadeSlideUp} className="flex flex-col gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={oauthLoading !== null}
          onClick={() => handleOAuthLogin("GOOGLE")}
        >
          {oauthLoading === "GOOGLE" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon className="mr-2 h-4 w-4" />
          )}
          Continue with Google
        </Button>
        {/* <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={oauthLoading !== null}
          onClick={() => handleOAuthLogin("GITHUB")}
        >
          {oauthLoading === "GITHUB" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue with GitHub
        </Button> */}
      </motion.div>
    </form>
  );
}
