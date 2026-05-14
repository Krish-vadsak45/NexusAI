"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Wand2, Shield, Rocket, Zap } from "lucide-react";
import Link from "next/link";
import {
  motion,
  Variants,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import React, { useEffect, useRef, useMemo, memo } from "react";
import type { FloatingNodeProps } from "@/lib/shared-types";
import { useIsMobile } from "@/lib/use-mobile";

// Memoize sub-components to prevent unnecessary re-renders when the parent's mouse values change
const KineticBlob = memo(
  ({
    color,
    position,
    size,
    delay,
  }: {
    color: string;
    position: string;
    size: string;
    delay: number;
  }) => (
    <motion.div
      animate={{
        x: [0, 30, 0, -30, 0],
        y: [0, -30, 0, 30, 0],
        scale: [1, 1.1, 0.9, 1.1, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        delay,
        ease: "linear",
      }}
      className={`absolute ${position} ${size} ${color} blur-[120px] rounded-full opacity-30 pointer-events-none will-change-transform`}
    />
  ),
);
KineticBlob.displayName = "KineticBlob";

const FloatingNode = memo(
  ({ position, icon, label, duration = 10 }: FloatingNodeProps) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0.3, 0.6, 0.3],
        y: [0, -20, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute ${position} hidden xl:flex flex-col items-center gap-3 pointer-events-none`}
    >
      <div className="h-16 w-16 flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl transition-colors hover:border-white/20">
        <div className="scale-125">{icon}</div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
        {label}
      </span>
    </motion.div>
  ),
);
FloatingNode.displayName = "FloatingNode";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // High-performance direct motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Snappier spring configuration: less damping, higher stiffness for "instant" feel
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  // Dynamic window size tracking for accurate 3D tilt
  const [windowSize, setWindowSize] = React.useState({
    width: 2000,
    height: 1000,
  });

  useEffect(() => {
    if (isMobile) {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      return;
    }

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();

    const handleMouseMove = (e: MouseEvent) => {
      // Direct updates to motion values (avoids React state cycle)
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile, mouseX, mouseY]);

  // Using useMotionTemplate for string interpolation is significantly faster
  // because it updates the CSS variable directly without generating a new JS string per frame
  const background = useMotionTemplate`radial-gradient(1200px circle at ${mouseXSpring}px ${mouseYSpring}px, rgba(59, 130, 246, 0.15), transparent 80%)`;

  const rotateX = useTransform(
    mouseYSpring,
    [0, windowSize.height],
    isMobile ? [0, 0] : [7, -7],
  );
  const rotateY = useTransform(
    mouseXSpring,
    [0, windowSize.width],
    isMobile ? [0, 0] : [-7, 7],
  );

  const containerVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2,
        },
      },
    }),
    [],
  );

  const itemVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 1,
          ease: [0.19, 1, 0.22, 1],
        },
      },
    }),
    [],
  );

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black pb-16 pt-20 selection:bg-blue-500/30 md:pb-20 md:pt-24"
    >
      {/* Background Layer - Optimized with will-change */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {isMobile ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)] opacity-70" />
        ) : (
          <motion.div
            className="absolute inset-0 opacity-50 will-change-[background]"
            style={{ background }}
          />
        )}

        {/* Dynamic decorative grid */}
        <div className="hero-noise-overlay absolute inset-0 opacity-10 mix-blend-soft-light" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

        {!isMobile && (
          <>
            <KineticBlob
              color="bg-blue-600/20"
              position="top-[10%] left-[15%]"
              size="w-[600px] h-[600px]"
              delay={0}
            />
            <KineticBlob
              color="bg-purple-600/15"
              position="bottom-[10%] right-[10%]"
              size="w-[500px] h-[500px]"
              delay={2}
            />
            <KineticBlob
              color="bg-emerald-600/10"
              position="top-[40%] right-[20%]"
              size="w-[300px] h-[300px]"
              delay={4}
            />
          </>
        )}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container relative z-10 mx-auto px-6 h-full flex flex-col items-center justify-center"
      >
        <motion.div
          style={{ rotateX, rotateY, perspective: 1200 }}
          className="w-full flex flex-col items-center will-change-transform"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="group relative mb-8 md:mb-12"
          >
            <div className="absolute -inset-1 rounded-full bg-linear-to-r from-blue-600 to-purple-600 opacity-25 blur-md transition duration-1000 group-hover:opacity-100 group-hover:duration-200" />
            <div className="relative inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/80 px-4 py-2 text-xs font-semibold backdrop-blur-3xl transition-colors hover:border-white/20 md:gap-3 md:px-6 md:text-sm">
              <span className="flex items-center gap-1.5 text-blue-400">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                NexusAI v2.0 Live
              </span>
              <div className="hidden h-4 w-px bg-white/10 sm:block" />
              <span className="hidden items-center gap-2 text-white/70 sm:flex">
                Enterprise Creative Suite
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </span>
            </div>
          </motion.div>

          {/* Heading */}
          <div className="relative mb-6 sm:mb-8 text-center">
            <motion.h1
              variants={itemVariants}
              className="relative text-balance text-4xl font-black tracking-tight sm:text-7xl lg:text-9xl"
            >
              <span className="relative block bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent pb-2 sm:pb-4">
                Master Pure
                <span className="absolute -right-4 -top-2 lg:-right-12 lg:-top-6 hidden sm:block italic text-blue-500 text-2xl sm:text-3xl font-serif">
                  A.I.
                </span>
              </span>
              <span className="relative block bg-linear-to-r from-blue-400 via-blue-600 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
                Intelligence
              </span>
            </motion.h1>

            {/* Visual Scan Beam (Optimized) */}
            {!isMobile && (
              <motion.div
                animate={{ height: ["0%", "100%", "0%"], opacity: [0, 0.3, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-0 top-0 w-full bg-linear-to-b from-transparent via-blue-500/20 to-transparent pointer-events-none"
              />
            )}
          </div>

          <motion.p
            variants={itemVariants}
            className="mx-auto mb-8 max-w-2xl px-4 text-center text-pretty text-sm font-medium leading-relaxed text-gray-400 sm:mb-12 md:text-2xl"
          >
            Empower your workflow with a professional suite of generative tools.
            From visual synthesis to advanced content orchestration, NexusAI
            redefines the boundaries of digital creation.
          </motion.p>

          {/* CTA Group */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8"
          >
            <Link href="/dashboard">
              <Button
                size="lg"
                className="group relative h-14 min-w-[220px] overflow-hidden rounded-full bg-blue-600 px-8 text-lg font-bold text-white shadow-[0_0_40px_-10px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02] active:scale-95 md:h-16 md:min-w-[240px] md:px-10 md:text-xl"
              >
                <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <span className="relative z-10 flex items-center gap-2">
                  Launch Studio
                  <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1.5" />
                </span>
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              className="h-14 min-w-[180px] rounded-full border-white/10 bg-white/5 px-8 text-lg font-bold text-white backdrop-blur-xl transition-all hover:bg-white/10 hover:border-white/20 active:scale-95 md:h-16 md:min-w-[200px] md:px-10 md:text-xl"
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>

        {/* Floating Architecture Icons */}
        <div className="absolute inset-0 -z-10 pointer-events-none select-none">
          <FloatingNode
            position="top-[25%] left-[8%]"
            icon={<Zap className="text-yellow-400" />}
            label="Vision AI"
            duration={8}
          />
          <FloatingNode
            position="top-[15%] right-[10%]"
            icon={<Shield className="text-emerald-400" />}
            label="Secure"
            duration={9}
          />
          <FloatingNode
            position="bottom-[25%] left-[12%]"
            icon={<Rocket className="text-orange-400" />}
            label="Neural Core"
            duration={11}
          />
          <FloatingNode
            position="bottom-[20%] right-[12%]"
            icon={<Wand2 className="text-purple-400" />}
            label="Synthesis"
            duration={12}
          />
        </div>

        {/* Animated Scroll Hint */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">
              Analyze Ecosystem
            </span>
            <div className="h-10 w-px bg-linear-to-b from-white/40 to-transparent" />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
