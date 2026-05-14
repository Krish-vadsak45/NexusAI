import { Pricing } from "@/features/marketing/components/Pricing";
import { Footer } from "@/features/marketing/components/Footer";

export const metadata = {
  title: "Pricing | NexusAI",
  description: "Simple, transparent pricing for all your AI content needs.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute left-1/2 top-0 h-[380px] w-full -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px] -z-10 sm:h-[500px]" />
      <div className="absolute bottom-0 right-0 h-[240px] w-[240px] rounded-full bg-purple-500/10 blur-[120px] -z-10 sm:h-[400px] sm:w-[400px]" />

      <div className="">
        <Pricing />
      </div>

      <Footer />
    </main>
  );
}
