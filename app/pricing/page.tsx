import { Pricing } from "@/components/pricing";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Pricing | NexusAI",
  description: "Simple, transparent pricing for all your AI content needs.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full -z-10" />

      <div className="">
        <Pricing />
      </div>

      <Footer />
    </main>
  );
}
