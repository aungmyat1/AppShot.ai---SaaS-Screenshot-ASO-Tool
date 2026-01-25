"use client";

import * as React from "react";
import { Lock, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Step = "password" | "email" | "done";

export function PreviewGate() {
  const [step, setStep] = React.useState<Step>("password");
  const [password, setPassword] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pwError, setPwError] = React.useState<string | null>(null);
  const [pwLoading, setPwLoading] = React.useState(false);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [emailLoading, setEmailLoading] = React.useState(false);

  const onPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwLoading(true);
    try {
      const res = await fetch("/api/waitlist/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid password");
      setStep("email");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Invalid password");
    } finally {
      setPwLoading(false);
    }
  };

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailLoading(true);
    try {
      const res = await fetch("/api/waitlist/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      setStep("done");
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setEmailLoading(false);
    }
  };

  if (step === "done") {
    return (
      <Card className="w-full border-2 border-slate-300 bg-white p-8 shadow-lg dark:border-slate-600 dark:bg-slate-800">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            You&apos;re on the list
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            We&apos;ll notify you at <span className="font-medium text-slate-900 dark:text-slate-100">{email}</span> when we launch.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full border-2 border-slate-300 bg-white p-8 shadow-lg dark:border-slate-600 dark:bg-slate-800">
      <div className="flex flex-col items-center text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-700">
          <Lock className="h-7 w-7 text-slate-700 dark:text-slate-300" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {step === "password" ? "Preview access" : "Join the waitlist"}
        </h1>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          {step === "password"
            ? "This site is in development. Enter the password to continue."
            : "Get notified when we launch. No spam."}
        </p>
      </div>

      {step === "password" && (
        <form onSubmit={onPasswordSubmit} className="mt-6 space-y-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 border-2 border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            autoFocus
          />
          {pwError && <p className="text-sm font-medium text-red-600 dark:text-red-400">{pwError}</p>}
          <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300" disabled={pwLoading}>
            {pwLoading ? "Checking…" : "Continue"}
          </Button>
        </form>
      )}

      {step === "email" && (
        <form onSubmit={onEmailSubmit} className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <label htmlFor="email" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Email
            </label>
          </div>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 border-2 border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            autoFocus
          />
          {emailError && <p className="text-sm font-medium text-red-600 dark:text-red-400">{emailError}</p>}
          <Button type="submit" variant="outline" className="w-full border-2 border-slate-400 bg-slate-50 text-slate-900 hover:bg-slate-100 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600" disabled={emailLoading}>
            {emailLoading ? "Submitting…" : "Notify me"}
          </Button>
        </form>
      )}
    </Card>
  );
}
