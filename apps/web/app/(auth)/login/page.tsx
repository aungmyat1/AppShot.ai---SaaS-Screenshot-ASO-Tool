import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Login • GetAppShots",
};

export default function LoginPage() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return (
      <div className="mx-auto max-w-md space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="text-sm text-muted-foreground">
          Clerk is not configured. Set <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
          to enable authentication.
        </p>
      </div>
    );
  }
  return (
    <div className="flex min-h-[70dvh] items-center justify-center">
      <SignIn routing="path" path="/login" signUpUrl="/register" />
    </div>
  );
}

