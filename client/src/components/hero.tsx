import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "wouter";

export function Hero() {
  const [videoReady, setVideoReady] = useState(false);

  return (
    <section className="premium-parallax-hero relative w-full bg-[#FDFFD7] overflow-hidden font-sans border-b border-[#E6E6E6]/10">
      {/* Container with premium px-6 mobile padding */}
      <div className="mx-auto px-6 md:px-16 max-w-[1440px] py-8 md:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center w-full">

          {/* Left Content - CENTERED on mobile, LEFT-ALIGNED on desktop */}
          <div className="w-full lg:w-1/2 flex flex-col items-center text-center md:items-start md:text-left justify-center order-1">
            {/* Main Headline - LOCKED typography + tracking-tight for editorial look */}
            <h1 className="hero-title premium-parallax-text w-full mb-4 tracking-tight">
              <span className="hero-reveal-headline">
                Find and Share <strong className="hero-phrase-hover">Ukrainian</strong>
              </span>
              <br />
              <strong className="hero-reveal-headline hero-phrase-hover">Products</strong>{" "}
              <span className="hero-reveal-headline">
                sold <strong>in Canada</strong>
              </span>
            </h1>

            {/* Subtext - 32px below headline (mb-8) -> Tightened to mb-6 (24px) */}
            <p
              className="font-sans hero-reveal-subtext premium-parallax-text w-full max-w-[557px] text-[15px] sm:text-[18px] md:text-[20px] leading-[22px] sm:leading-[26px] md:leading-[28px] mb-6"
              style={{
                fontFamily: 'Inter',
                fontWeight: 400,
                letterSpacing: '-0.3125px',
                color: '#727272',
              }}
            >
              Support Ukraine's economy by purchasing & sharing #madeinUkraine products in Canada.
            </p>

            {/* CTA Stack - Fixed width button, 16px gap. Desktop: Side-by-side (Row) */}
            <div className="flex flex-col items-center md:flex-row md:items-center gap-4 hero-reveal-cta">
              <Link href="/map">
                <Button className="bg-black text-white hover:bg-black/90 rounded-full h-[48px] w-[240px] text-[15px] md:text-[16px] font-semibold flex items-center justify-center gap-2 border border-transparent hover:border-black/10 transition-all active:scale-95">
                  Explore the Map
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>

              <Link href="/#how-it-works">
                <button className="flex items-center gap-2 text-[14px] md:text-[15px] font-medium text-black/70 hover:text-black transition-colors">
                  How it works
                  <HelpCircle className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-1/2 order-2 flex justify-center">
            <div
              className="rounded-2xl md:rounded-[40px] overflow-hidden shadow-sm border border-gray-100 relative aspect-[4/3] max-h-[300px] lg:max-h-none w-full max-w-[500px] lg:max-w-none mx-auto"
              style={{ backgroundColor: '#FDFFD7' }}
            >
              <video
                className="w-full h-full object-cover"
                style={{
                  opacity: videoReady ? 1 : 0,
                  transition: 'opacity 0.4s ease-in-out'
                }}
                autoPlay
                muted
                loop
                playsInline
                onCanPlay={() => setVideoReady(true)}
              >
                <source src="/hero-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
