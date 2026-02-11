"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

export function Hero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="relative container mx-auto px-6 pt-24 pb-20 md:px-8 md:pt-40 md:pb-32 lg:px-12 overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-4xl text-center relative z-10"
      >
        <motion.div
          variants={itemVariants}
          className="mb-8 flex justify-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Introducing NexusAI 2.0
            </span>
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-balance text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl bg-linear-to-b from-white via-white to-white/40 bg-clip-text text-transparent"
        >
          Create amazing content with AI tools
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="mt-8 text-pretty text-lg text-gray-400 md:text-xl lg:mt-10 max-w-2xl mx-auto"
        >
          Your team's toolkit to stop configuring and start innovating. Securely
          build, deploy, and scale the best web experiences with NexusAI.
        </motion.p>
        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link href="/dashboard">
            <Button
              size="lg"
              className="min-w-40 h-12 text-base bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="min-w-40 h-12 text-base border-white/10 bg-transparent hover:bg-white/5 transition-all"
          >
            Explore the Product
          </Button>
        </motion.div>
      </motion.div>

      {/* Hero background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 blur-[150px] rounded-full -z-10" />
    </section>
  );
}
