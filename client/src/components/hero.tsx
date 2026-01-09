import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "wouter";

export function Hero() {
  const [videoReady, setVideoReady] = useState(false);

  return (
    <section className="premium-parallax-hero relative w-full bg-[#FDFFD7] min-h-[500px] md:h-[606px] mt-0 md:mt-[24px] mb-[16px] overflow-hidden font-sans border-b border-[#E6E6E6]/10">
      {/* Container with responsive padding */}
      <div className="mx-auto px-4 md:px-[64px] max-w-[1440px] h-full flex items-center py-12 md:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center w-full">

          {/* Left Content - Text and CTAs */}
          <div className="relative flex flex-col justify-center order-1">
            {/* Main Headline - Responsive sizing */}
            <h1
              className="font-sans premium-parallax-text w-full md:w-[637px]"
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
                className="hero-reveal-headline block text-[32px] md:text-[48px] leading-[40px] md:leading-[56px]"
              >
                Find and Share{" "}
                <span className="font-bold hero-phrase-hover" style={{ animationDelay: '250ms' }}>
                  Ukrainian
                </span>
              </span>
              <span
                className="hero-reveal-headline block text-[32px] md:text-[48px] leading-[40px] md:leading-[56px] font-bold hero-phrase-hover"
                style={{ animationDelay: '250ms' }}
              >
                Products
              </span>
              <span className="hero-reveal-headline block text-[32px] md:text-[48px] leading-[40px] md:leading-[56px]" style={{ animationDelay: '300ms' }}>
                sold <span className="font-bold" style={{ animationDelay: '350ms' }}>in Canada</span>
              </span>
            </h1>

            {/* Subtext - Responsive sizing */}
            <p
              className="font-sans hero-reveal-subtext premium-parallax-text w-full md:w-[557px] text-[16px] md:text-[20px] leading-[24px] md:leading-[28px] mb-6 md:mb-8"
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

            {/* CTA Buttons - Stack on mobile */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 hero-reveal-cta">
              <Link href="/map">
                <Button className="bg-black text-white hover:bg-black/90 rounded-full h-[48px] px-8 text-[16px] font-semibold flex items-center gap-2 border border-transparent hover:border-black/10 transition-all focus-within:ring-0 w-full sm:w-auto justify-center">
                  Explore the Map
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>

              <Link href="/#how-it-works">
                <button className="flex items-center gap-2 text-[16px] font-semibold text-black hover:opacity-70 transition-opacity">
                  How it works
                  <HelpCircle className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Right Video Container - Below text on mobile, reduced height */}
          <div className="relative order-2">
            <div
              className="rounded-[24px] md:rounded-[40px] overflow-hidden shadow-2xl relative h-[300px] md:h-auto"
              style={{
                aspectRatio: window.innerWidth >= 768 ? '4 / 3' : undefined,
                backgroundColor: '#FDFFD7' // Match section background - no contrast flash
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
