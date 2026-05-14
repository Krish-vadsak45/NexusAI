// components/navbar.tsx
"use client";

import Link from "next/link";
import AuthButtons from "@/features/marketing/components/NavbarAuthButtons";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const routes = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <nav className="navbar-ui sticky top-0 z-50 w-full bg-black backdrop-blur-2xl px-4 pt-4 sm:px-6">
      <div className=" mx-auto flex h-18 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-5 lg:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <div className="relative flex h-11 items-center">
            <Image
              src="/logo-1.png"
              alt="NexusAI Logo"
              width={128}
              height={41}
              priority
              className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
        </Link>

        <div className="hidden items-center justify-center md:flex md:flex-1">
          <div className="flex items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] p-1">
            {routes.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "navbar-link",
                  pathname === item.href && "navbar-link-active",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:flex md:items-center md:justify-end">
          <AuthButtons />
        </div>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="h-11 w-11 rounded-full border border-white/10 bg-white/[0.05] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:bg-white/[0.09]"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="mx-auto mt-3 w-full max-w-7xl md:hidden">
          <div className="navbar-mobile-panel animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <div className="grid gap-2">
              {routes.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "navbar-link flex h-12 items-center justify-between px-4",
                    pathname === item.href && "navbar-link-active",
                  )}
                >
                  <span>{item.label}</span>
                  <span className="text-xs uppercase tracking-[0.22em] text-white/30">
                    0{routes.findIndex((route) => route.href === item.href) + 1}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-5 border-t border-white/8 pt-5">
              <AuthButtons />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
