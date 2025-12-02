import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import { Logo } from "@/components/Logo";

export default async function LoginPage() {
  // Redirect to home if already logged in
  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">BookStore Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to access your inventory
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Inventory & POS System
        </p>
      </div>
    </div>
  );
}

