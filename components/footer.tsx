import Link from "next/link";
import Image from "next/image";

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
    <footer className="border-t border-border bg-secondary">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
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
            <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">
              Empowering creators and developers with the next generation of
              artificial intelligence tools.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-semibold">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href={link === "About" ? "/about" : "#"}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
          <p>&copy; 2025 SaaSify. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
