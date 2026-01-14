import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Check,
  Code2,
  Globe,
  Heart,
  Shield,
  Sparkles,
  Zap,
  Cpu,
  Fingerprint,
  MoveRight,
  Users,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-20 sm:pt-20 sm:pb-24 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1 mb-8 backdrop-blur-sm animate-fade-in-up hover:bg-white/10 transition-colors cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-sm font-medium text-gray-300">
              Reinventing Creativity
            </span>
          </div>

          <h1 className="mx-auto max-w-5xl text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-8">
            <span className="block text-gray-400 mb-2 text-2xl sm:text-4xl font-normal tracking-normal uppercase">
              We are NexusAI
            </span>
            Building the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 animate-gradient-x">
              Operating System
            </span>{" "}
            <br />
            for Intelligence
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-400 mb-12 leading-relaxed">
            We're a team of researchers, engineers, and artists united by a
            single mission: to democratize access to state-of-the-art artificial
            intelligence, making the impossible creative.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            <Button
              size="lg"
              className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] rounded-full transition-all hover:scale-105 active:scale-95"
            >
              View Open Positions
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md transition-all group"
            >
              Read Our Manifesto
              <MoveRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Board */}
      <section className="relative z-10 py-12">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-12 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 relative z-10">
              {[
                { label: "Active Users", value: "100k+", icon: Users },
                { label: "Models Deployed", value: "50+", icon: Cpu },
                { label: "Requests/Sec", value: "2.4k", icon: Zap },
                { label: "Success Rate", value: "99.9%", icon: Sparkles },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center text-center space-y-2 p-4 rounded-2xl hover:bg-white/10 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 border border-transparent hover:border-white/10 transition-all duration-300 cursor-default group"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-2 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Values */}
      <section className="relative z-10 py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-20 text-center max-w-3xl mx-auto">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wide mb-3">
              Our Core Principles
            </h2>
            <h3 className="text-3xl sm:text-5xl font-bold text-white mb-6">
              Designed for the future
            </h3>
            <p className="text-xl text-gray-400">
              Every line of code we write is guided by our commitment to
              performance, security, and developer experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Large Card 1 */}
            <Card className="md:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-500">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-30 transition-all duration-700 transform group-hover:scale-110 group-hover:rotate-[24deg]">
                <Globe className="h-64 w-64 text-blue-500 rotate-12" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end min-h-[300px]">
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 backdrop-blur-sm group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                  <Globe className="h-6 w-6 group-hover:animate-spin-slow" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  Global Edge Network
                </h4>
                <p className="text-gray-400 max-w-md text-lg">
                  Deployed across 35 regions worldwide. Our intelligent routing
                  ensures your users connect to the nearest node, guaranteeing
                  &lt;50ms latency globally.
                </p>
              </div>
            </Card>

            {/* Tall Card 2 */}
            <Card className="row-span-2 bg-black border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-500 flex flex-col">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-violet-500/10 to-transparent group-hover:from-violet-500/20 transition-all duration-500" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-6 text-violet-400 backdrop-blur-sm group-hover:bg-violet-500 group-hover:text-white transition-colors duration-300">
                  <Shield className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-3 group-hover:text-violet-400 transition-colors">
                  Zero-Trust Security
                </h4>
                <p className="text-gray-400 text-lg mb-8 flex-grow">
                  Enterprise-grade security by default. SOC2 Type II compliant,
                  end-to-end encryption, and dedicated private cloud options.
                </p>
                <div className="space-y-4">
                  {[
                    "AES-256 Encryption",
                    "SAML SSO Support",
                    "Role-Based Access",
                    "Audit Logs",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm text-gray-300"
                    >
                      <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="h-3 w-3 text-green-500" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Card 3 */}
            <Card className="bg-white/[0.03] border-white/10 p-8 rounded-3xl group hover:bg-white/[0.05] hover:border-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/10 hover:-translate-y-1 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-6 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-black transition-colors duration-300">
                <Zap className="h-6 w-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                Lightning Fast
              </h4>
              <p className="text-gray-400">
                Optimized Rust-based inference engine delivering up to 10x
                faster completions than standard APIs.
              </p>
            </Card>

            {/* Card 4 */}
            <Card className="bg-white/[0.03] border-white/10 p-8 rounded-3xl group hover:bg-white/[0.05] hover:border-pink-500/30 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300">
                <Heart className="h-6 w-6 group-hover:scale-125 transition-transform duration-300" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                Community First
              </h4>
              <p className="text-gray-400">
                Built in public. We sponsor open-source projects and contribute
                1% of revenue to AI safety research.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="rounded-[40px] bg-gradient-to-r from-blue-900 to-violet-900 p-12 md:p-24 text-center overflow-hidden relative shadow-2xl shadow-blue-900/20">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to transform your workflow?
              </h2>
              <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                Join the thousands of developers and creators building the next
                generation of applications with NexusAI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg bg-white text-blue-900 hover:bg-blue-50 hover:scale-105 transition-all w-full sm:w-auto font-bold shadow-xl"
                >
                  Start Building for Free
                </Button>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-lg border-white/30 text-white hover:bg-white/10 w-full sm:w-auto backdrop-blur-sm"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
