import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getApprovedStores } from "@/lib/api";
import { Facebook, Instagram, Plus, Check, Copy } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export function CommunityImpact({ hideBorder = false }: { hideBorder?: boolean }) {
    const { data: stores = [] } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
    });

    const shareMessage = "I just found a great way to support Ukraine locally. Check out this interactive map of Ukrainian-made products in Canada:";
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
        <section className={cn(
            "relative w-full bg-white py-16 section-reveal overflow-hidden",
            !hideBorder && "border-b border-brand-navy/10"
        )}>
            {/* Background Blobs */}
            <div
                className="absolute pointer-events-none rounded-full"
                style={{
                    width: '600px',
                    height: '600px',
                    left: 'calc(50% - 714px)',
                    top: '-300px',
                    background: 'rgba(0, 113, 227, 0.16)',
                    filter: 'blur(120px)',
                    zIndex: 0
                }}
            />
            <div
                className="absolute pointer-events-none rounded-full"
                style={{
                    width: '500px',
                    height: '500px',
                    left: 'calc(50% + 225px)',
                    top: '335px',
                    background: 'rgba(255, 212, 39, 0.23)',
                    filter: 'blur(100px)',
                    zIndex: 0
                }}
            />

            <div className="boutique-width w-full mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 items-start">
                    {/* 1. Left Column: Message */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-premium-pulse" aria-hidden="true" />
                            <p className="text-[13px] font-bold tracking-[0.08em] text-slate-900/70 uppercase whitespace-nowrap m-0 font-ui">
                                HELP THE PROJECT GROW
                            </p>
                        </div>
                        <h2 className="text-[31px] md:text-[41px] font-semibold text-slate-900 leading-tight stagger-item w-full tracking-tight mb-5">
                            Share the map<br />with your network
                        </h2>
                        <p className="text-[16px] text-slate-600 leading-relaxed font-normal stagger-item">
                            The more people know where to buy products made in Ukraine,<br />
                            the more support Ukrainian economy can get from each conscious purchase.
                        </p>
                    </div>

                    {/* 2. Right Column: Actions */}
                    <div className="flex flex-col items-center md:items-end w-full gap-5">
                        {/* Copy Card (Glass Style) */}
                        <div className="relative w-full max-w-[520px] p-6 rounded-2xl bg-slate-50/50 backdrop-blur-sm border border-slate-100 text-left group/draft transition-all duration-500 shadow-[0_8px_32px_rgba(45,80,160,0.02)]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                        copied ? "bg-lime-500 scale-125 animate-pulse" : "bg-slate-300"
                                    )} />
                                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Message Preview</span>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-slate-500 hover:text-black transition-all group/copy-btn"
                                    aria-label="Copy suggested post to clipboard"
                                >
                                    {copied ? (
                                        <span className="animate-in slide-in-from-bottom-1 duration-200 fade-in text-lime-600">COPIED</span>
                                    ) : (
                                        <span>COPY TEXT</span>
                                    )}
                                    <div className={cn(
                                        "p-1.5 rounded-md transition-all duration-200",
                                        copied ? "bg-lime-50" : "group-hover/copy-btn:bg-slate-100"
                                    )}>
                                        <Copy className={cn(
                                            "w-3 h-3 transition-colors duration-200",
                                            copied ? "text-lime-600" : "text-slate-400 group-hover/copy-btn:text-lime-500"
                                        )} strokeWidth={2.5} />
                                    </div>
                                </button>
                            </div>
                            <p className="text-[13px] md:text-[15px] text-slate-600 font-ui italic leading-relaxed">
                                "{shareMessage} {shareUrl}"
                            </p>
                        </div>

                        {/* Social Links - Premium monochromatic refactor */}
                        <div className="flex flex-col items-center md:items-end gap-5 w-full max-w-[520px] md:pr-4">
                            <button
                                onClick={handleFacebookShare}
                                className="group relative flex items-center gap-3 text-slate-700 opacity-70 hover:opacity-100 transition-all duration-300 pb-1"
                                aria-label="Share on Facebook"
                            >
                                <Facebook className="w-4 h-4" strokeWidth={1.5} />
                                <span className="text-[15px] font-medium tracking-tight">
                                    Share on Facebook
                                </span>
                                <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                            </button>

                            <button
                                onClick={handleInstagramShare}
                                className="group relative flex items-center gap-3 text-slate-700 opacity-70 hover:opacity-100 transition-all duration-300 pb-1"
                                aria-label="Share on Instagram"
                            >
                                <Instagram className="w-4 h-4" strokeWidth={1.5} />
                                <span className="text-[15px] font-medium tracking-tight">
                                    Share on Instagram
                                </span>
                                <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                            </button>

                            <button
                                onClick={handleXShare}
                                className="group relative flex items-center gap-3 text-slate-700 opacity-70 hover:opacity-100 transition-all duration-300 pb-1"
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
                                <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
}
