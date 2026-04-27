// app/dashboard/layout.tsx
import DashboardSidebar from "@/features/dashboard/components/DashboardSidebar";
import { auth } from "@/features/auth/server/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MobileSidebar } from "@/components/mobile-sidebar";

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
    <div className="h-full relative flex flex-col md:flex-row">
      {/* Mobile Navbar with Sidebar Trigger */}
      <div className="flex md:hidden items-center p-4 border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-40 h-16">
        <MobileSidebar />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-30 bg-black border-r border-white/5">
        <DashboardSidebar />
      </div>

      <main className="flex-1 md:ml-72 min-h-screen">
        <div className="h-full p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
