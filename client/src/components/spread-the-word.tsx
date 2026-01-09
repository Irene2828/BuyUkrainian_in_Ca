import { Facebook, Instagram } from "lucide-react";
import { Button } from "./ui/button";

export function SpreadTheWord() {
  return (
    <section className="relative py-12 md:py-24 bg-[#D3E4FD]/[0.08] overflow-hidden px-6 md:px-16 z-10">
      {/* Unified responsive padding */}
      <div className="mx-auto max-w-[1440px] relative z-10 flex flex-col items-center">

        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-[28px] md:text-[42px] font-medium text-[var(--color-section-headline)] mb-4 tracking-tight font-header section-headline-reveal">
            Spread the word
          </h2>
          <p className="text-[16px] md:text-[18px] font-normal text-gray-400 max-w-[700px] mx-auto leading-relaxed font-ui px-4">
            Help grow our vibrant community by sharing this project with your friends!
            Choose a message or just share the map.
          </p>
        </div>

        {/* Black Card Section - Responsive sizing */}
        <div className="w-full md:w-[790px] max-w-full bg-black rounded-[24px] md:rounded-[40px] flex flex-col items-center justify-center text-center shadow-2xl mx-auto p-6 md:p-8">

          {/* Message Pill Layout */}
          <div className="px-4 md:px-10 py-4 mb-6 md:mb-8 w-full max-w-[650px] mx-auto">
            <p className="text-[16px] md:text-[18px] font-normal text-white leading-relaxed font-ui">
              Proud to support Ukrainian products sold in Canada! 🇺🇦🇨🇦 — Let's support the economy together!
            </p>
          </div>

          {/* Social Buttons - Stack on mobile */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 w-full">
            <Button
              variant="outline"
              className="border-white text-white rounded-full h-[44px] md:h-[48px] px-4 md:px-6 text-[13px] md:text-[14px] font-semibold hover:bg-transparent hover:text-[#D3E4FD] hover:border-[#D3E4FD] transition-all flex items-center justify-center gap-2 bg-transparent font-ui w-full sm:w-auto"
            >
              <Facebook className="w-4 h-4 fill-current" />
              Share on Facebook
            </Button>
            <Button
              variant="outline"
              className="border-white text-white rounded-full h-[44px] md:h-[48px] px-4 md:px-6 text-[13px] md:text-[14px] font-semibold hover:bg-transparent hover:text-[#D3E4FD] hover:border-[#D3E4FD] transition-all flex items-center justify-center gap-2 bg-transparent font-ui w-full sm:w-auto"
            >
              <Instagram className="w-4 h-4" />
              Share on Instagram
            </Button>
            <Button
              variant="outline"
              className="border-white text-white rounded-full h-[44px] md:h-[48px] px-4 md:px-6 text-[13px] md:text-[14px] font-semibold hover:bg-transparent hover:text-[#D3E4FD] hover:border-[#D3E4FD] transition-all flex items-center justify-center gap-2 bg-transparent font-ui w-full sm:w-auto"
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
