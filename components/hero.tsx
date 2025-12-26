import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { navigate } from "next/dist/client/components/segment-cache-impl/navigation";
import Link from "next/link";
import { redirect } from "next/navigation";

export function Hero() {
  return (
    <section className="container mx-auto px-6 pt-24 pb-20 md:px-8 md:pt-40 md:pb-32 lg:px-12">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          Create amazing content with AI tools
        </h1>
        <p className="mt-8 text-pretty text-lg text-muted-foreground md:text-xl lg:mt-10">
          Your team's toolkit to stop configuring and start innovating. Securely
          build, deploy, and scale the best web experiences with SaaSify.
        </p>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/dashboard">
            <Button size="lg" className="min-w-40">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="min-w-[160px] bg-transparent"
          >
            Explore the Product
          </Button>
        </div>
      </div>
    </section>
  );
}
