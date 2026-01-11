"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiLogin } from "@/lib/auth/client";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  totpCode: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(5, s);
}

export function LoginClient() {
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", totpCode: "" },
  });

  const pw = form.watch("password");
  const pwScore = strength(pw || "");

  async function onSubmit(values: FormValues) {
    setError(null);
    setLoading(true);
    try {
      await apiLogin({ email: values.email, password: values.password, totpCode: values.totpCode || undefined });
      window.location.href = "/dashboard/overview";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm font-medium">Email</label>
        <Input type="email" {...form.register("email")} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Password</label>
        <Input type="password" {...form.register("password")} />
        <div className="text-xs text-muted-foreground">Strength: {pwScore}/5</div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">MFA code (if enabled)</label>
        <Input inputMode="numeric" placeholder="123456" {...form.register("totpCode")} />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-sm text-muted-foreground">
        No account? <Link className="underline" href="/register">Register</Link>
      </p>
    </form>
  );
}

