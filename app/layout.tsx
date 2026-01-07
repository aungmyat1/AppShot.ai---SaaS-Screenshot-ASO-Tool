import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

import "./globals.css";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "GetAppShots",
  description: "Scrape App Store screenshots and download them as ZIPs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const appShell = (
    <>
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">
            GetAppShots
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            {publishableKey ? (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button size="sm">Sign in</Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </>
            ) : (
              <Button size="sm" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="container py-10">{children}</main>
    </>
  );

  return (
    <html lang="en">
      <body className="min-h-dvh bg-background text-foreground">
        {publishableKey ? <ClerkProvider publishableKey={publishableKey}>{appShell}</ClerkProvider> : appShell}
      </body>
    </html>
  );
}

