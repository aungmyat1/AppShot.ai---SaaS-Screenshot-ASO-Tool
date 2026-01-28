import { SignIn } from "@clerk/nextjs";

// Validate Clerk key before rendering Clerk components
const rawPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isValidClerkKey =
  rawPublishableKey &&
  (rawPublishableKey.startsWith("pk_test_") ||
    rawPublishableKey.startsWith("pk_live_")) &&
  rawPublishableKey.length > 50;

export default function Page() {
  if (!isValidClerkKey) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Authentication not configured</h1>
          <p className="text-muted-foreground mt-2">
            Please configure Clerk authentication to use this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}

