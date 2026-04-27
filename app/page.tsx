"use client";

import { AITools } from "@/features/marketing/components/AITools";
import { CtaSection } from "@/features/marketing/components/CtaSection";
import { Features } from "@/features/marketing/components/Features";
import { Footer } from "@/features/marketing/components/Footer";
import { Hero } from "@/features/marketing/components/Hero";
import InfiniteScrollText from "@/components/infinite-scroll";
import { Pricing } from "@/features/marketing/components/Pricing";
import { SocialProof } from "@/features/marketing/components/SocialProof";
import { BackgroundGlow } from "@/components/background-glow";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative">
      <BackgroundGlow />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Hero />
        <InfiniteScrollText className="py-2 mb-30 mt-10 mx-50">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/2560px-Instagram_logo.svg.png"
            alt="Instagram"
            width={2560}
            height={720}
            className="h-12 w-auto object-contain brightness-0 invert"
          />
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Facebook_Logo_%282019%29.svg/2560px-Facebook_Logo_%282019%29.svg.png"
            alt="Facebook"
            width={2560}
            height={720}
            className="h-8 w-auto object-contain brightness-0 invert"
          />
          <div className="flex items-center gap-2">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/2048px-Slack_icon_2019.svg.png"
              alt="Slack"
              width={2048}
              height={2048}
              className="h-8 w-auto object-contain brightness-0 invert"
            />
            <span className="text-2xl font-bold text-white">slack</span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/f/f4/Framer_logo.svg"
              alt="Framer"
              width={512}
              height={512}
              className="h-8 w-auto object-contain brightness-0 invert"
            />
            <span className="text-2xl font-bold text-white">Framer</span>
          </div>
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png"
            alt="Netflix"
            width={2560}
            height={720}
            className="h-8 w-auto object-contain"
          />
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png"
            alt="Google"
            width={2560}
            height={720}
            className="h-8 w-auto object-contain"
          />
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/LinkedIn_Logo.svg/2560px-LinkedIn_Logo.svg.png"
            alt="LinkedIn"
            width={2560}
            height={720}
            className="h-8 w-auto object-contain"
          />
        </InfiniteScrollText>
        <SocialProof />
        <AITools />
        <Features />
        <Pricing />
        <CtaSection />
      </motion.main>
      <Footer />
    </div>
  );
}
