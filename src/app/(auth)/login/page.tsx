import { LoginRedirectIfAuthenticated } from "@/components/auth/LoginRedirectIfAuthenticated";
import { LoginHeader } from "@/components/auth/LoginHeader";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <LoginRedirectIfAuthenticated />
      <div className="mx-auto flex min-h-screen w-full max-w-[400px] flex-col justify-center px-6 py-12">
        <LoginHeader />
        <LoginForm />
      </div>
    </main>
  );
}