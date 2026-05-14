import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/features/marketing/components/Navbar";
import NavbarWrapper from "@/components/NavbarWrapper";
import { Toaster } from "@/components/ui/sonner";
import Providers from "./components/Providers";
import LazyCustomCursor from "@/components/LazyCustomCursor";

export const metadata: Metadata = {
  title: "NexusAI | AI Creative Suite",
  description:
    "NexusAI helps teams create visuals, content, and code faster with a polished AI workflow suite.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className="antialiased">
        <LazyCustomCursor />
        <Providers>
          <NavbarWrapper>
            <Navbar />
          </NavbarWrapper>
          {children}
        </Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
