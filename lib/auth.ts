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
  const user = await client.users.getUser(clerkUserId);
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

