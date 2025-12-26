import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="border-y border-border bg-foreground py-16 text-background md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          Ready to accelerate your development?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-background/80">
          Join thousands of teams building the future of the web. Start shipping
          faster today.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" variant="secondary" className="min-w-[160px]">
            Start for free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="min-w-[160px] border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background"
          >
            Talk to sales
          </Button>
        </div>
      </div>
    </section>
  );
}
