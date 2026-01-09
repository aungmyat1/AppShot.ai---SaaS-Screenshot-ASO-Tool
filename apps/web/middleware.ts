import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);
const isProtectedApi = createRouteMatcher(["/api/(.*)"]);
const isPublicApi = createRouteMatcher(["/api/stripe/webhook(.*)", "/api/webhooks/stripe(.*)", "/api/auth/(.*)"]);

const authMode = process.env.NEXT_PUBLIC_AUTH_MODE || process.env.AUTH_MODE || "clerk";

export default clerkMiddleware((auth, req) => {
  if (isPublicApi(req)) return;

  if (authMode === "fastapi") {
    // Cookie-based guard for pages; API auth happens inside Next route handlers.
    if (isProtectedRoute(req)) {
      const hasAccess = req.cookies.get("access_token")?.value;
      if (!hasAccess) {
        const url = new URL("/login", req.url);
        url.searchParams.set("next", req.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
    }
    // Don't protect app APIs here (we expose /api/auth/* and internal APIs have their own auth).
    if (isProtectedApi(req)) return;
    return;
  }

  // Default Clerk protection
  if (isProtectedRoute(req) || isProtectedApi(req)) auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};

