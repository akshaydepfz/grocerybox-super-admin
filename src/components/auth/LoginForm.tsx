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
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

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
      setFormError("Sign-in is disabled until API and Firebase env vars are set.");
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
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Sign in</h1>

      {formError ? (
        <p className="text-sm text-red-600" role="alert">
          {formError}
        </p>
      ) : null}

      {resetMessage ? (
        <p className="text-sm text-brand-700" role="status">
          {resetMessage}
        </p>
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
        />

        <div className="space-y-2">
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
              className={cn(inputFieldClass, "pr-10", fieldErrors.password && "border-red-400 focus:border-red-500 focus:ring-red-500/20")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 hover:text-zinc-600"
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
          className="font-medium text-brand-700 hover:text-brand-800"
        >
          Forgot password?
        </button>
      </div>

      <Button type="submit" className="w-full" size="lg" loading={loading} disabled={!configured}>
        Continue
      </Button>
    </form>
  );
}