import { cookies } from "next/headers";

export function apiBaseUrl() {
  return process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
}

export function setAuthCookies(params: { accessToken: string; refreshToken: string }) {
  const cookieStore = cookies();
  cookieStore.set("access_token", params.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  cookieStore.set("refresh_token", params.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function clearAuthCookies() {
  const cookieStore = cookies();
  cookieStore.set("access_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  cookieStore.set("refresh_token", "", { httpOnly: true, path: "/", maxAge: 0 });
}

