import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);
const isProtectedApi = createRouteMatcher(["/api/(.*)"]);
const isPublicApi = createRouteMatcher(["/api/stripe/webhook(.*)", "/api/webhooks/stripe(.*)", "/api/auth/(.*)"]);

const authMode = process.env.NEXT_PUBLIC_AUTH_MODE || process.env.AUTH_MODE || "clerk";

export default clerkMiddleware((auth, req) => {
  const url = req.nextUrl;

  // ---- HTTPS enforcement (behind a proxy/CDN) ----
  const xfProto = req.headers.get("x-forwarded-proto");
  if ((req.method === "GET" || req.method === "HEAD") && xfProto && xfProto !== "https") {
    const httpsUrl = new URL(req.url);
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl, 308);
  }

  // Prepare default pass-through response so we can attach headers/cookies.
  let res = NextResponse.next();

  // ---- CSRF token (double-submit cookie) ----
  const csrfCookieName = "csrf_token";
  const csrfCookie = req.cookies.get(csrfCookieName)?.value;
  const csrfToken = csrfCookie || crypto.randomUUID();
  if (!csrfCookie) {
    res.cookies.set(csrfCookieName, csrfToken, {
      httpOnly: false,
      sameSite: "lax",
      secure: xfProto ? xfProto === "https" : false,
      path: "/",
    });
  }

  // ---- Basic edge rate limit for API (defense-in-depth; real limiting via WAF/Redis) ----
  const isApi = url.pathname.startsWith("/api/");
  if (isApi) {
    const maxRpm = Number(process.env.RATE_LIMIT_RPM || "120");
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const minute = Math.floor(Date.now() / 60000);
    const key = `${ip}:${req.method}:${url.pathname}:${minute}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g: any = globalThis as any;
    g.__rl = g.__rl || new Map<string, number>();
    const m: Map<string, number> = g.__rl;
    const n = (m.get(key) || 0) + 1;
    m.set(key, n);
    if (n > maxRpm) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  // ---- CSRF enforcement for state-changing API routes ----
  const csrfExempt =
    url.pathname.startsWith("/api/stripe/webhook") ||
    url.pathname.startsWith("/api/webhooks/stripe") ||
    url.pathname.startsWith("/api/health") ||
    url.pathname.startsWith("/api/auth/");
  const needsCsrf =
    isApi &&
    !csrfExempt &&
    (req.method === "POST" || req.method === "PUT" || req.method === "PATCH" || req.method === "DELETE");
  if (needsCsrf) {
    const hdr = req.headers.get("x-csrf-token");
    if (!hdr || hdr !== csrfToken) return NextResponse.json({ error: "Bad CSRF token" }, { status: 403 });
  }

  // ---- Security headers (pages + API) ----
  const enforceCsp = (process.env.CSP_ENFORCE || "").toLowerCase() === "true";
  const isDev = process.env.NODE_ENV === "development";
  
  // In development, allow 'unsafe-eval' for DevTools (React Query DevTools, etc)
  // In production, remove it to prevent eval() execution
  const scriptSrcDirectives = ["'self'", "'unsafe-inline'"];
  if (isDev) {
    scriptSrcDirectives.push("'unsafe-eval'");
  }
  
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' https: data:",
    "style-src 'self' 'unsafe-inline'",
    `script-src ${scriptSrcDirectives.join(" ")}`,
    "connect-src 'self' https:",
  ].join("; ");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (xfProto === "https") res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.headers.set(enforceCsp ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only", csp);

  if (isPublicApi(req)) return;

  if (authMode === "fastapi") {
    // Cookie-based guard for pages; API auth happens inside Next route handlers.
    if (isProtectedRoute(req)) {
      const hasAccess = req.cookies.get("access_token")?.value;
      if (!hasAccess) {
        const url = new URL("/login", req.url);
        url.searchParams.set("next", req.nextUrl.pathname);
        res = NextResponse.redirect(url);
        return res;
      }
    }
    // Don't protect app APIs here (we expose /api/auth/* and internal APIs have their own auth).
    if (isProtectedApi(req)) return res;
    return res;
  }

  // Default Clerk protection
  if (isProtectedRoute(req) || isProtectedApi(req)) auth.protect();
  return res;
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};

