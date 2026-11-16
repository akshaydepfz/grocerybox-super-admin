import { LoginCard } from "@/components/auth/LoginCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginHeader } from "@/components/auth/LoginHeader";
import { LoginRedirectIfAuthenticated } from "@/components/auth/LoginRedirectIfAuthenticated";

export default function LoginPage() {
  return (
    <main className="login-shell relative min-h-screen overflow-hidden">
      <LoginBackdrop />
      <LoginRedirectIfAuthenticated />
      <div className="relative mx-auto flex min-h-screen items-center justify-center px-5 py-12 sm:px-6">
        <LoginCard>
          <LoginHeader />
          <LoginForm />
        </LoginCard>
      </div>
    </main>
  );
}

function LoginBackdrop() {
  return (
    <>
      <div
        className="pointer-events-none absolute -left-32 top-0 size-[420px] rounded-full bg-brand-300/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 size-[380px] rounded-full bg-emerald-200/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(21,128,61,0.07)_1px,transparent_0)] bg-[length:24px_24px]"
        aria-hidden
      />
    </>
  );
}