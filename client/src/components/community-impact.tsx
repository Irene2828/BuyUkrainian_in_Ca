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
                "relative w-full overflow-hidden bg-white pt-[96px] md:pt-[128px] pb-[96px] md:pb-[128px]",
                !hideBorder && "border-t border-slate-200/70"
            )}
        >
            {/* Ambient Sky Glow - Restored to match Hero atmosphere */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#BAE6FD] blur-[150px] opacity-10 pointer-events-none rounded-b-full z-0"></div>

            <div className="boutique-width w-full mx-auto relative z-10">
                <div className="w-full px-0 pr-4 min-[1280px]:max-[1669px]:pl-[clamp(72px,5vw,92px)] min-[1670px]:px-[clamp(52px,3.6vw,72px)]">
                    <div className="relative grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,640px)] md:justify-between md:gap-14 lg:gap-20 items-start md:items-start">
                    {/* 1. Left Column: Message */}
                    <div className="flex flex-col items-start text-left">
                        <div className="mb-4 flex h-[2px] w-8 overflow-hidden rounded-full" aria-hidden="true">
                            <span className="w-1/2 bg-[#0057B7]" />
                            <span className="w-1/2 bg-[#FFD700]" />
                        </div>
                        <h2 className="text-[25px] md:text-[33px] font-semibold text-slate-900 leading-tight stagger-item w-full tracking-tight mb-5">
                            Share the map<br />with your network
                        </h2>
                        <p className="text-[16px] text-slate-600 leading-relaxed font-normal stagger-item">
                            Let's make it easy to support Ukraine's economy<br />
                            from anywhere in Canada.
                        </p>
                    </div>

                    <div
                        className="pointer-events-none absolute left-[43%] top-[28px] z-[1] hidden min-[1280px]:block opacity-85"
                        aria-hidden="true"
                    >
                        <svg viewBox="0 0 190 132" className="h-[132px] w-[190px] overflow-visible">
                            <defs>
                                <marker
                                    id="share-guide-arrowhead"
                                    markerWidth="10"
                                    markerHeight="10"
                                    refX="8"
                                    refY="5"
                                    orient="auto"
                                    markerUnits="strokeWidth"
                                >
                                    <path d="M0 0 L10 5 L0 10 Z" fill="#FFD700" />
                                </marker>
                            </defs>
                            <path
                                d="M10 108 C 48 106, 72 82, 96 54 S 146 18, 182 24"
                                fill="none"
                                stroke="#FFD700"
                                strokeWidth="2"
                                strokeDasharray="6 8"
                                strokeLinecap="round"
                                markerEnd="url(#share-guide-arrowhead)"
                            />
                        </svg>
                    </div>

                    {/* 2. Right Column: Actions */}
                    <div className="flex w-full justify-start md:justify-end">
                        <div className="flex w-full max-w-[640px] flex-col items-end gap-5">
                            <div className="relative w-full min-h-[148px] md:min-h-[172px] px-7 py-5 md:px-8 md:py-6 rounded-[28px] bg-white/95 backdrop-blur-md border-[0.5px] border-black/5 border-l-[4px] border-l-[#FFD700] shadow-[0_5px_12px_rgba(0,0,0,0.04),0_2px_5px_rgba(0,0,0,0.025)] text-left group/draft transition-all duration-500 stagger-item">
                                <button
                                    onClick={handleCopy}
                                    type="button"
                                    title="Copy text"
                                    aria-label="Copy text"
                                    className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:text-slate-700"
                                >
                                    <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                                </button>
                                <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-5 font-medium">
                                    Example text to share:
                                </p>
                                <p className="text-[13px] md:text-[15px] min-[1441px]:text-[15px] text-[#0A2540] font-ui italic leading-[1.55] tracking-[-0.01em] font-normal">
                                    <span className="block md:whitespace-nowrap">"{shareLineOne}</span>
                                    <span className="block md:whitespace-nowrap">
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
                            </div>

                            <div className="flex w-fit flex-col items-end gap-3.5 pr-3 stagger-item antialiased">
                                <button
                                    onClick={handleFacebookShare}
                                    className="group flex items-center gap-2.5 text-[12px] text-slate-400 hover:text-[#0A2540] transition-colors duration-300 uppercase tracking-[0.08em]"
                                    aria-label="Share on Facebook"
                                >
                                    <span className="font-normal">Share on Facebook</span>
                                    <Facebook className="w-[14px] h-[14px] mb-[1px]" strokeWidth={1.5} />
                                </button>

                                <button
                                    onClick={handleInstagramShare}
                                    className="group flex items-center gap-2.5 text-[12px] text-slate-400 hover:text-[#0A2540] transition-colors duration-300 uppercase tracking-[0.08em]"
                                    aria-label="Share on Instagram"
                                >
                                    <span className="font-normal">Share on Instagram</span>
                                    <Instagram className="w-[14px] h-[14px] mb-[1px]" strokeWidth={1.5} />
                                </button>

                                <button
                                    onClick={handleXShare}
                                    className="group flex items-center gap-2.5 text-[12px] text-slate-400 hover:text-[#0A2540] transition-colors duration-300 uppercase tracking-[0.08em]"
                                    aria-label="Share on X"
                                >
                                    <span className="font-normal">Share on X</span>
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="w-[13px] h-[13px] fill-current mb-[1px]"
                                        aria-hidden="true"
                                    >
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
                </div>
            </div>
        </section >
    );
}
