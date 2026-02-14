"use client";

import { Brain, Sparkles, Wand2, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export function AITools() {
  const tools = [
    {
      icon: Brain,
      title: "AI Article Writer",
      description:
        "Generate high-quality, engaging articles on any topic with our AI writing technology.",
    },
    {
      icon: Sparkles,
      title: "Blog Title Generator",
      description:
        "Find the perfect, catchy title for your blog posts with our AI-powered generator.",
    },
    {
      icon: Wand2,
      title: "AI Image Generation",
      description:
        "Create stunning visuals with our AI image generation tool, Experience the power of AI.",
    },
    {
      icon: Zap,
      title: "Background Removal",
      description:
        "Effortlessly remove backgrounds from your images with our AI-driven tool.",
    },
    {
      icon: Zap,
      title: "Object Removal",
      description:
        "Remove unwanted objects from your images seamlessly with our AI object removal tool.",
    },
    {
      icon: Zap,
      title: "Resume Reviewer",
      description:
        "Get your resume reviewed by AI to improve your chances of landing your dream job.",
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
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="container mx-auto px-6 py-20 md:px-8 md:py-32 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          Powerful AI Tools
        </h2>
        <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
          Harness the power of artificial intelligence to supercharge your
          development workflow
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-16 grid gap-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-8"
      >
        {tools.map((tool) => (
          <motion.div
            key={tool.title}
            variants={itemVariants}
            whileHover={{ y: -8 }}
          >
            <Card className="group h-full relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] rounded-3xl">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <CardContent className="relative p-8 lg:p-10">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-blue-400 transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 shadow-inner">
                  <tool.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-4 text-2xl font-bold tracking-tight text-white/90">
                  {tool.title}
                </h3>
                <p className="text-gray-400 leading-relaxed min-h-[60px]">
                  {tool.description}
                </p>
                <div className="mt-6 flex items-center text-sm font-medium text-blue-400 opacity-0 transition-all duration-300 -translate-x-2.5 group-hover:opacity-100 group-hover:translate-x-0">
                  Try Tool <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
