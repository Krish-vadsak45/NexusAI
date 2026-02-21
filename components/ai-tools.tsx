"use client";

import {
  Brain,
  Sparkles,
  Wand2,
  Zap,
  ArrowRight,
  Image as ImageIcon,
  FileText,
  Code2,
  SearchCheck,
  LayoutPanelLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export function AITools() {
  const tools = [
    {
      icon: Brain,
      title: "Neural Content Engine",
      description:
        "Architect deep-form articles and SEO-optimized narratives with our advanced generative LLM integration.",
    },
    {
      icon: LayoutPanelLeft,
      title: "Strategic Title Generator",
      description:
        "Engineered catchy, high-conversion headlines that resonate with your target demographic instantly.",
    },
    {
      icon: Wand2,
      title: "Vision Synthesis XL",
      description:
        "Transform abstract concepts into hyper-realistic 4K visuals using cutting-edge diffusion technology.",
    },
    {
      icon: ImageIcon,
      title: "Neural Background Extraction",
      description:
        "Precision edge-detection and object isolation with a single click. Studio-quality transparency.",
    },
    {
      icon: SearchCheck,
      title: "Intelligent Object Eraser",
      description:
        "Remove distractions with context-aware inpainting that maintains original lighting and textures.",
    },
    {
      icon: FileText,
      title: "Elite Resume Optimizer",
      description:
        "Sophisticated career analysis and strategic feedback to ensure your profile bypasses modern ATS filters.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className="container mx-auto px-6 py-20 md:px-8 md:py-32 lg:px-12 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-linear-to-r from-transparent via-blue-500/20 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-3xl text-center relative z-10"
      >
        <span className="text-blue-500 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">
          Core Infrastructure
        </span>
        <h2 className="text-balance text-4xl font-black tracking-tight md:text-5xl lg:text-6xl bg-linear-to-b from-white to-white/60 bg-clip-text text-transparent">
          The Nexus Toolset
        </h2>
        <p className="mt-6 text-pretty text-lg text-gray-400 md:text-xl font-medium">
          A modular ecosystem of enterprise-grade AI agents designed to
          eliminate creative friction and maximize output.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-16 grid gap-6 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3 lg:gap-10"
      >
        {tools.map((tool) => (
          <motion.div
            key={tool.title}
            variants={itemVariants}
            whileHover={{ y: -12 }}
            className="group"
          >
            <Card className="h-full relative overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-2xl transition-all duration-500 hover:border-blue-500/40 hover:bg-white/[0.05] rounded-[2rem] shadow-2xl">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

              <CardContent className="p-10 relative z-10 flex flex-col h-full">
                <div className="mb-8 p-4 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                  <tool.icon className="h-8 w-8 stroke-[1.5]" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-lg mb-8 flex-grow">
                  {tool.description}
                </p>

                <div className="flex items-center gap-2 text-white/40 group-hover:text-blue-400 text-sm font-bold uppercase tracking-widest transition-colors">
                  Analyze Protocol
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
