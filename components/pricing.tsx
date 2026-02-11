"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Check, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import axios from "axios";
import { motion, Variants } from "framer-motion";

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
        globalThis.location.href = data.url;
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
      icon: <Zap className="h-6 w-6 text-blue-400" />,
      color: "blue",
    },
    {
      id: PLANS.PRO.id,
      name: PLANS.PRO.name,
      price: `$${PLANS.PRO.price}`,
      description: "Ideal for growing teams and businesses",
      features: [
        `${PLANS.PRO.limits.articlesPerDay} Articles/day`,
        `${PLANS.PRO.limits.imagesPerDay} Images/day`,
        `${PLANS.PRO.limits.backgroundRemovalsPerDay} BG Removals/day`,
        `${PLANS.PRO.limits.objectRemovalsPerDay} Object Removals/day`,
        `${PLANS.PRO.limits.resumeReviewsPerDay} Resume Reviews/day`,
        `${PLANS.PRO.limits.textSummariesPerDay} Summaries/day`,
        `${PLANS.PRO.limits.codeGenerationsPerDay} Code Gens/day`,
        `${PLANS.PRO.limits.tokensPerMonth.toLocaleString()} Tokens/month`,
      ],
      cta: "Start Free Trial",
      variant: "default" as const,
      popular: true,
      icon: <Sparkles className="h-6 w-6 text-purple-400" />,
      color: "purple",
    },
    {
      id: PLANS.PREMIUM.id,
      name: PLANS.PREMIUM.name,
      price: `$${PLANS.PREMIUM.price}`,
      description: "For enterprises that need maximum power",
      features: [
        `${PLANS.PREMIUM.limits.articlesPerDay} Articles/day`,
        `${PLANS.PREMIUM.limits.imagesPerDay} Images/day`,
        `${PLANS.PREMIUM.limits.resumeReviewsPerDay} Resume Reviews/day`,
        `${PLANS.PREMIUM.limits.videoRepurposePerDay} Video Tools/day`,
        `${PLANS.PREMIUM.limits.maxWords} Words/article`,
        `${PLANS.PREMIUM.limits.tokensPerMonth.toLocaleString()} Tokens/month`,
        "Priority 24/7 Support",
        "API Access (Coming Soon)",
      ],
      cta: "Go Premium",
      variant: "outline" as const,
      icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
      color: "emerald",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="container mx-auto px-6 py-20 md:px-8 md:py-32 lg:px-12 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-linear-to-b from-blue-500/5 via-transparent to-transparent -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-3xl text-center mb-16 md:mb-24"
      >
        <h2 className="text-balance text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-linear-to-r from-white via-white to-white/60">
          Supercharge your workflow
        </h2>
        <p className="mt-6 text-pretty text-lg text-gray-400 md:text-xl max-w-2xl mx-auto">
          From solo creators to full-scale enterprises, we have the tools you
          need to build faster and smarter.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-8 md:grid-cols-3 lg:gap-10 perspective-1000"
      >
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const isProcessing = isLoading === plan.id;

          let buttonContent;
          if (isProcessing) {
            buttonContent = (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            );
          } else if (isCurrentPlan) {
            buttonContent = "Active Plan";
          } else {
            buttonContent = plan.cta;
          }

          let cardClassName =
            "relative h-full flex flex-col border-white/10 transition-all duration-300 backdrop-blur-md overflow-hidden bg-black/40 ";
          if (isCurrentPlan) {
            cardClassName +=
              "border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]";
          } else if (plan.popular) {
            cardClassName +=
              "border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.15)] scale-105 z-10";
          } else {
            cardClassName += "hover:border-white/20";
          }

          return (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className={cardClassName}>
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 overflow-hidden w-24 h-24">
                    <div className="absolute top-4 -right-8 w-[140%] py-1 bg-emerald-500 text-white text-[10px] uppercase font-bold text-center rotate-45 shadow-lg">
                      Current
                    </div>
                  </div>
                )}

                {!isCurrentPlan && plan.popular && (
                  <div className="absolute top-0 right-0 overflow-hidden w-24 h-24">
                    <div className="absolute top-4 -right-8 w-[140%] py-1 bg-purple-500 text-white text-[10px] uppercase font-bold text-center rotate-45 shadow-lg flex items-center justify-center gap-1">
                      <Sparkles className="h-3 w-3" /> Best Value
                    </div>
                  </div>
                )}

                <CardHeader className="p-8 pb-4">
                  <div className="mb-4 inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 w-fit border border-white/5 shadow-inner">
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white/90">
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tight text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 font-medium">/month</span>
                  </div>
                  <p className="mt-4 text-sm text-gray-400 leading-relaxed min-h-10">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="flex-1 p-8 pt-4">
                  <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent mb-8" />
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-sm text-gray-300"
                      >
                        <div
                          className={`mt-0.5 p-0.5 rounded-full ${plan.popular ? "bg-purple-500/20" : "bg-emerald-500/20"}`}
                        >
                          <Check
                            className={`h-3 w-3 ${plan.popular ? "text-purple-400" : "text-emerald-400"}`}
                          />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-8 pt-0 mt-auto">
                  <Button
                    variant={isCurrentPlan ? "outline" : plan.variant}
                    className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                      plan.popular && !isCurrentPlan
                        ? "bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-none shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                        : "hover:bg-white/5"
                    }`}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isProcessing || isCurrentPlan}
                  >
                    {buttonContent}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-20 text-center text-gray-400 text-sm"
      >
        <p>
          Need a custom solution for your business?{" "}
          <button className="text-blue-400 hover:underline">
            Contact our sales team
          </button>
        </p>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-32 max-w-4xl mx-auto"
      >
        <h3 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              q: "Can I cancel my subscription anytime?",
              a: "Yes, you can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing cycle.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards including Visa, Mastercard, and American Express via Stripe's secure payment gateway.",
            },
            {
              q: "How do tokens work?",
              a: "Tokens are used for AI generations. Each tool consumes a specific number of tokens. Your token balance resets every month.",
            },
            {
              q: "Do you offer discounts for students?",
              a: "Yes! If you're a student or educator, contact our support team for a special educational discount.",
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
            >
              <h4 className="font-semibold text-white mb-2">{faq.q}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
