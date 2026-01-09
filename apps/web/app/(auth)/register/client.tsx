"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRegister } from "@/lib/auth/client";

const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((v) => v.password === v.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

type FormValues = z.infer<typeof schema>;

export function RegisterClient() {
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    setOk(false);
    setLoading(true);
    try {
      await apiRegister({ email: values.email, password: values.password });
      setOk(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
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
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Confirm password</label>
        <Input type="password" {...form.register("confirmPassword")} />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {ok ? (
        <p className="text-sm text-muted-foreground">
          Registered. Check server logs for the email verification token, then verify via the API.
        </p>
      ) : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Creating…" : "Create account"}
      </Button>
      <p className="text-sm text-muted-foreground">
        Already have an account? <Link className="underline" href="/login">Login</Link>
      </p>
    </form>
  );
}

