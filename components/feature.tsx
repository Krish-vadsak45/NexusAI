import {
  Zap,
  Users,
  Lock,
  BarChart,
  Cpu,
  Globe2,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

export function Features() {
  const features = [
    {
      icon: Cpu,
      title: "Neural Infrastructure",
      description:
        "Custom-tuned generative models running on high-performance compute clusters. Experience near-zero latency for complex inference tasks.",
    },
    {
      icon: Globe2,
      title: "Collaborative Ecosystem",
      description:
        "Granular permission controls and real-time synchronization. Your team can iterate on high-fidelity assets within a unified workspace.",
    },
    {
      icon: ShieldCheck,
      title: "Quantum-Level Security",
      description:
        "Full-spectrum data encryption and SOC 2 Type II compliance. We ensure your proprietary data remains private and protected at every layer.",
    },
    {
      icon: Activity,
      title: "Predictive Analytics",
      description:
        "Advanced usage monitoring and performance insights. Scale your operations with clear visibility into model performance and resource allocation.",
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
    hidden: { opacity: 0, scale: 0.95, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 1,
      },
    },
  };

  return (
    <section className="container mx-auto px-6 py-24 md:px-8 md:py-40 lg:px-12 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-4xl text-center relative z-10"
      >
        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-[0.3em] uppercase bg-white/5 border border-white/10 rounded-full text-blue-400">
          Advanced Core Systems
        </span>
        <h2 className="text-balance text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl bg-linear-to-b from-white to-white/50 bg-clip-text text-transparent">
          Built for the Future
        </h2>
        <p className="mt-8 text-pretty text-xl text-gray-400 font-medium leading-relaxed">
          Beyond simple automation. NexusAI provides the skeletal structure for
          next-generation digital workflows, combining hardware-accelerated
          models with intuitive professional controls.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-20 grid gap-10 md:grid-cols-2 lg:mt-24 lg:gap-12"
      >
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            variants={itemVariants}
            className="group relative"
          >
            <div className="absolute -inset-0.5 rounded-[2.5rem] bg-linear-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-black/50 p-10 backdrop-blur-3xl transition-all duration-500 lg:p-14 h-full flex flex-col items-start hover:border-white/10">
              <div className="mb-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 text-blue-400 transition-all duration-700 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <feature.icon className="h-10 w-10 relative z-10" />
              </div>
              <h3 className="mb-6 text-3xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed text-xl mb-8 flex-grow">
                {feature.description}
              </p>

              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-auto">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 2, delay: 0.5 + idx * 0.2 }}
                  className="h-full bg-linear-to-r from-blue-600 to-purple-600 opacity-30"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
