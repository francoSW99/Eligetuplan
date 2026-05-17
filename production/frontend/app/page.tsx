import HeroSplit from "@/components/home/hero-split";
import LiveDataStrip from "@/components/home/live-data-strip";
import IsapresMarquee from "@/components/home/isapres-marquee";
import PathsSection from "@/components/home/paths-section";
import HowItWorks from "@/components/home/how-it-works";
import TrustBand from "@/components/home/trust-band";
import FaqSection from "@/components/home/faq-section";
import FinalCTA from "@/components/home/final-cta";

export default function Home() {
  return (
    <div className="bg-[#fbf8f3] text-[#1e2a2a]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#14dcb4] focus:text-[#0f514b] focus:rounded-lg focus:font-bold"
      >
        Saltar al contenido
      </a>

      <div id="main">
        <HeroSplit />
        <LiveDataStrip />
        <IsapresMarquee />
        <PathsSection />
        <HowItWorks />
        <TrustBand />
        <FaqSection />
        <FinalCTA />
      </div>
    </div>
  );
}
