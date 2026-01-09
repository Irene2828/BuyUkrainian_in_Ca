import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "wouter";

export function Hero() {
  const [videoReady, setVideoReady] = useState(false);

  return (
    <section className="premium-parallax-hero relative w-full bg-[#FDFFD7] overflow-hidden font-sans border-b border-[#E6E6E6]/10">
      {/* Container with Auto Layout: flex-col on mobile, flex-row on desktop */}
      <div className="mx-auto px-4 md:px-16 max-w-[1440px] py-8 md:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center w-full">

          {/* Left Content - Text and CTAs - FULL WIDTH on mobile, auto on desktop */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center order-1">
            {/* Main Headline - Responsive sizing, no fixed widths */}
            <h1
              className="font-sans premium-parallax-text w-full"
              style={{
                fontFamily: 'Inter',
                fontStyle: 'normal',
                fontWeight: 500,
                letterSpacing: '-2.2px',
                color: '#000000',
                marginBottom: '24px'
              }}
            >
              <span
                className="hero-reveal-headline block text-[28px] sm:text-[36px] md:text-[48px] leading-[36px] sm:leading-[44px] md:leading-[56px]"
              >
                Find and Share{" "}
                <span className="font-bold hero-phrase-hover" style={{ animationDelay: '250ms' }}>
                  Ukrainian
                </span>
              </span>
              <span
                className="hero-reveal-headline block text-[28px] sm:text-[36px] md:text-[48px] leading-[36px] sm:leading-[44px] md:leading-[56px] font-bold hero-phrase-hover"
                style={{ animationDelay: '250ms' }}
              >
                Products
              </span>
              <span className="hero-reveal-headline block text-[28px] sm:text-[36px] md:text-[48px] leading-[36px] sm:leading-[44px] md:leading-[56px]" style={{ animationDelay: '300ms' }}>
                sold <span className="font-bold" style={{ animationDelay: '350ms' }}>in Canada</span>
              </span>
            </h1>

            {/* Subtext - Responsive sizing, full width */}
            <p
              className="font-sans hero-reveal-subtext premium-parallax-text w-full max-w-[557px] text-[15px] sm:text-[18px] md:text-[20px] leading-[22px] sm:leading-[26px] md:leading-[28px] mb-6"
              style={{
                fontFamily: 'Inter',
                fontStyle: 'normal',
                fontWeight: 500,
                letterSpacing: '-0.3125px',
                color: '#727272',
              }}
            >
              Support Ukraine's economy by purchasing & sharing #madeinUkraine products in Canada.
            </p>

            {/* CTA Buttons - Stack on mobile, row on larger screens */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hero-reveal-cta">
              <Link href="/map" className="w-full sm:w-auto">
                <Button className="bg-black text-white hover:bg-black/90 rounded-full h-[48px] px-6 md:px-8 text-[15px] md:text-[16px] font-semibold flex items-center gap-2 border border-transparent hover:border-black/10 transition-all focus-within:ring-0 w-full sm:w-auto justify-center">
                  Explore the Map
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>

              <Link href="/#how-it-works">
                <button className="flex items-center gap-2 text-[15px] md:text-[16px] font-semibold text-black hover:opacity-70 transition-opacity">
                  How it works
                  <HelpCircle className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Right Video Container - Below text on mobile, beside on desktop */}
          <div className="w-full lg:w-1/2 order-2">
            <div
              className="rounded-[24px] md:rounded-[40px] overflow-hidden shadow-2xl relative aspect-[4/3] max-h-[300px] lg:max-h-none"
              style={{
                backgroundColor: '#FDFFD7'
              }}
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
