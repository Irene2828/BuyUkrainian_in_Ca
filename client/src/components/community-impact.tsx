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
        <section
            className="relative w-full overflow-hidden pt-[96px] md:pt-[128px] pb-[108px] md:pb-[144px] bg-slate-50/40 border-t border-slate-200"
        >
            <div className="boutique-width w-full mx-auto relative z-10">
                <div className="boutique-width w-full flex flex-col px-[22.8px] md:px-[38px] lg:px-[60.8px] min-[1280px]:max-[1669px]:px-[clamp(68.4px,4.75vw,87.4px)] min-[1670px]:px-[clamp(49.4px,3.42vw,68.4px)] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                        
                        {/* Left Column: Section Header */}
                        <div className="lg:col-span-4 w-full flex flex-col items-start gap-4 text-left">
                            <h2 className="text-[25px] md:text-[33px] font-semibold font-['Lora'] tracking-tight leading-[1.1] text-slate-900 section-headline-reveal">
                                Share the map <br /> with your network:
                            </h2>
                        </div>

                        {/* Right Column: Premium Interaction Block */}
                        <div className="lg:col-span-8 w-full flex flex-col items-start lg:-mt-2.5">
                            
                            {/* Boutique Container */}
                            <div className="bg-white/60 backdrop-blur-md rounded-none border-l-[2.5px] border-[#FFD700] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9)] p-5 md:p-6 lg:p-8 w-full flex flex-col relative overflow-hidden group/share-container">
                                
                                <div className="flex flex-col items-start w-full">
                                    
                                    {/* Suggested Post Block */}
                                    <div className="flex flex-col items-start relative w-full mb-6 md:mb-8">
                                        <div className="flex items-center justify-between w-full mb-4">
                                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 antialiased">
                                                Suggested Post
                                            </span>
                                            <button 
                                                onClick={() => {
                                                    handleCopy();
                                                    setCopied(true);
                                                    setTimeout(() => setCopied(false), 2000);
                                                }}
                                                className="flex items-center group text-slate-400 hover:text-[#0057B7] transition-all duration-300 active:scale-95"
                                                title="Copy suggested text"
                                            >
                                                <span className="text-[10.5px] font-bold uppercase tracking-widest mr-2 font-['Inter']">Copy</span>
                                                <Copy className="h-3.5 w-3.5 mr-3" strokeWidth={2.5} />
                                                
                                                {copied && (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#0057B7] animate-in fade-in slide-in-from-right-1 duration-300">
                                                        Copied
                                                    </span>
                                                )}
                                            </button>
                                        </div>

                                        {/* Editorial Template - Sculptural Block */}
                                        <div className="relative">
                                            <span className="text-[19.5px] italic font-['Lora'] leading-[1.65] text-slate-700 tracking-tight block antialiased">
                                                "{shareMessage}"
                                            </span>
                                        </div>
                                    </div>

                                    {/* Social Destination Row - Centered Under Text */}
                                    <div className="flex flex-col items-center w-full mt-auto">
                                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 antialiased">
                                                Post To:
                                            </span>
                                            <div className="flex items-center gap-6">
                                                <button
                                                    onClick={handleFacebookShare}
                                                    className="group inline-flex items-center justify-center transition-colors duration-200 text-[#0F1623]/80 hover:text-[#0F1623]"
                                                    aria-label="Share on Facebook"
                                                >
                                                    <Facebook className="h-[24px] w-[24px]" strokeWidth={1.5} />
                                                </button>

                                                <button
                                                    onClick={handleInstagramShare}
                                                    className="group inline-flex items-center justify-center transition-colors duration-200 text-[#0F1623]/80 hover:text-[#0F1623]"
                                                    aria-label="Share on Instagram"
                                                >
                                                    <Instagram className="h-[24px] w-[24px]" strokeWidth={1.5} />
                                                </button>

                                                <button
                                                    onClick={handleXShare}
                                                    className="group inline-flex items-center justify-center transition-colors duration-200 text-[#0F1623]/80 hover:text-[#0F1623]"
                                                    aria-label="Share on X (Twitter)"
                                                >
                                                    <svg
                                                        className="h-[22px] w-[22px]"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                    >
                                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
