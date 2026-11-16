"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { isAuthStackConfigured } from "@/config/env";
import { signInSuperAdmin, sendPasswordReset } from "@/services/auth-service";
import { AuthServiceError } from "@/types/auth";
import { cn } from "@/utils/cn";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputFieldClass =
  "w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/15";

export function LoginForm() {
  const router = useRouter();
  const configured = isAuthStackConfigured();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  function validate(): boolean {
    const next: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      next.email = "Required";
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      next.email = "Invalid email";
    }

    if (!password) {
      next.password = "Required";
    } else if (password.length < 6) {
      next.password = "Too short";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setResetMessage(null);

    if (!configured) {
      setFormError("Sign-in is disabled until NEXT_PUBLIC_API_BASE_URL is set.");
      return;
    }

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await signInSuperAdmin({
        email: email.trim(),
        password,
        rememberMe,
      });
      router.replace("/dashboard");
    } catch (error) {
      const message =
        error instanceof AuthServiceError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unable to sign in.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setFormError(null);
    setResetMessage(null);
    if (!email.trim()) {
      setFieldErrors((prev) => ({ ...prev, email: "Enter email first" }));
      return;
    }
    try {
      await sendPasswordReset(email);
      setResetMessage("Reset email sent.");
    } catch (error) {
      setFormError(
        error instanceof AuthServiceError ? error.message : "Unable to send reset email.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5" noValidate>
      <div className="border-b border-zinc-100 pb-5 text-center">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-500">Platform administration</p>
      </div>

      {formError ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
          role="alert"
        >
          {formError}
        </div>
      ) : null}

      {resetMessage ? (
        <div
          className="rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-800"
          role="status"
        >
          {resetMessage}
        </div>
      ) : null}

      <div className="space-y-4">
        <Input
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          placeholder="you@company.com"
          disabled={loading}
          className="rounded-lg border-zinc-200 bg-zinc-50/50 focus:bg-white"
        />

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              aria-invalid={Boolean(fieldErrors.password)}
              className={cn(
                inputFieldClass,
                "pr-10",
                fieldErrors.password &&
                  "border-red-300 focus:border-red-500 focus:ring-red-500/15",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 transition-colors hover:text-zinc-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {fieldErrors.password ? (
            <p className="text-xs text-red-600" role="alert">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-zinc-600">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500/30"
          />
          Remember me
        </label>
        <button
          type="button"
          onClick={handleForgotPassword}
          className="font-medium text-brand-700 transition-colors hover:text-brand-800"
        >
          Forgot password?
        </button>
      </div>

      <Button type="submit" className="w-full shadow-md shadow-brand-600/20" size="lg" loading={loading} disabled={!configured}>
        Continue
      </Button>
    </form>
  );
}