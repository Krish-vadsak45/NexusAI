// components/navbar.tsx
import Link from "next/link";
import { Button } from "./ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AuthButtons from "./navbar-auth-buttons";

export default async function Navbar() {
  // Server-side only: render static links, auth buttons are client-side

  return (
    <nav
      className="w-full px-6 py-4 flex items-center justify-between bg-black/80 text-white shadow-lg border-b border-gray-800 sticky top-0 z-50"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-blue-400"
        >
          NexusAI
        </Link>
      </div>
      <nav className="hidden items-center gap-6 md:flex">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Home
        </Link>
        <Link
          href="#features"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Features
        </Link>
        <Link
          href="#pricing"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Pricing
        </Link>
        <Link
          href="#about"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          About
        </Link>
        <Link
          href="#contact"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Contact
        </Link>
      </nav>
      <ul className="flex items-center gap-6 text-sm font-medium">
        <AuthButtons />
      </ul>
    </nav>
  );
}
