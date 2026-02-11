import { headers } from "next/headers";
import { getAdminContext } from "@/lib/admin";
import { getAdminMetrics, getAdminUsers } from "@/lib/admin-queries";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const admin = await getAdminContext(await headers());
  if (!admin.ok) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-neutral-500">
            Access denied
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Admin only</h1>
          <p className="mt-3 text-sm text-neutral-400">
            {admin.status === 401
              ? "Please sign in with an admin account."
              : "You do not have permission to view this page."}
          </p>
        </div>
      </main>
    );
  }

  const [metrics, users] = await Promise.all([
    getAdminMetrics(),
    getAdminUsers({ page: 1, limit: 20 }),
  ]);

  return <AdminDashboard initialMetrics={metrics} initialUsers={users} />;
}
