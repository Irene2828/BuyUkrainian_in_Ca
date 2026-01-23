import { Facebook, Instagram } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SpreadTheWord() {
  const shareMessage = "Discover or add places that sell Ukraine-made goods.🇺🇦🇨🇦\nLet’s make it easy to buy Ukrainian in Canada!";
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

  const buttonClass = "w-full max-w-[320px] md:w-auto flex items-center justify-center gap-2 px-8 py-2.5 rounded-full text-[13px] text-white transition-all duration-300 border !border-white bg-transparent hover:!bg-white hover:!text-black font-medium";

  return (
    <section className="relative w-full bg-[#ECF6FF] py-16 md:py-16 overflow-hidden z-10 flex flex-col justify-center">
      {/* Structural Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-10 flex flex-col items-center">

        <div className="mb-8 max-w-3xl mx-auto flex flex-col gap-3 text-center">
          {/* 12px gap (gap-3) standardized across all sections */}
          <h2 className="text-[36px] font-semibold tracking-tight leading-[52.5px] font-sans section-headline-reveal text-slate-900">
            Share with Friends
          </h2>
          <p className="text-[16px] md:text-[18px] font-normal md:leading-[29.3px] md:tracking-[-0.44px] text-gray-600 font-ui">
            Share the map with your network and let others discover the best of Ukraine in Canada.
          </p>
        </div>

        {/* Material Card Section */}
        <div className="w-full md:w-[790px] md:h-[252px] max-w-full bg-[#000000] backdrop-blur-xl border border-white/10 rounded-[24px] md:rounded-[40px] flex flex-col items-center justify-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] mx-auto py-12 px-6 md:px-8">

          {/* Message Pill Layout */}
          <div className="px-4 md:px-10 mb-8 w-full max-w-[650px] mx-auto text-center">
            <p className="text-[16px] md:text-[18px] font-normal text-white/90 leading-relaxed font-ui whitespace-pre-line">
              {shareMessage}
            </p>
          </div>

          {/* Social Buttons - Vertically stacked per user request */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 w-full">
            <button
              onClick={handleFacebookShare}
              className={buttonClass}
            >
              <Facebook className="w-[14px] h-[14px] fill-none stroke-current" strokeWidth={2} />
              Share on Facebook
            </button>
            <button
              onClick={handleInstagramShare}
              className={buttonClass}
            >
              <Instagram className="w-[14px] h-[14px] fill-none stroke-current" strokeWidth={2} />
              Share on Instagram
            </button>
            <button
              onClick={handleXShare}
              className={buttonClass}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-[14px] h-[14px] fill-none stroke-current"
                strokeWidth="2"
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
