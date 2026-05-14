import dynamic from "next/dynamic";
import { Hero } from "@/features/marketing/components/Hero";
import InfiniteScrollText from "@/components/infinite-scroll";

const BackgroundGlow = dynamic(
  () =>
    import("@/components/background-glow").then((mod) => ({
      default: mod.BackgroundGlow,
    })),
);
const SocialProof = dynamic(
  () =>
    import("@/features/marketing/components/SocialProof").then((mod) => ({
      default: mod.SocialProof,
    })),
);
const AITools = dynamic(
  () =>
    import("@/features/marketing/components/AITools").then((mod) => ({
      default: mod.AITools,
    })),
);
const Features = dynamic(
  () =>
    import("@/features/marketing/components/Features").then((mod) => ({
      default: mod.Features,
    })),
);
const Pricing = dynamic(
  () =>
    import("@/features/marketing/components/Pricing").then((mod) => ({
      default: mod.Pricing,
    })),
);
const CtaSection = dynamic(
  () =>
    import("@/features/marketing/components/CtaSection").then((mod) => ({
      default: mod.CtaSection,
    })),
);
const Footer = dynamic(
  () =>
    import("@/features/marketing/components/Footer").then((mod) => ({
      default: mod.Footer,
    })),
);

const partnerLogos = [
  "Instagram",
  "Facebook",
  "Slack",
  "Framer",
  "Netflix",
  "Google",
  "LinkedIn",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative">
      <BackgroundGlow />
      <main>
        <Hero />
        <InfiniteScrollText className="mb-12 mt-8 px-4 md:mx-50 md:mb-30 md:mt-10 md:px-0">
          {partnerLogos.map((partner) => (
            <div
              key={partner}
              aria-label={`${partner} integration`}
              className="flex h-10 items-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold tracking-wide text-white/85 md:h-12 md:px-6 md:text-xl"
            >
              {partner}
            </div>
          ))}
        </InfiniteScrollText>
        <SocialProof />
        <AITools />
        <Features />
        <Pricing />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
