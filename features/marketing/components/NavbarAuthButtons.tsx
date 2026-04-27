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
      <div className="flex items-center gap-4 animate-pulse">
        <div className="h-4 w-12 bg-gray-700/50 rounded" />
        <div className="h-8 w-20 bg-gray-700/50 rounded-md" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="group flex items-center gap-2 px-3 py-2 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="h-6 w-6 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium text-gray-200 group-hover:text-white hidden sm:inline-block">
                {session?.user?.name?.split(" ")[0] || "Account"}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-white group-data-[state=open]:rotate-180 transition-transform duration-300" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-56 p-2 bg-black/90 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl mt-2 overflow-hidden"
            align="end"
          >
            <div className="px-2 py-3 mb-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
                Account
              </p>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white truncate">
                  {session?.user?.name}
                </span>
                <span className="text-xs text-gray-400 truncate">
                  {session?.user?.email}
                </span>
              </div>
            </div>

            <Separator className="bg-white/5 mb-1" />

            <div className="space-y-1">
              <Link href="/dashboard" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Button>
              </Link>

              <Link href="/profile" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Profile Settings</span>
                </Button>
              </Link>
            </div>

            <Separator className="bg-white/5 my-1" />

            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-10 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign out</span>
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/auth/signin"
        className="text-sm font-medium text-gray-400 hover:text-white transition-all duration-200"
      >
        Sign In
      </Link>
      <Link href="/auth/signup">
        <Button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold h-9 px-5 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:scale-105 active:scale-95">
          Get Started
        </Button>
      </Link>
    </div>
  );
}
