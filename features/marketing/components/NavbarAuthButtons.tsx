"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useBetterAuthSession } from "@/app/components/BetterAuthSessionProvider";
import { LayoutDashboard, User, LogOut, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export default function AuthButtons() {
  const { session, loading } = useBetterAuthSession() || {
    session: null,
    loading: true,
  };
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
    router.push("/auth/signin");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="h-11 w-24 rounded-full bg-white/8" />
        <div className="h-11 w-32 rounded-full bg-white/12" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="group h-11 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[0.68rem] font-bold text-black">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="hidden max-w-28 truncate sm:inline-block">
                {session?.user?.name?.split(" ")[0] || "Account"}
              </span>
              <ChevronDown className="h-4 w-4 text-white/45 transition-transform duration-300 group-hover:text-white group-data-[state=open]:rotate-180" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="mt-2 w-60 overflow-hidden rounded-3xl border border-white/10 bg-[#101114]/95 p-2 shadow-2xl backdrop-blur-xl"
            align="end"
          >
            <div className="px-2 py-3 mb-1">
              <p className="mb-1 px-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/40">
                Account
              </p>
              <div className="flex flex-col">
                <span className="truncate text-sm font-semibold text-white">
                  {session?.user?.name}
                </span>
                <span className="truncate text-xs text-white/55">
                  {session?.user?.email}
                </span>
              </div>
            </div>

            <Separator className="mb-1 bg-white/6" />

            <div className="space-y-1">
              <Link href="/dashboard" className="block">
                <Button
                  variant="ghost"
                  className="h-11 w-full justify-start gap-2 rounded-2xl text-sm font-medium text-white/72 transition-all duration-200 hover:bg-white/[0.05] hover:text-white"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>

              <Link href="/profile" className="block">
                <Button
                  variant="ghost"
                  className="h-11 w-full justify-start gap-2 rounded-2xl text-sm font-medium text-white/72 transition-all duration-200 hover:bg-white/[0.05] hover:text-white"
                >
                  <User className="h-4 w-4" />
                  <span>Profile Settings</span>
                </Button>
              </Link>
            </div>

            <Separator className="my-1 bg-white/6" />

            <Button
              variant="ghost"
              className="h-11 w-full justify-start gap-2 rounded-2xl text-sm font-medium text-rose-300 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-200"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Link
        href="/auth/signin"
        className="flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-white/72 transition-all duration-200 hover:border-white/18 hover:bg-white/[0.07] hover:text-white"
      >
        Sign In
      </Link>
      <Link href="/auth/signup">
        <Button className="h-11 rounded-full bg-white px-5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-black shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition-all duration-300 hover:bg-white/92 hover:text-black">
          Get Started
        </Button>
      </Link>
    </div>
  );
}
