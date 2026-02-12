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

            <div className="boutique-width min-[1537px]:max-w-[1440px] w-full mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 items-start">
                    {/* 1. Left Column: Message */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-premium-pulse" aria-hidden="true" />
                            <p className="text-[13px] font-bold tracking-[0.08em] text-slate-900/70 uppercase whitespace-nowrap m-0 font-ui">
                                SHARE THE MAP
                            </p>
                        </div>
                        <h2 className="text-[31px] md:text-[41px] font-semibold text-[#2D50A0] leading-tight stagger-item w-full tracking-tighter">
                            Let's grow the map<br />of Ukrainian products<br />in Canada
                        </h2>
                    </div>

                    {/* 2. Right Column: Actions */}
                    <div className="flex flex-col items-center md:items-end w-full gap-6">
                        {/* Copy Card */}
                        <div className="relative w-full max-w-[480px] p-6 rounded-2xl bg-white border border-slate-100 text-left group/draft transition-colors shadow-[0_12px_32px_rgba(45,80,160,0.04)]">
                            <div className="flex items-center justify-between mb-3">
                                <div />
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.05em] uppercase text-slate-900 hover:text-slate-700 transition-all px-2 py-1 rounded-md hover:bg-slate-100/50"
                                    aria-label="Copy suggested post to clipboard"
                                >
                                    {copied ? <Check className="w-2.5 h-2.5 stroke-[1.5px]" /> : <Copy className="w-2.5 h-2.5 stroke-[1.5px]" />}
                                    {copied ? (
                                        <span className="animate-in slide-in-from-bottom-1 duration-200 fade-in text-slate-900/70">COPIED</span>
                                    ) : (
                                        <span>COPY TEXT</span>
                                    )}
                                </button>
                            </div>
                            <p className="text-[12px] md:text-[14px] text-slate-600 font-ui italic leading-relaxed">
                                "{shareMessage} {shareUrl}"
                            </p>
                        </div>

                        {/* Social Links - Aligned Right under Card */}
                        <div className="flex flex-col items-center md:items-end gap-4 w-full max-w-[480px]">
                            <button
                                onClick={handleFacebookShare}
                                className="group flex items-center gap-2 text-brand-navy font-medium text-[15px] tracking-normal transition-all duration-200"
                                aria-label="Share on Facebook"
                            >
                                <Facebook className="w-4 h-4" strokeWidth={2} />
                                <span className="underline underline-offset-4 decoration-1 decoration-transparent transition-all duration-300 group-hover:decoration-slate-900">
                                    Share on Facebook
                                </span>
                            </button>

                            <button
                                onClick={handleInstagramShare}
                                className="group flex items-center gap-2 text-brand-navy font-medium text-[15px] tracking-normal transition-all duration-200"
                                aria-label="Share on Instagram"
                            >
                                <Instagram className="w-4 h-4" strokeWidth={2} />
                                <span className="underline underline-offset-4 decoration-1 decoration-transparent transition-all duration-300 group-hover:decoration-slate-900">
                                    Share on Instagram
                                </span>
                            </button>

                            <button
                                onClick={handleXShare}
                                className="group flex items-center gap-2 text-brand-navy font-medium text-[15px] tracking-normal transition-all duration-200"
                                aria-label="Share on X (Twitter)"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="w-[16px] h-[16px] fill-current"
                                    aria-hidden="true"
                                >
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                                </svg>
                                <span className="underline underline-offset-4 decoration-1 decoration-transparent transition-all duration-300 group-hover:decoration-slate-900">
                                    Share on X
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
}
