import { clerkClient } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

function isAdminEmail(email: string | null | undefined) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!email) return false;
  return list.includes(email.toLowerCase());
}

export async function getOrCreateUser(clerkUserId: string) {
  const existing = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (existing) return existing;

  const client = await clerkClient();
  let user;
  try {
    user = await client.users.getUser(clerkUserId);
  } catch (error: any) {
    // Handle Clerk API errors (e.g., "Resource not found")
    // Clerk errors can come in different formats:
    // 1. Direct error object with message/code
    // 2. Error with errors array: {errors: [{message: "...", code: "..."}]}
    // 3. HTTP error with status code
    
    const errorMessage = error?.message || error?.long_message || String(error);
    const errorCode = error?.status || error?.statusCode || error?.code;
    const errorsArray = error?.errors || [];
    const firstError = errorsArray[0] || {};
    const clerkErrorCode = firstError?.code || error?.clerkErrorCode || error?.code;
    const clerkErrorMessage = firstError?.message || firstError?.long_message || errorMessage;
    
    // Check for "not found" errors in multiple ways:
    // 1. HTTP status code 404
    // 2. Error message contains "not found" or "resource_not_found"
    // 3. Clerk error code is "resource_not_found"
    // 4. Error in errors array has "resource_not_found" code
    const isNotFoundError =
      errorCode === 404 ||
      clerkErrorCode === "resource_not_found" ||
      clerkErrorMessage?.toLowerCase().includes("not found") ||
      clerkErrorMessage?.toLowerCase().includes("resource_not_found") ||
      errorMessage.toLowerCase().includes("not found") ||
      errorMessage.toLowerCase().includes("resource_not_found");
    
    if (isNotFoundError) {
      console.warn(
        `Clerk user ${clerkUserId} not found (code: ${clerkErrorCode || errorCode}, trace: ${error?.clerk_trace_id || "N/A"}), creating minimal user record`
      );
      return prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: `user-${clerkUserId}@unknown.example.com`,
          name: null,
          isAdmin: false,
        },
      });
    }
    
    // Re-throw other errors with more context
    console.error(`Clerk API error for user ${clerkUserId}:`, {
      message: errorMessage,
      code: clerkErrorCode || errorCode,
      traceId: error?.clerk_trace_id,
      error,
    });
    throw error;
  }
  
  const primaryEmail = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress;

  return prisma.user.create({
    data: {
      clerkId: clerkUserId,
      email: primaryEmail || "unknown@example.com",
      name: user.fullName || user.username || null,
      isAdmin: isAdminEmail(primaryEmail),
    },
  });
}

export async function requireAdmin(clerkUserId: string) {
  const user = await getOrCreateUser(clerkUserId);
  if (!user.isAdmin) {
    const err = new Error("Forbidden");
    // @ts-expect-error - attach status for route handlers
    err.status = 403;
    throw err;
  }
  return user;
}

