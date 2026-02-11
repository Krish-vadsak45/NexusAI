"use client";

import { Zap, Users, Lock, BarChart } from "lucide-react";
import { motion } from "framer-motion";

export function Features() {
  const features = [
    {
      icon: Zap,
      title: "Faster iteration. More innovation.",
      description:
        "The platform for rapid progress. Let your team focus on shipping features instead of managing infrastructure with automated CI/CD, built-in testing, and integrated collaboration.",
    },
    {
      icon: Users,
      title: "Make teamwork seamless.",
      description:
        "Tools for your team and stakeholders to share feedback and iterate faster. Collaborate in real-time with powerful review tools and instant previews.",
    },
    {
      icon: Lock,
      title: "Enterprise-grade security.",
      description:
        "Built with security at its core. SOC 2 compliant with advanced DDoS protection, automatic SSL, and fine-grained access controls to keep your data safe.",
    },
    {
      icon: BarChart,
      title: "Insights that drive growth.",
      description:
        "Real-time analytics and performance monitoring. Understand your users, optimize your applications, and make data-driven decisions with comprehensive dashboards.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
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
          Everything you need to ship faster
        </h2>
        <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
          A complete development platform with all the tools and services you
          need to build, deploy, and scale your applications.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-16 grid gap-8 md:grid-cols-2 lg:mt-20 lg:gap-10"
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.01 }}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl transition-all duration-300 lg:p-10 shadow-2xl"
          >
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-blue-400 transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-4 text-2xl font-bold tracking-tight text-white/90">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
