import { useState } from "react";
import { Facebook, Instagram, Copy } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export function CommunityImpact() {
    const { t } = useI18n();
    const [copied, setCopied] = useState(false);

    const shareMessage = t("communityImpact.shareMessage") || "A great way to support Ukraine locally - explore the interactive map of Ukrainian-made products sold across Canada.";
    const shareUrl = "www.buyukrainian.ca";

    const handleCopy = () => {
        void navigator.clipboard.writeText(shareMessage);
        toast.success(t("communityImpact.copySuccess") || "Text copied to clipboard");
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
            id="share"
            className="relative w-full overflow-hidden bg-white py-8 md:py-12"
        >
            <div className="content-width flex flex-col justify-center items-center">
                {/* Brand Blue Divider */}
                <div className="w-20 md:w-28 h-[3px] bg-[#0057B7] rounded-full mb-8 md:mb-10 mx-auto" aria-hidden="true" />
                
                {/* Composition Container */}
                <div className="relative w-full max-w-4xl mx-auto min-h-[400px] flex items-center justify-center">
                    
                    {/* Background Yellow Square (Right) */}
                    <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-end">
                        <div className="h-[85%] w-[40%] translate-x-[10%] bg-[#FFD700]" />
                    </div>

                    {/* Main Content Block (White with Brand Blue border) */}
                    <div 
                        className="relative z-10 bg-white border border-dashed w-11/12 md:w-full pt-10 pb-5 px-6 md:px-16 text-center flex flex-col items-center transition-all duration-300 ease-out"
                        style={{ borderColor: '#0057B7' }}
                    >
                        
                        {/* Section Header */}
                        <h2
                            className="text-reveal text-xl md:text-2xl font-bold text-slate-900 uppercase tracking-widest mb-3 font-sans"
                        >
                            {t("communityImpact.titleLine1")} {t("communityImpact.titleLine2")}
                        </h2>
  
                        {/* Suggested Post - Pull Quote Style with Inline Copy */}
                        <div
                            className="flex flex-col items-center relative w-full mb-3"
                        >
                            <div className="relative max-w-2xl bg-white py-2.5 px-6 md:py-3 md:px-8 rounded-none">
                                <div className="text-reveal text-base md:text-[18px] italic font-medium leading-relaxed text-slate-600 tracking-[0.02em] antialiased text-center">
                                    <span>"{shareMessage}"</span>
                                    
                                    <button 
                                        onClick={() => {
                                            handleCopy();
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className="inline-flex items-center group text-slate-400 hover:text-[#0057B7] transition-all duration-300 hover:scale-[1.05] active:scale-95 ml-3 relative align-middle"
                                        title="Copy suggested text"
                                    >
                                        <Copy className="h-5 w-5" strokeWidth={2} />
                                        
                                        {copied && (
                                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-white bg-[#0057B7] px-2 py-1 shadow-md border border-white/20 animate-in fade-in duration-300">
                                                {t("communityImpact.copied") || "Copied"}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
 
                        {/* Social Row & Call to Action */}
                        <div
                            className="flex flex-col items-center w-full gap-2"
                        >
                            <span className="text-reveal text-[11px] uppercase tracking-[0.2em] font-bold text-slate-400 antialiased mb-1" style={{ transitionDelay: "140ms" }}>
                                {t("communityImpact.postTo") || "Post To:"}
                            </span>
                            
                            <div className="flex items-center gap-8 md:gap-10">
                                <button
                                    onClick={handleFacebookShare}
                                    className="group inline-flex items-center justify-center transition-all duration-300 text-slate-400 hover:text-[#0057B7] hover:scale-[1.05] active:scale-95"
                                    aria-label="Share on Facebook"
                                >
                                    <Facebook className="h-[26px] w-[26px]" strokeWidth={1.5} />
                                </button>
 
                                <button
                                    onClick={handleInstagramShare}
                                    className="group inline-flex items-center justify-center transition-all duration-300 text-slate-400 hover:text-[#0057B7] hover:scale-[1.05] active:scale-95"
                                    aria-label="Share on Instagram"
                                >
                                    <Instagram className="h-[26px] w-[26px]" strokeWidth={1.5} />
                                </button>
 
                                <button
                                    onClick={handleXShare}
                                    className="group inline-flex items-center justify-center transition-all duration-300 text-slate-400 hover:text-[#0057B7] hover:scale-[1.05] active:scale-95"
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
                        </div>
 
                    </div>
                </div>
            </div>
        </section>
    );
}
