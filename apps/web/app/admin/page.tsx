export default async function AdminPage() {
  // Admin root: redirect to users
  const { redirect } = await import("next/navigation");
  redirect("/admin/users");
}

