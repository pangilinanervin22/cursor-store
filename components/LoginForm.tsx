"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Lock, User, LogIn } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button
      type="submit"
      className="w-full h-11"
      disabled={pending}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          Signing in...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          Sign In
        </span>
      )}
    </Button>
  );
}

export function LoginForm() {
  const [error, setError] = React.useState<string | null>(null);

  async function handleAction(formData: FormData) {
    setError(null);
    
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const result = await login(username, password);
    
    if (result.success) {
      // Redirect on success
      window.location.href = "/";
    } else {
      setError(result.error || "Login failed");
    }
  }

  return (
    <Card className="border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleAction} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              className="h-11"
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              className="h-11"
              required
              autoComplete="current-password"
            />
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
