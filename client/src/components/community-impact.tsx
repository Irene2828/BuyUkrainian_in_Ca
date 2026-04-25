import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Facebook, Instagram, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CommunityImpact({ hideBorder = false }: { hideBorder?: boolean }) {
    const [copied, setCopied] = useState(false);
    const { data: stores = [] } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const shareMessage = "A great way to support Ukraine locally - explore the interactive map of Ukrainian-made products sold across Canada.";
    const shareUrl = "www.buyukrainian.ca";

    const handleCopy = () => {
        void navigator.clipboard.writeText(shareMessage);
        toast.success("Text copied to clipboard");
    };

    const handleFacebookShare = () => {
        const fullUrl = `https://${shareUrl}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}&quote=${encodeURIComponent(shareMessage)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    };

    const handleInstagramShare = () => {
        handleCopy();
    };

    const handleXShare = () => {
        const fullUrl = `https://${shareUrl}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(fullUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    };

    return (
        <>
        <section
            id="share"
            className="relative w-full overflow-hidden bg-white"
        >
            <div className="relative z-10 w-full pb-6 md:pb-10">
                <div className="max-w-6xl mx-auto w-full relative px-4 sm:px-6 lg:px-8 pt-20 md:pt-32">
                    {/* Brand Yellow Top Edge Divider */}
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-[#FFD700]" aria-hidden="true" />
                    
                    <div className="max-w-3xl mx-auto w-full flex flex-col items-center text-center">
                        {/* Section Eyebrow */}
                        <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-slate-400 mb-2 antialiased">
                            HELP GROW THE PROJECT
                        </span>

                        {/* Section Header */}
                        <h2 className="text-[31px] md:text-[41px] font-medium font-['Lora'] tracking-tight leading-[1.1] text-[#0057B7] mb-8 md:mb-10 antialiased">
                            Share the map with your network:
                        </h2>
 
                        {/* Suggested Post - Pull Quote Style with Inline Copy */}
                        <div className="flex flex-col items-center relative w-full mb-10">
                            {/* Pull Quote Typography */}
                            <div className="relative max-w-3xl">
                                <span className="text-[0.92rem] md:text-[1.2rem] italic font-['Lora'] leading-relaxed text-slate-600 tracking-tight antialiased inline">
                                    "{shareMessage}"
                                </span>
                                
                                <button 
                                    onClick={() => {
                                        handleCopy();
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className="inline-flex items-center group text-slate-400 hover:text-[#FFD700] transition-all duration-300 active:scale-95 ml-4 opacity-100"
                                    title="Copy suggested text"
                                >
                                    <Copy className="h-4 w-4" strokeWidth={2.5} />
                                    
                                    {copied && (
                                        <span className="absolute -top-6 right-0 text-[10px] font-bold uppercase tracking-widest text-[#0057B7] animate-in fade-in slide-in-from-bottom-1 duration-300">
                                            Copied
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
 
                        {/* Social Row & Call to Action */}
                        <div className="flex flex-col items-center w-full gap-6 mb-12">
                            <div className="flex flex-col items-center gap-3">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 antialiased">
                                    Post To:
                                </span>
                            </div>
                            <div className="flex items-center gap-8 md:gap-10">
                                <button
                                    onClick={handleFacebookShare}
                                    className="group inline-flex items-center justify-center transition-colors duration-200 text-[#0057B7] hover:text-[#004494]"
                                    aria-label="Share on Facebook"
                                >
                                    <Facebook className="h-[26px] w-[26px]" strokeWidth={1.2} />
                                </button>

                                <button
                                    onClick={handleInstagramShare}
                                    className="group inline-flex items-center justify-center transition-colors duration-200 text-[#0057B7] hover:text-[#004494]"
                                    aria-label="Share on Instagram"
                                >
                                    <Instagram className="h-[26px] w-[26px]" strokeWidth={1.2} />
                                </button>

                                <button
                                    onClick={handleXShare}
                                    className="group inline-flex items-center justify-center transition-colors duration-200 text-[#0057B7] hover:text-[#004494]"
                                    aria-label="Share on X (Twitter)"
                                >
                                    <svg
                                        className="h-[24px] w-[24px]"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Centered Framing Accents - Anchoring the bottom */}
                            <div className="relative w-full mt-12 mb-4">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[42%] h-[3px] bg-[#0057B7] opacity-80 pointer-events-none" aria-hidden="true" />
                                <div 
                                    className="absolute left-1/2 -translate-x-1/2 h-[3px] bg-[#FFD700] pointer-events-none" 
                                    style={{ 
                                        top: 'clamp(15.3px, 1.615vw, 29.75px)',
                                        width: '37.8%'
                                    }} 
                                    aria-hidden="true" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </>
    );
}
