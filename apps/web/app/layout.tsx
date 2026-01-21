import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider, SignedIn, SignedOut, SignUpButton, SignInButton, UserButton } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Button } from "@/components/ui/button";
import { Providers } from "@/app/providers";
import { ThemeToggle } from "@/components/theme-toggle";
import { CookieConsent } from "@/components/CookieConsent";

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
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

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
            {publishableKey ? (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button size="sm" variant="ghost">Sign in</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm">Sign up</Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
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
          {publishableKey ? <ClerkProvider publishableKey={publishableKey}>{appShell}</ClerkProvider> : appShell}
        </Providers>
      </body>
    </html>
  );
}

