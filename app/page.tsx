import { AITools } from "@/components/ai-tools";
import { CTA } from "@/components/cta";
import { Features } from "@/components/feature";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import InfiniteScrollText from "@/components/infinite-scroll";
import { Pricing } from "@/components/pricing";
import { SocialProof } from "@/components/social-proof";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main>
        <Hero />
        <InfiniteScrollText className="py-2 mb-30 mx-50">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/2560px-Instagram_logo.svg.png"
            alt="Instagram"
            className="h-12 w-auto object-contain"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Facebook_Logo_%282019%29.svg/2560px-Facebook_Logo_%282019%29.svg.png"
            alt="Facebook"
            className="h-8 w-auto object-contain"
          />
          <div className="flex items-center gap-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/2048px-Slack_icon_2019.svg.png"
              alt="Slack"
              className="h-8 w-auto object-contain"
            />
            <span className="text-2xl font-bold text-black">slack</span>
          </div>
          <div className="flex items-center gap-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/f/f4/Framer_logo.svg"
              alt="Framer"
              className="h-8 w-auto object-contain"
            />
            <span className="text-2xl font-bold text-black">Framer</span>
          </div>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png"
            alt="Netflix"
            className="h-8 w-auto object-contain"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png"
            alt="Google"
            className="h-8 w-auto object-contain"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/LinkedIn_Logo.svg/2560px-LinkedIn_Logo.svg.png"
            alt="LinkedIn"
            className="h-8 w-auto object-contain"
          />
        </InfiniteScrollText>
        <SocialProof />
        <AITools />
        <Features />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
