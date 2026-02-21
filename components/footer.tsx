"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function Footer() {
  const footerLinks = {
    Product: [
      "Features",
      "Pricing",
      "Integrations",
      "Changelog",
      "Documentation",
    ],
    Company: ["About", "Blog", "Careers", "Customers", "Partners"],
    Resources: ["Community", "Contact", "Support", "Status", "Terms"],
  };

  return (
    <footer className="border-t border-white/5 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-5"
        >
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-40 w-40">
                <Image
                  src="/logo.png"
                  alt="NexusAI Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-gray-400 leading-relaxed">
              Empowering creators and developers with the next generation of
              artificial intelligence tools.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links], i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * (i + 1), duration: 0.5 }}
            >
              <h3 className="mb-4 text-sm font-semibold text-white">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => {
                  let href = "#";
                  if (link === "About") href = "/about";
                  else if (link === "Pricing") href = "/pricing";
                  else if (link === "Contact") href = "/contact";
                  else if (link === "Features") href = "/features";

                  return (
                    <li key={link}>
                      <Link
                        href={href}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-sm text-gray-500 md:flex-row"
        >
          <p>&copy; 2026 NexusAI Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">
              Cookies
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
