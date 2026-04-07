import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getApprovedStores } from "@/lib/api";
import { Facebook, Instagram, Plus, Check, Copy, Share2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export function CommunityImpact({ hideBorder = false }: { hideBorder?: boolean }) {
    const { data: stores = [] } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const shareMessage = "I just found a great way to support Ukraine in Canada 🇨🇦. Check out this interactive map of Ukrainian-made products:";
    const shareUrl = 'www.buyukrainian.ca';

    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(`${shareMessage} ${shareUrl}`);
        setCopied(true);
        toast.success("Text copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFacebookShare = () => {
        const fullUrl = `https://${shareUrl}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}&quote=${encodeURIComponent(shareMessage + " " + shareUrl)}`;
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
        <section className="relative w-full overflow-hidden bg-white py-[60px] md:py-[100px] border-t border-slate-200">
            {/* Ambient Sky Glow - Restored to match Hero atmosphere */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#BAE6FD] blur-[150px] opacity-10 pointer-events-none rounded-b-full z-0"></div>

            <div className="boutique-width w-full mx-auto relative z-10">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,624px)] md:justify-between md:gap-16 lg:gap-24 items-start">
                    {/* 1. Left Column: Message */}
                    <div className="flex flex-col items-start text-left">
                        <div className="flex items-center gap-2.5 mb-4">
                            <Share2 size={14} className="text-slate-900/70" />
                            <p className="text-[13px] font-bold tracking-widest text-slate-900/70 uppercase whitespace-nowrap m-0 font-ui">
                                HELP THE PROJECT GROW
                            </p>
                        </div>
                        <h2 className="text-[25px] md:text-[33px] font-semibold text-slate-900 leading-tight stagger-item w-full tracking-tight mb-5">
                            Share the map<br />with your network
                        </h2>
                        <p className="text-[16px] text-slate-600 leading-relaxed font-normal stagger-item">
                            Let's make it easy to support Ukraine's economy<br />
                            from anywhere in Canada.
                        </p>
                    </div>

                    {/* 2. Right Column: Actions */}
                    <div className="flex flex-col items-center md:items-end w-full gap-10">
                        {/* Copy Card (Glass Style - Swapped to Top) */}
                        <div className="relative w-full max-w-[624px] px-8 py-4 rounded-[32px] bg-white/95 backdrop-blur-md border-[0.5px] border-black/5 border-l-[4px] border-l-[#FFD700] shadow-[0_5px_12px_rgba(0,0,0,0.04),0_2px_5px_rgba(0,0,0,0.025)] text-left group/draft transition-all duration-500 stagger-item">
                            <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-4 font-medium">
                                One way to share it — or use your own words
                            </p>
                            <p className="text-[13px] md:text-[14px] min-[1441px]:text-[16px] text-[#0A2540] font-ui italic leading-relaxed font-normal">
                                "{shareMessage} {shareUrl}"
                            </p>
                            <div className="flex items-center justify-end mt-5">
                                <button
                                    onClick={handleCopy}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-200 ease-out group/copy-btn active:scale-95 select-none",
                                        copied
                                            ? "bg-lime-50 text-lime-700 ring-1 ring-lime-200/50"
                                            : "bg-[#0057B7] text-white hover:bg-[#0047A0]"
                                    )}
                                    aria-label="Copy suggested post to clipboard"
                                >
                                    {copied ? (
                                        <span className="animate-in slide-in-from-bottom-1 duration-200 fade-in">COPIED</span>
                                    ) : (
                                        <span>COPY TEXT</span>
                                    )}
                                    <Copy className={cn(
                                        "w-3 h-3 transition-colors duration-200",
                                        copied ? "text-lime-600" : "text-white/80 group-hover/copy-btn:text-white"
                                    )} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>

                        {/* Social Links - Swapped to Bottom */}
                        <div className="flex flex-col items-center md:items-end gap-5 w-full stagger-item">
                            <button
                                onClick={handleFacebookShare}
                                className="group relative flex items-center gap-3 text-[#0A2540]/80 hover:text-[#0057B7] transition-all duration-300 pb-1"
                                aria-label="Share on Facebook"
                            >
                                <Facebook className="w-4 h-4" strokeWidth={1.5} />
                                <span className="text-[15px] font-medium tracking-tight">
                                    Share on Facebook
                                </span>
                                <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#FFD700] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                            </button>

                            <button
                                onClick={handleInstagramShare}
                                className="group relative flex items-center gap-3 text-[#0A2540]/80 hover:text-[#0057B7] transition-all duration-300 pb-1"
                                aria-label="Share on Instagram"
                            >
                                <Instagram className="w-4 h-4" strokeWidth={1.5} />
                                <span className="text-[15px] font-medium tracking-tight">
                                    Share on Instagram
                                </span>
                                <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#FFD700] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                            </button>

                            <button
                                onClick={handleXShare}
                                className="group relative flex items-center gap-3 text-[#0A2540]/80 hover:text-[#0057B7] transition-all duration-300 pb-1"
                                aria-label="Share on X (Twitter)"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="w-[15px] h-[15px] fill-current"
                                    aria-hidden="true"
                                >
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                                </svg>
                                <span className="text-[15px] font-medium tracking-tight">
                                    Share on X
                                </span>
                                <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#FFD700] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section >
    );
}
