import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Facebook, Instagram, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
            id="share"
            className="relative w-full overflow-hidden bg-white py-8 md:py-12"
        >
            <div className="content-width flex justify-center items-center">
                {/* Composition Container */}
                <div className="relative w-full max-w-4xl mx-auto min-h-[400px] flex items-center justify-center">
                    
                    {/* Background Yellow Square (Right) */}
                    <div className="absolute top-1/2 right-0 w-[40%] h-[85%] bg-[#FFD700] z-0 translate-x-[10%] -translate-y-1/2" />

                    {/* Main Content Block (White with Brand Blue border) */}
                    <div 
                        className="relative z-10 bg-white border border-solid w-11/12 md:w-full pt-10 pb-5 px-6 md:px-16 text-center flex flex-col items-center"
                        style={{ borderColor: '#0057B7' }}
                    >
                        
                        {/* Section Header */}
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: 0, ease: "easeOut" }}
                            className="text-xl md:text-2xl font-bold text-slate-900 uppercase tracking-widest mb-3 font-['Inter']"
                        >
                            Share the map with your network
                        </motion.h2>
  
                        {/* Suggested Post - Pull Quote Style with Inline Copy */}
                        <motion.div 
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                            className="flex flex-col items-center relative w-full mb-3"
                        >
                            <div className="relative max-w-2xl bg-white py-2.5 px-6 md:py-3 md:px-8 rounded-none">
                                <span className="text-base md:text-[18px] italic font-medium leading-relaxed text-slate-600 tracking-[0.02em] antialiased inline">
                                    "{shareMessage}"
                                </span>
                                
                                <button 
                                    onClick={() => {
                                        handleCopy();
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className="inline-flex items-center group text-slate-400 hover:text-[#0057B7] transition-all duration-300 hover:scale-[1.05] active:scale-95 ml-4 relative"
                                    title="Copy suggested text"
                                >
                                    <Copy className="h-5 w-5" strokeWidth={2} />
                                    
                                    {copied && (
                                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-white bg-[#0057B7] px-2 py-1 shadow-md border border-white/20 animate-in fade-in duration-300">
                                            Copied
                                        </span>
                                    )}
                                </button>
                            </div>
                        </motion.div>
 
                        {/* Social Row & Call to Action */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                            className="flex flex-col items-center w-full gap-2"
                        >
                            <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-400 antialiased mb-1">
                                Post To:
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
                        </motion.div>
 
                    </div>
                </div>
            </div>
        </section>
    );
}
