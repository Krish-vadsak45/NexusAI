"use client";

import { Footer } from "@/components/footer";
import { motion, Variants } from "framer-motion";
import {
  Cpu,
  Brain,
  Zap,
  ShieldCheck,
  Activity,
  Globe2,
  Wand2,
  Image as ImageIcon,
  FileText,
  SearchCheck,
  Code2,
  Lock,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FeaturesPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Complex */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
      </div>

      <div className="relative z-10 pt-32 pb-20 container mx-auto px-6">
        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-5xl mx-auto mb-32"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-400 mb-8"
          >
            <Cpu className="w-4 h-4" />
            Core Infrastructure Specs
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-balance text-6xl font-black tracking-tight sm:text-8xl lg:text-9xl bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent leading-[0.9] mb-12"
          >
            The Neural <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-blue-600 to-blue-400 bg-[length:200%_auto] animate-gradient-x">
              Console
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-pretty text-xl text-gray-400 font-medium leading-relaxed max-w-3xl mx-auto"
          >
            Beyond simple tools. NexusAI provides a unified operational
            environment for industrial-grade AI generation, combining
            low-latency inference with professional-grade output controls.
          </motion.p>
        </motion.div>

        {/* Modular Systems Grid */}
        <section className="mb-40">
          <SectionHeader
            badge="Generative Engines"
            title="Production Ready Agents"
            description="Our suite of specialized models are custom-tuned for high-fidelity content creation."
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AI Article Writer"
              description="Construct SEO-optimized, high-fidelity articles and blog posts using advanced generative LLM architectures."
              tags={["SEO-Optimized", "Multi-Language"]}
            />
            <FeatureCard
              icon={<ImageIcon className="w-8 h-8" />}
              title="Vision Diffusion"
              description="Transform textual prompts into cinematic-grade 4K visuals powered by our high-performance diffusion clusters."
              tags={["4K Output", "Instant Gen"]}
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Neural Visual Editing"
              description="Industrial-grade background isolation and object removal with pixel-perfect edge detection algorithms."
              tags={["1-Click", "Studio Quality"]}
            />
            <FeatureCard
              icon={<Code2 className="w-8 h-8" />}
              title="Code Orchestrator"
              description="Generate, debug, and refactor code snippets instantly. Supports all major frameworks and programming languages."
              tags={["Syntax-Safe", "Speed-Coding"]}
            />
            <FeatureCard
              icon={<FileText className="w-8 h-8" />}
              title="Elite Resume Review"
              description="Strategic analysis of your professional profile to bypass modern ATS filters and maximize career impact."
              tags={["ATS-Friendly", "Pro Feedback"]}
            />
            <FeatureCard
              icon={<SearchCheck className="w-8 h-8" />}
              title="Contextual Summary"
              description="Distill massive documents and long-form content into concise, actionable intelligence using semantic analysis."
              tags={["Lossless", "High-Speed"]}
            />
          </div>
        </section>

        {/* Technical Stack Section */}
        <section className="mb-40 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />

          <SectionHeader
            badge="Infrastructure Layer"
            title="The Nexus Stack"
            description="Our platform is engineered using the most reliable and secure enterprise technologies available."
          />

          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-10">
              <TechFeature
                icon={<ShieldCheck className="text-emerald-400" />}
                title="Secure Auth Protocols"
                description="Powered by Better-Auth with multi-factor authentication (2FA) and Google OAuth provider support."
              />
              <TechFeature
                icon={<Activity className="text-blue-400" />}
                title="Stripe Financial Core"
                description="Secure subscription management and automated billing cycles integrated via enterprise-tier Stripe infrastructure."
              />
              <TechFeature
                icon={<Globe2 className="text-purple-400" />}
                title="Google Gemini Engine"
                description="Leveraging the latest Pro and Flash models for hyper-accurate content generation and reasoning."
              />
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 rounded-[2.5rem] bg-linear-to-r from-blue-600 to-purple-600 opacity-20 blur-2xl group-hover:opacity-40 transition duration-1000" />
              <div className="relative aspect-square rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-3xl p-10 flex items-center justify-center overflow-hidden">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-full h-full opacity-10"
                >
                  <div className="absolute inset-0 border-[2px] border-dashed border-white/40 rounded-full" />
                  <div className="absolute inset-20 border-[2px] border-dashed border-blue-500/40 rounded-full" />
                  <div className="absolute inset-40 border-[2px] border-dashed border-purple-500/40 rounded-full" />
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-32 h-32 text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] border border-white/5 bg-white/[0.02] p-20 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]" />
          <h2 className="relative z-10 text-5xl font-black mb-8 tracking-tight">
            Available Across All Nodes
          </h2>
          <p className="relative z-10 text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Experience the full potential of NexusAI. Register today and deploy
            your first model in under 60 seconds.
          </p>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="h-16 px-10 rounded-full bg-blue-600 text-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Get Started Now
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="h-16 px-10 rounded-full border-white/10 text-xl font-bold hover:bg-white/5"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </motion.section>
      </div>
      <Footer />
    </main>
  );
}

function SectionHeader({
  badge,
  title,
  description,
}: {
  badge: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl mb-20 text-left">
      <span className="text-blue-500 font-black uppercase tracking-[0.2em] text-sm mb-4 block">
        {badge}
      </span>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
        {title}
      </h2>
      <p className="text-xl text-gray-400 font-medium leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  tags,
}: {
  icon: any;
  title: string;
  description: string;
  tags: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="absolute -inset-[0.5px] rounded-[2.5rem] bg-linear-to-r from-blue-500/0 via-blue-500/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition duration-500" />
      <div className="relative h-full flex flex-col p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl transition-all duration-500 group-hover:bg-white/[0.05] group-hover:border-white/10">
        <div className="mb-8 p-4 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-xl">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 leading-relaxed text-lg mb-8 flex-grow">
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function TechFeature({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-6 group">
      <div className="flex-shrink-0 mt-1">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 transition-colors group-hover:bg-white/10">
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {title}
        </h4>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
