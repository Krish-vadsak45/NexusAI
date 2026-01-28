import DashboardSidebar from "@/components/dashboardsidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api
    .getSession({
      headers: await headers(),
    })
    .catch(() => null);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[30] bg-gray-900">
        <DashboardSidebar />
      </div>
      <main className="md:pl-72">
        <div className="h-full p-8">{children}</div>
      </main>
    </div>
  );
}
