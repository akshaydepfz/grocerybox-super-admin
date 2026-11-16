import { LoginRedirectIfAuthenticated } from "@/components/auth/LoginRedirectIfAuthenticated";
import { LoginBrandingPanel, MobileBrandHeader } from "@/components/auth/LoginBrandingPanel";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-forest-975">
      <LoginRedirectIfAuthenticated />
      <div className="flex min-h-screen flex-col lg:flex-row">
        <LoginBrandingPanel />

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="animate-fade-in-up w-full max-w-md rounded-3xl border border-forest-800/70 bg-forest-900/35 p-6 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-8">
            <MobileBrandHeader />
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}