// components/navbar.tsx
"use client";

import Link from "next/link";
import AuthButtons from "@/features/marketing/components/NavbarAuthButtons";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const routes: Record<string, string> = {
    Home: "/",
    Features: "/features",
    Pricing: "/pricing",
    About: "/about",
    Contact: "/contact",
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl transition-all duration-300 supports-backdrop-filter:bg-black/60">
      <div className="absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-32 transition-transform duration-300 group-hover:scale-110">
            <Image
              src="/logo-1.png"
              alt="NexusAI Logo"
              fill
              sizes="(max-width: 768px) 100vw, 128px"
              loading="eager"
              className="object-contain"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {["Home", "Features", "Pricing", "About", "Contact"].map((item) => (
            <Link
              key={item}
              href={routes[item] || `/#${item.toLowerCase()}`}
              className="relative px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors group rounded-full hover:bg-white/5"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <ul className="flex items-center gap-4 list-none">
            <AuthButtons />
          </ul>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:bg-white/10"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-2xl border-b border-white/5 animate-in slide-in-from-top duration-300">
          <div className="px-6 py-8 space-y-6">
            <div className="flex flex-col gap-4">
              {["Home", "Features", "Pricing", "About", "Contact"].map(
                (item) => (
                  <Link
                    key={item}
                    href={routes[item] || `/#${item.toLowerCase()}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                ),
              )}
            </div>

            <div className="pt-6 border-t border-white/10">
              <ul className="flex flex-col gap-4 list-none p-0">
                <AuthButtons />
              </ul>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
