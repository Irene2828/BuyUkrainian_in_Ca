import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Facebook, Instagram, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CommunityImpact({ hideBorder = false }: { hideBorder?: boolean }) {
    const { data: stores = [] } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const shareLineOne = "Here is a great way to support Ukraine - explore this interactive map";
    const shareLineTwo = "of Ukrainian-made products sold across Canada -";
    const shareUrl = "www.buyukrainian.ca";
    const shareMessage = `${shareLineOne}\n${shareLineTwo} ${shareUrl}`;

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
            className={cn(
                "relative w-full overflow-hidden bg-white pt-[96px] md:pt-[128px] pb-[144px] md:pb-[192px]",
                !hideBorder && "border-t border-slate-200/70"
            )}
        >
            {/* Ambient Sky Glow - Restored to match Hero atmosphere */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#BAE6FD] blur-[150px] opacity-10 pointer-events-none rounded-b-full z-0"></div>

            <div className="boutique-width w-full mx-auto relative z-10">
                <div className="w-full px-0 pr-4 min-[1280px]:max-[1669px]:pl-[clamp(72px,5vw,92px)] min-[1670px]:px-[clamp(52px,3.6vw,72px)]">
                        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,640px)] md:justify-between md:gap-14 lg:gap-20 items-start md:items-start">
                            {/* Curved Dashed Arrow SVG - Leading to Copy Chip - Refined hand-drawn look in GREY */}
                            <div className="hidden min-[1130px]:block absolute top-[65px] left-[29%] w-[300px] h-[160px] pointer-events-none z-0 opacity-[0.8] transition-all duration-700">
                                <svg width="300" height="160" viewBox="0 0 300 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                    <path 
                                        d="M10 30C50 -10 120 10 140 60C160 110 210 130 245 105" 
                                        stroke="#94A3B8" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeDasharray="8 8"
                                        className="animate-[dash_4s_ease-in-out_infinite]"
                                    />
                                    {/* Refined Arrowhead - Sharper and aligned with curve ending */}
                                    <path 
                                        d="M233 115L247 104L234 94" 
                                        stroke="#94A3B8" 
                                        strokeWidth="2.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            {/* 1. Left Column: Message */}
                            <div className="flex flex-col items-start text-left">
                                <div className="flex items-stretch gap-6">
                                    <div className="flex flex-col h-auto w-[2px] overflow-hidden rounded-full shrink-0" aria-hidden="true">
                                        <span className="h-1/2 bg-[#0057B7]" />
                                        <span className="h-1/2 bg-[#FFD700]" />
                                    </div>
                                    <h2 className="text-[25px] md:text-[33px] font-semibold font-['Lora'] text-slate-900 leading-tight stagger-item w-full tracking-tight">
                                        Share the map<br />with your network
                                    </h2>
                                </div>
                                <p className="text-[16px] text-slate-600 leading-relaxed font-normal stagger-item mt-6">
                                    Let's make it easy to support Ukraine's economy<br />
                                    from anywhere in Canada.
                                </p>
                            </div>

                            {/* 2. Right Column: Actions */}
                            <div className="flex w-full justify-start md:justify-end">
                                <div className="flex w-full max-w-lg flex-col items-stretch">
                                    <div className="relative flex w-full min-h-[148px] flex-col gap-6 rounded-[28px] border-[0.5px] border-black/5 border-l-[4px] border-l-[#FFD700] bg-white/95 px-7 py-5 text-left shadow-[0_5px_12px_rgba(0,0,0,0.04),0_2px_5px_rgba(0,0,0,0.025)] backdrop-blur-md transition-all duration-500 stagger-item md:min-h-[172px] md:px-8 md:py-6">
                                    <div className="mt-2 flex w-full flex-col gap-3">
                                        <div className="flex w-full flex-col items-start gap-4">
                                                <p className="whitespace-normal break-words text-[15.5px] font-normal leading-relaxed tracking-tight text-[#0A2540] font-['Inter'] text-left w-full">
                                                    <span className="block whitespace-normal break-words">"{shareLineOne}</span>
                                                    <span className="block whitespace-normal break-words">
                                                        {shareLineTwo}{" "}
                                                        <a
                                                            href={`https://${shareUrl}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="font-medium text-[#0057B7] underline decoration-[#0057B7]/35 underline-offset-[3px] transition-colors duration-300 hover:text-[#0047A0]"
                                                        >
                                                            {shareUrl}
                                                        </a>
                                                        "
                                                    </span>
                                                </p>
                                                <div className="flex w-full justify-end">
                                                    <button
                                                        onClick={handleCopy}
                                                        className="group inline-flex items-center gap-1.5 rounded-full bg-transparent px-3 py-0.5 text-[12px] font-medium text-slate-500 border border-slate-200 transition-all duration-300 hover:bg-slate-50 hover:text-[#0057B7] hover:border-[#BBD9FF]"
                                                        aria-label="Copy text to clipboard"
                                                    >
                                                        <Copy className="h-[13px] w-[13px]" strokeWidth={2} />
                                                        <span>Copy text</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-slate-100 pt-3 antialiased">
                                                <span className="text-[11px] uppercase tracking-[0.1em] font-semibold text-slate-400 mr-2">Share:</span>
                                                <button
                                                    onClick={handleFacebookShare}
                                                    className="group inline-flex items-center gap-2 text-[12px] font-medium text-slate-500 transition-all duration-300 hover:text-[#0057B7]"
                                                    aria-label="Share on Facebook"
                                                >
                                                    <Facebook className="h-[14px] w-[14px]" strokeWidth={1.5} />
                                                    <span>Facebook</span>
                                                </button>

                                                <button
                                                    onClick={handleInstagramShare}
                                                    className="group inline-flex items-center gap-2 text-[12px] font-medium text-slate-500 transition-all duration-300 hover:text-[#0057B7]"
                                                    aria-label="Share on Instagram"
                                                >
                                                    <Instagram className="h-[14px] w-[14px]" strokeWidth={1.5} />
                                                    <span>Instagram</span>
                                                </button>

                                                <button
                                                    onClick={handleXShare}
                                                    className="group inline-flex items-center gap-2 text-[12px] font-medium text-slate-500 transition-all duration-300 hover:text-[#0057B7]"
                                                    aria-label="Share on X"
                                                >
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        className="h-[12px] w-[12px] fill-current"
                                                        aria-hidden="true"
                                                    >
                                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                                                    </svg>
                                                    <span>X</span>
                                                </button>
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
