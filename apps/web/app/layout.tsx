import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Button } from "@/components/ui/button";
import { Providers } from "@/app/providers";
import { ThemeToggle } from "@/components/theme-toggle";
import { CookieConsent } from "@/components/CookieConsent";

// Validate Clerk publishable key format
const rawPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isValidClerkKey = rawPublishableKey && 
  (rawPublishableKey.startsWith('pk_test_') || rawPublishableKey.startsWith('pk_live_')) &&
  rawPublishableKey.length > 50;

// Only import Clerk if key is valid - use lazy loading to prevent build-time validation
// This prevents Clerk from validating the key during the build process
const getClerkComponents = () => {
  if (!isValidClerkKey) return null;
  try {
    // Use require with a function to delay evaluation
    const clerk = require("@clerk/nextjs");
    return {
      ClerkProvider: clerk.ClerkProvider,
      SignedIn: clerk.SignedIn,
      SignedOut: clerk.SignedOut,
      SignInButton: clerk.SignInButton,
      SignUpButton: clerk.SignUpButton,
      UserButton: clerk.UserButton,
    };
  } catch {
    return null;
  }
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GetAppShots",
  description: "Scrape App Store screenshots and download them as ZIPs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const publishableKey = isValidClerkKey ? rawPublishableKey : undefined;
  const ClerkComponents = getClerkComponents();

  const appShell = (
    <>
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">
            GetAppShots
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">
              API Docs
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <ThemeToggle />
            {publishableKey && ClerkComponents?.SignedIn && ClerkComponents?.SignedOut ? (
              <>
                <ClerkComponents.SignedOut>
                  <ClerkComponents.SignInButton mode="modal">
                    <Button size="sm" variant="ghost">Sign in</Button>
                  </ClerkComponents.SignInButton>
                  <ClerkComponents.SignUpButton mode="modal">
                    <Button size="sm">Sign up</Button>
                  </ClerkComponents.SignUpButton>
                </ClerkComponents.SignedOut>
                <ClerkComponents.SignedIn>
                  <ClerkComponents.UserButton afterSignOutUrl="/" />
                </ClerkComponents.SignedIn>
              </>
            ) : (
              <Button size="sm" asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="container py-10">{children}</main>
      <CookieConsent />
    </>
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-background text-foreground antialiased`}>
        <Providers>
          {publishableKey && ClerkComponents?.ClerkProvider ? (
            <ClerkComponents.ClerkProvider publishableKey={publishableKey}>{appShell}</ClerkComponents.ClerkProvider>
          ) : (
            appShell
          )}
        </Providers>
      </body>
    </html>
  );
}

