"use client";

// Login form — email with Mail icon + check, password with Lock icon + eye, remember me checkbox
import { useState } from "react";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/auth/password-input";
import { useAuth } from "@/contexts/auth-context";
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth-schemas";
import { apiClient } from "@/lib/api-client";
import type { OAuthAuthorizeResponse } from "@/types/auth";

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
      <div className="space-y-1">
        <Label htmlFor="usernameOrEmail">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="usernameOrEmail"
            placeholder="Email address"
            autoComplete="username"
            className="h-12 rounded-lg border-border pl-10 pr-10 focus-visible:ring-primary"
            {...register("usernameOrEmail")}
          />
          {isEmailValid && (
            <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
          )}
        </div>
        {errors.usernameOrEmail && (
          <p className="text-sm text-destructive">
            {errors.usernameOrEmail.message}
          </p>
        )}
      </div>

      {/* Password field */}
      <div className="space-y-1">
        <Label htmlFor="login-password">Password</Label>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          error={errors.password?.message}
          placeholder="Password"
          {...register("password")}
        />
      </div>

      {/* Remember me + forgot password */}
      <div className="flex items-center justify-between">
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
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="h-12 w-full rounded-lg bg-primary text-base text-white hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Login →
      </Button>

      {/* OAuth */}
      <div className="flex flex-col gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={oauthLoading !== null}
          onClick={() => handleOAuthLogin("GOOGLE")}
        >
          {oauthLoading === "GOOGLE" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={oauthLoading !== null}
          onClick={() => handleOAuthLogin("GITHUB")}
        >
          {oauthLoading === "GITHUB" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue with GitHub
        </Button>
      </div>
    </form>
  );
}
