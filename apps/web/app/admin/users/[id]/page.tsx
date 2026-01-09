import { UserAdminDetailClient } from "@/app/admin/users/[id]/ui";

export const dynamic = "force-dynamic";

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  return <UserAdminDetailClient id={params.id} />;
}

