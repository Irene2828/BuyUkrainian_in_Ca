import { Facebook, Instagram } from "lucide-react";
import { toast } from "sonner";

export function SpreadTheWord() {
  const shareMessage = "Find or add stores that sell Ukrainian-made products.🇺🇦🇨🇦\nLet’s make it easy to buy Ukrainian in Canada.";
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://buyukrainian.ca';

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleInstagramShare = () => {
    // Instagram doesn't support URL sharing directly, so we copy the message
    navigator.clipboard.writeText(`${shareMessage}\n\n${shareUrl}`);
    toast.success("Copied to clipboard", {
      description: "Paste this into your Instagram story or post.",
      duration: 3000,
    });
  };

  const handleXShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };



  return (
    <section className="relative w-full bg-[#ECF6FF] py-20 md:py-20 min-h-[420px] overflow-hidden z-10 flex flex-col justify-center">

      {/* Structural Container */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full relative z-10 flex flex-col items-center">

        <div className="mb-10 max-w-3xl mx-auto flex flex-col gap-6 text-center">
          <h2 className="text-[36px] font-semibold tracking-tight leading-[52.5px] font-sans section-headline-reveal text-slate-900">
            Share with Friends
          </h2>

          <p className="subline font-ui max-w-2xl mx-auto">
            The more people know where to buy Ukrainian in Canada, the more support we can provide to Ukrainian businesses selling in Canada.
          </p>
        </div>

        <div className="relative w-full max-w-[720px] mx-auto">

          {/* Material Card Section - Wide & Compact */}
          <div className="w-full h-full md:h-auto bg-slate-900 backdrop-blur-xl border border-slate-800 rounded-[40px] md:rounded-[50px] flex flex-col items-center justify-center text-center py-10 px-8 md:px-12 relative z-10 overflow-hidden isolate">

            {/* Subtle Inner Border/Glow */}
            <div className="absolute inset-0 rounded-[40px] md:rounded-[50px] ring-1 ring-white/10 pointer-events-none" />

            {/* Inner Light Overlay - Covers Container Fully */}
            <div className="absolute inset-0 bg-[#C5E0F5] opacity-10 pointer-events-none" />



            {/* Intimate Note Text */}
            <div className="px-2 md:px-0 mb-5 w-full max-w-[800px] mx-auto text-center relative z-10">
              <p className="text-[20px] font-medium text-slate-100 leading-relaxed tracking-normal font-sans">
                <span className="text-white inline-block mr-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '28px' }}>"</span>
                Let's make it easy to buy Ukrainian in Canada. 🇺🇦🇨🇦
              </p>
              <p className="text-[17px] font-normal text-slate-400 leading-[1.6] tracking-normal font-sans mt-1.5">
                Join me in helping Ukrainian economy thrive.
                <span className="text-white inline-block ml-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '28px' }}>"</span>
              </p>
            </div>

            {/* Social Buttons - Utility Tags */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-3 w-full max-w-[720px] mx-auto relative z-10 group/socials">
              <button
                onClick={handleFacebookShare}
                className="no-invert-hover group relative h-auto flex items-center justify-center gap-2 px-4 py-2 text-[12px] tracking-[0.1em] text-white group-hover/socials:text-slate-300 hover:text-white transition-all duration-200 bg-transparent font-medium whitespace-nowrap"
              >
                <Facebook className="w-[14px] h-[14px] fill-current" />
                Share on Facebook
                <span className="absolute bottom-0 left-4 right-4 h-[1px] bg-white scale-x-100 group-hover/socials:scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </button>
              <button
                onClick={handleInstagramShare}
                className="no-invert-hover group relative h-auto flex items-center justify-center gap-2 px-4 py-2 text-[12px] tracking-[0.1em] text-slate-300 hover:text-white transition-all duration-200 bg-transparent font-medium whitespace-nowrap"
              >
                <Instagram className="w-[12px] h-[12px]" />
                Share on Instagram
                <span className="absolute bottom-0 left-4 right-4 h-[1px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </button>
              <button
                onClick={handleXShare}
                className="no-invert-hover group relative h-auto flex items-center justify-center gap-2 px-4 py-2 text-[12px] tracking-[0.1em] text-slate-300 hover:text-white transition-all duration-200 bg-transparent font-medium whitespace-nowrap"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-[14px] h-[14px] fill-current"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
                Share on X
                <span className="absolute bottom-0 left-4 right-4 h-[1px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </button>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
