"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { isAuthStackConfigured } from "@/config/env";
import { AuthServiceError } from "@/types/auth";
import { signInSuperAdmin, sendPasswordReset } from "@/services/auth-service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      next.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setResetMessage(null);

    if (!configured) {
      setFormError(
        "Authentication is not fully configured. Set NEXT_PUBLIC_API_BASE_URL and Firebase env variables.",
      );
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
      setFieldErrors((prev) => ({
        ...prev,
        email: "Enter your email address to reset your password.",
      }));
      return;
    }
    try {
      await sendPasswordReset(email);
      setResetMessage("Password reset email sent. Check your inbox.");
    } catch (error) {
      setFormError(
        error instanceof AuthServiceError ? error.message : "Unable to send reset email.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-6"
      noValidate
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Welcome back
        </h2>
        <p className="text-sm text-forest-300 sm:text-base">
          Sign in to access your administration dashboard.
        </p>
      </div>

      {!configured ? (
        <div
          className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
          role="status"
        >
          Configure <code className="text-amber-50">NEXT_PUBLIC_API_BASE_URL</code> and Firebase
          web credentials in <code className="text-amber-50">.env.local</code> to enable sign-in.
          Platform admin access uses Firebase ID tokens with the{" "}
          <code className="text-amber-50">platformAdmin</code> claim (no dedicated backend login
          endpoint).
        </div>
      ) : null}

      {formError ? (
        <div
          className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100"
          role="alert"
        >
          {formError}
        </div>
      ) : null}

      {resetMessage ? (
        <div
          className="rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 py-3 text-sm text-lime-100"
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
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          placeholder="you@company.com"
          disabled={loading}
        />

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-forest-100"
          >
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
              placeholder="••••••••"
              aria-invalid={Boolean(fieldErrors.password)}
              className="w-full rounded-xl border border-forest-700/80 bg-forest-950/60 px-4 py-3 pr-12 text-sm text-white placeholder:text-forest-400 shadow-inner transition-colors focus:border-lime-400/70 focus:outline-none focus:ring-2 focus:ring-lime-400/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-forest-400 transition-colors hover:text-forest-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {fieldErrors.password ? (
            <p className="text-xs text-red-300" role="alert">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex items-center gap-2 text-forest-200">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-4 rounded border-forest-600 bg-forest-950 text-lime-400 focus:ring-lime-400/40"
          />
          Remember me
        </label>
        <button
          type="button"
          onClick={handleForgotPassword}
          className="font-medium text-lime-300 transition-colors hover:text-lime-200"
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={loading}
        disabled={!configured}
      >
        Sign In
      </Button>

      <p className="text-center text-xs text-forest-500">
        Protected access · GroceryBox Administration
      </p>
    </form>
  );
}