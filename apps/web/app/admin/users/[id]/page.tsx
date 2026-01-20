import { UserAdminDetailClient } from "@/app/admin/users/[id]/ui";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserAdminDetailClient id={id} />;
}

