import { Facebook, Instagram } from "lucide-react";
import { Button } from "./ui/button";

export function SpreadTheWord() {
  return (
    <section className="relative pt-[12px] pb-0 bg-white overflow-hidden px-[64px]">
      {/* Updated padding for breathing space and frame alignment */}
      <div className="mx-auto max-w-[1440px] relative z-10 flex flex-col items-center">

        <div className="text-center mb-12">
          <h2 className="text-[42px] font-medium text-[var(--color-section-headline)] mb-4 tracking-tight font-header section-headline-reveal">
            Spread the word
          </h2>
          <p className="text-[18px] font-normal text-gray-400 max-w-[700px] mx-auto leading-relaxed font-ui">
            Help grow our vibrant community by sharing this project with your friends!
            Choose a message or just share the map.
          </p>
        </div>

        {/* Black Card Section - RESTORED TO AUDIT SIZE 790x272px, RADIUS 40px */}
        <div className="w-[790px] h-[272px] max-w-full bg-black rounded-[40px] flex flex-col items-center justify-center text-center shadow-2xl mx-auto p-8">

          {/* Message Pill Layout */}
          <div className="px-10 py-4 mb-8 w-full max-w-[650px] mx-auto">
            <p className="text-[18px] font-normal text-white leading-relaxed font-ui">
              Proud to support Ukrainian products sold in Canada! 🇺🇦🇨🇦 — Let's support the economy together!
            </p>
          </div>

          {/* Social Buttons - WITH NEW HOVER COLOR #D3E4FD */}
          <div className="flex flex-row flex-nowrap justify-center gap-4 w-full">
            <Button
              variant="outline"
              className="border-white text-white rounded-full h-[48px] px-6 text-[14px] font-semibold hover:bg-transparent hover:text-[#D3E4FD] hover:border-[#D3E4FD] transition-all flex items-center gap-2 bg-transparent shrink-0 font-ui"
            >
              <Facebook className="w-4 h-4 fill-current" />
              Share on Facebook
            </Button>
            <Button
              variant="outline"
              className="border-white text-white rounded-full h-[48px] px-6 text-[14px] font-semibold hover:bg-transparent hover:text-[#D3E4FD] hover:border-[#D3E4FD] transition-all flex items-center gap-2 bg-transparent shrink-0 font-ui"
            >
              < Instagram className="w-4 h-4" />
              Share on Instagram
            </Button>
            <Button
              variant="outline"
              className="border-white text-white rounded-full h-[48px] px-6 text-[14px] font-semibold hover:bg-transparent hover:text-[#D3E4FD] hover:border-[#D3E4FD] transition-all flex items-center gap-2 bg-transparent shrink-0 font-ui"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 fill-current"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
              Share on X
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
