import { useState } from "react";
import { Facebook, Instagram } from "lucide-react";
import { toast } from "sonner";

export function SpreadTheWord() {
  const shareMessage = "Discovering and supporting Ukrainian products in Canada. 🇺🇦🇨🇦 Join me in supporting Ukraine.";
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://buyukrainian.ca';

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleInstagramShare = () => {
    // Instagram doesn't support URL sharing directly, so we copy the message
    navigator.clipboard.writeText(`${shareMessage}\n\n${shareUrl}`);
    toast.success("Copied to clipboard!", {
      description: "Paste this into your Instagram story or post.",
      duration: 3000,
    });
  };

  const handleXShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  return (
    <section className="relative pt-8 pb-12 md:pt-12 md:pb-[100px] bg-[#D3E4FD]/20 overflow-hidden px-6 md:px-16 z-10">
      {/* Consistent section padding */}
      <div className="mx-auto max-w-[1440px] relative z-10 flex flex-col items-center">

        <div className="text-center mb-8">
          {/* 32px gap to black container (mb-8) */}
          <h2 className="text-[28px] md:text-[36px] font-semibold text-[var(--color-section-headline)] mb-4 tracking-tight font-header section-headline-reveal">
            Spread the word
          </h2>
          <p className="text-[16px] md:text-[20px] font-normal text-slate-500 max-w-xl mx-auto leading-relaxed font-ui px-4">
            Help us reach more supporters. Share the map with your network and let others discover the best of Ukraine in Canada.
          </p>
        </div>

        {/* Black Card Section - Responsive sizing */}
        <div className="w-full md:w-[790px] max-w-full bg-black rounded-[24px] md:rounded-[40px] flex flex-col items-center justify-center text-center shadow-2xl mx-auto pt-6 px-6 pb-10 md:pt-8 md:px-8 md:pb-12">

          {/* Message Pill Layout */}
          <div className="px-4 md:px-10 py-4 mb-6 md:mb-8 w-full max-w-[650px] mx-auto">
            <p className="text-[16px] md:text-[18px] font-normal text-white leading-relaxed font-ui">
              {shareMessage}
            </p>
          </div>

          {/* Social Buttons - Stack on mobile */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 w-full">
            <button
              onClick={handleFacebookShare}
              style={{ border: '1px solid white' }}
              className="no-invert-hover text-white rounded-full h-[48px] py-3 px-6 text-[13px] md:text-[14px] font-semibold bg-transparent hover:bg-white hover:text-black transition-all duration-300 ease-in-out flex items-center justify-center gap-3 font-ui w-full sm:w-auto"
            >
              <Facebook className="w-4 h-4 fill-current" />
              Share on Facebook
            </button>
            <button
              onClick={handleInstagramShare}
              style={{ border: '1px solid white' }}
              className="no-invert-hover text-white rounded-full h-[48px] py-3 px-6 text-[13px] md:text-[14px] font-semibold bg-transparent hover:bg-white hover:text-black transition-all duration-300 ease-in-out flex items-center justify-center gap-3 font-ui w-full sm:w-auto"
            >
              <Instagram className="w-4 h-4" />
              Share on Instagram
            </button>
            <button
              onClick={handleXShare}
              style={{ border: '1px solid white' }}
              className="no-invert-hover text-white rounded-full h-[48px] py-3 px-6 text-[13px] md:text-[14px] font-semibold bg-transparent hover:bg-white hover:text-black transition-all duration-300 ease-in-out flex items-center justify-center gap-3 font-ui w-full sm:w-auto"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 fill-current"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
              Share on X
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
