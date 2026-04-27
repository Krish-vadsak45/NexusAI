"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function CtaSection() {
  return (
    <section className="relative border-t border-white/5 bg-black py-24 md:py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-full max-w-4xl bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container relative mx-auto px-6 text-center"
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="text-balance text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
            Ready to accelerate your{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-400">
              content creation?
            </span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg text-gray-400 md:text-xl leading-relaxed">
            Join 50,000+ creators and developers building the future of video.
            Start shipping pixel-perfect content today.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row"
          >
            <Button
              size="lg"
              className="h-14 min-w-48 bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 transition-all duration-300 rounded-full text-lg font-semibold shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            >
              Start for free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 min-w-48 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all rounded-full text-lg font-semibold backdrop-blur-sm"
            >
              Talk to sales
            </Button>
          </motion.div>

          <div className="mt-16 flex items-center justify-center space-x-8 opacity-40">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-white">
              Trusted by teams at
            </span>
            {/* Minimal icons or text for trust */}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
