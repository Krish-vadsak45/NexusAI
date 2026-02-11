"use client";

import { motion } from "framer-motion";

export function SocialProof() {
  const stats = [
    { value: "20 days", label: "saved on daily builds.", company: "NETFLIX" },
    { value: "98% faster", label: "time to market.", company: "TripAdvisor" },
    { value: "300% increase", label: "in SEO.", company: "box" },
    { value: "6x faster", label: "to build + deploy.", company: "ebay" },
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="relative border-y border-white/5 bg-black/20 py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]" />
      <div className="container relative mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:gap-16"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.company}
              variants={itemVariants}
              className="group relative flex flex-col items-center text-center md:items-start md:text-left"
            >
              <div className="relative">
                <div className="text-3xl font-black md:text-5xl bg-clip-text text-transparent bg-linear-to-b from-white via-white to-white/40 tracking-tighter">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-medium text-blue-400/80 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
              <div className="mt-6 flex items-center space-x-2">
                <div className="h-px w-4 bg-white/20 group-hover:w-8 transition-all duration-300" />
                <div className="font-mono text-[10px] font-bold tracking-widest text-white/30 group-hover:text-white/60 transition-colors uppercase">
                  {stat.company}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
