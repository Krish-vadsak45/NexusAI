"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import axios from "axios";

export function Pricing() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session) {
      const fetchProfile = async () => {
        try {
          const { data } = await axios.get("/api/profile");
          if (data.user.subscription) {
            setCurrentPlan(data.user.subscription.planId);
          }
        } catch (error) {
          console.error("Failed to fetch profile", error);
        }
      };
      fetchProfile();
    }
  }, [session]);

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (planId === "free") {
      router.push("/dashboard");
      return;
    }

    setIsLoading(planId);

    try {
      const { data } = await axios.post("/api/stripe/checkout", { planId });

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const plans = [
    {
      id: PLANS.FREE.id,
      name: PLANS.FREE.name,
      price: `$${PLANS.FREE.price}`,
      description: "Perfect for personal projects and getting started",
      features: [
        `${PLANS.FREE.limits.articlesPerDay} Articles/day`,
        `${PLANS.FREE.limits.titlesPerDay} Titles/day`,
        `${PLANS.FREE.limits.maxWords} Words/article`,
        `${PLANS.FREE.limits.tokensPerMonth.toLocaleString()} Tokens/month`,
      ],
      cta: "Get Started",
      variant: "outline" as const,
    },
    {
      id: PLANS.PRO.id,
      name: PLANS.PRO.name,
      price: `$${PLANS.PRO.price}`,
      description: "Ideal for growing teams and businesses",
      features: [
        `${PLANS.PRO.limits.articlesPerDay} Articles/day`,
        `${PLANS.PRO.limits.titlesPerDay} Titles/day`,
        `${PLANS.PRO.limits.imagesPerDay} Images/day`,
        `${PLANS.PRO.limits.backgroundRemovalsPerDay} BG Removals/day`,
        `${PLANS.PRO.limits.objectRemovalsPerDay} Object Removals/day`,
        `${PLANS.PRO.limits.resumeReviewsPerDay} Resume Reviews/day`,
        `${PLANS.PRO.limits.textSummariesPerDay} Summaries/day`,
        `${PLANS.PRO.limits.codeGenerationsPerDay} Code Gens/day`,
        `${PLANS.PRO.limits.maxWords} Words/article`,
        `${PLANS.PRO.limits.tokensPerMonth.toLocaleString()} Tokens/month`,
      ],
      cta: "Start Free Trial",
      variant: "default" as const,
      popular: true,
    },
    {
      id: PLANS.PREMIUM.id,
      name: PLANS.PREMIUM.name,
      price: `$${PLANS.PREMIUM.price}`,
      description: "For enterprises that need maximum power",
      features: [
        `${PLANS.PREMIUM.limits.articlesPerDay} Articles/day`,
        `${PLANS.PREMIUM.limits.titlesPerDay} Titles/day`,
        `${PLANS.PREMIUM.limits.imagesPerDay} Images/day`,
        `${PLANS.PREMIUM.limits.backgroundRemovalsPerDay} BG Removals/day`,
        `${PLANS.PREMIUM.limits.objectRemovalsPerDay} Object Removals/day`,
        `${PLANS.PREMIUM.limits.resumeReviewsPerDay} Resume Reviews/day`,
        `${PLANS.PREMIUM.limits.textSummariesPerDay} Summaries/day`,
        `${PLANS.PREMIUM.limits.codeGenerationsPerDay} Code Gens/day`,
        `${PLANS.PREMIUM.limits.maxWords} Words/article`,
        `${PLANS.PREMIUM.limits.tokensPerMonth.toLocaleString()} Tokens/month`,
      ],
      cta: "Contact Sales",
      variant: "outline" as const,
    },
  ];

  return (
    <section className="container mx-auto px-6 py-20 md:px-8 md:py-32 lg:px-12">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          Simple, transparent pricing
        </h2>
        <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
          Choose the perfect plan for your needs. Always flexible to scale as
          you grow.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3 lg:mt-20 lg:gap-10">
        {plans.map((plan, index) => {
          const isCurrentPlan = currentPlan === plan.id;

          return (
            <Card
              key={index}
              className={`relative flex flex-col border-border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                isCurrentPlan
                  ? "border-2 border-green-500 shadow-xl scale-105 z-10 bg-card"
                  : plan.popular
                  ? "border-2 border-primary shadow-xl scale-105 z-10 bg-card"
                  : "hover:border-primary/50 bg-card/50"
              }`}
            >
              {isCurrentPlan ? (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-fit rounded-full bg-green-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg ring-4 ring-background">
                  Current Plan
                </div>
              ) : plan.popular ? (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-primary to-primary/90 px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-lg ring-4 ring-background">
                  Most Popular
                </div>
              ) : null}
              <CardHeader className="p-6 pb-4 lg:p-8 lg:pb-6">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="ml-2 text-muted-foreground">/month</span>
                </div>
                <p className="mt-4 text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-4 lg:p-8 lg:pt-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0 lg:p-8 lg:pt-0">
                <Button
                  variant={isCurrentPlan ? "secondary" : plan.variant}
                  className="w-full"
                  size="lg"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading === plan.id || isCurrentPlan}
                >
                  {isCurrentPlan ? "Current Plan" : plan.cta}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
