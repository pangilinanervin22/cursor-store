import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import { BookOpen } from "lucide-react";

export default async function LoginPage() {
  // Redirect to home if already logged in
  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary mb-4">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
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
          BookStore Inventory System
        </p>
      </div>
    </div>
  );
}

