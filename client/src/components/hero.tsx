import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "wouter";

export function Hero() {
  const [videoReady, setVideoReady] = useState(false);

  return (
    <section className="premium-parallax-hero relative w-full bg-[#FDFFD7] h-[606px] mt-[24px] mb-[16px] overflow-hidden font-sans border-b border-[#E6E6E6]/10">
      {/* Container with Figma-exact 32px left padding - Centered vertically via flex */}
      <div className="mx-auto px-[32px] md:px-[64px] max-w-[1440px] h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">

          {/* Left Content - Vertically Centered Group */}
          <div className="relative flex flex-col justify-center h-full">
            {/* Main Headline - Figma Exact - Centered in left section */}
            <h1
              className="font-sans premium-parallax-text"
              style={{
                width: '637px',
                height: 'auto',
                minHeight: '112px',
                fontFamily: 'Inter',
                fontStyle: 'normal',
                fontWeight: 500,
                fontSize: '48px',
                lineHeight: '56px',
                letterSpacing: '-2.2px',
                color: '#000000',
                marginBottom: '35px'
              }}
            >
              <span className="hero-reveal-headline">Find and Share</span>{" "}
              <span
                className="hero-reveal-headline font-bold hero-phrase-hover"
                style={{ animationDelay: '250ms' }}
              >
                Ukrainian
              </span>
              <br />
              <span
                className="hero-reveal-headline font-bold hero-phrase-hover"
                style={{ animationDelay: '250ms' }}
              >
                Products
              </span>{" "}
              <span className="hero-reveal-headline" style={{ animationDelay: '300ms' }}>sold</span>{" "}
              <span
                className="hero-reveal-headline font-bold"
                style={{ animationDelay: '350ms' }}
              >
                in Canada
              </span>
            </h1>
            {/* Subtext - Figma Exact */}
            <p
              className="font-sans hero-reveal-subtext premium-parallax-text"
              style={{
                width: '557px',
                height: '56px',
                fontFamily: 'Inter',
                fontStyle: 'normal',
                fontWeight: 500,
                fontSize: '20px',
                lineHeight: '28px',
                letterSpacing: '-0.3125px',
                color: '#727272',
                marginBottom: '32px' // Spacing before buttons
              }}
            >
              Support Ukraine's economy by purchasing & sharing #madeinUkraine products in Canada.
            </p>

            {/* CTA Buttons - Flowing naturally in the centered group */}
            <div className="flex items-center gap-8 hero-reveal-cta">
              <Link href="/map">
                <Button className="bg-black text-white hover:bg-black/90 rounded-full h-[48px] px-8 text-[16px] font-semibold flex items-center gap-2 border border-transparent hover:border-black/10 transition-all focus-within:ring-0">
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

          {/* Right Video Container - No flash loading with opacity transition */}
          <div className="relative">
            <div
              className="rounded-[40px] overflow-hidden shadow-2xl relative"
              style={{
                aspectRatio: '4 / 3',
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
