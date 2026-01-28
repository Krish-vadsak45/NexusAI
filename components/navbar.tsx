// components/navbar.tsx
import Link from "next/link";
import AuthButtons from "./navbar-auth-buttons";
import Image from "next/image";

export default async function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl transition-all duration-300 supports-[backdrop-filter]:bg-black/60">
      <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-40 w-40 transition-transform duration-300 group-hover:scale-110">
            <Image
              src="/logo-1.png"
              alt="NexusAI Logo"
              fill
              className="object-contain"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {["Home", "Features", "Pricing", "About", "Contact"].map((item) => (
            <Link
              key={item}
              href={
                item === "Home"
                  ? "/"
                  : item === "About"
                  ? "/about"
                  : `/#${item.toLowerCase()}`
              }
              className="relative px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors group rounded-full hover:bg-white/5"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <ul className="flex items-center gap-4">
          <AuthButtons />
        </ul>
      </div>
    </nav>
  );
}
