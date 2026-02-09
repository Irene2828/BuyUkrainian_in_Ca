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
            "relative w-full bg-white py-[72px] section-reveal overflow-hidden"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-center md:text-left">
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-premium-pulse" aria-hidden="true" />
                            <p className="text-[13px] font-bold tracking-[0.08em] text-slate-900/70 uppercase whitespace-nowrap m-0 font-ui">
                                SHARE THE MAP
                            </p>
                        </div>
                        <h2 className="text-[31px] md:text-[41px] font-semibold text-[#2D50A0] leading-tight mb-4 stagger-item max-w-[25ch]">
                            Let's make it easy<br />to buy Ukrainian<br />in Canada
                        </h2>
                        <p className="text-[14px] text-[#424245] font-ui leading-relaxed max-w-[45ch] mx-auto md:mx-0 mb-8">
                            We're creating a community-driven resource to help you find and support Ukrainian makers and entrepreneurship across Canada.
                        </p>

                        <a
                            href="mailto:hello@buyukrainian.ca?subject=Volunteer%20Inquiry"
                            className="group flex items-center gap-2 text-[16px] font-medium text-slate-500 hover:text-slate-900 transition-colors py-2"
                        >
                            <div className="w-1.5 h-1.5 bg-[#F4C542] rounded-full shadow-[0_0_4px_rgba(244,197,66,0.5)]" />
                            <span>Volunteer for the Project</span>
                        </a>
                    </div>

                    <div className="flex flex-col items-center md:items-end w-full">
                        {/* Draft Preview Box */}
                        <div className="relative w-full max-w-[380px] mb-8 p-6 rounded-2xl bg-white border border-slate-100 text-left group/draft transition-colors shadow-[0_12px_32px_rgba(45,80,160,0.04)]">
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

                        <ul className="flex flex-col items-center md:items-end gap-4 list-none p-0 m-0">
                            <li>
                                <button
                                    onClick={handleFacebookShare}
                                    className="flex items-center gap-4 px-4 h-[44px] text-[15px] font-medium text-[#2D50A0] transition-all duration-300 hover:opacity-100 group relative"
                                    aria-label="Share on Facebook"
                                >
                                    <Facebook className="w-[18px] h-[18px] text-[#2D50A0]" />
                                    <span>Share on Facebook</span>
                                    <span className="absolute bottom-[2px] left-4 right-4 h-[1px] bg-[#2D50A0] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={handleInstagramShare}
                                    className="flex items-center gap-4 px-4 h-[44px] text-[15px] font-medium text-[#2D50A0] transition-all duration-300 hover:opacity-100 group relative"
                                    aria-label="Share on Instagram"
                                >
                                    <Instagram className="w-[18px] h-[18px] text-[#2D50A0]" />
                                    <span>Share on Instagram</span>
                                    <span className="absolute bottom-[2px] left-4 right-4 h-[1px] bg-[#2D50A0] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={handleXShare}
                                    className="flex items-center gap-4 px-4 h-[44px] text-[15px] font-medium text-[#2D50A0] transition-all duration-300 hover:opacity-100 group relative"
                                    aria-label="Share on X (Twitter)"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="w-[18px] h-[18px] fill-[#2D50A0]"
                                        aria-hidden="true"
                                    >
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                                    </svg>
                                    <span>Share on X</span>
                                    <span className="absolute bottom-[2px] left-4 right-4 h-[1px] bg-[#2D50A0] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section >
    );
}
