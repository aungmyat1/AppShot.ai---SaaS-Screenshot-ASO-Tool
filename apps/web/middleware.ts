import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)", "/api/(.*)"]);
const isPublicApi = createRouteMatcher(["/api/stripe/webhook(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isPublicApi(req)) return;
  if (isProtectedRoute(req)) auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};

