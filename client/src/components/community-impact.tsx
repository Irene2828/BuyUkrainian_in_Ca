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
                "relative w-full overflow-hidden bg-white pt-[120px] md:pt-[160px] pb-[160px] md:pb-[240px]",
                !hideBorder && "border-t border-slate-200/70"
            )}
        >
            {/* Ambient Sky Glow - Restored to match Hero atmosphere */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#BAE6FD] blur-[150px] opacity-10 pointer-events-none rounded-b-full z-0"></div>

            <div className="boutique-width w-full mx-auto relative z-10">
                <div className="w-full px-0 pr-4 min-[1280px]:max-[1669px]:pl-[clamp(72px,5vw,92px)] min-[1670px]:px-[clamp(52px,3.6vw,72px)]">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,624px)] md:justify-between md:gap-14 lg:gap-20 items-start md:items-center">
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

                    {/* 2. Right Column: Actions */}
                    <div className="flex flex-col items-start w-full gap-5 md:items-center">
                        <div className="relative w-full max-w-[624px] px-6 py-3 rounded-[28px] bg-white/95 backdrop-blur-md border-[0.5px] border-black/5 border-l-[4px] border-l-[#FFD700] shadow-[0_5px_12px_rgba(0,0,0,0.04),0_2px_5px_rgba(0,0,0,0.025)] text-left group/draft transition-all duration-500 stagger-item">
                            <button
                                onClick={handleCopy}
                                type="button"
                                title="Copy text"
                                aria-label="Copy text"
                                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:text-slate-700"
                            >
                                <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                            <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-4 font-medium">
                                Example text to share:
                            </p>
                            <p className="text-[13px] md:text-[14px] min-[1441px]:text-[16px] text-[#0A2540] font-ui italic leading-relaxed font-normal">
                                <span className="block">"{shareLineOne}</span>
                                <span className="block">
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

                        <div className="flex w-full max-w-[624px] flex-row flex-wrap items-center justify-end self-end gap-5 pr-3 stagger-item">
                            <button
                                onClick={handleFacebookShare}
                                className="group flex items-center gap-2 text-[13px] text-slate-500 hover:text-slate-800 transition-colors duration-300"
                                aria-label="Share on Facebook"
                            >
                                <Facebook className="w-4 h-4" strokeWidth={1.5} />
                                <span className="font-medium tracking-tight">Facebook</span>
                            </button>

                            <button
                                onClick={handleInstagramShare}
                                className="group flex items-center gap-2 text-[13px] text-slate-500 hover:text-slate-800 transition-colors duration-300"
                                aria-label="Share on Instagram"
                            >
                                <Instagram className="w-4 h-4" strokeWidth={1.5} />
                                <span className="font-medium tracking-tight">Instagram</span>
                            </button>

                            <button
                                onClick={handleXShare}
                                className="group flex items-center gap-2 text-[13px] text-slate-500 hover:text-slate-800 transition-colors duration-300"
                                aria-label="Share on X (Twitter)"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="w-5 h-5 fill-current"
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
        </section >
    );
}
